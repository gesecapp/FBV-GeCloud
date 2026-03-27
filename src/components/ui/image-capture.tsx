import { Camera, Contrast, FlipHorizontal, Lightbulb, MoveVertical, ScanFace, Sun, X, Zap, ZoomIn } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { compressImageToBase64 } from '@/lib/image-compression';

// --- Slider Control ---

function CaptureSlider({
  icon,
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (_value: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));

  function handleTrackInteraction(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
    const ratio = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    onChange(clamp(min + ratio * (max - min)));
  }

  const fillPercent = ((value - min) / (max - min)) * 100;

  return (
    <div data-slot="capture-slider" className="flex min-h-0 flex-1 flex-col items-center gap-1">
      <div className="text-white [&_svg]:size-4 sm:[&_svg]:size-5">{icon}</div>

      {/* Increment button */}
      <button
        aria-label={`${label} aumentar`}
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/20 text-sm text-white transition-colors active:bg-white/50 sm:size-8"
        onClick={() => onChange(clamp(value + step))}
        type="button"
      >
        +
      </button>

      {/* Clickable / tappable track */}
      <div
        ref={trackRef}
        aria-label={label}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={value}
        className="relative min-h-0 flex-1 w-5 cursor-pointer rounded-full bg-white/20 sm:w-6"
        onClick={handleTrackInteraction}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') onChange(clamp(value + step));
          else if (e.key === 'ArrowDown') onChange(clamp(value - step));
        }}
        onTouchEnd={handleTrackInteraction}
        role="slider"
        tabIndex={0}
      >
        {/* Fill */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full bg-white/60 transition-all duration-100"
          style={{ height: `${fillPercent}%` }}
        />
        {/* Thumb */}
        <div
          className="pointer-events-none absolute left-1/2 size-4 -translate-x-1/2 rounded-full bg-white shadow-md transition-all duration-100 sm:size-5"
          style={{ bottom: `calc(${fillPercent}% - 8px)` }}
        />
      </div>

      {/* Decrement button */}
      <button
        aria-label={`${label} diminuir`}
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/20 text-sm text-white transition-colors active:bg-white/50 sm:size-8"
        onClick={() => onChange(clamp(value - step))}
        type="button"
      >
        −
      </button>
    </div>
  );
}

// --- Camera Capture Dialog ---

