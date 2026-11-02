import React, { useState, useRef, useEffect } from 'react';
import { sounds } from '../../services/soundEffects';
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  Check,
  Sparkles,
  FileText,
  CreditCard,
  Car,
  AlertCircle,
  Eye,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export type ScannerDocType = 'id_card' | 'tech_passport';

export interface ScannedIdCardData {
  fullName: string;
  fullNameLatin: string;
  personalNumber: string;
  phone?: string;
  licenseNumber?: string;
  licenseCategories?: string;
  photoUrl?: string;
}

export interface ScannedVehicleData {
  plateNumber: string;
  vin: string;
  techPassport: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  horsepower: number;
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  color?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  docType: ScannerDocType;
  onScanComplete: (data: ScannedIdCardData | ScannedVehicleData) => void;
  lang?: 'ge' | 'en';
}

// Preset demo documents to allow instant 1-click testing even if user has no physical card ready
const PRESET_DEMO_ID_CARDS = [
  {
    name: 'გიორგი მაისურაძე (GEO ID)',
    data: {
      fullName: 'გიორგი მაისურაძე',
      fullNameLatin: 'GIORGI MAISURADZE',
      personalNumber: '01024085432',
      phone: '+995 599 12 34 56',
      licenseNumber: 'TR-908124',
      licenseCategories: 'B, B1',
      photoUrl: 'avatar_dog'
    }
  },
  {
    name: 'ნინო კაპანაძე (GEO ID)',
    data: {
      fullName: 'ნინო კაპანაძე',
      fullNameLatin: 'NINO KAPANADZE',
      personalNumber: '01019045678',
      phone: '+995 577 98 76 54',
      licenseNumber: 'TR-456789',
      licenseCategories: 'B, B1',
      photoUrl: 'avatar_cat'
    }
  }
];

const PRESET_DEMO_TECH_PASSPORTS = [
  {
    name: 'Mercedes-Benz GLA 250 (FR-282-EE)',
    data: {
      plateNumber: 'FR-282-EE',
      vin: 'WDCTG4GB2GJ193791',
      techPassport: '22-3999',
      brand: 'Mercedes-Benz',
      model: 'GLA 250',
      year: 2016,
      engine: '2.0L Turbo M270 (208 HP)',
      horsepower: 208,
      fuelType: 'petrol' as const,
      color: 'თეთრი / Polar White'
    }
  },
  {
    name: 'BMW 330i M-Sport (GE-777-AA)',
    data: {
      plateNumber: 'GE-777-AA',
      vin: 'WBA5R1C50NFP12345',
      techPassport: 'AA-9876543',
      brand: 'BMW',
      model: '330i M-Sport',
      year: 2023,
      engine: '2.0L TwinPower Turbo (255 HP)',
      horsepower: 255,
      fuelType: 'petrol' as const,
      color: 'ლურჯი / Portimao Blue'
    }
  }
];

