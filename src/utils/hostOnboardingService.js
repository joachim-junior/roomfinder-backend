const { prisma, handleDatabaseError } = require("./database");
const {
    sendHostApprovalEmail,
    sendHostRejectionEmail,
} = require("./emailService");
const firebaseService = require("./firebaseService");

class HostOnboardingService {
    /**
     * Create or update host profile
     */
    async createOrUpdateHostProfile(userId, profileData) {
        try {
            const {
                fullLegalName,
                dateOfBirth,
                nationality,
                residentialAddress,
                city,
                region,
                country,
                postalCode,
                alternatePhone,
                emergencyContact,
                emergencyPhone,
                payoutPhoneNumber,
                payoutPhoneName,
                idType,
                idNumber,
                idExpiryDate,
                bio,
                languages,
            } = profileData;

            // Validate required fields
            if (!fullLegalName ||
                !residentialAddress ||
                !city ||
                !region ||
                !payoutPhoneNumber
            ) {
                throw new Error("Missing required profile fields");
            }

            // Create or update profile
            const profile = await prisma.hostProfile.upsert({
                where: { userId },
                update: {
                    fullLegalName,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                    nationality,
                    residentialAddress,
                    city,
                    region,
                    country: country || "Cameroon",
                    postalCode,
                    alternatePhone,
                    emergencyContact,
                    emergencyPhone,
                    payoutPhoneNumber,
                    payoutPhoneName,
                    idType,
                    idNumber,
                    idExpiryDate: idExpiryDate ? new Date(idExpiryDate) : null,
                    bio,
                    languages: languages || [],
                    completedAt: new Date(),
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    fullLegalName,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                    nationality,
                    residentialAddress,
                    city,
                    region,
                    country: country || "Cameroon",
                    postalCode,
                    alternatePhone,
                    emergencyContact,
                    emergencyPhone,
                    payoutPhoneNumber,
                    payoutPhoneName,
                    idType,
                    idNumber,
                    idExpiryDate: idExpiryDate ? new Date(idExpiryDate) : null,
                    bio,
                    languages: languages || [],
                    completedAt: new Date(),
                },
            });

            return profile;
        } catch (error) {
            console.error("Create/Update host profile error:", error);
            throw error;
        }
    }

    /**
     * Upload ID verification documents
     */
    async uploadIdVerification(userId, documents) {
        try {
            const { idFrontImage, idBackImage, selfieImage } = documents;

            // Validate all three images are provided
            if (!idFrontImage || !idBackImage || !selfieImage) {
                throw new Error(
                    "All three verification images are required: ID front, ID back, and selfie"
                );
            }

            // Create or update verification record
            const verification = await prisma.hostVerification.upsert({
                where: { userId },
                update: {
                    idFrontImage,
                    idBackImage,
                    selfieImage,
                    idVerificationStatus: "PENDING",
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    idFrontImage,
                    idBackImage,
                    selfieImage,
                    idVerificationStatus: "PENDING",
                },
            });

            return verification;
        } catch (error) {
            console.error("Upload ID verification error:", error);
            throw error;
        }
    }

    /**
     * Upload property ownership documents (optional)
     */
    async uploadOwnershipDocuments(userId, documentUrls) {
        try {
            if (!Array.isArray(documentUrls) || documentUrls.length === 0) {
                throw new Error("At least one ownership document is required");
            }

            const verification = await prisma.hostVerification.upsert({
                where: { userId },
                update: {
                    ownershipDocuments: documentUrls,
                    ownershipVerificationStatus: "PENDING",
                    updatedAt: new Date(),
                },
                create: {
                    userId,
                    ownershipDocuments: documentUrls,
                    ownershipVerificationStatus: "PENDING",
                },
            });

            return verification;
        } catch (error) {
            console.error("Upload ownership documents error:", error);
            throw error;
        }
    }

