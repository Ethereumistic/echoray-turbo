import { Skeleton } from '@repo/design-system/components/ui/skeleton';

export default function QrGeneratorLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[400px]" />
      </div>
      
      {/* QR Generator specific content skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input form skeleton */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[60px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
          <Skeleton className="h-10 w-[140px]" />
        </div>
        
        {/* QR Code preview skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="aspect-square w-full max-w-[300px] rounded-lg" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>
    </div>
  );
} 