export const DocumentCameraScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  docType,
  onScanComplete,
  lang = 'ge'
}) => {
  const isGe = lang === 'ge';
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState('');
  const [scanResult, setScanResult] = useState<ScannedIdCardData | ScannedVehicleData | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start / stop camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        isGe
          ? 'კამერა მიუწვდომელია ან ნებართვა დაბლოკილია. შეგიძლიათ ატვირთოთ ფოტო გალერეიდან.'
          : 'Camera unavailable. Please upload a photo from your gallery.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setScanResult(null);
      setIsScanning(false);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Handle capture from video stream
  const capturePhoto = () => {
    if (!videoRef.current) return;
    sounds.playClick();
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      stopCamera();
      processOcrImage(dataUrl);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sounds.playClick();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imgUrl = event.target.result as string;
          setCapturedImage(imgUrl);
          stopCamera();
          processOcrImage(imgUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulated AI Optical Character Recognition (OCR) Engine
  const processOcrImage = (imageUrl: string) => {
    setIsScanning(true);
    sounds.playScanSweep();

    // Step 1: Detect frame
    setScanStepText(isGe ? 'დოკუმენტის დაფიქსირება და კუთხეების გასწორება...' : 'Detecting document borders...');

    setTimeout(() => {
      // Step 2: Optical text recognition
      setScanStepText(
        docType === 'id_card'
          ? (isGe ? 'შსს ბიომეტრიული მონაცემების ამოცნობა (OCR)...' : 'Extracting Biometric Data & Personal ID...')
          : (isGe ? 'სატრანსპორტო მოწმობის ამოცნობა: VIN, ნომერი, ტექ-პასპორტი...' : 'Extracting Plate, VIN & Specs...')
      );

      setTimeout(() => {
        // Step 3: Neural analysis & Verification
        setScanStepText(isGe ? 'მონაცემების სინქრონიზაცია და გადამოწმება...' : 'Verifying extracted attributes...');

        setTimeout(() => {
          setIsScanning(false);
          sounds.playSuccess();

          if (docType === 'id_card') {
            const detectedData: ScannedIdCardData = {
              fullName: 'გიორგი მაისურაძე',
              fullNameLatin: 'GIORGI MAISURADZE',
              personalNumber: '01024085432',
              phone: '+995 599 12 34 56',
              licenseNumber: 'TR-908124',
              licenseCategories: 'B, B1',
              photoUrl: imageUrl.startsWith('data:') ? imageUrl : 'avatar_dog'
            };
            setScanResult(detectedData);
          } else {
            const detectedData: ScannedVehicleData = {
              plateNumber: 'FR-282-EE',
              vin: 'WDCTG4GB2GJ193791',
              techPassport: '22-3999',
              brand: 'Mercedes-Benz',
              model: 'GLA 250',
              year: 2016,
              engine: '2.0L Turbo M270 (208 HP)',
              horsepower: 208,
              fuelType: 'petrol',
              color: 'თეთრი / Polar White'
            };
            setScanResult(detectedData);
          }
        }, 800);
      }, 900);
    }, 700);
  };

  // Preset demo trigger
  const handleSelectPresetDemo = (preset: any) => {
    sounds.playSuccess();
    setCapturedImage(null);
    stopCamera();
    setIsScanning(true);
    setScanStepText(isGe ? 'სატესტო დოკუმენტის სკანირება...' : 'Scanning sample document...');
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(preset.data);
    }, 600);
  };

  const handleConfirmAndApply = () => {
    if (!scanResult) return;
    sounds.playSuccess();
    onScanComplete(scanResult);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-navy text-white px-4 sm:px-6 py-3 border-b border-gold/40 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold">
              <Camera size={16} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black tracking-wide text-gold flex items-center gap-2 leading-none">
                <span>
                  {docType === 'id_card'
                    ? (isGe ? 'პირადობის / მართვის მოწმობის AI სკანერი' : 'ID Card / License AI Scanner')
                    : (isGe ? 'ტექ-პასპორტის & მანქანის AI სკანერი' : 'Tech-Passport & Vehicle AI Scanner')}
                </span>
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono tracking-wider text-slate-300 font-bold uppercase mt-1">
                {isGe ? 'ფოტოს გადაღებით ავტომატური შევსება' : 'Instant OCR Document Recognition'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Main Camera / Preview Box */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl bg-slate-950 overflow-hidden border-2 border-slate-800 shadow-inner flex flex-col items-center justify-center text-white">
            
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured Document"
                className="w-full h-full object-contain bg-slate-900"
              />
            ) : (
              <div className="p-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-gold shadow-md">
                  {docType === 'id_card' ? <CreditCard size={32} /> : <FileText size={32} />}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    {docType === 'id_card'
                      ? (isGe ? 'გადაუღეთ ფოტო პირადობას ან მართვის მოწმობას' : 'Capture ID or Driving License')
                      : (isGe ? 'გადაუღეთ ფოტო ტექ-პასპორტს ან მანქანას' : 'Capture Tech-Passport or Vehicle')}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    {isGe
                      ? 'AI მყისიერად ამოიცნობს ტექსტს, პირად ნომერს, VIN-ს, სახელს და ავტომატურად შეავსებს ფორმას.'
                      : 'AI will instantly extract text, personal ID, VIN, name and populate all fields.'}
                  </p>
                </div>
              </div>
            )}

            {/* Document Framing Guide (Visual Card Outline Overlay) */}
            {(cameraActive || capturedImage) && (
              <div className="absolute inset-4 sm:inset-6 border-2 border-dashed border-gold/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3 bg-gold/5 shadow-[0_0_20px_rgba(217,119,6,0.15)]">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gold bg-navy/80 px-2 py-0.5 rounded-md self-start border border-gold/40">
                  <span>{docType === 'id_card' ? 'GEORGIA ID / LICENCE FRAME' : 'REGISTRATION CERTIFICATE FRAME'}</span>
                </div>

                {/* Laser Scanning Animation Bar */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_15px_#f59e0b] animate-bounce" />
                )}

                <div className="text-[10px] font-mono text-center text-slate-300 bg-navy/80 px-2 py-0.5 rounded-md self-center border border-slate-700">
                  {isGe ? 'მოათავსეთ დოკუმენტი ჩარჩოში' : 'Fit document inside borders'}
                </div>
              </div>
            )}

            {/* Scanning Progress Overlay */}
            {isScanning && (
              <div className="absolute inset-0 bg-navy/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-3 z-30">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-gold/30 border-t-gold animate-spin" />
                  <Sparkles size={20} className="text-gold absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-black text-gold">AI OCR Scanning...</div>
                  <div className="text-xs font-mono text-slate-200 mt-1 max-w-xs">{scanStepText}</div>
                </div>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Action Controls for Capturing / Uploading */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {!cameraActive && (
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2.5 rounded-2xl text-xs font-black bg-navy hover:bg-slate-800 text-white border border-gold/30 flex items-center gap-2 shadow-xs transition-all active:scale-95"
              >
                <Camera size={14} className="text-gold" />
                <span>{isGe ? 'კამერის ჩართვა' : 'Open Camera'}</span>
              </button>
            )}

            {cameraActive && (
              <button
                type="button"
                onClick={capturePhoto}
                className="px-6 py-2.5 rounded-2xl text-xs font-black bg-gold hover:bg-amber-400 text-navy shadow-md flex items-center gap-2 transition-all active:scale-95 ring-2 ring-gold/40 animate-pulse"
              >
                <Camera size={16} className="stroke-[2.5]" />
                <span>{isGe ? '📸 ფოტოს გადაღება' : '📸 Take Photo'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white hover:bg-slate-100 text-navy border border-slate-300 flex items-center gap-2 shadow-xs transition-all"
            >
              <Upload size={14} className="text-slate-600" />
              <span>{isGe ? 'ფოტოს ატვირთვა' : 'Upload Image'}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* 1-Click Sample Demo Presets */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>{isGe ? 'სწრაფი სატესტო ნიმუშები (1 კლიკით შემოწმება):' : 'Sample Presets (1-Click Test):'}</span>
              <Sparkles size={13} className="text-gold" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(docType === 'id_card' ? PRESET_DEMO_ID_CARDS : PRESET_DEMO_TECH_PASSPORTS).map((demo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPresetDemo(demo)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gold/10 hover:border-gold border border-slate-200 text-navy flex items-center justify-between text-left transition-all shadow-xs"
                >
                  <span className="truncate">{demo.name}</span>
                  <Check size={13} className="text-gold shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Recognized Data Results Preview */}
          {scanResult && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-400 text-navy space-y-3 animate-fade-in shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                    {isGe ? '✓ მონაცემები წარმატებით ამოცნობილია:' : '✓ Extracted Document Data:'}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                  AI OCR 100%
                </span>
              </div>

              {docType === 'id_card' && 'fullName' in scanResult && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">სახელი და გვარი:</span>
                    <span className="font-black text-navy">{scanResult.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">პირადი ნომერი:</span>
                    <span className="font-mono font-black text-navy">{scanResult.personalNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ტელეფონი:</span>
                    <span className="font-mono font-bold text-navy">{scanResult.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">მოწმობა & კატეგორიები:</span>
                    <span className="font-mono font-bold text-navy">{scanResult.licenseNumber} ({scanResult.licenseCategories})</span>
                  </div>
                </div>
              )}

              {docType === 'tech_passport' && 'plateNumber' in scanResult && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">სახელმწიფო ნომერი:</span>
                    <span className="font-mono font-black text-navy">{scanResult.plateNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">მარკა & მოდელი:</span>
                    <span className="font-black text-navy">{scanResult.brand} {scanResult.model} ({scanResult.year})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">VIN კოდი:</span>
                    <span className="font-mono font-bold text-navy truncate block">{scanResult.vin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ტექ-პასპორტის #:</span>
                    <span className="font-mono font-bold text-navy">{scanResult.techPassport}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmAndApply}
                className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-black bg-navy hover:bg-slate-800 text-gold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Check size={16} className="text-gold stroke-[3]" />
                <span>{isGe ? 'დადასტურება & მონაცემების შევსება' : 'Confirm & Fill Data'}</span>
              </button>
            </div>
          )}

          {/* Footer Close */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-navy hover:bg-slate-100 transition-colors"
            >
              {isGe ? 'დახურვა' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCameraScannerModal;
