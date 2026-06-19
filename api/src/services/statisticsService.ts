import { db } from '../db/database.js';
import type {
  StatisticsSummary,
  CategoryCount,
  MonthlyFold,
  TopModel,
  DifficultyCount,
  TopPaper,
  Category,
  Difficulty,
} from '../../../shared/types.js';

export const statisticsService = {
  getSummary(): StatisticsSummary {
    const models = db.getModels();
    const folds = db.getFolds();
    const paper = db.getPaper();
    
    const totalFoldTime = folds.reduce((sum, f) => sum + (f.durationMinutes || 0), 0);
    
    return {
      totalModels: models.length,
      totalFolds: folds.length,
      totalPaperTypes: paper.length,
      totalFoldTimeMinutes: totalFoldTime,
    };
  },
  
  getModelsByCategory(): CategoryCount[] {
    const models = db.getModels();
    const categories: Category[] = ['动物', '鸟类', '昆虫', '花朵', '盒子', '几何体', '其他'];
    
    return categories.map(category => ({
      category,
      count: models.filter(m => m.category === category).length,
    }));
  },
  
  getFoldsByMonth(): MonthlyFold[] {
    const folds = db.getFolds();
    const monthMap = new Map<string, number>();
    
    folds.forEach(fold => {
      const date = new Date(fold.foldDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });
    
    const sortedMonths = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12);
    
    return sortedMonths.map(([month, count]) => ({ month, count }));
  },
  
  getTopModels(limit: number = 10): TopModel[] {
    const folds = db.getFolds();
    const models = db.getModels();
    const countMap = new Map<string, number>();
    
    folds.forEach(fold => {
      countMap.set(fold.modelId, (countMap.get(fold.modelId) || 0) + 1);
    });
    
    const topModels = Array.from(countMap.entries())
      .map(([modelId, foldCount]) => {
        const model = models.find(m => m.id === modelId);
        return {
          id: modelId,
          name: model?.name || '未知模型',
          foldCount,
        };
      })
      .sort((a, b) => b.foldCount - a.foldCount)
      .slice(0, limit);
    
    return topModels;
  },
  
  getFoldsByDifficulty(): DifficultyCount[] {
    const folds = db.getFolds();
    const models = db.getModels();
    const difficulties: Difficulty[] = ['简单', '中等', '复杂', '极复杂'];
    
    const difficultyMap = new Map<Difficulty, number>();
    difficulties.forEach(d => difficultyMap.set(d, 0));
    
    folds.forEach(fold => {
      const model = models.find(m => m.id === fold.modelId);
      if (model && difficultyMap.has(model.difficulty)) {
        difficultyMap.set(model.difficulty, (difficultyMap.get(model.difficulty) || 0) + 1);
      }
    });
    
    return difficulties.map(difficulty => ({
      difficulty,
      count: difficultyMap.get(difficulty) || 0,
    }));
  },
  
  getTopPaper(limit: number = 10): TopPaper[] {
    const folds = db.getFolds();
    const countMap = new Map<string, number>();
    
    folds.forEach(fold => {
      const key = fold.paperType || '未知';
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });
    
    const topPaper = Array.from(countMap.entries())
      .map(([type, usageCount]) => ({ type, usageCount }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
    
    return topPaper;
  },
};
