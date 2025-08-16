const prisma = require("../config/database");

/**
 * Test database connection
 */
async function testConnection() {
    try {
        await prisma.$connect();
        console.log("✅ Database connected successfully");
        return true;
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        return false;
    }
}

/**
 * Close database connection
 */
async function closeConnection() {
    try {
        await prisma.$disconnect();
        console.log("✅ Database connection closed");
    } catch (error) {
        console.error("❌ Error closing database connection:", error.message);
    }
}

/**
 * Handle database errors
 */
function handleDatabaseError(error) {
    console.error("Database Error:", error);

    if (error.code === "P2002") {
        return {
            error: "Duplicate entry",
            message: "This record already exists",
        };
    }

    if (error.code === "P2025") {
        return {
            error: "Record not found",
            message: "The requested record was not found",
        };
    }

    return {
        error: "Database error",
        message: "An error occurred while processing your request",
    };
}

module.exports = {
    prisma,
    testConnection,
    closeConnection,
    handleDatabaseError,
};