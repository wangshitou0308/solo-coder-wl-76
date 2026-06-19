import { Link } from 'react-router-dom';
import { Clock, Layers, ChevronRight } from 'lucide-react';
import type { Model } from '../../../shared/types';
import { DIFFICULTY_COLORS, CATEGORY_ICONS } from '../../constants';

interface ModelCardProps {
  model: Model;
}

export default function ModelCard({ model }: ModelCardProps) {
  return (
    <Link
      to={`/models/${model.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-soft border border-orange-50 hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 via-orange-50 to-warm-100 flex items-center justify-center relative overflow-hidden">
        {model.images && model.images.length > 0 ? (
          <img
            src={model.images[0]}
            alt={model.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <span className="text-5xl">{CATEGORY_ICONS[model.category]}</span>
            <p className="text-sm text-gray-400 mt-2">{model.category}</p>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[model.difficulty]}`}>
            {model.difficulty}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-gray-800 group-hover:text-primary-600 transition-colors">
              {model.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {model.designer && <span>设计者：{model.designer}</span>}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
        </div>
        
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>{model.stepCount} 步</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{model.estimatedTimeMinutes} 分钟</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-3 line-clamp-2">
          {model.description}
        </p>
      </div>
    </Link>
  );
}
