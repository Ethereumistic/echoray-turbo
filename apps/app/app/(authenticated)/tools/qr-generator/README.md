# QR Code Generator

A full-featured QR code generator that allows users to create, customize, save, and export QR codes.

## Features

- **Real-time QR Code Generation**: Generate QR codes as you type
- **Multiple Types**: Support for text, URL, email, phone, and WiFi QR codes
- **Customization**: Adjust size, error correction level, and colors
- **Export**: Download QR codes as PNG images
- **Database Storage**: Save QR codes to your account (data stored as text, not images)
- **User Management**: View, edit, and delete your saved QR codes

## Database Schema

The QR codes are stored using this Prisma model:

```prisma
model QrCode {
  id              String   @id @default(cuid())
  user            User?    @relation(fields: [userId], references: [id])
  userId          String
  title           String?  // Optional title for the QR code
  data            String   // The actual data encoded in the QR code
  qrType          String   @default("text")
  size            Int      @default(200)
  errorLevel      String   @default("M")
  foregroundColor String?  @default("#000000")
  backgroundColor String?  @default("#ffffff")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}
```

## Setup

1. **Run Database Migration**:
   ```bash
   pnpm migrate
   ```

2. **Dependencies Installed**:
   - **App**: `qrcode`, `@types/qrcode` - QR code generation
   - **API**: `zod` - Request validation

## API Routes

Located in `/apps/api/app/qr-codes/`:
- `GET /qr-codes` - Fetch user's QR codes
- `POST /qr-codes` - Create new QR code
- `DELETE /qr-codes/[id]` - Delete QR code

## Environment Variables

For production, set `NEXT_PUBLIC_API_URL` to your API microservice URL.
For development, it defaults to `http://localhost:3002`.

## Usage

1. Navigate to `/tools/qr-generator`
2. Enter your content in the form
3. Customize appearance settings
4. Preview the QR code in real-time
5. Save to database or export as PNG
6. Manage your saved QR codes from the sidebar

## Technical Details

- QR codes are generated client-side using the `qrcode` library
- Canvas API is used for PNG export functionality
- Data is stored as text strings, not images (no S3 bucket required)
- All operations are user-scoped and authenticated via Clerk
- Real-time preview with 300ms debouncing for performance 