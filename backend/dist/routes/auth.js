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
const referral_1 = require("../utils/referral");
const router = express_1.default.Router();
// Register new affiliate
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received registration request:', req.body);
        const { name, email, password } = req.body;
        // Check if affiliate already exists
        console.log('Checking if affiliate exists...');
        const existingAffiliate = yield Affiliate_1.default.findOne({ email });
        if (existingAffiliate) {
            console.log('Affiliate already exists');
            return res.status(400).json({ message: 'Email already registered' });
        }
        // Generate referral code
        console.log('Generating referral code...');
        const referralCode = yield (0, referral_1.generateReferralCode)();
        console.log('Generated referral code:', referralCode);
        // Create new affiliate with the resolved referral code
        console.log('Creating new affiliate...');
        const affiliate = new Affiliate_1.default({
            name,
            email,
            password,
            referralCode: referralCode // This is now a string, not a Promise
        });
        console.log('Saving affiliate...');
        yield affiliate.save();
        console.log('Affiliate saved successfully');
        // Generate JWT token
        console.log('Generating JWT token...');
        const token = jsonwebtoken_1.default.sign({ id: affiliate._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        console.log('Registration successful');
        res.status(201).json({
            token,
            affiliate: {
                id: affiliate._id,
                name: affiliate.name,
                email: affiliate.email,
                referralCode: affiliate.referralCode
            }
        });
    }
    catch (error) {
        console.error('Error in registration:', error);
        res.status(500).json({ message: 'Error creating affiliate', error: error.message });
    }
}));
// Login affiliate
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find affiliate
        const affiliate = yield Affiliate_1.default.findOne({ email });
        if (!affiliate) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Check password
        const isMatch = yield affiliate.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: affiliate._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        res.json({
            token,
            affiliate: {
                id: affiliate._id,
                name: affiliate.name,
                email: affiliate.email,
                referralCode: affiliate.referralCode
            }
        });
    }
    catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
}));
exports.default = router;
