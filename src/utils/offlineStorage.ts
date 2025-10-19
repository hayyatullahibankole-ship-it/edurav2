/**
 * IndexedDB utilities for offline storage
 */

const DB_NAME = 'EduraOfflineDB';
const DB_VERSION = 2;

export interface OfflineQuestion {
  id: string;
  question_text: string;
  options: any;
  type: string;
  subject_id: string;
  difficulty_level: number;
  points: number;
  tags?: any;
}

export interface OfflineExam {
  id: string;
  examType: string;
  questions: OfflineQuestion[];
  downloadedAt: string;
  expiresAt: string;
}

export interface OfflineAttempt {
  id: string;
  examId: string;
  answers: Record<string, any>;
  startedAt: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
}

class OfflineStorageManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('exams')) {
          db.createObjectStore('exams', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('attempts')) {
          const attemptStore = db.createObjectStore('attempts', { keyPath: 'id' });
          attemptStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
        if (!db.objectStoreNames.contains('questions')) {
          db.createObjectStore('questions', { keyPath: 'id' });
        }
      };
    });
  }

  // Exam Management
  async saveExam(exam: OfflineExam): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['exams'], 'readwrite');
      const store = transaction.objectStore('exams');
      const request = store.put(exam);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getExam(examId: string): Promise<OfflineExam | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['exams'], 'readonly');
      const store = transaction.objectStore('exams');
      const request = store.get(examId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllExams(): Promise<OfflineExam[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['exams'], 'readonly');
      const store = transaction.objectStore('exams');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteExam(examId: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['exams'], 'readwrite');
      const store = transaction.objectStore('exams');
      const request = store.delete(examId);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Attempt Management
  async saveAttempt(attempt: OfflineAttempt): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['attempts'], 'readwrite');
      const store = transaction.objectStore('attempts');
      const request = store.put(attempt);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAttempt(attemptId: string): Promise<OfflineAttempt | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['attempts'], 'readonly');
      const store = transaction.objectStore('attempts');
      const request = store.get(attemptId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingAttempts(): Promise<OfflineAttempt[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['attempts'], 'readonly');
      const store = transaction.objectStore('attempts');
      const index = store.index('syncStatus');
      const request = index.getAll('PENDING');
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async updateAttemptSyncStatus(attemptId: string, status: 'PENDING' | 'SYNCED' | 'FAILED'): Promise<void> {
    if (!this.db) await this.init();
    const attempt = await this.getAttempt(attemptId);
    if (attempt) {
      attempt.syncStatus = status;
      await this.saveAttempt(attempt);
    }
  }

  // Clean up expired data
  async cleanupExpiredData(): Promise<void> {
    const exams = await this.getAllExams();
    const now = new Date();
    
    for (const exam of exams) {
      if (new Date(exam.expiresAt) < now) {
        await this.deleteExam(exam.id);
      }
    }
  }
}

export const offlineStorage = new OfflineStorageManager();
