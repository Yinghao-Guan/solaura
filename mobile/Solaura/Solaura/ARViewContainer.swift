import SwiftUI
import RealityKit
import ARKit
import AVFoundation
import CoreVideo

struct ARViewContainer: UIViewRepresentable {

    func makeUIView(context: Context) -> ARView {
        AVCaptureDevice.requestAccess(for: .video) { granted in
            print("Camera permission:", granted)
        }

        let arView = ARView(frame: .zero)

        let config = ARWorldTrackingConfiguration()
        config.planeDetection = [.horizontal]
        
        // ==========================================
        // 🚀 1. 开启 LiDAR 深度图和场景重建支持
        // ==========================================
        if ARWorldTrackingConfiguration.supportsFrameSemantics(.sceneDepth) {
            // 优先使用平滑深度（滤除噪点，对单点采样更准确），不支持则用基础深度
            if ARWorldTrackingConfiguration.supportsFrameSemantics(.smoothedSceneDepth) {
                config.frameSemantics.insert(.smoothedSceneDepth)
                print("✅ LiDAR Smoothed Scene Depth Enabled")
            } else {
                config.frameSemantics.insert(.sceneDepth)
                print("✅ LiDAR Scene Depth Enabled")
            }
        }
        
        // 开启环境网格重建，这会让底层的 raycast 也具备非平面碰撞能力
        if ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh) {
            config.sceneReconstruction = .mesh
            print("✅ LiDAR Scene Mesh Reconstruction Enabled")
        }
        
        arView.session.run(config)

        arView.session.delegate = context.coordinator
        context.coordinator.arView = arView

        context.coordinator.installCoachingOverlay(on: arView)

        let tap = UITapGestureRecognizer(target: context.coordinator, action: #selector(Coordinator.handleTap(_:)))
        arView.addGestureRecognizer(tap)

        return arView
    }

    func updateUIView(_ uiView: ARView, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator() }

    final class Coordinator: NSObject, ARSessionDelegate, ARCoachingOverlayViewDelegate {
        weak var arView: ARView?

        private let sender = UdpSender.shared
        private let detector = BottleDetector()

        private var seq: Int = 0
        private var lastSentTs: TimeInterval = 0
        private var lastBottleTs: TimeInterval = 0
        private let bottleHz: Double = 2.0
        private var detecting: Bool = false
        private let bottleWorkQueue = DispatchQueue(label: "bottle.work.queue", qos: .userInitiated)

        private var coaching: ARCoachingOverlayView?
        private var statusLabel: UILabel?

        // MARK: - Coaching Overlay
        func installCoachingOverlay(on arView: ARView) {
            let coaching = ARCoachingOverlayView()
            coaching.session = arView.session
            coaching.delegate = self
            coaching.goal = .horizontalPlane
            coaching.activatesAutomatically = true
            coaching.translatesAutoresizingMaskIntoConstraints = false
            arView.addSubview(coaching)
            NSLayoutConstraint.activate([
                coaching.topAnchor.constraint(equalTo: arView.topAnchor),
                coaching.bottomAnchor.constraint(equalTo: arView.bottomAnchor),
                coaching.leadingAnchor.constraint(equalTo: arView.leadingAnchor),
                coaching.trailingAnchor.constraint(equalTo: arView.trailingAnchor),
            ])
            self.coaching = coaching

            let label = UILabel()
            label.text = "Plane: not ready (move phone)"
            label.textColor = .white
            label.backgroundColor = UIColor.black.withAlphaComponent(0.45)
            label.layer.cornerRadius = 10
            label.clipsToBounds = true
            label.font = UIFont.systemFont(ofSize: 14, weight: .semibold)
            label.translatesAutoresizingMaskIntoConstraints = false
            label.textAlignment = .center

            arView.addSubview(label)
            NSLayoutConstraint.activate([
                label.topAnchor.constraint(equalTo: arView.safeAreaLayoutGuide.topAnchor, constant: 12),
                label.centerXAnchor.constraint(equalTo: arView.centerXAnchor),
                label.widthAnchor.constraint(greaterThanOrEqualToConstant: 260),
                label.heightAnchor.constraint(equalToConstant: 34),
            ])
            self.statusLabel = label
        }

