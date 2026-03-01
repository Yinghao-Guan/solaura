import Foundation
import UIKit
import CoreVideo

enum GeminiResult {
    case chat(String)
    case activateRadar(target: String, text: String)
    case error(String)
}

class GeminiService {
    static let shared = GeminiService()
    
    // 使用最新且极速的多模态模型
    private let apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=\(Secrets.geminiApiKey)"
    
    // 🧠 备用方案：Gemini 3.1 Pro (如果你以后需要极其复杂的画面逻辑推理，可以切到这个，但会有延迟)
    // private let apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=\(Secrets.geminiApiKey)"
    
    private init() {}
    
    func askGemini(prompt: String, pixelBuffer: CVPixelBuffer?, completion: @escaping (GeminiResult) -> Void) {
        
        var parts: [[String: Any]] = [["text": prompt]]
        
        if let pb = pixelBuffer, let base64Image = pb.toBase64JPEG() {
            parts.append([
                "inlineData": [
                    "mimeType": "image/jpeg",
                    "data": base64Image
                ]
            ])
        }
        
        // 🚀 纯英文 Function Calling 描述，极其精准
        let tools: [[String: Any]] = [[
            "functionDeclarations": [[
                "name": "activate_radar",
                "description": "Call this function when the user wants to find, grab, reach for, or interact with a specific physical object in their environment. This activates the local high-precision spatial radar system.",
                "parameters": [
                    "type": "OBJECT",
                    "properties": [
                        "target_object": [
                            "type": "STRING",
                            "description": "The exact English name of the object the user wants to find, e.g., 'bottle', 'cup', 'keyboard', 'mouse'."
                        ]
                    ],
                    "required": ["target_object"]
                ]
            ]]
        ]]
        
        // 🚀 纯英文 System Instruction
        let requestBody: [String: Any] = [
            "systemInstruction": [
                "parts": [["text": "You are a spatial AI assistant with vision capabilities. You can chat normally with the user about their surroundings. However, if the user expresses an intent to grab, find, or interact with a physical object in the camera frame, you MUST call the activate_radar tool and provide a brief, natural English response indicating you are activating the radar to assist them."]]
            ],
            "contents": [["role": "user", "parts": parts]],
            "tools": tools
        ]
        
        guard let url = URL(string: apiUrl),
              let httpBody = try? JSONSerialization.data(withJSONObject: requestBody) else {
            completion(.error("JSON Serialization Failed"))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = httpBody // 修复：刚才忘了把 httpBody 塞进 request 里！
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.error("Network Error: \(error.localizedDescription)"))
                return
            }
            guard let data = data else {
                completion(.error("No data received"))
                return
            }
            
            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let candidates = json["candidates"] as? [[String: Any]],
                   let firstCandidate = candidates.first,
                   let content = firstCandidate["content"] as? [String: Any],
                   let resParts = content["parts"] as? [[String: Any]] {
                    
                    var spokenText = ""
                    var radarTarget: String? = nil
                    
                    for part in resParts {
                        if let text = part["text"] as? String {
                            spokenText += text
                        }
                        if let functionCall = part["functionCall"] as? [String: Any],
                           functionCall["name"] as? String == "activate_radar",
                           let args = functionCall["args"] as? [String: Any],
                           let target = args["target_object"] as? String {
                            radarTarget = target
                        }
                    }
                    
                    DispatchQueue.main.async {
                        if let target = radarTarget {
                            let text = spokenText.isEmpty ? "Okay, activating radar to find the \(target)." : spokenText
                            completion(.activateRadar(target: target, text: text))
                        } else {
                            completion(.chat(spokenText.isEmpty ? "I'm not sure I understand." : spokenText))
                        }
                    }
                } else {
                    DispatchQueue.main.async { completion(.error("Failed to parse Gemini response")) }
                }
            } catch {
                DispatchQueue.main.async { completion(.error("JSON Parsing Exception: \(error.localizedDescription)")) }
            }
        }.resume()
    }
}

extension CVPixelBuffer {
    func toBase64JPEG() -> String? {
        let ciImage = CIImage(cvPixelBuffer: self)
        let context = CIContext(options: nil)
        guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else { return nil }
        let uiImage = UIImage(cgImage: cgImage)
        return uiImage.jpegData(compressionQuality: 0.5)?.base64EncodedString()
    }
}
