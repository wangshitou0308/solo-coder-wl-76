import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  Layers,
  BarChart3,
  Feather,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/models', icon: BookOpen, label: '模型库' },
  { to: '/folds', icon: Clock, label: '折叠记录' },
  { to: '/paper', icon: Layers, label: '纸张库存' },
  { to: '/statistics', icon: BarChart3, label: '统计中心' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-warm-50 flex">
      <aside className="w-64 bg-white shadow-soft border-r border-orange-100 flex flex-col">
        <div className="p-6 border-b border-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
              <Feather className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-gray-800">折纸工坊</h1>
              <p className="text-xs text-gray-400">Origami Studio</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium shadow-sm'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-primary-500'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-orange-100">
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">折纸小贴士</p>
            <p className="text-xs text-gray-500 mt-1">
              每次折叠前确保纸张平整，边角对齐是关键哦~
            </p>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
