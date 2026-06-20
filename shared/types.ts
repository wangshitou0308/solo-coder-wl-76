export type Category = '动物' | '鸟类' | '昆虫' | '花朵' | '盒子' | '几何体' | '其他';
export type Difficulty = '简单' | '中等' | '复杂' | '极复杂';
export type FoldType = '谷折' | '山折' | '内翻折' | '外翻折' | '兔耳折' | '花瓣折' | '沉折' | '其他';
export type PaperType = '单面彩色' | '双面彩色' | '和纸' | '牛皮纸' | '锡纸' | '蜡纸' | '棉纸' | '其他';

export type ModelStatus = '未开始' | '学习中' | '已完成' | '熟练' | '搁置';
export type ModelTag = '入门' | '送礼' | '儿童' | '挑战' | '需要湿折' | string;
export type TutorialSourceType = '书籍' | '视频' | '网页' | '个人笔记';
export type ResultImageType = '正面' | '背面' | '细节';
export type CompletionDegree = 1 | 2 | 3 | 4 | 5;
export type NeatnessDegree = 1 | 2 | 3 | 4 | 5;

export interface TutorialSource {
  type: TutorialSourceType;
  title: string;
  url?: string;
  pageNumber?: number;
  notes?: string;
}

export interface StepDifficultyMark {
  id: string;
  stepId: string;
  modelId: string;
  isDifficult: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeSession {
  id: string;
  modelId: string;
  startTime: string;
  endTime: string | null;
  pauseTimes: string[];
  resumeTimes: string[];
  currentStepIndex: number;
  completedSteps: number[];
  skippedSteps: number[];
  status: '进行中' | '已暂停' | '已完成' | '已取消';
  totalElapsedSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface FoldResultImage {
  id: string;
  foldRecordId: string;
  url: string;
  type: ResultImageType;
  caption?: string;
}

export interface FoldEvaluation {
  rating: number;
  completion: CompletionDegree;
  neatness: NeatnessDegree;
  success: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  modelIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  id: string;
  modelId: string;
  oldStatus: ModelStatus;
  newStatus: ModelStatus;
  changedAt: string;
  note?: string;
}

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
  tutorialSources: TutorialSource[];
  description: string;
  images: string[];
  tags: ModelTag[];
  status: ModelStatus;
  isFavorite: boolean;
  isWishlist: boolean;
  collectionIds: string[];
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
  completion: CompletionDegree;
  neatness: NeatnessDegree;
  success: boolean;
  notes: string;
  resultImageUrl: string;
  resultImages: FoldResultImage[];
  isRepresentative: boolean;
  practiceSessionId?: string;
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
