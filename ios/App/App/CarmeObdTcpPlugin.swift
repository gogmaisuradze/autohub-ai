import Foundation
import Capacitor
import Network
import UIKit

// Capacitor 6: აპში ჩაშენებული პლაგინი აქ რეგისტრირდება (მაკრო მარტო პოდებს არეგისტრირებს).
// storyboard-ის მთავარი ViewController ამ კლასზეა მიმართული.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(CarmeObdTcpPlugin())
    }
}

// CarMe — ნატიური TCP პლაგინი OBD-WiFi-სთვის (iOS)
// ხსნის TCP socket-ს ELM327 ადაპტერთან (მაგ. 192.168.0.10:35000) და
// აგზავნის/იღებს ELM327 ბრძანებებს '>' prompt-მდე.
@objc(CarmeObdTcpPlugin)
public class CarmeObdTcpPlugin: CAPPlugin, CAPBridgedPlugin {
    // Capacitor 6 რეგისტრაცია — ამით აპი ხედავს პლაგინს iOS-ზე
    public let identifier = "CarmeObdTcpPlugin"
    public let jsName = "CarmeObdTcp"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "connect", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "send", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "close", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isConnected", returnType: CAPPluginReturnPromise)
    ]

    private var connection: NWConnection?
    private let netQueue = DispatchQueue(label: "ge.carme.obd.tcp")
    private var connected = false

    @objc func connect(_ call: CAPPluginCall) {
        guard let host = call.getString("host"),
              let portInt = call.getInt("port"),
              let port = NWEndpoint.Port(rawValue: UInt16(portInt)) else {
            call.reject("host/port required")
            return
        }
        connection?.cancel()
        let conn = NWConnection(host: NWEndpoint.Host(host), port: port, using: .tcp)
        connection = conn
        var resolved = false
        conn.stateUpdateHandler = { [weak self] state in
            switch state {
            case .ready:
                self?.connected = true
                if !resolved { resolved = true; call.resolve() }
            case .failed(let err):
                self?.connected = false
                if !resolved { resolved = true; call.reject("connect failed: \(err)") }
            case .cancelled:
                self?.connected = false
            default:
                break
            }
        }
        conn.start(queue: netQueue)
    }

    @objc func send(_ call: CAPPluginCall) {
        guard let cmd = call.getString("command"), let conn = connection, connected else {
            call.reject("not connected")
            return
        }
        let timeoutMs = call.getInt("timeoutMs") ?? 4000
        let payload = (cmd + "\r").data(using: .ascii) ?? Data()
        conn.send(content: payload, completion: .contentProcessed({ err in
            if let err = err { call.reject("send failed: \(err)") }
        }))

        var buffer = Data()
        let deadline = DispatchTime.now() + .milliseconds(timeoutMs)
        var done = false
        func finish() {
            if done { return }
            done = true
            call.resolve(["response": String(data: buffer, encoding: .ascii) ?? ""])
        }
        func receive() {
            conn.receive(minimumIncompleteLength: 1, maximumLength: 1024) { data, _, _, err in
                if let data = data { buffer.append(data) }
                let s = String(data: buffer, encoding: .ascii) ?? ""
                if s.contains(">") || DispatchTime.now() > deadline || err != nil {
                    finish()
                } else {
                    receive()
                }
            }
        }
        receive()
    }

    @objc func close(_ call: CAPPluginCall) {
        connection?.cancel()
        connection = nil
        connected = false
        call.resolve()
    }

    @objc func isConnected(_ call: CAPPluginCall) {
        call.resolve(["connected": connected])
    }
}
