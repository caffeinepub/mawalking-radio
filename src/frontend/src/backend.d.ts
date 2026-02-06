import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
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
export interface UserProfile {
    name: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkRadioStreamAvailability(): Promise<boolean>;
    getAllPushSubscriptions(): Promise<Array<[Principal, PushSubscription]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCheckIntervalSeconds(): Promise<bigint>;
    getPushSubscription(): Promise<PushSubscription | null>;
    getRadioStreamUrl(): Promise<string>;
    getRequests(): Promise<Array<[Time, string]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveRequest(requestText: string): Promise<void>;
    storePushSubscription(endpoint: string, auth: string, p256dh: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
