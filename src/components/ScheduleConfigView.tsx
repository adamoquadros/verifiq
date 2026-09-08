import React, { useState } from 'react';
import type { DocumentControl, UserOperator, TaskItem, Company } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Users, 
  Layers, 
  Check, 
  X,
  FileText,
  Copy,
  Building2
} from 'lucide-react';

interface ScheduleConfigViewProps {
  company: Company;
  controls: DocumentControl[];
  activeControl: DocumentControl;
  onSelectControl: (control: DocumentControl) => void;
  onSaveControl: (control: DocumentControl) => void;
  onDuplicateControl: (controlId: string) => void;
  onDeleteControl: (controlId: string) => void;
  onOpenCreateControl: () => void;
  users: UserOperator[];
  onUpdateUsers: (users: UserOperator[]) => void;
  onOpenUserManagement?: () => void;
}

export const ScheduleConfigView: React.FC<ScheduleConfigViewProps> = ({
  company,
  controls,
  activeControl,
  onSelectControl,
  onSaveControl,
  onDuplicateControl,
  onDeleteControl,
  onOpenCreateControl,
  users,
  onUpdateUsers,
  onOpenUserManagement
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'models' | 'tasks' | 'users' | 'metadata'>('models');
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isAddingNewTask, setIsAddingNewTask] = useState(false);

  // Task Form State
  const [taskForm, setTaskForm] = useState<Partial<TaskItem>>({
    code: '',
    name: '',
    sectorId: activeControl?.sectors[0]?.id || '',
    recurrence: 'DAILY',
    scheduledTime: '08:00',
    toleranceMinutes: 30,
    popRef: activeControl?.popRef,
    description: '',
    daysOfWeek: [1, 2, 3, 4, 5],
    active: true
  });

  // Metadata Form State
  const [metaForm, setMetaForm] = useState<DocumentControl>({ ...activeControl });

  React.useEffect(() => {
    if (activeControl) {
      setMetaForm({ ...activeControl });
    }
  }, [activeControl]);

  // Open Edit Task
  const handleEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setTaskForm({ ...task });
    setIsAddingNewTask(false);
  };

  // Open Add New Task
  const handleAddNewTask = () => {
    setEditingTask(null);
    setTaskForm({
      id: `task-${Date.now()}`,
      code: `ITEM-${activeControl.tasks.length + 1}`,
      name: '',
      sectorId: activeControl.sectors[0]?.id || '',
      recurrence: 'DAILY',
      scheduledTime: '08:30',
      toleranceMinutes: 30,
      popRef: activeControl.popRef,
      description: '',
      daysOfWeek: [1, 2, 3, 4, 5],
      qrPayload: `HLB-CHECK:${company.id}:${activeControl.id}:ITEM-${activeControl.tasks.length + 1}:CUSTOM`,
      active: true
    });
    setIsAddingNewTask(true);
  };

  // Save Task to Active Control
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.name || !taskForm.code) return;

    let updatedTasks: TaskItem[];

    const hasSchedule = taskForm.hasScheduledTime !== false;

    if (isAddingNewTask) {
      const newTask: TaskItem = {
        id: taskForm.id || `task-${Date.now()}`,
        code: taskForm.code!,
        name: taskForm.name!,
        sectorId: taskForm.sectorId || activeControl.sectors[0].id,
        recurrence: taskForm.recurrence || 'DAILY',
        hasScheduledTime: hasSchedule,
        scheduledTime: hasSchedule ? (taskForm.scheduledTime || '08:00') : undefined,
        toleranceMinutes: hasSchedule ? (Number(taskForm.toleranceMinutes) || 30) : 0,
        popRef: taskForm.popRef || activeControl.popRef,
        description: taskForm.description,
        daysOfWeek: taskForm.daysOfWeek || [1, 2, 3, 4, 5],
        qrPayload: `HLB-CHECK:${company.id}:${activeControl.id}:${taskForm.code}:${taskForm.name.toUpperCase().replace(/\s+/g, '_')}`,
        active: true
      };
      updatedTasks = [...activeControl.tasks, newTask];
    } else if (editingTask) {
      updatedTasks = activeControl.tasks.map(t => t.id === editingTask.id ? ({
        ...t,
        ...taskForm,
        hasScheduledTime: hasSchedule,
        scheduledTime: hasSchedule ? (taskForm.scheduledTime || t.scheduledTime || '08:00') : undefined,
        toleranceMinutes: hasSchedule ? (Number(taskForm.toleranceMinutes) || 30) : 0
      } as TaskItem) : t);
    } else {
      return;
    }

    const updatedControl: DocumentControl = {
      ...activeControl,
      tasks: updatedTasks
    };

    onSaveControl(updatedControl);
    setEditingTask(null);
    setIsAddingNewTask(false);
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    if (confirm('Deseja realmente remover esta atividade do modelo?')) {
      const updatedControl: DocumentControl = {
        ...activeControl,
        tasks: activeControl.tasks.filter(t => t.id !== taskId)
      };
      onSaveControl(updatedControl);
    }
  };

  // Toggle Task Active
  const handleToggleTaskActive = (taskId: string) => {
    const updatedControl: DocumentControl = {
      ...activeControl,
      tasks: activeControl.tasks.map(t => t.id === taskId ? { ...t, active: !t.active } : t)
    };
    onSaveControl(updatedControl);
  };

  // Save Metadata
  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveControl(metaForm);
    alert('Configurações do Documento Controlado atualizadas com sucesso!');
  };

  if (!activeControl) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <p className="font-bold text-slate-700">Nenhum modelo de controle selecionado para esta empresa.</p>
        <button
          onClick={onOpenCreateControl}
          className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Criar Primeiro Modelo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveSubTab('models')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'models'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Modelos da Empresa ({controls.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'tasks'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Colunas do Modelo Ativo ({activeControl.tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'users'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Operadores & Responsáveis ({users.length})</span>
        </button>

        <button
          onClick={() => {
            setMetaForm({ ...activeControl });
            setActiveSubTab('metadata');
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'metadata'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Edit2 className="w-4 h-4" />
          <span>Cabeçalho do Modelo Ativo</span>
        </button>
      </div>

      {/* SUBTAB 1: ALL CONTROLS OF ACTIVE COMPANY */}
      {activeSubTab === 'models' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Gerencie os anexos controlados da empresa <strong>{company.name}</strong>, clone modelos ou crie novos.
            </p>
            <button
              onClick={onOpenCreateControl}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Modelo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {controls.map((ctrl) => {
              const isActive = ctrl.id === activeControl.id;

              return (
                <div
                  key={ctrl.id}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-xs ${
                    isActive 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-xl border border-slate-200">
                        {ctrl.docCode}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {ctrl.revision} • {ctrl.popRef}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug mb-3">
                      {ctrl.title}
                    </h4>

                    <div className="text-xs text-slate-500 space-y-1 mb-4">
                      <div>📁 <strong>{ctrl.sectors.length}</strong> Setores / Áreas</div>
                      <div>📋 <strong>{ctrl.tasks.length}</strong> Atividades / Colunas</div>
                      <div>📅 Emissão: {ctrl.emissionDate}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {isActive ? (
                      <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Modelo Ativo</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onSelectControl(ctrl)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-700 hover:text-white text-slate-700 font-bold text-xs rounded-xl transition-colors"
                      >
                        Ativar este Modelo
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDuplicateControl(ctrl.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Duplicar Modelo"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {controls.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Deseja realmente excluir o modelo "${ctrl.title}"?`)) {
                              onDeleteControl(ctrl.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Excluir Modelo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: TASKS & COLUMNS */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Editando colunas de: <strong>{activeControl.docCode} ({activeControl.title})</strong>
            </p>
            <button
              onClick={handleAddNewTask}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Coluna / Atividade</span>
            </button>
          </div>

          {/* Form */}
          {(isAddingNewTask || editingTask) && (
            <form onSubmit={handleSaveTask} className="bg-white rounded-2xl p-5 border-2 border-emerald-500 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-sm text-slate-900">
                  {isAddingNewTask ? '➕ Cadastrar Nova Coluna' : '✏️ Editar Coluna'}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewTask(false);
                    setEditingTask(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Código Identificador:</label>
                  <input
                    type="text"
                    required
                    value={taskForm.code || ''}
                    onChange={(e) => setTaskForm({ ...taskForm, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: ALM-09"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">Nome da Atividade / Ponto Físico:</label>
                  <input
                    type="text"
                    required
                    value={taskForm.name || ''}
                    onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                    placeholder="Ex: Sanitização das Esteiras"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Setor na Matriz:</label>
                  <select
                    value={taskForm.sectorId || activeControl.sectors[0]?.id}
                    onChange={(e) => setTaskForm({ ...taskForm, sectorId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                  >
                    {activeControl.sectors.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Recorrência:</label>
                  <select
                    value={taskForm.recurrence || 'DAILY'}
                    onChange={(e) => setTaskForm({ ...taskForm, recurrence: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="DAILY">Diário</option>
                    <option value="WEEKLY">Semanal (Dias específicos)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Programação de Horário:</span>
                    <span className="text-[11px] text-slate-500">
                      {taskForm.hasScheduledTime !== false 
                        ? 'Ativado: atividade possui horário fixo e controle de tolerância.' 
                        : 'Desativado: atividade opera como Apenas Conferência (sem horário nos QR-Codes).'}
                    </span>
                  </div>
                  <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setTaskForm({ ...taskForm, hasScheduledTime: true, scheduledTime: taskForm.scheduledTime || '08:00' })}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        taskForm.hasScheduledTime !== false ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Com Horário
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskForm({ ...taskForm, hasScheduledTime: false, scheduledTime: '' })}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        taskForm.hasScheduledTime === false ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Apenas Conferência
                    </button>
                  </div>
                </div>

                {taskForm.hasScheduledTime !== false && (
                  <>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Horário Agendado Alvo:</label>
                      <input
                        type="time"
                        required
                        value={taskForm.scheduledTime || '08:00'}
                        onChange={(e) => setTaskForm({ ...taskForm, scheduledTime: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Janela de Tolerância (Minutos):</label>
                      <input
                        type="number"
                        min={5}
                        max={240}
                        value={taskForm.toleranceMinutes || 30}
                        onChange={(e) => setTaskForm({ ...taskForm, toleranceMinutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">Referência POP:</label>
                  <input
                    type="text"
                    value={taskForm.popRef || ''}
                    onChange={(e) => setTaskForm({ ...taskForm, popRef: e.target.value })}
                    placeholder="Ex: HLB-POP-ENG-0048"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1 text-xs">Instruções / Descrição:</label>
                <textarea
                  rows={2}
                  value={taskForm.description || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Descreva brevemente o passo a passo..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewTask(false);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Coluna</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {activeControl.tasks.map((task) => {
                const sector = activeControl.sectors.find(s => s.id === task.sectorId);

                return (
                  <div key={task.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => handleToggleTaskActive(task.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                          task.active ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-slate-100 text-transparent'
                        }`}
                        title={task.active ? 'Atividade Ativa na Matriz' : 'Atividade Inativa'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-mono">
                            {task.code}
                          </span>
                          <span className="font-extrabold text-xs text-slate-900 truncate">
                            {task.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-3">
                          <span>Setor: {sector?.name}</span>
                          <span>🕒 {task.scheduledTime} (±{task.toleranceMinutes} min)</span>
                          <span>{task.recurrence === 'DAILY' ? 'Diário' : 'Semanal'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir"
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
      )}

      {/* SUBTAB 3: USERS CONFIGURATION */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Gerencie os operadores, perfis e credenciais de acesso cadastrados no sistema
            </p>
            {onOpenUserManagement && (
              <button
                onClick={onOpenUserManagement}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center gap-2 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar / Alterar Senhas & Contas</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {users.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl text-white font-bold text-base flex items-center justify-center shadow-xs ${u.avatarColor}`}>
                    {u.initials}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{u.name}</h4>
                    <p className="text-xs text-emerald-700 font-bold">👑 {u.role}</p>
                    <p className="text-[10px] font-mono text-slate-400">Matrícula: {u.badgeNumber}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Rubrica no Documento:</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    [{u.initials}]
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: METADATA */}
      {activeSubTab === 'metadata' && (
        <form onSubmit={handleSaveMetadata} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 max-w-2xl">
          <h3 className="font-extrabold text-sm text-slate-900">Personalizar Cabeçalho de: {activeControl.docCode}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nome da Empresa:</label>
              <input
                type="text"
                value={metaForm.companyName}
                onChange={(e) => setMetaForm({ ...metaForm, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Tipo de Documento:</label>
              <input
                type="text"
                value={metaForm.documentType}
                onChange={(e) => setMetaForm({ ...metaForm, documentType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Código do Documento:</label>
              <input
                type="text"
                value={metaForm.docCode}
                onChange={(e) => setMetaForm({ ...metaForm, docCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Revisão:</label>
              <input
                type="text"
                value={metaForm.revision}
                onChange={(e) => setMetaForm({ ...metaForm, revision: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Título Oficial do Registro:</label>
              <input
                type="text"
                value={metaForm.title}
                onChange={(e) => setMetaForm({ ...metaForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Referência POP:</label>
              <input
                type="text"
                value={metaForm.popRef}
                onChange={(e) => setMetaForm({ ...metaForm, popRef: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Data de Emissão Original:</label>
              <input
                type="text"
                value={metaForm.emissionDate}
                onChange={(e) => setMetaForm({ ...metaForm, emissionDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Texto de Confidencialidade (Rodapé):</label>
              <input
                type="text"
                value={metaForm.confidentialText}
                onChange={(e) => setMetaForm({ ...metaForm, confidentialText: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs block">
                  Exibir horários programados nas colunas
                </span>
                <p className="text-[11px] text-slate-500">
                  Quando desmarcado, os horários (ex: 🕒 08:00) não serão exibidos abaixo do nome das colunas.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  checked={metaForm.showColumnTimes !== false}
                  onChange={(e) => setMetaForm({ ...metaForm, showColumnTimes: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Informações do Modelo</span>
          </button>
        </form>
      )}
    </div>
  );
};
