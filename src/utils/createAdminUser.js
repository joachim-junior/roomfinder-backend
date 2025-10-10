const bcrypt = require("bcryptjs");
const { prisma } = require("./database");

/**
 * Create an admin user
 */
async function createAdminUser() {
    try {
        const adminData = {
            email: "hansyufewonge@roomfinder237.com",
            password: "@Hans123",
            firstName: "Hans",
            lastName: "Yufewonge",
            phone: "+237680000000",
            role: "ADMIN",
            isVerified: true,
        };

        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminData.email },
        });

        if (existingAdmin) {
            console.log("✅ Admin user already exists");
            return existingAdmin;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminData.password, 12);

        // Create admin user
        const adminUser = await prisma.user.create({
            data: {
                email: adminData.email,
                password: hashedPassword,
                firstName: adminData.firstName,
                lastName: adminData.lastName,
                phone: adminData.phone,
                role: adminData.role,
                isVerified: adminData.isVerified,
            },
        });

        console.log("✅ Admin user created successfully");
        console.log("📧 Email:", adminData.email);
        console.log("🔑 Password:", adminData.password);
        console.log("🆔 User ID:", adminUser.id);

        return adminUser;
    } catch (error) {
        console.error("❌ Error creating admin user:", error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    createAdminUser()
        .then(() => {
            console.log("✅ Admin user setup complete");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Admin user setup failed:", error);
            process.exit(1);
        });
}

module.exports = { createAdminUser };