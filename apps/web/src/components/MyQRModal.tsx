"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

type Props = { name: string; phone: string; onClose: () => void };

export default function MyQRModal({ name, phone, onClose }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    QRCode.toCanvas(ref.current, `paybuddy://pay?phone=${phone}`, {
      width: 280,
      margin: 2,
      color: { dark: "#111827", light: "#ffffff" },
    });
  }, [phone]);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-1">My QR Code</h2>
        <p className="text-sm text-gray-500 mb-4">Show this to receive money</p>
        <div className="bg-white p-3 rounded-xl border border-gray-200 inline-block">
          <canvas ref={ref} />
        </div>
        <div className="mt-4">
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">{phone}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}