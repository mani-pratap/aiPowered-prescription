import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import diseaseAnalysisRoutes from './routes/diseaseAnalysisRoutes.js';
import genericRoutes from './routes/genericRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply the rate limiting middleware to API calls only
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/disease-analysis', diseaseAnalysisRoutes);
app.use('/api/generic', genericRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/food', foodRoutes);
// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
