import { getFirestore } from '../firebase/firebaseAdmin.js';

export class FirestoreService {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  get db() {
    return getFirestore();
  }

  async getAll() {
    const snapshot = await this.db.collection(this.collectionName).get();
    const items = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  }

  async getById(id) {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getByField(field, value) {
    const snapshot = await this.db.collection(this.collectionName).where(field, '==', value).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  async create(data) {
    const collectionRef = this.db.collection(this.collectionName);
    const id = data.id || `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const payload = { ...data, id, createdAt: new Date().toISOString() };
    await collectionRef.doc(id).set(payload);
    return payload;
  }

  async update(id, data) {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return null;
    const payload = { ...data, updatedAt: new Date().toISOString() };
    await docRef.update(payload);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  }

  async delete(id) {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return false;
    await docRef.delete();
    return true;
  }
}
