import 'dotenv/config';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import Partner from '../models/Partner.js';

async function seedUsers() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB:', mongoose.connection.host);

  const defaultPassword = 'Password@123';
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(defaultPassword, salt);

  const testAccounts = [
    {
      name: 'Himalayan Traveler',
      email: 'traveler@discovery.com',
      password: hashedPassword,
      role: 'user',
      isEmailVerified: true,
      isActive: true,
      mobile: '+919876543211',
      phone: '+919876543211',
      location: { city: 'Dehradun', state: 'Uttarakhand', country: 'India' },
    },
    {
      name: 'Pahadi Homestay Host',
      email: 'partner@discovery.com',
      password: hashedPassword,
      role: 'partner',
      isEmailVerified: true,
      isActive: true,
      mobile: '+919876543212',
      phone: '+919876543212',
      location: { city: 'Rishikesh', state: 'Uttarakhand', country: 'India' },
    },
    {
      name: 'System Commander',
      email: 'admin@discovery.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      mobile: '+919876543213',
      phone: '+919876543213',
      location: { city: 'Nainital', state: 'Uttarakhand', country: 'India' },
    },
    {
      name: 'Deepanshu Kapri',
      email: 'deepanshukapri4@gmail.com',
      password: hashedPassword,
      role: 'user',
      isEmailVerified: true,
      isActive: true,
      mobile: '+919876543214',
      phone: '+919876543214',
      location: { city: 'Pithoragarh', state: 'Uttarakhand', country: 'India' },
    },
  ];

  for (const acc of testAccounts) {
    const existing = await User.findOne({ email: acc.email });
    if (existing) {
      existing.password = acc.password;
      existing.isEmailVerified = true;
      existing.isActive = true;
      existing.role = acc.role;
      existing.name = acc.name;
      await existing.save();
      console.log(`[Updated] ${acc.role.toUpperCase()} -> ${acc.email} (Password: ${defaultPassword})`);
    } else {
      await User.create(acc);
      console.log(`[Created] ${acc.role.toUpperCase()} -> ${acc.email} (Password: ${defaultPassword})`);
    }
  }

  console.log('\nAll complete login credentials successfully synced in MongoDB!');
  process.exit(0);
}

seedUsers().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
