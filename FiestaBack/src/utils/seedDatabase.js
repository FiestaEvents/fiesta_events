import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Permission, Role, Venue, User } from "../models/index.js";
import { PERMISSIONS } from "../config/permissions.js";
import { DEFAULT_ROLES } from "../config/roles.js";
import config from "../config/env.js";
import connectDB from "../config/database.js";

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("🌱 Starting database seeding...\n");

    // 1. Clear existing data (optional - comment out if you don't want to clear)
    // await Permission.deleteMany({});
    // await Role.deleteMany({});
    // console.log("✅ Cleared existing permissions and roles\n");

    // 2. Seed Permissions
    console.log("📝 Seeding permissions...");
    
    const permissionPromises = PERMISSIONS.map(async (perm) => {
      return Permission.findOneAndUpdate(
        { name: perm.name },
        perm,
        { upsert: true, new: true }
      );
    });

    const createdPermissions = await Promise.all(permissionPromises);
    console.log(`✅ Created/Updated ${createdPermissions.length} permissions\n`);

    // Create permission lookup map
    const permissionMap = {};
    createdPermissions.forEach((p) => {
      permissionMap[p.name] = p._id;
    });

    // 3. Get all venues
    const venues = await Venue.find({});
    console.log(`📍 Found ${venues.length} venue(s)\n`);

    if (venues.length === 0) {
      console.log("⚠️  No venues found. Creating a demo venue...\n");

      // Create demo venue
      const demoVenue = await Venue.create({
        name: "Demo Venue",
        description: "A beautiful event venue for all occasions",
        address: {
          street: "123 Main Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
        contact: {
          phone: "+1234567890",
          email: "demo@venue.com",
        },
        capacity: {
          min: 50,
          max: 500,
        },
        pricing: {
          basePrice: 5000,
        },
        subscription: {
          plan: "annual",
          status: "active",
          startDate: new Date(),
          amount: 1200,
        },
        owner: new mongoose.Types.ObjectId(), // Temporary, will update later
        timeZone: "America/New_York",
      });

      venues.push(demoVenue);
      console.log("✅ Created demo venue\n");
    }

    // 4. Seed Roles for each venue
    console.log("👥 Seeding roles...");

    for (const venue of venues) {
      for (const roleConfig of DEFAULT_ROLES) {
        const permissionIds =
          roleConfig.permissions === "ALL"
            ? createdPermissions.map((p) => p._id)
            : roleConfig.permissions.map((permName) => permissionMap[permName]).filter(Boolean);

        await Role.findOneAndUpdate(
          { name: roleConfig.name, venueId: venue._id },
          {
            ...roleConfig,
            permissions: permissionIds,
            venueId: venue._id,
          },
          { upsert: true, new: true }
        );
      }
      console.log(`✅ Created roles for venue: ${venue.name}`);
    }

    console.log("\n🎉 Database seeding completed successfully!\n");

    // 5. Create demo owner user if needed
    const demoVenue = venues[0];
    const ownerExists = await User.findOne({ venueId: demoVenue._id, roleType: "owner" });

    if (!ownerExists) {
      console.log("👤 Creating demo owner user...");

      const ownerRole = await Role.findOne({
        name: "Owner",
        venueId: demoVenue._id,
      });

      const demoUser = await User.create({
        name: "Demo Owner",
        email: "owner@demo.com",
        password: "password123",
        phone: "+1234567890",
        roleId: ownerRole._id,
        roleType: "owner",
        venueId: demoVenue._id,
        isActive: true,
      });

      // Update venue owner
      demoVenue.owner = demoUser._id;
      await demoVenue.save();

      console.log("✅ Created demo owner user");
      console.log("   Email: owner@demo.com");
      console.log("   Password: password123\n");
    }

    console.log("✨ All done! You can now start the server.\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedDatabase();
}

export default seedDatabase;