function CameraCaptureDialog({ open, onClose, onCapture }: CameraCaptureDialogProps) {
  const [zoom, setZoom] = useState(1);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const [brightnessFilter, setBrightnessFilter] = useState(100);
  const [wdrLevel, setWdrLevel] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceDetectorRef = useRef<FaceDetectorInstance | null>(null);

  const [faceDetectorSupported, setFaceDetectorSupported] = useState(false);
  const [faceBounds, setFaceBounds] = useState<FaceBounds | null>(null);
  const [brightnessValue, setBrightnessValue] = useState(100);
  const [faceQuality, setFaceQuality] = useState<FaceQuality>({
    isCentered: false,
    hasGoodLighting: true,
    noBacklight: true,
    faceDetected: false,
  });

  // Initialize FaceDetector if supported
  useEffect(() => {
    const FaceDetectorClass = (window as unknown as { FaceDetector: FaceDetectorConstructor }).FaceDetector;
    if (FaceDetectorClass) {
      try {
        faceDetectorRef.current = new FaceDetectorClass({
          fastMode: true,
          maxDetectedFaces: 1,
        });
        setFaceDetectorSupported(true);
      } catch {
        setFaceDetectorSupported(false);
      }
    }
  }, []);

  const detectFace = useCallback(async () => {
    if (!videoRef.current || !streamRef.current || !faceDetectorRef.current) return;

    const video = videoRef.current;
    if (video.readyState !== 4) return;

    try {
      const faces = await faceDetectorRef.current.detect(video);

      if (faces.length > 0) {
        const face = faces[0];
        const box = face.boundingBox;

        const bounds: FaceBounds = {
          x: (box.x / video.videoWidth) * 100,
          y: (box.y / video.videoHeight) * 100,
          width: (box.width / video.videoWidth) * 100,
          height: (box.height / video.videoHeight) * 100,
        };

        setFaceBounds(bounds);

        // Center check
        const faceCenterX = bounds.x + bounds.width / 2;
        const faceCenterY = bounds.y + bounds.height / 2;
        const isCentered = faceCenterX > 30 && faceCenterX < 70 && faceCenterY > 25 && faceCenterY < 75;
        const faceArea = bounds.width * bounds.height;
        const isGoodSize = faceArea > 200 && faceArea < 4000;

        setFaceQuality((prev) => ({
          ...prev,
          faceDetected: true,
          isCentered: isCentered && isGoodSize,
        }));
      } else {
        setFaceBounds(null);
        setFaceQuality((prev) => ({
          ...prev,
          faceDetected: false,
          isCentered: false,
        }));
      }
    } catch {
      // Silently fail face detection
    }
  }, []);

  const analyzeFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let totalBrightness = 0;
    let centerBrightness = 0;
    let edgeBrightness = 0;
    let centerPixels = 0;
    let edgePixels = 0;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const centerRadius = Math.min(canvas.width, canvas.height) * 0.25;

    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const x = pixelIndex % canvas.width;
      const y = Math.floor(pixelIndex / canvas.width);
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      totalBrightness += brightness;

      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      if (distFromCenter < centerRadius) {
        centerBrightness += brightness;
        centerPixels++;
      } else {
        edgeBrightness += brightness;
        edgePixels++;
      }
    }

    const avgBrightness = totalBrightness / (data.length / 4);
    const avgCenterBrightness = centerPixels > 0 ? centerBrightness / centerPixels : 0;
    const avgEdgeBrightness = edgePixels > 0 ? edgeBrightness / edgePixels : 0;

    const hasBacklight = avgEdgeBrightness > avgCenterBrightness * 1.3;
    const hasGoodLighting = avgBrightness > 80 && avgBrightness < 200;

    setFaceQuality((prev) => ({
      ...prev,
      hasGoodLighting,
      noBacklight: !hasBacklight,
    }));
    setBrightnessValue(Math.round(avgBrightness));

    if (faceDetectorSupported) {
      detectFace();
    }
  }, [faceDetectorSupported, detectFace]);

  useEffect(() => {
    if (open) {
      const interval = setInterval(analyzeFrame, 1000);
      return () => clearInterval(interval);
    }
    return () => {};
  }, [open, analyzeFrame]);

  const startCamera = useCallback(async () => {
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (_err) {
      onClose();
    }
  }, [facingMode, onClose]);

  const stopCamera = useCallback(() => {
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (open) startCamera();
    else stopCamera();
    return stopCamera;
  }, [open, startCamera, stopCamera]);

  async function handleCapture() {
    const video = videoRef.current;
    if (!video) return;

    try {
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      const targetAspectRatio = 3 / 4;
      let sourceWidth: number;
      let sourceHeight: number;

      if (vw / vh > targetAspectRatio) {
        sourceHeight = vh / zoom;
        sourceWidth = sourceHeight * targetAspectRatio;
      } else {
        sourceWidth = vw / zoom;
        sourceHeight = sourceWidth / targetAspectRatio;
      }

      const sourceX = (vw - sourceWidth) / 2;
      const verticalSlack = vh - sourceHeight;
      const sourceY = Math.max(0, Math.min(verticalSlack / 2 + (verticalOffset / 100) * vh, vh - sourceHeight));

      let outputWidth = sourceWidth;
      let outputHeight = sourceHeight;
      const maxDim = 1024;
      if (outputWidth > maxDim || outputHeight > maxDim) {
        if (outputWidth > outputHeight) {
          outputHeight = (outputHeight / outputWidth) * maxDim;
          outputWidth = maxDim;
        } else {
          outputWidth = (outputWidth / outputHeight) * maxDim;
          outputHeight = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.filter = `brightness(${brightnessFilter}%) contrast(${100 + wdrLevel * 0.3}%) saturate(${100 + wdrLevel * 0.1}%)`;

      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const compressed = await compressImageToBase64(rawDataUrl);
      onCapture(compressed);
      onClose();
    } catch (_e) {
      onClose();
    }
  }

  const isMirrored = facingMode === 'user';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent showCloseButton={false} className="flex! h-[min(90vh,800px)] max-w-150 flex-col gap-0 overflow-hidden border-none bg-black p-0 shadow-lg sm:min-w-fit!">
        <DialogHeader className="relative z-30 flex shrink-0 flex-row items-center justify-between bg-black/40 px-3 py-2 text-white backdrop-blur-md sm:px-4 sm:py-3">
          <DialogTitle className="font-medium text-sm text-white sm:text-lg">Capturar Foto</DialogTitle>
          <button onClick={onClose} className="cursor-pointer rounded-full p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white active:scale-95" type="button">
            <X className="size-5 sm:size-6" />
          </button>
          <DialogDescription className="sr-only">Posicione seu rosto na área indicada e capture a foto</DialogDescription>
        </DialogHeader>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{
              transform: `${isMirrored ? 'scaleX(-1)' : ''} scale(${zoom}) translateY(${-verticalOffset}%)`,
              filter: `brightness(${brightnessFilter}%) contrast(${100 + wdrLevel * 0.3}%) saturate(${100 + wdrLevel * 0.1}%)`,
            }}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Status indicators */}
          <div className="absolute top-[18px] left-3 z-20 flex flex-col gap-2">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1 font-medium text-[11px] backdrop-blur-md transition-colors duration-300 ${
                faceQuality.hasGoodLighting ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'
              }`}
            >
              <Sun size={14} />
              Iluminação: {brightnessValue > 150 ? 'Alta' : brightnessValue > 80 ? 'Boa' : 'Baixa'}
            </div>

            {!faceQuality.noBacklight && (
              <div className="flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1 font-medium text-[11px] text-orange-500 backdrop-blur-md">
                <Zap size={14} />
                Luz de fundo detectada
              </div>
            )}

            {faceDetectorSupported && (
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1 font-medium text-[11px] backdrop-blur-md transition-colors duration-300 ${
                  faceQuality.faceDetected ? (faceQuality.isCentered ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500') : 'bg-orange-500/20 text-orange-500'
                }`}
              >
                <ScanFace size={14} />
                {faceQuality.faceDetected ? (faceQuality.isCentered ? 'Face centralizada ✓' : 'Centralize a face') : 'Procurando face...'}
              </div>
            )}
          </div>

          {/* Auto-detected face box */}
          {faceBounds && faceDetectorSupported && (
            <div
              className={`pointer-events-none absolute z-10 rounded-lg border-2 transition-all duration-100 ${
                faceQuality.isCentered ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
              }`}
              style={{
                left: `${100 - faceBounds.x - faceBounds.width}%`,
                top: `${faceBounds.y}%`,
                width: `${faceBounds.width}%`,
                height: `${faceBounds.height}%`,
              }}
            />
          )}

          {/* Capture frame 3:4 */}
          <div className="pointer-events-none absolute inset-0 z-6 flex items-center justify-center overflow-hidden">
            <div className="relative aspect-3/4 max-h-[calc(100%-32px)] w-[calc(100%-32px)] rounded-xl border-2 border-white/30">
              {/* Corner markers */}
              <div className="absolute -top-px -left-px size-6 rounded-tl-xl border-white/50 border-t-[3px] border-l-[3px]" />
              <div className="absolute -top-px -right-px size-6 rounded-tr-xl border-white/50 border-t-[3px] border-r-[3px]" />
              <div className="absolute -bottom-px -left-px size-6 rounded-bl-xl border-white/50 border-b-[3px] border-l-[3px]" />
              <div className="absolute -right-px -bottom-px size-6 rounded-br-xl border-white/50 border-r-[3px] border-b-[3px]" />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 z-5 flex items-center justify-center">
            <div
              className={`aspect-3/4 w-[min(calc((100%-32px)*0.70),calc((100dvh-100px)*0.75*0.70))] rounded-[50%] border-2 border-dashed transition-colors duration-300 ${
                faceQuality.isCentered && faceQuality.hasGoodLighting && faceQuality.noBacklight ? 'border-green-500' : 'border-white/30'
              }`}
              style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)' }}
            />
          </div>

          {/* Sliders */}
          <div className="absolute top-1/2 right-1 z-20 flex h-[55%] -translate-y-1/2 flex-col justify-between gap-1 overflow-hidden rounded-2xl bg-black/60 px-1 py-3 backdrop-blur-md sm:right-3 sm:h-[65%] sm:gap-2 sm:px-1.5 sm:py-4">
            <CaptureSlider icon={<ZoomIn />} label="Zoom" max={3} min={1} onChange={setZoom} step={0.1} value={zoom} />
            <CaptureSlider icon={<MoveVertical />} label="Posição" max={50} min={-50} onChange={setVerticalOffset} step={1} value={verticalOffset} />
            <CaptureSlider icon={<Lightbulb />} label="Brilho" max={150} min={50} onChange={setBrightnessFilter} step={5} value={brightnessFilter} />
            <CaptureSlider icon={<Contrast />} label="WDR" max={100} min={0} onChange={setWdrLevel} step={10} value={wdrLevel} />
          </div>

          {/* Bottom Actions */}
          <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center justify-center sm:bottom-8">
            <div className="relative flex items-center justify-center">
              {/* Capture button */}
              <button
                className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 sm:size-16"
                onClick={handleCapture}
                type="button"
              >
                <Camera className="size-7 text-black sm:size-8" />
              </button>

              {/* Flip camera button */}
              <button
                className="absolute left-[calc(100%+1.5rem)] flex size-10 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 sm:left-[calc(100%+2rem)] sm:size-12"
                onClick={() => setFacingMode((p) => (p === 'user' ? 'environment' : 'user'))}
                type="button"
              >
                <FlipHorizontal className="size-5 text-black sm:size-6" />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { CameraCaptureDialog };

// --- Types ---

interface CameraCaptureDialogProps {
  open: boolean;
  onClose: () => void;
  onCapture: (_image: string) => void;
}

interface DetectedFace {
  boundingBox: DOMRectReadOnly;
}

interface FaceDetectorInstance {
  detect: (_image: HTMLVideoElement | HTMLCanvasElement | ImageBitmap) => Promise<DetectedFace[]>;
}

type FaceDetectorConstructor = new (_options?: { fastMode?: boolean; maxDetectedFaces?: number }) => FaceDetectorInstance;

interface FaceBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FaceQuality {
  isCentered: boolean;
  hasGoodLighting: boolean;
  noBacklight: boolean;
  faceDetected: boolean;
}
