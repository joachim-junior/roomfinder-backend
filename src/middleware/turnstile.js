/**
 * Cloudflare Turnstile verification middleware.
 *
 * Expects the client to send a `turnstileToken` field in the request body.
 * In development, if TURNSTILE_SECRET_KEY is not set, the check is skipped.
 */
const verifyTurnstile = async (req, res, next) => {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    // Skip verification if no secret key configured (local dev without Turnstile)
    if (!secretKey) {
        return next();
    }

    const token = req.body.turnstileToken;

    if (!token) {
        return res.status(400).json({
            error: "Verification required",
            message: "Please complete the CAPTCHA verification.",
        });
    }

    try {
        const response = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    secret: secretKey,
                    response: token,
                    remoteip: req.ip,
                }),
            }
        );

        const data = await response.json();

        if (!data.success) {
            return res.status(403).json({
                error: "Verification failed",
                message: "CAPTCHA verification failed. Please try again.",
            });
        }

        next();
    } catch (error) {
        console.error("Turnstile verification error:", error);
        // Don't block registration if Turnstile service is down
        next();
    }
};

module.exports = { verifyTurnstile };
