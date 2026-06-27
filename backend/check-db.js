const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/society_maintenance_db';

async function check() {
  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Connected to:', mongoUri.split('@').pop());
  
  const User = mongoose.model('User', new mongoose.Schema({
    email: String,
    role: String,
    firstName: String,
    lastName: String
  }));

  const users = await User.find({});
  console.log(`Found ${users.length} users in the database.`);
  if (users.length > 0) {
    users.forEach(u => {
      console.log(`- ${u.firstName} ${u.lastName} (${u.email}) - Role: ${u.role}`);
    });
  } else {
    console.log('No users found.');
  }

  await mongoose.disconnect();
}

check().catch(console.error);
