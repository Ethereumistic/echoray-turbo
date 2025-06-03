import { QrGeneratorClient } from './qr-generator-client';

export default function QrGeneratorPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">QR Code Generator</h1>
        <p className="text-muted-foreground">
          Generate and export QR codes for URLs, text, and more. All generated QR codes are saved to your account.
        </p>
      </div>
      
      <QrGeneratorClient />
    </div>
  );
} 