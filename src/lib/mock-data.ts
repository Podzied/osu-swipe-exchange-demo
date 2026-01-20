// In-memory mock data store for demo purposes
import { DEMO_USER, DEMO_FULFILLER, DEMO_ADMIN } from "./demo-user";

export type Request = {
  id: string;
  status: string;
  locations: string;
  timeWindowStart: Date;
  timeWindowEnd: Date;
  deliveryMethod: string;
  deliveryBuilding: string | null;
  deliveryNotes: string | null;
  dietaryTags: string;
  dietaryNotes: string | null;
  pickupAlias: string;
  fulfilledLocation: string | null;
  grubhubOrderId: string | null;
  createdAt: Date;
  claimedAt: Date | null;
  fulfilledAt: Date | null;
  completedAt: Date | null;
  expiresAt: Date;
  requesterId: string;
  fulfillerId: string | null;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  suspendedUntil: Date | null;
  createdAt: Date;
};

export type Flag = {
  id: string;
  type: string;
  reason: string;
  status: string;
  createdAt: Date;
  resolvedAt: Date | null;
  resolution: string | null;
  userId: string;
};

// Initialize with demo users
export const users: User[] = [
  {
    id: DEMO_USER.id,
    email: DEMO_USER.email,
    name: DEMO_USER.name,
    role: DEMO_USER.role,
    status: "ACTIVE",
    suspendedUntil: null,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: DEMO_FULFILLER.id,
    email: DEMO_FULFILLER.email,
    name: DEMO_FULFILLER.name,
    role: DEMO_FULFILLER.role,
    status: "ACTIVE",
    suspendedUntil: null,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: DEMO_ADMIN.id,
    email: DEMO_ADMIN.email,
    name: DEMO_ADMIN.name,
    role: DEMO_ADMIN.role,
    status: "ACTIVE",
    suspendedUntil: null,
    createdAt: new Date("2024-01-01"),
  },
];

// Sample requests for demo
export const requests: Request[] = [
  {
    id: "req-1",
    status: "OPEN",
    locations: JSON.stringify(["scott", "traditions"]),
    timeWindowStart: new Date(Date.now() + 1000 * 60 * 30), // 30 min from now
    timeWindowEnd: new Date(Date.now() + 1000 * 60 * 90), // 90 min from now
    deliveryMethod: "PICKUP",
    deliveryBuilding: null,
    deliveryNotes: null,
    dietaryTags: JSON.stringify(["vegetarian"]),
    dietaryNotes: "No nuts please",
    pickupAlias: "Blue Falcon 42",
    fulfilledLocation: null,
    grubhubOrderId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 min ago
    claimedAt: null,
    fulfilledAt: null,
    completedAt: null,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours
    requesterId: DEMO_USER.id,
    fulfillerId: null,
  },
  {
    id: "req-2",
    status: "OPEN",
    locations: JSON.stringify(["kennedy", "morrill"]),
    timeWindowStart: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
    timeWindowEnd: new Date(Date.now() + 1000 * 60 * 120), // 2 hours from now
    deliveryMethod: "DELIVERY",
    deliveryBuilding: "Smith Hall",
    deliveryNotes: "Room 302, call when arriving",
    dietaryTags: JSON.stringify(["halal"]),
    dietaryNotes: null,
    pickupAlias: "Red Phoenix 17",
    fulfilledLocation: null,
    grubhubOrderId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    claimedAt: null,
    fulfilledAt: null,
    completedAt: null,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours
    requesterId: "other-user-1",
    fulfillerId: null,
  },
];

// Sample flags for demo
export const flags: Flag[] = [
  {
    id: "flag-1",
    type: "RAPID_REQUESTS",
    reason: "User made 5 requests in 24 hours",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    resolvedAt: null,
    resolution: null,
    userId: DEMO_USER.id,
  },
];

// Helper to generate IDs
export function generateId(): string {
  return "id-" + Math.random().toString(36).substring(2, 11);
}

// Helper to get user by ID
export function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

// Helper to get request with relations
export function getRequestWithRelations(request: Request) {
  const requester = getUser(request.requesterId);
  const fulfiller = request.fulfillerId ? getUser(request.fulfillerId) : null;
  return {
    ...request,
    requester: requester ? { id: requester.id, name: requester.name } : null,
    fulfiller: fulfiller ? { id: fulfiller.id, name: fulfiller.name } : null,
  };
}