        func coachingOverlayViewWillActivate(_ coachingOverlayView: ARCoachingOverlayView) {
            statusLabel?.text = "Plane: not ready (move phone)"
        }

        func coachingOverlayViewDidDeactivate(_ coachingOverlayView: ARCoachingOverlayView) {
            statusLabel?.text = "Plane: OK ✅"
        }

        // MARK: - ARSessionDelegate
        func session(_ session: ARSession, didUpdate frame: ARFrame) {
            autoreleasepool {
                let ts = frame.timestamp
                let transform = frame.camera.transform
                let pos = transform.columns.3
                let camPos: [Float] = [pos.x, pos.y, pos.z]
                let rot = simd_quatf(transform)
                let camQuat: [Float] = [rot.vector.x, rot.vector.y, rot.vector.z, rot.vector.w]

                if ts - lastSentTs >= (1.0 / 30.0) {
                    lastSentTs = ts
                    seq += 1
                    let msg: [String: Any] = [
                        "t": Date().timeIntervalSince1970,
                        "seq": seq,
                        "mode": "pose",
                        "cam": ["pos": camPos, "quat": camQuat],
                        "obj": []
                    ]
                    DispatchQueue.global(qos: .utility).async { [sender] in
                        sender.send(jsonObject: msg)
                    }
                }

                let bottleInterval = 1.0 / bottleHz
                guard ts - lastBottleTs >= bottleInterval else { return }
                lastBottleTs = ts

                if detecting { return }
                detecting = true

                let src: CVPixelBuffer = frame.capturedImage

                bottleWorkQueue.async { [weak self, src] in
                    guard let self else { return }
                    guard let pixelCopy = self.copyPixelBuffer(src) else {
                        self.detecting = false
                        return
                    }
                    self.runBottleDetection(pixelBufferCopy: pixelCopy, camPos: camPos, camQuat: camQuat)
                }
            }
        }

        // ==========================================
        // 🚀 2. LiDAR 提取核心：从深度图中反投影 3D 点
        // ==========================================
        private func getLiDARDepthPoint(arView: ARView, screenPt: CGPoint) -> [Float]? {
            guard let frame = arView.session.currentFrame,
                  let depthMap = frame.smoothedSceneDepth?.depthMap ?? frame.sceneDepth?.depthMap else {
                return nil
            }

            let viewSize = arView.bounds.size
            guard viewSize.width > 0 && viewSize.height > 0 else { return nil }

            // 1. 利用 displayTransform 将屏幕 UI 坐标准确映射回原始图像域
            let scaleTransform = frame.displayTransform(for: .portrait, viewportSize: viewSize)
            let invertedTransform = scaleTransform.inverted()
            
            let normScreen = CGPoint(x: screenPt.x / viewSize.width, y: screenPt.y / viewSize.height)
            let normImage = normScreen.applying(invertedTransform) // 范围 0~1

            let depthWidth = CVPixelBufferGetWidth(depthMap)
            let depthHeight = CVPixelBufferGetHeight(depthMap)
            
            let px = Int(normImage.x * CGFloat(depthWidth))
            let py = Int(normImage.y * CGFloat(depthHeight))
            
            if px < 0 || px >= depthWidth || py < 0 || py >= depthHeight { return nil }
            
            // 2. 锁定内存，读取特定像素的 Float32 深度值（单位：米）
            CVPixelBufferLockBaseAddress(depthMap, .readOnly)
            defer { CVPixelBufferUnlockBaseAddress(depthMap, .readOnly) }
            
            let baseAddress = CVPixelBufferGetBaseAddress(depthMap)
            let rowData = baseAddress!.advanced(by: py * CVPixelBufferGetBytesPerRow(depthMap))
            let depth = rowData.assumingMemoryBound(to: Float32.self)[px]
            
            // 过滤无效或极端的深度值 (LiDAR 极限大约是 5 米)
            if depth.isNaN || depth < 0.1 || depth > 5.0 {
                return nil
            }

            // 3. 将相机 Z 轴深度转换为世界空间坐标
            guard let ray = arView.ray(through: screenPt) else { return nil }
            
            let camTransform = frame.camera.transform
            // ARKit 中相机的 -Z 轴指向前方
            let camForward = normalize(simd_make_float3(-camTransform.columns.2.x,
                                                        -camTransform.columns.2.y,
                                                        -camTransform.columns.2.z))
            
            // 利用射线与相机前向的夹角余弦，补偿真实射线长度
            let cosTheta = dot(ray.direction, camForward)
            guard cosTheta > 0 else { return nil }
            
            let actualDistance = depth / cosTheta
            let worldPos = ray.origin + ray.direction * actualDistance
            
            return [worldPos.x, worldPos.y, worldPos.z]
        }

