import React, { useState } from 'react';
import type { DocumentControl, Sector, TaskItem, RecurrenceType } from '../types';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Layers, 
  Clock, 
  Calendar, 
  FileText, 
  Check, 
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Edit3
} from 'lucide-react';

interface ControlBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialControl?: DocumentControl | null;
  onSaveControl: (control: DocumentControl) => void;
}

const getInitialControlState = (initial?: DocumentControl | null): DocumentControl => {
  if (initial) {
    const cloned = JSON.parse(JSON.stringify(initial));
    if (cloned.showColumnTimes === undefined) cloned.showColumnTimes = true;
    return cloned;
  }
  const newId = `ctrl-${Date.now()}`;
  return {
    id: newId,
    companyId: '',
    title: '',
    docCode: '',
    revision: 'Rv. 0',
    pageInfo: 'Pág: 1 de 1',
    popRef: 'Ref.: HLB-POP-ENG-0050',
    emissionDate: new Date().toLocaleDateString('pt-BR'),
    companyName: 'herbarium',
    documentType: 'ANEXO CONTROLADO',
    confidentialText: 'Documento confidencial e de propriedade HLB. Proibida sua reprodução total ou parcial.',
    sectors: [
      { id: `sec-1-${Date.now()}`, name: 'DIÁRIO - ÁREA PRINCIPAL', color: 'emerald' }
    ],
    tasks: [],
    showColumnTimes: true
  };
};

