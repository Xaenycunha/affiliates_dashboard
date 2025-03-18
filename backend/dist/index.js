"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const affiliate_1 = __importDefault(require("./routes/affiliate"));
const case_1 = __importDefault(require("./routes/case"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/affiliate', affiliate_1.default);
app.use('/api/cases', case_1.default);
// MongoDB connection
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/affiliates-dashboard')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
const PORT = process.env.PORT || 5001;
// Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
