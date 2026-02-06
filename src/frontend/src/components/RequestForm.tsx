import { useState } from 'react';
import { useSubmitRequest } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Music, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestForm({ open, onOpenChange }: RequestFormProps) {
  const [requestType, setRequestType] = useState<'song' | 'shoutout'>('song');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  
  const { mutate: submitRequest, isPending } = useSubmitRequest();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    submitRequest(
      {
        requestType,
        message: message.trim(),
        name: name.trim() || 'Anonymous',
      },
      {
        onSuccess: () => {
          toast.success('Request submitted successfully! 🎵', {
            description: 'Your request has been sent to the DJ.',
          });
          setMessage('');
          setName('');
          setRequestType('song');
          onOpenChange(false);
        },
        onError: (error) => {
          const errorMessage = error instanceof Error ? error.message : 'Failed to submit request';
          
          if (errorMessage.includes('coming soon')) {
            toast.info('Feature Coming Soon! 🚀', {
              description: 'Song requests will be available once the backend is ready.',
              duration: 5000,
            });
          } else {
            toast.error('Submission Failed', {
              description: errorMessage,
            });
          }
          
          console.error('Request submission error:', error);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-[500px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">Submit a Request</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm md:text-base">
            Send a song request or shout-out to Ma Walking Radio
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Request Type</Label>
              <RadioGroup
                value={requestType}
                onValueChange={(value) => setRequestType(value as 'song' | 'shoutout')}
                className="flex flex-col xs:flex-row gap-3 sm:gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="song" id="song" className="touch-manipulation" />
                  <Label htmlFor="song" className="flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                    <Music className="w-4 h-4" />
                    Song Request
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="shoutout" id="shoutout" className="touch-manipulation" />
                  <Label htmlFor="shoutout" className="flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                    <MessageCircle className="w-4 h-4" />
                    Shout-out
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm sm:text-base">Your Name (Optional)</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                disabled={isPending}
                className="text-sm sm:text-base h-10 sm:h-11 touch-manipulation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm sm:text-base">
                {requestType === 'song' ? 'Song Request' : 'Shout-out Message'}
              </Label>
              <Textarea
                id="message"
                placeholder={
                  requestType === 'song'
                    ? 'Enter the song title and artist...'
                    : 'Enter your shout-out message...'
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={500}
                disabled={isPending}
                required
                className="text-sm sm:text-base resize-none touch-manipulation min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                {message.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col xs:flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="w-full xs:w-auto text-sm sm:text-base h-10 sm:h-11 touch-manipulation order-2 xs:order-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !message.trim()}
              className="w-full xs:w-auto text-sm sm:text-base h-10 sm:h-11 touch-manipulation order-1 xs:order-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
