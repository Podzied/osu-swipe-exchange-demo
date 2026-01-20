import { DiningLocation } from "@/types";

// OSU Dining Locations
export const DINING_LOCATIONS: DiningLocation[] = [
  { id: "scott", name: "Scott Traditions", shortName: "Scott" },
  { id: "kennedy", name: "Kennedy Commons", shortName: "Kennedy" },
  { id: "morrill", name: "Morrill Commons", shortName: "Morrill" },
  { id: "north", name: "North Commons", shortName: "North" },
  { id: "curl", name: "Curl Market", shortName: "Curl" },
  { id: "sloopy", name: "Sloopy's Diner", shortName: "Sloopy's" },
  { id: "marketplace", name: "The Marketplace", shortName: "Marketplace" },
  { id: "union", name: "Ohio Union", shortName: "Union" },
];

// Rate Limits
export const RATE_LIMITS = {
  MAX_REQUESTS_PER_DAY: 2,
  MAX_CLAIMS_PER_DAY: 5,
  CLAIM_TIMEOUT_MINUTES: 30,
  REQUEST_EXPIRY_HOURS: 4,
};

// Time windows for requests
export const TIME_WINDOWS = {
  MIN_LEAD_TIME_MINUTES: 15,
  MAX_WINDOW_HOURS: 4,
};

// Dietary tags
export const DIETARY_TAGS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten Free" },
  { id: "halal", label: "Halal" },
  { id: "kosher", label: "Kosher" },
  { id: "dairy-free", label: "Dairy Free" },
  { id: "nut-free", label: "Nut Free" },
];

// Status colors for UI
export const STATUS_COLORS = {
  OPEN: "bg-green-100 text-green-800",
  CLAIMED: "bg-yellow-100 text-yellow-800",
  FULFILLED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  EXPIRED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-500",
};
