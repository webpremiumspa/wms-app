import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, CameraOff } from 'lucide-react';

type Props = {
  onScan: (text: string) => void;
  paused?: boolean; // pausa el escaneo mientras el padre procesa el resultado
};

const REGION_ID = 'qr-scanner-region';

export function QRScanner({ onScan, paused = false }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    const scanner = new Html5Qrcode(REGION_ID, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    scannerRef.current = scanner;

    let stopped = false;
    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1 },
        (text) => {
          if (!stopped) onScanRef.current(text);
        },
        () => {
          // ignore per-frame decode failures
        },
      )
      .then(() => setRunning(true))
      .catch((err) => {
        setError(err?.message || 'No se pudo acceder a la cámara');
      });

    return () => {
      stopped = true;
      if (scanner.isScanning) {
        scanner.stop().catch(() => {}).finally(() => scanner.clear());
      } else {
        scanner.clear();
      }
    };
  }, []);

  // Pausar/reanudar cuando el padre necesita procesar un resultado.
  useEffect(() => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    if (paused && scanner.isScanning) scanner.pause(true);
    else if (!paused && scanner.isScanning) scanner.resume();
  }, [paused]);

  return (
    <div className="space-y-2">
      <div
        id={REGION_ID}
        className="mx-auto w-full max-w-sm overflow-hidden rounded-xl bg-black"
        style={{ aspectRatio: '1 / 1' }}
      />
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        {error ? (
          <span className="text-red-600"><CameraOff size={14} className="inline" /> {error}</span>
        ) : running ? (
          <span><Camera size={14} className="inline" /> Apunta al código QR del albarán</span>
        ) : (
          <span>Activando cámara…</span>
        )}
      </div>
    </div>
  );
}