    /**
     * Get host onboarding status
     */
    async getOnboardingStatus(userId) {
        try {
            const [profile, verification, user] = await Promise.all([
                prisma.hostProfile.findUnique({ where: { userId } }),
                prisma.hostVerification.findUnique({ where: { userId } }),
                prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        role: true,
                        hostApprovalStatus: true,
                        isVerified: true,
                    },
                }),
            ]);

            const onboardingStatus = {
                user,
                profile: {
                    completed: !!(profile && profile.completedAt),
                    data: profile,
                },
                verification: {
                    idVerification:
                        (verification && verification.idVerificationStatus) || "PENDING",
                    ownershipVerification:
                        (verification && verification.ownershipVerificationStatus) ||
                        "NOT_REQUIRED",
                    overall:
                        (verification && verification.overallVerificationStatus) ||
                        "PENDING",
                    data: verification,
                },
                completionPercentage: this.calculateCompletionPercentage(
                    profile,
                    verification
                ),
                nextSteps: this.getNextSteps(profile, verification),
            };

            return onboardingStatus;
        } catch (error) {
            console.error("Get onboarding status error:", error);
            throw error;
        }
    }

    /**
     * Calculate onboarding completion percentage
     */
    calculateCompletionPercentage(profile, verification) {
        let completed = 0;
        let total = 4; // Total onboarding steps

        // Step 1: Profile completed
        if (profile && profile.completedAt) completed++;

        // Step 2: ID front uploaded
        if (verification && verification.idFrontImage) completed++;

        // Step 3: ID back uploaded
        if (verification && verification.idBackImage) completed++;

        // Step 4: Selfie uploaded
        if (verification && verification.selfieImage) completed++;

        return Math.round((completed / total) * 100);
    }

    /**
     * Get next steps for host onboarding
     */
    getNextSteps(profile, verification) {
        const steps = [];

        if (!(profile && profile.completedAt)) {
            steps.push({
                step: 1,
                title: "Complete Host Profile",
                description: "Provide your full personal information and payout details",
                required: true,
                completed: false,
            });
        }

        if (!(verification && verification.idFrontImage) ||
            !(verification && verification.idBackImage) ||
            !(verification && verification.selfieImage)
        ) {
            steps.push({
                step: 2,
                title: "Upload ID Verification",
                description: "Upload front and back of your ID plus a selfie",
                required: true,
                completed: false,
            });
        }

        if (verification && verification.idVerificationStatus === "PENDING") {
            steps.push({
                step: 3,
                title: "Wait for ID Verification",
                description: "Admin is reviewing your ID documents",
                required: true,
                completed: false,
            });
        }

        if (steps.length === 0) {
            return [{
                step: 4,
                title: "All Set!",
                description: "Your onboarding is complete. You can now list properties!",
                required: false,
                completed: true,
            }, ];
        }

        return steps;
    }

    /**
     * Admin: Verify host ID
     */
    async verifyHostId(userId, adminId, decision, notes = "") {
        try {
            const verification = await prisma.hostVerification.findUnique({
                where: { userId },
            });

            if (!verification) {
                throw new Error("No verification record found for this host");
            }

            if (!verification.idFrontImage ||
                !verification.idBackImage ||
                !verification.selfieImage
            ) {
                throw new Error("Host has not uploaded all required ID documents");
            }

            const updateData = {
                idVerifiedBy: adminId,
                adminNotes: notes,
                updatedAt: new Date(),
            };

            if (decision === "VERIFIED") {
                updateData.idVerificationStatus = "VERIFIED";
                updateData.idVerifiedAt = new Date();
                updateData.overallVerificationStatus = "VERIFIED";
                updateData.verificationCompletedAt = new Date();

                // Update user's host approval status
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        hostApprovalStatus: "APPROVED",
                        hostApprovalDate: new Date(),
                        hostApprovalNotes: notes,
                    },
                });
            } else {
                updateData.idVerificationStatus = "REJECTED";
                updateData.idRejectionReason = notes;
                updateData.overallVerificationStatus = "REJECTED";

                // Update user's host approval status
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        hostApprovalStatus: "REJECTED",
                        hostRejectionReason: notes,
                    },
                });
            }

            const updatedVerification = await prisma.hostVerification.update({
                where: { userId },
                data: updateData,
            });

            // Get user details for notifications
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            });

            // Send notifications based on decision
            if (decision === "VERIFIED") {
                // Send approval email
                sendHostApprovalEmail(user.email, user.firstName, notes).catch(
                    (err) => {
                        console.error("Failed to send host approval email:", err.message);
                    }
                );

                // Send push notification
                firebaseService
                    .sendPushNotification(
                        userId,
                        "🎉 Host Application Approved!",
                        "Congratulations! You can now list your properties on Room Finder.", {
                            type: "HOST_APPROVED",
                            userId: userId,
                            notes: notes,
                        }
                    )
                    .catch((err) => {
                        console.error("Failed to send push notification:", err.message);
                    });

                // Create in-app notification
                await prisma.notification.create({
                    data: {
                        userId,
                        title: "Host Application Approved! 🎉",
                        body: `Congratulations ${user.firstName}! Your host application has been approved. You can now start listing your properties and welcoming guests.`,
                        type: "PUSH",
                        status: "SENT",
                        data: JSON.stringify({
                            type: "HOST_APPROVED",
                            notes: notes,
                            verificationId: updatedVerification.id,
                        }),
                    },
                });
            } else {
                // Send rejection email
                sendHostRejectionEmail(user.email, user.firstName, notes).catch(
                    (err) => {
                        console.error("Failed to send host rejection email:", err.message);
                    }
                );

                // Send push notification
                firebaseService
                    .sendPushNotification(
                        userId,
                        "Host Application Update",
                        "Your host application requires attention. Please check your email for details.", {
                            type: "HOST_REJECTED",
                            userId: userId,
                            reason: notes,
                        }
                    )
                    .catch((err) => {
                        console.error("Failed to send push notification:", err.message);
                    });

                // Create in-app notification
                await prisma.notification.create({
                    data: {
                        userId,
                        title: "Host Application Requires Attention",
                        body: `Hi ${user.firstName}, we need additional information regarding your host application. Reason: ${notes}`,
                        type: "PUSH",
                        status: "SENT",
                        data: JSON.stringify({
                            type: "HOST_REJECTED",
                            reason: notes,
                            verificationId: updatedVerification.id,
                        }),
                    },
                });
            }

            return updatedVerification;
        } catch (error) {
            console.error("Verify host ID error:", error);
            throw error;
        }
    }

    /**
     * Admin: Verify property ownership documents (optional)
     */
    async verifyOwnershipDocuments(userId, adminId, decision, notes = "") {
        try {
            const verification = await prisma.hostVerification.findUnique({
                where: { userId },
            });

            if (!verification) {
                throw new Error("No verification record found for this host");
            }

            const updateData = {
                ownershipVerifiedBy: adminId,
                updatedAt: new Date(),
            };

            if (decision === "VERIFIED") {
                updateData.ownershipVerificationStatus = "VERIFIED";
                updateData.ownershipVerifiedAt = new Date();
            } else {
                updateData.ownershipVerificationStatus = "REJECTED";
                updateData.ownershipRejectionReason = notes;
            }

            const updatedVerification = await prisma.hostVerification.update({
                where: { userId },
                data: updateData,
            });

            return updatedVerification;
        } catch (error) {
            console.error("Verify ownership documents error:", error);
            throw error;
        }
    }

    /**
     * Get all hosts pending verification (Admin)
     */
    async getPendingVerifications(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;

            const [verifications, total] = await Promise.all([
                prisma.hostVerification.findMany({
                    where: {
                        OR: [
                            { idVerificationStatus: "PENDING" },
                            { ownershipVerificationStatus: "PENDING" },
                        ],
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                phone: true,
                                hostApprovalStatus: true,
                                createdAt: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                    skip,
                    take: limit,
                }),
                prisma.hostVerification.count({
                    where: {
                        OR: [
                            { idVerificationStatus: "PENDING" },
                            { ownershipVerificationStatus: "PENDING" },
                        ],
                    },
                }),
            ]);

            // Get profiles for each verification
            const verificationsWithProfiles = await Promise.all(
                verifications.map(async(verification) => {
                    const profile = await prisma.hostProfile.findUnique({
                        where: { userId: verification.userId },
                    });
                    return {
                        ...verification,
                        profile,
                    };
                })
            );

            return {
                verifications: verificationsWithProfiles,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error("Get pending verifications error:", error);
            throw error;
        }
    }
}

module.exports = new HostOnboardingService();