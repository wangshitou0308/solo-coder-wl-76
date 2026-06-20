import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  GripVertical,
  Trash2,
  Edit3,
  X,
  BookOpen,
  Video,
  Globe,
  FileText,
  FolderPlus,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '../../store/useAppStore';
import {
  CATEGORIES,
  DIFFICULTIES,
  FOLD_TYPES,
  DEFAULT_MODEL_TAGS,
  TUTORIAL_SOURCE_TYPES,
  MODEL_STATUSES,
  TUTORIAL_TYPE_ICONS,
  TAG_COLORS,
} from '../../constants';
import { cn } from '../../lib/utils';
import type {
  FoldStep,
  Category,
  Difficulty,
  FoldType,
  TutorialSource,
  TutorialSourceType,
  ModelStatus,
  ModelTag,
  Collection,
} from '../../../shared/types';

interface SortableStepProps {
  step: FoldStep;
  onEdit: (step: FoldStep) => void;
  onDelete: (id: string) => void;
}

function SortableStep({ step, onEdit, onDelete }: SortableStepProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm',
        isDragging && 'shadow-lg z-10'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
        {step.stepNumber}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-xs font-medium">
            {step.foldType}
          </span>
        </div>
        <p className="text-gray-700 text-sm truncate">{step.description}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(step.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ModelEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const {
    models,
    steps,
    collections,
    loading,
    fetchModels,
    createModel,
    updateModel,
    fetchSteps,
    createStep,
    updateStep,
    deleteStep,
    reorderSteps,
    fetchCollections,
    createCollection,
  } = useAppStore();

  const model = isEditing ? models.find((m) => m.id === id) : null;
  const modelSteps = steps.filter((s) => s.modelId === id);

  const [formData, setFormData] = useState({
    name: '',
    designer: '',
    category: '动物' as Category,
    difficulty: '简单' as Difficulty,
    recommendedPaperType: '',
    recommendedPaperSize: '',
    estimatedTimeMinutes: 10,
    tutorialSource: '',
    description: '',
    images: [] as string[],
    tags: [] as ModelTag[],
    tutorialSources: [] as TutorialSource[],
    status: '未开始' as ModelStatus,
    collectionIds: [] as string[],
    isFavorite: false,
    isWishlist: false,
  });

  const [customTagInput, setCustomTagInput] = useState('');
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<FoldStep | null>(null);
  const [stepForm, setStepForm] = useState({
    foldType: '谷折' as FoldType,
    description: '',
    referencePoints: '',
    imageUrl: '',
  });
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [newCollectionForm, setNewCollectionForm] = useState({
    name: '',
    description: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCollections();
    if (isEditing && id) {
      fetchModels();
      fetchSteps(id);
    }
  }, [isEditing, id, fetchModels, fetchSteps, fetchCollections]);

  useEffect(() => {
    if (model) {
      setFormData({
        name: model.name,
        designer: model.designer,
        category: model.category,
        difficulty: model.difficulty,
        recommendedPaperType: model.recommendedPaperType,
        recommendedPaperSize: model.recommendedPaperSize,
        estimatedTimeMinutes: model.estimatedTimeMinutes,
        tutorialSource: model.tutorialSource,
        description: model.description,
        images: model.images,
        tags: model.tags || [],
        tutorialSources: model.tutorialSources || [],
        status: model.status || '未开始',
        collectionIds: model.collectionIds || [],
        isFavorite: model.isFavorite || false,
        isWishlist: model.isWishlist || false,
      });
    }
  }, [model]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && id) {
        await updateModel(id, formData);
      } else {
        const newModel = await createModel(formData);
        navigate(`/models/${newModel.id}`);
        return;
      }
      navigate(`/models/${id}`);
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = modelSteps.findIndex((s) => s.id === active.id);
      const newIndex = modelSteps.findIndex((s) => s.id === over.id);
      const newSteps = arrayMove(modelSteps, oldIndex, newIndex);
      const stepIds = newSteps.map((s) => s.id);
      if (id) {
        reorderSteps(id, stepIds);
      }
    }
  };

  const openStepModal = (step?: FoldStep) => {
    if (step) {
      setEditingStep(step);
      setStepForm({
        foldType: step.foldType,
        description: step.description,
        referencePoints: step.referencePoints,
        imageUrl: step.imageUrl,
      });
    } else {
      setEditingStep(null);
      setStepForm({
        foldType: '谷折',
        description: '',
        referencePoints: '',
        imageUrl: '',
      });
    }
    setShowStepModal(true);
  };

  const handleSaveStep = async () => {
    if (!id && !isEditing) return;
    const modelId = id || '';

    if (editingStep) {
      await updateStep(editingStep.id, stepForm);
    } else {
      await createStep(modelId, {
        ...stepForm,
        stepNumber: modelSteps.length + 1,
      });
    }
    setShowStepModal(false);
  };

  const handleDeleteStep = (stepId: string) => {
    if (confirm('确定要删除这个步骤吗？')) {
      deleteStep(stepId);
    }
  };

  const addTag = (tag: ModelTag) => {
    if (!formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const removeTag = (tag: ModelTag) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleCustomTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      addTag(customTagInput.trim());
      setCustomTagInput('');
    }
  };

  const handleAddCustomTag = () => {
    if (customTagInput.trim()) {
      addTag(customTagInput.trim());
      setCustomTagInput('');
    }
  };

  const getTagColor = (index: number) => {
    return TAG_COLORS[index % TAG_COLORS.length];
  };

  const addTutorialSource = () => {
    const newSource: TutorialSource = {
      type: '书籍',
      title: '',
      url: '',
      pageNumber: undefined,
      notes: '',
    };
    setFormData({
      ...formData,
      tutorialSources: [...formData.tutorialSources, newSource],
    });
  };

  const removeTutorialSource = (index: number) => {
    const newSources = [...formData.tutorialSources];
    newSources.splice(index, 1);
    setFormData({ ...formData, tutorialSources: newSources });
  };

  const updateTutorialSource = (index: number, field: keyof TutorialSource, value: any) => {
    const newSources = [...formData.tutorialSources];
    newSources[index] = { ...newSources[index], [field]: value };
    setFormData({ ...formData, tutorialSources: newSources });
  };

  const getSourceTypeIcon = (type: TutorialSourceType) => {
    return TUTORIAL_TYPE_ICONS[type] || '📄';
  };

  const toggleCollection = (collectionId: string) => {
    const newCollectionIds = formData.collectionIds.includes(collectionId)
      ? formData.collectionIds.filter((id) => id !== collectionId)
      : [...formData.collectionIds, collectionId];
    setFormData({ ...formData, collectionIds: newCollectionIds });
  };

  const handleCreateCollection = async () => {
    if (!newCollectionForm.name.trim()) return;
    const collection = await createCollection({
      name: newCollectionForm.name.trim(),
      description: newCollectionForm.description.trim(),
      modelIds: [],
    });
    setFormData({
      ...formData,
      collectionIds: [...formData.collectionIds, collection.id],
    });
    setNewCollectionForm({ name: '', description: '' });
    setShowCollectionModal(false);
  };

  if (isEditing && (loading || models.length === 0)) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (isEditing && !model) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">模型不存在</p>
        <Link to="/models" className="text-primary-500 mt-4 inline-block">
          返回模型库
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          to={isEditing ? `/models/${id}` : '/models'}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-serif font-bold text-gray-800">
              {isEditing ? '编辑模型' : '添加新模型'}
            </h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isFavorite}
                  onChange={(e) =>
                    setFormData({ ...formData, isFavorite: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">⭐ 加入收藏</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isWishlist}
                  onChange={(e) =>
                    setFormData({ ...formData, isWishlist: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">📋 加入想折清单</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模型名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="例如：千纸鹤"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                设计者
              </label>
              <input
                type="text"
                value={formData.designer}
                onChange={(e) =>
                  setFormData({ ...formData, designer: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="例如：神谷哲史"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as Category })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                难度
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as Difficulty,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {DIFFICULTIES.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ModelStatus,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {MODEL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                预计用时（分钟）
              </label>
              <input
                type="number"
                value={formData.estimatedTimeMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedTimeMinutes: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                推荐纸张类型
              </label>
              <input
                type="text"
                value={formData.recommendedPaperType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recommendedPaperType: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="例如：和纸"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                推荐纸张尺寸
              </label>
              <input
                type="text"
                value={formData.recommendedPaperSize}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recommendedPaperSize: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="例如：15cm x 15cm"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                教程来源（旧字段，保留兼容）
              </label>
              <input
                type="text"
                value={formData.tutorialSource}
                onChange={(e) =>
                  setFormData({ ...formData, tutorialSource: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="例如：书籍名称、视频链接等"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模型简介
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="描述一下这个模型的特点..."
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                标签
              </label>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={tag}
                      className={cn(
                        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                        getTagColor(index)
                      )}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">预设标签（点击添加）：</p>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_MODEL_TAGS.map((tag) => {
                    const isAdded = formData.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        disabled={isAdded}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium transition-all',
                          isAdded
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-warm-50 text-warm-700 hover:bg-warm-100 cursor-pointer border border-warm-200'
                        )}
                      >
                        + {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleCustomTagKeyDown}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="输入自定义标签，按回车添加"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="flex items-center gap-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-serif font-bold text-gray-800">
              教程来源 ({formData.tutorialSources.length})
            </h2>
            <button
              type="button"
              onClick={addTutorialSource}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              添加来源
            </button>
          </div>

          {formData.tutorialSources.length === 0 ? (
            <div className="text-center py-12 bg-warm-50 rounded-xl">
              <p className="text-gray-500 mb-4">还没有添加任何教程来源</p>
              <button
                type="button"
                onClick={addTutorialSource}
                className="text-primary-500 hover:text-primary-600 text-sm"
              >
                + 添加第一个教程来源
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.tutorialSources.map((source, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-100 rounded-xl bg-warm-50/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {getSourceTypeIcon(source.type)}
                      </span>
                      <select
                        value={source.type}
                        onChange={(e) =>
                          updateTutorialSource(
                            index,
                            'type',
                            e.target.value as TutorialSourceType
                          )
                        }
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {TUTORIAL_SOURCE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTutorialSource(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        标题 *
                      </label>
                      <input
                        type="text"
                        value={source.title}
                        onChange={(e) =>
                          updateTutorialSource(index, 'title', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="来源标题"
                        required
                      />
                    </div>

                    {(source.type === '视频' || source.type === '网页') && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          链接 URL
                        </label>
                        <input
                          type="url"
                          value={source.url || ''}
                          onChange={(e) =>
                            updateTutorialSource(index, 'url', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="https://..."
                        />
                      </div>
                    )}

                    {source.type === '书籍' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          页码
                        </label>
                        <input
                          type="number"
                          value={source.pageNumber || ''}
                          onChange={(e) =>
                            updateTutorialSource(
                              index,
                              'pageNumber',
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                          className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="页码"
                          min="1"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        备注说明
                      </label>
                      <textarea
                        value={source.notes || ''}
                        onChange={(e) =>
                          updateTutorialSource(index, 'notes', e.target.value)
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        placeholder="添加备注..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-serif font-bold text-gray-800">
              合集归属
            </h2>
            <button
              type="button"
              onClick={() => setShowCollectionModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-primary-200 text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors text-sm"
            >
              <FolderPlus className="w-4 h-4" />
              创建新合集
            </button>
          </div>

          {collections.length === 0 ? (
            <div className="text-center py-12 bg-warm-50 rounded-xl">
              <p className="text-gray-500 mb-4">还没有创建任何合集</p>
              <button
                type="button"
                onClick={() => setShowCollectionModal(true)}
                className="text-primary-500 hover:text-primary-600 text-sm"
              >
                + 创建第一个合集
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((collection: Collection) => (
                <label
                  key={collection.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border',
                    formData.collectionIds.includes(collection.id)
                      ? 'bg-primary-50 border-primary-200'
                      : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={formData.collectionIds.includes(collection.id)}
                    onChange={() => toggleCollection(collection.id)}
                    className="mt-1 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">
                      {collection.name}
                    </p>
                    {collection.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {collection.modelIds.length} 个模型
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-serif font-bold text-gray-800">
                折叠步骤 ({modelSteps.length})
              </h2>
              <button
                type="button"
                onClick={() => openStepModal()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                添加步骤
              </button>
            </div>

            {modelSteps.length === 0 ? (
              <div className="text-center py-12 bg-warm-50 rounded-xl">
                <p className="text-gray-500 mb-4">还没有添加任何步骤</p>
                <button
                  type="button"
                  onClick={() => openStepModal()}
                  className="text-primary-500 hover:text-primary-600 text-sm"
                >
                  + 添加第一个步骤
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={modelSteps.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {modelSteps.map((step) => (
                      <SortableStep
                        key={step.id}
                        step={step}
                        onEdit={openStepModal}
                        onDelete={handleDeleteStep}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            <p className="text-sm text-gray-400 mt-4">
              💡 提示：拖拽步骤可以调整顺序
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link
            to={isEditing ? `/models/${id}` : '/models'}
            className="px-6 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            取消
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all hover:shadow-md font-medium"
          >
            <Save className="w-5 h-5" />
            保存
          </button>
        </div>
      </form>

      {showStepModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingStep ? '编辑步骤' : '添加步骤'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  折叠类型
                </label>
                <select
                  value={stepForm.foldType}
                  onChange={(e) =>
                    setStepForm({
                      ...stepForm,
                      foldType: e.target.value as FoldType,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {FOLD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  步骤说明 *
                </label>
                <textarea
                  value={stepForm.description}
                  onChange={(e) =>
                    setStepForm({ ...stepForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="描述这一步怎么折..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  参考点
                </label>
                <input
                  type="text"
                  value={stepForm.referencePoints}
                  onChange={(e) =>
                    setStepForm({
                      ...stepForm,
                      referencePoints: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="例如：对齐中心线"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowStepModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveStep}
                className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showCollectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">创建新合集</h3>
              <button
                type="button"
                onClick={() => {
                  setShowCollectionModal(false);
                  setNewCollectionForm({ name: '', description: '' });
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  合集名称 *
                </label>
                <input
                  type="text"
                  value={newCollectionForm.name}
                  onChange={(e) =>
                    setNewCollectionForm({
                      ...newCollectionForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="例如：经典折纸"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={newCollectionForm.description}
                  onChange={(e) =>
                    setNewCollectionForm({
                      ...newCollectionForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="描述一下这个合集..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowCollectionModal(false);
                  setNewCollectionForm({ name: '', description: '' });
                }}
                className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCreateCollection}
                disabled={!newCollectionForm.name.trim()}
                className={cn(
                  'px-4 py-2 rounded-xl transition-colors',
                  newCollectionForm.name.trim()
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
