//
//  VoiceService.swift
//  Solaura
//
//  Created by Peter on 28/2/26.
//

import Foundation
import AVFoundation
import Speech
import Combine
import SwiftUI

class VoiceService: ObservableObject {
    static let shared = VoiceService()
    
    // 嘴巴：文字转语音
    private let synthesizer = AVSpeechSynthesizer()
    
    // 耳朵：语音转文字
    private var speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    @Published var isListening = false
    @Published var recognizedText = ""
    
    private init() {
        // 请求语音识别权限
        SFSpeechRecognizer.requestAuthorization { authStatus in
            print("Speech Auth Status: \(authStatus.rawValue)")
        }
    }
    
    // 🗣️ 嘴巴：说出一段话
    func speak(_ text: String) {
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = 0.5 // 语速，0.5 比较自然
        
        // 说话前先打断正在说的内容
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
        synthesizer.speak(utterance)
    }
    
    // 🛑 强制打断正在播放的语音
        func stopSpeaking() {
            if synthesizer.isSpeaking {
                synthesizer.stopSpeaking(at: .immediate)
            }
        }
    
    // 👂 耳朵：开始听你说话
    func startListening(onResult: @escaping (String) -> Void) {
        if audioEngine.isRunning {
            stopListening()
            return
        }
        
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playAndRecord, mode: .measurement, options: [.duckOthers, .defaultToSpeaker])
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            print("Audio session config failed: \(error)")
            return
        }
        
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let request = recognitionRequest else { return }
        request.shouldReportPartialResults = true // 开启实时返回
        
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { (buffer, when) in
            request.append(buffer)
        }
        
        audioEngine.prepare()
        do {
            try audioEngine.start()
            DispatchQueue.main.async { self.isListening = true }
        } catch {
            print("Audio engine start failed: \(error)")
        }
        
        recognitionTask = speechRecognizer?.recognitionTask(with: request) { result, error in
            if let result = result {
                let text = result.bestTranscription.formattedString
                DispatchQueue.main.async {
                    self.recognizedText = text
                }
                // 当用户停止说话，系统认为这句话结束时
                if result.isFinal {
                    onResult(text)
                    self.stopListening()
                }
            }
            if error != nil {
                self.stopListening()
            }
        }
    }
    
    func stopListening() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        
        DispatchQueue.main.async {
            self.isListening = false
        }
    }
}
