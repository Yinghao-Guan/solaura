//
//  ElevenLabsService.swift
//  Solaura
//
//  Created by Peter on 1/3/26.
//

import Foundation
import AVFoundation

class ElevenLabsService: NSObject, AVAudioPlayerDelegate {
    static let shared = ElevenLabsService()
    
    private var audioPlayer: AVAudioPlayer?
    // 这是一个非常经典的知性女声 (Rachel)。你可以在 ElevenLabs 后台换成任何你喜欢的 Voice ID
    private let voiceId = "21m00Tcm4TlvDq8ikWAM"
    private let apiUrl = "https://api.elevenlabs.io/v1/text-to-speech/"
    
    private override init() { super.init() }
    
    // 🗣️ 核心：把文字发过去，把流媒体声音播出来
    func speak(_ text: String) {
        // 说话前先打断之前可能正在播放的声音
        stopSpeaking()
        
        let urlString = apiUrl + voiceId
        guard let url = URL(string: urlString) else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(Secrets.elevenLabsApiKey, forHTTPHeaderField: "xi-api-key")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // 使用 turbo 模型换取极速响应
        let body: [String: Any] = [
            "text": text,
            "model_id": "eleven_turbo_v2_5",
            "voice_settings": [
                "stability": 0.5,
                "similarity_boost": 0.7
            ]
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            guard let data = data, error == nil else {
                print("ElevenLabs API 报错: \(String(describing: error))")
                return
            }
            
            // 拿到音频数据，切回主线程播放
            DispatchQueue.main.async {
                do {
                    // 使用 AVAudioPlayer 播放 MP3 格式的数据流
                    self?.audioPlayer = try AVAudioPlayer(data: data)
                    self?.audioPlayer?.delegate = self
                    self?.audioPlayer?.prepareToPlay()
                    self?.audioPlayer?.play()
                } catch {
                    print("音频播放器报错: \(error.localizedDescription)")
                }
            }
        }.resume()
    }
    
    // 🛑 核心打断机制
    func stopSpeaking() {
        if audioPlayer?.isPlaying == true {
            audioPlayer?.stop()
        }
        audioPlayer = nil
    }
}
