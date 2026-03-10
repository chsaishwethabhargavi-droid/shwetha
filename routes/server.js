import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());


mongoose.connect('mongodb://localhost:27017/fertilizerDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});


app.use('/api', apiRoutes);


app.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});
