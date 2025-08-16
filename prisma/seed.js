const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seeding...");

    // Create test users
    const hashedPassword = await bcrypt.hash("password123", 10);

    const user1 = await prisma.user.upsert({
        where: { email: "john@example.com" },
        update: {},
        create: {
            email: "john@example.com",
            password: hashedPassword,
            firstName: "John",
            lastName: "Doe",
            phone: "+237681101063",
            role: "HOST",
            isVerified: true,
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: "jane@example.com" },
        update: {},
        create: {
            email: "jane@example.com",
            password: hashedPassword,
            firstName: "Jane",
            lastName: "Smith",
            phone: "+237681101064",
            role: "GUEST",
            isVerified: true,
        },
    });

    console.log("✅ Users created:", { user1: user1.email, user2: user2.email });

    // Create test properties
    const property1 = await prisma.property.upsert({
        where: { id: "prop1" },
        update: {},
        create: {
            id: "prop1",
            title: "Beautiful Apartment in Douala",
            description: "Modern 2-bedroom apartment with city view",
            type: "APARTMENT",
            address: "123 Main Street",
            city: "Douala",
            state: "Littoral",
            country: "Cameroon",
            zipCode: "00237",
            latitude: 4.0511,
            longitude: 9.7679,
            price: 50000,
            currency: "XAF",
            bedrooms: 2,
            bathrooms: 2,
            maxGuests: 4,
            amenities: ["WiFi", "Air Conditioning", "Kitchen", "Parking"],
            images: [
                "https://example.com/image1.jpg",
                "https://example.com/image2.jpg",
            ],
            isAvailable: true,
            isVerified: true,
            hostId: user1.id,
        },
    });

    const property2 = await prisma.property.upsert({
        where: { id: "prop2" },
        update: {},
        create: {
            id: "prop2",
            title: "Cozy Guesthouse in Yaoundé",
            description: "Charming guesthouse in the heart of Yaoundé",
            type: "GUESTHOUSE",
            address: "456 Central Avenue",
            city: "Yaoundé",
            state: "Centre",
            country: "Cameroon",
            zipCode: "00237",
            latitude: 3.848,
            longitude: 11.5021,
            price: 35000,
            currency: "XAF",
            bedrooms: 1,
            bathrooms: 1,
            maxGuests: 2,
            amenities: ["WiFi", "Breakfast", "Garden"],
            images: ["https://example.com/image3.jpg"],
            isAvailable: true,
            isVerified: true,
            hostId: user1.id,
        },
    });

    console.log("✅ Properties created:", {
        property1: property1.title,
        property2: property2.title,
    });

    // Create test booking
    const booking = await prisma.booking.upsert({
        where: { id: "book1" },
        update: {},
        create: {
            id: "book1",
            checkIn: new Date("2024-12-01"),
            checkOut: new Date("2024-12-05"),
            guests: 2,
            totalPrice: 200000,
            status: "CONFIRMED",
            propertyId: property1.id,
            guestId: user2.id,
        },
    });

    console.log("✅ Booking created:", { booking: booking.id });

    // Create test review
    const review = await prisma.review.upsert({
        where: {
            propertyId_userId: {
                propertyId: property1.id,
                userId: user2.id,
            },
        },
        update: {},
        create: {
            rating: 5,
            comment: "Excellent stay! Highly recommended.",
            propertyId: property1.id,
            userId: user2.id,
        },
    });

    console.log("✅ Review created:", { review: review.id });

    console.log("🎉 Database seeding completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Error during seeding:", e);
        process.exit(1);
    })
    .finally(async() => {
        await prisma.$disconnect();
    });