// Demo user for showcasing functionality without auth
export const DEMO_USER = {
  id: "demo-user-1",
  email: "demo@example.com",
  name: "Demo User",
  role: "USER",
};

export const DEMO_ADMIN = {
  id: "demo-admin-1",
  email: "admin@example.com",
  name: "Admin User",
  role: "ADMIN",
};

// Get or create demo user in database
import { prisma } from "./prisma";

export async function ensureDemoUsers() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: {},
    create: {
      id: DEMO_USER.id,
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      role: DEMO_USER.role,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: DEMO_ADMIN.email },
    update: {},
    create: {
      id: DEMO_ADMIN.id,
      email: DEMO_ADMIN.email,
      name: DEMO_ADMIN.name,
      role: DEMO_ADMIN.role,
    },
  });

  return { user, admin };
}
