import type { Category, Difficulty, FoldType, PaperType } from '../../shared/types';

export const CATEGORIES: Category[] = ['动物', '鸟类', '昆虫', '花朵', '盒子', '几何体', '其他'];

export const DIFFICULTIES: Difficulty[] = ['简单', '中等', '复杂', '极复杂'];

export const FOLD_TYPES: FoldType[] = ['谷折', '山折', '内翻折', '外翻折', '兔耳折', '花瓣折', '沉折', '其他'];

export const PAPER_TYPES: PaperType[] = ['单面彩色', '双面彩色', '和纸', '牛皮纸', '锡纸', '蜡纸', '棉纸', '其他'];

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  '简单': 'bg-green-100 text-green-700',
  '中等': 'bg-yellow-100 text-yellow-700',
  '复杂': 'bg-orange-100 text-orange-700',
  '极复杂': 'bg-red-100 text-red-700',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  '动物': '🐾',
  '鸟类': '🐦',
  '昆虫': '🦋',
  '花朵': '🌸',
  '盒子': '📦',
  '几何体': '🔷',
  '其他': '✨',
};

export const RATING_LABELS: Record<number, string> = {
  1: '失败',
  2: '较差',
  3: '一般',
  4: '良好',
  5: '完美',
};
