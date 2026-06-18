import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import registerRouter from './routes/register.js'; // Imports the new router

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', registerRouter); // This creates the endpoint: http://localhost:5000/api/register/step

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB database successfully.'))
  .catch((err) => console.error('Database connection error:', err));

// Start Server
app.listen(PORT, () => {
  console.log(`Server successfully running on port ${PORT}`);
});
