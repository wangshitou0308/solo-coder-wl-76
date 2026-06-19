export type Category = '动物' | '鸟类' | '昆虫' | '花朵' | '盒子' | '几何体' | '其他';
export type Difficulty = '简单' | '中等' | '复杂' | '极复杂';
export type FoldType = '谷折' | '山折' | '内翻折' | '外翻折' | '兔耳折' | '花瓣折' | '沉折' | '其他';
export type PaperType = '单面彩色' | '双面彩色' | '和纸' | '牛皮纸' | '锡纸' | '蜡纸' | '棉纸' | '其他';

export interface Model {
  id: string;
  name: string;
  designer: string;
  category: Category;
  difficulty: Difficulty;
  recommendedPaperType: string;
  recommendedPaperSize: string;
  stepCount: number;
  estimatedTimeMinutes: number;
  tutorialSource: string;
  description: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FoldStep {
  id: string;
  modelId: string;
  stepNumber: number;
  foldType: FoldType;
  description: string;
  referencePoints: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoldRecord {
  id: string;
  modelId: string;
  paperId: string | null;
  foldDate: string;
  paperType: string;
  paperSize: string;
  durationMinutes: number;
  rating: number;
  notes: string;
  resultImageUrl: string;
  createdAt: string;
}

export interface Paper {
  id: string;
  type: PaperType;
  size: string;
  color: string;
  quantity: number;
  lowStockThreshold: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatisticsSummary {
  totalModels: number;
  totalFolds: number;
  totalPaperTypes: number;
  totalFoldTimeMinutes: number;
}

export interface CategoryCount {
  category: Category;
  count: number;
}

export interface MonthlyFold {
  month: string;
  count: number;
}

export interface TopModel {
  id: string;
  name: string;
  foldCount: number;
}

export interface DifficultyCount {
  difficulty: Difficulty;
  count: number;
}

export interface TopPaper {
  type: string;
  usageCount: number;
}
