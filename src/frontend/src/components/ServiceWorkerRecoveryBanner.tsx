import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ServiceWorkerRecoveryBannerProps {
  onReload: () => void;
  onReset: () => void;
  isResetting?: boolean;
  hasError?: boolean;
}

export function ServiceWorkerRecoveryBanner({ 
  onReload, 
  onReset,
  isResetting = false,
  hasError = false
}: ServiceWorkerRecoveryBannerProps) {
  const title = hasError ? 'App Load Error' : 'App Update Available';
  const description = hasError 
    ? 'The app failed to load properly. Please refresh or reset to fix the issue.'
    : 'A new version of the app is available. Please refresh to load the latest version.';

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto">
      <Alert className="bg-white/95 backdrop-blur-md border-orange-500/50 shadow-2xl">
        <AlertCircle className="h-5 w-5 text-orange-600" />
        <AlertTitle className="text-orange-900 font-semibold text-base">
          {title}
        </AlertTitle>
        <AlertDescription className="text-gray-700 space-y-3 mt-2">
          <p className="text-sm">
            {description}
          </p>
          <div className="flex flex-col xs:flex-row gap-2">
            <Button
              onClick={onReload}
              disabled={isResetting}
              className="bg-orange-600 hover:bg-orange-700 text-white flex-1 xs:flex-none touch-manipulation"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Now
            </Button>
            <Button
              onClick={onReset}
              disabled={isResetting}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50 flex-1 xs:flex-none touch-manipulation"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isResetting ? 'Resetting...' : 'Reset & Refresh'}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
