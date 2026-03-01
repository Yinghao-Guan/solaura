import Foundation
import CoreVideo
import SwiftUI
import Combine

class AppStateManager: ObservableObject {
    static let shared = AppStateManager()
    
    // 控制雷达是否开启的核心开关
    @Published var isRadarActive: Bool = false
    // 界面上显示的提示文字
    @Published var uiStatus: String = "Press and hold the button to speak"
    
    // 永远保存当前相机的最新一帧画面，随时准备发给 Gemini
    var latestPixelBuffer: CVPixelBuffer?
}
