import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import mongoose from 'mongoose';

const results = [];

function recordResult(service, category, status, details, latencyMs) {
  results.push({ service, category, status, details, latencyMs });
  const icon = status === 'HEALTHY' ? '🟢' : status === 'WARNING' ? '🟡' : '🔴';
  console.log(`${icon} [${category}] ${service}: ${status} (${latencyMs}ms) - ${details}`);
}

async function checkLiveRenderBackend() {
  const base = 'https://uttarakhand-hackathon-project.onrender.com/api';
  const endpoints = [
    { name: 'Render Status / Health', path: '/places/status' },
    { name: 'Render Destinations API', path: '/destinations?limit=3' },
    { name: 'Render Stays API', path: '/stays?limit=3' },
    { name: 'Render Nearby Places API', path: '/places/nearby?lat=29.35&lng=79.45&radius=15000' }
  ];

  for (const ep of endpoints) {
    const t0 = Date.now();
    try {
      const res = await axios.get(`${base}${ep.path}`, { timeout: 15000 });
      const latency = Date.now() - t0;
      if (res.status === 200) {
        recordResult(ep.name, 'RENDER_PRODUCTION', 'HEALTHY', `HTTP 200 OK (Data received)`, latency);
      } else {
        recordResult(ep.name, 'RENDER_PRODUCTION', 'WARNING', `HTTP ${res.status}`, latency);
      }
    } catch (err) {
      const latency = Date.now() - t0;
      recordResult(ep.name, 'RENDER_PRODUCTION', 'FAILED', err.message, latency);
    }
  }
}

async function checkMongoDB() {
  const t0 = Date.now();
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    recordResult('MongoDB Atlas', 'DATABASE', 'FAILED', 'Missing MONGODB_URI in .env', 0);
    return;
  }

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    const latency = Date.now() - t0;
    const collections = await conn.connection.db.listCollections().toArray();
    const colNames = collections.map(c => c.name);
    recordResult(
      'MongoDB Atlas',
      'DATABASE',
      'HEALTHY',
      `Connected to database '${conn.connection.name}'. Collections: ${colNames.slice(0, 5).join(', ')}... (${colNames.length} total)`,
      latency
    );
    await mongoose.disconnect();
  } catch (err) {
    const latency = Date.now() - t0;
    recordResult('MongoDB Atlas', 'DATABASE', 'FAILED', err.message, latency);
  }
}

async function checkUpstashRedis() {
  const t0 = Date.now();
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    recordResult('Upstash Redis', 'CACHE', 'FAILED', 'Missing UPSTASH_REDIS_REST_URL/TOKEN', 0);
    return;
  }

  try {
    const testKey = `test_audit_${Date.now()}`;
    await axios.get(`${url}/set/${testKey}/health_ok`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });
    const getRes = await axios.get(`${url}/get/${testKey}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });
    await axios.get(`${url}/del/${testKey}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });
    const latency = Date.now() - t0;

    if (getRes.data?.result === 'health_ok') {
      recordResult('Upstash Redis REST', 'CACHE', 'HEALTHY', 'Read/Write/Delete cycle verified', latency);
    } else {
      recordResult('Upstash Redis REST', 'CACHE', 'WARNING', `Unexpected response: ${JSON.stringify(getRes.data)}`, latency);
    }
  } catch (err) {
    const latency = Date.now() - t0;
    recordResult('Upstash Redis REST', 'CACHE', 'FAILED', err.message, latency);
  }
}

async function checkGeoapify() {
  const t0 = Date.now();
  const key = process.env.GEOAPIFY_API_KEY;
  if (!key) {
    recordResult('Geoapify GIS API', 'MAPS_ROUTING', 'FAILED', 'Missing GEOAPIFY_API_KEY', 0);
    return;
  }

  try {
    const url = `https://api.geoapify.com/v1/geocode/search?text=Nainital%20Uttarakhand&apiKey=${key}`;
    const res = await axios.get(url, { timeout: 6000 });
    const latency = Date.now() - t0;
    if (res.data?.features?.length > 0) {
      const place = res.data.features[0].properties;
      recordResult('Geoapify Geocoding API', 'MAPS_ROUTING', 'HEALTHY', `Resolved: ${place.formatted}`, latency);
    } else {
      recordResult('Geoapify Geocoding API', 'MAPS_ROUTING', 'WARNING', 'No results returned', latency);
    }
  } catch (err) {
    const latency = Date.now() - t0;
    recordResult('Geoapify Geocoding API', 'MAPS_ROUTING', 'FAILED', err.message, latency);
  }
}

async function checkGroq() {
  const t0 = Date.now();
  const key = process.env.GROQ_API_KEY;
  const baseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
  const model = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';

  if (!key) {
    recordResult('Groq AI API', 'AI_ENGINE', 'FAILED', 'Missing GROQ_API_KEY', 0);
    return;
  }

  try {
    const res = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 5
      },
      {
        headers: { Authorization: `Bearer ${key}` },
        timeout: 8000
      }
    );
    const latency = Date.now() - t0;
    const reply = res.data?.choices?.[0]?.message?.content?.trim();
    recordResult(`Groq AI (${model})`, 'AI_ENGINE', 'HEALTHY', `Inference successful: "${reply}"`, latency);
  } catch (err) {
    const latency = Date.now() - t0;
    recordResult('Groq AI API', 'AI_ENGINE', 'FAILED', err.response?.data?.error?.message || err.message, latency);
  }
}

