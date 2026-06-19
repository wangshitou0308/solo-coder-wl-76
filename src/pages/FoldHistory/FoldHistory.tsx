import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Star,
  BookOpen,
  Plus,
  Filter,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { RATING_LABELS } from '../../constants';

export default function FoldHistory() {
  const { folds, models, fetchFolds, fetchModels } = useAppStore();
  const [selectedModel, setSelectedModel] = useState<string>('all');

  useEffect(() => {
    fetchFolds();
    fetchModels();
  }, [fetchFolds, fetchModels]);

  const filteredFolds = selectedModel === 'all'
    ? folds
    : folds.filter(f => f.modelId === selectedModel);

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
  }, {} as Record<string, typeof folds>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800">折叠记录</h1>
          <p className="text-gray-500 mt-1">共 {folds.length} 次折叠记录</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">筛选模型：</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">全部模型</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
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
                    className="relative bg-white rounded-xl p-5 shadow-soft border border-orange-50 hover:shadow-card transition-shadow"
                  >
                    <div className="absolute -left-[41px] top-6 w-4 h-4 bg-primary-500 rounded-full border-4 border-warm-50" />
                    
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          to={`/models/${fold.modelId}`}
                          className="font-bold text-gray-800 hover:text-primary-600 transition-colors"
                        >
                          {getModelName(fold.modelId)}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {fold.durationMinutes} 分钟
                          </span>
                          <span>{fold.paperType} · {fold.paperSize}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg">{getRatingStars(fold.rating)}</div>
                        <p className="text-xs text-gray-400 mt-1">
                          {RATING_LABELS[fold.rating]}
                        </p>
                      </div>
                    </div>

                    {fold.notes && (
                      <div className="mt-4 p-3 bg-warm-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          💭 {fold.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
