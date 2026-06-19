import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Layers,
  TrendingUp,
  Plus,
  ChevronRight,
  Star,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function Dashboard() {
  const { summary, folds, fetchStatistics, fetchFolds } = useAppStore();

  useEffect(() => {
    fetchStatistics();
    fetchFolds();
  }, [fetchStatistics, fetchFolds]);

  const recentFolds = folds.slice(0, 5);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800">欢迎回来 ✨</h1>
          <p className="text-gray-500 mt-1">继续你的折纸之旅吧</p>
        </div>
        <Link
          to="/models/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all hover:shadow-md font-medium"
        >
          <Plus className="w-5 h-5" />
          添加模型
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50 hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">模型总数</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {summary?.totalModels || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-primary-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>收藏的折纸模型</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-green-50 hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">累计折叠</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {summary?.totalFolds || 0}
              </p>
              <span className="text-sm text-gray-400">次</span>
            </div>
            <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            共 {formatTime(summary?.totalFoldTimeMinutes || 0)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-pink-50 hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">纸张种类</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {summary?.totalPaperTypes || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-accent-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            库存充足，可以尽情创作
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-card hover:shadow-hover transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">本月折叠</p>
              <p className="text-3xl font-bold mt-1">
                {recentFolds.filter(f => {
                  const now = new Date();
                  const foldDate = new Date(f.foldDate);
                  return foldDate.getMonth() === now.getMonth() &&
                    foldDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
              <span className="text-sm text-primary-200">次</span>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-primary-100">
            继续保持，坚持就是胜利！
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-serif font-bold text-gray-800">最近折叠</h2>
            <Link to="/folds" className="text-primary-500 text-sm flex items-center gap-1 hover:text-primary-600">
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {recentFolds.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>还没有折叠记录</p>
              <p className="text-sm mt-1">开始你的第一次折叠吧</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentFolds.map((fold) => (
                <div key={fold.id} className="flex items-center gap-4 p-4 bg-warm-50 rounded-xl hover:bg-orange-50 transition-colors">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📜</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800 truncate">
                        {fold.paperType} - {fold.paperSize}
                      </p>
                      <span className="text-sm">{getRatingStars(fold.rating)}</span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4" />
                      {fold.foldDate}
                      <span className="mx-2">·</span>
                      用时 {fold.durationMinutes} 分钟
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
          <h2 className="text-lg font-serif font-bold text-gray-800 mb-6">快速开始</h2>
          <div className="space-y-3">
            <Link
              to="/models"
              className="flex items-center gap-3 p-4 bg-warm-50 rounded-xl hover:bg-orange-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <BookOpen className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">浏览模型库</p>
                <p className="text-xs text-gray-500">选择一个模型开始折叠</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </Link>
            
            <Link
              to="/models/new"
              className="flex items-center gap-3 p-4 bg-warm-50 rounded-xl hover:bg-orange-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center group-hover:bg-success-100 transition-colors">
                <Plus className="w-5 h-5 text-success-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">添加新模型</p>
                <p className="text-xs text-gray-500">记录新的折纸模型</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </Link>
            
            <Link
              to="/paper"
              className="flex items-center gap-3 p-4 bg-warm-50 rounded-xl hover:bg-orange-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center group-hover:bg-accent-100 transition-colors">
                <Layers className="w-5 h-5 text-accent-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">管理纸张</p>
                <p className="text-xs text-gray-500">查看和管理纸张库存</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </Link>
            
            <Link
              to="/statistics"
              className="flex items-center gap-3 p-4 bg-warm-50 rounded-xl hover:bg-orange-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">数据统计</p>
                <p className="text-xs text-gray-500">查看折纸数据分析</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
