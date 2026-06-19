import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

export default function StepViewer() {
  const { id } = useParams<{ id: string }>();
  const { steps, models, fetchSteps } = useAppStore();
  
  const model = models.find(m => m.id === id);
  const modelSteps = steps.filter(s => s.modelId === id);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) {
      fetchSteps(id);
    }
  }, [id, fetchSteps]);

  useEffect(() => {
    if (isPlaying && modelSteps.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= modelSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed * 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, speed, modelSteps.length]);

  const goToPrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentStep((prev) => Math.min(modelSteps.length - 1, prev + 1));
  };

  const goToStart = () => {
    setCurrentStep(0);
  };

  const goToEnd = () => {
    setCurrentStep(modelSteps.length - 1);
  };

  const togglePlay = () => {
    if (currentStep >= modelSteps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const step = modelSteps[currentStep];
  const progress = modelSteps.length > 0 ? ((currentStep + 1) / modelSteps.length) * 100 : 0;

  if (modelSteps.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link
          to={`/models/${id}`}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回模型详情
        </Link>
        
        <div className="text-center py-24 bg-white rounded-2xl shadow-soft">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">暂无步骤</h3>
          <p className="text-gray-500 mb-6">这个模型还没有添加折叠步骤</p>
          <Link
            to={`/models/${id}/edit`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all"
          >
            去添加步骤
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        to={`/models/${id}`}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回 {model?.name || '模型详情'}
      </Link>

      <div className="bg-white rounded-2xl shadow-soft border border-orange-50 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-serif font-bold text-gray-800">
                {model?.name}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                第 {currentStep + 1} 步 / 共 {modelSteps.length} 步
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
                {step?.foldType}
              </span>
            </div>
          </div>
          
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="aspect-video bg-gradient-to-br from-warm-50 via-orange-50 to-primary-50 flex items-center justify-center relative">
          {step?.imageUrl ? (
            <img
              src={step.imageUrl}
              alt={`步骤 ${currentStep + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-center">
              <div className="text-7xl mb-4">📄</div>
              <p className="text-gray-400 text-lg">步骤 {currentStep + 1}</p>
              <p className="text-gray-300 text-sm mt-1">{step?.foldType}</p>
            </div>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            第 {currentStep + 1} 步：{step?.foldType}
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            {step?.description}
          </p>
          {step?.referencePoints && (
            <div className="mt-4 p-4 bg-warm-50 rounded-xl">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">💡 参考点：</span>
                {step.referencePoints}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-6">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={goToStart}
              className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
              title="回到开始"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={goToPrevious}
              disabled={currentStep === 0}
              className={cn(
                'p-3 rounded-xl transition-colors',
                currentStep === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
              )}
              title="上一步"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-14 h-14 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-all hover:shadow-lg"
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>
            
            <button
              onClick={goToNext}
              disabled={currentStep >= modelSteps.length - 1}
              className={cn(
                'p-3 rounded-xl transition-colors',
                currentStep >= modelSteps.length - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
              )}
              title="下一步"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            <button
              onClick={goToEnd}
              className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
              title="跳到最后"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="text-sm text-gray-500">播放速度：</span>
            <div className="flex gap-2">
              {[3, 5, 8, 10].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm transition-colors',
                    speed === s
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {s}秒
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
        <h3 className="font-medium text-gray-800 mb-4">快速跳转</h3>
        <div className="flex flex-wrap gap-2">
          {modelSteps.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(index)}
              className={cn(
                'w-10 h-10 rounded-lg font-medium transition-all',
                currentStep === index
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600'
              )}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
