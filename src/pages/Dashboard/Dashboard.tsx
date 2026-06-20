import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Trophy,
  Bookmark,
  Heart,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  STATUS_COLORS,
  CATEGORY_ICONS,
  DEFAULT_MODEL_TAGS,
  DIFFICULTY_COLORS,
  RATING_LABELS,
  MODEL_STATUSES,
} from '../../constants';
import type {
  Model,
  FoldRecord,
  ModelStatus,
  ModelTag,
  Category,
} from '../../../shared/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    summary,
    folds,
    models,
    collections,
    fetchStatistics,
    fetchFolds,
    fetchModels,
    fetchCollections,
    toggleWishlist,
  } = useAppStore();

  useEffect(() => {
    fetchStatistics();
    fetchFolds();
    fetchModels();
    fetchCollections();
  }, [fetchStatistics, fetchFolds, fetchModels, fetchCollections]);

  const recentFolds = folds.slice(0, 5);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(Math.max(0, Math.min(5, rating)));
  };

  const nextWishlistModel = useMemo(() => {
    const wishlistModels = models
      .filter((m) => m.isWishlist)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    return wishlistModels.length > 0 ? wishlistModels[0] : null;
  }, [models]);

  const representativeFolds = useMemo(() => {
    return folds
      .filter((f) => f.isRepresentative)
      .slice(0, 6);
  }, [folds]);

  const representativeCount = useMemo(() => {
    return folds.filter((f) => f.isRepresentative).length;
  }, [folds]);

  const statusDistribution = useMemo(() => {
    const dist: Record<ModelStatus, number> = {
      '未开始': 0,
      '学习中': 0,
      '已完成': 0,
      '熟练': 0,
      '搁置': 0,
    };
    models.forEach((m) => {
      if (dist[m.status] !== undefined) {
        dist[m.status]++;
      }
    });
    return dist;
  }, [models]);

  const tagDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    DEFAULT_MODEL_TAGS.forEach((tag) => {
      dist[tag] = 0;
    });
    models.forEach((m) => {
      m.tags.forEach((tag) => {
        if (dist[tag] !== undefined) {
          dist[tag]++;
        }
      });
    });
    return dist;
  }, [models]);

  const favoriteCount = useMemo(() => {
    return models.filter((m) => m.isFavorite).length;
  }, [models]);

  const wishlistCount = useMemo(() => {
    return models.filter((m) => m.isWishlist).length;
  }, [models]);

  const maxStatusCount = Math.max(...Object.values(statusDistribution), 1);
  const maxTagCount = Math.max(...Object.values(tagDistribution), 1);

  const getModelNameById = (modelId: string): string => {
    const model = models.find((m) => m.id === modelId);
    return model?.name || '未知模型';
  };

  const handleSkipWishlist = async (modelId: string) => {
    await toggleWishlist(modelId);
  };

  const getCompletionBadge = (completion: number) => {
    const colors = [
      'bg-red-100 text-red-700',
      'bg-orange-100 text-orange-700',
      'bg-yellow-100 text-yellow-700',
      'bg-lime-100 text-lime-700',
      'bg-green-100 text-green-700',
    ];
    const labels = ['大量缺失', '部分完成', '基本完成', '接近完整', '完全完成'];
    const idx = Math.max(0, Math.min(4, completion - 1));
    return { color: colors[idx], label: labels[idx] };
  };

  const getNeatnessBadge = (neatness: number) => {
    const colors = [
      'bg-red-100 text-red-700',
      'bg-orange-100 text-orange-700',
      'bg-yellow-100 text-yellow-700',
      'bg-lime-100 text-lime-700',
      'bg-emerald-100 text-emerald-700',
    ];
    const labels = ['非常粗糙', '较粗糙', '一般', '较整洁', '非常整洁'];
    const idx = Math.max(0, Math.min(4, neatness - 1));
    return { color: colors[idx], label: labels[idx] };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 顶部欢迎区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-serif font-bold text-gray-800">
            欢迎回来 ✨
          </h1>
          <p className="text-gray-500 mt-1">继续你的折纸之旅吧</p>
          <div className="mt-4">
            <Link
              to="/models/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all hover:shadow-md font-medium"
            >
              <Plus className="w-5 h-5" />
              添加模型
            </Link>
          </div>
        </div>

        {/* 下一个想折卡片 */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 shadow-soft border border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <Bookmark className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-serif font-bold text-gray-800">
              下一个想折
            </h2>
          </div>

          {nextWishlistModel ? (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-warm-50 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl">
                  {CATEGORY_ICONS[nextWishlistModel.category as Category] || '✨'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-800 truncate">
                      {nextWishlistModel.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[nextWishlistModel.difficulty]}`}
                    >
                      {nextWishlistModel.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {nextWishlistModel.category} · {nextWishlistModel.stepCount} 步
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/models/${nextWishlistModel.id}`)}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                >
                  立即去折
                </button>
                <button
                  onClick={() => handleSkipWishlist(nextWishlistModel.id)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  跳过
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Sparkles className="w-10 h-10 mx-auto text-orange-300 mb-3" />
              <p className="text-gray-500 text-sm">想折清单空空如也~</p>
              <p className="text-gray-400 text-xs mt-1">
                去模型库挑选你想折的模型吧
              </p>
              <Link
                to="/models"
                className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-white text-primary-500 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium border border-orange-200"
              >
                浏览模型库
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 统计卡片 */}
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

        <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-card hover:shadow-hover transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">代表作数量</p>
              <p className="text-3xl font-bold mt-1">
                {representativeCount}
              </p>
              <span className="text-sm text-amber-200">件</span>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-amber-100 flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" />
            <span>每一件都是精心之作</span>
          </div>
        </div>
      </div>

      {/* 代表作展示区 */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-serif font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            精选代表作
          </h2>
          <Link
            to="/portfolio"
            className="text-primary-500 text-sm flex items-center gap-1 hover:text-primary-600"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {representativeFolds.length < 1 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-amber-300" />
            </div>
            <p className="text-gray-500">还没有标记代表作</p>
            <p className="text-sm text-gray-400 mt-1">
              在折叠记录中标记你的满意作品吧
            </p>
            <Link
              to="/folds"
              className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
            >
              查看折叠记录
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
            {representativeFolds.map((fold) => {
              const resultImage =
                fold.resultImageUrl ||
                (fold.resultImages && fold.resultImages.length > 0
                  ? fold.resultImages[0].url
                  : null);
              const completion = getCompletionBadge(fold.completion);
              return (
                <div
                  key={fold.id}
                  className="flex-shrink-0 w-56 bg-warm-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow border border-amber-200/50"
                >
                  <div className="h-40 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center relative overflow-hidden">
                    {resultImage ? (
                      <img
                        src={resultImage}
                        alt={getModelNameById(fold.modelId)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-5xl opacity-30">🏆</div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-amber-600">
                        🏆 代表作
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 truncate">
                      {getModelNameById(fold.modelId)}
                    </h3>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {fold.foldDate?.slice(0, 10)}
                      </span>
                      <span className="text-amber-500 flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {fold.rating || 5}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs ${completion.color}`}
                      >
                        {completion.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 最近折叠 + 快速统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近折叠 */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-serif font-bold text-gray-800">
              最近折叠
            </h2>
            <Link
              to="/folds"
              className="text-primary-500 text-sm flex items-center gap-1 hover:text-primary-600"
            >
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
              {recentFolds.map((fold) => {
                const completion = getCompletionBadge(fold.completion);
                const neatness = getNeatnessBadge(fold.neatness);
                return (
                  <div
                    key={fold.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                      fold.isRepresentative
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200'
                        : 'bg-warm-50 hover:bg-orange-50 border-2 border-transparent'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        fold.isRepresentative
                          ? 'bg-amber-100'
                          : 'bg-primary-100'
                      }`}
                    >
                      <span className="text-xl">
                        {fold.isRepresentative ? '🏆' : '📜'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-800 truncate">
                          {getModelNameById(fold.modelId)}
                        </p>
                        <span className="text-sm">
                          {getRatingStars(fold.rating)}
                        </span>
                        {fold.success ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                        {fold.isRepresentative && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                            代表作
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1 flex-wrap">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        {fold.foldDate?.slice(0, 10)}
                        <span className="mx-1">·</span>
                        用时 {fold.durationMinutes} 分钟
                        <span className="mx-1">·</span>
                        {fold.paperType} {fold.paperSize}
                      </p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${completion.color}`}
                          title={`完成度：${completion.label}`}
                        >
                          ✓{fold.completion}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${neatness.color}`}
                          title={`整洁度：${neatness.label}`}
                        >
                          ✦{fold.neatness}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 快速统计 */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
            <h2 className="text-lg font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              快速统计
            </h2>

            {/* 按模型状态分布 */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                模型状态分布
              </h3>
              <div className="space-y-2.5">
                {MODEL_STATUSES.map((status) => {
                  const count = statusDistribution[status] || 0;
                  const percentage = (count / maxStatusCount) * 100;
                  return (
                    <div key={status}>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}
                        >
                          {status}
                        </span>
                        <span className="text-gray-600 font-medium">
                          {count}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 按标签分布 */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                标签分布
              </h3>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_MODEL_TAGS.map((tag) => {
                  const count = tagDistribution[tag] || 0;
                  const isActive = count > 0;
                  return (
                    <div
                      key={tag}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'bg-gray-50 text-gray-400 border border-gray-100'
                      }`}
                    >
                      {tag}
                      <span
                        className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                          isActive
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 收藏数 / 想折清单数 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-rose-50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                </div>
                <p className="text-2xl font-bold text-rose-600">
                  {favoriteCount}
                </p>
                <p className="text-xs text-rose-500 mt-0.5">收藏数</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Bookmark className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {wishlistCount}
                </p>
                <p className="text-xs text-orange-500 mt-0.5">想折清单</p>
              </div>
            </div>
          </div>

          {/* 快速开始 */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
            <h2 className="text-lg font-serif font-bold text-gray-800 mb-4">
              快速开始
            </h2>
            <div className="space-y-2">
              <Link
                to="/models"
                className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl hover:bg-orange-50 transition-colors group"
              >
                <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <BookOpen className="w-4.5 h-4.5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">
                    浏览模型库
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>

              <Link
                to="/models/new"
                className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl hover:bg-orange-50 transition-colors group"
              >
                <div className="w-9 h-9 bg-success-50 rounded-lg flex items-center justify-center group-hover:bg-success-100 transition-colors">
                  <Plus className="w-4.5 h-4.5 text-success-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">
                    添加新模型
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>

              <Link
                to="/paper"
                className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl hover:bg-orange-50 transition-colors group"
              >
                <div className="w-9 h-9 bg-accent-50 rounded-lg flex items-center justify-center group-hover:bg-accent-100 transition-colors">
                  <Layers className="w-4.5 h-4.5 text-accent-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">管理纸张</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>

              <Link
                to="/statistics"
                className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl hover:bg-orange-50 transition-colors group"
              >
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <BarChart3 className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">数据统计</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 合集展示区 */}
      {collections.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-serif font-bold text-gray-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent-500" />
              我的合集
            </h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="flex-shrink-0 w-64 bg-warm-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow border border-gray-100 cursor-pointer group"
                onClick={() => navigate(`/collections/${collection.id}`)}
              >
                <div className="h-32 bg-gradient-to-br from-accent-100 via-primary-100 to-orange-100 flex items-center justify-center relative overflow-hidden">
                  {collection.coverImage ? (
                    <img
                      src={collection.coverImage}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-1">📚</div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-0.5 px-2 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-gray-700">
                      {collection.modelIds.length} 个模型
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 truncate group-hover:text-primary-600 transition-colors">
                    {collection.name}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
