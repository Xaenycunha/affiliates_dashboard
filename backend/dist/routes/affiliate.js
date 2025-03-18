"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Affiliate_1 = __importDefault(require("../models/Affiliate"));
const Visit_1 = __importDefault(require("../models/Visit"));
const Case_1 = __importDefault(require("../models/Case"));
const router = express_1.default.Router();
// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};
// Update affiliate profile
router.put('/profile', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, bankData } = req.body;
        const affiliate = yield Affiliate_1.default.findByIdAndUpdate(req.user.id, { phone, bankData }, { new: true });
        if (!affiliate) {
            return res.status(404).json({ message: 'Affiliate not found' });
        }
        res.json(affiliate);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
}));
// Get affiliate dashboard data
router.get('/dashboard', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        const affiliateId = req.user.id;
        // Get visits count
        const visits = yield Visit_1.default.find({
            affiliateId,
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).count();
        // Get cases statistics
        const cases = yield Case_1.default.find({ affiliateId });
        const casesStats = {
            total: cases.length,
            pending: cases.filter(c => c.status === 'pending').length,
            won: cases.filter(c => c.status === 'won').length,
            lost: cases.filter(c => c.status === 'lost').length
        };
        // Get affiliate data
        const affiliate = yield Affiliate_1.default.findById(affiliateId)
            .select('-password');
        res.json({
            visits,
            casesStats,
            affiliate
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
}));
// Track visit
router.post('/track-visit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { referralCode } = req.query;
        const { ipAddress, userAgent } = req.body;
        const affiliate = yield Affiliate_1.default.findOne({ referralCode });
        if (!affiliate) {
            return res.status(404).json({ message: 'Invalid referral code' });
        }
        const visit = new Visit_1.default({
            affiliateId: affiliate._id,
            ipAddress,
            userAgent
        });
        yield visit.save();
        res.status(201).json({ message: 'Visit tracked successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error tracking visit' });
    }
}));
exports.default = router;
