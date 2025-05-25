import type { ReactNode } from 'react';

interface ToolsLayoutProps {
  children: ReactNode;
}

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      {children}
    </div>
  );
} 