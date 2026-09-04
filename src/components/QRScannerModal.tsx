import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import type { TaskItem, UserOperator, CheckRecord, DocumentControl } from '../types';
import { calculateScheduleDifference, parseMultiControlQRPayload } from '../utils/qrcode';
import { X, Camera, CheckCircle2, Clock, AlertTriangle, Sparkles, QrCode, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  controls: DocumentControl[];
  activeControl: DocumentControl;
  activeUser: UserOperator;
  onConfirmCheck: (record: Omit<CheckRecord, 'id'>) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  controls,
  activeControl,
  activeUser,
  onConfirmCheck
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<{
    control: DocumentControl;
    task: TaskItem;
  } | null>(null);
  const [validationResult, setValidationResult] = useState<{
    delayMinutes: number;
    status: CheckRecord['status'];
    formattedDiff: string;
  } | null>(null);
  const [notes, setNotes] = useState('');

  const qrReaderRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  useEffect(() => {
    if (isOpen) {
      setScannedResult(null);
      setValidationResult(null);
      setCameraError(null);
      setNotes('');
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);

      setTimeout(async () => {
        try {
          const html5QrCode = new Html5Qrcode(scannerContainerId);
          qrReaderRef.current = html5QrCode;

          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          };

          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              handleDecodedText(decodedText);
            },
            () => {}
          );
        } catch (err: any) {
          console.warn('Camera start error:', err);
          setCameraError('Câmera indisponível ou permissão negada. Você pode usar a simulação rápida abaixo.');
        }
      }, 300);
    } catch (err: any) {
      setCameraError('Não foi possível iniciar a câmera.');
    }
  };

  const stopCamera = async () => {
    if (qrReaderRef.current) {
      try {
        if (qrReaderRef.current.isScanning) {
          await qrReaderRef.current.stop();
        }
        qrReaderRef.current.clear();
      } catch (e) {
        console.warn('Stop camera error:', e);
      }
      qrReaderRef.current = null;
    }
  };

  const handleDecodedText = (decodedText: string) => {
    const result = parseMultiControlQRPayload(decodedText, controls);
    if (result) {
      stopCamera();
      processSelection(result.control, result.task);
    } else {
      alert(`QR Code lido ("${decodedText}"), mas não corresponde a nenhuma atividade cadastrada.`);
    }
  };

  const processSelection = (ctrl: DocumentControl, task: TaskItem) => {
    const now = new Date();
    const diff = calculateScheduleDifference(task.scheduledTime, now, task.toleranceMinutes);
    setScannedResult({ control: ctrl, task });
    setValidationResult(diff);
  };

  const handleConfirm = () => {
    if (!scannedResult || !validationResult) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    
    const padDay = String(currentDay).padStart(2, '0');
    const padMonth = String(currentMonth).padStart(2, '0');
    const dateStr = `${currentYear}-${padMonth}-${padDay}`;
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const checkedTime = `${hours}:${mins}`;

    onConfirmCheck({
      companyId: scannedResult.control.companyId,
      controlId: scannedResult.control.id,
      taskId: scannedResult.task.id,
      taskName: scannedResult.task.name,
      sectorId: scannedResult.task.sectorId,
      date: dateStr,
      dayNumber: currentDay,
      month: currentMonth,
      year: currentYear,
      scheduledTime: scannedResult.task.scheduledTime,
      checkedAt: now.toISOString(),
      checkedTime,
      userId: activeUser.id,
      userName: activeUser.name,
      userInitials: activeUser.initials,
      status: validationResult.status,
      delayMinutes: validationResult.delayMinutes,
      method: 'QR_CODE',
      notes: notes.trim() || undefined,
      locationValidation: true
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Camera className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Check Rápido via QR Code</h3>
              <p className="text-xs text-emerald-100/80">Reconhece automaticamente o modelo e atividade</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Operator Badge */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Operador Autenticado:</span>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${activeUser.avatarColor}`}>
                {activeUser.initials}
              </div>
              <span className="font-bold text-slate-800">{activeUser.name}</span>
            </div>
          </div>

          {!scannedResult ? (
            <>
              {/* Camera Scanner Viewport */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-h-72 mx-auto flex items-center justify-center border-2 border-emerald-500 shadow-inner">
                <div id={scannerContainerId} className="w-full h-full" />
                
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 p-6 flex flex-col items-center justify-center text-center text-white space-y-3">
                    <AlertTriangle className="w-10 h-10 text-amber-400" />
                    <p className="text-xs text-slate-300">{cameraError}</p>
                  </div>
                )}
              </div>

              {/* Simulation Quick Launcher */}
              <div className="bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Simular Leitura do Modelo Ativo ({activeControl.docCode})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {activeControl.tasks.slice(0, 6).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => processSelection(activeControl, task)}
                      className="text-left px-2.5 py-1.5 bg-white hover:bg-emerald-100/70 border border-emerald-200 rounded-xl text-[11px] font-medium text-slate-800 truncate transition-colors flex items-center gap-1.5"
                    >
                      <QrCode className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{task.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Scanned Task Confirmation Card */
            <div className="space-y-4 animate-in fade-in zoom-in-95">
              <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl p-4 text-center space-y-2">
                <div className="inline-flex p-2 bg-emerald-600 text-white rounded-full shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-200/80 rounded-full text-[10px] font-bold text-emerald-900 mx-auto">
                  <Layers className="w-3 h-3" />
                  <span>{scannedResult.control.docCode} • {scannedResult.control.title}</span>
                </div>

                <h4 className="text-base font-black text-emerald-950">{scannedResult.task.name}</h4>
                <div className="text-xs font-semibold text-emerald-800">
                  Código: {scannedResult.task.code} • {scannedResult.task.popRef}
                </div>
              </div>

              {/* Schedule Crossing Result */}
              {validationResult && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-400 font-medium mb-1">Horário Agendado</div>
                    <div className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{scannedResult.task.scheduledTime}</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${
                    validationResult.status === 'DELAYED'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  }`}>
                    <div className="font-medium mb-1">Horário da Execução</div>
                    <div className="text-base font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-[10px] font-semibold mt-1">
                      {validationResult.formattedDiff}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Observações / Relato do Operador (Opcional):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Ponto higienizado conforme procedimento padrão"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setScannedResult(null);
                    setValidationResult(null);
                    startCamera();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Voltar / Ler Outro
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Check</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
