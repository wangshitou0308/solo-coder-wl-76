import { useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BookOpen,
  Clock,
  Layers,
  TrendingUp,
  Trophy,
  BarChart3,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const CATEGORY_COLORS = [
  '#F97316',
  '#EC4899',
  '#8B5CF6',
  '#10B981',
  '#06B6D4',
  '#F59E0B',
  '#6B7280',
];

const DIFFICULTY_COLORS = {
  '简单': '#10B981',
  '中等': '#F59E0B',
  '复杂': '#F97316',
  '极复杂': '#EF4444',
};

export default function Statistics() {
  const {
    summary,
    categoryStats,
    monthlyStats,
    topModels,
    difficultyStats,
    topPaper,
    fetchStatistics,
  } = useAppStore();

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-800">统计中心</h1>
        <p className="text-gray-500 mt-1">了解你的折纸数据</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">模型总数</p>
              <p className="text-3xl font-bold mt-1">{summary?.totalModels || 0}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-success-500 to-success-600 rounded-2xl p-6 text-white shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">累计折叠</p>
              <p className="text-3xl font-bold mt-1">{summary?.totalFolds || 0}</p>
              <span className="text-sm text-green-100">次</span>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-6 text-white shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">纸张种类</p>
              <p className="text-3xl font-bold mt-1">{summary?.totalPaperTypes || 0}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">总折叠时长</p>
              <p className="text-2xl font-bold mt-1">
                {formatTime(summary?.totalFoldTimeMinutes || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
          <h2 className="text-lg font-serif font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary-500" />
            模型分类分布
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats.filter(c => c.count > 0)}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ category, count }) => `${category} (${count})`}
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={entry.category} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
          <h2 className="text-lg font-serif font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            难度完成分布
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="difficulty" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" name="完成次数" radius={[6, 6, 0, 0]}>
                  {difficultyStats.map((entry) => (
                    <Cell
                      key={entry.difficulty}
                      fill={DIFFICULTY_COLORS[entry.difficulty as keyof typeof DIFFICULTY_COLORS]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
        <h2 className="text-lg font-serif font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          月度折叠趋势
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                name="折叠次数"
                stroke="#F97316"
                strokeWidth={3}
                dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#EA580C' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
          <h2 className="text-lg font-serif font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary-500" />
            最常折叠模型 TOP 10
          </h2>
          <div className="space-y-3">
            {topModels.length === 0 ? (
              <p className="text-center text-gray-400 py-8">暂无数据</p>
            ) : (
              topModels.map((model, index) => (
                <div
                  key={model.id}
                  className="flex items-center gap-4 p-3 bg-warm-50 rounded-xl"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-amber-600 text-amber-100' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{model.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{model.foldCount}</p>
                    <p className="text-xs text-gray-400">次</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
          <h2 className="text-lg font-serif font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-500" />
            纸张使用频次排行
          </h2>
          <div className="space-y-3">
            {topPaper.length === 0 ? (
              <p className="text-center text-gray-400 py-8">暂无数据</p>
            ) : (
              topPaper.map((paper, index) => (
                <div
                  key={paper.type}
                  className="flex items-center gap-4 p-3 bg-warm-50 rounded-xl"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-primary-500 text-white' :
                    index === 1 ? 'bg-primary-400 text-white' :
                    index === 2 ? 'bg-primary-300 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{paper.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent-600">{paper.usageCount}</p>
                    <p className="text-xs text-gray-400">次</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
