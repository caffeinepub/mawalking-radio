import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_header {
    value: string;
    name: string;
}
export interface Address {
    latitude: number;
    street: string;
    country: string;
    city: string;
    postal_code?: string;
    state: string;
    longitude: number;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface PushSubscription {
    endpoint: string;
    auth: string;
    p256dh: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Venue {
    id: string;
    latitude: string;
    event_calendar: string;
    venue_status: string;
    map_url: string;
    name: string;
    drink_discounts: string;
    ac_logo: string;
    amenities_string: string;
    is_family_friendly: boolean;
    ven_map_url: string;
    description: string;
    kitchen: string;
    amenities: Array<string>;
    website: string;
    approved: boolean;
    longitude: string;
    music_genre: string;
    address: Address;
    contact_info: string;
    dancing: string;
    weekly_events: string;
    date_submitted: bigint;
    rejected: boolean;
    highlight_quote: string;
    last_modified: bigint;
    rating: number;
    phone_number: string;
    cover_charge: string;
    hours_of_operation: string;
    venue_type: string;
    group_discount: string;
    submitted_by: string;
    coordinator: string;
}
export interface LiveEvent {
    title: string;
    dance_floor: boolean;
    description: string;
    end_time: bigint;
    live_music: boolean;
    start_time: bigint;
    cover_charge: boolean;
    event_date: bigint;
}
export interface UserProfile {
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveVenue(venueId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkRadioStreamAvailability(): Promise<boolean>;
    getAllPushSubscriptions(): Promise<Array<[Principal, PushSubscription]>>;
    getAllVenues(): Promise<Array<Venue>>;
    getApprovedVenues(): Promise<Array<Venue>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCheckIntervalSeconds(): Promise<bigint>;
    getLiveEventsToday(latitude: number, longitude: number, radius: number): Promise<Array<LiveEvent>>;
    getPendingVenues(): Promise<Array<Venue>>;
    getPushSubscription(): Promise<PushSubscription | null>;
    getPushSubscriptionState(): Promise<boolean>;
    getRadioStreamUrl(): Promise<string>;
    getRequests(): Promise<Array<[Time, string]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVenueByCoordinates(lat: string, long: string): Promise<{
        message: string;
        venues: Array<Venue>;
    }>;
    getVenueByName(venueName: string): Promise<{
        message: string;
        venues: Array<Venue>;
    }>;
    getVenueInfoMessage(): Promise<string>;
    getVenuesByLocationSorted(latitude: number, longitude: number, radius: number): Promise<Array<Venue>>;
    isCallerAdmin(): Promise<boolean>;
    rejectVenue(venueId: string): Promise<void>;
    removeVenue(venueId: string): Promise<void>;
    requestAdminRole(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveRequest(requestText: string): Promise<void>;
    storePushSubscription(endpoint: string, auth: string, p256dh: string): Promise<void>;
    submitVenue(venue: Venue): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateVenue(venueId: string, updatedVenue: Venue): Promise<void>;
}
