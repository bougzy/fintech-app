// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import bcrypt from 'bcryptjs';
// import path from 'path';
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// const JWT_SECRET = process.env.JWT_SECRET || 'CGlsHvHtd9';
// const ADMIN_USERNAME = 'admin';
// const ADMIN_PASSWORD = 'adminpassword123'; // This should be stored securely, not hardcoded

// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://xaky:xaky@xaky.ui23qhe.mongodb.net/xaky';

// mongoose.connect(MONGODB_URI)
// .then(() => console.log('Connected to MongoDB'))
// .catch(err => console.error('MongoDB connection error:', err));

// // Schemas
// const messageSchema = new mongoose.Schema({
//     from: { type: String, enum: ['admin', 'user'], required: true },
//     content: { type: String, required: true },
//     timestamp: { type: Date, default: Date.now }
// });

// const userSchema = new mongoose.Schema({
//     username: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     amount: { type: Number, default: 0 },
//     profitBalance: { type: Number, default: 0 },
//     referralCode: { type: String, unique: true },
//     referralLink: { type: String, unique: true },
//     referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     points: { type: Number, default: 0 },
//     lastDeposit: { type: Date },
//     isBlocked: { type: Boolean, default: false },
//     messages: [messageSchema]
// });

// const depositSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     amount: Number,
//     profitBalance: { type: Number, default: 0 },
//     lastProfitUpdate: { type: Date, default: Date.now },
//     timestamp: { type: Date, default: Date.now },
//     status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
// });

// const withdrawalSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     amount: { type: Number, required: true },
//     paymentMethod: { type: String, required: true },
//     cryptoWalletType: { type: String },
//     cryptoWalletAddress: { type: String },
//     accountName: { type: String },
//     accountNumber: { type: String },
//     bankName: { type: String },
//     bankBranch: { type: String },
//     timestamp: { type: Date, default: Date.now },
//     status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
// });

// // Models
// const User = mongoose.model('User', userSchema);
// const Deposit = mongoose.model('Deposit', depositSchema);
// const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

// // Middleware
// app.use(express.json());
// app.use(cors({
//     origin: process.env.CLIENT_ORIGIN || 'https://your-client-app-domain.com',
//     credentials: true
// }));
// app.use(express.static(path.join(__dirname, 'public')));

// // Helper functions
// const generateReferralCode = () => {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     return Array.from({ length: 8 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
// };

// const requireAuth = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     if (!authHeader) {
//         return res.status(401).json({ error: 'Unauthorized' });
//     }

//     const token = authHeader.split(' ')[1];
//     if (!token) {
//         return res.status(401).json({ error: 'Unauthorized' });
//     }

//     jwt.verify(token, JWT_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({ error: 'Unauthorized' });
//         }
//         req.userId = decoded.userId;
//         next();
//     });
// };

// const requireAdmin = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     if (!authHeader) {
//         return res.status(401).json({ error: 'Unauthorized' });
//     }

//     const token = authHeader.split(' ')[1];
//     if (!token) {
//         return res.status(401).json({ error: 'Unauthorized' });
//     }

//     jwt.verify(token, JWT_SECRET, (err, decoded) => {
//         if (err || decoded.role !== 'admin') {
//             return res.status(401).json({ error: 'Unauthorized' });
//         }
//         next();
//     });
// };

// const updateProfitBalance = async (userId) => {
//     const deposit = await Deposit.findOne({ userId, status: 'approved' });
//     if (!deposit) return;
    
//     const now = new Date();
//     const elapsedTime = now.getTime() - deposit.lastProfitUpdate.getTime();
//     const daysElapsed = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));
    
//     if (daysElapsed > 0) {
//         const dailyProfit = (deposit.amount * 0.2) / 7;
//         const profitToAdd = dailyProfit * daysElapsed;
        
//         deposit.profitBalance += profitToAdd;
//         deposit.lastProfitUpdate = now;
//         await deposit.save();

//         const user = await User.findById(userId);
//         if (user) {
//             user.profitBalance += profitToAdd;
//             await user.save();
//         }
//     }
// };

