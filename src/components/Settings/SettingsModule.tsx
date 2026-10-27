import React, { useState, useEffect } from 'react';
import { N8nConfig, VehicleProfile, WebhookLog } from '../../types';
import { n8nService } from '../../services/n8nService';
import { sounds } from '../../services/soundEffects';
import {
  Settings,
  Webhook,
  Car,
  Download,
  Play,
  Terminal,
  Layers,
  Save
} from 'lucide-react';

interface Props {
  vehicle: VehicleProfile;
  onUpdateVehicle: (updated: VehicleProfile) => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
}

export const SettingsModule: React.FC<Props> = ({
  vehicle,
  onUpdateVehicle,
  isSoundEnabled,
  onToggleSound
}) => {
  const [vehicleState, setVehicleState] = useState<VehicleProfile>(vehicle);
  const [n8nConfig, setN8nConfig] = useState<N8nConfig>(n8nService.getConfig());
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [activeTab, setActiveTab] = useState<'vehicle' | 'n8n' | 'logs'>('n8n');
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    const unsub = n8nService.subscribeLogs(setWebhookLogs);
    return () => unsub();
  }, []);

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    onUpdateVehicle(vehicleState);
    localStorage.setItem('autohub_vehicle_profile', JSON.stringify(vehicleState));
  };

  const handleSaveN8n = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    n8nService.saveConfig(n8nConfig);
  };

  const handleTestScanWebhook = async () => {
    sounds.playClick();
    setTestStatus('სკანირების ვებჰუკის ტესტირება...');
    try {
      await n8nService.scanObd("43 01 33 00 00", vehicle.id);
      setTestStatus('✅ Scan Webhook წარმატებით შესრულდა!');
    } catch (e: any) {
      setTestStatus(`❌ შეცდომა: ${e.message}`);
    }
  };

  const handleDownloadWorkflowJson = () => {
    sounds.playClick();
    const link = document.createElement('a');
    link.href = '/n8n-workflow-template.json';
    link.download = 'autohub-n8n-workflow.json';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Tabs */}
      <div className="p-5 rounded-3xl neu-card shadow-neu-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full neu-circle flex items-center justify-center text-gold">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-navy">კონფიგურაცია და n8n ინტეგრაცია</h2>
            <p className="text-xs text-slate-500">ავტომობილის პროფილი, OBD ადაპტერი და ავტომატიზაციის ვებჰუკები</p>
          </div>
        </div>

        {/* Tab Buttons (Matching Image 1 Pill Tabs) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl neu-inset">
          <button
            onClick={() => setActiveTab('n8n')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'n8n'
                ? 'bg-white text-navy shadow-sm font-extrabold border border-gold/30'
                : 'text-slate-500 hover:text-navy'
            }`}
          >
            <Webhook className="w-3.5 h-3.5 text-gold" />
            <span>n8n ვებჰუკები</span>
          </button>

          <button
            onClick={() => setActiveTab('vehicle')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'vehicle'
                ? 'bg-white text-navy shadow-sm font-extrabold border border-gold/30'
                : 'text-slate-500 hover:text-navy'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-gold" />
            <span>მანქანის პროფილი</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-white text-navy shadow-sm font-extrabold border border-gold/30'
                : 'text-slate-500 hover:text-navy'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-gold" />
            <span>ლოგები ({webhookLogs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: n8n Webhook Configuration */}
      {activeTab === 'n8n' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl neu-card shadow-neu-card space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-navy flex items-center gap-2">
                  <Webhook className="w-5 h-5 text-gold" />
                  REST Webhook Endpoints
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  სისტემა ურთიერთობს n8n-თან შემდეგი REST ენდფოინთებით
                </p>
              </div>

              {/* Neumorphic Switch (Matching Image 1 toggle!) */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">სიმულაცია</span>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setN8nConfig(c => ({ ...c, useLiveWebhook: !c.useLiveWebhook }));
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 shadow-inner ${
                    n8nConfig.useLiveWebhook ? 'bg-gold' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                    n8nConfig.useLiveWebhook ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
                <span className="text-xs text-navy font-bold">Live n8n</span>
              </div>
            </div>

            <form onSubmit={handleSaveN8n} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-navy block mb-1">
                    n8n Base URL (სერვერის მისამართი)
                  </label>
                  <input
                    type="text"
                    value={n8nConfig.baseUrl}
                    onChange={(e) => setN8nConfig({ ...n8nConfig, baseUrl: e.target.value })}
                    placeholder="https://n8n.your-domain.com/webhook"
                    className="w-full px-4 py-2.5 rounded-xl neu-inset text-navy font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-navy block mb-1">
                    n8n API Key / Token (ავთენტიფიკაცია)
                  </label>
                  <input
                    type="password"
                    value={n8nConfig.apiKey || ''}
                    onChange={(e) => setN8nConfig({ ...n8nConfig, apiKey: e.target.value })}
                    placeholder="Bearer token ან x-autohub-api-key..."
                    className="w-full px-4 py-2.5 rounded-xl neu-inset text-navy font-mono text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">უსაფრთხო ჰედერი: Authorization / x-autohub-api-key</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-navy block mb-1">
                    1. OBD Scan Endpoint
                  </label>
                  <input
                    type="text"
                    value={n8nConfig.scanEndpoint}
                    onChange={(e) => setN8nConfig({ ...n8nConfig, scanEndpoint: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl neu-inset text-navy font-mono text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">POST /webhook/obd-scan</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-navy block mb-1">
                    2. Clear DTC Codes Endpoint
                  </label>
                  <input
                    type="text"
                    value={n8nConfig.clearEndpoint}
                    onChange={(e) => setN8nConfig({ ...n8nConfig, clearEndpoint: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl neu-inset text-navy font-mono text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">POST /webhook/clear-codes</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-navy block mb-1">
                    3. AI Mechanic Chat Endpoint (Claude)
                  </label>
                  <input
                    type="text"
                    value={n8nConfig.chatEndpoint}
                    onChange={(e) => setN8nConfig({ ...n8nConfig, chatEndpoint: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl neu-inset text-navy font-mono text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">POST /webhook/ai-mechanic-chat</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-navy block mb-1">
                    4. Fines Check Endpoint
                  </label>
                  <input
                    type="text"
                    value={n8nConfig.finesEndpoint}
                    onChange={(e) => setN8nConfig({ ...n8nConfig, finesEndpoint: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl neu-inset text-navy font-mono text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">POST /webhook/fines-check</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-navy block mb-1">
                    5. 4G OBD Telemetry Endpoint
                  </label>
                  <input
                    type="text"
                    value={n8nConfig.telemetryEndpoint || '/obd-telemetry'}
                    onChange={(e) => setN8nConfig({ ...n8nConfig, telemetryEndpoint: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl neu-inset text-navy font-mono text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">POST /webhook/obd-telemetry</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-navy block mb-1">
                    6. Parking Confirm Endpoint
                  </label>
                  <input
                    type="text"
                    value={n8nConfig.parkingConfirmEndpoint || '/parking-session-confirm'}
                    onChange={(e) => setN8nConfig({ ...n8nConfig, parkingConfirmEndpoint: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl neu-inset text-navy font-mono text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">POST /webhook/parking-session-confirm</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTestScanWebhook}
                  className="px-4 py-2 rounded-xl text-xs font-bold neu-btn text-navy flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-gold" />
                  <span>ტესტ-პინგ გაგზავნა</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gold hover:bg-amber-400 text-navy shadow-gold-soft flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>შენახვა</span>
                </button>
              </div>

              {testStatus && (
                <p className="text-xs font-mono text-center text-navy bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  {testStatus}
                </p>
              )}
            </form>
          </div>

          <div className="p-6 rounded-3xl neu-card shadow-neu-card flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-full neu-circle flex items-center justify-center text-gold mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy">
                მზა n8n Workflow ფაილი
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                ჩამოტვირთეთ წინასწარ დაკონფიგურირებული JSON ფაილი და ჩააგდეთ თქვენს n8n-ში.
              </p>

              <div className="mt-4 p-3 rounded-2xl neu-inset text-[11px] text-slate-600 font-mono space-y-1">
                <div>• 1. 4G OBD ტელემეტრიის მიღება & ავთენტიფიკაცია</div>
                <div>• 2. მოწყობილობის მიბმა მანქანასა და მფლობელთან</div>
                <div>• 3. დედუბლიკაცია & დაგვიანებული მოვლენების ფილტრი</div>
                <div>• 4. სერვერული პარკინგის დეტექტორი (თბილისის ზონები)</div>
                <div>• 5. დადასტურებული სესიის შენახვა & შეხსენებების დაგეგმვა</div>
                <div>• 6. სესიის დასრულებისას შეხსენებების ავტო-გაუქმება</div>
                <div>• 7. Claude (Anthropic LLM) გასუფთავებული კონტექსტით</div>
              </div>
            </div>

            <button
              onClick={handleDownloadWorkflowJson}
              className="w-full py-3 rounded-2xl text-xs font-bold neu-btn text-navy hover:text-gold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-gold" />
              <span>ჩამოტვირთე n8n Template (JSON)</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Vehicle Profile Settings */}
      {activeTab === 'vehicle' && (
        <form onSubmit={handleSaveVehicle} className="p-6 rounded-3xl neu-card shadow-neu-card space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <Car className="w-5 h-5 text-gold" />
              ავტომობილის პროფილი და OBD ქსელი
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">შეცვალეთ თქვენი მანქანის ტექნიკური მახასიათებლები</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-navy block mb-1">მარკა (Brand)</label>
              <input
                type="text"
                value={vehicleState.brand}
                onChange={(e) => setVehicleState({ ...vehicleState, brand: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl neu-inset text-navy text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-navy block mb-1">მოდელი (Model)</label>
              <input
                type="text"
                value={vehicleState.model}
                onChange={(e) => setVehicleState({ ...vehicleState, model: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl neu-inset text-navy text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-navy block mb-1">გამოშვების წელი</label>
              <input
                type="number"
                value={vehicleState.year}
                onChange={(e) => setVehicleState({ ...vehicleState, year: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl neu-inset text-navy text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-navy block mb-1">ძრავი (Engine specs)</label>
              <input
                type="text"
                value={vehicleState.engine}
                onChange={(e) => setVehicleState({ ...vehicleState, engine: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl neu-inset text-navy text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-navy block mb-1">გარბენი (კმ)</label>
              <input
                type="number"
                value={vehicleState.mileage_km}
                onChange={(e) => setVehicleState({ ...vehicleState, mileage_km: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl neu-inset text-navy text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-navy block mb-1">VIN კოდი</label>
              <input
                type="text"
                value={vehicleState.vin}
                onChange={(e) => setVehicleState({ ...vehicleState, vin: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 rounded-xl neu-inset text-navy font-mono text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-navy block mb-1">OBD ადაპტერის IP</label>
              <input
                type="text"
                value={vehicleState.obd_ip}
                onChange={(e) => setVehicleState({ ...vehicleState, obd_ip: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl neu-inset text-navy font-mono text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-navy block mb-1">OBD პორტი (Port)</label>
              <input
                type="number"
                value={vehicleState.obd_port}
                onChange={(e) => setVehicleState({ ...vehicleState, obd_port: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl neu-inset text-navy font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gold hover:bg-amber-400 text-navy shadow-gold-soft"
            >
              პროფილის შენახვა
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Webhook Inspector Logs */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-3xl neu-card shadow-neu-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gold" />
              Webhook Inspector & Payload Logs
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              სულ: {webhookLogs.length} მოთხოვნა
            </span>
          </div>

          {webhookLogs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              ვებჰუკების ლოგები ცარიელია.
            </p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {webhookLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-navy text-white font-bold">
                        {log.method}
                      </span>
                      <span className="text-navy font-bold">{log.endpoint}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.status === 'success' ? '200 OK (LIVE)' : 'SIMULATED'}
                      </span>
                      <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Input:</span>
                      <pre className="p-2 rounded-xl bg-white text-navy text-[10px] overflow-x-auto border border-slate-200">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Output:</span>
                      <pre className="p-2 rounded-xl bg-white text-emerald-700 text-[10px] overflow-x-auto border border-slate-200">
                        {JSON.stringify(log.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
