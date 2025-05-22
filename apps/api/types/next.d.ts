// Type declarations for Next.js modules

declare module 'next/server' {
  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string, init?: ResponseInit): NextResponse;
    static rewrite(destination: string, init?: ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
  }
}

declare module '@clerk/nextjs' {
  export function auth(): { userId: string | null };
} 