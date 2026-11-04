# CarMe — ნატიური OBD-TCP პლაგინი (`CarmeObdTcp`)

ეს ფოლდერი შეიცავს ნატიური TCP პლაგინის კოდს, რომელიც აპს აძლევს WiFi
ELM327 ადაპტერთან (მაგ. `192.168.0.10:35000`) პირდაპირ დაკავშირების საშუალებას.
JS-მხარე უკვე მზადაა: `src/services/obdWifiService.ts` + `src/services/obdNativeTransport.ts`.

ეს ფაილები **Xcode / Android Studio-ის დაყენების შემდეგ** ჩაისმება პროექტში
(`npx cap add ios` / `npx cap add android`-ის გაშვების შემდეგ).

## iOS (Xcode-ის დაყენების მერე)

1. `npx cap add ios`
2. დააკოპირე ორივე ფაილი:
   - `ios/CarmeObdTcpPlugin.swift` → `ios/App/App/`
   - `ios/CarmeObdTcpPlugin.m` → `ios/App/App/`
3. `ios/App/App/Info.plist`-ში დაამატე (ლოკალურ ქსელთან კავშირის ნებართვა):
   ```xml
   <key>NSLocalNetworkUsageDescription</key>
   <string>CarMe უკავშირდება OBD ადაპტერს მანქანის დიაგნოსტიკისთვის.</string>
   ```
4. `npx cap sync ios` → `npx cap open ios` → Xcode-ში Run.

## Android (Android Studio-ის დაყენების მერე)

1. `npx cap add android`
2. დააკოპირე:
   - `android/CarmeObdTcpPlugin.kt` → `android/app/src/main/java/ge/carme/app/`
3. დაარეგისტრირე `MainActivity.java`-ში:
   ```java
   registerPlugin(CarmeObdTcpPlugin.class);
   ```
4. `android/app/src/main/AndroidManifest.xml`-ში დარწმუნდი:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   ```
5. `npx cap sync android` → `npx cap open android` → Run.

## ტესტი (მანქანასთან)
1. ტელეფონი დააკავშირე OBD WiFi-ს (`Zvio 2`)
2. გახსენი CarMe აპი → „სკანი WiFi-ით"
3. აპი დაუკავშირდება `192.168.0.10:35000`-ს, წაიკითხავს კოდებს,
   offline შეინახავს და ინტერნეტზე → carme.ge/n8n-ზე გააგზავნის ანალიზისთვის.

## API (`registerPlugin('CarmeObdTcp')`)
- `connect({ host, port })`
- `send({ command, timeoutMs })` → `{ response }`
- `close()`
- `isConnected()` → `{ connected }`
