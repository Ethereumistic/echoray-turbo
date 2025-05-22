// Type declarations for Next.js modules

declare module 'next/link';
declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    refresh: () => void;
    back: () => void;
    forward: () => void;
  };
  
  export function useSearchParams(): {
    get: (key: string) => string | null;
    getAll: (key: string) => string[];
    has: (key: string) => boolean;
    forEach: (callback: (value: string, key: string) => void) => void;
    entries: () => IterableIterator<[string, string]>;
    keys: () => IterableIterator<string>;
    values: () => IterableIterator<string>;
  };
  
  export function usePathname(): string;
}

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