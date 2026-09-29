import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env' });

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const staySample = await db.collection('stays').find({}).limit(2).toArray();
  console.log('--- STAY SAMPLE ---');
  console.log(JSON.stringify(staySample[0], null, 2));

  const rentalSample = await db.collection('rentals').find({}).limit(2).toArray();
  console.log('--- RENTAL SAMPLE ---');
  console.log(JSON.stringify(rentalSample[0], null, 2));

  const guideSample = await db.collection('guides').find({}).limit(2).toArray();
  console.log('--- GUIDE SAMPLE ---');
  console.log(JSON.stringify(guideSample[0], null, 2));

  const plStatuses = await db.collection('partnerlistings').aggregate([
    { $group: { _id: { status: '$status', listingType: '$listingType' }, count: { $sum: 1 } } }
  ]).toArray();
  console.log('--- PARTNER LISTINGS BREAKDOWN ---');
  console.log(JSON.stringify(plStatuses, null, 2));

  // Check partners
  const partnerSample = await db.collection('partners').find({}).toArray();
  console.log('--- PARTNERS COUNT & SAMPLE ---', partnerSample.length);
  if (partnerSample.length > 0) {
    console.log(JSON.stringify(partnerSample[0], null, 2));
  }

  // Check verification audit logs
  const auditCount = await db.collection('verificationauditlogs').countDocuments();
  console.log('--- VERIFICATION AUDIT LOGS COUNT ---', auditCount);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
