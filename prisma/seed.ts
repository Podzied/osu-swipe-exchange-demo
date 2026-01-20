import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin.1@osu.edu" },
    update: {},
    create: {
      email: "admin.1@osu.edu",
      name: "Admin User",
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin.email);

  // Create test users
  const testUser1 = await prisma.user.upsert({
    where: { email: "john.doe@osu.edu" },
    update: {},
    create: {
      email: "john.doe@osu.edu",
      name: "John Doe",
    },
  });

  const testUser2 = await prisma.user.upsert({
    where: { email: "jane.smith@osu.edu" },
    update: {},
    create: {
      email: "jane.smith@osu.edu",
      name: "Jane Smith",
    },
  });

  console.log("Created test users:", testUser1.email, testUser2.email);

  // Create sample requests
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  const request1 = await prisma.request.create({
    data: {
      requesterId: testUser1.id,
      locations: JSON.stringify(["scott", "kennedy"]),
      timeWindowStart: now,
      timeWindowEnd: twoHoursLater,
      deliveryMethod: "PICKUP",
      dietaryTags: JSON.stringify(["vegetarian"]),
      pickupAlias: "Blue Falcon 42",
      expiresAt: twoHoursLater,
    },
  });

  const request2 = await prisma.request.create({
    data: {
      requesterId: testUser2.id,
      locations: JSON.stringify(["north", "curl"]),
      timeWindowStart: now,
      timeWindowEnd: fourHoursLater,
      deliveryMethod: "DELIVERY",
      deliveryBuilding: "Smith Hall Room 305",
      deliveryNotes: "Please text when outside",
      dietaryTags: JSON.stringify(["gluten-free", "dairy-free"]),
      pickupAlias: "Red Dragon 17",
      expiresAt: fourHoursLater,
    },
  });

  console.log("Created sample requests:", request1.id, request2.id);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
