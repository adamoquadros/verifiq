import React, { useState, useMemo } from 'react';
import type { Company, DocumentControl, CheckRecord, UserAccount } from '../types';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Activity, 
  FileText, 
  Printer, 
  Download, 
  Sparkles,
  ArrowUpRight,
  Filter,
  Layers,
  QrCode
} from 'lucide-react';

interface DashboardViewProps {
  company: Company;
  controls?: DocumentControl[];
  activeControl?: DocumentControl;
  records: CheckRecord[];
  users?: UserAccount[];
  activeUser?: UserAccount;
  onNavigateToMatrix?: () => void;
  onNavigateToReports?: () => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  company,
  controls = company.controls || [],
  records,
  onNavigateToMatrix,
  onNavigateToReports
}) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedControlFilter, setSelectedControlFilter] = useState<string>('ALL');

  // Dias no mês selecionado
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Filtrar registros do período e escopo da empresa
  const periodRecords = useMemo(() => {
    return records.filter(r => {
      const matchCompany = r.companyId === company.id;
      const matchMonth = r.month === selectedMonth && r.year === selectedYear;
      const matchControl = selectedControlFilter === 'ALL' || r.controlId === selectedControlFilter;
      return matchCompany && matchMonth && matchControl;
    });
  }, [records, company.id, selectedMonth, selectedYear, selectedControlFilter]);

  // Controles considerados no cálculo
  const filteredControls = useMemo(() => {
    if (selectedControlFilter === 'ALL') return controls;
    return controls.filter(c => c.id === selectedControlFilter);
  }, [controls, selectedControlFilter]);

  // Estatísticas e KPIs Principais
  const stats = useMemo(() => {
    const totalChecks = periodRecords.length;
    const onTimeChecks = periodRecords.filter(r => r.status === 'ON_TIME').length;
    const earlyChecks = periodRecords.filter(r => r.status === 'EARLY').length;
    const delayedChecks = periodRecords.filter(r => r.status === 'DELAYED').length;
    const qrCodeChecks = periodRecords.filter(r => r.method === 'QR_CODE').length;

    // Calcular total esperado estimado no mês
    let totalExpected = 0;
    filteredControls.forEach(ctrl => {
      ctrl.tasks.forEach(task => {
        if (task.recurrence === 'DAILY') {
          const checksPerDay = task.scheduledTimes && task.scheduledTimes.length > 0 ? task.scheduledTimes.length : 1;
          totalExpected += checksPerDay * daysInMonth;
        } else if (task.recurrence === 'WEEKLY') {
          totalExpected += 4;
        } else if (task.recurrence === 'MONTHLY') {
          totalExpected += 1;
        }
      });
    });

    const complianceRate = totalExpected > 0 ? Math.min(100, Math.round((totalChecks / totalExpected) * 100)) : 100;
    const punctualityRate = totalChecks > 0 ? Math.round(((onTimeChecks + earlyChecks) / totalChecks) * 100) : 100;
    const qrRate = totalChecks > 0 ? Math.round((qrCodeChecks / totalChecks) * 100) : 100;

    return {
      totalChecks,
      totalExpected,
      onTimeChecks,
      earlyChecks,
      delayedChecks,
      qrCodeChecks,
      complianceRate,
      punctualityRate,
      qrRate
    };
  }, [periodRecords, filteredControls, daysInMonth]);

  // Gráfico de Tendência Diária (Dias 1 a 31)
  const dailyDistribution = useMemo(() => {
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return days.map(day => {
      const dayRecs = periodRecords.filter(r => r.dayNumber === day);
      const onTime = dayRecs.filter(r => r.status === 'ON_TIME' || r.status === 'EARLY').length;
      const delayed = dayRecs.filter(r => r.status === 'DELAYED').length;
      return {
        day,
        total: dayRecs.length,
        onTime,
        delayed
      };
    });
  }, [periodRecords, daysInMonth]);

  const maxDayCount = useMemo(() => {
    const max = Math.max(...dailyDistribution.map(d => d.total), 1);
    return max;
  }, [dailyDistribution]);

  // Desempenho por Setor
  const sectorPerformance = useMemo(() => {
    const sectorMap: Record<string, { name: string; color?: string; total: number; onTime: number }> = {};

    filteredControls.forEach(ctrl => {
      ctrl.sectors.forEach(s => {
        if (!sectorMap[s.id]) {
          sectorMap[s.id] = { name: s.name, color: s.color, total: 0, onTime: 0 };
        }
      });
    });

    periodRecords.forEach(r => {
      if (sectorMap[r.sectorId]) {
        sectorMap[r.sectorId].total += 1;
        if (r.status === 'ON_TIME' || r.status === 'EARLY') {
          sectorMap[r.sectorId].onTime += 1;
        }
      }
    });

    return Object.values(sectorMap).filter(s => s.total > 0 || filteredControls.length === 1);
  }, [filteredControls, periodRecords]);

  // Feed ao Vivo das Últimas Checagens (Últimos 10 registros)
  const recentFeed = useMemo(() => {
    return [...periodRecords]
      .sort((a, b) => new Date(b.checkedAt || 0).getTime() - new Date(a.checkedAt || 0).getTime())
      .slice(0, 10);
  }, [periodRecords]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header do Dashboard com Filtros Executivos */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-emerald-600 flex items-center gap-1.5">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>01 — B.I & Monitoramento em Tempo Real</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
              {company.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Painel de Inteligência & Auditoria BPF
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">
            Acompanhe indicadores metrológicos, pontualidade operacional e rastreabilidade sanitária
          </p>
        </div>

        {/* Controles de Filtro: Período e Documento */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Mês */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent focus:outline-none cursor-pointer ml-1"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Seletor de Documento / Controle */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <select
              value={selectedControlFilter}
              onChange={(e) => setSelectedControlFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer max-w-[160px] sm:max-w-[200px] truncate"
            >
              <option value="ALL">Todos os Anexos da Unidade</option>
              {controls.map(c => (
                <option key={c.id} value={c.id}>{c.docCode} - {c.title}</option>
              ))}
            </select>
          </div>

          {/* Botão para abrir matriz */}
          {onNavigateToMatrix && (
            <button
              onClick={onNavigateToMatrix}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Ver Matriz</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Cards de KPIs Principais (Grandes Números) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Conformidade Geral */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conformidade BPF</span>
            <div className="p-2 bg-emerald-50 rounded-2xl text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{stats.complianceRate}%</span>
            <span className="text-[11px] text-emerald-700 font-bold">Meta: 95%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${stats.complianceRate >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${stats.complianceRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex justify-between">
            <span>{stats.totalChecks} de {stats.totalExpected} checagens</span>
            <span>{stats.complianceRate >= 95 ? '✓ Conforme' : '⚠️ Atenção'}</span>
          </p>
        </div>

        {/* KPI 2: Índice de Pontualidade */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pontualidade</span>
            <div className="p-2 bg-blue-50 rounded-2xl text-blue-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{stats.punctualityRate}%</span>
            <span className="text-[11px] text-blue-700 font-bold">No Horário</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.punctualityRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {stats.onTimeChecks + stats.earlyChecks} checagens dentro da tolerância
          </p>
        </div>

        {/* KPI 3: Rastreabilidade por QR Code */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden group hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Via QR Code</span>
            <div className="p-2 bg-teal-50 rounded-2xl text-teal-700">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{stats.qrRate}%</span>
            <span className="text-[11px] text-teal-700 font-bold">No Local</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.qrRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {stats.qrCodeChecks} checks com validação de presença
          </p>
        </div>

        {/* KPI 4: Desvios / Atrasos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Desvios de Horário</span>
            <div className="p-2 bg-amber-50 rounded-2xl text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{stats.delayedChecks}</span>
            <span className="text-[11px] text-amber-700 font-bold">Lançamentos</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.totalChecks > 0 ? (stats.delayedChecks / stats.totalChecks) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {stats.delayedChecks === 0 ? 'Nenhum desvio registrado no período' : 'Checagens que exigiram justificativa'}
          </p>
        </div>
      </div>

      {/* 3. Seção Visual: Gráfico Diário de B.I & Desempenho por Setor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Tendência Diária (Dias 1 ao fim do mês) - Ocupa 2 colunas */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Evolução Diária de Checagens no Mês</span>
                </h3>
                <p className="text-xs text-slate-500">Volume de lançamentos executados dia a dia</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block"></span>
                  <span className="text-slate-600">No Prazo</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block"></span>
                  <span className="text-slate-600">Atraso / Tolerância</span>
                </span>
              </div>
            </div>

            {/* Barras Diárias */}
            <div className="h-48 flex items-end gap-1 sm:gap-1.5 pt-6 pb-2 border-b border-slate-100">
              {dailyDistribution.map((d) => {
                const heightPct = (d.total / maxDayCount) * 100;
                const onTimePct = d.total > 0 ? (d.onTime / d.total) * 100 : 0;
                const isToday = d.day === currentDate.getDate() && selectedMonth === currentDate.getMonth() + 1 && selectedYear === currentDate.getFullYear();

                return (
                  <div 
                    key={d.day} 
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip Hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md font-mono whitespace-nowrap z-20 pointer-events-none transition-opacity shadow-md">
                      Dia {d.day}: {d.total} checks ({d.onTime} no prazo)
                    </div>

                    <div className="w-full max-w-[20px] bg-slate-100 rounded-t-sm overflow-hidden flex flex-col justify-end" style={{ height: `${Math.max(heightPct, 4)}%` }}>
                      <div 
                        className={`w-full ${d.delayed > 0 ? 'bg-amber-500' : 'bg-emerald-500'} transition-all`}
                        style={{ height: '100%' }}
                      />
                    </div>

                    <span className={`text-[9px] mt-1.5 font-bold ${isToday ? 'text-emerald-700 bg-emerald-100 px-1 rounded-sm' : 'text-slate-400'}`}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Período: {MONTH_NAMES[selectedMonth - 1]} de {selectedYear}</span>
            <span>Total no Mês: <strong>{stats.totalChecks}</strong> conferências registradas</span>
          </div>
        </div>

        {/* Desempenho por Setor da Planta */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Conformidade por Setor</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">Acompanhamento setorial da unidade</p>

            <div className="space-y-4">
              {sectorPerformance.map((s, idx) => {
                const pct = s.total > 0 ? Math.round((s.onTime / s.total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 truncate">{s.name}</span>
                      <span className="font-mono text-emerald-800 font-bold">{pct}% ({s.total} checks)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {sectorPerformance.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  Nenhum registro setorial no período selecionado.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl text-[11px] text-emerald-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Garantia BPF:</strong> Toda conferência possui trilha de auditoria digital com rubrica e horário inviolável.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Feed de Auditoria em Tempo Real (Últimos 10 Lançamentos) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Monitoramento em Tempo Real (Últimos Registros)</span>
            </h3>
            <p className="text-xs text-slate-500">Trilha de auditoria das últimas checagens sincronizadas com a nuvem</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
            Live Feed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Data / Hora</th>
                <th className="py-2.5 px-3">Atividade / POP</th>
                <th className="py-2.5 px-3">Operador</th>
                <th className="py-2.5 px-3">Método</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentFeed.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                    {r.date} às {r.checkedTime}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {r.taskName}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">
                        {r.userInitials}
                      </span>
                      <span>{r.userName}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.method === 'QR_CODE' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {r.method === 'QR_CODE' ? '📱 QR Code' : '✍️ Manual'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'ON_TIME' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : r.status === 'EARLY' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status === 'ON_TIME' ? '✓ No Prazo' : r.status === 'EARLY' ? '🕒 Adiantado' : `⚠️ Atraso (${r.delayMinutes}m)`}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 italic max-w-xs truncate">
                    {r.notes || '—'}
                  </td>
                </tr>
              ))}

              {recentFeed.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhum registro encontrado para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
