import React, { useState, useMemo } from 'react';
import type { TaskItem, CheckRecord, UserOperator, DocumentControl } from '../types';
import { 
  Camera as CameraIcon, 
  CheckCircle2 as CheckCircleIcon, 
  Clock as ClockIcon, 
  Search as SearchIcon, 
  Check as CheckIcon, 
  Sparkles as SparklesIcon,
  Layers as LayersIcon,
  QrCode as QrCodeIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateScheduleDifference } from '../utils/qrcode';

interface MobileCheckViewProps {
  controls: DocumentControl[];
  activeControl: DocumentControl;
  onSelectControl: (control: DocumentControl) => void;
  records: CheckRecord[];
  activeUser: UserOperator;
  onOpenQRScanner: () => void;
  onConfirmCheck: (record: Omit<CheckRecord, 'id'>) => void;
  onViewTaskDetail: (day: number, task: TaskItem, record?: CheckRecord, scheduledTime?: string) => void;
}

export const MobileCheckView: React.FC<MobileCheckViewProps> = ({
  controls,
  activeControl,
  onSelectControl,
  records,
  activeUser,
  onOpenQRScanner,
  onConfirmCheck,
  onViewTaskDetail
}) => {
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'DONE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentDayOfWeek = now.getDay();

  // Map today's records for this control: taskId-time and taskId -> CheckRecord
  const todayRecordMap = useMemo(() => {
    const map = new Map<string, CheckRecord>();
    records
      .filter(r => r.controlId === activeControl.id && r.dayNumber === currentDay && r.month === currentMonth && r.year === currentYear)
      .forEach(r => {
        if (r.scheduledTime) {
          map.set(`${r.taskId}-${r.scheduledTime}`, r);
        }
        if (!map.has(r.taskId)) {
          map.set(r.taskId, r);
        }
      });
    return map;
  }, [records, activeControl.id, currentDay, currentMonth, currentYear]);

  // Tasks applicable today for active control (semanal e mensal livres todos os dias)
  const applicableTasks = useMemo(() => {
    return activeControl.tasks.filter(task => task.active);
  }, [activeControl]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return applicableTasks.filter(task => {
      if (selectedSectorFilter !== 'ALL' && task.sectorId !== selectedSectorFilter) {
        return false;
      }

      const hasMultipleTimes = task.scheduledTimes && task.scheduledTimes.length > 1;
      const isDone = hasMultipleTimes 
        ? task.scheduledTimes!.every(t => todayRecordMap.has(`${task.id}-${t}`))
        : todayRecordMap.has(task.id);

      if (statusFilter === 'PENDING' && isDone) return false;
      if (statusFilter === 'DONE' && !isDone) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return task.name.toLowerCase().includes(q) || task.code.toLowerCase().includes(q);
      }

      return true;
    });
  }, [applicableTasks, selectedSectorFilter, statusFilter, searchQuery, todayRecordMap]);

  // Daily statistics - computa com precisão todas as rodadas
  const totalTasksToday = applicableTasks.reduce((acc, task) => {
    const rounds = task.scheduledTimes && task.scheduledTimes.length > 0 ? task.scheduledTimes.length : 1;
    return acc + rounds;
  }, 0);
  
  const completedToday = applicableTasks.reduce((acc, task) => {
    if (task.scheduledTimes && task.scheduledTimes.length > 0) {
      return acc + task.scheduledTimes.filter(t => todayRecordMap.has(`${task.id}-${t}`)).length;
    }
    return acc + (todayRecordMap.has(task.id) ? 1 : 0);
  }, 0);

  const percentDone = totalTasksToday > 0 ? Math.round((completedToday / totalTasksToday) * 100) : 0;

  // Handle 1-Tap Manual Fast Check
  const handleQuickCheck = (task: TaskItem, targetScheduledTime?: string) => {
    const currentTime = new Date();
    const targetTime = targetScheduledTime || (task.hasScheduledTime !== false ? task.scheduledTime : undefined);
    const diff = calculateScheduleDifference(targetTime, currentTime, task.toleranceMinutes);
    
    const padDay = String(currentDay).padStart(2, '0');
    const padMonth = String(currentMonth).padStart(2, '0');
    const dateStr = `${currentYear}-${padMonth}-${padDay}`;
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const mins = String(currentTime.getMinutes()).padStart(2, '0');
    const checkedTime = `${hours}:${mins}`;

    const targetCompanyId = activeControl.companyId || (activeUser as any)?.companyId || 'comp-herbarium';

    onConfirmCheck({
      companyId: targetCompanyId,
      controlId: activeControl.id,
      taskId: task.id,
      taskName: task.name,
      sectorId: task.sectorId,
      date: dateStr,
      dayNumber: currentDay,
      month: currentMonth,
      year: currentYear,
      scheduledTime: targetTime,
      checkedAt: currentTime.toISOString(),
      checkedTime,
      userId: activeUser.id,
      userName: activeUser.name,
      userInitials: activeUser.initials,
      status: diff.status,
      delayMinutes: diff.delayMinutes,
      method: 'MANUAL',
      locationValidation: true
    });

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.8 }
    });
  };

  return (
    <div className="space-y-4">
      {/* Active Control Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-emerald-700/80 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border border-emerald-500/40">
                {activeControl.docCode} • {activeControl.revision}
              </span>
              <span className="text-xs text-emerald-200">
                {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight">{activeControl.title}</h2>
            <p className="text-xs text-emerald-200/90 mt-1">{activeControl.popRef}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Switch Dropdown if multiple controls */}
            {controls.length > 1 && (
              <select
                value={activeControl.id}
                onChange={(e) => {
                  const target = controls.find(c => c.id === e.target.value);
                  if (target) onSelectControl(target);
                }}
                className="bg-emerald-950/80 border border-emerald-600/50 text-white text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {controls.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.docCode} - {c.title.substring(0, 30)}...
                  </option>
                ))}
              </select>
            )}

            {/* QR Scan Button (Hero action) */}
            <button
              onClick={onOpenQRScanner}
              className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold rounded-2xl flex items-center gap-2 text-xs shadow-md active:scale-95 transition-all"
            >
              <QrCodeIcon className="w-4 h-4" />
              <span>Bipar QR Code</span>
            </button>
          </div>
        </div>

        {/* Progress Bar Today */}
        <div className="mt-4 pt-4 border-t border-emerald-700/50">
          <div className="flex items-center justify-between text-xs text-emerald-100 font-medium mb-1.5">
            <span>Progresso de Checagens Hoje:</span>
            <span className="font-bold">{completedToday} de {totalTasksToday} ({percentDone}%)</span>
          </div>
          <div className="w-full h-2.5 bg-emerald-950/60 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentDone}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar atividade por nome ou código..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
          />
        </div>

        {/* Sector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
          <button
            onClick={() => setSelectedSectorFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              selectedSectorFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos os Setores ({applicableTasks.length})
          </button>

          {activeControl.sectors.map(sector => (
            <button
              key={sector.id}
              onClick={() => setSelectedSectorFilter(sector.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                selectedSectorFilter === sector.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sector.name.replace('DIÁRIO – ', '').replace('DIÁRIO - ', '')}
            </button>
          ))}
        </div>

        {/* Status Toggle */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
          <span className="text-slate-400 font-medium text-[11px]">Filtrar:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                statusFilter === 'PENDING' ? 'bg-amber-100 text-amber-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Pendentes ({totalTasksToday - completedToday})
            </button>
            <button
              onClick={() => setStatusFilter('DONE')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                statusFilter === 'DONE' ? 'bg-emerald-100 text-emerald-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Feitos ({completedToday})
            </button>
          </div>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
            <CheckCircleIcon className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-50" />
            <p className="font-bold text-slate-700">Nenhuma atividade encontrada neste modelo para os filtros atuais.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const hasMultipleTimes = task.scheduledTimes && task.scheduledTimes.length > 1;
            const record = todayRecordMap.get(task.id);
            const isDone = !!record;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs ${
                  isDone 
                    ? 'border-emerald-200 bg-emerald-50/20' 
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-mono">
                        {task.code}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {task.popRef}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {task.name}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2.5 text-xs">
                      {task.hasScheduledTime !== false && task.scheduledTime ? (
                        <div className="flex items-center gap-1 text-slate-600 font-semibold">
                          <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {hasMultipleTimes 
                              ? `${task.scheduledTimes!.join(', ')} (${task.scheduledTimes!.length}x ao dia)` 
                              : `Agendado: ${task.scheduledTime}`}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-blue-700 font-semibold">
                          <CheckCircleIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span>Apenas Conferência</span>
                        </div>
                      )}

                      {task.recurrence === 'WEEKLY' && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                          Semanal
                        </span>
                      )}
                    </div>
                  </div>

                  {!hasMultipleTimes && (
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      {isDone ? (
                        <button
                          onClick={() => onViewTaskDetail(currentDay, task, record, task.scheduledTime)}
                          className="flex flex-col items-end p-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition-colors text-right cursor-pointer"
                        >
                          <div className="flex items-center gap-1 text-emerald-700 font-extrabold text-xs">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Feito às {record.checkedTime}</span>
                          </div>
                          <div className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
                            <span className="font-bold">[{record.userInitials}]</span>
                            <span>• {record.method === 'QR_CODE' ? 'QR Code' : 'Manual'}</span>
                          </div>
                          <span className="text-[9px] text-emerald-600 font-medium underline mt-1">
                            Ver detalhes
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickCheck(task)}
                          className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                          title="Dar check manual rápido agora"
                        >
                          <CheckIcon className="w-4 h-4" />
                          <span>Check Rápido</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Multi-time rounds for tasks that have multiple checks per day */}
                {hasMultipleTimes && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Rodadas de Hoje ({task.scheduledTimes!.length} checagens):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {task.scheduledTimes!.map(t => {
                        const rec = todayRecordMap.get(`${task.id}-${t}`);
                        return (
                          <div 
                            key={t} 
                            className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                              rec 
                                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
                                : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-mono font-bold text-xs">
                              <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                              <span>{t}</span>
                            </div>

                            {rec ? (
                              <button
                                onClick={() => onViewTaskDetail(currentDay, task, rec, t)}
                                className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-extrabold text-[10px] border border-emerald-300 transition-colors"
                              >
                                ✓ [{rec.userInitials} {rec.checkedTime}]
                              </button>
                            ) : (
                              <button
                                onClick={() => handleQuickCheck(task, t)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-colors flex items-center gap-1"
                              >
                                <CheckIcon className="w-3 h-3" />
                                <span>Check</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
