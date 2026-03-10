import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  email: String,
  data: Object,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Recommendation', recommendationSchema);
Models  users.js:
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String
});

export default mongoose.model('User', userSchema);
