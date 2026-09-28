import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';
import {
  initialProjects,
  initialTeamMembers,
  initialServices,
  initialTestimonials,
  initialBlogPosts,
  initialAgencySettings
} from '../utils/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../data/firestore_data.json');

async function seed() {
  console.log('🚀 [Firebase Seeder] Starting upload to Cloud Firestore...');

  let app;
  if (config.firebase.serviceAccountPath) {
    app = admin.initializeApp({
      credential: admin.credential.cert(config.firebase.serviceAccountPath),
    });
  } else if (config.firebase.projectId && config.firebase.clientEmail && config.firebase.privateKey) {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
  } else {
    console.error('❌ Error: No Firebase credentials found in backend/.env.');
    console.log('ℹ️ Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY or GOOGLE_APPLICATION_CREDENTIALS first.');
    process.exit(1);
  }

  const db = admin.firestore();

  // Use latest seeds as baseline with high-res assets, preserving any contact messages from backup
  let contactMessages = [];
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.contactMessages)) contactMessages = parsed.contactMessages;
    } catch (e) {
      console.warn('⚠️ Could not parse local backup');
    }
  }

  const dataset = {
    projects: initialProjects,
    teamMembers: initialTeamMembers,
    services: initialServices,
    testimonials: initialTestimonials,
    blogPosts: initialBlogPosts,
    settings: [{ id: 'general', ...initialAgencySettings }],
    contactMessages
  };

  // Keep local backup synchronized
  fs.writeFileSync(DATA_FILE, JSON.stringify(dataset, null, 2), 'utf8');
  console.log('📦 Synchronized local firestore_data.json with high-res assets');

  for (const [colName, docs] of Object.entries(dataset)) {
    console.log(`⏳ Seeding collection '${colName}' (${docs.length} documents)...`);
    for (const item of docs) {
      const id = item.id || `doc_${Date.now()}`;
      await db.collection(colName).doc(id).set(item, { merge: true });
    }
    console.log(`✅ Collection '${colName}' seeded successfully.`);
  }

  console.log('🎉 [Firebase Seeder] All collections have been uploaded to Cloud Firestore!');
  process.exit(0);
}

seed().catch(err => {
  console.error('💥 [Firebase Seeder Error]:', err);
  process.exit(1);
});
