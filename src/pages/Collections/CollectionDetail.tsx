import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FolderKanban,
  Plus,
  Layers,
  Play,
  Edit3,
  Trash2,
  X,
  Save,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import ModelCard from '../../components/ModelCard/ModelCard';
import Empty from '../../components/Empty';
import { cn } from '../../lib/utils';
import { DIFFICULTY_COLORS, CATEGORY_ICONS } from '../../constants';

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    collections,
    models,
    loading,
    fetchCollections,
    fetchModels,
    addModelToCollection,
    removeModelFromCollection,
    deleteCollection,
    updateCollection,
  } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', coverImage: '' });

  const collection = collections.find(c => c.id === id);
  const collectionModels = models.filter(m => m.collectionIds?.includes(id));
  const availableModels = models.filter(m => !m.collectionIds?.includes(id));

  useEffect(() => {
    if (id) {
      fetchCollections();
      fetchModels();
    }
  }, [id, fetchCollections, fetchModels]);

  const handleDelete = async () => {
    if (confirm('确定要删除这个合集吗？模型不会被删除。')) {
      await deleteCollection(id!);
    }
  };

  const openEdit = () => {
    if (collection) {
      setEditForm({
        name: collection.name,
        description: collection.description,
        coverImage: collection.coverImage || '',
      });
      setShowEditModal(true);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCollection(id!, editForm);
    setShowEditModal(false);
  };

  const handleRemoveModel = async (modelId: string) => {
    await removeModelFromCollection(id!, modelId);
  };

  const handleAddModel = async (modelId: string) => {
    await addModelToCollection(id!, modelId);
  };

  if (loading || !collections.length) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link to="/collections" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          返回合集列表
        </Link>
        <div className="text-center py-24 bg-white rounded-2xl shadow-soft">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link to="/collections" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          返回合集列表
        </Link>
        <div className="text-center py-24 bg-white rounded-2xl shadow-soft">
          <div className="text-5xl mb-4">📂</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">合集不存在</h3>
          <p className="text-gray-500">可能已被删除</p>
        </div>
      </div>
    );
  }

  const coverImage = collection.coverImage || collectionModels[0]?.images?.[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link to="/collections" className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          返回合集列表
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={openEdit}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            编辑
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除合集
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-orange-50 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary-400 via-orange-400 to-primary-500 relative">
          {coverImage ? (
            <img
              src={coverImage}
              alt={collection.name}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FolderKanban className="w-20 h-20 text-white/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6">
            <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
              <FolderKanban className="w-7 h-7" />
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-white/80 text-sm mt-1.5">{collection.description}</p>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-warm-50 rounded-xl p-4 text-center">
              <Layers className="w-6 h-6 text-primary-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{collectionModels.length}</p>
              <p className="text-sm text-gray-500">模型数量</p>
            </div>
            <div className="bg-warm-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">
                {new Set(collectionModels.map(m => m.category)).size}
              </p>
              <p className="text-sm text-gray-500">分类覆盖</p>
            </div>
            <div className="bg-warm-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">
                {collectionModels.reduce((sum, m) => sum + m.stepCount, 0)}
              </p>
              <p className="text-sm text-gray-500">总步骤数</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-serif font-bold text-gray-800">
          合集内模型
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          添加模型
        </button>
      </div>

      {collectionModels.length === 0 ? (
        <Empty
          icon={FolderKanban}
          title="合集为空"
          description="点击上方按钮添加模型到这个合集"
          actionLabel="添加模型"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectionModels.map((model) => (
            <div key={model.id} className="relative">
              <ModelCard model={model} />
              <button
                onClick={() => handleRemoveModel(model.id)}
                className="absolute top-3 right-14 p-1.5 bg-white/90 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors shadow-md backdrop-blur-sm z-10"
                title="从合集中移除"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl animate-slide-up max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">
                添加模型到「{collection.name}」
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {availableModels.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">所有模型都已在这个合集中了~</p>
                <Link
                  to="/models/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl mt-4"
                >
                  <Plus className="w-4 h-4" />
                  创建新模型
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {availableModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-100 to-orange-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {model.images?.[0] ? (
                        <img src={model.images[0]} alt={model.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{CATEGORY_ICONS[model.category]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{model.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{CATEGORY_ICONS[model.category]} {model.category}</span>
                        <span className={cn('px-2 py-0.5 rounded-full', DIFFICULTY_COLORS[model.difficulty])}>
                          {model.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/models/${model.id}`}
                        className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                        title="查看详情"
                      >
                        <Play className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleAddModel(model.id)}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium opacity-0 group-hover:opacity-100"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">编辑合集</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  合集名称 *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  封面图片 URL（可选）
                </label>
                <input
                  type="url"
                  value={editForm.coverImage}
                  onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
