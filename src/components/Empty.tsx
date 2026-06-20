import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function Empty({
  icon: Icon,
  title = '暂无数据',
  description,
  actionLabel,
  onAction,
  className,
}: EmptyProps) {
  return (
    <div className={cn(
      'text-center py-16 bg-white rounded-2xl shadow-soft border border-orange-50',
      className
    )}>
      {Icon && (
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-orange-50 rounded-2xl flex items-center justify-center">
          <Icon className="w-10 h-10 text-primary-400" />
        </div>
      )}
      {!Icon && <div className="text-5xl mb-4">📭</div>}
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