// // Routes
// app.post('/api/register', async (req, res) => {
//     const { username, email, password, referral } = req.body;
//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = new User({ 
//             username, 
//             email, 
//             password: hashedPassword,
//             referralCode: generateReferralCode(),
//             referralLink: `https://your-domain.com/register?referral=${generateReferralCode()}`
//         });

//         if (referral) {
//             const referrer = await User.findOne({ referralCode: referral });
//             if (referrer) {
//                 referrer.referrals.push(user._id);
//                 referrer.points += 1;

//                 if (referrer.points >= 5) {
//                     referrer.amount += 100;
//                     referrer.points = 0;
//                 }

//                 await referrer.save();
//             }
//         }

//         await user.save();
//         res.status(201).json({ message: 'User registered successfully' });
//     } catch (error) {
//         console.error('Error during registration:', error);
//         if (error.code === 11000) {
//             res.status(400).json({ error: 'Email or referral code already exists' });
//         } else {
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     }
// });

// app.post('/api/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ email }).select('+password');
//         if (user && !user.isBlocked && await bcrypt.compare(password, user.password)) {
//             const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
//             res.status(200).json({ token });
//         } else {
//             res.status(401).json({ error: 'Invalid credentials or account is blocked' });
//         }
//     } catch (error) {
//         console.error('Error during login:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.post('/api/admin/login', async (req, res) => {
//     const { username, password } = req.body;
//     if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
//         const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
//         res.status(200).json({ token });
//     } else {
//         res.status(401).json({ error: 'Invalid admin credentials' });
//     }
// });

// app.post('/api/deposit', requireAuth, async (req, res) => {
//     const { amount } = req.body;
//     try {
//         const user = await User.findById(req.userId);
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const now = new Date();
//         const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

//         if (user.lastDeposit && user.lastDeposit > sevenDaysAgo) {
//             return res.status(400).json({ error: 'You can only make a deposit once every seven days' });
//         }

//         const newDeposit = new Deposit({
//             userId: user._id,
//             amount: amount,
//             profitBalance: 0
//         });

//         await newDeposit.save();
//         user.lastDeposit = now;
//         await user.save();

