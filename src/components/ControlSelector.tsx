import React, { useState } from 'react';
import type { DocumentControl } from '../types';
import { 
  FileText, 
  ChevronDown, 
  Plus, 
  Copy, 
  Edit3, 
  Trash2, 
  Search, 
  Check, 
  Sparkles,
  Layers
} from 'lucide-react';

interface ControlSelectorProps {
  controls: DocumentControl[];
  activeControl: DocumentControl;
  onSelectControl: (control: DocumentControl) => void;
  onOpenCreateControl: () => void;
  onOpenEditControl: (control: DocumentControl) => void;
  onDuplicateControl: (controlId: string) => void;
  onDeleteControl: (controlId: string) => void;
}

export const ControlSelector: React.FC<ControlSelectorProps> = ({
  controls,
  activeControl,
  onSelectControl,
  onOpenCreateControl,
  onOpenEditControl,
  onDuplicateControl,
  onDeleteControl
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredControls = controls.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.docCode.toLowerCase().includes(q) ||
      c.popRef.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative">
      {/* Selector Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300/80 rounded-xl transition-all text-left group"
        title="Alternar entre Modelos de Anexo Controlado"
      >
        <div className="p-1.5 bg-emerald-700 text-white rounded-lg shadow-xs group-hover:scale-105 transition-transform">
          <Layers className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 max-w-[200px] sm:max-w-[280px] lg:max-w-[340px]">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-[10px] text-emerald-800 bg-emerald-200/70 px-1.5 py-0.2 rounded border border-emerald-300">
              {activeControl.docCode}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {activeControl.tasks.length} atividades
            </span>
          </div>
          <div className="font-extrabold text-xs text-slate-900 truncate leading-tight mt-0.5">
            {activeControl.title}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-emerald-700 shrink-0 ml-1 transition-transform group-hover:translate-y-0.5" />
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="fixed inset-0 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 z-50 flex items-center justify-center sm:block p-4 sm:p-0 bg-slate-900/40 sm:bg-transparent">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md sm:w-96 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-top-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs uppercase tracking-wider">Modelos de Anexo Controlado</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
              >
                Fechar
              </button>
            </div>

            {/* Search & Actions Bar */}
            <div className="p-3 border-b border-slate-100 bg-slate-50 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filtrar por nome, código ou POP..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenCreateControl();
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Novo Modelo de Controle</span>
              </button>
            </div>

            {/* Controls List */}
            <div className="overflow-y-auto divide-y divide-slate-100 max-h-72 p-1">
              {filteredControls.map((ctrl) => {
                const isActive = ctrl.id === activeControl.id;

                return (
                  <div
                    key={ctrl.id}
                    className={`p-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-emerald-50/90 border border-emerald-300' 
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div 
                        onClick={() => {
                          onSelectControl(ctrl);
                          setIsOpen(false);
                        }}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono font-bold text-[10px] bg-white text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                            {ctrl.docCode}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {ctrl.revision} • {ctrl.popRef}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                          {ctrl.title}
                        </h4>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                          <span>{ctrl.sectors.length} Setores</span>
                          <span>• {ctrl.tasks.length} Atividades / Colunas</span>
                        </div>
                      </div>

                      {/* Right Options */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isActive && (
                          <span className="p-1 text-emerald-600 font-bold" title="Modelo Ativo">
                            <Check className="w-4 h-4" />
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onOpenEditControl(ctrl);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors"
                          title="Editar Colunas e Metadados"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            onDuplicateControl(ctrl.id);
                            setIsOpen(false);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                          title="Duplicar este Modelo"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {controls.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Deseja realmente excluir o modelo "${ctrl.title}"?`)) {
                                onDeleteControl(ctrl.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                            title="Excluir Modelo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
