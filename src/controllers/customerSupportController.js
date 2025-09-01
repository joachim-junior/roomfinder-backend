const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const prisma = new PrismaClient();

class CustomerSupportController {
    // Create a new support ticket
    async createTicket(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }

            const {
                subject,
                description,
                category,
                priority,
                attachments = [],
            } = req.body;
            const userId = req.user.id;

            const ticket = await prisma.customerSupport.create({
                data: {
                    subject,
                    description,
                    category,
                    priority: priority || "MEDIUM",
                    userId,
                    userEmail: req.user.email,
                    userPhone: req.user.phone,
                    attachments,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            avatar: true,
                        },
                    },
                },
            });

            res.status(201).json({
                success: true,
                message: "Support ticket created successfully",
                data: { ticket },
            });
        } catch (error) {
            console.error("Create support ticket error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create support ticket",
            });
        }
    }

    // Get user's support tickets
    async getUserTickets(req, res) {
        try {
            const { page = 1, limit = 10, status, category } = req.query;
            const skip = (page - 1) * limit;
            const userId = req.user.id;

            const where = { userId };
            if (status) where.status = status;
            if (category) where.category = category;

            const tickets = await prisma.customerSupport.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { createdAt: "desc" },
                include: {
                    assignedTo: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1, // Latest message only
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    role: true,
                                },
                            },
                        },
                    },
                },
            });

            const total = await prisma.customerSupport.count({ where });

            res.json({
                success: true,
                data: {
                    tickets,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit),
                    },
                },
            });
        } catch (error) {
            console.error("Get user tickets error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to get support tickets",
            });
        }
    }

    // Get ticket by ID (user can only access their own tickets)
    async getTicketById(req, res) {
        try {
            const { ticketId } = req.params;
            const userId = req.user.id;

            const ticket = await prisma.customerSupport.findFirst({
                where: {
                    id: ticketId,
                    userId: userId,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            avatar: true,
                        },
                    },
                    assignedTo: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                    messages: {
                        orderBy: { createdAt: "asc" },
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    role: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: "Support ticket not found",
                });
            }

            res.json({
                success: true,
                data: { ticket },
            });
        } catch (error) {
            console.error("Get ticket by ID error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to get support ticket",
            });
        }
    }

    // Add message to ticket
    async addMessage(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }

            const { ticketId } = req.params;
            const { message, attachments = [] } = req.body;
            const userId = req.user.id;

            // Verify ticket belongs to user
            const ticket = await prisma.customerSupport.findFirst({
                where: {
                    id: ticketId,
                    userId: userId,
                },
            });

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: "Support ticket not found",
                });
            }

            // Create message
            const supportMessage = await prisma.supportMessage.create({
                data: {
                    ticketId,
                    senderId: userId,
                    message,
                    attachments,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                            avatar: true,
                        },
                    },
                },
            });

            // Update ticket status if it was resolved/closed
            if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
                await prisma.customerSupport.update({
                    where: { id: ticketId },
                    data: { status: "OPEN" },
                });
            }

            res.status(201).json({
                success: true,
                message: "Message added successfully",
                data: { message: supportMessage },
            });
        } catch (error) {
            console.error("Add message error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to add message",
            });
        }
    }

    // Admin: Get all support tickets
    async getAllTickets(req, res) {
        try {
            // Check if user is admin
            if (req.user.role !== "ADMIN") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Admin privileges required.",
                });
            }

            const {
                page = 1,
                    limit = 10,
                    status,
                    category,
                    priority,
                    assignedToId,
                    search,
            } = req.query;
            const skip = (page - 1) * limit;

            const where = {};
            if (status) where.status = status;
            if (category) where.category = category;
            if (priority) where.priority = priority;
            if (assignedToId) where.assignedToId = assignedToId;

            if (search) {
                where.OR = [
                    { subject: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                    { userEmail: { contains: search, mode: "insensitive" } },
                    { ticketId: { contains: search, mode: "insensitive" } },
                ];
            }

            const tickets = await prisma.customerSupport.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            avatar: true,
                            role: true,
                        },
                    },
                    assignedTo: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1, // Latest message only
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    role: true,
                                },
                            },
                        },
                    },
                },
            });

            const total = await prisma.customerSupport.count({ where });

            res.json({
                success: true,
                data: {
                    tickets,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(total / limit),
                        totalItems: total,
                        itemsPerPage: parseInt(limit),
                        hasNextPage: page * limit < total,
                        hasPrevPage: page > 1,
                    },
                },
            });
        } catch (error) {
            console.error("Get all tickets error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to get support tickets",
            });
        }
    }

    // Admin: Update ticket status and assignment
    async updateTicket(req, res) {
        try {
            // Check if user is admin
            if (req.user.role !== "ADMIN") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Admin privileges required.",
                });
            }

            const { ticketId } = req.params;
            const { status, assignedToId, priority, resolution } = req.body;

            const updateData = {};
            if (status) updateData.status = status;
            if (assignedToId) updateData.assignedToId = assignedToId;
            if (priority) updateData.priority = priority;

            if (status === "RESOLVED" || status === "CLOSED") {
                updateData.resolvedAt = new Date();
                updateData.resolvedBy = req.user.id;
                if (resolution) updateData.resolution = resolution;
            }

            const ticket = await prisma.customerSupport.update({
                where: { id: ticketId },
                data: updateData,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    assignedTo: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });

            res.json({
                success: true,
                message: "Support ticket updated successfully",
                data: { ticket },
            });
        } catch (error) {
            console.error("Update ticket error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update support ticket",
            });
        }
    }

    // Admin: Add internal message or response
    async addAdminMessage(req, res) {
        try {
            // Check if user is admin
            if (req.user.role !== "ADMIN") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Admin privileges required.",
                });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }

            const { ticketId } = req.params;
            const { message, isInternal = false, attachments = [] } = req.body;

            const supportMessage = await prisma.supportMessage.create({
                data: {
                    ticketId,
                    senderId: req.user.id,
                    message,
                    isInternal,
                    attachments,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                            avatar: true,
                        },
                    },
                },
            });

            // Update ticket status to IN_PROGRESS if it was OPEN
            const ticket = await prisma.customerSupport.findUnique({
                where: { id: ticketId },
            });

            if (ticket && ticket.status === "OPEN") {
                await prisma.customerSupport.update({
                    where: { id: ticketId },
                    data: {
                        status: "IN_PROGRESS",
                        assignedToId: req.user.id,
                    },
                });
            }

            res.status(201).json({
                success: true,
                message: "Message added successfully",
                data: { message: supportMessage },
            });
        } catch (error) {
            console.error("Add admin message error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to add message",
            });
        }
    }

    // Admin: Get support statistics
    async getSupportStats(req, res) {
        try {
            // Check if user is admin
            if (req.user.role !== "ADMIN") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Admin privileges required.",
                });
            }

            const totalTickets = await prisma.customerSupport.count();
            const openTickets = await prisma.customerSupport.count({
                where: { status: "OPEN" },
            });
            const inProgressTickets = await prisma.customerSupport.count({
                where: { status: "IN_PROGRESS" },
            });
            const resolvedTickets = await prisma.customerSupport.count({
                where: { status: "RESOLVED" },
            });
            const closedTickets = await prisma.customerSupport.count({
                where: { status: "CLOSED" },
            });

            const categoryStats = await prisma.customerSupport.groupBy({
                by: ["category"],
                _count: { category: true },
            });

            const priorityStats = await prisma.customerSupport.groupBy({
                by: ["priority"],
                _count: { priority: true },
            });

            // Get recent tickets
            const recentTickets = await prisma.customerSupport.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });

            res.json({
                success: true,
                data: {
                    overview: {
                        totalTickets,
                        openTickets,
                        inProgressTickets,
                        resolvedTickets,
                        closedTickets,
                    },
                    categoryBreakdown: categoryStats.map((stat) => ({
                        category: stat.category,
                        count: stat._count.category,
                    })),
                    priorityBreakdown: priorityStats.map((stat) => ({
                        priority: stat.priority,
                        count: stat._count.priority,
                    })),
                    recentTickets,
                },
            });
        } catch (error) {
            console.error("Get support stats error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to get support statistics",
            });
        }
    }

    // Get support categories and priorities (public)
    async getSupportOptions(req, res) {
        try {
            const categories = [
                { value: "BOOKING_ISSUES", label: "Booking Issues" },
                { value: "PAYMENTS_BILLING", label: "Payments & Billing" },
                { value: "ACCOUNT_MANAGEMENT", label: "Account Management" },
                { value: "TECHNICAL_SUPPORT", label: "Technical Support" },
                { value: "SAFETY_SECURITY", label: "Safety & Security" },
            ];

            const priorities = [
                { value: "LOW", label: "Low - General inquiry" },
                { value: "MEDIUM", label: "Medium - Standard issue" },
                { value: "HIGH", label: "High - Urgent issues" },
                { value: "URGENT", label: "Urgent - Critical issues" },
            ];

            const statuses = [
                { value: "OPEN", label: "Open" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "WAITING_FOR_USER", label: "Waiting for User" },
                { value: "RESOLVED", label: "Resolved" },
                { value: "CLOSED", label: "Closed" },
                { value: "ESCALATED", label: "Escalated" },
            ];

            res.json({
                success: true,
                data: {
                    categories,
                    priorities,
                    statuses,
                },
            });
        } catch (error) {
            console.error("Get support options error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to get support options",
            });
        }
    }
}

module.exports = new CustomerSupportController();