import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Heart, Bookmark, Tag, Layers, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import ModelCard from '../../components/ModelCard/ModelCard';
import { CATEGORIES, DIFFICULTIES, MODEL_STATUSES, DEFAULT_MODEL_TAGS, STATUS_COLORS, TAG_COLORS } from '../../constants';
import type { Category, Difficulty, ModelStatus, ModelTag, Model } from '../../../shared/types';
import { cn } from '../../lib/utils';

export default function ModelList() {
  const { models, collections, loading, fetchModels, fetchCollections } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ModelStatus | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<ModelTag[]>([]);
  const [onlyFavorite, setOnlyFavorite] = useState(false);
  const [onlyWishlist, setOnlyWishlist] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | 'all'>('all');
  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false);

  useEffect(() => {
    fetchModels({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      difficulty: selectedDifficulty === 'all' ? undefined : selectedDifficulty,
      search: search || undefined,
    });
    fetchCollections();
  }, [fetchModels, fetchCollections, selectedCategory, selectedDifficulty, search]);

  const allTags = useMemo(() => {
    const tagSet = new Set<ModelTag>(DEFAULT_MODEL_TAGS);
    models.forEach((model) => {
      model.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [models]);

  const getTagColor = (index: number) => TAG_COLORS[index % TAG_COLORS.length];

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      if (selectedCategory !== 'all' && model.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'all' && model.difficulty !== selectedDifficulty) return false;
      if (selectedStatus !== 'all' && model.status !== selectedStatus) return false;
      if (selectedTags.length > 0) {
        const modelTags = model.tags || [];
        const allSelectedTagsExist = selectedTags.every((tag) => modelTags.includes(tag));
        if (!allSelectedTagsExist) return false;
      }
      if (onlyFavorite && !model.isFavorite) return false;
      if (onlyWishlist && !model.isWishlist) return false;
      if (selectedCollection !== 'all') {
        const modelCollectionIds = model.collectionIds || [];
        if (!modelCollectionIds.includes(selectedCollection)) return false;
      }
      if (search.trim()) {
        const keyword = search.trim().toLowerCase();
        const nameMatch = model.name?.toLowerCase().includes(keyword);
        const designerMatch = model.designer?.toLowerCase().includes(keyword);
        const descriptionMatch = model.description?.toLowerCase().includes(keyword);
        if (!nameMatch && !designerMatch && !descriptionMatch) return false;
      }
      return true;
    });
  }, [models, selectedCategory, selectedDifficulty, selectedStatus, selectedTags, onlyFavorite, onlyWishlist, selectedCollection, search]);

  const stats = useMemo(() => {
    const statusCounts: Record<ModelStatus, number> = {
      '未开始': 0,
      '学习中': 0,
      '已完成': 0,
      '熟练': 0,
      '搁置': 0,
    };
    let favoriteCount = 0;
    let wishlistCount = 0;

    filteredModels.forEach((model) => {
      if (model.status) {
        statusCounts[model.status]++;
      }
      if (model.isFavorite) favoriteCount++;
      if (model.isWishlist) wishlistCount++;
    });

    return {
      total: filteredModels.length,
      statusCounts,
      favoriteCount,
      wishlistCount,
    };
  }, [filteredModels]);

  const toggleTag = (tag: ModelTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedStatus('all');
    setSelectedTags([]);
    setOnlyFavorite(false);
    setOnlyWishlist(false);
    setSelectedCollection('all');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800">模型库</h1>
          <p className="text-gray-500 mt-1">共 {models.length} 个折纸模型</p>
        </div>
        <Link
          to="/models/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all hover:shadow-md font-medium"
        >
          <Plus className="w-5 h-5" />
          添加模型
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索模型名称、设计者、描述..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Filter className="w-5 h-5" />
            <span className="text-sm">筛选</span>
          </div>
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
          >
            清除全部
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">分类</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm transition-all',
                  selectedCategory === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                全部
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm transition-all',
                    selectedCategory === cat
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">难度</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDifficulty('all')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm transition-all',
                  selectedDifficulty === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                全部
              </button>
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm transition-all',
                    selectedDifficulty === diff
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">状态</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm transition-all',
                  selectedStatus === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                全部
              </button>
              {MODEL_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm transition-all font-medium',
                    selectedStatus === status
                      ? STATUS_COLORS[status] + ' ring-2 ring-offset-1 ring-current'
                      : STATUS_COLORS[status] + ' opacity-60 hover:opacity-100'
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              标签
              {selectedTags.length > 0 && (
                <span className="text-xs text-primary-500 font-normal">
                  (已选 {selectedTags.length} 个)
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {allTags.length === 0 ? (
                <span className="text-sm text-gray-400 px-4 py-1.5">暂无标签</span>
              ) : (
                allTags.map((tag, index) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                      selectedTags.includes(tag)
                        ? getTagColor(index) + ' ring-2 ring-offset-1 ring-current scale-105'
                        : getTagColor(index) + ' opacity-50 hover:opacity-100'
                    )}
                  >
                    #{tag}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm font-medium text-gray-600">快捷筛选：</p>
            <button
              onClick={() => setOnlyFavorite(!onlyFavorite)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                onlyFavorite
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-600'
              )}
            >
              <Heart className={cn('w-4 h-4', onlyFavorite && 'fill-current')} />
              ⭐ 仅显示收藏
            </button>
            <button
              onClick={() => setOnlyWishlist(!onlyWishlist)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                onlyWishlist
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'
              )}
            >
              <Bookmark className={cn('w-4 h-4', onlyWishlist && 'fill-current')} />
              📋 仅显示想折清单
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              合集
            </p>
            <div className="relative">
              <button
                onClick={() => setCollectionDropdownOpen(!collectionDropdownOpen)}
                className={cn(
                  'flex items-center justify-between gap-2 px-4 py-2 rounded-xl text-sm transition-all min-w-[200px]',
                  selectedCollection !== 'all'
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <span>
                  {selectedCollection === 'all'
                    ? '全部合集'
                    : collections.find((c) => c.id === selectedCollection)?.name || '未知合集'}
                </span>
                <ChevronDown className={cn('w-4 h-4 transition-transform', collectionDropdownOpen && 'rotate-180')} />
              </button>
              {collectionDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-[280px] bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      setSelectedCollection('all');
                      setCollectionDropdownOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-gray-50',
                      selectedCollection === 'all' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600'
                    )}
                  >
                    全部合集
                  </button>
                  {collections.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center">
                      暂无合集
                    </div>
                  ) : (
                    collections.map((collection) => (
                      <button
                        key={collection.id}
                        onClick={() => {
                          setSelectedCollection(collection.id);
                          setCollectionDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-gray-50 flex items-center justify-between',
                          selectedCollection === collection.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600'
                        )}
                      >
                        <span className="truncate">{collection.name}</span>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {collection.modelIds?.length || 0} 个
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-orange-50">
          <p className="text-xs text-gray-500 mb-1">筛选结果</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        {MODEL_STATUSES.map((status) => (
          <div
            key={status}
            className={cn(
              'rounded-2xl p-4 shadow-soft border cursor-pointer transition-all hover:scale-[1.02]',
              selectedStatus === status
                ? STATUS_COLORS[status] + ' border-current'
                : 'bg-white border-orange-50'
            )}
            onClick={() => setSelectedStatus(selectedStatus === status ? 'all' : status)}
          >
            <p className={cn(
              'text-xs mb-1',
              selectedStatus === status ? 'opacity-80' : 'text-gray-500'
            )}>
              {status}
            </p>
            <p className={cn(
              'text-2xl font-bold',
              selectedStatus === status ? '' : 'text-gray-800'
            )}>
              {stats.statusCounts[status]}
            </p>
          </div>
        ))}
        <div
          className={cn(
            'rounded-2xl p-4 shadow-soft border cursor-pointer transition-all hover:scale-[1.02]',
            onlyFavorite
              ? 'bg-rose-500 text-white border-rose-500'
              : 'bg-white border-orange-50 hover:bg-rose-50'
          )}
          onClick={() => setOnlyFavorite(!onlyFavorite)}
        >
          <p className={cn('text-xs mb-1', onlyFavorite ? 'opacity-80' : 'text-gray-500')}>
            ⭐ 收藏数
          </p>
          <p className={cn('text-2xl font-bold', onlyFavorite ? '' : 'text-rose-500')}>
            {stats.favoriteCount}
          </p>
        </div>
        <div
          className={cn(
            'rounded-2xl p-4 shadow-soft border cursor-pointer transition-all hover:scale-[1.02]',
            onlyWishlist
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white border-orange-50 hover:bg-amber-50'
          )}
          onClick={() => setOnlyWishlist(!onlyWishlist)}
        >
          <p className={cn('text-xs mb-1', onlyWishlist ? 'opacity-80' : 'text-gray-500')}>
            📋 想折清单
          </p>
          <p className={cn('text-2xl font-bold', onlyWishlist ? '' : 'text-amber-500')}>
            {stats.wishlistCount}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-soft animate-pulse">
              <div className="aspect-[4/3] bg-gray-100" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-orange-50">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">暂无符合条件的模型</h3>
          <p className="text-gray-500 mb-6">
            {models.length === 0 ? '添加你的第一个折纸模型吧' : '试试调整筛选条件'}
          </p>
          {models.length === 0 ? (
            <Link
              to="/models/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              添加模型
            </Link>
          ) : (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all"
            >
              <Filter className="w-5 h-5" />
              清除筛选条件
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}
    </div>
  );
}
