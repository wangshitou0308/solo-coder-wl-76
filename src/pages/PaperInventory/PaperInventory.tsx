import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  Package,
  Layers,
  Minus,
  Plus as PlusIcon,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { PAPER_TYPES } from '../../constants';
import { cn } from '../../lib/utils';
import type { Paper, PaperType } from '../../../shared/types';

export default function PaperInventory() {
  const { paper, fetchPaper, createPaper, updatePaper, deletePaper, adjustPaperQuantity } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [formData, setFormData] = useState({
    type: '单面彩色' as PaperType,
    size: '',
    color: '',
    quantity: 0,
    lowStockThreshold: 10,
    notes: '',
  });

  useEffect(() => {
    fetchPaper();
  }, [fetchPaper]);

  const openModal = (paperItem?: Paper) => {
    if (paperItem) {
      setEditingPaper(paperItem);
      setFormData({
        type: paperItem.type as PaperType,
        size: paperItem.size,
        color: paperItem.color,
        quantity: paperItem.quantity,
        lowStockThreshold: paperItem.lowStockThreshold,
        notes: paperItem.notes,
      });
    } else {
      setEditingPaper(null);
      setFormData({
        type: '单面彩色',
        size: '',
        color: '',
        quantity: 0,
        lowStockThreshold: 10,
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPaper) {
        await updatePaper(editingPaper.id, formData);
      } else {
        await createPaper(formData);
      }
      setShowModal(false);
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个纸张库存吗？')) {
      deletePaper(id);
    }
  };

  const handleAdjust = (id: string, amount: number) => {
    adjustPaperQuantity(id, amount);
  };

  const lowStockCount = paper.filter(p => p.quantity <= p.lowStockThreshold).length;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      '单面彩色': 'bg-blue-100 text-blue-700',
      '双面彩色': 'bg-purple-100 text-purple-700',
      '和纸': 'bg-amber-100 text-amber-700',
      '牛皮纸': 'bg-yellow-100 text-yellow-700',
      '锡纸': 'bg-gray-200 text-gray-700',
      '蜡纸': 'bg-pink-100 text-pink-700',
      '棉纸': 'bg-green-100 text-green-700',
      '其他': 'bg-gray-100 text-gray-700',
    };
    return colors[type] || colors['其他'];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800">纸张库存</h1>
          <p className="text-gray-500 mt-1">共 {paper.length} 种纸张</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all hover:shadow-md font-medium"
        >
          <Plus className="w-5 h-5" />
          添加纸张
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800">库存提醒</p>
            <p className="text-sm text-amber-600">
              有 {lowStockCount} 种纸张库存不足，请及时补充
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paper.map((item) => {
          const isLowStock = item.quantity <= item.lowStockThreshold;
          return (
            <div
              key={item.id}
              className={cn(
                'bg-white rounded-2xl p-5 shadow-soft border transition-all hover:shadow-card',
                isLowStock ? 'border-amber-200' : 'border-orange-50'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    getTypeColor(item.type)
                  )}>
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{item.type}</h3>
                    <p className="text-sm text-gray-500">{item.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(item)}
                    className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.color}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-warm-50 rounded-xl">
                <span className="text-sm text-gray-500">库存数量</span>
                <span className={cn(
                  'font-bold text-xl',
                  isLowStock ? 'text-amber-600' : 'text-gray-800'
                )}>
                  {item.quantity} 张
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjust(item.id, -1)}
                    disabled={item.quantity <= 0}
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                      item.quantity <= 0
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-500 w-16 text-center">快速调整</span>
                  <button
                    onClick={() => handleAdjust(item.id, 1)}
                    className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-200 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isLowStock && (
                <div className="mt-3 flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs">低于最低库存 {item.lowStockThreshold} 张</span>
                </div>
              )}

              {item.notes && (
                <p className="text-xs text-gray-400 mt-3">{item.notes}</p>
              )}
            </div>
          );
        })}
      </div>

      {paper.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-orange-50">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">暂无纸张库存</h3>
          <p className="text-gray-500 mb-6">添加你的第一张折纸用纸吧</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all"
          >
            <Plus className="w-5 h-5" />
            添加纸张
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              {editingPaper ? '编辑纸张' : '添加纸张'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  纸张类型
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as PaperType })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {PAPER_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  尺寸规格
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：15cm x 15cm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  颜色
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：红色、蓝色、米白色"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    数量
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    低库存提醒阈值
                  </label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="可选备注信息"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                >
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