        // MARK: - Bottle Detection
        private func runBottleDetection(pixelBufferCopy: CVPixelBuffer, camPos: [Float], camQuat: [Float]) {
            let t = Date().timeIntervalSince1970

            detector.detectBottleCenter(pixelBuffer: pixelBufferCopy) { [weak self] centerNorm, conf in
                guard let self else { return }
                self.detecting = false

                DispatchQueue.main.async {
                    guard let arView = self.arView else { return }
                    self.seq += 1
                    let localSeq = self.seq

                    guard let centerNorm else {
                        let msg: [String: Any] = [
                            "t": t, "seq": localSeq, "mode": "bottle_miss",
                            "conf": Float(conf), "cam": ["pos": camPos, "quat": camQuat], "obj": []
                        ]
                        DispatchQueue.global(qos: .utility).async { [sender = self.sender] in
                            sender.send(jsonObject: msg)
                        }
                        return
                    }

                    let size = arView.bounds.size
                    let u = centerNorm.x * size.width
                    let v = (1.0 - centerNorm.y) * size.height
                    let screenPt = CGPoint(x: u, y: v)

                    // ==========================================
                    // 🚀 3. 优先级策略：LiDAR 真实深度 -> ARKit 估算平面
                    // ==========================================
                    var bottlePos: [Float]? = nil
                    
                    if let lidarPos = self.getLiDARDepthPoint(arView: arView, screenPt: screenPt) {
                        bottlePos = lidarPos
                    } else {
                        // 降级使用传统的估算平面 Raycast
                        var results = arView.raycast(from: screenPt, allowing: .existingPlaneInfinite, alignment: .horizontal)
                        if results.isEmpty {
                            results = arView.raycast(from: screenPt, allowing: .estimatedPlane, alignment: .any)
                        }
                        if let hit = results.first {
                            let p = hit.worldTransform.columns.3
                            bottlePos = [p.x, p.y, p.z]
                        }
                    }

                    if let finalPos = bottlePos {
                        let msg: [String: Any] = [
                            "t": t, "seq": localSeq, "mode": "bottle_target",
                            "screen": ["u": Float(u), "v": Float(v)], "conf": Float(conf),
                            "cam": ["pos": camPos, "quat": camQuat],
                            "obj": [["name": "bottle", "pos": finalPos, "conf": Float(conf)]]
                        ]
                        DispatchQueue.global(qos: .utility).async { [sender = self.sender] in
                            sender.send(jsonObject: msg)
                        }
                    } else {
                        // 都失败时发送位置为 null 的包
                        let msg: [String: Any] = [
                            "t": t, "seq": localSeq, "mode": "bottle_target",
                            "screen": ["u": Float(u), "v": Float(v)], "conf": Float(conf),
                            "cam": ["pos": camPos, "quat": camQuat],
                            "obj": [["name": "bottle", "pos": NSNull(), "conf": Float(conf)]]
                        ]
                        DispatchQueue.global(qos: .utility).async { [sender = self.sender] in
                            sender.send(jsonObject: msg)
                        }
                    }
                }
            }
        }

