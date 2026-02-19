import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Venue } from '../backend';

const DEFAULT_RADIUS_MILES = 50;

export function useNearbyVenues(
  latitude: number | null,
  longitude: number | null,
  radiusMiles: number = DEFAULT_RADIUS_MILES
) {
  const { actor, isFetching } = useActor();

  return useQuery<Venue[]>({
    queryKey: ['venues', 'nearby', latitude, longitude, radiusMiles],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend not initialized');
      }

      if (latitude === null || longitude === null) {
        return [];
      }

      const venues = await actor.getVenuesByLocationSorted(latitude, longitude, radiusMiles);
      return venues;
    },
    enabled: !!actor && !isFetching && latitude !== null && longitude !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}

export function useVenueById(venueId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Venue | null>({
    queryKey: ['venue', venueId],
    queryFn: async () => {
      if (!actor || !venueId) return null;

      const allVenues = await actor.getApprovedVenues();
      return allVenues.find((v) => v.id === venueId) || null;
    },
    enabled: !!actor && !isFetching && !!venueId,
    staleTime: 1000 * 60 * 10,
  });
}

export interface VenueSubmission {
  name: string;
  description: string;
  street: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  contactInfo: string;
  phoneNumber: string;
  website: string;
  hoursOfOperation: string;
  venueType: string;
  musicGenre: string;
  amenities: string[];
  photoUrls: string[];
  eventSchedule: string;
  coverCharge: string;
}

export function useSubmitVenue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: VenueSubmission) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }

      const venue: Venue = {
        id: `venue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: submission.name,
        description: submission.description,
        address: {
          street: submission.street,
          city: submission.city,
          state: submission.state,
          country: submission.country,
          postal_code: '',
          latitude: submission.latitude,
          longitude: submission.longitude,
        },
        contact_info: submission.contactInfo,
        phone_number: submission.phoneNumber,
        website: submission.website,
        hours_of_operation: submission.hoursOfOperation,
        venue_type: submission.venueType,
        music_genre: submission.musicGenre,
        amenities: submission.amenities,
        amenities_string: submission.amenities.join(', '),
        is_family_friendly: submission.amenities.includes('Family Friendly'),
        rating: 0,
        submitted_by: '',
        date_submitted: BigInt(Date.now() * 1000000),
        last_modified: BigInt(Date.now() * 1000000),
        coordinator: '',
        venue_status: 'pending',
        approved: false,
        rejected: false,
        latitude: submission.latitude.toString(),
        longitude: submission.longitude.toString(),
        ac_logo: submission.photoUrls[0] || '',
        map_url: '',
        ven_map_url: '',
        dancing: submission.amenities.includes('Dance Floor') ? 'Yes' : 'No',
        weekly_events: submission.eventSchedule,
        cover_charge: submission.coverCharge,
        group_discount: '',
        highlight_quote: '',
        event_calendar: submission.eventSchedule,
        drink_discounts: '',
        kitchen: submission.amenities.includes('Kitchen') ? 'Yes' : 'No',
      };

      await actor.submitVenue(venue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}

export function usePendingVenues(enabled: boolean = true) {
  const { actor, isFetching } = useActor();

  return useQuery<Venue[]>({
    queryKey: ['venues', 'pending'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend not initialized');
      }

      return actor.getPendingVenues();
    },
    enabled: !!actor && !isFetching && enabled,
    staleTime: 1000 * 60,
    retry: false,
  });
}

export function useAllVenues(enabled: boolean = true) {
  const { actor, isFetching } = useActor();

  return useQuery<Venue[]>({
    queryKey: ['venues', 'all'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Backend not initialized');
      }

      return actor.getAllVenues();
    },
    enabled: !!actor && !isFetching && enabled,
    staleTime: 1000 * 60,
    retry: false,
  });
}

export function useApproveVenue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venueId: string) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }

      await actor.approveVenue(venueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}

export function useRejectVenue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venueId: string) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }

      await actor.rejectVenue(venueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}

export function useUpdateVenue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ venueId, venue }: { venueId: string; venue: Venue }) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }

      await actor.updateVenue(venueId, venue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}

export function useRemoveVenue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venueId: string) => {
      if (!actor) {
        throw new Error('Backend connection not available');
      }

      await actor.removeVenue(venueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}
