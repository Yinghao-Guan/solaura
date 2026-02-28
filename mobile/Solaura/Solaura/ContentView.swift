import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack(alignment: .top) {
            ARViewContainer()
                .ignoresSafeArea()

            Text("Streaming cam pose @30Hz\nTap screen to send target point")
                .padding(10)
                .background(.ultraThinMaterial)
                .cornerRadius(12)
                .padding()
        }
    }
}
