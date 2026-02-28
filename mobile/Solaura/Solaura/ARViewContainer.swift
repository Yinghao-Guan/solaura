import SwiftUI
import RealityKit
import ARKit
import AVFoundation

struct ARViewContainer: UIViewRepresentable {

func makeUIView(context: Context) -> ARView {
        AVCaptureDevice.requestAccess(for: .video) { granted in
            print("Camera permission:", granted)
        }

let arView = ARView(frame: .zero)

let config = ARWorldTrackingConfiguration()
        config.planeDetection = [.horizontal]   // 先开着，后面 M1 raycast 用
        config.planeDetection = [.horizontal]
arView.session.run(config)

arView.session.delegate = context.coordinator
        context.coordinator.arView = arView

        // 30Hz 发送相机位姿
        context.coordinator.startStreaming()
        // 系统引导层：帮助用户建立平面（大幅减少 tap_miss）
        context.coordinator.installCoachingOverlay(on: arView)

        // 给后面 M1 用：在 ARView 上加 tap 手势（先放着不影响）
        // tap
let tap = UITapGestureRecognizer(target: context.coordinator, action: #selector(Coordinator.handleTap(_:)))
arView.addGestureRecognizer(tap)

        context.coordinator.arView = arView
return arView
}

func updateUIView(_ uiView: ARView, context: Context) {}

func makeCoordinator() -> Coordinator { Coordinator() }

    final class Coordinator: NSObject, ARSessionDelegate {
    final class Coordinator: NSObject, ARSessionDelegate, ARCoachingOverlayViewDelegate {
weak var arView: ARView?

        private let sender = UdpSender.shared
private var seq: Int = 0
        private var timer: Timer?
        private var lastSent: TimeInterval = 0

        private var coaching: ARCoachingOverlayView?
        private var statusLabel: UILabel?

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

            // 小状态条：显示 plane 是否 ready（帮助理解 tap_miss）
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
                label.widthAnchor.constraint(greaterThanOrEqualToConstant: 220),
                label.heightAnchor.constraint(equalToConstant: 34),
            ])
            self.statusLabel = label
        }

        func startStreaming() {
            timer?.invalidate()
            timer = Timer.scheduledTimer(withTimeInterval: 1.0/30.0, repeats: true) { [weak self] _ in
                self?.sendCameraPose()
            }
        // coaching 状态
        func coachingOverlayViewWillActivate(_ coachingOverlayView: ARCoachingOverlayView) {
            statusLabel?.text = "Plane: not ready (move phone)"
}

        func sendCameraPose() {
            guard let frame = arView?.session.currentFrame else { return }
        func coachingOverlayViewDidDeactivate(_ coachingOverlayView: ARCoachingOverlayView) {
            statusLabel?.text = "Plane: OK ✅"
        }

        // 每帧：限频 30Hz 发相机位姿
        func session(_ session: ARSession, didUpdate frame: ARFrame) {
let t = Date().timeIntervalSince1970
            seq += 1
            if t - lastSent < (1.0 / 30.0) { return }
            lastSent = t

            let transform = frame.camera.transform  // simd_float4x4
            seq += 1
            let transform = frame.camera.transform

            // 相机位置（世界坐标，单位米）
let pos = transform.columns.3
let camPos: [Float] = [pos.x, pos.y, pos.z]

            // 相机朝向四元数（世界坐标）
let rot = simd_quatf(transform)
let camQuat: [Float] = [rot.vector.x, rot.vector.y, rot.vector.z, rot.vector.w] // [x,y,z,w]

@@ -62,37 +111,53 @@ struct ARViewContainer: UIViewRepresentable {
"cam": ["pos": camPos, "quat": camQuat],
"obj": []
]

            UdpSender.shared.send(jsonObject: msg)
            sender.send(jsonObject: msg)
}

        // M1 预留：tap → raycast → 发 target 3D 点
@objc func handleTap(_ gr: UITapGestureRecognizer) {
guard let arView = arView else { return }
let loc = gr.location(in: arView)

            // 先优先命中已有平面/几何（桌面）
            let results = arView.raycast(from: loc, allowing: .estimatedPlane, alignment: .horizontal)
            guard let hit = results.first else { return }
            print("tap")

            let t = Date().timeIntervalSince1970
            seq += 1
            // 多级 raycast：先稳，再宽松
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

            // 同时把当前相机也带上，Mac 端方便直接算相对向量
            let camT = arView.session.currentFrame?.camera.transform
            var camPos: [Float] = [0,0,0]
            var camQuat: [Float] = [0,0,0,1]
            if let camT = camT {
            // 同时发当前相机
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
@@ -102,8 +167,7 @@ struct ARViewContainer: UIViewRepresentable {
["name": "target", "pos": targetPos, "conf": 1.0]
]
]

            UdpSender.shared.send(jsonObject: msg)
            sender.send(jsonObject: msg)
}
}
}
