import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Check,
  X,
  RotateCcw,
  Flag,
  Clock,
  Timer,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Plus,
  Save,
  XCircle,
  Star,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import {
  RATING_LABELS,
  COMPLETION_LABELS,
  NEATNESS_LABELS,
  PAPER_TYPES,
  RESULT_IMAGE_TYPES,
} from '../../constants';
import type { PaperType, ResultImageType, CompletionDegree, NeatnessDegree } from '../../../shared/types';

export default function StepViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    steps,
    models,
    paper,
    loading,
    fetchModels,
    fetchSteps,
    fetchPaper,
    currentSession,
    stepDifficultyMarks,
    startPracticeSession,
    pausePracticeSession,
    resumePracticeSession,
    completePracticeSession,
    cancelPracticeSession,
    updateSessionProgress,
    markStepDifficulty,
    createFold,
    updateModelStatus,
  } = useAppStore();

  const model = models.find(m => m.id === id);
  const modelSteps = steps.filter(s => s.modelId === id);

  const [mode, setMode] = useState<'viewer' | 'practice'>('viewer');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);

  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [difficultyNotes, setDifficultyNotes] = useState('');
  const [isMarkedDifficult, setIsMarkedDifficult] = useState(false);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [foldForm, setFoldForm] = useState({
    foldDate: new Date().toISOString().split('T')[0],
    paperType: '' as PaperType | '',
    paperSize: '',
    paperId: '' as string | null,
    durationMinutes: 0,
    rating: 4,
    completion: 5 as CompletionDegree,
    neatness: 5 as NeatnessDegree,
    success: true,
    notes: '',
    resultImageUrl: '',
    isRepresentative: false,
  });

  useEffect(() => {
    if (id) {
      fetchModels();
      fetchSteps(id);
      fetchPaper();
    }
  }, [id, fetchModels, fetchSteps, fetchPaper]);

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

  useEffect(() => {
    if (mode === 'practice' && currentSession?.status === '进行中') {
      stopwatchRef.current = setInterval(() => {
        const start = new Date(currentSession.resumeTimes.length > 0
          ? currentSession.resumeTimes[currentSession.resumeTimes.length - 1]
          : currentSession.startTime).getTime();
        const current = Date.now();
        const additional = Math.floor((current - start) / 1000);
        setElapsedSeconds(currentSession.totalElapsedSeconds + additional);
      }, 1000);
    } else if (mode === 'practice' && currentSession?.status === '已暂停') {
      setElapsedSeconds(currentSession.totalElapsedSeconds);
    }
    return () => {
      if (stopwatchRef.current) {
        clearInterval(stopwatchRef.current);
      }
    };
  }, [mode, currentSession]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const startPractice = async () => {
    if (!id) return;
    setMode('practice');
    setElapsedSeconds(0);
    await startPracticeSession(id);
    setCurrentStep(0);
  };

  const togglePause = async () => {
    if (!currentSession) return;
    if (currentSession.status === '进行中') {
      await pausePracticeSession(currentSession.id);
    } else if (currentSession.status === '已暂停') {
      await resumePracticeSession(currentSession.id);
    }
  };

  const resetPractice = async () => {
    if (!currentSession || !confirm('确定要重置本次练习吗？所有进度将清除。')) return;
    await cancelPracticeSession(currentSession.id);
    await startPractice();
  };

  const completeCurrentStep = async () => {
    if (!currentSession) return;
    const isCompleted = currentSession.completedSteps.includes(currentStep);
    const action = isCompleted ? 'uncomplete' : 'complete';
    await updateSessionProgress(currentSession.id, currentStep, action as any);
  };

  const skipCurrentStep = async () => {
    if (!currentSession) return;
    await updateSessionProgress(currentSession.id, currentStep, 'skip');
    goToNext();
  };

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

  const openDifficultyModal = () => {
    const step = modelSteps[currentStep];
    if (!step) return;
    const mark = stepDifficultyMarks.find(
      m => m.modelId === id && m.stepId === step.id
    );
    setIsMarkedDifficult(mark?.isDifficult || false);
    setDifficultyNotes(mark?.notes || '');
    setShowDifficultyModal(true);
  };

  const saveDifficultyMark = async () => {
    const step = modelSteps[currentStep];
    if (!step || !id) return;
    await markStepDifficulty(id, step.id, isMarkedDifficult, difficultyNotes);
    setShowDifficultyModal(false);
  };

  const finishPractice = async () => {
    if (!currentSession) return;
    await completePracticeSession(currentSession.id);
    const minutes = Math.ceil(elapsedSeconds / 60);
    setFoldForm(prev => ({
      ...prev,
      durationMinutes: minutes,
      paperType: (model?.recommendedPaperType as PaperType) || '',
      paperSize: model?.recommendedPaperSize || '',
    }));
    setShowCompleteModal(true);
  };

  const handleSubmitFoldRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const selectedPaper = paper.find(p => p.id === foldForm.paperId);
      await createFold({
        modelId: id,
        paperId: foldForm.paperId || null,
        foldDate: foldForm.foldDate,
        paperType: selectedPaper?.type || foldForm.paperType || model?.recommendedPaperType || '',
        paperSize: selectedPaper?.size || foldForm.paperSize || model?.recommendedPaperSize || '',
        durationMinutes: foldForm.durationMinutes,
        rating: foldForm.rating,
        completion: foldForm.completion,
        neatness: foldForm.neatness,
        success: foldForm.success,
        notes: foldForm.notes,
        resultImageUrl: foldForm.resultImageUrl,
        resultImages: [],
        isRepresentative: foldForm.isRepresentative,
        practiceSessionId: currentSession?.id,
      });
      if (model && (model.status === '未开始' || model.status === '学习中')) {
        await updateModelStatus(id, foldForm.success ? '已完成' : '学习中', '完成一次折叠练习');
      }
      setShowCompleteModal(false);
      setMode('viewer');
      navigate(`/models/${id}`);
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handlePaperSelect = (paperId: string) => {
    const selected = paper.find(p => p.id === paperId);
    if (selected) {
      setFoldForm({
        ...foldForm,
        paperId,
        paperType: selected.type as PaperType,
        paperSize: selected.size,
      });
    } else {
      setFoldForm({ ...foldForm, paperId: '' });
    }
  };

  const step = modelSteps[currentStep];
  const progress = modelSteps.length > 0 ? ((currentStep + 1) / modelSteps.length) * 100 : 0;

  const completedCount = currentSession?.completedSteps.length || 0;
  const skippedCount = currentSession?.skippedSteps.length || 0;
  const practiceProgress = modelSteps.length > 0
    ? ((completedCount + skippedCount) / modelSteps.length) * 100
    : 0;

  const getStepState = (index: number) => {
    if (!currentSession) return 'none';
    if (currentSession.completedSteps.includes(index)) return 'completed';
    if (currentSession.skippedSteps.includes(index)) return 'skipped';
    return 'pending';
  };

  const isCurrentStepDifficult = step ? stepDifficultyMarks.some(
    m => m.modelId === id && m.stepId === step.id && m.isDifficult
  ) : false;

  const renderStars = (count: number, max: number = 5) => {
    return '⭐'.repeat(count) + '☆'.repeat(max - count);
  };

  if (loading && models.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link to={`/models/${id}`} className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          返回模型详情
        </Link>
        <div className="text-center py-24 bg-white rounded-2xl shadow-soft">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (modelSteps.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link to={`/models/${id}`} className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          返回模型详情
        </Link>
        <div className="text-center py-24 bg-white rounded-2xl shadow-soft border border-orange-50">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">暂无步骤</h3>
          <p className="text-gray-500 mb-6">这个模型还没有添加折叠步骤</p>
          <Link to={`/models/${id}/edit`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all">
            去添加步骤
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link to={`/models/${id}`} className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          返回 {model?.name || '模型详情'}
        </Link>

        {mode === 'viewer' ? (
          <button
            onClick={startPractice}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            <Sparkles className="w-5 h-5" />
            进入练习模式
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-medium',
              currentSession?.status === '进行中'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            )}>
              <Timer className="w-4 h-4" />
              <span className="font-mono text-lg">{formatTime(elapsedSeconds)}</span>
            </div>
            <button
              onClick={togglePause}
              className={cn(
                'p-2.5 rounded-xl transition-colors',
                currentSession?.status === '进行中'
                  ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              )}
              title={currentSession?.status === '进行中' ? '暂停' : '继续'}
            >
              {currentSession?.status === '进行中' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={resetPractice}
              className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
              title="重置练习"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (confirm('确定要取消练习吗？')) {
                  currentSession && cancelPracticeSession(currentSession.id);
                  setMode('viewer');
                }
              }}
              className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
              title="取消练习"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {mode === 'practice' && currentSession && (
        <div className="bg-gradient-to-r from-primary-500/10 via-orange-500/10 to-primary-500/10 rounded-2xl p-5 border border-primary-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-700">已完成 {completedCount} 步</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-gray-700">跳过 {skippedCount} 步</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                <span className="font-medium text-gray-700">剩余 {modelSteps.length - completedCount - skippedCount} 步</span>
              </div>
            </div>
            <button
              onClick={finishPractice}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              完成并记录
            </button>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-green-400 via-primary-500 to-orange-500 transition-all duration-500"
              style={{ width: `${practiceProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-soft border border-orange-50 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-serif font-bold text-gray-800">
                {model?.name}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                第 {currentStep + 1} 步 / 共 {modelSteps.length} 步
                {mode === 'practice' && currentStep === modelSteps.length - 1 && completedCount + skippedCount >= modelSteps.length && (
                  <span className="ml-3 text-green-600 font-medium">🎉 所有步骤已处理完成</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {step && (
                <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
                  {step?.foldType}
                </span>
              )}
              {mode === 'practice' && isCurrentStepDifficult && (
                <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  难点标记
                </span>
              )}
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

          {mode === 'practice' && (
            <div className="absolute top-4 left-4">
              <div className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm',
                getStepState(currentStep) === 'completed' && 'bg-green-500/90 text-white',
                getStepState(currentStep) === 'skipped' && 'bg-amber-500/90 text-white',
                getStepState(currentStep) === 'pending' && 'bg-white/90 text-gray-600 border border-gray-200',
              )}>
                {getStepState(currentStep) === 'completed' && '✓ 已完成'}
                {getStepState(currentStep) === 'skipped' && '↷ 已跳过'}
                {getStepState(currentStep) === 'pending' && '○ 进行中'}
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">
              第 {currentStep + 1} 步：{step?.foldType}
            </h2>
            {mode === 'practice' && (
              <button
                onClick={openDifficultyModal}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                  isCurrentStepDifficult
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                )}
              >
                <Flag className="w-4 h-4" />
                {isCurrentStepDifficult ? '标记难点' : '标记难点'}
              </button>
            )}
          </div>
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
          {isCurrentStepDifficult && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-700">
                <span className="font-medium flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  难点备注：
                </span>
                {stepDifficultyMarks.find(
                  m => m.modelId === id && m.stepId === step?.id
                )?.notes || '未添加备注说明'}
              </p>
            </div>
          )}
        </div>

        {mode === 'practice' && (
          <div className="border-t border-gray-100 bg-warm-50/50 p-4">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={completeCurrentStep}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all',
                  getStepState(currentStep) === 'completed'
                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                    : 'bg-white border-2 border-green-500 text-green-600 hover:bg-green-50'
                )}
              >
                <Check className="w-5 h-5" />
                {getStepState(currentStep) === 'completed' ? '取消完成' : '打卡完成'}
              </button>
              <button
                onClick={skipCurrentStep}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all',
                  getStepState(currentStep) === 'skipped'
                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md'
                    : 'bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50'
                )}
              >
                <SkipForward className="w-5 h-5" />
                跳过此步
              </button>
              <button
                onClick={goToPrevious}
                disabled={currentStep === 0}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors',
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                <ChevronLeft className="w-5 h-5" />
                回退
              </button>
            </div>
          </div>
        )}

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

            {mode === 'viewer' && (
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
            )}

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

          {mode === 'viewer' && (
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
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-50">
        <h3 className="font-medium text-gray-800 mb-4">
          快速跳转
          {mode === 'practice' && <span className="text-sm text-gray-400 ml-2">（已完成/已跳过会有颜色标记）</span>}
        </h3>
        <div className="flex flex-wrap gap-2">
          {modelSteps.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(index)}
              className={cn(
                'w-10 h-10 rounded-lg font-medium transition-all relative',
                mode === 'practice' && getStepState(index) === 'completed'
                  && 'bg-green-500 text-white shadow-md ring-2 ring-green-300',
                mode === 'practice' && getStepState(index) === 'skipped'
                  && 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300',
                mode === 'practice' && getStepState(index) === 'pending' && currentStep === index
                  && 'bg-primary-500 text-white shadow-md',
                mode === 'practice' && getStepState(index) === 'pending' && currentStep !== index
                  && 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600',
                mode === 'viewer' && currentStep === index
                  && 'bg-primary-500 text-white shadow-md',
                mode === 'viewer' && currentStep !== index
                  && 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600',
              )}
            >
              {mode === 'practice' && getStepState(index) === 'completed' ? (
                <Check className="w-5 h-5 mx-auto" />
              ) : (
                <span>{index + 1}</span>
              )}
              {stepDifficultyMarks.some(m => m.modelId === id && m.stepId === s.id && m.isDifficult) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
          ))}
        </div>
        {mode === 'practice' && (
          <div className="flex items-center gap-6 mt-5 pt-4 border-t border-gray-100 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-500 rounded" />
              已完成
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-amber-500 rounded" />
              已跳过
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-gray-100 rounded border border-gray-300" />
              未处理
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full" />
              标记难点
            </div>
          </div>
        )}
      </div>

      {showDifficultyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" />
                标记步骤难点
              </h3>
              <button
                onClick={() => setShowDifficultyModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="p-4 bg-warm-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">当前步骤</p>
                <p className="font-medium text-gray-800">
                  第 {currentStep + 1} 步：{step?.foldType}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  此步骤是否为难点？
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMarkedDifficult(false)}
                    className={cn(
                      'flex-1 py-3 rounded-xl font-medium transition-all',
                      !isMarkedDifficult
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    不是难点
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMarkedDifficult(true)}
                    className={cn(
                      'flex-1 py-3 rounded-xl font-medium transition-all',
                      isMarkedDifficult
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      标记为难点
                    </span>
                  </button>
                </div>
              </div>

              {isMarkedDifficult && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    难点备注说明
                  </label>
                  <textarea
                    value={difficultyNotes}
                    onChange={(e) => setDifficultyNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="例如：容易左右反、需要耐心沉折、注意对称性..."
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDifficultyModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={saveDifficultyMark}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                保存标记
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                完成折叠！记录一下吧
              </h3>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-primary-50 rounded-xl border border-green-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>模型：</span>
                  <span className="font-medium text-gray-800">{model?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Timer className="w-4 h-4" />
                  <span>用时：</span>
                  <span className="font-mono font-medium text-primary-600">
                    {Math.ceil(elapsedSeconds / 60)} 分钟
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitFoldRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  折叠日期
                </label>
                <input
                  type="date"
                  value={foldForm.foldDate}
                  onChange={(e) => setFoldForm({ ...foldForm, foldDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择纸张（可选）
                </label>
                <select
                  value={foldForm.paperId || ''}
                  onChange={(e) => handlePaperSelect(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">手动输入纸张信息</option>
                  {paper.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.type} - {p.size} - {p.color} (剩余{p.quantity}张)
                    </option>
                  ))}
                </select>
              </div>

              {!foldForm.paperId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      纸张类型
                    </label>
                    <select
                      value={foldForm.paperType}
                      onChange={(e) => setFoldForm({ ...foldForm, paperType: e.target.value as PaperType })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">请选择</option>
                      {PAPER_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      纸张尺寸
                    </label>
                    <input
                      type="text"
                      value={foldForm.paperSize}
                      onChange={(e) => setFoldForm({ ...foldForm, paperSize: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="例如：15cm x 15cm"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  折叠用时（分钟）
                </label>
                <input
                  type="number"
                  value={foldForm.durationMinutes}
                  onChange={(e) => setFoldForm({ ...foldForm, durationMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  是否成功完成？
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFoldForm({ ...foldForm, success: true })}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl font-medium transition-all',
                      foldForm.success
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    ✓ 成功完成
                  </button>
                  <button
                    type="button"
                    onClick={() => setFoldForm({ ...foldForm, success: false })}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl font-medium transition-all',
                      !foldForm.success
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    ✗ 未能完成
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  综合评价
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFoldForm({ ...foldForm, rating })}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
                        foldForm.rating >= rating
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      )}
                    >
                      ⭐ {RATING_LABELS[rating]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  完成度：{COMPLETION_LABELS[foldForm.completion]}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFoldForm({ ...foldForm, completion: n as CompletionDegree })}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
                        foldForm.completion >= n
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  整洁度：{NEATNESS_LABELS[foldForm.neatness]}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFoldForm({ ...foldForm, neatness: n as NeatnessDegree })}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
                        foldForm.neatness >= n
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  成品图片 URL（可选）
                </label>
                <input
                  type="url"
                  value={foldForm.resultImageUrl}
                  onChange={(e) => setFoldForm({ ...foldForm, resultImageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foldForm.isRepresentative}
                    onChange={(e) => setFoldForm({ ...foldForm, isRepresentative: e.target.checked })}
                    className="w-4 h-4 text-primary-500 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    标记为代表作
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  心得笔记
                </label>
                <textarea
                  value={foldForm.notes}
                  onChange={(e) => setFoldForm({ ...foldForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="记录一下这次折叠的心得、遇到的困难..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  保存记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
