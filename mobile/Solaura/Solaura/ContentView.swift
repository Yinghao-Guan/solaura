import SwiftUI

struct ContentView: View {
    @StateObject private var voice = VoiceService.shared
    @StateObject private var appState = AppStateManager.shared
    
    @State private var isPressing = false
    
    var body: some View {
        ZStack {
            // 背景：你的 AR 摄像头视图
            ARViewContainer()
                .edgesIgnoringSafeArea(.all)
            
            VStack {
                Spacer()
                
                // 💬 状态与字幕显示框
                VStack(spacing: 8) {
                    Text(appState.isRadarActive ? "📡 Radar Active" : "💬 Chat Mode")
                        .font(.headline)
                        .foregroundColor(appState.isRadarActive ? .green : .blue)
                        .animation(.easeInOut, value: appState.isRadarActive)
                    
                    // 显示你正在说的话，或者 Gemini 的回复
                    Text(voice.recognizedText.isEmpty ? appState.uiStatus : voice.recognizedText)
                        .font(.body)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .padding()
                .background(Color.black.opacity(0.6))
                .cornerRadius(15)
                .padding(.bottom, 30)
                
                // 🎙️ 按住说话按钮
                Button(action: {}) {
                    Image(systemName: isPressing ? "waveform" : "mic.fill")
                        .font(.system(size: 32))
                        .foregroundColor(.white)
                        .padding(25)
                        .background(isPressing ? Color.red : Color.blue)
                        .clipShape(Circle())
                        .shadow(radius: 10)
                        .scaleEffect(isPressing ? 1.2 : 1.0)
                        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isPressing)
                }
                .simultaneousGesture(
                    DragGesture(minimumDistance: 0)
                        .onChanged { _ in
                            if !isPressing {
                                isPressing = true
                                startInteraction()
                            }
                        }
                        .onEnded { _ in
                            isPressing = false
                            endInteraction()
                        }
                )
                .padding(.bottom, 50)
            }
        }
    }
    
    // 开始按住录音
        private func startInteraction() {
            // 1. 强制切断雷达 UI 状态
            appState.isRadarActive = false
            
            // 2. 瞬间打断 Gemini 正在逼逼叨的语音
            // voice.stopSpeaking()
            ElevenLabsService.shared.stopSpeaking()
            
            // 3. 瞬间静音！向 Python 发送强制丢失信号，打破它的 2 秒记忆续命。
            // 这样你电脑/音响里的滴滴声也会立刻停止，绝不会录进手机麦克风！
            UdpSender.shared.send(jsonObject: ["mode": "bottle_miss"])
            
            appState.uiStatus = "Listening..."
            
            voice.startListening { finalResult in
                // 处理异常中断的情况，主逻辑在 endInteraction
            }
        }
    
    // 松手，发送给大模型
    private func endInteraction() {
        voice.stopListening()
        appState.uiStatus = "Thinking..."
        
        let prompt = voice.recognizedText
        guard !prompt.isEmpty else {
            appState.uiStatus = "Didn't catch that."
            return
        }
        
        // 🧠 魔法发生：把画面和你的话发给 Gemini 3 Flash！
        GeminiService.shared.askGemini(
            prompt: prompt,
            pixelBuffer: appState.latestPixelBuffer
        ) { result in
            switch result {
            case .chat(let reply):
                // Gemini 决定只聊天
                appState.uiStatus = reply
                ElevenLabsService.shared.speak(reply)
                appState.isRadarActive = false
                
            case .activateRadar(let target, let reply):
                // Gemini 决定开启雷达寻找物体！
                appState.uiStatus = "Radar Targeting: \(target)"
                ElevenLabsService.shared.speak(reply)
                
                // 🚀 瞬间激活 15Hz 的空间追踪与 UDP 发送引擎！
                appState.isRadarActive = true
                
            case .error(let err):
                appState.uiStatus = "Error: \(err)"
                print(err)
            }
        }
    }
}
