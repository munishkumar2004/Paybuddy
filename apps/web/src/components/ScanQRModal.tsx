"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Props = { onScan: (phone: string) => void; onClose: () => void };

export default function ScanQRModal({ onScan, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader-region");
    scannerRef.current = scanner;

    if (startedRef.current) return;
    startedRef.current = true;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          let phone = "";
          try {
            if (text.startsWith("paybuddy://")) {
              const url = new URL(text.replace("paybuddy://", "https://"));
              phone = url.searchParams.get("phone") || "";
            } else if (/^\d{10}$/.test(text)) {
              phone = text;
            }
          } catch {}
          if (phone) stop().then(() => onScan(phone));
          else alert("Invalid QR");
        },
        () => {}
      )
      .catch(() => {
        alert("Camera error");
        onClose();
      });

    return () => {
      stop();
    };
  }, []);

  const stop = async () => {
    const s = scannerRef.current;
    if (!s) return;
    try {
      await s.stop();
      s.clear();
    } catch {}
    scannerRef.current = null;
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={async () => {
        await stop();
        onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl p-4 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">
          Scan QR Code
        </h2>
        <div
          id="qr-reader-region"
          className="rounded-xl overflow-hidden bg-black"
          style={{ minHeight: "280px" }}
        />
        <button
          onClick={async () => {
            await stop();
            onClose();
          }}
          className="mt-4 w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}