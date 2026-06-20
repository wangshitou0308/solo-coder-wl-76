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
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { DIFFICULTY_COLORS, CATEGORY_ICONS, RATING_LABELS, PAPER_TYPES } from '../../constants';
import { cn } from '../../lib/utils';
import type { PaperType } from '../../../shared/types';

type TabType = 'info' | 'steps' | 'history';

export default function ModelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { models, steps, folds, paper, loading, fetchModels, fetchSteps, fetchFolds, deleteModel, createFold, fetchPaper } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [showFoldModal, setShowFoldModal] = useState(false);
  const [foldForm, setFoldForm] = useState({
    foldDate: new Date().toISOString().split('T')[0],
    paperType: '' as PaperType | '',
    paperSize: '',
    paperId: '' as string | null,
    durationMinutes: 0,
    rating: 4,
    notes: '',
    resultImageUrl: '',
  });

  const model = models.find(m => m.id === id);
  const modelSteps = steps.filter(s => s.modelId === id);
  const modelFolds = folds.filter(f => f.modelId === id);

  useEffect(() => {
    if (id) {
      fetchModels();
      fetchSteps(id);
      fetchFolds(id);
      fetchPaper();
    }
  }, [id, fetchModels, fetchSteps, fetchFolds, fetchPaper]);

  const handleDelete = () => {
    if (confirm('确定要删除这个模型吗？相关的步骤和记录也会被删除。')) {
      deleteModel(id!);
      navigate('/models');
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
          <div className="absolute top-4 right-4">
            <span className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium bg-white/90',
              model.difficulty === '简单' && 'text-green-600',
              model.difficulty === '中等' && 'text-yellow-600',
              model.difficulty === '复杂' && 'text-orange-600',
              model.difficulty === '极复杂' && 'text-red-600',
            )}>
              {model.difficulty}
            </span>
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
                  <p className="text-sm text-gray-500 mb-1">教程来源</p>
                  <p className="font-medium text-gray-800">
                    {model.tutorialSource || '未指定'}
                  </p>
                </div>
                <div className="bg-warm-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">创建时间</p>
                  <p className="font-medium text-gray-800">
                    {new Date(model.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
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
                      className="flex gap-4 p-4 bg-warm-50 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-success-100 text-success-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800">
                            {fold.foldDate}
                          </p>
                          <div className="flex items-center gap-1">
                            {getRatingStars(fold.rating)}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>用纸：{fold.paperType} {fold.paperSize}</span>
                          <span>用时：{fold.durationMinutes}分钟</span>
                        </div>
                        {fold.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            💭 {fold.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
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
                  评价
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