export const ControlBuilderModal: React.FC<ControlBuilderModalProps> = ({
  isOpen,
  onClose,
  initialControl,
  onSaveControl
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'sectors' | 'columns'>('info');

  // Working state for the control
  const [control, setControl] = useState<DocumentControl>(() => getInitialControlState(initialControl));

  // State for new sector (coluna mãe) form
  const [newSectorName, setNewSectorName] = useState('');

  // State for new column/task form
  const [newColName, setNewColName] = useState('');
  const [newColCode, setNewColCode] = useState('');
  const [newColSectorId, setNewColSectorId] = useState('');
  const [newColTimes, setNewColTimes] = useState<string[]>(['08:00']);
  const [singleTimeInput, setSingleTimeInput] = useState('14:00');
  const [newColTolerance, setNewColTolerance] = useState(30);
  const [newColRecurrence, setNewColRecurrence] = useState<RecurrenceType>('DAILY');
  const [newColDaysOfWeek, setNewColDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [newColHasSchedule, setNewColHasSchedule] = useState<boolean>(true);
  const [editingColId, setEditingColId] = useState<string | null>(null);

  // Reset state completely whenever modal opens or initialControl changes
  React.useEffect(() => {
    if (isOpen) {
      const fresh = getInitialControlState(initialControl);
      setControl(fresh);
      setActiveTab('info');
      setNewSectorName('');
      setNewColName('');
      setNewColCode('');
      setNewColSectorId(fresh.sectors[0]?.id || '');
      setNewColTimes(['08:00']);
      setSingleTimeInput('14:00');
      setNewColTolerance(30);
      setNewColRecurrence('DAILY');
      setNewColDaysOfWeek([1, 2, 3, 4, 5]);
      setNewColHasSchedule(true);
      setEditingColId(null);
    }
  }, [isOpen, initialControl]);

  if (!isOpen) return null;

  const handleAddTime = (timeToAdd: string) => {
    if (!timeToAdd) return;
    if (newColTimes.includes(timeToAdd)) {
      alert('Este horário já foi adicionado.');
      return;
    }
    setNewColTimes(prev => [...prev, timeToAdd].sort());
  };

  const handleRemoveTime = (timeToRemove: string) => {
    if (newColTimes.length <= 1) {
      alert('A atividade deve possuir pelo menos 1 horário de checagem.');
      return;
    }
    setNewColTimes(prev => prev.filter(t => t !== timeToRemove));
  };

  // Sector (Coluna mãe) actions
  const handleAddSector = () => {
    if (!newSectorName.trim()) return;
    const newSector: Sector = {
      id: `sec-${Date.now()}`,
      name: newSectorName.trim().toUpperCase(),
      color: 'emerald'
    };
    setControl(prev => ({
      ...prev,
      sectors: [...prev.sectors, newSector]
    }));
    setNewSectorName('');
    if (!newColSectorId) setNewColSectorId(newSector.id);
  };

  const handleDeleteSector = (sectorId: string) => {
    if (control.sectors.length <= 1) {
      alert('O modelo deve possuir pelo menos 1 coluna mãe.');
      return;
    }
    setControl(prev => ({
      ...prev,
      sectors: prev.sectors.filter(s => s.id !== sectorId),
      tasks: prev.tasks.filter(t => t.sectorId !== sectorId)
    }));
  };

  // Task / Column actions
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const code = newColCode.trim() || `ITEM-${control.tasks.length + 1}`;
    const sortedTimes = [...newColTimes].sort();
    const primaryTime = sortedTimes[0] || '08:00';

    if (editingColId) {
      // Atualizando coluna existente
      setControl(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => {
          if (t.id !== editingColId) return t;
          return {
            ...t,
            code,
            name: newColName.trim(),
            sectorId: newColSectorId || control.sectors[0].id,
            recurrence: newColRecurrence,
            daysOfWeek: newColRecurrence === 'WEEKLY' ? newColDaysOfWeek : undefined,
            hasScheduledTime: newColHasSchedule,
            scheduledTime: newColHasSchedule ? primaryTime : undefined,
            scheduledTimes: newColHasSchedule ? (sortedTimes.length > 0 ? sortedTimes : [primaryTime]) : undefined,
            toleranceMinutes: newColHasSchedule ? (Number(newColTolerance) || 30) : 0,
            qrPayload: `HLB-CHECK:${control.id}:${code}:${newColName.trim().toUpperCase().replace(/\s+/g, '_')}`
          };
        })
      }));
      setEditingColId(null);
    } else {
      // Inserindo nova coluna
      const newTask: TaskItem = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        code,
        name: newColName.trim(),
        sectorId: newColSectorId || control.sectors[0].id,
        recurrence: newColRecurrence,
        daysOfWeek: newColRecurrence === 'WEEKLY' ? newColDaysOfWeek : undefined,
        hasScheduledTime: newColHasSchedule,
        scheduledTime: newColHasSchedule ? primaryTime : undefined,
        scheduledTimes: newColHasSchedule ? (sortedTimes.length > 0 ? sortedTimes : [primaryTime]) : undefined,
        toleranceMinutes: newColHasSchedule ? (Number(newColTolerance) || 30) : 0,
        popRef: control.popRef,
        qrPayload: `HLB-CHECK:${control.id}:${code}:${newColName.trim().toUpperCase().replace(/\s+/g, '_')}`,
        active: true
      };

      setControl(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask]
      }));
    }

    setNewColName('');
    setNewColCode('');
    setNewColTimes(['08:00']);
    setNewColTolerance(30);
    setNewColRecurrence('DAILY');
    setNewColDaysOfWeek([1, 2, 3, 4, 5]);
    setNewColHasSchedule(true);
  };

  const handleStartEditColumn = (task: TaskItem) => {
    setEditingColId(task.id);
    setNewColName(task.name);
    setNewColCode(task.code);
    setNewColSectorId(task.sectorId);
    setNewColHasSchedule(task.hasScheduledTime !== false && !!task.scheduledTime);
    setNewColTimes(task.scheduledTimes && task.scheduledTimes.length > 0 ? [...task.scheduledTimes] : (task.scheduledTime ? [task.scheduledTime] : ['08:00']));
    setNewColTolerance(task.toleranceMinutes || 30);
    setNewColRecurrence(task.recurrence || 'DAILY');
    setNewColDaysOfWeek(task.daysOfWeek || [1, 2, 3, 4, 5]);

    const formElement = document.getElementById('col-builder-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleCancelEditColumn = () => {
    setEditingColId(null);
    setNewColName('');
    setNewColCode('');
    setNewColTimes(['08:00']);
    setNewColTolerance(30);
    setNewColRecurrence('DAILY');
    setNewColDaysOfWeek([1, 2, 3, 4, 5]);
    setNewColHasSchedule(true);
  };

  const handleToggleColumnSchedule = (taskId: string) => {
    setControl(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== taskId) return t;
        const willHaveSchedule = t.hasScheduledTime === false || !t.scheduledTime;
        return {
          ...t,
          hasScheduledTime: willHaveSchedule,
          scheduledTime: willHaveSchedule ? (t.scheduledTime || '08:00') : undefined,
          scheduledTimes: willHaveSchedule ? (t.scheduledTimes && t.scheduledTimes.length > 0 ? t.scheduledTimes : ['08:00']) : undefined,
          toleranceMinutes: willHaveSchedule ? (t.toleranceMinutes || 30) : 0
        };
      })
    }));
  };

  const handleDeleteColumn = (taskId: string) => {
    setControl(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  };

  const handleUpdateTaskField = (taskId: string, field: keyof TaskItem, value: any) => {
    setControl(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t)
    }));
  };

  // Final Save
  const handleFinalSave = () => {
    if (!control.title.trim() || !control.docCode.trim()) {
      alert('Por favor, preencha o Título e o Código do Documento.');
      return;
    }
    if (control.sectors.length === 0) {
      alert('Cadastre ao menos 1 coluna mãe.');
      return;
    }
    if (control.tasks.length === 0) {
      alert('Cadastre ao menos 1 coluna anexa / atividade no modelo.');
      return;
    }

    onSaveControl(control);
    // Reset state before closing
    setControl(getInitialControlState(null));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <Layers className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {initialControl ? 'Editar Modelo de Anexo Controlado' : 'Criar Novo Modelo de Anexo Controlado'}
              </h3>
              <p className="text-xs text-emerald-100/80">
                Configure os setores, colunas, horários agendados e metadados oficiais
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Steps / Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Informações & Cabeçalho</span>
          </button>

          <button
            onClick={() => setActiveTab('sectors')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'sectors'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Coluna mãe ({control.sectors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('columns')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'columns'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>3. Colunas & Horários ({control.tasks.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* TAB 1: METADATA */}
          {activeTab === 'info' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <p>
                  Estes dados compõem o <strong>cabeçalho oficial</strong> impresso na folha do documento (idêntico ao modelo da Herbarium).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Título Oficial do Registro:</label>
                  <input
                    type="text"
                    value={control.title}
                    onChange={(e) => setControl({ ...control, title: e.target.value.toUpperCase() })}
                    placeholder="Ex: REGISTRO DE LIMPEZA ALMOXARIFADO E PRODUÇÃO MÓDULO 3"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código do Documento (Anexo):</label>
                  <input
                    type="text"
                    value={control.docCode}
                    onChange={(e) => setControl({ ...control, docCode: e.target.value.toUpperCase() })}
                    placeholder="Ex: HLB-ANX-0025"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Revisão:</label>
                  <input
                    type="text"
                    value={control.revision}
                    onChange={(e) => setControl({ ...control, revision: e.target.value })}
                    placeholder="Ex: Rv. 2"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Referência POP:</label>
                  <input
                    type="text"
                    value={control.popRef}
                    onChange={(e) => setControl({ ...control, popRef: e.target.value })}
                    placeholder="Ex: Ref.: HLB-POP-ENG-0048"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Emissão:</label>
                  <input
                    type="text"
                    value={control.emissionDate}
                    onChange={(e) => setControl({ ...control, emissionDate: e.target.value })}
                    placeholder="Ex: 10/05/2024"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Texto de Confidencialidade (Rodapé):</label>
                  <input
                    type="text"
                    value={control.confidentialText}
                    onChange={(e) => setControl({ ...control, confidentialText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                        Exibir horários programados nas colunas
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Quando ativado, exibe o horário (ex: 🕒 08:00) abaixo do nome de cada coluna. Desmarque para ocultar.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3">
                    <input
                      type="checkbox"
                      checked={control.showColumnTimes !== false}
                      onChange={(e) => setControl(prev => ({ ...prev, showColumnTimes: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECTORS (COLUNA MÃE) */}
          {activeTab === 'sectors' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900">Adicionar Nova Coluna Mãe (Setor / Agrupador Principal):</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSectorName}
                    onChange={(e) => setNewSectorName(e.target.value)}
                    placeholder="Ex: DIÁRIO - SALA LIMPA ou SEMANAL"
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSector}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              {/* Sectors List */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-700">Colunas Mãe Cadastradas neste Modelo:</h4>
                {control.sectors.map((sec, idx) => {
                  const countTasks = control.tasks.filter(t => t.sectorId === sec.id).length;

                  return (
                    <div
                      key={sec.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-extrabold text-xs text-slate-900">{sec.name}</span>
                          <span className="text-[10px] text-slate-500 ml-2">({countTasks} colunas anexas vinculadas)</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSector(sec.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remover Coluna Mãe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: COLUMNS & TASKS */}
          {activeTab === 'columns' && (
            <div className="space-y-5">
              {/* Add / Edit Column Form */}
              <form 
                id="col-builder-form" 
                onSubmit={handleAddColumn} 
                className={`p-4 rounded-2xl space-y-4 border-2 transition-all ${
                  editingColId 
                    ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/20' 
                    : 'bg-slate-50 border-emerald-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    {editingColId ? (
                      <>
                        <Edit3 className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-950 font-bold">
                          Editando Coluna: <span className="underline">{newColName || 'Sem Nome'}</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-emerald-600" />
                        <span>Adicionar Nova Coluna / Atividade ao Documento:</span>
                      </>
                    )}
                  </h4>

                  {editingColId && (
                    <button
                      type="button"
                      onClick={handleCancelEditColumn}
                      className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-colors"
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>

                {/* Per-column Schedule Toggle */}
                <div className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Clock className={`w-4 h-4 ${newColHasSchedule ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>Programação de Horário para esta Coluna:</span>
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {newColHasSchedule 
                        ? 'Ativado: atividade terá horário(s) agendado(s) e constará nos QR-Codes e cabeçalho.' 
                        : 'Desativado: atividade é apenas para conferência (sem horário programado e sem horário nos QR-Codes).'}
                    </span>
                  </div>

                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
                    <button
                      type="button"
                      onClick={() => setNewColHasSchedule(true)}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        newColHasSchedule ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Com Horário</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewColHasSchedule(false)}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        !newColHasSchedule ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apenas Conferência</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">Nome da Atividade / Local:</label>
                    <input
                      type="text"
                      required
                      value={newColName}
                      onChange={(e) => setNewColName(e.target.value)}
                      placeholder="Ex: Bebedouro, Piso Epóxi, SPY012..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Código Identificador:</label>
                    <input
                      type="text"
                      value={newColCode}
                      onChange={(e) => setNewColCode(e.target.value.toUpperCase())}
                      placeholder={`ITEM-${control.tasks.length + 1}`}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Coluna Mãe Pertencente:</label>
                    <select
                      value={newColSectorId || control.sectors[0]?.id}
                      onChange={(e) => setNewColSectorId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {control.sectors.map(sec => (
                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                      ))}
                    </select>
                  </div>

                  {newColHasSchedule ? (
                    <>
                      <div className="sm:col-span-2">
                        <label className="block font-medium text-slate-700 mb-1 flex items-center justify-between">
                          <span>Horários Diários de Checagem:</span>
                          <span className="text-[10px] text-slate-400 font-bold">({newColTimes.length} {newColTimes.length > 1 ? 'checagens/dia' : 'checagem/dia'})</span>
                        </label>

                        {/* Active Time Tags */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          {newColTimes.map(t => (
                            <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl font-mono font-bold text-xs">
                              <span>{t}</span>
                              {newColTimes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTime(t)}
                                  className="text-slate-400 hover:text-rose-600 ml-0.5 font-bold"
                                  title="Remover horário"
                                >
                                  ✕
                                </button>
                              )}
                            </span>
                          ))}
                        </div>

                        {/* Add time input + button & quick presets */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="time"
                            value={singleTimeInput}
                            onChange={(e) => setSingleTimeInput(e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddTime(singleTimeInput)}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs transition-colors"
                          >
                            + Adicionar Horário
                          </button>

                          <div className="flex items-center gap-1 ml-auto text-[10px]">
                            <span className="text-slate-400">Atalhos:</span>
                            <button
                              type="button"
                              onClick={() => setNewColTimes(['09:30', '14:00', '16:00'])}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg border border-slate-200 font-bold"
                              title="Modelo HLB-ANX-0003: 09:30, 14:00 e 16:00"
                            >
                              3x ao dia (09:30, 14:00, 16:00)
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewColTimes(['08:00'])}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg border border-slate-200 font-bold"
                            >
                              1x ao dia
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Tolerância (minutos):</label>
                        <input
                          type="number"
                          min={5}
                          max={240}
                          value={newColTolerance}
                          onChange={(e) => setNewColTolerance(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="sm:col-span-3 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                        <span className="font-bold block">Modo: Apenas Conferência (Sem Horário)</span>
                        <span className="text-[11px] text-blue-700">Esta atividade não exigirá horário fixo e os QR-Codes serão gerados sem programação de horário.</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Recorrência:</label>
                    <select
                      value={newColRecurrence}
                      onChange={(e) => setNewColRecurrence(e.target.value as RecurrenceType)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="DAILY">Diário (Todos os dias)</option>
                      <option value="WEEKLY">Semanal</option>
                      <option value="MONTHLY">Mensal</option>
                    </select>
                  </div>

                  <div className="flex items-end sm:col-span-4 pt-1">
                    <button
                      type="submit"
                      className={`w-full py-2.5 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all text-white ${
                        editingColId 
                          ? 'bg-amber-600 hover:bg-amber-700' 
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {editingColId ? (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Salvar Alterações da Coluna</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Inserir Coluna / Atividade</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Columns Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-700">Colunas da Grade ({control.tasks.length} colunas configuradas):</h4>
                
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <div className="divide-y divide-slate-100">
                    {control.tasks.map((task, idx) => {
                      const sector = control.sectors.find(s => s.id === task.sectorId);
                      const hasSchedule = task.hasScheduledTime !== false && !!task.scheduledTime;

                      return (
                        <div key={task.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="font-mono text-slate-400 font-bold text-[10px] w-5 text-center">
                              {idx + 1}
                            </span>
                            <span className="font-mono font-bold text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                              {task.code}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-900 truncate">{task.name}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-3 flex-wrap">
                                <span className="font-semibold text-emerald-800">{sector?.name}</span>
                                {hasSchedule ? (
                                  <span className="text-emerald-700 font-medium">
                                    🕒 Horários: {task.scheduledTimes && task.scheduledTimes.length > 1 
                                      ? `${task.scheduledTimes.join(', ')} (${task.scheduledTimes.length}x ao dia)` 
                                      : task.scheduledTime} (±{task.toleranceMinutes} min)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-800 rounded-full font-bold text-[9px] border border-blue-200">
                                    <Check className="w-2.5 h-2.5" />
                                    <span>Apenas Conferência (Sem Horário)</span>
                                  </span>
                                )}
                                <span>{task.recurrence === 'DAILY' ? 'Diário' : 'Semanal'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditColumn(task)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center gap-1 transition-colors"
                              title="Editar esta coluna e seus horários"
                            >
                              <Edit3 className="w-3 h-3 text-slate-500" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleColumnSchedule(task.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                                hasSchedule
                                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                              }`}
                              title={hasSchedule ? "Mudar para Apenas Conferência" : "Ativar Horário Programado"}
                            >
                              {hasSchedule ? 'Desativar Horário' : '+ Ativar Horário'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteColumn(task.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Excluir Coluna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeTab !== 'info' && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'columns' ? 'sectors' : 'info')}
                className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-white transition-colors"
              >
                Voltar
              </button>
            )}
            {activeTab !== 'columns' && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'info' ? 'sectors' : 'columns')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Próximo Passo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleFinalSave}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Modelo de Controle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
