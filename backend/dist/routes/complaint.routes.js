"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const complaint_controller_1 = require("../controllers/complaint.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const complaint_validator_1 = require("../validators/complaint.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.post('/', (0, validation_middleware_1.validate)({ body: complaint_validator_1.createComplaintSchema }), complaint_controller_1.createComplaint);
router.get('/', complaint_controller_1.getComplaints);
router.get('/:id', complaint_controller_1.getComplaintById);
// Admins only can assign tickets
router.patch('/:id/assign', (0, auth_middleware_1.requireRole)(['SuperAdmin', 'SocietyAdmin']), (0, validation_middleware_1.validate)({ body: complaint_validator_1.assignComplaintSchema }), complaint_controller_1.assignComplaint);
// Assignees, admins, or staff can update status
router.patch('/:id/status', (0, auth_middleware_1.requireRole)(['SuperAdmin', 'SocietyAdmin', 'Staff', 'Vendor', 'ResidentOwner', 'ResidentTenant']), (0, validation_middleware_1.validate)({ body: complaint_validator_1.updateComplaintStatusSchema }), complaint_controller_1.updateComplaintStatus);
exports.default = router;
