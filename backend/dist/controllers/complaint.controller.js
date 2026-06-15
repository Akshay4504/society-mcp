"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComplaintStatus = exports.assignComplaint = exports.getComplaintById = exports.getComplaints = exports.createComplaint = void 0;
const Complaint_1 = require("../models/Complaint");
const ai_service_1 = require("../services/ai.service");
const appError_1 = require("../utils/appError");
const mongoose_1 = __importDefault(require("mongoose"));
const createComplaint = async (req, res, next) => {
    try {
        const { title, description, images } = req.body;
        if (!req.user || !req.user.societyId) {
            return next(new appError_1.AppError('User must belong to a housing society to file a complaint', 400));
        }
        // Call AI service to auto-triage
        const aiAnalysis = await ai_service_1.AiService.analyzeComplaint(title, description);
        const newComplaint = new Complaint_1.Complaint({
            societyId: req.user.societyId,
            raisedBy: req.user.id,
            title,
            description,
            images: images || [],
            status: 'Open',
            aiAnalysis
        });
        await newComplaint.save();
        return res.status(201).json({
            success: true,
            data: newComplaint
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createComplaint = createComplaint;
const getComplaints = async (req, res, next) => {
    try {
        if (!req.user || !req.user.societyId) {
            return next(new appError_1.AppError('Unauthorized access: No associated society', 400));
        }
        let filter = { societyId: req.user.societyId };
        // Residents can only see their own tickets, Admins/Staff/Vendors see all tickets in their society
        if (req.user.role === 'ResidentOwner' || req.user.role === 'ResidentTenant') {
            filter.raisedBy = req.user.id;
        }
        else if (req.user.role === 'Vendor') {
            // Vendors see tickets assigned to them
            filter.assignedTo = req.user.id;
        }
        const complaints = await Complaint_1.Complaint.find(filter)
            .populate('raisedBy', 'firstName lastName flatDetails')
            .populate('assignedTo', 'firstName lastName role phone')
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getComplaints = getComplaints;
const getComplaintById = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new appError_1.AppError('Unauthorized', 401));
        const complaint = await Complaint_1.Complaint.findById(req.params.id)
            .populate('raisedBy', 'firstName lastName phone flatDetails')
            .populate('assignedTo', 'firstName lastName role phone');
        if (!complaint) {
            return next(new appError_1.AppError('Complaint not found', 404));
        }
        // Access control: Ensure user belongs to the same society
        if (complaint.societyId.toString() !== req.user.societyId?.toString()) {
            return next(new appError_1.AppError('Access denied', 403));
        }
        return res.status(200).json({ success: true, data: complaint });
    }
    catch (error) {
        next(error);
    }
};
exports.getComplaintById = getComplaintById;
const assignComplaint = async (req, res, next) => {
    try {
        const { assignedTo } = req.body;
        const complaint = await Complaint_1.Complaint.findById(req.params.id);
        if (!complaint) {
            return next(new appError_1.AppError('Complaint not found', 404));
        }
        if (complaint.societyId.toString() !== req.user?.societyId?.toString()) {
            return next(new appError_1.AppError('Unauthorized: Ticket belongs to another society', 403));
        }
        complaint.assignedTo = new mongoose_1.default.Types.ObjectId(assignedTo);
        complaint.status = 'Assigned';
        await complaint.save();
        return res.status(200).json({ success: true, message: 'Complaint assigned successfully', data: complaint });
    }
    catch (error) {
        next(error);
    }
};
exports.assignComplaint = assignComplaint;
const updateComplaintStatus = async (req, res, next) => {
    try {
        const { status, notes, feedbackRating, feedbackComments } = req.body;
        const complaint = await Complaint_1.Complaint.findById(req.params.id);
        if (!complaint) {
            return next(new appError_1.AppError('Complaint not found', 404));
        }
        if (complaint.societyId.toString() !== req.user?.societyId?.toString()) {
            return next(new appError_1.AppError('Unauthorized: Ticket belongs to another society', 403));
        }
        if (status) {
            complaint.status = status;
            if (status === 'Resolved' || status === 'Closed') {
                complaint.resolutionDetails = {
                    resolvedAt: new Date(),
                    notes: notes || 'Resolved by technician.',
                    feedbackRating,
                    feedbackComments
                };
            }
        }
        await complaint.save();
        return res.status(200).json({ success: true, message: 'Status updated successfully', data: complaint });
    }
    catch (error) {
        next(error);
    }
};
exports.updateComplaintStatus = updateComplaintStatus;
