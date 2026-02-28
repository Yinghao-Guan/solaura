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
        arView.session.run(config)

        arView.session.delegate = context.coordinator
        context.coordinator.arView = arView

        // 系统引导层：帮助建立平面（减少 miss）
        context.coordinator.installCoachingOverlay(on: arView)

        // tap（保留用于调试/兜底）
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

        // --- 发送 cam pose（30Hz） ---
        private var lastSentTs: TimeInterval = 0

        // bottle 检测频率（5Hz 足够）
        private var lastBottleTs: TimeInterval = 0
        private let bottleHz: Double = 2.0

        // 避免检测堆积：上一帧检测没回来就不发新检测
        private var detecting: Bool = false
        
        private let bottleWorkQueue = DispatchQueue(label: "bottle.work.queue", qos: .userInitiated)

        // UI
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

            // 小状态条：显示 plane 是否 ready
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

                // 轻量读取相机位姿（别做重活）
                let transform = frame.camera.transform
                let pos = transform.columns.3
                let camPos: [Float] = [pos.x, pos.y, pos.z]
                let rot = simd_quatf(transform)
                let camQuat: [Float] = [rot.vector.x, rot.vector.y, rot.vector.z, rot.vector.w]

                // --- 30Hz: 发送相机位姿（保持后台发送） ---
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

                // --- bottle 检测节流 ---
                let bottleInterval = 1.0 / bottleHz
                guard ts - lastBottleTs >= bottleInterval else { return }
                lastBottleTs = ts

                // 防堆积：上一轮没结束就直接丢
                if detecting { return }
                detecting = true

                // ✅ 关键：didUpdate 里只 retain + dispatch，别 deep copy
                let src: CVPixelBuffer = frame.capturedImage  // 强引用（ARC 管理）

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

        // MARK: - Bottle Detection (重要：不要把 capturedImage 直接交给异步)

        private func runBottleDetection(pixelBufferCopy: CVPixelBuffer, camPos: [Float], camQuat: [Float]) {
            let t = Date().timeIntervalSince1970

            detector.detectBottleCenter(pixelBuffer: pixelBufferCopy) { [weak self] centerNorm, conf in
                guard let self else { return }

                // 注意：detectBottleCenter 的 completion 在后台队列回来
                // 我们在这里就先放开 detecting（不等主线程 raycast）
                self.detecting = false

                DispatchQueue.main.async {
                    guard let arView = self.arView else { return }

                    self.seq += 1
                    let localSeq = self.seq

                    // 没检测到：miss
                    guard let centerNorm else {
                        let msg: [String: Any] = [
                            "t": t,
                            "seq": localSeq,
                            "mode": "bottle_miss",
                            "conf": Float(conf),
                            "cam": ["pos": camPos, "quat": camQuat],
                            "obj": []
                        ]
                        DispatchQueue.global(qos: .utility).async { [sender = self.sender] in
                            sender.send(jsonObject: msg)
                        }
                        return
                    }

                    // normalized -> screen
                    let size = arView.bounds.size
                    let u = centerNorm.x * size.width
                    let v = (1.0 - centerNorm.y) * size.height
                    let screenPt = CGPoint(x: u, y: v)

                    // raycast
                    var results = arView.raycast(from: screenPt, allowing: .existingPlaneInfinite, alignment: .horizontal)
                    if results.isEmpty {
                        results = arView.raycast(from: screenPt, allowing: .estimatedPlane, alignment: .any)
                    }

                    guard let hit = results.first else {
                        if let hit = results.first {
                            let wt = hit.worldTransform
                            let p = wt.columns.3
                            let bottlePos: [Float] = [p.x, p.y, p.z]

                            let msg: [String: Any] = [
                                "t": t,
                                "seq": localSeq,
                                "mode": "bottle_target",
                                "screen": ["u": Float(u), "v": Float(v)],
                                "conf": Float(conf),
                                "cam": ["pos": camPos, "quat": camQuat],
                                "obj": [
                                    ["name": "bottle", "pos": bottlePos, "conf": Float(conf)]
                                ]
                            ]

                            DispatchQueue.global(qos: .utility).async { [sender = self.sender] in
                                sender.send(jsonObject: msg)
                            }
                        } else {
                            // ✅ raycast miss 也发 bottle_target，但不带 pos（pos: null）
                            let msg: [String: Any] = [
                                "t": t,
                                "seq": localSeq,
                                "mode": "bottle_target",
                                "screen": ["u": Float(u), "v": Float(v)],
                                "conf": Float(conf),
                                "cam": ["pos": camPos, "quat": camQuat],
                                "obj": [
                                    ["name": "bottle", "pos": NSNull(), "conf": Float(conf)]
                                ]
                            ]

                            DispatchQueue.global(qos: .utility).async { [sender = self.sender] in
                                sender.send(jsonObject: msg)
                            }
                        }
                        return
                    }

                    let wt = hit.worldTransform
                    let p = wt.columns.3
                    let bottlePos: [Float] = [p.x, p.y, p.z]

                    let msg: [String: Any] = [
                        "t": t,
                        "seq": localSeq,
                        "mode": "bottle_target",
                        "screen": ["u": Float(u), "v": Float(v)],
                        "conf": Float(conf),
                        "cam": ["pos": camPos, "quat": camQuat],
                        "obj": [
                            ["name": "bottle", "pos": bottlePos, "conf": Float(conf)]
                        ]
                    ]

                    DispatchQueue.global(qos: .utility).async { [sender = self.sender] in
                        sender.send(jsonObject: msg)
                    }
                }
            }
        }

        // MARK: - CVPixelBuffer Deep Copy (BiPlanar 420f)

        private func copyPixelBuffer(_ src: CVPixelBuffer) -> CVPixelBuffer? {
            let width = CVPixelBufferGetWidth(src)
            let height = CVPixelBufferGetHeight(src)
            let pixelFormat = CVPixelBufferGetPixelFormatType(src)

            // 常见：kCVPixelFormatType_420YpCbCr8BiPlanarFullRange
            var dst: CVPixelBuffer?
            let attrs: [CFString: Any] = [
                kCVPixelBufferIOSurfacePropertiesKey: [:]  // 关键：可跨线程/更稳定
            ]
            let status = CVPixelBufferCreate(kCFAllocatorDefault,
                                            width,
                                            height,
                                            pixelFormat,
                                            attrs as CFDictionary,
                                            &dst)
            guard status == kCVReturnSuccess, let dst else { return nil }

            CVPixelBufferLockBaseAddress(src, .readOnly)
            CVPixelBufferLockBaseAddress(dst, [])

            defer {
                CVPixelBufferUnlockBaseAddress(dst, [])
                CVPixelBufferUnlockBaseAddress(src, .readOnly)
            }

            let planeCount = CVPixelBufferGetPlaneCount(src)

            if planeCount == 0 {
                // 非 planar
                guard let srcBase = CVPixelBufferGetBaseAddress(src),
                      let dstBase = CVPixelBufferGetBaseAddress(dst) else { return nil }
                let bytesPerRow = CVPixelBufferGetBytesPerRow(src)
                memcpy(dstBase, srcBase, bytesPerRow * height)
                return dst
            }

            // planar（典型 2-plane：Y + UV）
            for i in 0..<planeCount {
                guard let srcBase = CVPixelBufferGetBaseAddressOfPlane(src, i),
                      let dstBase = CVPixelBufferGetBaseAddressOfPlane(dst, i) else { return nil }
                let srcBytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(src, i)
                let dstBytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(dst, i)

                let planeHeight = CVPixelBufferGetHeightOfPlane(src, i)
                let copyBytesPerRow = min(srcBytesPerRow, dstBytesPerRow)

                for row in 0..<planeHeight {
                    let srcRow = srcBase.advanced(by: row * srcBytesPerRow)
                    let dstRow = dstBase.advanced(by: row * dstBytesPerRow)
                    memcpy(dstRow, srcRow, copyBytesPerRow)
                }
            }

            return dst
        }

        // MARK: - Tap (调试/兜底)

        @objc func handleTap(_ gr: UITapGestureRecognizer) {
            guard let arView = arView else { return }
            let loc = gr.location(in: arView)

            print("tap")

            var results = arView.raycast(from: loc, allowing: .existingPlaneInfinite, alignment: .horizontal)
            if results.isEmpty {
                results = arView.raycast(from: loc, allowing: .estimatedPlane, alignment: .any)
            }

            if results.isEmpty {
                let t = Date().timeIntervalSince1970
                seq += 1
                let msg: [String: Any] = [
                    "t": t,
                    "seq": seq,
                    "mode": "tap_miss",
                    "screen": ["u": Float(loc.x), "v": Float(loc.y)]
                ]
                sender.send(jsonObject: msg)
                print("tap_miss")
                return
            }

            let hit = results[0]
            let worldT = hit.worldTransform
            let p = worldT.columns.3
            let targetPos: [Float] = [p.x, p.y, p.z]

            var camPos: [Float] = [0, 0, 0]
            var camQuat: [Float] = [0, 0, 0, 1]
            if let frame = arView.session.currentFrame {
                let camT = frame.camera.transform
                let cp = camT.columns.3
                camPos = [cp.x, cp.y, cp.z]
                let rot = simd_quatf(camT)
                camQuat = [rot.vector.x, rot.vector.y, rot.vector.z, rot.vector.w]
            }

            let t = Date().timeIntervalSince1970
            seq += 1

            let msg: [String: Any] = [
                "t": t,
                "seq": seq,
                "cam": ["pos": camPos, "quat": camQuat],
                "mode": "tap_target",
                "obj": [
                    ["name": "target", "pos": targetPos, "conf": 1.0]
                ]
            ]
            sender.send(jsonObject: msg)
        }
    }
}
