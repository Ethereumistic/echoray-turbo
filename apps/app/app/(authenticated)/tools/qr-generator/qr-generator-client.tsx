'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { DownloadIcon, SaveIcon, ShareIcon, Trash2Icon } from 'lucide-react';
import QRCode from 'qrcode';

interface QrCodeData {
  id?: string;
  title: string;
  data: string;
  qrType: string;
  size: number;
  errorLevel: string;
  foregroundColor: string;
  backgroundColor: string;
  createdAt?: string;
}

interface SavedQrCode extends QrCodeData {
  id: string;
  createdAt: string;
}

export function QrGeneratorClient() {
  const { userId, getToken } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [qrData, setQrData] = useState<QrCodeData>({
    title: '',
    data: '',
    qrType: 'text',
    size: 200,
    errorLevel: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
  });
  
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [savedQrCodes, setSavedQrCodes] = useState<SavedQrCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Helper function to get authenticated headers
  const getAuthHeaders = async () => {
    const token = await getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  // Generate QR code
  const generateQrCode = useCallback(async () => {
    if (!qrData.data.trim()) {
      setQrCodeUrl('');
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const options = {
        width: qrData.size,
        errorCorrectionLevel: qrData.errorLevel as 'L' | 'M' | 'Q' | 'H',
        color: {
          dark: qrData.foregroundColor,
          light: qrData.backgroundColor,
        },
      };

      await QRCode.toCanvas(canvas, qrData.data, options);
      const dataUrl = canvas.toDataURL('image/png');
      setQrCodeUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      });
    }
  }, [qrData, toast]);

  // Auto-generate QR code when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      generateQrCode();
    }, 300); // Debounce for 300ms
    return () => clearTimeout(timer);
  }, [generateQrCode]);

  // Save QR code to database
  const saveQrCode = async () => {
    if (!userId || !qrData.data.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter data for the QR code',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/qr-codes`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          ...qrData,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save QR code');
      }

      const savedQrCode = await response.json();
      setSavedQrCodes(prev => [savedQrCode, ...prev]);
      
      toast({
        title: 'Success',
        description: 'QR code saved successfully',
      });
    } catch (error) {
      console.error('Error saving QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to save QR code',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Export QR code as PNG
  const exportQrCode = () => {
    if (!qrCodeUrl) {
      toast({
        title: 'Error',
        description: 'No QR code to export',
        variant: 'destructive',
      });
      return;
    }

    const link = document.createElement('a');
    link.download = `qr-code-${qrData.title || 'untitled'}-${Date.now()}.png`;
    link.href = qrCodeUrl;
    link.click();

    toast({
      title: 'Success',
      description: 'QR code exported successfully',
    });
  };

  // Load saved QR codes when userId becomes available
  useEffect(() => {
    const loadSavedQrCodes = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/qr-codes?userId=${userId}`, {
          headers,
          credentials: 'include',
        });
        if (response.ok) {
          const codes = await response.json();
          setSavedQrCodes(codes);
        }
      } catch (error) {
        console.error('Error loading saved QR codes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadSavedQrCodes();
    }
  }, [userId]);

  // Delete saved QR code
  const deleteQrCode = async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/qr-codes/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete QR code');
      }

      setSavedQrCodes(prev => prev.filter(code => code.id !== id));
      toast({
        title: 'Success',
        description: 'QR code deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete QR code',
        variant: 'destructive',
      });
    }
  };

  // Load saved QR code into form
  const loadQrCode = (savedCode: SavedQrCode) => {
    setQrData({
      title: savedCode.title,
      data: savedCode.data,
      qrType: savedCode.qrType,
      size: savedCode.size,
      errorLevel: savedCode.errorLevel,
      foregroundColor: savedCode.foregroundColor,
      backgroundColor: savedCode.backgroundColor,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generate QR Code</CardTitle>
          <CardDescription>
            Configure your QR code settings and preview in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              placeholder="My QR Code"
              value={qrData.title}
              onChange={(e) => setQrData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qrType">Type</Label>
            <Select
              value={qrData.qrType}
              onValueChange={(value) => setQrData(prev => ({ ...prev, qrType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="wifi">WiFi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Content</Label>
            <Textarea
              id="data"
              placeholder="Enter the text, URL, or data for your QR code..."
              value={qrData.data}
              onChange={(e) => setQrData(prev => ({ ...prev, data: e.target.value }))}
              className="min-h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Size (px)</Label>
              <Input
                id="size"
                type="number"
                min="100"
                max="500"
                value={qrData.size}
                onChange={(e) => setQrData(prev => ({ ...prev, size: parseInt(e.target.value) || 200 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="errorLevel">Error Correction</Label>
              <Select
                value={qrData.errorLevel}
                onValueChange={(value) => setQrData(prev => ({ ...prev, errorLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Low (7%)</SelectItem>
                  <SelectItem value="M">Medium (15%)</SelectItem>
                  <SelectItem value="Q">Quartile (25%)</SelectItem>
                  <SelectItem value="H">High (30%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="foregroundColor">Foreground Color</Label>
              <div className="flex gap-2">
                <Input
                  id="foregroundColor"
                  type="color"
                  value={qrData.foregroundColor}
                  onChange={(e) => setQrData(prev => ({ ...prev, foregroundColor: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={qrData.foregroundColor}
                  onChange={(e) => setQrData(prev => ({ ...prev, foregroundColor: e.target.value }))}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={qrData.backgroundColor}
                  onChange={(e) => setQrData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={qrData.backgroundColor}
                  onChange={(e) => setQrData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={saveQrCode} disabled={isSaving || !qrData.data.trim()}>
              <SaveIcon className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save QR Code'}
            </Button>
            <Button variant="outline" onClick={exportQrCode} disabled={!qrCodeUrl}>
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export PNG
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview and Saved QR Codes Section */}
      <div className="space-y-6">
        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="border rounded-lg p-4 bg-white">
              <canvas
                ref={canvasRef}
                className="max-w-full"
                style={{ 
                  width: qrData.size, 
                  height: qrData.size,
                  imageRendering: 'pixelated' 
                }}
              />
            </div>
            {qrData.data && (
              <p className="text-sm text-muted-foreground text-center break-all">
                {qrData.data}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Saved QR Codes */}
        <Card>
          <CardHeader>
            <CardTitle>Saved QR Codes</CardTitle>
            <CardDescription>
              Your previously generated QR codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : savedQrCodes.length === 0 ? (
              <p className="text-muted-foreground">No saved QR codes yet</p>
            ) : (
              <div className="space-y-3">
                {savedQrCodes.map((code) => (
                  <div
                    key={code.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">
                          {code.title || 'Untitled'}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {code.qrType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {code.data}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(code.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadQrCode(code)}
                      >
                        <ShareIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteQrCode(code.id)}
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 