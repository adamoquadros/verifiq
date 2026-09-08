import React, { useState } from 'react';
import type { TaskItem, CheckRecord, UserOperator, DocumentControl } from '../types';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  User, 
  QrCode, 
  AlertTriangle, 
  Trash2, 
  FileText,
  Check,
  Layers
} from 'lucide-react';
import { calculateScheduleDifference } from '../utils/qrcode';

interface CheckDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: number;
  month: number;
  year: number;
  control: DocumentControl;
  task: TaskItem;
  record?: CheckRecord;
  scheduledTime?: string;
  activeUser: UserOperator;
  users: UserOperator[];
  onSaveCheck: (record: Omit<CheckRecord, 'id'>) => void;
  onDeleteCheck?: (recordId: string) => void;
}

export const CheckDetailModal: React.FC<CheckDetailModalProps> = ({
  isOpen,
  onClose,
  day,
  month,
  year,
  control,
  task,
  record,
  scheduledTime,
  activeUser,
  users,
  onSaveCheck,
  onDeleteCheck
}) => {
  const [selectedUserId, setSelectedUserId] = useState(record?.userId || activeUser.id);
  const [customTime, setCustomTime] = useState(
    record?.checkedTime || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
  const [notes, setNotes] = useState(record?.notes || '');
  const [method, setMethod] = useState<'QR_CODE' | 'MANUAL'>(record?.method || 'MANUAL');

  React.useEffect(() => {
    if (isOpen) {
      setSelectedUserId(record?.userId || activeUser.id);
      setCustomTime(
        record?.checkedTime || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
      setNotes(record?.notes || '');
      setMethod(record?.method || 'MANUAL');
    }
  }, [isOpen, record, activeUser]);

  if (!isOpen) return null;

  const effectiveScheduledTime = scheduledTime || record?.scheduledTime || (task.hasScheduledTime !== false ? task.scheduledTime : undefined);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleSave = () => {
    const selectedUser = users.find(u => u.id === selectedUserId) || activeUser;
    
    const padDay = String(day).padStart(2, '0');
    const padMonth = String(month).padStart(2, '0');
    const dateStr = `${year}-${padMonth}-${padDay}`;
    const [hours, mins] = customTime.split(':').map(Number);
    
    const checkDateTime = new Date(year, month - 1, day, hours, mins, 0);
    const diff = calculateScheduleDifference(effectiveScheduledTime, checkDateTime, task.toleranceMinutes);

    const targetCompanyId = control.companyId || (activeUser as any)?.companyId || 'comp-herbarium';

    onSaveCheck({
      companyId: targetCompanyId,
      controlId: control.id,
      taskId: task.id,
      taskName: task.name,
      sectorId: task.sectorId,
      date: dateStr,
      dayNumber: day,
      month,
      year,
      scheduledTime: effectiveScheduledTime,
      checkedAt: checkDateTime.toISOString(),
      checkedTime: customTime,
      userId: selectedUser.id,
      userName: selectedUser.name,
      userInitials: selectedUser.initials,
      status: diff.status,
      delayMinutes: diff.delayMinutes,
      method,
      notes: notes.trim() || undefined,
      locationValidation: true
    });

    onClose();
  };

  const handleDelete = () => {
    if (record && onDeleteCheck) {
      if (confirm('Deseja realmente remover o registro de check desta atividade?')) {
        onDeleteCheck(record.id);
        onClose();
      }
    }
  };

  const sector = control.sectors.find(s => s.id === task.sectorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${record ? 'bg-emerald-600' : 'bg-blue-600'}`}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Registro de Limpeza & Check</h3>
              <p className="text-[11px] text-slate-300">
                Dia {day} de {monthNames[month - 1]} de {year}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Document & Task Info Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                {control.docCode} • {task.code}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">{sector?.name}</span>
            </div>
            <div className="font-bold text-sm text-slate-900">{task.name}</div>
            <div className="text-[10px] text-slate-400">{control.title} ({control.popRef})</div>
          </div>

          {/* Details / Form */}
          <div className="space-y-3">
            {/* Operator Selection */}
            <div>
              <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Responsável pela Execução:</span>
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.initials}) - {u.role} (Mat: {u.badgeNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Time crossing comparison */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="text-slate-500 font-medium text-[10px] flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Horário Programado:</span>
                </div>
                <div className="font-extrabold text-sm text-slate-800">{effectiveScheduledTime}</div>
                <div className="text-[9px] text-slate-400">Tolerância: ±{task.toleranceMinutes} min</div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>Hora da Execução:</span>
                </label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Method selection */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Método de Validação:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('QR_CODE')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    method === 'QR_CODE'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code no Local</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('MANUAL')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    method === 'MANUAL'
                      ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Registro Manual</span>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Observações / Relato do Operador:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Opcional: insira observações da limpeza..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Record status if already created */}
            {record && (
              <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                record.status === 'DELAYED'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}>
                <div className="flex items-center gap-1.5">
                  {record.status === 'DELAYED' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  <span className="font-bold">
                    {record.status === 'DELAYED' ? `Atrasado (${record.delayMinutes} min)` : 'No Prazo'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-600">
                  Rubrica no doc: [{record.userInitials}]
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            {record && onDeleteCheck && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
                title="Excluir Registro"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{record ? 'Salvar Alterações' : 'Gravar Check'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
