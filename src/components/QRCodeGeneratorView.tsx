import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { DocumentControl, Company } from '../types';
import { Printer, Search, QrCode, Layers, Check } from 'lucide-react';

interface QRCodeGeneratorViewProps {
  company: Company;
  controls?: DocumentControl[];
  activeControl: DocumentControl;
}

export const QRCodeGeneratorView: React.FC<QRCodeGeneratorViewProps> = ({
  company,
  activeControl
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = activeControl.tasks.filter(task => {
    if (selectedSector !== 'ALL' && task.sectorId !== selectedSector) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return task.name.toLowerCase().includes(q) || task.code.toLowerCase().includes(q);
    }
    return true;
  });

  const handlePrintLabels = () => {
    window.print();
  };

  // O QR impresso precisa ser útil para QUALQUER câmera (não só o scanner interno
  // do app): por isso ele carrega uma URL real do app com o payload interno como
  // parâmetro. Ao ser apontado, abre o VerifIQ direto na tela de check daquela
  // atividade (ver handler de deep-link em App.tsx). Usa window.location.origin
  // para funcionar automaticamente em qualquer domínio/ambiente de implantação.
  const buildCheckUrl = (task: { qrPayload: string }) => {
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?check=${encodeURIComponent(task.qrPayload)}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Non-printed) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 rounded-2xl text-emerald-800">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Gerador de Etiquetas QR Code</h2>
              <p className="text-xs text-slate-500">
                Imprima as etiquetas físicas da empresa <strong>{company.name}</strong> para fixação nos postos de checagem
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintLabels}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Folha de Etiquetas</span>
          </button>
        </div>
      </div>

      {/* Active Document Indicator (Synced with global top bar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs gap-2 no-print">
        <div className="flex items-center gap-2 text-emerald-900">
          <Layers className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Documento Ativo: <strong>{activeControl.docCode}</strong> — {activeControl.title}</span>
        </div>
        <div className="text-[11px] font-semibold text-emerald-700 bg-white/70 px-2.5 py-1 rounded-xl border border-emerald-200 self-start sm:self-auto">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'etiqueta gerada' : 'etiquetas geradas'}
        </div>
      </div>

      {/* Filter by Sector & Search (Non-printed) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        {/* Sector Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedSector('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              selectedSector === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todos os Setores ({activeControl.tasks.length})
          </button>
          {activeControl.sectors.map(sec => {
            const count = activeControl.tasks.filter(t => t.sectorId === sec.id).length;
            if (count === 0) return null;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSector(sec.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  selectedSector === sec.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {sec.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por nome ou código..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid of Printable QR Code Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print:grid-cols-2 print:gap-6">
        {filteredTasks.map((task) => {
          const sector = activeControl.sectors.find(s => s.id === task.sectorId);
          const hasSchedule = task.hasScheduledTime !== false && !!task.scheduledTime;

          return (
            <div
              key={task.id}
              className="bg-white rounded-2xl border-2 border-slate-800 p-4 flex flex-col justify-between shadow-xs print:shadow-none print:break-inside-avoid page-break-inside-avoid text-center relative overflow-hidden"
            >
              {/* Badge Header with Company Logo and Code */}
              <div className="border-b border-slate-300 pb-2 mb-3">
                <div className="flex items-center justify-between min-h-[30px]">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} className="max-h-6 max-w-[100px] object-contain" />
                  ) : (
                    <span className="text-sm font-serif text-emerald-800 font-bold tracking-tight">
                      {company.name}
                    </span>
                  )}
                  <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300">
                    {task.code}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                  {activeControl.docCode} • {sector?.name}
                </div>
              </div>

              {/* QR Code Graphic */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 inline-block mx-auto my-1 shadow-inner">
                <QRCodeSVG
                  value={buildCheckUrl(task)}
                  size={140}
                  level="H"
                  includeMargin={true}
                  className="mx-auto"
                />
              </div>

              {/* Task Name & Instructions */}
              <div className="mt-3 border-t border-slate-300 pt-2 space-y-1">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                  {task.name}
                </h4>
                {hasSchedule ? (
                  <div className="text-[10px] text-emerald-800 font-semibold flex items-center justify-center gap-1">
                    <span>
                      🕒 Agendamento: {task.scheduledTimes && task.scheduledTimes.length > 1 ? task.scheduledTimes.join(' / ') : task.scheduledTime}
                    </span>
                  </div>
                ) : (
                  <div className="text-[10px] text-blue-700 font-semibold flex items-center justify-center gap-1">
                    <Check className="w-3 h-3 text-blue-600" />
                    <span>Modo: Apenas Conferência</span>
                  </div>
                )}
                <p className="text-[9px] text-slate-500 font-medium italic">
                  Aponte a câmera do celular (ou o scanner do app) para registrar o check
                </p>
              </div>

              {/* Payload Hash */}
              <div className="mt-1 text-[8px] font-mono text-slate-400 truncate">
                {task.qrPayload}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
