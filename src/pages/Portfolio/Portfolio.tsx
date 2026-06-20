import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Filter,
  Star,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  Tag,
  Calendar,
  Image as ImageIcon,
  Layers,
  Award,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  CATEGORY_ICONS,
  CATEGORIES,
  RATING_LABELS,
  COMPLETION_LABELS,
  NEATNESS_LABELS,
} from '../../constants';
import type {
  FoldRecord,
  Model,
  Category,
  FoldResultImage,
} from '../../../shared/types';

type DateFilter = 'all' | 'week' | 'month' | 'year' | 'custom';

export default function Portfolio() {
  const { folds, models, fetchFolds, fetchModels } = useAppStore();

  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [onlyRepresentative, setOnlyRepresentative] = useState(false);

  const [previewFold, setPreviewFold] = useState<FoldRecord | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  useEffect(() => {
    fetchFolds();
    fetchModels();
  }, [fetchFolds, fetchModels]);

  const portfolioFolds = useMemo(() => {
    return folds.filter(
      (f) =>
        (f.resultImageUrl && f.resultImageUrl.trim() !== '') ||
        (f.resultImages && f.resultImages.length > 0)
    );
  }, [folds]);

  const getModel = (modelId: string): Model | undefined => {
    return models.find((m) => m.id === modelId);
  };

  const getPreviewImages = (fold: FoldRecord): FoldResultImage[] => {
    const images: FoldResultImage[] = [];
    if (fold.resultImages && fold.resultImages.length > 0) {
      images.push(...fold.resultImages);
    }
    if (fold.resultImageUrl && fold.resultImageUrl.trim() !== '') {
      const hasUrl = images.some((img) => img.url === fold.resultImageUrl);
      if (!hasUrl) {
        images.unshift({
          id: 'main-' + fold.id,
          foldRecordId: fold.id,
          url: fold.resultImageUrl,
          type: '正面',
        });
      }
    }
    return images;
  };

  const getCoverImage = (fold: FoldRecord): string => {
    if (fold.resultImages && fold.resultImages.length > 0) {
      return fold.resultImages[0].url;
    }
    return fold.resultImageUrl || '';
  };

  const isInDateRange = (foldDate: string): boolean => {
    const date = new Date(foldDate);
    const now = new Date();

    switch (dateFilter) {
      case 'all':
        return true;
      case 'week': {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo;
      }
      case 'month': {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }
      case 'year': {
        return date.getFullYear() === now.getFullYear();
      }
      case 'custom': {
        if (!customStartDate && !customEndDate) return true;
        if (customStartDate && date < new Date(customStartDate)) return false;
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (date > end) return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  const filteredFolds = useMemo(() => {
    return portfolioFolds.filter((fold) => {
      if (selectedModel !== 'all' && fold.modelId !== selectedModel) {
        return false;
      }

      const model = getModel(fold.modelId);
      if (
        selectedCategory !== 'all' &&
        model?.category !== selectedCategory
      ) {
        return false;
      }

      if (selectedRating !== 'all' && fold.rating !== selectedRating) {
        return false;
      }

      if (onlyRepresentative && !fold.isRepresentative) {
        return false;
      }

      if (!isInDateRange(fold.foldDate)) {
        return false;
      }

      return true;
    });
  }, [
    portfolioFolds,
    selectedModel,
    selectedCategory,
    selectedRating,
    onlyRepresentative,
    dateFilter,
    customStartDate,
    customEndDate,
    models,
  ]);

  const stats = useMemo(() => {
    const totalWorks = portfolioFolds.length;
    const modelIds = new Set(portfolioFolds.map((f) => f.modelId));
    const modelCoverage = modelIds.size;
    const representativeCount = portfolioFolds.filter(
      (f) => f.isRepresentative
    ).length;
    const totalTime = portfolioFolds.reduce(
      (sum, f) => sum + (f.durationMinutes || 0),
      0
    );
    return { totalWorks, modelCoverage, representativeCount, totalTime };
  }, [portfolioFolds]);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatTotalTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} 分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < rating
            ? 'text-amber-400 fill-amber-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const openPreview = (fold: FoldRecord) => {
    setPreviewFold(fold);
    setPreviewImageIndex(0);
  };

  const closePreview = () => {
    setPreviewFold(null);
    setPreviewImageIndex(0);
  };

  const prevImage = () => {
    if (!previewFold) return;
    const images = getPreviewImages(previewFold);
    setPreviewImageIndex((prev) =>
      prev <= 0 ? images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    if (!previewFold) return;
    const images = getPreviewImages(previewFold);
    setPreviewImageIndex((prev) =>
      prev >= images.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!previewFold) return;
      if (e.key === 'Escape') closePreview();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [previewFold]);

  const previewImages = previewFold ? getPreviewImages(previewFold) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800">作品集</h1>
          <p className="text-gray-500 mt-1">展示你的折纸艺术成就</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-orange-50 hover:shadow-card transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">作品总数</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.totalWorks}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft border border-green-50 hover:shadow-card transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">模型覆盖</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.modelCoverage}
              </p>
              <span className="text-xs text-gray-400">种</span>
            </div>
            <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-success-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft border border-pink-50 hover:shadow-card transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">代表作</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.representativeCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-accent-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-5 text-white shadow-card hover:shadow-hover transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-xs">总折叠用时</p>
              <p className="text-xl font-bold mt-1">
                {formatTotalTime(stats.totalTime)}
              </p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-soft border border-orange-50">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">筛选条件</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <label className="text-xs text-gray-500">模型</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white"
            >
              <option value="all">全部模型</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">分类</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white"
            >
              <option value="all">全部分类</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_ICONS[cat as Category]} {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-400" />
            <label className="text-xs text-gray-500">评分</label>
            <select
              value={selectedRating === 'all' ? 'all' : String(selectedRating)}
              onChange={(e) =>
                setSelectedRating(
                  e.target.value === 'all' ? 'all' : Number(e.target.value)
                )
              }
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white"
            >
              <option value="all">全部评分</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {'⭐'.repeat(r)} ({RATING_LABELS[r]})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <label className="text-xs text-gray-500">日期</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white"
            >
              <option value="all">全部</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="year">本年</option>
              <option value="custom">自定义</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 animate-fade-in">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
              />
              <span className="text-gray-400">~</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
              />
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-gray-500">仅代表作</label>
            <button
              onClick={() => setOnlyRepresentative(!onlyRepresentative)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                onlyRepresentative ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center ${
                  onlyRepresentative ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                {onlyRepresentative && <Trophy className="w-3 h-3 text-primary-500" />}
              </span>
            </button>
          </div>
        </div>
      </div>

      {filteredFolds.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-orange-50 animate-slide-up">
          <div className="text-5xl mb-4">📷</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {portfolioFolds.length === 0 ? '暂无作品' : '没有匹配的作品'}
          </h3>
          <p className="text-gray-500 mb-6">
            {portfolioFolds.length === 0
              ? '完成折叠后上传成品图即可在此展示'
              : '尝试调整筛选条件'}
          </p>
          {portfolioFolds.length === 0 && (
            <Link
              to="/models"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all font-medium"
            >
              <Layers className="w-5 h-5" />
              浏览模型
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFolds.map((fold, index) => {
            const model = getModel(fold.modelId);
            const coverImage = getCoverImage(fold);

            return (
              <div
                key={fold.id}
                className="group bg-white rounded-2xl shadow-soft border border-orange-50 overflow-hidden hover:shadow-hover hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className="relative aspect-[4/3] bg-gradient-to-br from-warm-50 to-primary-50 cursor-pointer overflow-hidden"
                  onClick={() => openPreview(fold)}
                >
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={model?.name || '作品'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
                      <ImageIcon className="w-16 h-16" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                      <ZoomIn className="w-3.5 h-3.5" />
                      查看大图
                    </div>
                  </div>

                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                    <div className="flex items-center gap-0.5">
                      {renderStars(fold.rating)}
                    </div>
                  </div>

                  {fold.isRepresentative && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/models/${fold.modelId}`}
                        className="font-bold text-gray-800 hover:text-primary-600 transition-colors truncate block"
                      >
                        {model?.name || '未知模型'}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-0.5">
                          {CATEGORY_ICONS[(model?.category as Category) || '其他']}
                          {model?.category || '其他'}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" />
                          {fold.foldDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        fold.success
                          ? 'bg-green-50 text-green-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {fold.success ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          成功
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          失败
                        </>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                      <Clock className="w-3 h-3" />
                      {formatDuration(fold.durationMinutes)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        fold.completion >= 4
                          ? 'bg-emerald-50 text-emerald-600'
                          : fold.completion >= 3
                          ? 'bg-yellow-50 text-yellow-600'
                          : 'bg-orange-50 text-orange-600'
                      }`}
                      title={COMPLETION_LABELS[fold.completion]}
                    >
                      完成度 {fold.completion}/5
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        fold.neatness >= 4
                          ? 'bg-purple-50 text-purple-600'
                          : fold.neatness >= 3
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'bg-slate-50 text-slate-600'
                      }`}
                      title={NEATNESS_LABELS[fold.neatness]}
                    >
                      整洁度 {fold.neatness}/5
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewFold && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={closePreview}
        >
          <div
            className="relative w-full max-w-5xl max-h-[95vh] mx-4 bg-white rounded-2xl shadow-hover overflow-hidden flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">
                    {getModel(previewFold.modelId)?.name || '作品详情'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {previewImages.length > 1 &&
                      `${previewImageIndex + 1} / ${previewImages.length}`}
                  </p>
                </div>
              </div>
              <button
                onClick={closePreview}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 bg-gradient-to-br from-gray-50 to-warm-50 flex items-center justify-center min-h-[300px] overflow-hidden">
              {previewImages[previewImageIndex] ? (
                <img
                  src={previewImages[previewImageIndex].url}
                  alt={previewImages[previewImageIndex].caption || '作品图'}
                  className="max-w-full max-h-[55vh] object-contain p-4"
                />
              ) : (
                <div className="text-gray-300">
                  <ImageIcon className="w-24 h-24" />
                </div>
              )}

              {previewImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:text-primary-600 shadow-md transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:text-primary-600 shadow-md transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full">
                    {previewImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPreviewImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === previewImageIndex
                            ? 'bg-white w-6'
                            : 'bg-white/50 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {previewImages[previewImageIndex] && (
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-full shadow-md">
                    {previewImages[previewImageIndex].type}
                  </span>
                  {previewImages[previewImageIndex].caption && (
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs text-gray-700 rounded-full shadow-sm">
                      {previewImages[previewImageIndex].caption}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 p-5 bg-warm-50/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">模型</p>
                  <Link
                    to={`/models/${previewFold.modelId}`}
                    className="font-medium text-gray-800 hover:text-primary-600 transition-colors"
                  >
                    {getModel(previewFold.modelId)?.name || '未知'}
                  </Link>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">分类</p>
                  <p className="font-medium text-gray-800">
                    {CATEGORY_ICONS[
                      (getModel(previewFold.modelId)?.category as Category) ||
                        '其他'
                    ]}{' '}
                    {getModel(previewFold.modelId)?.category || '其他'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">折叠日期</p>
                  <p className="font-medium text-gray-800">
                    {previewFold.foldDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">用时</p>
                  <p className="font-medium text-gray-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {formatDuration(previewFold.durationMinutes)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                  <span className="text-xs text-gray-500 mr-1">评分</span>
                  <div className="flex items-center gap-0.5">
                    {renderStars(previewFold.rating)}
                  </div>
                  <span className="text-xs font-medium text-gray-700 ml-1">
                    {RATING_LABELS[previewFold.rating]}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-sm border ${
                    previewFold.success
                      ? 'bg-green-50 border-green-100'
                      : 'bg-red-50 border-red-100'
                  }`}
                >
                  {previewFold.success ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      previewFold.success ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {previewFold.success ? '折叠成功' : '折叠失败'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                  <span className="text-xs text-gray-500">完成度</span>
                  <span className="text-xs font-bold text-emerald-600">
                    {COMPLETION_LABELS[previewFold.completion]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100">
                  <span className="text-xs text-gray-500">整洁度</span>
                  <span className="text-xs font-bold text-purple-600">
                    {NEATNESS_LABELS[previewFold.neatness]}
                  </span>
                </div>
                {previewFold.isRepresentative && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg shadow-sm border border-amber-200">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-700">
                      代表作
                    </span>
                  </div>
                )}
              </div>

              {previewFold.notes && (
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1.5">📝 笔记</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {previewFold.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
