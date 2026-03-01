import SwiftUI
import RealityKit
import ARKit
import AVFoundation
import CoreVideo
import Vision

struct ARViewContainer: UIViewRepresentable {

    func makeUIView(context: Context) -> ARView {
        AVCaptureDevice.requestAccess(for: .video) { granted in
            print("Camera permission:", granted)
        }

        let arView = ARView(frame: .zero)
        let config = ARWorldTrackingConfiguration()
        config.planeDetection = [.horizontal]
        
        // 开启原生的 SceneDepth 和网格重建
        if ARWorldTrackingConfiguration.supportsFrameSemantics(.sceneDepth) {
            config.frameSemantics.insert(.sceneDepth)
            print("✅ LiDAR Scene Depth Enabled (Raw mode)")
        }
        
        if ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh) {
            config.sceneReconstruction = .mesh
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
        
        // 独立双轨频率
        private let bottleHz: Double = 2.5
        private let handHz: Double = 15.0
        private var lastBottleTs: TimeInterval = 0
        private var lastHandTs: TimeInterval = 0
        
        private var detectingBottle: Bool = false
        private var detectingHand: Bool = false
        
        private let bottleQueue = DispatchQueue(label: "bottle.queue", qos: .userInitiated)
        private let handQueue = DispatchQueue(label: "hand.queue", qos: .userInteractive)

        private lazy var handReq: VNDetectHumanHandPoseRequest = {
            let req = VNDetectHumanHandPoseRequest()
            req.maximumHandCount = 1
            return req
        }()

        private var coaching: ARCoachingOverlayView?
        private var statusLabel: UILabel?

        // 拦截 NaN 数据
        private func isSafe(_ array: [Float]) -> Bool {
            return !array.contains { $0.isNaN || $0.isInfinite }
        }
        
        private func sendData(_ msg: [String: Any]) {
            DispatchQueue.global(qos: .utility).async { [weak sender = self.sender] in
                sender?.send(jsonObject: msg)
            }
        }

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

        func session(_ session: ARSession, didUpdate frame: ARFrame) {
            autoreleasepool {
                let ts = frame.timestamp
                let transform = frame.camera.transform
                let camPos: [Float] = [transform.columns.3.x, transform.columns.3.y, transform.columns.3.z]
                let rot = simd_quatf(transform)
                let camQuat: [Float] = [rot.vector.x, rot.vector.y, rot.vector.z, rot.vector.w]

                guard isSafe(camPos) && isSafe(camQuat) else { return }

                if ts - lastSentTs >= (1.0 / 30.0) {
                    lastSentTs = ts
                    seq += 1
                    let msg: [String: Any] = [
                        "t": Date().timeIntervalSince1970, "seq": seq, "mode": "pose",
                        "cam": ["pos": camPos, "quat": camQuat], "obj": []
                    ]
                    sendData(msg)
                }

                let runBottle = (ts - lastBottleTs >= 1.0 / bottleHz) && !detectingBottle
                let runHand = (ts - lastHandTs >= 1.0 / handHz) && !detectingHand

                if !runBottle && !runHand { return }

                let src: CVPixelBuffer = frame.capturedImage

                if runBottle {
                    if let pixelCopy = self.copyPixelBuffer(src) {
                        detectingBottle = true
                        lastBottleTs = ts
                        bottleQueue.async { [weak self] in
                            self?.runBottleDetection(pixelBuffer: pixelCopy, camPos: camPos, camQuat: camQuat, t: ts)
                        }
                    }
                }

                if runHand {
                    if let pixelCopy = self.copyPixelBuffer(src) {
                        detectingHand = true
                        lastHandTs = ts
                        handQueue.async { [weak self] in
                            self?.runHandDetection(pixelBuffer: pixelCopy, camPos: camPos, camQuat: camQuat, t: ts)
                        }
                    }
                }
            }
        }

        private func get3DWorldPosition(from visionNorm: CGPoint, arView: ARView, frame: ARFrame, isHand: Bool) -> [Float]? {
            let size = arView.bounds.size
            let imageW = CGFloat(frame.camera.imageResolution.height)
            let imageH = CGFloat(frame.camera.imageResolution.width)
            let imageRatio = imageW / imageH
            let viewRatio = size.width / size.height
            
            var screenX: CGFloat = 0
            var screenY: CGFloat = 0
            
            let vx = CGFloat(visionNorm.x)
            let vy = CGFloat(1.0 - visionNorm.y)
            
            if viewRatio < imageRatio {
                screenY = vy * size.height
                let displayedWidth = imageRatio * size.height
                let offset = (displayedWidth - size.width) / 2.0
                screenX = (vx * displayedWidth) - offset
            } else {
                screenX = vx * size.width
                let displayedHeight = size.width / imageRatio
                let offset = (displayedHeight - size.height) / 2.0
                screenY = (vy * displayedHeight) - offset
            }
            
            let screenPt = CGPoint(x: screenX, y: screenY)
            
            if let lidarPos = self.getLiDARDepthPoint(arView: arView, screenPt: screenPt, isHand: isHand) {
                return lidarPos
            } else {
                var results = arView.raycast(from: screenPt, allowing: .existingPlaneInfinite, alignment: .horizontal)
                if results.isEmpty {
                    results = arView.raycast(from: screenPt, allowing: .estimatedPlane, alignment: .any)
                }
                if let hit = results.first {
                    let p = hit.worldTransform.columns.3
                    return [p.x, p.y, p.z]
                }
            }
            return nil
        }

        private func getLiDARDepthPoint(arView: ARView, screenPt: CGPoint, isHand: Bool) -> [Float]? {
            guard let frame = arView.session.currentFrame,
                  let depthMap = frame.sceneDepth?.depthMap else { return nil }

            let viewSize = arView.bounds.size
            guard viewSize.width > 0 && viewSize.height > 0 else { return nil }

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
            
            // 巨型防穿透探测网：手部 11x11，水瓶 5x5
            let windowSize = isHand ? 5 : 2
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
            let depth = validDepths.min()!

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

        private func runBottleDetection(pixelBuffer: CVPixelBuffer, camPos: [Float], camQuat: [Float], t: TimeInterval) {
            detector.detectBottleCenter(pixelBuffer: pixelBuffer) { [weak self] bottleCenterNorm, conf in
                guard let self else { return }
                self.detectingBottle = false

                DispatchQueue.main.async {
                    guard let arView = self.arView, let frame = arView.session.currentFrame else { return }
                    self.seq += 1
                    let localSeq = self.seq

                    if let bottleNorm = bottleCenterNorm,
                       let bottlePos = self.get3DWorldPosition(from: bottleNorm, arView: arView, frame: frame, isHand: false),
                       self.isSafe(bottlePos) {
                        
                        let msg: [String: Any] = [
                            "t": t, "seq": localSeq, "mode": "bottle_target",
                            "conf": Float(conf), "cam": ["pos": camPos, "quat": camQuat],
                            "obj": [["name": "bottle", "pos": bottlePos, "conf": Float(conf)]]
                        ]
                        self.sendData(msg)
                    } else {
                        let msg: [String: Any] = [
                            "t": t, "seq": localSeq, "mode": "bottle_miss",
                            "conf": Float(conf), "cam": ["pos": camPos, "quat": camQuat],
                            "obj": []
                        ]
                        self.sendData(msg)
                    }
                }
            }
        }

        private func runHandDetection(pixelBuffer: CVPixelBuffer, camPos: [Float], camQuat: [Float], t: TimeInterval) {
            var handCenterNorm: CGPoint? = nil
            // 修复：使用 .right 匹配竖屏物理坐标系
            let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .right, options: [:])
            do {
                try handler.perform([handReq])
                if let observation = handReq.results?.first,
                   let joint = try? observation.recognizedPoint(.middleMCP),
                   joint.confidence > 0.4 {
                    handCenterNorm = CGPoint(x: joint.location.x, y: joint.location.y)
                }
            } catch {
                print("Hand tracking failed: \(error)")
            }

            self.detectingHand = false

            DispatchQueue.main.async { [weak self] in
                guard let self = self, let arView = self.arView, let frame = arView.session.currentFrame else { return }
                self.seq += 1
                let localSeq = self.seq

                if let handNorm = handCenterNorm,
                   let handPos = self.get3DWorldPosition(from: handNorm, arView: arView, frame: frame, isHand: true),
                   self.isSafe(handPos) {
                    
                    let msg: [String: Any] = [
                        "t": t, "seq": localSeq, "mode": "target",
                        "cam": ["pos": camPos, "quat": camQuat],
                        "obj": [["name": "hand", "pos": handPos, "conf": 1.0]]
                    ]
                    self.sendData(msg)
                }
            }
        }

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

        @objc func handleTap(_ gr: UITapGestureRecognizer) {
            guard let arView = arView else { return }
            let loc = gr.location(in: arView)
            
            var targetPos: [Float]? = nil
            
            if let lidarPos = getLiDARDepthPoint(arView: arView, screenPt: loc, isHand: false) {
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

            if let finalPos = targetPos, isSafe(finalPos) {
                var camPos: [Float] = [0, 0, 0]
                var camQuat: [Float] = [0, 0, 0, 1]
                if let frame = arView.session.currentFrame {
                    let camT = frame.camera.transform
                    camPos = [camT.columns.3.x, camT.columns.3.y, camT.columns.3.z]
                    let rot = simd_quatf(camT)
                    camQuat = [rot.vector.x, rot.vector.y, rot.vector.z, rot.vector.w]
                }
                
                guard isSafe(camPos) && isSafe(camQuat) else { return }
                
                let msg: [String: Any] = [
                    "t": t, "seq": seq, "cam": ["pos": camPos, "quat": camQuat],
                    "mode": "tap_target", "obj": [["name": "target", "pos": finalPos, "conf": 1.0]]
                ]
                sendData(msg)
            } else {
                let msg: [String: Any] = [
                    "t": t, "seq": seq, "mode": "tap_miss",
                    "screen": ["u": Float(loc.x), "v": Float(loc.y)]
                ]
                sendData(msg)
            }
        }
    }
}
