import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

interface Database {
  models: any[];
  steps: any[];
  folds: any[];
  paper: any[];
}

const defaultData: Database = {
  models: [],
  steps: [],
  folds: [],
  paper: [],
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDatabase(): Database {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    saveDatabase(defaultData);
    return { ...defaultData };
  }
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { ...defaultData };
  }
}

function saveDatabase(db: Database): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

export const db = {
  getModels: () => loadDatabase().models,
  getSteps: () => loadDatabase().steps,
  getFolds: () => loadDatabase().folds,
  getPaper: () => loadDatabase().paper,
  
  setModels: (models: any[]) => {
    const db = loadDatabase();
    db.models = models;
    saveDatabase(db);
  },
  setSteps: (steps: any[]) => {
    const db = loadDatabase();
    db.steps = steps;
    saveDatabase(db);
  },
  setFolds: (folds: any[]) => {
    const db = loadDatabase();
    db.folds = folds;
    saveDatabase(db);
  },
  setPaper: (paper: any[]) => {
    const db = loadDatabase();
    db.paper = paper;
    saveDatabase(db);
  },
  
  getAll: (): Database => loadDatabase(),
};
