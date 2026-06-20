import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  FolderKanban,
  Layers,
  Edit3,
  Trash2,
  X,
  Save,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import Empty from '../../components/Empty';

export default function Collections() {
  const navigate = useNavigate();
  const {
    collections,
    models,
    fetchCollections,
    fetchModels,
    createCollection,
    updateCollection,
    deleteCollection,
  } = useAppStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverImage: '',
  });

  useEffect(() => {
    fetchCollections();
    fetchModels();
  }, [fetchCollections, fetchModels]);

  const getCollectionModelCount = (collectionId: string) => {
    return models.filter(m => m.collectionIds?.includes(collectionId)).length;
  };

  const getCollectionCover = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (collection?.coverImage) return collection.coverImage;
    const firstModel = models.find(m => m.collectionIds?.includes(collectionId));
    return firstModel?.images?.[0] || '';
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', coverImage: '' });
    setShowCreateModal(true);
  };

  const openEditModal = (id: string) => {
    const collection = collections.find(c => c.id === id);
    if (collection) {
      setEditingId(id);
      setFormData({
        name: collection.name,
        description: collection.description,
        coverImage: collection.coverImage || '',
      });
      setShowCreateModal(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      await updateCollection(editingId, formData);
    } else {
      await createCollection(formData);
    }
    setShowCreateModal(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个合集吗？模型不会被删除，只会从合集中移除。')) {
      await deleteCollection(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800 flex items-center gap-3">
            <FolderKanban className="w-7 h-7 text-primary-500" />
            合集管理
          </h1>
          <p className="text-gray-500 mt-1">
            共 {collections.length} 个合集，组织你的折纸作品系列
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all hover:shadow-md font-medium"
        >
          <Plus className="w-5 h-5" />
          创建合集
        </button>
      </div>

      {collections.length === 0 ? (
        <Empty
          icon={FolderKanban}
          title="暂无合集"
          description="创建你的第一个合集，比如「川崎玫瑰系列」或「神谷哲史作品」"
          actionLabel="创建合集"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => {
            const modelCount = getCollectionModelCount(collection.id);
            const cover = getCollectionCover(collection.id);
            return (
              <div
                key={collection.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-soft border border-orange-50 hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
              >
                <Link
                  to={`/collections/${collection.id}`}
                  className="block aspect-[16/10] bg-gradient-to-br from-primary-100 via-orange-50 to-warm-100 relative overflow-hidden"
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <FolderKanban className="w-16 h-16 text-primary-300 mx-auto" />
                        <p className="text-sm text-gray-400 mt-2">暂无封面</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-lg truncate">{collection.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-white/80">
                      <span className="flex items-center gap-1">
                        <Layers className="w-4 h-4" />
                        {modelCount} 个模型
                      </span>
                    </div>
                  </div>
                  {modelCount === 0 && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500/90 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                      空合集
                    </div>
                  )}
                </Link>

                <div className="p-4">
                  <p className="text-sm text-gray-500 line-clamp-2 h-10">
                    {collection.description || '暂无描述'}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <Link
                      to={`/collections/${collection.id}`}
                      className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                    >
                      查看详情 →
                    </Link>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(collection.id)}
                        className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(collection.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                {editingId ? '编辑合集' : '创建新合集'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  合集名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：川崎玫瑰系列"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="描述这个合集的主题..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  封面图片 URL（可选）
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  不填写则自动使用合集内第一个模型的图片
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? '保存修改' : '创建合集'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
