import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  url?: string;
}

export function ShareButton({ variant = 'outline', size = 'sm', className, url }: ShareButtonProps) {
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;

  const shareData = {
    title: 'Mawalking Radio',
    text: 'Listen to live Rhumba music on Mawalking Radio!',
    url: shareUrl,
  };

  const handleShare = async () => {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success('Thanks for sharing! 🎵');
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Share failed:', error);
          setShowFallbackModal(true);
        }
      }
    } else {
      setShowFallbackModal(true);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      toast.success('Link copied to clipboard! 📋');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy link');
    }
  };

  return (
    <>
      <Button
        onClick={handleShare}
        variant={variant}
        size={size}
        className={className}
      >
        <Share2 className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Share</span>
      </Button>

      <Dialog open={showFallbackModal} onOpenChange={setShowFallbackModal}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-[500px] bg-card backdrop-blur-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl md:text-2xl">Share Mawalking Radio</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm md:text-base">
              Copy the link below to share with your friends
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="space-y-2">
              <Label htmlFor="share-url" className="text-sm sm:text-base">App Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={shareData.url}
                  readOnly
                  className="flex-1 text-xs sm:text-sm h-10 sm:h-11 touch-manipulation"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  onClick={handleCopyToClipboard}
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 touch-manipulation"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Link copied to clipboard!
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
