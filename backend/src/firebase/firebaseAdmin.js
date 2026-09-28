import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'firestore_data.json');

let isRealFirebase = false;
let dbInstance = null;

// Initialize Firebase Admin if credentials are supplied
try {
  if (config.firebase.serviceAccountPath) {
    admin.initializeApp({
      credential: admin.credential.cert(config.firebase.serviceAccountPath),
    });
    dbInstance = admin.firestore();
    isRealFirebase = true;
    console.log('🔥 [Firebase] Initialized with Service Account file');
  } else if (config.firebase.projectId && config.firebase.clientEmail && config.firebase.privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
    dbInstance = admin.firestore();
    isRealFirebase = true;
    console.log('🔥 [Firebase] Initialized with Environment Variables');
  } else {
    console.log('ℹ️ [Firebase] No credentials in .env. Initializing Persistent Local Firestore Engine.');
  }
} catch (error) {
  console.warn('⚠️ [Firebase] Could not initialize Firebase Admin SDK:', error.message);
  console.log('ℹ️ [Firebase] Falling back to Persistent Local Firestore Engine.');
}

// In-Memory & File-Persistent Firestore simulation engine
class MockDocRef {
  constructor(collectionRef, id) {
    this.collectionRef = collectionRef;
    this.id = id;
  }

  async get() {
    const data = this.collectionRef.store.get(this.id);
    return {
      id: this.id,
      exists: !!data,
      data: () => (data ? { ...data } : undefined)
    };
  }

  async set(data, options = {}) {
    const existing = options.merge ? this.collectionRef.store.get(this.id) || {} : {};
    const updated = { ...existing, ...data, id: this.id, updatedAt: new Date().toISOString() };
    if (!existing.createdAt) updated.createdAt = new Date().toISOString();
    this.collectionRef.store.set(this.id, updated);
    this.collectionRef.firestore.persist();
    return { writeTime: new Date() };
  }

  async update(data) {
    const existing = this.collectionRef.store.get(this.id);
    if (!existing) {
      throw new Error(`Document with id ${this.id} does not exist`);
    }
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    this.collectionRef.store.set(this.id, updated);
    this.collectionRef.firestore.persist();
    return { writeTime: new Date() };
  }

  async delete() {
    this.collectionRef.store.delete(this.id);
    this.collectionRef.firestore.persist();
    return { writeTime: new Date() };
  }
}

class MockCollectionRef {
  constructor(firestore, name, initialItems = []) {
    this.firestore = firestore;
    this.name = name;
    this.store = new Map();
    initialItems.forEach(item => {
      const id = item.id || `doc_${Math.random().toString(36).slice(2, 9)}`;
      this.store.set(id, { ...item, id, createdAt: item.createdAt || new Date().toISOString() });
    });
  }

  doc(id) {
    const docId = id || `doc_${Math.random().toString(36).slice(2, 9)}`;
    return new MockDocRef(this, docId);
  }

  async add(data) {
    const id = data.id || `doc_${Math.random().toString(36).slice(2, 9)}`;
    const newItem = { ...data, id, createdAt: new Date().toISOString() };
    this.store.set(id, newItem);
    this.firestore.persist();
    return new MockDocRef(this, id);
  }

  async get() {
    const docs = Array.from(this.store.values()).map(doc => ({
      id: doc.id,
      exists: true,
      data: () => ({ ...doc })
    }));
    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
      forEach: fn => docs.forEach(fn)
    };
  }

  where(field, op, value) {
    return {
      get: async () => {
        const all = Array.from(this.store.values());
        const filtered = all.filter(item => {
          if (op === '==') return item[field] === value;
          if (op === '!=') return item[field] !== value;
          if (op === 'in') return Array.isArray(value) && value.includes(item[field]);
          return true;
        });
        const docs = filtered.map(doc => ({
          id: doc.id,
          exists: true,
          data: () => ({ ...doc })
        }));
        return {
          docs,
          empty: docs.length === 0,
          size: docs.length,
          forEach: fn => docs.forEach(fn)
        };
      }
    };
  }

  orderBy() {
    return this;
  }
}

class MockFirestore {
  constructor() {
    this.collections = new Map();
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        console.log('💾 [Persistence] Loaded persistent database from firestore_data.json');

        this.collections.set('projects', new MockCollectionRef(this, 'projects', parsed.projects || []));
        this.collections.set('teamMembers', new MockCollectionRef(this, 'teamMembers', parsed.teamMembers || []));
        this.collections.set('services', new MockCollectionRef(this, 'services', parsed.services || []));
        this.collections.set('testimonials', new MockCollectionRef(this, 'testimonials', parsed.testimonials || []));
        this.collections.set('blogPosts', new MockCollectionRef(this, 'blogPosts', parsed.blogPosts || []));
        this.collections.set('contactMessages', new MockCollectionRef(this, 'contactMessages', parsed.contactMessages || []));
        this.collections.set('settings', new MockCollectionRef(this, 'settings', parsed.settings || [{ id: 'general' }]));
        return;
      }
    } catch (err) {
      console.warn('⚠️ [Persistence] Failed to read firestore_data.json, initializing fresh defaults:', err.message);
    }

    // Default initialization
    this.collections.set('projects', new MockCollectionRef(this, 'projects', []));
    this.collections.set('teamMembers', new MockCollectionRef(this, 'teamMembers', []));
    this.collections.set('services', new MockCollectionRef(this, 'services', []));
    this.collections.set('testimonials', new MockCollectionRef(this, 'testimonials', []));
    this.collections.set('blogPosts', new MockCollectionRef(this, 'blogPosts', []));
    this.collections.set('contactMessages', new MockCollectionRef(this, 'contactMessages', []));
    this.collections.set('settings', new MockCollectionRef(this, 'settings', [{ id: 'general' }]));
    this.persist();
  }

  persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      const dump = {};
      for (const [colName, colRef] of this.collections.entries()) {
        dump[colName] = Array.from(colRef.store.values());
      }

      fs.writeFileSync(DATA_FILE, JSON.stringify(dump, null, 2), 'utf8');
    } catch (err) {
      console.error('💥 [Persistence Error]:', err.message);
    }
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new MockCollectionRef(this, name));
    }
    return this.collections.get(name);
  }
}

export const getFirestore = () => {
  if (isRealFirebase && dbInstance) {
    return dbInstance;
  }
  if (!global._mockFirestoreInstance) {
    global._mockFirestoreInstance = new MockFirestore();
  }
  return global._mockFirestoreInstance;
};

export const getAdminAuth = () => {
  if (isRealFirebase) {
    return admin.auth();
  }
  return {
    verifyIdToken: async (token) => {
      if (token === config.adminAccessToken || token === 'admin_token_valid') {
        return { uid: 'admin_1', email: 'admin@syntaxstudio.dev', role: 'admin' };
      }
      throw new Error('Invalid token');
    }
  };
};

export { isRealFirebase };
