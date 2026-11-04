package ge.carme.app

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.net.InetSocketAddress
import java.net.Socket
import kotlin.concurrent.thread

// CarMe — ნატიური TCP პლაგინი OBD-WiFi-სთვის (Android)
@CapacitorPlugin(name = "CarmeObdTcp")
class CarmeObdTcpPlugin : Plugin() {
    private var socket: Socket? = null

    @PluginMethod
    fun connect(call: PluginCall) {
        val host = call.getString("host") ?: return call.reject("host required")
        val port = call.getInt("port") ?: return call.reject("port required")
        thread {
            try {
                val s = Socket()
                s.connect(InetSocketAddress(host, port), 5000)
                s.tcpNoDelay = true
                socket = s
                call.resolve()
            } catch (e: Exception) {
                call.reject("connect failed: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun send(call: PluginCall) {
        val cmd = call.getString("command") ?: return call.reject("command required")
        val timeoutMs = call.getInt("timeoutMs") ?: 4000
        val s = socket ?: return call.reject("not connected")
        thread {
            try {
                s.soTimeout = timeoutMs
                val out = s.getOutputStream()
                out.write((cmd + "\r").toByteArray(Charsets.US_ASCII))
                out.flush()

                val input = s.getInputStream()
                val sb = StringBuilder()
                val buf = ByteArray(1024)
                val deadline = System.currentTimeMillis() + timeoutMs
                while (System.currentTimeMillis() < deadline) {
                    val n = try { input.read(buf) } catch (e: Exception) { -1 }
                    if (n > 0) {
                        sb.append(String(buf, 0, n, Charsets.US_ASCII))
                        if (sb.contains(">")) break
                    } else {
                        break
                    }
                }
                val ret = JSObject()
                ret.put("response", sb.toString())
                call.resolve(ret)
            } catch (e: Exception) {
                call.reject("send failed: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun close(call: PluginCall) {
        try { socket?.close() } catch (_: Exception) {}
        socket = null
        call.resolve()
    }

    @PluginMethod
    fun isConnected(call: PluginCall) {
        val ret = JSObject()
        ret.put("connected", socket?.isConnected == true && socket?.isClosed == false)
        call.resolve(ret)
    }
}
