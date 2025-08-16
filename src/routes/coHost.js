const express = require("express");
const router = express.Router();
const coHostController = require("../controllers/coHostController");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { body } = require("express-validator");

// Validation middleware
const validateInviteCoHost = [
  body("email").isEmail().withMessage("Please provide a valid email address"),
  body("permissions")
    .isArray()
    .withMessage("Permissions must be an array")
    .custom((value) => {
      const validPermissions = [
        "VIEW_ONLY",
        "MANAGE_BOOKINGS",
        "MANAGE_PROPERTY",
        "MANAGE_FINANCES",
        "FULL_ACCESS",
      ];
      return value.every((permission) => validPermissions.includes(permission));
    })
    .withMessage("Invalid permission values"),
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),
];

const validateUpdatePermissions = [
  body("permissions")
    .isArray()
    .withMessage("Permissions must be an array")
    .custom((value) => {
      const validPermissions = [
        "VIEW_ONLY",
        "MANAGE_BOOKINGS",
        "MANAGE_PROPERTY",
        "MANAGE_FINANCES",
        "FULL_ACCESS",
      ];
      return value.every((permission) => validPermissions.includes(permission));
    })
    .withMessage("Invalid permission values"),
  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),
];

// All routes require authentication
router.use(authenticateToken);

// Get co-host invitations for current user
router.get("/invitations", coHostController.getMyCoHostInvitations);

// Accept co-host invitation
router.put(
  "/invitations/:invitationId/accept",
  coHostController.acceptCoHostInvitation
);

// Decline co-host invitation
router.put(
  "/invitations/:invitationId/decline",
  coHostController.declineCoHostInvitation
);

// Leave co-host position (for co-hosts)
router.put("/:coHostId/leave", coHostController.leaveCoHostPosition);

// Check permissions for a property
router.get("/permissions/:propertyId", coHostController.checkPermission);

// Property-specific routes (require host or co-host access)
router.get("/property/:propertyId", coHostController.getPropertyCoHosts);

// Host-only routes (require HOST role)
router.use(requireRole(["HOST", "ADMIN"]));

// Invite co-host to property
router.post(
  "/property/:propertyId/invite",
  validateInviteCoHost,
  coHostController.inviteCoHost
);

// Update co-host permissions
router.put(
  "/:coHostId/permissions",
  validateUpdatePermissions,
  coHostController.updateCoHostPermissions
);

// Suspend co-host
router.put("/:coHostId/suspend", coHostController.suspendCoHost);

// Reactivate co-host
router.put("/:coHostId/reactivate", coHostController.reactivateCoHost);

// Remove co-host
router.delete("/:coHostId", coHostController.removeCoHost);

module.exports = router;
