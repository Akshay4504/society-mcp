"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVendorRating = exports.deleteVendor = exports.updateVendor = exports.getVendorById = exports.getVendors = exports.createVendor = void 0;
const Vendor_1 = require("../models/Vendor");
const appError_1 = require("../utils/appError");
const createVendor = async (req, res, next) => {
    try {
        const { name, category, contactPerson, email, phone, status, address, contracts } = req.body;
        const societyId = req.user?.societyId;
        if (!societyId) {
            return next(new appError_1.AppError('Admin must belong to a society to register vendors', 400));
        }
        const vendor = new Vendor_1.Vendor({
            societyId,
            name,
            category,
            contactPerson,
            email,
            phone,
            status: status || 'Active',
            address,
            contracts: contracts || [],
            ratings: []
        });
        await vendor.save();
        return res.status(201).json({
            success: true,
            data: vendor
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createVendor = createVendor;
const getVendors = async (req, res, next) => {
    try {
        const societyId = req.user?.societyId;
        if (!societyId) {
            return next(new appError_1.AppError('Unauthorized: No society association found', 400));
        }
        const filter = { societyId };
        if (req.query.category)
            filter.category = String(req.query.category);
        if (req.query.status)
            filter.status = String(req.query.status);
        const vendors = await Vendor_1.Vendor.find(filter).sort({ averageRating: -1, name: 1 });
        return res.status(200).json({
            success: true,
            count: vendors.length,
            data: vendors
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendors = getVendors;
const getVendorById = async (req, res, next) => {
    try {
        const vendor = await Vendor_1.Vendor.findById(req.params.id)
            .populate('ratings.givenBy', 'firstName lastName');
        if (!vendor) {
            return next(new appError_1.AppError('Vendor not found', 404));
        }
        if (vendor.societyId.toString() !== req.user?.societyId?.toString()) {
            return next(new appError_1.AppError('Forbidden: Access denied', 403));
        }
        return res.status(200).json({
            success: true,
            data: vendor
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendorById = getVendorById;
const updateVendor = async (req, res, next) => {
    try {
        const vendor = await Vendor_1.Vendor.findById(req.params.id);
        if (!vendor) {
            return next(new appError_1.AppError('Vendor not found', 404));
        }
        // Admin only in same society
        const isAdmin = req.user?.role === 'SuperAdmin' || req.user?.role === 'SocietyAdmin';
        const sameSociety = vendor.societyId.toString() === req.user?.societyId?.toString();
        if (!isAdmin || !sameSociety) {
            return next(new appError_1.AppError('Forbidden: Access denied', 403));
        }
        // Omit reviews ratings manually updating
        const fieldsToUpdate = { ...req.body };
        delete fieldsToUpdate.ratings;
        delete fieldsToUpdate.averageRating;
        Object.assign(vendor, fieldsToUpdate);
        await vendor.save();
        return res.status(200).json({
            success: true,
            message: 'Vendor details updated successfully',
            data: vendor
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateVendor = updateVendor;
const deleteVendor = async (req, res, next) => {
    try {
        const vendor = await Vendor_1.Vendor.findById(req.params.id);
        if (!vendor) {
            return next(new appError_1.AppError('Vendor not found', 404));
        }
        // Admin only in same society
        const isAdmin = req.user?.role === 'SuperAdmin' || req.user?.role === 'SocietyAdmin';
        const sameSociety = vendor.societyId.toString() === req.user?.societyId?.toString();
        if (!isAdmin || !sameSociety) {
            return next(new appError_1.AppError('Forbidden: Access denied', 403));
        }
        await Vendor_1.Vendor.deleteOne({ _id: vendor._id });
        return res.status(200).json({
            success: true,
            message: 'Vendor deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteVendor = deleteVendor;
const addVendorRating = async (req, res, next) => {
    try {
        const { rating, review } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return next(new appError_1.AppError('Unauthorized: Logged-in user required', 401));
        }
        const vendor = await Vendor_1.Vendor.findById(req.params.id);
        if (!vendor) {
            return next(new appError_1.AppError('Vendor not found', 404));
        }
        if (vendor.societyId.toString() !== req.user?.societyId?.toString()) {
            return next(new appError_1.AppError('Forbidden: Access denied', 403));
        }
        // Push new rating
        vendor.ratings.push({
            rating,
            review,
            givenBy: userId,
            date: new Date()
        });
        // Save will trigger the pre-save aggregate to compute average rating
        await vendor.save();
        return res.status(200).json({
            success: true,
            message: 'Vendor rating submitted successfully',
            data: vendor
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addVendorRating = addVendorRating;
