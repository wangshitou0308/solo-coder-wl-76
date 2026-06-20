import type { Category, Difficulty, FoldType, PaperType, ModelStatus, TutorialSourceType, ResultImageType, ModelTag } from '../../shared/types';

export const CATEGORIES: Category[] = ['动物', '鸟类', '昆虫', '花朵', '盒子', '几何体', '其他'];

export const DIFFICULTIES: Difficulty[] = ['简单', '中等', '复杂', '极复杂'];

export const FOLD_TYPES: FoldType[] = ['谷折', '山折', '内翻折', '外翻折', '兔耳折', '花瓣折', '沉折', '其他'];

export const PAPER_TYPES: PaperType[] = ['单面彩色', '双面彩色', '和纸', '牛皮纸', '锡纸', '蜡纸', '棉纸', '其他'];

export const MODEL_STATUSES: ModelStatus[] = ['未开始', '学习中', '已完成', '熟练', '搁置'];

export const DEFAULT_MODEL_TAGS: ModelTag[] = ['入门', '送礼', '儿童', '挑战', '需要湿折'];

export const TUTORIAL_SOURCE_TYPES: TutorialSourceType[] = ['书籍', '视频', '网页', '个人笔记'];

export const RESULT_IMAGE_TYPES: ResultImageType[] = ['正面', '背面', '细节'];

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  '简单': 'bg-green-100 text-green-700',
  '中等': 'bg-yellow-100 text-yellow-700',
  '复杂': 'bg-orange-100 text-orange-700',
  '极复杂': 'bg-red-100 text-red-700',
};

export const STATUS_COLORS: Record<ModelStatus, string> = {
  '未开始': 'bg-gray-100 text-gray-600',
  '学习中': 'bg-blue-100 text-blue-700',
  '已完成': 'bg-green-100 text-green-700',
  '熟练': 'bg-purple-100 text-purple-700',
  '搁置': 'bg-amber-100 text-amber-700',
};

export const TAG_COLORS: string[] = [
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-cyan-100 text-cyan-700',
  'bg-pink-100 text-pink-700',
  'bg-lime-100 text-lime-700',
  'bg-indigo-100 text-indigo-700',
];

export const CATEGORY_ICONS: Record<Category, string> = {
  '动物': '🐾',
  '鸟类': '🐦',
  '昆虫': '🦋',
  '花朵': '🌸',
  '盒子': '📦',
  '几何体': '🔷',
  '其他': '✨',
};

export const TUTORIAL_TYPE_ICONS: Record<TutorialSourceType, string> = {
  '书籍': '📚',
  '视频': '🎬',
  '网页': '🌐',
  '个人笔记': '📝',
};

export const RATING_LABELS: Record<number, string> = {
  1: '失败',
  2: '较差',
  3: '一般',
  4: '良好',
  5: '完美',
};

export const COMPLETION_LABELS: Record<number, string> = {
  1: '大量缺失',
  2: '部分完成',
  3: '基本完成',
  4: '接近完整',
  5: '完全完成',
};

export const NEATNESS_LABELS: Record<number, string> = {
  1: '非常粗糙',
  2: '较粗糙',
  3: '一般',
  4: '较整洁',
  5: '非常整洁',
};
