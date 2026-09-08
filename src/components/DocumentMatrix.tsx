import React, { useState, useMemo } from 'react';
import type { 
  DocumentControl,
  TaskItem, 
  CheckRecord, 
  UserOperator,
  Company
} from '../types';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Info, 
  Filter, 
  FileSpreadsheet,
  Edit3,
  Trash2,
  RotateCcw,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface DocumentMatrixProps {
  company: Company;
  control: DocumentControl;
  records: CheckRecord[];
  activeUser: UserOperator;
  onCellClick: (day: number, task: TaskItem, record?: CheckRecord, scheduledTime?: string, month?: number, year?: number) => void;
  onOpenEditControl: (control: DocumentControl) => void;
  onPrint: () => void;
  onUpdateControl?: (control: DocumentControl) => void;
  onClearRecords?: (controlId: string, month?: number, year?: number) => void;
}

export const DocumentMatrix: React.FC<DocumentMatrixProps> = ({
  company,
  control,
  records,
  activeUser,
  onCellClick,
  onOpenEditControl,
  onUpdateControl,
  onClearRecords
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ON_TIME' | 'DELAYED' | 'PENDING'>('ALL');
  const [showColumnTimes, setShowColumnTimes] = useState<boolean>(control.showColumnTimes !== false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearScope, setClearScope] = useState<'MONTH' | 'ALL'>('ALL');

  React.useEffect(() => {
    setShowColumnTimes(control.showColumnTimes !== false);
  }, [control.showColumnTimes]);

  const handleToggleShowColumnTimes = () => {
    const nextVal = !showColumnTimes;
    setShowColumnTimes(nextVal);
    if (onUpdateControl) {
      onUpdateControl({
        ...control,
        showColumnTimes: nextVal
      });
    }
  };

  const handleConfirmClearRecords = () => {
    if (onClearRecords) {
      if (clearScope === 'MONTH') {
        onClearRecords(control.id, selectedMonth, selectedYear);
      } else {
        onClearRecords(control.id);
      }
    }
    setIsClearModalOpen(false);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const totalDaysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const daysArray = useMemo(() => {
    return Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  }, [totalDaysInMonth]);

  // Group active tasks by sectors
  const sectorTaskGroups = useMemo(() => {
    return control.sectors.map(sec => ({
      sector: sec,
      tasks: control.tasks.filter(t => t.sectorId === sec.id && t.active)
    })).filter(g => g.tasks.length > 0);
  }, [control]);

  const allActiveTasks = useMemo(() => {
    return sectorTaskGroups.flatMap(g => g.tasks);
  }, [sectorTaskGroups]);

  // Distinct scheduled times across all active tasks
  const distinctDailyTimes = useMemo(() => {
    const timesSet = new Set<string>();
    allActiveTasks.forEach(task => {
      if (task.hasScheduledTime !== false) {
        if (task.scheduledTimes && task.scheduledTimes.length > 0) {
          task.scheduledTimes.forEach(t => timesSet.add(t));
        } else if (task.scheduledTime) {
          timesSet.add(task.scheduledTime);
        }
      }
    });
    return Array.from(timesSet).sort();
  }, [allActiveTasks]);

  // Does this control have multi-check activities per day?
  const hasMultiTimeChecks = useMemo(() => {
    return allActiveTasks.some(t => t.scheduledTimes && t.scheduledTimes.length > 1);
  }, [allActiveTasks]);

  // Record lookup map for this control: key = `${day}-${taskId}-${scheduledTime}` and fallback `${day}-${taskId}`
  const recordMap = useMemo(() => {
    const map = new Map<string, CheckRecord>();
    records
      .filter(r => r.controlId === control.id && r.month === selectedMonth && r.year === selectedYear)
      .forEach(r => {
        if (r.scheduledTime) {
          map.set(`${r.dayNumber}-${r.taskId}-${r.scheduledTime}`, r);
        }
        if (!map.has(`${r.dayNumber}-${r.taskId}`)) {
          map.set(`${r.dayNumber}-${r.taskId}`, r);
        }
      });
    return map;
  }, [records, control.id, selectedMonth, selectedYear]);

  // Monthly statistics - computa com precisão todos os lançamentos realizados
  const stats = useMemo(() => {
    // Todos os registros efetivamente gravados neste documento para o mês/ano selecionado
    const currentMonthRecords = records.filter(
      r => r.controlId === control.id && r.month === selectedMonth && r.year === selectedYear
    );

    const totalChecked = currentMonthRecords.length;
    const delayedCount = currentMonthRecords.filter(r => r.status === 'DELAYED').length;
    const onTimeCount = currentMonthRecords.filter(r => r.status !== 'DELAYED').length;

    // Cálculo de slots programados esperados no mês
    const isCurrentMonth = selectedYear === currentDate.getFullYear() && selectedMonth === (currentDate.getMonth() + 1);
    const maxDayToCheck = isCurrentMonth ? currentDate.getDate() : totalDaysInMonth;

    let totalScheduledSlots = 0;
    for (let day = 1; day <= maxDayToCheck; day++) {
      const dayDate = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = dayDate.getDay();

      allActiveTasks.forEach(task => {
        if (task.recurrence === 'MONTHLY') {
          if (day === 1) totalScheduledSlots += 1;
          return;
        }

        if (task.recurrence === 'WEEKLY') {
          if (task.daysOfWeek && task.daysOfWeek.length > 0) {
            if (task.daysOfWeek.includes(dayOfWeek)) totalScheduledSlots += 1;
          } else if (dayOfWeek === 5) {
            totalScheduledSlots += 1;
          }
          return;
        }

        // DAILY tasks
        const timesCount = (task.scheduledTimes && task.scheduledTimes.length > 0) 
          ? task.scheduledTimes.length 
          : 1;
        totalScheduledSlots += timesCount;
      });
    }

    const effectiveSlots = Math.max(totalScheduledSlots, totalChecked, 1);
    const adherenceRate = Math.min(100, Math.round((totalChecked / effectiveSlots) * 100));
    const punctualityRate = totalChecked > 0 ? Math.round((onTimeCount / totalChecked) * 100) : 100;
    const pendingCount = Math.max(0, totalScheduledSlots - totalChecked);

    return {
      totalScheduledSlots: effectiveSlots,
      totalChecked,
      onTimeCount,
      delayedCount,
      pendingCount,
      adherenceRate,
      punctualityRate
    };
  }, [records, control.id, selectedMonth, selectedYear, allActiveTasks, totalDaysInMonth, currentDate]);

  // Export to Excel
  const handleExportExcel = () => {
    const baseHeaders = hasMultiTimeChecks ? ['DIA', 'HORÁRIO'] : ['DIA'];
    const headerRow1 = [...baseHeaders, ...allActiveTasks.map(t => {
      const sec = control.sectors.find(s => s.id === t.sectorId);
      return `[${sec?.name.replace('DIÁRIO – ', '').replace('DIÁRIO - ', '')}] ${t.name} (${t.scheduledTime})`;
    })];
    
    const dataRows: (string | number)[][] = [];

    daysArray.forEach(day => {
      const dayDate = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = dayDate.getDay();
      const dayTimeSlots = hasMultiTimeChecks ? distinctDailyTimes : [null];

      dayTimeSlots.forEach(timeSlot => {
        const row: (string | number)[] = hasMultiTimeChecks ? [day, timeSlot || ''] : [day];

        allActiveTasks.forEach(task => {
          const targetTime = timeSlot || (task.hasScheduledTime !== false ? task.scheduledTime : undefined);
          const isTimeApplicable = !timeSlot || (task.hasScheduledTime === false) || (task.scheduledTimes ? task.scheduledTimes.includes(timeSlot) : task.scheduledTime === timeSlot);

          if (!isTimeApplicable) {
            row.push('—');
            return;
          }

          const isMultiCheckTask = !!(task.scheduledTimes && task.scheduledTimes.length > 1);
          const rec = (targetTime ? recordMap.get(`${day}-${task.id}-${targetTime}`) : undefined) 
            || (!isMultiCheckTask ? recordMap.get(`${day}-${task.id}`) : undefined);

          if (rec) {
            row.push(`${rec.userInitials} (${rec.checkedTime} - ${rec.status === 'DELAYED' ? 'Atraso' : 'OK'})`);
          } else {
            row.push('Pendente');
          }
        });

        dataRows.push(row);
      });
    });

    const worksheet = XLSX.utils.aoa_to_sheet([
      [`${company.name.toUpperCase()} - ${control.title} - ${monthNames[selectedMonth - 1]}/${selectedYear}`],
      [`Documento: ${control.docCode} | POP: ${control.popRef} | Revisão: ${control.revision} | Emissão: ${control.emissionDate}`],
      [],
      headerRow1,
      ...dataRows
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Controle_${selectedMonth}_${selectedYear}`);
    XLSX.writeFile(workbook, `${company.name}_${control.docCode}_${monthNames[selectedMonth - 1]}_${selectedYear}.xlsx`);
  };

  const isToday = (day: number) => {
    return (
      selectedYear === currentDate.getFullYear() &&
      selectedMonth === (currentDate.getMonth() + 1) &&
      day === currentDate.getDate()
    );
  };

  const isPast = (day: number) => {
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const cellDate = new Date(selectedYear, selectedMonth - 1, day);
    return cellDate < today;
  };

  return (
    <div className="space-y-4">
      {/* Top Control Bar (Non-printed) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-xl text-slate-700 transition-colors"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 text-sm font-bold text-slate-800 min-w-[150px] text-center flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{monthNames[selectedMonth - 1]} / {selectedYear}</span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-xl text-slate-700 transition-colors"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedYear(currentDate.getFullYear());
              setSelectedMonth(currentDate.getMonth() + 1);
            }}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Mês Atual
          </button>
        </div>

        {/* Stats Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Conformidade: <strong>{stats.adherenceRate}%</strong></span>
            <span className="text-[10px] text-emerald-600">({stats.totalChecked}/{stats.totalScheduledSlots})</span>
          </div>

          <div className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>No Prazo: <strong>{stats.punctualityRate}%</strong></span>
          </div>

          {stats.delayedCount > 0 && (
            <div className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Atrasados: <strong>{stats.delayedCount}</strong></span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 rounded-2xl p-1 text-xs border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent border-0 text-slate-700 font-semibold focus:ring-0 cursor-pointer pr-2 text-xs"
            >
              <option value="ALL">Todos os status</option>
              <option value="ON_TIME">Apenas No Prazo</option>
              <option value="DELAYED">Apenas Atrasados</option>
              <option value="PENDING">Apenas Pendentes</option>
            </select>
          </div>

          <button
            onClick={onOpenEditControl ? () => onOpenEditControl(control) : undefined}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-2xl border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Editar Colunas e Horários deste Modelo"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Editar Modelo</span>
          </button>

          {/* Toggle Column Scheduled Times */}
          <button
            onClick={handleToggleShowColumnTimes}
            className={`px-3 py-1.5 text-xs font-semibold rounded-2xl border flex items-center gap-1.5 transition-colors ${
              showColumnTimes 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
            title={showColumnTimes ? 'Ocultar horários das colunas' : 'Exibir horários das colunas'}
          >
            <Clock className={`w-3.5 h-3.5 ${showColumnTimes ? 'text-slate-500' : 'text-emerald-600'}`} />
            <span className="hidden sm:inline">{showColumnTimes ? 'Ocultar Horários' : 'Exibir Horários'}</span>
          </button>

          {/* Zerar Lançamentos Button */}
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-200 flex items-center gap-1.5 transition-colors"
            title="Zerar lançamentos deste documento"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Zerar Lançamentos</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-2xl border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Exportar para Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      {/* Info Tip */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 text-xs text-emerald-900 flex items-start gap-2.5 no-print">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          Empresa: <strong>{company.name}</strong> • Documento: <strong>{control.docCode} ({control.title})</strong>. Registrando como <strong>{activeUser.name} [{activeUser.initials}]</strong>.
        </div>
      </div>

      {/* ============================================================== */}
      {/* THE OFFICIAL CONTROLLED DOCUMENT LAYOUT CONTAINER               */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-300 p-3 sm:p-5 print:p-0 print:border-0 print:shadow-none overflow-hidden">
        
        {/* Header Box (Exact Replica of Image with Dynamic Company Logo) */}
        <div className="border-2 border-slate-800 text-slate-900 mb-0.5 text-xs select-none">
          {/* Top Row: Logo | Anexo Controlado | HLB Code Box */}
          <div className="grid grid-cols-12 border-b-2 border-slate-800">
            {/* Box 1: Dynamic Company Logo */}
            <div className="col-span-4 sm:col-span-3 p-1.5 sm:p-2.5 flex items-center justify-center border-r-2 border-slate-800 bg-white min-h-[50px]">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="max-h-12 max-w-full object-contain"
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-serif text-emerald-700 font-normal tracking-tight">
                  {company.name.toLowerCase()}
                </span>
              )}
            </div>

            {/* Box 2: ANEXO CONTROLADO */}
            <div className="col-span-5 sm:col-span-6 p-2 sm:p-3 flex items-center justify-center border-r-2 border-slate-800 font-extrabold text-xs sm:text-sm md:text-base tracking-widest text-center">
              {control.documentType}
            </div>

            {/* Box 3: Document Reference Details */}
            <div className="col-span-3 p-1.5 sm:p-2 text-center text-[10px] sm:text-xs flex flex-col justify-center leading-tight">
              <div className="font-bold">{control.docCode}</div>
              <div className="text-slate-700">{control.revision}</div>
              <div className="text-slate-600">{control.pageInfo}</div>
            </div>
          </div>

          {/* Bottom Row: Title | POP Reference & Emission */}
          <div className="grid grid-cols-12">
            {/* Title */}
            <div className="col-span-8 sm:col-span-9 p-2 sm:p-2.5 flex items-center justify-center border-r-2 border-slate-800 font-extrabold text-center text-[11px] sm:text-xs md:text-sm tracking-wide">
              {control.title} - {monthNames[selectedMonth - 1].toUpperCase()} / {selectedYear}
            </div>

            {/* POP & Date */}
            <div className="col-span-4 sm:col-span-3 p-1.5 sm:p-2 text-[9px] sm:text-xs flex flex-col justify-center leading-snug">
              <div className="font-bold">{control.popRef}</div>
              <div className="text-slate-600">Emissão: {control.emissionDate}</div>
            </div>
          </div>
        </div>

        {/* Dynamic Table Matrix */}
        <div className="overflow-x-auto custom-scrollbar border-2 border-slate-800">
          <table className="w-full text-center border-collapse text-[10px] sm:text-[11px] select-none min-w-[900px]">
            <thead>
              {/* Row 1: Sector Group Headers */}
              <tr className="bg-slate-200/90 text-slate-900 border-b border-slate-800 font-bold">
                <th 
                  rowSpan={2} 
                  className="w-10 sm:w-12 border-r-2 border-slate-800 p-1 bg-slate-300 font-bold text-center text-xs tracking-wider"
                >
                  DIA
                </th>

                {hasMultiTimeChecks && (
                  <th 
                    rowSpan={2} 
                    className="w-16 sm:w-20 border-r-2 border-slate-800 p-1 bg-slate-300 font-bold text-center text-xs tracking-wider"
                  >
                    HORÁRIO
                  </th>
                )}

                {sectorTaskGroups.map((group, gIdx) => (
                  <th 
                    key={group.sector.id}
                    colSpan={group.tasks.length}
                    className={`p-1.5 tracking-wider uppercase text-[10px] sm:text-xs bg-slate-200 ${
                      gIdx < sectorTaskGroups.length - 1 ? 'border-r-2 border-slate-800' : ''
                    }`}
                  >
                    {group.sector.name}
                  </th>
                ))}
              </tr>

              {/* Row 2: Sub-Header Task Column Titles */}
              <tr className="bg-white text-slate-900 border-b-2 border-slate-800 text-[9px] sm:text-[10px] font-semibold leading-tight">
                {sectorTaskGroups.map((group, gIdx) => (
                  group.tasks.map((task, tIdx) => {
                    const isSectorLast = tIdx === group.tasks.length - 1;
                    const isVeryLast = isSectorLast && gIdx === sectorTaskGroups.length - 1;

                    const hasTaskSchedule = task.hasScheduledTime !== false && !!task.scheduledTime;

                    return (
                      <th
                        key={task.id}
                        className={`p-1.5 w-20 sm:w-28 align-top ${
                          isVeryLast ? '' : isSectorLast ? 'border-r-2 border-r-slate-800' : 'border-r border-slate-400'
                        }`}
                      >
                        <div className={`flex flex-col ${hasTaskSchedule && showColumnTimes && !hasMultiTimeChecks ? 'min-h-[44px] justify-between' : 'min-h-[34px] justify-center'}`}>
                          <span className="line-clamp-3 font-bold">{task.name}</span>
                          {hasTaskSchedule && showColumnTimes && !hasMultiTimeChecks && (
                            <span className="text-[8px] font-normal text-slate-500 mt-1">🕒 {task.scheduledTime}</span>
                          )}
                        </div>
                      </th>
                    );
                  })
                ))}
              </tr>

              {/* Row 3: Sub-Header Merged Bar */}
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-800 text-[9px] sm:text-[10px] font-bold">
                <td className="bg-slate-300 border-r-2 border-slate-800"></td>
                {hasMultiTimeChecks && <td className="bg-slate-300 border-r-2 border-slate-800"></td>}
                <td 
                  colSpan={allActiveTasks.length} 
                  className="py-1 tracking-widest uppercase text-center bg-slate-100 border-t border-slate-300"
                >
                  RESPONSÁVEL PELA EXECUÇÃO DAS ATIVIDADES
                </td>
              </tr>
            </thead>

            {/* Body: Days 1 to 31 */}
            <tbody className="divide-y divide-slate-300 font-mono">
              {daysArray.map((day) => {
                const dayDate = new Date(selectedYear, selectedMonth - 1, day);
                const dayOfWeek = dayDate.getDay();
                const isSunday = dayOfWeek === 0;
                const isSaturday = dayOfWeek === 6;
                const currentDayActive = isToday(day);

                // If multi-time, iterate through each distinct daily time slot
                const dayTimeSlots = hasMultiTimeChecks ? distinctDailyTimes : [null];

                return dayTimeSlots.map((timeSlot, timeIdx) => {
                  const isFirstSlotOfDay = timeIdx === 0;
                  const isLastSlotOfDay = timeIdx === dayTimeSlots.length - 1;

                  return (
                    <tr 
                      key={`${day}-${timeSlot || 'slot'}`} 
                      className={`hover:bg-emerald-50/40 transition-colors h-7 ${
                        isLastSlotOfDay ? 'border-b-2 border-b-slate-400' : 'border-b border-b-slate-200'
                      } ${
                        currentDayActive 
                          ? 'bg-amber-50/70 font-bold' 
                          : isSunday || isSaturday 
                            ? 'bg-slate-50/70' 
                            : 'bg-white'
                      }`}
                    >
                      {/* Day Number Cell (Grouped by rowSpan if multi-time) */}
                      {isFirstSlotOfDay && (
                        <td 
                          rowSpan={dayTimeSlots.length}
                          className={`border-r-2 border-slate-800 font-bold text-center text-xs align-middle ${
                            currentDayActive ? 'bg-amber-200 text-amber-900' : 'bg-slate-200/90 text-slate-800'
                          }`}
                        >
                          {day}
                        </td>
                      )}

                      {/* Horário Cell (When multi-time is active) */}
                      {hasMultiTimeChecks && (
                        <td className="border-r-2 border-slate-800 font-mono font-bold text-[10px] text-center bg-slate-100/90 text-slate-700 py-1">
                          {timeSlot}
                        </td>
                      )}

                      {/* All Task Cells */}
                      {sectorTaskGroups.map((group, gIdx) => (
                        group.tasks.map((task, tIdx) => {
                          const targetTime = timeSlot || (task.hasScheduledTime !== false ? task.scheduledTime : undefined);
                          const isMultiCheckTask = !!(task.scheduledTimes && task.scheduledTimes.length > 1);
                          const rec = (targetTime ? recordMap.get(`${day}-${task.id}-${targetTime}`) : undefined) 
                            || (!isMultiCheckTask ? recordMap.get(`${day}-${task.id}`) : undefined);
                          const isSectorLast = tIdx === group.tasks.length - 1;
                          const isVeryLast = isSectorLast && gIdx === sectorTaskGroups.length - 1;
                          const borderClass = isVeryLast ? '' : isSectorLast ? 'border-r-2 border-r-slate-800' : 'border-r border-slate-300';

                          const isTimeApplicable = !timeSlot || (task.hasScheduledTime === false) || (task.scheduledTimes ? task.scheduledTimes.includes(timeSlot) : task.scheduledTime === timeSlot);

                          if (!isTimeApplicable) {
                            return (
                              <td key={task.id} className={`p-0 text-slate-300 bg-slate-100/50 text-center ${borderClass}`}>
                                <span className="text-slate-300 text-[10px]">—</span>
                              </td>
                            );
                          }

                          if (statusFilter !== 'ALL') {
                            if (statusFilter === 'ON_TIME' && (!rec || rec.status !== 'ON_TIME')) return <td key={task.id} className={borderClass} />;
                            if (statusFilter === 'DELAYED' && (!rec || rec.status !== 'DELAYED')) return <td key={task.id} className={borderClass} />;
                            if (statusFilter === 'PENDING' && rec) return <td key={task.id} className={borderClass} />;
                          }

                          return (
                            <td 
                              key={task.id}
                              onClick={() => onCellClick(day, task, rec, targetTime, selectedMonth, selectedYear)}
                              className={`p-0 cursor-pointer text-center relative group transition-all ${borderClass} ${
                                rec 
                                  ? rec.status === 'DELAYED'
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold'
                                    : 'hover:bg-emerald-100/60 text-slate-900 font-semibold'
                                  : currentDayActive
                                    ? 'hover:bg-emerald-100/50 bg-amber-50/40 text-slate-400'
                                    : isPast(day)
                                      ? 'hover:bg-rose-50/50 text-slate-400'
                                      : 'hover:bg-slate-100 text-slate-400'
                              }`}
                              title={
                                rec 
                                  ? `Check por ${rec.userName} (${rec.userInitials}) às ${rec.checkedTime} (Alvo: ${targetTime}) - Status: ${rec.status === 'DELAYED' ? `Atrasado (+${rec.delayMinutes}m)` : 'No Prazo'}`
                                  : `Clique para registrar check de ${task.name} no Dia ${day} às ${targetTime}`
                              }
                            >
                              <div className="flex items-center justify-center w-full h-full py-0.5 px-0.5">
                                {rec ? (
                                  <div className="flex items-center justify-center gap-0.5 tracking-tight font-mono leading-none">
                                    <span className="text-slate-500 font-light text-[10px]">[</span>
                                    <span className={`font-extrabold text-[10.5px] ${
                                      rec.status === 'DELAYED' ? 'text-amber-800' : 'text-slate-900'
                                    }`}>
                                      {rec.userInitials}
                                    </span>
                                    <span className={`text-[8.5px] font-semibold ml-0.5 ${
                                      rec.status === 'DELAYED' ? 'text-amber-700' : 'text-slate-600'
                                    }`}>
                                      {rec.checkedTime}
                                    </span>
                                    <span className="text-slate-500 font-light text-[10px]">]</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="text-slate-400 font-light">[</span>
                                    <span className="w-5 inline-block text-center text-slate-300 text-[9px] group-hover:text-emerald-600 font-mono">
                                      &nbsp;
                                    </span>
                                    <span className="text-slate-400 font-light">]</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })
                      ))}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-2 text-[10px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-1 border-t border-slate-300 pt-1.5">
          <div className="font-semibold text-center sm:text-left">
            {control.confidentialText}
          </div>
          <div className="text-slate-500 font-mono text-[9px]">
            Impressão em: {currentDate.toLocaleDateString('pt-BR')} {currentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação para Zerar Lançamentos */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-rose-700" />
                </div>
                <span>Zerar Lançamentos da Matriz</span>
              </div>
              <button 
                onClick={() => setIsClearModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você está prestes a remover os registros de checagem deste documento (<strong>{control.docCode} — {control.title}</strong>).
              Escolha o escopo da limpeza:
            </p>

            <div className="space-y-2 text-xs font-semibold">
              <label className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                clearScope === 'MONTH' ? 'border-rose-500 bg-rose-50/50 text-rose-900 ring-1 ring-rose-400' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}>
                <input 
                  type="radio" 
                  name="clearScope" 
                  checked={clearScope === 'MONTH'} 
                  onChange={() => setClearScope('MONTH')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-bold block">Zerar apenas o mês visível ({monthNames[selectedMonth - 1]}/{selectedYear})</span>
                  <span className="text-[11px] font-normal text-slate-500">Exclui somente os checks efetuados no mês de {monthNames[selectedMonth - 1]}.</span>
                </div>
              </label>

              <label className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                clearScope === 'ALL' ? 'border-rose-500 bg-rose-50/50 text-rose-900 ring-1 ring-rose-400' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}>
                <input 
                  type="radio" 
                  name="clearScope" 
                  checked={clearScope === 'ALL'} 
                  onChange={() => setClearScope('ALL')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-bold block">Zerar TODOS os lançamentos deste documento</span>
                  <span className="text-[11px] font-normal text-slate-500">Limpa todo o histórico de checks deste anexo em qualquer mês ou ano.</span>
                </div>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmClearRecords}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirmar e Zerar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
