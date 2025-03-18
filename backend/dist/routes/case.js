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
// Get all cases for an affiliate
router.get('/', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, startDate, endDate } = req.query;
        const query = { affiliateId: req.user.id };
        if (status) {
            query.status = status;
        }
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const cases = yield Case_1.default.find(query).sort({ createdAt: -1 });
        res.json(cases);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching cases' });
    }
}));
// Get case statistics
router.get('/stats', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cases = yield Case_1.default.find({ affiliateId: req.user.id });
        const stats = {
            total: cases.length,
            pending: cases.filter(c => c.status === 'pending').length,
            won: cases.filter(c => c.status === 'won').length,
            lost: cases.filter(c => c.status === 'lost').length
        };
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching case statistics' });
    }
}));
// Create new case
router.post('/', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { flightNumber, airline, description } = req.body;
        const newCase = new Case_1.default({
            affiliateId: req.user.id,
            flightNumber,
            airline,
            description,
            status: 'pending'
        });
        yield newCase.save();
        res.status(201).json(newCase);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating case' });
    }
}));
// Update case status
router.patch('/:id/status', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const updatedCase = yield Case_1.default.findOneAndUpdate({ _id: req.params.id, affiliateId: req.user.id }, { status }, { new: true });
        if (!updatedCase) {
            return res.status(404).json({ message: 'Case not found' });
        }
        res.json(updatedCase);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating case status' });
    }
}));
exports.default = router;