        // MARK: - CVPixelBuffer Deep Copy
        private func copyPixelBuffer(_ src: CVPixelBuffer) -> CVPixelBuffer? {
            let width = CVPixelBufferGetWidth(src)
            let height = CVPixelBufferGetHeight(src)
            let pixelFormat = CVPixelBufferGetPixelFormatType(src)

            var dst: CVPixelBuffer?
            let attrs: [CFString: Any] = [kCVPixelBufferIOSurfacePropertiesKey: [:]]
            let status = CVPixelBufferCreate(kCFAllocatorDefault, width, height, pixelFormat, attrs as CFDictionary, &dst)
            guard status == kCVReturnSuccess, let dst else { return nil }

            CVPixelBufferLockBaseAddress(src, .readOnly)
            CVPixelBufferLockBaseAddress(dst, [])
            defer {
                CVPixelBufferUnlockBaseAddress(dst, [])
                CVPixelBufferUnlockBaseAddress(src, .readOnly)
            }

            let planeCount = CVPixelBufferGetPlaneCount(src)
            if planeCount == 0 {
                guard let srcBase = CVPixelBufferGetBaseAddress(src),
                      let dstBase = CVPixelBufferGetBaseAddress(dst) else { return nil }
                memcpy(dstBase, srcBase, CVPixelBufferGetBytesPerRow(src) * height)
                return dst
            }

            for i in 0..<planeCount {
                guard let srcBase = CVPixelBufferGetBaseAddressOfPlane(src, i),
                      let dstBase = CVPixelBufferGetBaseAddressOfPlane(dst, i) else { return nil }
                let srcBytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(src, i)
                let dstBytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(dst, i)
                let planeHeight = CVPixelBufferGetHeightOfPlane(src, i)
                for row in 0..<planeHeight {
                    memcpy(dstBase.advanced(by: row * dstBytesPerRow), srcBase.advanced(by: row * srcBytesPerRow), min(srcBytesPerRow, dstBytesPerRow))
                }
            }
            return dst
        }

        // MARK: - Tap
        @objc func handleTap(_ gr: UITapGestureRecognizer) {
            guard let arView = arView else { return }
            let loc = gr.location(in: arView)
            
            var targetPos: [Float]? = nil
            
            // 同样也为手动点击加入 LiDAR 支持
            if let lidarPos = getLiDARDepthPoint(arView: arView, screenPt: loc) {
                targetPos = lidarPos
            } else {
                var results = arView.raycast(from: loc, allowing: .existingPlaneInfinite, alignment: .horizontal)
                if results.isEmpty {
                    results = arView.raycast(from: loc, allowing: .estimatedPlane, alignment: .any)
                }
                if let hit = results.first {
                    let p = hit.worldTransform.columns.3
                    targetPos = [p.x, p.y, p.z]
                }
            }

            let t = Date().timeIntervalSince1970
            seq += 1

            if let finalPos = targetPos {
                var camPos: [Float] = [0, 0, 0]
                var camQuat: [Float] = [0, 0, 0, 1]
                if let frame = arView.session.currentFrame {
                    let camT = frame.camera.transform
                    camPos = [camT.columns.3.x, camT.columns.3.y, camT.columns.3.z]
                    let rot = simd_quatf(camT)
                    camQuat = [rot.vector.x, rot.vector.y, rot.vector.z, rot.vector.w]
                }
                
                let msg: [String: Any] = [
                    "t": t, "seq": seq, "cam": ["pos": camPos, "quat": camQuat],
                    "mode": "tap_target", "obj": [["name": "target", "pos": finalPos, "conf": 1.0]]
                ]
                sender.send(jsonObject: msg)
            } else {
                let msg: [String: Any] = [
                    "t": t, "seq": seq, "mode": "tap_miss",
                    "screen": ["u": Float(loc.x), "v": Float(loc.y)]
                ]
                sender.send(jsonObject: msg)
            }
        }
    }
}
