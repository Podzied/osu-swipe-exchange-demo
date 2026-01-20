// Role types
export const Role = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

// User status types
export const UserStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  BANNED: "BANNED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// Request status types
export const RequestStatus = {
  OPEN: "OPEN",
  CLAIMED: "CLAIMED",
  FULFILLED: "FULFILLED",
  COMPLETED: "COMPLETED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

// Delivery method types
export const DeliveryMethod = {
  PICKUP: "PICKUP",
  DELIVERY: "DELIVERY",
} as const;
export type DeliveryMethod = (typeof DeliveryMethod)[keyof typeof DeliveryMethod];

// Flag type types
export const FlagType = {
  RAPID_REQUESTS: "RAPID_REQUESTS",
  CLAIM_TIMEOUT: "CLAIM_TIMEOUT",
  CONFIRMATION_REUSE: "CONFIRMATION_REUSE",
  UNUSUAL_PATTERN: "UNUSUAL_PATTERN",
} as const;
export type FlagType = (typeof FlagType)[keyof typeof FlagType];

// Flag status types
export const FlagStatus = {
  PENDING: "PENDING",
  DISMISSED: "DISMISSED",
  ACTIONED: "ACTIONED",
} as const;
export type FlagStatus = (typeof FlagStatus)[keyof typeof FlagStatus];

// Dining location type
export interface DiningLocation {
  id: string;
  name: string;
  shortName: string;
}

// Extended session user type
export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
}
