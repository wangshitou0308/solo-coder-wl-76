import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Play,
  Clock,
  Layers,
  User,
  BookOpen,
  Calendar,
  Star,
  Plus,
  X,
  ChevronDown,
  Award,
  CheckCircle,
  XCircle,
  Sparkles,
  FolderKanban,
  History,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  DIFFICULTY_COLORS,
  CATEGORY_ICONS,
  RATING_LABELS,
  PAPER_TYPES,
  STATUS_COLORS,
  TAG_COLORS,
  TUTORIAL_TYPE_ICONS,
  MODEL_STATUSES,
  COMPLETION_LABELS,
  NEATNESS_LABELS,
} from '../../constants';
import { cn } from '../../lib/utils';
import type {
  PaperType,
  ModelStatus,
  CompletionDegree,
  NeatnessDegree,
} from '../../../shared/types';

type TabType = 'info' | 'steps' | 'history' | 'statusHistory';

export default function ModelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    models,
    steps,
    folds,
    paper,
    loading,
    collections,
    statusHistories,
    fetchModels,
    fetchSteps,
    fetchFolds,
    fetchPaper,
    fetchCollections,
    deleteModel,
    createFold,
    toggleFavorite,
    toggleWishlist,
    updateModelStatus,
    toggleRepresentative,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [showFoldModal, setShowFoldModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [foldForm, setFoldForm] = useState({
    foldDate: new Date().toISOString().split('T')[0],
    paperType: '' as PaperType | '',
    paperSize: '',
    paperId: '' as string | null,
    durationMinutes: 0,
    rating: 4,
    completion: 5 as CompletionDegree,
    neatness: 5 as NeatnessDegree,
    success: true,
    isRepresentative: false,
    notes: '',
    resultImageUrl: '',
  });

  const model = models.find(m => m.id === id);
  const modelSteps = steps.filter(s => s.modelId === id);
  const modelFolds = folds.filter(f => f.modelId === id);
  const modelCollections = collections.filter(c => c.modelIds.includes(id || ''));
  const modelStatusHistories = statusHistories.filter(h => h.modelId === id);

  useEffect(() => {
    if (id) {
      fetchModels();
      fetchSteps(id);
      fetchFolds({ modelId: id });
      fetchPaper();
      fetchCollections();
    }
  }, [id, fetchModels, fetchSteps, fetchFolds, fetchPaper, fetchCollections]);

  const handleDelete = () => {
    if (confirm('确定要删除这个模型吗？相关的步骤和记录也会被删除。')) {
      deleteModel(id!);
      navigate('/models');
    }
  };

  const handleToggleFavorite = () => {
    if (id) toggleFavorite(id);
  };

  const handleToggleWishlist = () => {
    if (id) toggleWishlist(id);
  };

  const handleStatusChange = (status: ModelStatus) => {
    if (id) {
      updateModelStatus(id, status);
      setShowStatusDropdown(false);
    }
  };

  const handleSubmitFold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const selectedPaper = paper.find(p => p.id === foldForm.paperId);
      await createFold({
        modelId: id,
        paperId: foldForm.paperId || null,
        foldDate: foldForm.foldDate,
        paperType: selectedPaper?.type || foldForm.paperType || model?.recommendedPaperType || '',
        paperSize: selectedPaper?.size || foldForm.paperSize || model?.recommendedPaperSize || '',
        durationMinutes: foldForm.durationMinutes,
        rating: foldForm.rating,
        completion: foldForm.completion,
        neatness: foldForm.neatness,
        success: foldForm.success,
        isRepresentative: foldForm.isRepresentative,
        notes: foldForm.notes,
        resultImageUrl: foldForm.resultImageUrl,
      });
      setShowFoldModal(false);
      setFoldForm({
        foldDate: new Date().toISOString().split('T')[0],
        paperType: '',
        paperSize: '',
        paperId: '',
        durationMinutes: 0,
        rating: 4,
        completion: 5,
        neatness: 5,
        success: true,
        isRepresentative: false,
        notes: '',
        resultImageUrl: '',
      });
    } catch (error) {
      console.error('记录失败:', error);
    }
  };

  const handlePaperSelect = (paperId: string) => {
    const selected = paper.find(p => p.id === paperId);
    if (selected) {
      setFoldForm({
        ...foldForm,
        paperId,
        paperType: selected.type as PaperType,
        paperSize: selected.size,
      });
    } else {
      setFoldForm({
        ...foldForm,
        paperId: '',
      });
    }
  };

  const handleToggleRepresentative = (foldId: string) => {
    toggleRepresentative(foldId);
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  if (loading || models.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">模型不存在</p>
        <Link to="/models" className="text-primary-500 mt-4 inline-block">
          返回模型库
        </Link>
      </div>
    );
  }

  const groupedTutorialSources = (model.tutorialSources || []).reduce((acc, source) => {
    if (!acc[source.type]) acc[source.type] = [];
    acc[source.type].push(source);
    return acc;
  }, {} as Record<string, typeof model.tutorialSources>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link
          to="/models"
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回模型库
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleFavorite}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border rounded-xl transition-colors',
              model.isFavorite
                ? 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100'
                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
            )}
            title={model.isFavorite ? '取消收藏' : '收藏'}
          >
            <Star className={cn('w-4 h-4', model.isFavorite && 'fill-yellow-400')} />
            {model.isFavorite ? '已收藏' : '收藏'}
          </button>
          <button
            onClick={handleToggleWishlist}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border rounded-xl transition-colors',
              model.isWishlist
                ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
            )}
            title={model.isWishlist ? '从想折清单移除' : '加入想折清单'}
          >
            <Sparkles className="w-4 h-4" />
            {model.isWishlist ? '想折中' : '想折'}
          </button>
          <Link
            to={`/models/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            编辑
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-orange-50 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary-400 via-orange-400 to-primary-500 flex items-center justify-center relative">
          <span className="text-7xl">{CATEGORY_ICONS[model.category]}</span>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium bg-white/90',
              DIFFICULTY_COLORS[model.difficulty]
            )}>
              {model.difficulty}
            </span>
          </div>
          <div className="absolute bottom-4 right-4 relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/95 shadow-sm',
                STATUS_COLORS[model.status]
              )}
            >
              <span>{model.status}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showStatusDropdown && (
              <div className="absolute bottom-full right-0 mb-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                {MODEL_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm transition-colors',
                      model.status === status
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <span className={cn('inline-block w-2 h-2 rounded-full mr-2',
                      status === '未开始' && 'bg-gray-400',
                      status === '学习中' && 'bg-blue-500',
                      status === '已完成' && 'bg-green-500',
                      status === '熟练' && 'bg-purple-500',
                      status === '搁置' && 'bg-amber-500',
                    )} />
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-800">
                {model.name}
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                设计者：{model.designer || '未知'}
                <span className="mx-2">·</span>
                <span>{CATEGORY_ICONS[model.category]} {model.category}</span>
              </p>
            </div>
            {modelSteps.length > 0 && (
              <Link
                to={`/models/${id}/steps`}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all hover:shadow-md font-medium"
              >
                <Play className="w-5 h-5" />
                开始折叠
              </Link>
            )}
          </div>

          {(model.tags && model.tags.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {model.tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    TAG_COLORS[index % TAG_COLORS.length]
                  )}
                >
                  #{tag}
                </span>
              ))}
              <button className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors border border-dashed border-gray-300">
                + 添加标签
              </button>
            </div>
          )}

          {(!model.tags || model.tags.length === 0) && (
            <div className="mt-4">
              <button className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors border border-dashed border-gray-300">
                + 添加标签
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-warm-50 rounded-xl p-4 text-center">
              <Layers className="w-6 h-6 text-primary-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{model.stepCount}</p>
              <p className="text-sm text-gray-500">折叠步骤</p>
            </div>
            <div className="bg-warm-50 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-success-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{model.estimatedTimeMinutes}</p>
              <p className="text-sm text-gray-500">预计分钟</p>
            </div>
            <div className="bg-warm-50 rounded-xl p-4 text-center">
              <BookOpen className="w-6 h-6 text-accent-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{modelFolds.length}</p>
              <p className="text-sm text-gray-500">折叠次数</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100">
          <div className="flex">
            {[
              { key: 'info' as TabType, label: '基本信息' },
              { key: 'steps' as TabType, label: `折叠步骤 (${modelSteps.length})` },
              { key: 'history' as TabType, label: `折叠历史 (${modelFolds.length})` },
              { key: 'statusHistory' as TabType, label: `状态历史 (${modelStatusHistories.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 py-4 text-center font-medium transition-colors relative',
                  activeTab === tab.key
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">简介</h3>
                <p className="text-gray-600 leading-relaxed">
                  {model.description || '暂无描述'}
                </p>
              </div>

              {modelCollections.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-primary-500" />
                    所属合集
                  </h3>
                  <div className="space-y-3">
                    {modelCollections.map((collection) => (
                      <div
                        key={collection.id}
                        className="bg-warm-50 rounded-xl p-4 border border-warm-100"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {collection.name}
                            </h4>
                            {collection.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {collection.description}
                              </p>
                            )}
                          </div>
                          <span className="px-2 py-1 bg-white rounded-md text-xs text-gray-500 border border-gray-100">
                            {collection.modelIds.length} 个模型
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-warm-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">推荐纸张类型</p>
                  <p className="font-medium text-gray-800">
                    {model.recommendedPaperType || '未指定'}
                  </p>
                </div>
                <div className="bg-warm-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">推荐纸张尺寸</p>
                  <p className="font-medium text-gray-800">
                    {model.recommendedPaperSize || '未指定'}
                  </p>
                </div>
                <div className="bg-warm-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">创建时间</p>
                  <p className="font-medium text-gray-800">
                    {new Date(model.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <div className="bg-warm-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">更新时间</p>
                  <p className="font-medium text-gray-800">
                    {new Date(model.updatedAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>

              {(model.tutorialSources && model.tutorialSources.length > 0) && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">教程来源</h3>
                  <div className="space-y-4">
                    {Object.entries(groupedTutorialSources).map(([type, sources]) => (
                      <div key={type} className="bg-warm-50 rounded-xl p-4">
                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <span className="text-xl">{TUTORIAL_TYPE_ICONS[type as keyof typeof TUTORIAL_TYPE_ICONS]}</span>
                          {type}
                          <span className="text-xs text-gray-400 ml-1">({sources.length})</span>
                        </h4>
                        <div className="space-y-2">
                          {sources.map((source, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded-lg p-3 border border-gray-100"
                            >
                              <div className="flex items-start justify-between">
                                {type === '网页' && source.url ? (
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
                                  >
                                    {source.title}
                                  </a>
                                ) : (
                                  <p className="font-medium text-gray-800">{source.title}</p>
                                )}
                                {source.pageNumber && (
                                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                    第 {source.pageNumber} 页
                                  </span>
                                )}
                              </div>
                              {source.notes && (
                                <p className="text-sm text-gray-500 mt-1">
                                  💭 {source.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!model.tutorialSources || model.tutorialSources.length === 0) && model.tutorialSource && (
                <div className="bg-warm-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">教程来源</p>
                  <p className="font-medium text-gray-800">
                    {model.tutorialSource}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'steps' && (
            <div>
              {modelSteps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📝</div>
                  <p className="text-gray-500 mb-4">还没有添加折叠步骤</p>
                  <Link
                    to={`/models/${id}/edit`}
                    className="text-primary-500 hover:text-primary-600"
                  >
                    去编辑页面添加步骤 →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {modelSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex gap-4 p-4 bg-warm-50 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-white rounded-md text-xs text-primary-600 font-medium">
                            {step.foldType}
                          </span>
                        </div>
                        <p className="text-gray-700">{step.description}</p>
                        {step.referencePoints && (
                          <p className="text-sm text-gray-500 mt-2">
                            <span className="text-gray-400">参考点：</span>
                            {step.referencePoints}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-800">折叠记录</h3>
                <button
                  onClick={() => setShowFoldModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  记录折叠
                </button>
              </div>

              {modelFolds.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📅</div>
                  <p className="text-gray-500 mb-4">还没有折叠记录</p>
                  <button
                    onClick={() => setShowFoldModal(true)}
                    className="text-primary-500 hover:text-primary-600 text-sm"
                  >
                    + 记录第一次折叠
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {modelFolds.map((fold) => (
                    <div
                      key={fold.id}
                      className={cn(
                        'flex gap-4 p-4 rounded-xl',
                        fold.isRepresentative
                          ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
                          : 'bg-warm-50'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                        fold.isRepresentative
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-success-100 text-success-600'
                      )}>
                        {fold.isRepresentative ? (
                          <Award className="w-5 h-5" />
                        ) : (
                          <Calendar className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-800">
                              {fold.foldDate}
                            </p>
                            {fold.isRepresentative && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                🏆 代表作
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {getRatingStars(fold.rating)}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>用纸：{fold.paperType} {fold.paperSize}</span>
                          <span>用时：{fold.durationMinutes}分钟</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-3">
                          <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                            <div className="flex items-center justify-center gap-1">
                              {fold.success ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span className={cn(
                                'text-sm font-medium',
                                fold.success ? 'text-green-600' : 'text-red-600'
                              )}>
                                {fold.success ? '成功' : '失败'}
                              </span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                            <p className="text-xs text-gray-400 mb-0.5">完成度</p>
                            <p className="text-sm font-medium text-gray-700">
                              {'●'.repeat(fold.completion)}
                              <span className="text-gray-200">{'●'.repeat(5 - fold.completion)}</span>
                              <span className="ml-1 text-xs text-gray-500">{COMPLETION_LABELS[fold.completion]}</span>
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                            <p className="text-xs text-gray-400 mb-0.5">整洁度</p>
                            <p className="text-sm font-medium text-gray-700">
                              {'●'.repeat(fold.neatness)}
                              <span className="text-gray-200">{'●'.repeat(5 - fold.neatness)}</span>
                              <span className="ml-1 text-xs text-gray-500">{NEATNESS_LABELS[fold.neatness]}</span>
                            </p>
                          </div>
                        </div>

                        {fold.resultImages && fold.resultImages.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-400 mb-2">成品图</p>
                            <div className="flex gap-2 flex-wrap">
                              {fold.resultImages.map((img, idx) => (
                                <div
                                  key={img.id || idx}
                                  className="relative group"
                                >
                                  <img
                                    src={img.url}
                                    alt={img.caption || img.type}
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                  />
                                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-xs rounded">
                                    {img.type}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {fold.notes && (
                          <p className="text-sm text-gray-600 mt-3">
                            💭 {fold.notes}
                          </p>
                        )}

                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => handleToggleRepresentative(fold.id)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                              fold.isRepresentative
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            )}
                          >
                            {fold.isRepresentative ? (
                              <>
                                <Award className="w-3.5 h-3.5" />
                                取消代表作
                              </>
                            ) : (
                              <>
                                <Award className="w-3.5 h-3.5" />
                                设为代表作
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'statusHistory' && (
            <div>
              <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-primary-500" />
                状态变更历史
              </h3>

              {modelStatusHistories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📋</div>
                  <p className="text-gray-500">暂无状态变更记录</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-6">
                    {modelStatusHistories.map((history, idx) => (
                      <div key={history.id} className="flex gap-4 relative">
                        <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center flex-shrink-0 z-10">
                          <span className={cn(
                            'w-3 h-3 rounded-full',
                            history.newStatus === '未开始' && 'bg-gray-400',
                            history.newStatus === '学习中' && 'bg-blue-500',
                            history.newStatus === '已完成' && 'bg-green-500',
                            history.newStatus === '熟练' && 'bg-purple-500',
                            history.newStatus === '搁置' && 'bg-amber-500',
                          )} />
                        </div>
                        <div className="flex-1 bg-warm-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'px-2.5 py-0.5 rounded-full text-xs font-medium',
                                STATUS_COLORS[history.oldStatus]
                              )}>
                                {history.oldStatus}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className={cn(
                                'px-2.5 py-0.5 rounded-full text-xs font-medium',
                                STATUS_COLORS[history.newStatus]
                              )}>
                                {history.newStatus}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(history.changedAt).toLocaleString('zh-CN')}
                            </span>
                          </div>
                          {history.note && (
                            <p className="text-sm text-gray-500">
                              💭 {history.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showFoldModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">记录折叠</h3>
              <button
                onClick={() => setShowFoldModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitFold} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  折叠日期
                </label>
                <input
                  type="date"
                  value={foldForm.foldDate}
                  onChange={(e) => setFoldForm({ ...foldForm, foldDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择纸张（可选）
                </label>
                <select
                  value={foldForm.paperId || ''}
                  onChange={(e) => handlePaperSelect(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">手动输入纸张信息</option>
                  {paper.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.type} - {p.size} - {p.color} (剩余{p.quantity}张)
                    </option>
                  ))}
                </select>
              </div>

              {!foldForm.paperId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      纸张类型
                    </label>
                    <select
                      value={foldForm.paperType}
                      onChange={(e) => setFoldForm({ ...foldForm, paperType: e.target.value as PaperType })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">请选择</option>
                      {PAPER_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      纸张尺寸
                    </label>
                    <input
                      type="text"
                      value={foldForm.paperSize}
                      onChange={(e) => setFoldForm({ ...foldForm, paperSize: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="例如：15cm x 15cm"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  折叠用时（分钟）
                </label>
                <input
                  type="number"
                  value={foldForm.durationMinutes}
                  onChange={(e) => setFoldForm({ ...foldForm, durationMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  折叠结果
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFoldForm({ ...foldForm, success: true })}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2',
                      foldForm.success
                        ? 'bg-green-100 text-green-700 border-2 border-green-400'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    )}
                  >
                    <CheckCircle className="w-4 h-4" />
                    成功
                  </button>
                  <button
                    type="button"
                    onClick={() => setFoldForm({ ...foldForm, success: false })}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2',
                      !foldForm.success
                        ? 'bg-red-100 text-red-700 border-2 border-red-400'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    )}
                  >
                    <XCircle className="w-4 h-4" />
                    失败
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  完成度
                </label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as CompletionDegree[]).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFoldForm({ ...foldForm, completion: val })}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
                        foldForm.completion >= val
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      )}
                    >
                      {'●'.repeat(val)}
                      <span className="block text-xs mt-0.5">{COMPLETION_LABELS[val]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  整洁度
                </label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as NeatnessDegree[]).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFoldForm({ ...foldForm, neatness: val })}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
                        foldForm.neatness >= val
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      )}
                    >
                      {'●'.repeat(val)}
                      <span className="block text-xs mt-0.5">{NEATNESS_LABELS[val]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  综合评价
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFoldForm({ ...foldForm, rating })}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
                        foldForm.rating >= rating
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      )}
                    >
                      ⭐ {RATING_LABELS[rating]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foldForm.isRepresentative}
                    onChange={(e) => setFoldForm({ ...foldForm, isRepresentative: e.target.checked })}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    <Award className="w-4 h-4 inline mr-1 text-amber-500" />
                    标记为代表作
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  心得笔记
                </label>
                <textarea
                  value={foldForm.notes}
                  onChange={(e) => setFoldForm({ ...foldForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="记录一下这次折叠的心得..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFoldModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                >
                  保存记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
