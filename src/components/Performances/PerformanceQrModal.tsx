import { QRCodeSVG } from 'qrcode.react';

export function PerformanceQrModal({
  isOpen,
  onClose,
  qrCode,
}: {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string | null;
}) {
  if (!isOpen || !qrCode) return null;

  const qrUrl = `${window.location.origin}/qr/${qrCode}`;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 shadow-lg w-96'>
        <h2 className='text-xl font-semibold mb-4'>Código QR de la función</h2>
        <div className='flex justify-center mb-4'>
          <QRCodeSVG value={qrUrl} size={200} />
        </div>
        <p className='text-sm text-gray-600 break-all text-center'>{qrUrl}</p>
        <div className='mt-6 flex justify-end'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700'
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
