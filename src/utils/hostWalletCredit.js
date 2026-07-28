const { prisma } = require("./database");
const revenueService = require("./revenueService");

/**
 * Credit host wallet when a guest payment succeeds (idempotent per booking).
 */
async function creditHostForBookingPayment(bookingId, options = {}) {
    const { reference, payerMetadata = {} } = options;

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            property: {
                select: { hostId: true, price: true, title: true },
            },
        },
    });

    if (!booking) {
        throw new Error(`Booking ${bookingId} not found`);
    }

    const hostId = booking.property.hostId;

    const existing = await prisma.transaction.findFirst({
        where: {
            userId: hostId,
            bookingId,
            type: "PAYMENT",
            status: "COMPLETED",
        },
    });

    if (existing) {
        return {
            alreadyCredited: true,
            hostAmount: existing.amount,
            transactionId: existing.id,
        };
    }

    const feeCalculation = await revenueService.calculateBookingFees(
        booking.totalPrice,
        "XAF",
        hostId
    );

    const hostAmount = Math.floor(feeCalculation.netAmountForHost);

    let hostWallet = await prisma.wallet.findUnique({
        where: { userId: hostId },
    });

    if (!hostWallet) {
        hostWallet = await prisma.wallet.create({
            data: {
                userId: hostId,
                balance: 0,
                currency: "XAF",
            },
        });
    }

    const [updatedWallet, transaction] = await prisma.$transaction([
        prisma.wallet.update({
            where: { id: hostWallet.id },
            data: { balance: { increment: hostAmount } },
        }),
        prisma.transaction.create({
            data: {
                userId: hostId,
                walletId: hostWallet.id,
                bookingId,
                amount: hostAmount,
                currency: "XAF",
                type: "PAYMENT",
                status: "COMPLETED",
                description: `Earnings from booking ${bookingId}`,
                reference: reference || `BOOKING-${bookingId}`,
                hostServiceFee: feeCalculation.hostServiceFee,
                guestServiceFee: feeCalculation.guestServiceFee,
                platformRevenue: feeCalculation.platformRevenue,
                netAmount: hostAmount,
                metadata: JSON.stringify({
                    bookingId,
                    originalAmount: booking.totalPrice,
                    feeCalculation,
                    ...payerMetadata,
                }),
            },
        }),
    ]);

    return {
        alreadyCredited: false,
        hostAmount,
        transactionId: transaction.id,
        walletBalance: updatedWallet.balance,
        feeCalculation,
    };
}

module.exports = { creditHostForBookingPayment };
