import { useState } from 'react';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  usePendingVenues,
  useAllVenues,
  useApproveVenue,
  useRejectVenue,
  useRemoveVenue,
} from '@/hooks/useVenueQueries';
import { useAdminRole } from '@/hooks/useAdminRole';
import type { Venue } from '../backend';
import { toast } from 'sonner';

interface AdminVenuesScreenProps {
  onBack: () => void;
}

export default function AdminVenuesScreen({ onBack }: AdminVenuesScreenProps) {
  const { isAdmin, isLoading: adminLoading } = useAdminRole();
  const { data: pendingVenues, isLoading: pendingLoading } = usePendingVenues(isAdmin);
  const { data: allVenues, isLoading: allLoading } = useAllVenues(isAdmin);
  const approveMutation = useApproveVenue();
  const rejectMutation = useRejectVenue();
  const removeMutation = useRemoveVenue();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | 'remove' | null;
    venueId: string | null;
    venueName: string | null;
  }>({
    open: false,
    action: null,
    venueId: null,
    venueName: null,
  });

  const approvedVenues = allVenues?.filter((v) => v.venue_status === 'approved') || [];

  const handleAction = (
    action: 'approve' | 'reject' | 'remove',
    venueId: string,
    venueName: string
  ) => {
    setConfirmDialog({
      open: true,
      action,
      venueId,
      venueName,
    });
  };

  const executeAction = async () => {
    if (!confirmDialog.venueId || !confirmDialog.action) return;

    try {
      if (confirmDialog.action === 'approve') {
        await approveMutation.mutateAsync(confirmDialog.venueId);
        toast.success('Venue approved successfully');
      } else if (confirmDialog.action === 'reject') {
        await rejectMutation.mutateAsync(confirmDialog.venueId);
        toast.success('Venue rejected');
      } else if (confirmDialog.action === 'remove') {
        await removeMutation.mutateAsync(confirmDialog.venueId);
        toast.success('Venue removed');
      }
    } catch (error) {
      toast.error('Action failed. Please try again.');
    } finally {
      setConfirmDialog({ open: false, action: null, venueId: null, venueName: null });
    }
  };

  const VenueCard = ({ venue, isPending }: { venue: Venue; isPending: boolean }) => (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white text-lg">{venue.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-white/70 text-sm space-y-1">
          <p>
            {venue.address.street}, {venue.address.city}, {venue.address.state}
          </p>
          <p>Type: {venue.venue_type}</p>
          <p>Submitted: {new Date(Number(venue.date_submitted) / 1000000).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          {isPending ? (
            <>
              <Button
                size="sm"
                onClick={() => handleAction('approve', venue.id, venue.name)}
                disabled={approveMutation.isPending}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleAction('reject', venue.id, venue.name)}
                disabled={rejectMutation.isPending}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/20"
                disabled
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleAction('remove', venue.id, venue.name)}
                disabled={removeMutation.isPending}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Show access denied if not admin
  if (!adminLoading && !isAdmin) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden pb-fixed-bottom-ui">
        <header className="w-full py-4 px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-white/10 pt-safe">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">Manage Venues</h1>
          </div>
        </header>

        <main className="px-4 sm:px-6 py-6">
          <div className="max-w-2xl mx-auto">
            <Alert className="bg-white/10 border-white/20 backdrop-blur-md">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <AlertTitle className="text-white text-lg">Access Denied</AlertTitle>
              <AlertDescription className="text-white/70 mt-2">
                You do not have permission to access this page. Admin privileges are required to manage venue submissions.
              </AlertDescription>
              <div className="mt-4">
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="bg-white/5 hover:bg-white/10 text-white border-white/20"
                >
                  Return to Settings
                </Button>
              </div>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden pb-fixed-bottom-ui">
      <header className="w-full py-4 px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-white/10 pt-safe">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-white">Manage Venues</h1>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10">
              <TabsTrigger value="pending" className="data-[state=active]:bg-accent">
                Pending ({pendingVenues?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-accent">
                Approved ({approvedVenues.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
              )}

              {!pendingLoading && (!pendingVenues || pendingVenues.length === 0) && (
                <Alert className="bg-white/10 border-white/20 backdrop-blur-md">
                  <AlertDescription className="text-white">
                    No pending venue submissions.
                  </AlertDescription>
                </Alert>
              )}

              {!pendingLoading &&
                pendingVenues &&
                pendingVenues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} isPending={true} />
                ))}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-4">
              {allLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
              )}

              {!allLoading && approvedVenues.length === 0 && (
                <Alert className="bg-white/10 border-white/20 backdrop-blur-md">
                  <AlertDescription className="text-white">
                    No approved venues yet.
                  </AlertDescription>
                </Alert>
              )}

              {!allLoading &&
                approvedVenues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} isPending={false} />
                ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, action: null, venueId: null, venueName: null })}>
        <AlertDialogContent className="bg-card border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {confirmDialog.action === 'approve' && 'Approve Venue'}
              {confirmDialog.action === 'reject' && 'Reject Venue'}
              {confirmDialog.action === 'remove' && 'Remove Venue'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {confirmDialog.action === 'approve' &&
                `Are you sure you want to approve "${confirmDialog.venueName}"? It will be visible to all users.`}
              {confirmDialog.action === 'reject' &&
                `Are you sure you want to reject "${confirmDialog.venueName}"? This action can be reversed later.`}
              {confirmDialog.action === 'remove' &&
                `Are you sure you want to permanently remove "${confirmDialog.venueName}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAction}
              className={
                confirmDialog.action === 'remove'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : 'bg-accent hover:bg-accent/90 text-accent-foreground'
              }
            >
              {confirmDialog.action === 'approve' && 'Approve'}
              {confirmDialog.action === 'reject' && 'Reject'}
              {confirmDialog.action === 'remove' && 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
