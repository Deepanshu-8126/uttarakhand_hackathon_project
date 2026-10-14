import '../config/loadEnv.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'profile_test_explorer@gmail.com';
const TEST_PASSWORD = 'Password123!';

async function run() {
  console.log('====================================================');
  console.log('  TESTING PROFILE PHOTO, LOCATION & CLOUDINARY FLOW ');
  console.log('====================================================');

  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

  // 1. Ensure test user exists & verified
  let user = await User.findOne({ email: TEST_EMAIL });
  if (user) {
    await User.deleteOne({ email: TEST_EMAIL });
  }
  user = await User.create({
    name: 'Deepanshu Traveler',
    email: TEST_EMAIL,
    phone: '9876543210',
    password: TEST_PASSWORD,
    isEmailVerified: true,
    location: {
      city: 'Dehradun',
      district: 'Dehradun',
      state: 'Uttarakhand',
      country: 'India'
    }
  });
  console.log('1. Created verified test user with Object location in MongoDB.');

  // 2. Log in to get JWT token
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: TEST_EMAIL, password: TEST_PASSWORD })
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.data?.token) {
    throw new Error('Login failed: ' + JSON.stringify(loginData));
  }
  const token = loginData.data.token;
  console.log('2. Logged in successfully, token acquired.');

  const authHeaders = {
    'Authorization': `Bearer ${token}`
  };

  // 3. Test GET /api/users/profile
  const getProfRes = await fetch(`${BASE_URL}/users/profile`, { headers: authHeaders });
  const getProfData = await getProfRes.json();
  console.log('3. GET /api/users/profile status:', getProfRes.status);
  if (!getProfData.success) {
    throw new Error('GET profile failed: ' + JSON.stringify(getProfData));
  }
  console.log('   Profile data received:');
  console.log('   - Name:', getProfData.data.name);
  console.log('   - Location type:', typeof getProfData.data.location);
  console.log('   - AvatarUrl present in DTO:', getProfData.data.avatarUrl !== undefined);

  // 4. Test PUT /api/users/profile with OBJECT location (the previous crash scenario)
  console.log('4. Testing PUT /api/users/profile with OBJECT location...');
  const putObjLocRes = await fetch(`${BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Deepanshu Updated',
      phone: '9876543210',
      location: { city: 'Rishikesh', district: 'Dehradun', state: 'Uttarakhand' }
    })
  });
  const putObjLocData = await putObjLocRes.json();
  if (!putObjLocData.success) {
    throw new Error('PUT with object location failed: ' + JSON.stringify(putObjLocData));
  }
  console.log('✅ PASS: Updating profile with object location succeeded without error.');

  // 5. Test Image Upload via POST /api/upload?folder=profile-photos
  console.log('5. Testing image upload to /api/upload...');
  // Create a minimal valid 1x1 PNG file
  const samplePngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const tempFilePath = path.join(__dirname, 'test_profile_temp.png');
  fs.writeFileSync(tempFilePath, samplePngBuffer);

  const formData = new FormData();
  const fileBlob = new Blob([samplePngBuffer], { type: 'image/png' });
  formData.append('image', fileBlob, 'avatar.png');

  const uploadRes = await fetch(`${BASE_URL}/upload?folder=profile-photos`, {
    method: 'POST',
    headers: authHeaders,
    body: formData
  });
  const uploadData = await uploadRes.json();
  if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

  console.log('Upload response status:', uploadRes.status);
  console.log('Upload response data:', uploadData);
  if (!uploadData.success || !uploadData.image?.url) {
    throw new Error('Image upload failed: ' + JSON.stringify(uploadData));
  }
  const uploadedUrl = uploadData.image.url;
  const uploadedPublicId = uploadData.image.publicId;
  console.log('✅ PASS: Image uploaded successfully.');
  console.log('   - URL:', uploadedUrl);
  console.log('   - PublicId:', uploadedPublicId);

  // 6. Test updating profile with uploaded profile photo
  console.log('6. Saving uploaded photo to user profile...');
  const savePhotoRes = await fetch(`${BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Deepanshu Updated',
      phone: '9876543210',
      location: 'Rishikesh, Uttarakhand',
      profileImage: {
        url: uploadedUrl,
        publicId: uploadedPublicId
      }
    })
  });
  const savePhotoData = await savePhotoRes.json();
  if (!savePhotoRes.ok || !savePhotoData.success) {
    throw new Error('Save profile photo failed: ' + JSON.stringify(savePhotoData));
  }
  console.log('✅ PASS: Profile photo saved to user record.');
  console.log('   - profileImage.url:', savePhotoData.data.profileImage?.url);
  console.log('   - avatarUrl:', savePhotoData.data.avatarUrl);

  // 7. Test cross-device / session check via GET /api/auth/me
  console.log('7. Verifying cross-device sync via GET /api/auth/me...');
  const getMeRes = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders });
  const getMeData = await getMeRes.json();
  if (!getMeData.success || getMeData.data.avatarUrl !== uploadedUrl) {
    throw new Error('GET /api/auth/me did not return persisted avatarUrl: ' + JSON.stringify(getMeData));
  }
  console.log('✅ PASS: GET /api/auth/me returned correct persisted avatarUrl across sessions!');

  // 8. Test DELETE /api/users/profile/photo
  console.log('8. Testing DELETE /api/users/profile/photo...');
  const delPhotoRes = await fetch(`${BASE_URL}/users/profile/photo`, {
    method: 'DELETE',
    headers: authHeaders
  });
  const delPhotoData = await delPhotoRes.json();
  if (!delPhotoRes.ok || !delPhotoData.success || delPhotoData.data.profileImage !== null) {
    throw new Error('DELETE profile photo failed: ' + JSON.stringify(delPhotoData));
  }
  console.log('✅ PASS: Profile photo removed successfully.');

  // Verify deletion in DB
  const userAfterDel = await User.findById(user._id);
  if (userAfterDel.profileImage !== null && userAfterDel.profileImage !== undefined) {
    throw new Error('Database still has profileImage after deletion!');
  }
  console.log('✅ PASS: MongoDB confirmed profileImage is null.');

  // Clean up test user
  await User.deleteOne({ email: TEST_EMAIL });
  console.log('Cleaned up test user.');
  console.log('====================================================');
  console.log('🎉 ALL PROFILE PHOTO & LOCATION TESTS PASSED 100%!');
  console.log('====================================================');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
