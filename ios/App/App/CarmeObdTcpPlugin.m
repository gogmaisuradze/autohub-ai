#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// CarmeObdTcp პლაგინის რეგისტრაცია Capacitor-თან (iOS)
CAP_PLUGIN(CarmeObdTcpPlugin, "CarmeObdTcp",
  CAP_PLUGIN_METHOD(connect, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(send, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(close, CAPPluginReturnPromise);
  CAP_PLUGIN_METHOD(isConnected, CAPPluginReturnPromise);
)
