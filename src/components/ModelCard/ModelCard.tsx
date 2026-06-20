import { Link } from 'react-router-dom';
import {
  Clock,
  Layers,
  ChevronRight,
  Heart,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import type { Model } from '../../../shared/types';
import { DIFFICULTY_COLORS, CATEGORY_ICONS, STATUS_COLORS, TAG_COLORS } from '../../constants';
import { cn } from '../../lib/utils';

interface ModelCardProps {
  model: Model;
}

export default function ModelCard({ model }: ModelCardProps) {
  return (
    <Link
      to={`/models/${model.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-soft border border-orange-50 hover:shadow-hover transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 via-orange-50 to-warm-100 flex items-center justify-center relative overflow-hidden">
        {model.images && model.images.length > 0 ? (
          <img
            src={model.images[0]}
            alt={model.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="text-center transition-transform duration-300 group-hover:scale-110">
            <span className="text-5xl">{CATEGORY_ICONS[model.category]}</span>
            <p className="text-sm text-gray-400 mt-2">{model.category}</p>
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[model.difficulty]}`}>
            {model.difficulty}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[model.status]}`}>
            {model.status}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {model.isFavorite && (
            <div className="w-8 h-8 bg-red-500/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md">
              <Heart className="w-4 h-4 text-white fill-current" />
            </div>
          )}
          {model.isWishlist && (
            <div className="w-8 h-8 bg-blue-500/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-md">
              <Bookmark className="w-4 h-4 text-white fill-current" />
            </div>
          )}
        </div>

        {model.tags && model.tags.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
            {model.tags.slice(0, 3).map((tag, index) => (
              <span
                key={tag}
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm',
                  TAG_COLORS[index % TAG_COLORS.length]
                )}
              >
                {tag}
              </span>
            ))}
            {model.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-white/80 rounded-full text-xs font-medium text-gray-600 backdrop-blur-sm">
                +{model.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-serif font-bold text-lg text-gray-800 group-hover:text-primary-600 transition-colors truncate">
                {model.name}
              </h3>
              {model.tags && model.tags.includes('挑战') && (
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">
              {model.designer && <span>设计者：{model.designer}</span>}
              {!model.designer && <span>{CATEGORY_ICONS[model.category]} {model.category}</span>}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
        </div>

        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>{model.stepCount} 步</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{model.estimatedTimeMinutes} 分钟</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-3 line-clamp-2 flex-1">
          {model.description || '暂无简介'}
        </p>

        {model.collectionIds && model.collectionIds.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <span className="text-xs text-gray-400">合集：</span>
            <span className="text-xs text-primary-600 font-medium">
              {model.collectionIds.length} 个
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
