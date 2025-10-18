const { prisma, handleDatabaseError } = require("./database");
const { sendAdminNotificationEmail } = require("./emailService");
const firebaseService = require("./firebaseService");

class AdminNotificationService {
    /**
     * Send notification to specific users
     */
    async sendNotificationToUsers(adminId, notificationData) {
        try {
            const {
                userIds,
                title,
                body,
                priority = "MEDIUM",
                actionUrl,
                sendEmail = true,
                sendPush = true,
                sendInApp = true,
            } = notificationData;

            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                throw new Error("User IDs are required");
            }

            if (!title || !body) {
                throw new Error("Title and body are required");
            }

            // Get users information
            const users = await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isVerified: true,
                },
            });

            if (users.length === 0) {
                throw new Error("No valid users found");
            }

            const results = {
                total: users.length,
                emailSent: 0,
                pushSent: 0,
                inAppCreated: 0,
                errors: [],
            };

            // Process each user
            for (const user of users) {
                try {
                    // Send email notification
                    if (sendEmail && user.email && user.isVerified) {
                        await sendAdminNotificationEmail(user.email, user.firstName, {
                            title,
                            body,
                            priority,
                            actionUrl,
                        });
                        results.emailSent++;
                    }

                    // Send push notification
                    if (sendPush) {
                        try {
                            await firebaseService.sendPushNotification(user.id, title, body, {
                                type: "ADMIN_NOTIFICATION",
                                priority,
                                actionUrl,
                                adminId,
                            });
                            results.pushSent++;
                        } catch (pushError) {
                            console.error(
                                `Push notification failed for user ${user.id}:`,
                                pushError.message
                            );
                            results.errors.push({
                                userId: user.id,
                                type: "PUSH",
                                error: pushError.message,
                            });
                        }
                    }

                    // Create in-app notification
                    if (sendInApp) {
                        await prisma.notification.create({
                            data: {
                                userId: user.id,
                                title,
                                body,
                                type: "ADMIN",
                                status: "SENT",
                                data: JSON.stringify({
                                    type: "ADMIN_NOTIFICATION",
                                    priority,
                                    actionUrl,
                                    adminId,
                                }),
                            },
                        });
                        results.inAppCreated++;
                    }
                } catch (userError) {
                    console.error(`Error processing user ${user.id}:`, userError.message);
                    results.errors.push({
                        userId: user.id,
                        type: "GENERAL",
                        error: userError.message,
                    });
                }
            }

            return results;
        } catch (error) {
            console.error("Send notification to users error:", error);
            throw error;
        }
    }

    /**
     * Send notification to all users by role
     */
    async sendNotificationToRole(adminId, notificationData) {
        try {
            const {
                role,
                title,
                body,
                priority = "MEDIUM",
                actionUrl,
                sendEmail = true,
                sendPush = true,
                sendInApp = true,
            } = notificationData;

            if (!role || !title || !body) {
                throw new Error("Role, title, and body are required");
            }

            // Get users by role
            const users = await prisma.user.findMany({
                where: { role },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isVerified: true,
                },
            });

            if (users.length === 0) {
                throw new Error(`No users found with role: ${role}`);
            }

            // Use the existing sendNotificationToUsers method
            return await this.sendNotificationToUsers(adminId, {
                userIds: users.map((user) => user.id),
                title,
                body,
                priority,
                actionUrl,
                sendEmail,
                sendPush,
                sendInApp,
            });
        } catch (error) {
            console.error("Send notification to role error:", error);
            throw error;
        }
    }

    /**
     * Send notification to all users
     */
    async sendNotificationToAll(adminId, notificationData) {
        try {
            const {
                title,
                body,
                priority = "MEDIUM",
                actionUrl,
                sendEmail = true,
                sendPush = true,
                sendInApp = true,
            } = notificationData;

            if (!title || !body) {
                throw new Error("Title and body are required");
            }

            // Get all users
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    isVerified: true,
                },
            });

            if (users.length === 0) {
                throw new Error("No users found");
            }

            // Use the existing sendNotificationToUsers method
            return await this.sendNotificationToUsers(adminId, {
                userIds: users.map((user) => user.id),
                title,
                body,
                priority,
                actionUrl,
                sendEmail,
                sendPush,
                sendInApp,
            });
        } catch (error) {
            console.error("Send notification to all error:", error);
            throw error;
        }
    }

    /**
     * Get notification statistics
     */
    async getNotificationStats() {
        try {
            const [totalUsers, verifiedUsers, usersByRole, recentNotifications] =
            await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { isVerified: true } }),
                prisma.user.groupBy({
                    by: ["role"],
                    _count: { role: true },
                }),
                prisma.notification.count({
                    where: {
                        type: "ADMIN",
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                        },
                    },
                }),
            ]);

            return {
                totalUsers,
                verifiedUsers,
                usersByRole: usersByRole.reduce((acc, item) => {
                    acc[item.role] = item._count.role;
                    return acc;
                }, {}),
                recentNotifications,
            };
        } catch (error) {
            console.error("Get notification stats error:", error);
            throw error;
        }
    }

    /**
     * Get users for notification targeting
     */
    async getUsersForNotification(filters = {}) {
        try {
            const { role, isVerified, search, page = 1, limit = 50 } = filters;
            const skip = (page - 1) * limit;

            let where = {};

            if (role) {
                where.role = role;
            }

            if (isVerified !== undefined) {
                where.isVerified = isVerified;
            }

            if (search) {
                where.OR = [
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ];
            }

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        isVerified: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: parseInt(limit),
                }),
                prisma.user.count({ where }),
            ]);

            return {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            };
        } catch (error) {
            console.error("Get users for notification error:", error);
            throw error;
        }
    }
}

module.exports = new AdminNotificationService();