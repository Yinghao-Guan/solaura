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
        // 🚀 1. 强制使用原生 SceneDepth (千万不要用 smoothed，会导致移动物体拖影)
        // ==========================================
        if ARWorldTrackingConfiguration.supportsFrameSemantics(.sceneDepth) {
            config.frameSemantics.insert(.sceneDepth)
            print("✅ LiDAR Scene Depth Enabled (Raw mode for moving objects)")
        }
        
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
        // 🚀 2. LiDAR 提取核心
        // ==========================================
        private func getLiDARDepthPoint(arView: ARView, screenPt: CGPoint) -> [Float]? {
            guard let frame = arView.session.currentFrame,
                  let depthMap = frame.sceneDepth?.depthMap else { // 强制使用实时 sceneDepth
                return nil
            }

            let viewSize = arView.bounds.size
            guard viewSize.width > 0 && viewSize.height > 0 else { return nil }

            // 1. 将 UI 坐标完美映射到 DepthMap 坐标系
            let normScreen = CGPoint(x: screenPt.x / viewSize.width, y: screenPt.y / viewSize.height)
            let invertedTransform = frame.displayTransform(for: .portrait, viewportSize: viewSize).inverted()
            let normImage = normScreen.applying(invertedTransform)

            let depthWidth = CVPixelBufferGetWidth(depthMap)
            let depthHeight = CVPixelBufferGetHeight(depthMap)
            
            let px = Int(normImage.x * CGFloat(depthWidth))
            let py = Int(normImage.y * CGFloat(depthHeight))
            
            CVPixelBufferLockBaseAddress(depthMap, .readOnly)
            defer { CVPixelBufferUnlockBaseAddress(depthMap, .readOnly) }
            
            let baseAddress = CVPixelBufferGetBaseAddress(depthMap)
            let bytesPerRow = CVPixelBufferGetBytesPerRow(depthMap)
            
            // 🚀 核心优化：5x5 前景探测面，只取最小值 (最近的物体)，绝不穿透水瓶打背景
            let windowSize = 2
            var validDepths: [Float32] = []
            
            for dy in -windowSize...windowSize {
                for dx in -windowSize...windowSize {
                    let sampleX = px + dx
                    let sampleY = py + dy
                    if sampleX >= 0 && sampleX < depthWidth && sampleY >= 0 && sampleY < depthHeight {
                        let rowData = baseAddress!.advanced(by: sampleY * bytesPerRow)
                        let depth = rowData.assumingMemoryBound(to: Float32.self)[sampleX]
                        if !depth.isNaN && depth >= 0.1 && depth <= 5.0 {
                            validDepths.append(depth)
                        }
                    }
                }
            }
            
            guard !validDepths.isEmpty else { return nil }
            let depth = validDepths.min()! // 永远取距离最近的前景(水瓶)

            // 2. 将 Z 轴深度投射回真实世界 3D 坐标
            guard let ray = arView.ray(through: screenPt) else { return nil }
            let camTransform = frame.camera.transform
            let camForward = normalize(simd_make_float3(-camTransform.columns.2.x,
                                                        -camTransform.columns.2.y,
                                                        -camTransform.columns.2.z))
            
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
                    guard let arView = self.arView, let frame = arView.session.currentFrame else { return }
                    self.seq += 1
                    let localSeq = self.seq

                    guard let centerNorm else {
                        self.sendMiss(t: t, seq: localSeq, camPos: camPos, camQuat: camQuat, conf: conf)
                        return
                    }

                    // ==========================================
                    // 🚀 3. 终极坐标系修复：手动进行 ScaleAspectFill 物理裁切计算
                    // ==========================================
                    let size = arView.bounds.size
                    
                    // 获取相机底层图像的物理宽高比 (注意横竖屏转换)
                    let imageW = CGFloat(frame.camera.imageResolution.height)
                    let imageH = CGFloat(frame.camera.imageResolution.width)
                    let imageRatio = imageW / imageH
                    let viewRatio = size.width / size.height
                    
                    var screenX: CGFloat = 0
                    var screenY: CGFloat = 0
                    
                    // Vision 默认坐标系 y 是向上的，UI 需要倒置
                    let vx = CGFloat(centerNorm.x)
                    let vy = CGFloat(1.0 - centerNorm.y)
                    
                    if viewRatio < imageRatio {
                        // 手机竖屏通常是这样：高度填满，宽度两侧被裁掉
                        screenY = vy * size.height
                        let displayedWidth = imageRatio * size.height
                        let offset = (displayedWidth - size.width) / 2.0
                        screenX = (vx * displayedWidth) - offset
                    } else {
                        // 兜底逻辑
                        screenX = vx * size.width
                        let displayedHeight = size.width / imageRatio
                        let offset = (displayedHeight - size.height) / 2.0
                        screenY = (vy * displayedHeight) - offset
                    }
                    
                    let screenPt = CGPoint(x: screenX, y: screenY)
                    // ==========================================

                    var bottlePos: [Float]? = nil
                    
                    if let lidarPos = self.getLiDARDepthPoint(arView: arView, screenPt: screenPt) {
                        bottlePos = lidarPos
                    } else {
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
                            "screen": ["u": Float(screenX), "v": Float(screenY)], "conf": Float(conf),
                            "cam": ["pos": camPos, "quat": camQuat],
                            "obj": [["name": "bottle", "pos": finalPos, "conf": Float(conf)]]
                        ]
                        DispatchQueue.global(qos: .utility).async { [sender = self.sender] in
                            sender.send(jsonObject: msg)
                        }
                    } else {
                        self.sendMiss(t: t, seq: localSeq, camPos: camPos, camQuat: camQuat, conf: conf, screen: screenPt)
                    }
                }
            }
        }

        private func sendMiss(t: TimeInterval, seq: Int, camPos: [Float], camQuat: [Float], conf: Float, screen: CGPoint? = nil) {
            var msg: [String: Any] = [
                "t": t, "seq": seq, "mode": screen == nil ? "bottle_miss" : "bottle_target",
                "conf": conf, "cam": ["pos": camPos, "quat": camQuat],
                "obj": screen == nil ? [] : [["name": "bottle", "pos": NSNull(), "conf": conf]]
            ]
            if let screen { msg["screen"] = ["u": Float(screen.x), "v": Float(screen.y)] }
            DispatchQueue.global(qos: .utility).async { [sender = self.sender] in
                sender.send(jsonObject: msg)
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
