import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env' });

async function checkDuplicates() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const collectionsToCheck = ['stays', 'rentals', 'guides', 'destinations', 'partnerlistings'];

  console.log('=== DUPLICATE SLUG & NAME AUDIT ===');
  for (const collName of collectionsToCheck) {
    const slugDups = await db.collection(collName).aggregate([
      { $match: { slug: { $exists: true, $ne: null } } },
      { $group: { _id: '$slug', count: { $sum: 1 }, ids: { $push: '$_id' }, names: { $push: '$name' } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    const nameDups = await db.collection(collName).aggregate([
      { $match: { name: { $exists: true, $ne: null } } },
      { $group: { _id: { $toLower: '$name' }, count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    console.log(`Collection [${collName}]: Total=${await db.collection(collName).countDocuments()}`);
    console.log(`  Duplicate slugs: ${slugDups.length}`);
    if (slugDups.length > 0) {
      slugDups.forEach(d => console.log(`    Slug "${d._id}": count=${d.count}, ids=${d.ids.join(',')}`));
    }
    console.log(`  Duplicate names (case-insensitive): ${nameDups.length}`);
    if (nameDups.length > 0) {
      nameDups.slice(0, 5).forEach(d => console.log(`    Name "${d._id}": count=${d.count}, ids=${d.ids.join(',')}`));
    }
  }

  await mongoose.disconnect();
}

checkDuplicates().catch(err => {
  console.error(err);
  process.exit(1);
});
