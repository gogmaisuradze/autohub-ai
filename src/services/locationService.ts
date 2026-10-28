import { obd4gService } from './obd4gService';
import { DeviceTelemetryReading, Obd4gDeviceMetadata } from '../types/telemetry';

export type LocationFix = {lat:number; lng:number; accuracy:number; timestamp:number; source:'obd'|'device'};
export function validFix(fix: LocationFix, maxAccuracy=100, now=Date.now()): boolean {
  return Number.isFinite(fix.lat)&&Math.abs(fix.lat)<=90&&Number.isFinite(fix.lng)&&Math.abs(fix.lng)<=180&&Number.isFinite(fix.accuracy)&&fix.accuracy>=0&&fix.accuracy<=maxAccuracy&&Number.isFinite(fix.timestamp)&&now-fix.timestamp<=30000&&now-fix.timestamp>=-5000;
}
export function selectObdFix(reading: DeviceTelemetryReading|null, device: Obd4gDeviceMetadata|null, mode:string, vehicleId?:string, maxAccuracy=100, now=Date.now()): LocationFix|null {
 if(mode!=='real'||!reading||!device||device.mode!=='real'||!device.hasGnss||!vehicleId||device.vehicleId!==vehicleId||reading.vehicleId!==vehicleId||reading.deviceId!==device.deviceId) return null;
 if(reading.latitude===null||reading.longitude===null||reading.accuracyMeters===null)return null;
 const fix:LocationFix={lat:reading.latitude,lng:reading.longitude,accuracy:reading.accuracyMeters,timestamp:Date.parse(reading.recordedAt),source:'obd'};
 const received=Date.parse(reading.receivedAt);
 return validFix(fix,maxAccuracy,now)&&Number.isFinite(received)&&now-received<=30000&&now-received>=-5000?fix:null;
}
export function currentObdFix(vehicleId?:string,maxAccuracy=100):LocationFix|null {
 let reading:DeviceTelemetryReading|null=null;
 const unsubscribe=obd4gService.subscribeTelemetry(value=>{reading=value;});unsubscribe();
 return selectObdFix(reading,obd4gService.getActiveDevice(),obd4gService.getMode(),vehicleId,maxAccuracy);
}
export async function getPreferredLocation(vehicleId?:string, preference:'auto'|'device'|'obd'='auto',maxAccuracy=100):Promise<LocationFix>{
 const obd=preference!=='device'?currentObdFix(vehicleId,maxAccuracy):null;
 if(obd)return obd;
 if(preference==='obd')throw Error('მანქანის ახალი და ზუსტი GPS მონაცემი ჯერ არ მოსულა.');
 if(!navigator.geolocation)throw Error('მოწყობილობის მდებარეობა მიუწვდომელია.');
 return new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(position=>{
  // A real OBD fix may have arrived while the device was locating.
  const preferred=preference==='auto'?currentObdFix(vehicleId,maxAccuracy):null;
  const fix:LocationFix={lat:position.coords.latitude,lng:position.coords.longitude,accuracy:position.coords.accuracy,timestamp:position.timestamp,source:'device'};
  if(preferred)resolve(preferred);else if(validFix(fix,maxAccuracy))resolve(fix);else reject(Error('GPS მონაცემი ძველია ან არასაკმარისად ზუსტია.'));
 },error=>reject(Error(error.code===1?'მდებარეობის ნებართვა გამორთულია.':'მდებარეობა ვერ განისაზღვრა.')), {enableHighAccuracy:true,timeout:15000,maximumAge:0}));
}
export function watchPreferredLocation(vehicleId:string|undefined,onFix:(fix:LocationFix)=>void,onError:(message:string)=>void):()=>void {
 let deviceFix:LocationFix|null=null,watchId:number|undefined,disposed=false,lastError='';
 const update=()=>{
  if(disposed)return;
  const obd=currentObdFix(vehicleId);
  const best=obd||(deviceFix&&validFix(deviceFix)?deviceFix:null);
  if(best){lastError='';onFix(best);}
  else {const message='ახალი მდებარეობა ჯერ არ არის მიღებული.';if(lastError!==message){lastError=message;onError(message);}}
  if(!obd&&watchId===undefined&&navigator.geolocation){
   watchId=navigator.geolocation.watchPosition(position=>{deviceFix={lat:position.coords.latitude,lng:position.coords.longitude,accuracy:position.coords.accuracy,timestamp:position.timestamp,source:'device'};update();},error=>{if(!disposed&&!currentObdFix(vehicleId))onError(error.code===1?'მდებარეობის ნებართვა გამორთულია.':'მოწყობილობის მდებარეობა ვერ განისაზღვრა.');},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
  }
 };
 // Subscription callbacks are synchronous; defer update until subscription is installed.
 const unsubscribe=obd4gService.subscribeTelemetry(()=>{queueMicrotask(update);});
 update();const timer=setInterval(update,5000);
 return()=>{disposed=true;unsubscribe();clearInterval(timer);if(watchId!==undefined)navigator.geolocation.clearWatch(watchId);};
}
