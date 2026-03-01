import Foundation
import Vision
import CoreML
import UIKit

final class BottleDetector {
    private let queue = DispatchQueue(label: "bottle.detector.queue")
    
    private let debugPrints = true

    private var pending: ((_ centerNorm: CGPoint?, _ conf: Float) -> Void)?
    private lazy var request: VNCoreMLRequest? = {
        do {
            let config = MLModelConfiguration()
            let coreMLModel = try yolov8n_nms(configuration: config).model   // 用自动生成类加载
            let vnModel = try VNCoreMLModel(for: coreMLModel)

            let req = VNCoreMLRequest(model: vnModel) { [weak self] req, err in
                guard let self else { return }
                let completion = self.pending
                self.pending = nil

                if let err {
                    if self.debugPrints { print("Vision err:", err) }
                    completion?(nil, 0)
                    return
                }

                let obs = (req.results as? [VNRecognizedObjectObservation]) ?? []
                if obs.isEmpty {
                    completion?(nil, 0)
                    return
                }

                // 只找 bottle（不要拿 top-1 的任意类别）
                var bestCenter: CGPoint? = nil
                var bestConf: Float = 0
                
                // 🚀 新增：置信度阈值 (Confidence Threshold)
                // 推荐设置在 0.25 到 0.5 之间。0.3 是个很好的起点，你可以根据测试体验微调。
                let minConfidence: Float = 0.3

                for o in obs {
                    for label in o.labels {
                        // 增加条件：不仅要大于 bestConf，还必须大于我们设定的 minConfidence 底线
                        if label.identifier == "bottle", label.confidence > bestConf, label.confidence >= minConfidence {
                            bestConf = label.confidence
                            let bb = o.boundingBox
                            bestCenter = CGPoint(x: bb.midX, y: bb.midY)
                        }
                    }
                }

                if self.debugPrints {
                    if let bestCenter { print("bottle conf=\(bestConf) center=\(bestCenter)") }
                    else { print("bottle not found (or below threshold)") }
                }

                completion?(bestCenter, bestConf)
            }

            req.imageCropAndScaleOption = .scaleFill
            print("✅ YOLO model loaded via generated class: yolov8n")
            return req

        } catch {
            print("❌ Failed to load yolov8n model:", error)
            return nil
        }
    }()

    /// 异步检测 bottle，返回 bbox center（normalized, Vision 坐标：原点左下）
    func detectBottleCenter(
        pixelBuffer: CVPixelBuffer,
        completion: @escaping (_ centerNorm: CGPoint?, _ conf: Float) -> Void
    ) {
        guard let request else {
            completion(nil, 0)
            return
        }

        // 防止并发：如果上一轮还没回调，就直接丢弃本次（上层也有 detecting 保护）
        if pending != nil {
            completion(nil, 0)
            return
        }
        pending = completion

        queue.async {
            // 竖屏后置相机通常用 .right；如果你发现 bbox 明显错位，我们再改 orientation
            let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .right, options: [:])
            do {
                try handler.perform([request])
            } catch {
                print("Vision perform error:", error)
                let c = self.pending
                self.pending = nil
                c?(nil, 0)
            }
        }
    }
}