async function checkGemini() {
  const t0 = Date.now();
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    recordResult('Google Gemini AI', 'AI_ENGINE', 'FAILED', 'Missing GEMINI_API_KEY', 0);
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const res = await axios.get(url, { timeout: 6000 });
    const latency = Date.now() - t0;
    recordResult('Google Gemini AI', 'AI_ENGINE', 'HEALTHY', `API Key Valid (${res.data?.models?.length || 0} models available)`, latency);
  } catch (err) {
    const latency = Date.now() - t0;
    recordResult('Google Gemini AI', 'AI_ENGINE', 'FAILED', err.response?.data?.error?.message || err.message, latency);
  }
}

async function checkOpenAI() {
  const t0 = Date.now();
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    recordResult('OpenAI API', 'AI_ENGINE', 'FAILED', 'Missing OPENAI_API_KEY', 0);
    return;
  }

  try {
    const res = await axios.get('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
      timeout: 6000
    });
    const latency = Date.now() - t0;
    recordResult('OpenAI API', 'AI_ENGINE', 'HEALTHY', `Account active (${res.data?.data?.length || 0} models available)`, latency);
  } catch (err) {
    const latency = Date.now() - t0;
    recordResult('OpenAI API', 'AI_ENGINE', 'FAILED', err.response?.data?.error?.message || err.message, latency);
  }
}

async function checkPexels() {
  const t0 = Date.now();
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    recordResult('Pexels Photography API', 'IMAGES', 'FAILED', 'Missing PEXELS_API_KEY', 0);
    return;
  }

  try {
    const res = await axios.get('https://api.pexels.com/v1/search?query=mountains&per_page=1', {
      headers: { Authorization: key },
      timeout: 6000
    });
    const latency = Date.now() - t0;
    if (res.data?.photos?.length > 0) {
      recordResult('Pexels Photography API', 'IMAGES', 'HEALTHY', `Search successful (${res.data.total_results} total assets)`, latency);
    } else {
      recordResult('Pexels Photography API', 'IMAGES', 'WARNING', 'No photos returned', latency);
    }
  } catch (err) {
    const latency = Date.now() - t0;
    recordResult('Pexels Photography API', 'IMAGES', 'FAILED', err.message, latency);
  }
}

async function checkElevenLabs() {
  const t0 = Date.now();
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    recordResult('ElevenLabs Voice API', 'VOICE_AI', 'FAILED', 'Missing ELEVENLABS_API_KEY', 0);
    return;
  }

  try {
    const res = await axios.get('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': key },
      timeout: 6000
    });
    const latency = Date.now() - t0;
    const tier = res.data?.subscription?.tier || 'free';
    const charCount = res.data?.subscription?.character_count || 0;
    const charLimit = res.data?.subscription?.character_limit || 0;
    recordResult('ElevenLabs Voice API', 'VOICE_AI', 'HEALTHY', `Tier: ${tier} (${charCount}/${charLimit} chars used)`, latency);
  } catch (err) {
    const latency = Date.now() - t0;
    recordResult('ElevenLabs Voice API', 'VOICE_AI', 'FAILED', err.response?.data?.detail?.message || err.message, latency);
  }
}

async function checkRazorpay() {
  const t0 = Date.now();
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    recordResult('Razorpay Gateway', 'PAYMENTS', 'FAILED', 'Missing RAZORPAY_KEY_ID/SECRET', 0);
    return;
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const res = await axios.get('https://api.razorpay.com/v1/payments?count=1', {
      headers: { Authorization: authHeader },
      timeout: 6000
    });
    const latency = Date.now() - t0;
    recordResult('Razorpay Gateway', 'PAYMENTS', 'HEALTHY', `Test Mode Credentials Valid (Status 200)`, latency);
  } catch (err) {
    const latency = Date.now() - t0;
    if (err.response?.status === 401) {
      recordResult('Razorpay Gateway', 'PAYMENTS', 'FAILED', 'Authentication failed (Invalid Key or Secret)', latency);
    } else {
      recordResult('Razorpay Gateway', 'PAYMENTS', 'WARNING', err.message, latency);
    }
  }
}

async function checkCloudinary() {
  const t0 = Date.now();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    recordResult('Cloudinary CDN', 'MEDIA_STORAGE', 'FAILED', 'Missing Cloudinary credentials', 0);
    return;
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const res = await axios.get(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=1`, {
      headers: { Authorization: authHeader },
      timeout: 6000
    });
    const latency = Date.now() - t0;
    recordResult('Cloudinary CDN', 'MEDIA_STORAGE', 'HEALTHY', `Cloud '${cloudName}' active (${res.data?.resources?.length || 0} sample assets read)`, latency);
  } catch (err) {
    const latency = Date.now() - t0;
    recordResult('Cloudinary CDN', 'MEDIA_STORAGE', 'FAILED', err.response?.data?.error?.message || err.message, latency);
  }
}

async function runAllChecks() {
  console.log('====================================================');
  console.log('DISCOVERY UTTARAKHAND — COMPREHENSIVE ENV & API AUDIT');
  console.log('Testing all Production Render APIs, DBs, and Keys...');
  console.log('====================================================\n');

  await checkLiveRenderBackend();
  await checkMongoDB();
  await checkUpstashRedis();
  await checkGeoapify();
  await checkGroq();
  await checkGemini();
  await checkOpenAI();
  await checkPexels();
  await checkElevenLabs();
  await checkRazorpay();
  await checkCloudinary();

  console.log('\n====================================================');
  console.log('AUDIT COMPLETE');
  console.log('====================================================');
}

runAllChecks();
