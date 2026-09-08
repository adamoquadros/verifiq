import React, { useState, useMemo } from 'react';
import type { CheckRecord, UserOperator, DocumentControl } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileSpreadsheet, 
  UserCheck, 
  Search, 
  QrCode, 
  FileText,
  Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface AuditReportViewProps {
  records: CheckRecord[];
  controls: DocumentControl[];
  activeControl: DocumentControl;
  users: UserOperator[];
}

export const AuditReportView: React.FC<AuditReportViewProps> = ({
  records,
  controls,
  activeControl,
  users
}) => {
  const [selectedControlId, setSelectedControlId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedOperator, setSelectedOperator] = useState<string>('ALL');

  // Sorted and filtered records (newest first)
  const filteredRecords = useMemo(() => {
    return records
      .filter(r => {
        if (selectedControlId !== 'ALL' && r.controlId !== selectedControlId) return false;
        if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
        if (selectedOperator !== 'ALL' && r.userId !== selectedOperator) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            r.taskName.toLowerCase().includes(q) ||
            r.userName.toLowerCase().includes(q) ||
            r.date.includes(q) ||
            (r.notes && r.notes.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
  }, [records, selectedControlId, selectedStatus, selectedOperator, searchQuery]);

  // Operator performance summary
  const operatorMetrics = useMemo(() => {
    return users.map(user => {
      const userRecs = records.filter(r => r.userId === user.id && (selectedControlId === 'ALL' || r.controlId === selectedControlId));
      const onTime = userRecs.filter(r => r.status !== 'DELAYED').length;
      const delayed = userRecs.filter(r => r.status === 'DELAYED').length;
      const total = userRecs.length;
      const onTimePercent = total > 0 ? Math.round((onTime / total) * 100) : 0;
      return {
        user,
        total,
        onTime,
        delayed,
        onTimePercent
      };
    });
  }, [records, users, selectedControlId]);

  // Overall counts
  const totalRecords = filteredRecords.length;
  const onTimeTotal = filteredRecords.filter(r => r.status !== 'DELAYED').length;
  const delayedTotal = filteredRecords.filter(r => r.status === 'DELAYED').length;
  const qrCodeTotal = filteredRecords.filter(r => r.method === 'QR_CODE').length;
  const qrPercent = totalRecords > 0 ? Math.round((qrCodeTotal / totalRecords) * 100) : 0;

  const handleExportExcel = () => {
    const data = filteredRecords.map(r => {
      const ctrl = controls.find(c => c.id === r.controlId);
      const sector = ctrl?.sectors.find(s => s.id === r.sectorId);

      return {
        'ID Registro': r.id,
        'Modelo / Documento': `${ctrl?.docCode || ''} - ${ctrl?.title || ''}`,
        'Data': r.date,
        'Atividade': r.taskName,
        'Setor': sector?.name || r.sectorId,
        'Horário Agendado': r.scheduledTime,
        'Horário Realizado': r.checkedTime,
        'Desvio (Minutos)': r.delayMinutes,
        'Status': r.status === 'DELAYED' ? 'Atrasado' : 'No Prazo',
        'Operador': r.userName,
        'Rubrica': r.userInitials,
        'Método': r.method === 'QR_CODE' ? 'QR Code' : 'Manual',
        'Observações': r.notes || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Auditoria_MultiModelos');
    XLSX.writeFile(wb, `Relatorio_Auditoria_HLB_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total de Registros</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalRecords}</div>
          <p className="text-[11px] text-slate-500 mt-1">Checks auditados no sistema</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Índice de Pontualidade</span>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {totalRecords > 0 ? Math.round((onTimeTotal / totalRecords) * 100) : 100}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{onTimeTotal} executados no prazo</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Checks com Atraso</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{delayedTotal}</div>
          <p className="text-[11px] text-slate-500 mt-1">Acima da tolerância de minutos</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Leitura via QR Code</span>
            <QrCode className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">{qrPercent}%</div>
          <p className="text-[11px] text-slate-500 mt-1">{qrCodeTotal} checks via câmera</p>
        </div>
      </div>

      {/* Operator Leaderboard */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-700" />
          <span>Desempenho por Operador Responsável</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {operatorMetrics.map(({ user, total, onTime, delayed, onTimePercent }) => (
            <div key={user.id} className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs ${user.avatarColor}`}>
                {user.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-slate-800 truncate">{user.name}</div>
                <div className="text-[10px] text-slate-500">{total} checks • {onTimePercent}% no prazo</div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${onTimePercent}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table Header & Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Trilha de Auditoria (GMP / Rastreabilidade)</h3>
            <p className="text-xs text-slate-500">Histórico completo de checagens com cruzamento de agendamento vs execução</p>
          </div>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Relatório Excel</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar atividade, operador..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Model Filter */}
          <select
            value={selectedControlId}
            onChange={(e) => setSelectedControlId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="ALL">Todos os Modelos de Controle</option>
            {controls.map(c => (
              <option key={c.id} value={c.id}>{c.docCode} - {c.title.substring(0, 25)}...</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="ALL">Todos os Status</option>
            <option value="ON_TIME">No Prazo</option>
            <option value="DELAYED">Atrasado</option>
          </select>

          <select
            value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="ALL">Todos os Operadores</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.initials})</option>
            ))}
          </select>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="p-3">Data / Hora Real</th>
                <th className="p-3">Modelo</th>
                <th className="p-3">Atividade / Local</th>
                <th className="p-3">Agendado</th>
                <th className="p-3">Cruzamento / Desvio</th>
                <th className="p-3">Status</th>
                <th className="p-3">Responsável</th>
                <th className="p-3">Método</th>
                <th className="p-3">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const ctrl = controls.find(c => c.id === rec.controlId);
                  const sector = ctrl?.sectors.find(s => s.id === rec.sectorId);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{rec.date}</div>
                        <div className="text-[10px] text-slate-500">{rec.checkedTime}</div>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <span className="font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                          {ctrl?.docCode || '—'}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-900">{rec.taskName}</div>
                        <div className="text-[10px] text-slate-500">
                          {sector?.name}
                        </div>
                      </td>

                      <td className="p-3 whitespace-nowrap font-mono font-bold text-slate-800">
                        {rec.scheduledTime}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <div className={`font-mono text-xs font-bold ${
                          rec.status === 'DELAYED' ? 'text-amber-700' : 'text-emerald-700'
                        }`}>
                          {rec.delayMinutes > 0 ? `+${rec.delayMinutes} min` : `${rec.delayMinutes} min`}
                        </div>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {rec.status === 'DELAYED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Atrasado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>No Prazo</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">[{rec.userInitials}]</span>
                          <span className="text-slate-600 text-[11px]">{rec.userName}</span>
                        </div>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {rec.method === 'QR_CODE' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            <QrCode className="w-3 h-3" />
                            <span>QR Code</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            <FileText className="w-3 h-3" />
                            <span>Manual</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-[11px] text-slate-500 max-w-xs truncate">
                        {rec.notes || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