//         res.status(200).json({ message: 'Deposit request submitted successfully', newDeposit });
//     } catch (error) {
//         console.error('Error during deposit:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.post('/api/withdraw', requireAuth, async (req, res) => {
//     const { amount, paymentMethod, cryptoWalletType, cryptoWalletAddress, accountName, accountNumber, bankName, bankBranch } = req.body;
//     try {
//         const user = await User.findById(req.userId);
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         if (user.amount < amount) {
//             return res.status(400).json({ error: 'Insufficient balance' });
//         }

//         user.amount -= amount;
//         await user.save();

//         const newWithdrawal = new Withdrawal({
//             userId: user._id,
//             amount,
//             paymentMethod,
//             cryptoWalletType,
//             cryptoWalletAddress,
//             accountName,
//             accountNumber,
//             bankName,
//             bankBranch
//         });

//         await newWithdrawal.save();
//         res.status(200).json({ message: 'Withdrawal request submitted successfully', newWithdrawal });
//     } catch (error) {
//         console.error('Error during withdrawal:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.post('/api/messages', requireAuth, async (req, res) => {
//     const { content } = req.body;
//     try {
//         const user = await User.findById(req.userId);
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const message = { from: 'user', content, timestamp: new Date() };
//         user.messages.push(message);
//         await user.save();

//         res.status(201).json({ message: 'Message sent successfully', message });
//     } catch (error) {
//         console.error('Error sending message:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.post('/api/admin/messages', requireAdmin, async (req, res) => {
//     const { userId, content } = req.body;
//     try {
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const message = { from: 'admin', content, timestamp: new Date() };
//         user.messages.push(message);
//         await user.save();

//         res.status(201).json({ message: 'Message sent successfully', message });
//     } catch (error) {
//         console.error('Error sending admin message:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.put('/api/admin/block/:userId', requireAdmin, async (req, res) => {
//     const { userId } = req.params;
//     try {
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         user.isBlocked = true;
//         await user.save();

//         res.status(200).json({ message: 'User blocked successfully' });
//     } catch (error) {
//         console.error('Error blocking user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.put('/api/admin/unblock/:userId', requireAdmin, async (req, res) => {
//     const { userId } = req.params;
//     try {
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         user.isBlocked = false;
//         await user.save();

//         res.status(200).json({ message: 'User unblocked successfully' });
//     } catch (error) {
//         console.error('Error unblocking user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.get('/api/admin/users', requireAdmin, async (req, res) => {
//     try {
//         const users = await User.find().populate('referrals', 'username email');
//         res.status(200).json(users);
//     } catch (error) {
//         console.error('Error fetching users:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.get('/api/admin/deposits', requireAdmin, async (req, res) => {
//     try {
//         const deposits = await Deposit.find().populate('userId', 'username email');
//         res.status(200).json(deposits);
//     } catch (error) {
//         console.error('Error fetching deposits:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.get('/api/admin/withdrawals', requireAdmin, async (req, res) => {
//     try {
//         const withdrawals = await Withdrawal.find().populate('userId', 'username email');
//         res.status(200).json(withdrawals);
//     } catch (error) {
//         console.error('Error fetching withdrawals:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Static files route
// app.use('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });



import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpassword123';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://flow:flow@cluster0.pakdwel.mongodb.net/flow';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const messageSchema = new mongoose.Schema({
    from: { type: String, enum: ['admin', 'user'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    amount: { type: Number, default: 0 },
    profitBalance: { type: Number, default: 0 },
    referralCode: { type: String, unique: true },
    referralLink: { type: String, unique: true },
    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    points: { type: Number, default: 0 },
    lastDeposit: { type: Date },
    isBlocked: { type: Boolean, default: false },
    messages: [messageSchema]
});

const depositSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    profitBalance: { type: Number, default: 0 },
    lastProfitUpdate: { type: Date, default: Date.now },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

const withdrawalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    cryptoWalletType: { type: String },
    cryptoWalletAddress: { type: String },
    accountName: { type: String },
    accountNumber: { type: String },
    bankName: { type: String },
    bankBranch: { type: String },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

// Models
const User = mongoose.model('User', userSchema);
const Deposit = mongoose.model('Deposit', depositSchema);
const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

// Helper functions
const generateReferralCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 8 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
};

const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.userId = decoded.userId;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || decoded.role !== 'admin') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    });
};

const updateProfitBalance = async (userId) => {
    const deposits = await Deposit.find({ userId, status: 'approved' });
    if (deposits.length === 0) return;

    const now = new Date();
    let totalProfitToAdd = 0;

    for (const deposit of deposits) {
        const elapsedTime = now.getTime() - deposit.lastProfitUpdate.getTime();
        const daysElapsed = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));

        if (daysElapsed > 0) {
            const dailyProfit = (deposit.amount * 0.2) / 7;
            const profitToAdd = dailyProfit * daysElapsed;

            totalProfitToAdd += profitToAdd;
            deposit.profitBalance += profitToAdd;
            deposit.lastProfitUpdate = now;
            await deposit.save();
        }
    }

    const user = await User.findById(userId);
    if (user) {
        user.profitBalance += totalProfitToAdd;
        await user.save();
    }
};

const calculateReferralBonus = async (userId) => {
    const user = await User.findById(userId).populate('referrals');
    if (!user) return;

    let totalBonus = 0;
    user.referrals.forEach(referral => {
        if (referral.referrals.length >= 5) {
            totalBonus += 100;
        }
    });

    if (totalBonus > 0) {
        user.amount += totalBonus;
        await user.save();
    }
};

