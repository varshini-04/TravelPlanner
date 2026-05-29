import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import tripRoutes from './routes/tripRoutes';

// Load environment variables, prioritizing local .env file settings
dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5001;

// CORS setup - allowing frontend origins with credentials (cookies)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  process.env.CLIENT_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Core Middlewares
app.use(express.json());
app.use(cookieParser());

// Database connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/travel-planner';
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
