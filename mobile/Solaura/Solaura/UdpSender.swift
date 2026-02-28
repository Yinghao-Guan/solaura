import Foundation
import Network

final class UdpSender {
    static let shared = UdpSender()

    // 改成你的 Mac IP
    private let host = NWEndpoint.Host("10.34.215.162")
    private let port = NWEndpoint.Port(integerLiteral: 5005)

    private let conn: NWConnection
    private let queue = DispatchQueue(label: "udp.sender.queue")

    private init() {
        conn = NWConnection(host: host, port: port, using: .udp)
        conn.stateUpdateHandler = { newState in
            // 需要的话可以打印状态排错
            // print("UDP state:", newState)
        }
        conn.start(queue: queue)
    }

    func send(jsonObject: [String: Any]) {
        guard JSONSerialization.isValidJSONObject(jsonObject) else { return }
        do {
            let data = try JSONSerialization.data(withJSONObject: jsonObject, options: [])
            conn.send(content: data, completion: .contentProcessed({ _ in }))
        } catch {
            // 忽略即可，别让它崩
        }
    }
}