// Routes
app.post('/api/register', async (req, res) => {
    const { username, email, password, referral } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            referralCode: generateReferralCode(),
            referralLink: `https://your-domain.com/register?referral=${generateReferralCode()}`
        });

        if (referral) {
            const referrer = await User.findOne({ referralCode: referral });
            if (referrer) {
                referrer.referrals.push(user._id);
                referrer.points += 1;

                // Calculate bonus for the referrer
                if (referrer.points >= 5) {
                    referrer.amount += 100;
                    referrer.points = 0;
                }

                await referrer.save();
            }
        }

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        if (error.code === 11000) {
            res.status(400).json({ error: 'Email or referral code already exists' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (user && !user.isBlocked && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
            res.status(200).json({ token });
        } else {
            res.status(401).json({ error: 'Invalid credentials or account is blocked' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token });
    } else {
        res.status(401).json({ error: 'Invalid admin credentials' });
    }
});

app.post('/api/deposit', requireAuth, async (req, res) => {
    const { amount } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Check if a deposit was made in the last 7 days
        if (user.lastDeposit && user.lastDeposit > sevenDaysAgo) {
            return res.status(400).json({ error: 'Deposit already made within the last 7 days' });
        }

        user.lastDeposit = now;
        await user.save();

        const deposit = new Deposit({
            userId: req.userId,
            amount
        });

        await deposit.save();
        res.status(201).json({ message: 'Deposit successful' });
    } catch (error) {
        console.error('Error during deposit:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/withdrawal', requireAuth, async (req, res) => {
    const { amount, paymentMethod, cryptoWalletType, cryptoWalletAddress, accountName, accountNumber, bankName, bankBranch } = req.body;
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.amount < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        const withdrawal = new Withdrawal({
            userId: req.userId,
            amount,
            paymentMethod,
            cryptoWalletType,
            cryptoWalletAddress,
            accountName,
            accountNumber,
            bankName,
            bankBranch
        });

        await withdrawal.save();
        res.status(201).json({ message: 'Withdrawal request submitted successfully' });
    } catch (error) {
        console.error('Error during withdrawal:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/admin/deposit/:id/approve', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const deposit = await Deposit.findById(id);
        if (!deposit) {
            return res.status(404).json({ error: 'Deposit not found' });
        }

        if (deposit.status === 'approved') {
            return res.status(400).json({ error: 'Deposit already approved' });
        }

        deposit.status = 'approved';
        await deposit.save();

        await updateProfitBalance(deposit.userId);

        res.status(200).json({ message: 'Deposit approved successfully' });
    } catch (error) {
        console.error('Error approving deposit:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/admin/deposit/:id/reject', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const deposit = await Deposit.findById(id);
        if (!deposit) {
            return res.status(404).json({ error: 'Deposit not found' });
        }

        if (deposit.status === 'rejected') {
            return res.status(400).json({ error: 'Deposit already rejected' });
        }

        deposit.status = 'rejected';
        await deposit.save();

        res.status(200).json({ message: 'Deposit rejected successfully' });
    } catch (error) {
        console.error('Error rejecting deposit:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/admin/withdrawal/:id/approve', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const withdrawal = await Withdrawal.findById(id);
        if (!withdrawal) {
            return res.status(404).json({ error: 'Withdrawal not found' });
        }

        if (withdrawal.status === 'approved') {
            return res.status(400).json({ error: 'Withdrawal already approved' });
        }

        withdrawal.status = 'approved';
        await withdrawal.save();

        res.status(200).json({ message: 'Withdrawal approved successfully' });
    } catch (error) {
        console.error('Error approving withdrawal:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/admin/withdrawal/:id/reject', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const withdrawal = await Withdrawal.findById(id);
        if (!withdrawal) {
            return res.status(404).json({ error: 'Withdrawal not found' });
        }

        if (withdrawal.status === 'rejected') {
            return res.status(400).json({ error: 'Withdrawal already rejected' });
        }

        withdrawal.status = 'rejected';
        await withdrawal.save();

        res.status(200).json({ message: 'Withdrawal rejected successfully' });
    } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/admin/user/:id/block', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isBlocked) {
            return res.status(400).json({ error: 'User already blocked' });
        }

        user.isBlocked = true;
        await user.save();

        res.status(200).json({ message: 'User blocked successfully' });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/admin/user/:id/unblock', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.isBlocked) {
            return res.status(400).json({ error: 'User is not blocked' });
        }

        user.isBlocked = false;
        await user.save();

        res.status(200).json({ message: 'User unblocked successfully' });
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/admin/deposits', requireAdmin, async (req, res) => {
    try {
        const deposits = await Deposit.find().populate('userId');
        res.status(200).json(deposits);
    } catch (error) {
        console.error('Error fetching deposits:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/admin/withdrawals', requireAdmin, async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find().populate('userId');
        res.status(200).json(withdrawals);
    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
