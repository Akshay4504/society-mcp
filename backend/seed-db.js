const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/society_maintenance_db';

// Define schemas locally to avoid TS/module transpile issues in seed script
const SocietySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  registrationNumber: { type: String, required: true, unique: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', default: null },
  flatDetails: {
    block: String,
    flatNumber: String,
    areaSqFt: Number,
    occupancyStatus: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ResidentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  block: { type: String, required: true },
  flatNumber: { type: String, required: true },
  status: { type: String, default: 'Active' },
  occupancyType: { type: String, required: true },
  moveInDate: { type: Date, default: Date.now },
  vehicles: Array,
  familyMembers: Array,
  emergencyContact: {
    name: String,
    relation: String,
    contactNumber: String
  }
}, { timestamps: true });

const MaintenanceBillSchema = new mongoose.Schema({
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  billingPeriod: { type: String, required: true },
  baseAmount: { type: Number, required: true },
  utilityCharges: { type: Number, default: 0 },
  penaltyAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, default: 'Unpaid' }
}, { timestamps: true });

const NoticeSchema = new mongoose.Schema({
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'General' },
  isPinned: { type: Boolean, default: false },
  targetAudience: { type: String, default: 'All' }
}, { timestamps: true });

async function seed() {
  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Connected to DB:', mongoUri.split('@').pop());

  // Define models
  const Society = mongoose.models.Society || mongoose.model('Society', SocietySchema);
  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  const Resident = mongoose.models.Resident || mongoose.model('Resident', ResidentSchema);
  const MaintenanceBill = mongoose.models.MaintenanceBill || mongoose.model('MaintenanceBill', MaintenanceBillSchema);
  const Notice = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);

  // Clear existing collections if they have anything, or keep them. Let's clear so we have a clean slate.
  console.log('Cleaning up existing database data...');
  await User.deleteMany({});
  await Society.deleteMany({});
  await Resident.deleteMany({});
  await MaintenanceBill.deleteMany({});
  await Notice.deleteMany({});

  console.log('Seeding Society: Emerald Greens...');
  const society = new Society({
    name: 'Emerald Greens',
    address: {
      street: '100 Green Avenue',
      city: 'Silicon Valley',
      state: 'CA',
      zipCode: '94025',
      country: 'USA'
    },
    registrationNumber: 'REG-123456',
    contactEmail: 'contact@emeraldgreens.com',
    contactPhone: '1-800-555-0199'
  });
  await society.save();
  console.log('Society created with ID:', society._id);

  console.log('Hashing passwords...');
  const salt = await bcrypt.genSalt(12);
  const residentPasswordHash = await bcrypt.hash('password123', salt);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const vendorPasswordHash = await bcrypt.hash('vendor123', salt);

  console.log('Seeding Resident User: resident@emerald.com...');
  const residentUser = new User({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'resident@emerald.com',
    passwordHash: residentPasswordHash,
    phone: '9876543210',
    role: 'ResidentOwner',
    societyId: society._id,
    flatDetails: {
      block: 'A',
      flatNumber: '402',
      areaSqFt: 1200,
      occupancyStatus: 'occupied'
    }
  });
  await residentUser.save();

  console.log('Creating Resident profile for Jane Doe...');
  const residentProfile = new Resident({
    userId: residentUser._id,
    societyId: society._id,
    block: 'A',
    flatNumber: '402',
    status: 'Active',
    occupancyType: 'Owner',
    moveInDate: new Date('2025-01-01'),
    vehicles: [
      { vehicleNumber: 'CA-94025-12', vehicleType: '4-wheeler', parkingSlotNumber: 'P-402' }
    ],
    familyMembers: [
      { name: 'John Doe', relation: 'Spouse', contactNumber: '9876543219' }
    ],
    emergencyContact: {
      name: 'Bob Smith',
      relation: 'Friend',
      contactNumber: '9876543218'
    }
  });
  await residentProfile.save();

  console.log('Seeding Maintenance Bill for Jane Doe...');
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 15);
  const bill = new MaintenanceBill({
    societyId: society._id,
    userId: residentUser._id,
    billingPeriod: 'June 2026',
    baseAmount: 2800,
    utilityCharges: 400,
    penaltyAmount: 0,
    totalAmount: 3200,
    dueDate,
    status: 'Unpaid'
  });
  await bill.save();

  console.log('Seeding Society Admin User: admin@emerald.com...');
  const adminUser = new User({
    firstName: 'Arthur',
    lastName: 'Pendragon',
    email: 'admin@emerald.com',
    passwordHash: adminPasswordHash,
    phone: '9876543211',
    role: 'SocietyAdmin',
    societyId: society._id
  });
  await adminUser.save();

  console.log('Seeding Vendor User: plumber@primefix.com...');
  const vendorUser = new User({
    firstName: 'Mario',
    lastName: 'Plumber',
    email: 'plumber@primefix.com',
    passwordHash: vendorPasswordHash,
    phone: '9876543212',
    role: 'Vendor',
    societyId: null
  });
  await vendorUser.save();

  console.log('Seeding Bulletin Notices for Emerald Greens...');
  await Notice.create([
    {
      societyId: society._id,
      authorId: adminUser._id,
      title: 'Annual General Body Meeting Scheduled',
      content: 'The Annual General Body Meeting (GBM) for our society is scheduled for June 28th, 2026 at 10:00 AM in the Community Hall. Attendance of all resident owners is requested to discuss maintenance budgets, security measures, and facility upgrades.',
      category: 'General',
      isPinned: true,
      targetAudience: 'All'
    },
    {
      societyId: society._id,
      authorId: adminUser._id,
      title: 'Elevator Service Downtime',
      content: 'Routine elevator servicing will take place on Wednesday, June 17th from 2:00 PM to 4:00 PM. Elevators in Wing A and Wing B will be shut down sequentially. Please plan your commutes accordingly.',
      category: 'Emergency',
      isPinned: false,
      targetAudience: 'All'
    }
  ]);

  console.log('Database Seeding Completed Successfully!');
  await mongoose.disconnect();
}

seed().catch(console.error);
