import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Star,
  BookOpen,
  Plus,
  Filter,
  Trophy,
  Edit2,
  Trash2,
  X,
  Save,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Award,
  Target,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  RATING_LABELS,
  COMPLETION_LABELS,
  NEATNESS_LABELS,
  RESULT_IMAGE_TYPES,
} from '../../constants';
import type {
  FoldRecord,
  CompletionDegree,
  NeatnessDegree,
  ResultImageType,
} from '../../../shared/types';

export default function FoldHistory() {
  const {
    folds,
    models,
    fetchFolds,
    fetchModels,
    toggleRepresentative,
    updateFold,
    deleteFold,
  } = useAppStore();

  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'success' | 'fail'>('all');
  const [selectedRepresentative, setSelectedRepresentative] = useState<'all' | 'representative'>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editingFold, setEditingFold] = useState<FoldRecord | null>(null);
  const [editForm, setEditForm] = useState<{
    rating: number;
    completion: CompletionDegree;
    neatness: NeatnessDegree;
    success: boolean;
    notes: string;
    resultImageUrl: string;
    isRepresentative: boolean;
  }>({
    rating: 4,
    completion: 5,
    neatness: 5,
    success: true,
    notes: '',
    resultImageUrl: '',
    isRepresentative: false,
  });
  const [expandedImages, setExpandedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchFolds();
    fetchModels();
  }, [fetchFolds, fetchModels]);

  const statistics = useMemo(() => {
    if (folds.length === 0) {
      return {
        total: 0,
        successCount: 0,
        avgRating: 0,
        avgCompletion: 0,
        avgNeatness: 0,
        successRate: 0,
      };
    }
    const successCount = folds.filter(f => f.success).length;
    const totalRating = folds.reduce((sum, f) => sum + f.rating, 0);
    const totalCompletion = folds.reduce((sum, f) => sum + f.completion, 0);
    const totalNeatness = folds.reduce((sum, f) => sum + f.neatness, 0);
    return {
      total: folds.length,
      successCount,
      successRate: Math.round((successCount / folds.length) * 100),
      avgRating: Number((totalRating / folds.length).toFixed(1)),
      avgCompletion: Number((totalCompletion / folds.length).toFixed(1)),
      avgNeatness: Number((totalNeatness / folds.length).toFixed(1)),
    };
  }, [folds]);

  const filteredFolds = useMemo(() => {
    return folds.filter(fold => {
      if (selectedModel !== 'all' && fold.modelId !== selectedModel) return false;
      if (selectedStatus === 'success' && !fold.success) return false;
      if (selectedStatus === 'fail' && fold.success) return false;
      if (selectedRepresentative === 'representative' && !fold.isRepresentative) return false;
      if (dateFrom && fold.foldDate < dateFrom) return false;
      if (dateTo && fold.foldDate > dateTo) return false;
      return true;
    });
  }, [folds, selectedModel, selectedStatus, selectedRepresentative, dateFrom, dateTo]);

  const getModelName = (modelId: string) => {
    return models.find(m => m.id === modelId)?.name || '未知模型';
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const groupedByDate = filteredFolds.reduce((groups, fold) => {
    const date = fold.foldDate;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(fold);
    return groups;
  }, {} as Record<string, FoldRecord[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  const groupedResultImages = (fold: FoldRecord) => {
    const grouped: Record<ResultImageType, typeof fold.resultImages> = {
      '正面': [],
      '背面': [],
      '细节': [],
    };
    fold.resultImages.forEach(img => {
      if (grouped[img.type]) {
        grouped[img.type].push(img);
      }
    });
    return grouped;
  };

  const handleToggleRepresentative = async (id: string) => {
    await toggleRepresentative(id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条折叠记录吗？此操作不可撤销。')) return;
    await deleteFold(id);
  };

  const openEditModal = (fold: FoldRecord) => {
    setEditingFold(fold);
    setEditForm({
      rating: fold.rating,
      completion: fold.completion,
      neatness: fold.neatness,
      success: fold.success,
      notes: fold.notes,
      resultImageUrl: fold.resultImageUrl,
      isRepresentative: fold.isRepresentative,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingFold) return;
    await updateFold(editingFold.id, editForm);
    setEditingFold(null);
  };

  const toggleImagesExpanded = (foldId: string) => {
    setExpandedImages(prev => ({
      ...prev,
      [foldId]: !prev[foldId],
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800">折叠记录</h1>
          <p className="text-gray-500 mt-1">共 {folds.length} 次折叠记录</p>
        </div>
      </div>

      {folds.length > 0 && (
        <div className="bg-gradient-to-r from-primary-500 via-orange-500 to-amber-500 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5" />
            <h3 className="font-bold text-lg">折叠统计</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <Sparkles className="w-4 h-4" />
                <span>总记录</span>
              </div>
              <div className="text-3xl font-bold">{statistics.total}</div>
              <div className="text-white/70 text-xs mt-1">次折叠</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <CheckCircle className="w-4 h-4" />
                <span>成功数</span>
              </div>
              <div className="text-3xl font-bold">{statistics.successCount}</div>
              <div className="text-white/70 text-xs mt-1">成功率 {statistics.successRate}%</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <Star className="w-4 h-4" />
                <span>平均评分</span>
              </div>
              <div className="text-3xl font-bold">{statistics.avgRating}</div>
              <div className="text-white/70 text-xs mt-1">满分 5.0</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <Target className="w-4 h-4" />
                <span>平均完成度</span>
              </div>
              <div className="text-3xl font-bold">{statistics.avgCompletion}</div>
              <div className="text-white/70 text-xs mt-1">满分 5.0</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <Award className="w-4 h-4" />
                <span>平均整洁度</span>
              </div>
              <div className="text-3xl font-bold">{statistics.avgNeatness}</div>
              <div className="text-white/70 text-xs mt-1">满分 5.0</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600 font-medium">筛选条件</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">模型</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="all">全部模型</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">状态</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'success' | 'fail')}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="all">全部状态</option>
              <option value="success">✓ 成功</option>
              <option value="fail">✗ 失败</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">代表作</label>
            <select
              value={selectedRepresentative}
              onChange={(e) => setSelectedRepresentative(e.target.value as 'all' | 'representative')}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="all">全部记录</option>
              <option value="representative">🏆 仅代表作</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">开始日期</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">结束日期</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>
        {(selectedModel !== 'all' || selectedStatus !== 'all' || selectedRepresentative !== 'all' || dateFrom || dateTo) && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              筛选结果：<span className="font-medium text-primary-600">{filteredFolds.length}</span> 条记录
            </span>
            <button
              onClick={() => {
                setSelectedModel('all');
                setSelectedStatus('all');
                setSelectedRepresentative('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
            >
              清除筛选
            </button>
          </div>
        )}
      </div>

      {folds.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-orange-50">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">暂无记录</h3>
          <p className="text-gray-500 mb-6">开始你的第一次折叠吧</p>
          <Link
            to="/models"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all"
          >
            <BookOpen className="w-5 h-5" />
            浏览模型
          </Link>
        </div>
      ) : filteredFolds.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-orange-50">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">没有匹配的记录</h3>
          <p className="text-gray-500 mb-6">试试调整筛选条件</p>
          <button
            onClick={() => {
              setSelectedModel('all');
              setSelectedStatus('all');
              setSelectedRepresentative('all');
              setDateFrom('');
              setDateTo('');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all"
          >
            清除筛选
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">{date}</h2>
                  <p className="text-sm text-gray-500">
                    {groupedByDate[date].length} 次折叠
                  </p>
                </div>
              </div>

              <div className="ml-5 pl-8 border-l-2 border-orange-100 space-y-4">
                {groupedByDate[date].map((fold) => (
                  <div
                    key={fold.id}
                    className={`relative bg-white rounded-xl p-5 shadow-soft border hover:shadow-card transition-shadow ${
                      fold.isRepresentative
                        ? 'border-2 border-yellow-300 bg-gradient-to-br from-yellow-50/50 to-white'
                        : 'border-orange-50'
                    }`}
                  >
                    <div className={`absolute -left-[41px] top-6 w-4 h-4 rounded-full border-4 border-warm-50 ${
                      fold.success ? 'bg-green-500' : 'bg-red-400'
                    }`} />

                    {fold.isRepresentative && (
                      <div className="absolute -top-3 right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 text-xs font-bold">
                        <Trophy className="w-3.5 h-3.5" />
                        代表作
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/models/${fold.modelId}`}
                            className="font-bold text-gray-800 hover:text-primary-600 transition-colors text-lg"
                          >
                            {getModelName(fold.modelId)}
                          </Link>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            fold.success
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {fold.success ? (
                              <><CheckCircle className="w-3 h-3" /> 成功</>
                            ) : (
                              <><XCircle className="w-3 h-3" /> 失败</>
                            )}
                          </span>
                          {fold.isRepresentative && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              <Trophy className="w-3 h-3" /> 🏆
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {fold.durationMinutes} 分钟
                          </span>
                          <span>{fold.paperType} · {fold.paperSize}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-lg">{getRatingStars(fold.rating)}</div>
                        <p className="text-xs text-gray-400 mt-1">
                          {RATING_LABELS[fold.rating]}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-blue-700 flex items-center gap-1">
                            <Target className="w-3.5 h-3.5" />
                            完成度
                          </span>
                          <span className="text-xs font-bold text-blue-600">
                            {fold.completion}/5
                          </span>
                        </div>
                        <div className="flex gap-1 mb-1.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <div
                              key={n}
                              className={`flex-1 h-2 rounded-full transition-all ${
                                fold.completion >= n
                                  ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                                  : 'bg-blue-100'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-blue-600 font-medium">
                          {COMPLETION_LABELS[fold.completion]}
                        </p>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-purple-700 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            整洁度
                          </span>
                          <span className="text-xs font-bold text-purple-600">
                            {fold.neatness}/5
                          </span>
                        </div>
                        <div className="flex gap-1 mb-1.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <div
                              key={n}
                              className={`flex-1 h-2 rounded-full transition-all ${
                                fold.neatness >= n
                                  ? 'bg-gradient-to-r from-purple-400 to-purple-600'
                                  : 'bg-purple-100'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-purple-600 font-medium">
                          {NEATNESS_LABELS[fold.neatness]}
                        </p>
                      </div>
                    </div>

                    {fold.resultImageUrl && (
                      <div className="mt-4">
                        <div
                          className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-100 cursor-pointer hover:border-primary-400 transition-all group"
                          onClick={() => setPreviewImage(fold.resultImageUrl)}
                        >
                          <img
                            src={fold.resultImageUrl}
                            alt="成品图"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    )}

                    {fold.resultImages && fold.resultImages.length > 0 && (
                      <div className="mt-4">
                        <button
                          onClick={() => toggleImagesExpanded(fold.id)}
                          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-600 transition-colors mb-3"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span className="font-medium">成品图集</span>
                          <span className="text-xs text-gray-400">({fold.resultImages.length}张)</span>
                          {expandedImages[fold.id] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        {expandedImages[fold.id] && (
                          <div className="space-y-3">
                            {RESULT_IMAGE_TYPES.map((type) => {
                              const images = groupedResultImages(fold)[type];
                              if (images.length === 0) return null;
                              return (
                                <div key={type}>
                                  <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                                    {type} ({images.length})
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {images.map((img) => (
                                      <div
                                        key={img.id}
                                        className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-primary-400 hover:shadow-md transition-all group"
                                        onClick={() => setPreviewImage(img.url)}
                                      >
                                        <img
                                          src={img.url}
                                          alt={img.caption || `${type}图`}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                          <ImageIcon className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        {img.caption && (
                                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                                            <p className="text-[10px] text-white truncate">{img.caption}</p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {fold.notes && (
                      <div className="mt-4 p-3 bg-warm-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          💭 {fold.notes}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => handleToggleRepresentative(fold.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          fold.isRepresentative
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
                        }`}
                      >
                        <Trophy className="w-4 h-4" />
                        {fold.isRepresentative ? '取消代表作' : '设为代表作'}
                      </button>
                      <button
                        onClick={() => openEditModal(fold)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(fold.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="预览大图"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {editingFold && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary-500" />
                编辑折叠记录
              </h3>
              <button
                onClick={() => setEditingFold(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-warm-50 rounded-xl border border-orange-100">
              <p className="text-sm text-gray-600">
                模型：<span className="font-medium text-gray-800">{getModelName(editingFold.modelId)}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                日期：<span className="font-medium text-gray-800">{editingFold.foldDate}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  是否成功完成？
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, success: true })}
                    className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                      editForm.success
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ✓ 成功完成
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, success: false })}
                    className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                      !editForm.success
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ✗ 未能完成
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  综合评价：{RATING_LABELS[editForm.rating]}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, rating })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        editForm.rating >= rating
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      ⭐ {rating}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  完成度：{COMPLETION_LABELS[editForm.completion]}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, completion: n as CompletionDegree })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        editForm.completion >= n
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  整洁度：{NEATNESS_LABELS[editForm.neatness]}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, neatness: n as NeatnessDegree })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        editForm.neatness >= n
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  成品图片 URL
                </label>
                <input
                  type="url"
                  value={editForm.resultImageUrl}
                  onChange={(e) => setEditForm({ ...editForm, resultImageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isRepresentative}
                    onChange={(e) => setEditForm({ ...editForm, isRepresentative: e.target.checked })}
                    className="w-4 h-4 text-primary-500 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    标记为代表作
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  心得笔记
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="记录一下这次折叠的心得、遇到的困难..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingFold(null)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
