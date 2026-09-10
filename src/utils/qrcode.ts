import type { CheckStatus, TaskItem, DocumentControl } from '../types';

export function calculateScheduleDifference(
  scheduledTimeStr?: string,
  actualDate: Date = new Date(),
  toleranceMinutes = 30
): {
  delayMinutes: number;
  status: CheckStatus;
  formattedDiff: string;
} {
  if (!scheduledTimeStr) {
    return {
      delayMinutes: 0,
      status: 'ON_TIME',
      formattedDiff: 'Conforme (Apenas Conferência)'
    };
  }

  const [schedHours, schedMins] = scheduledTimeStr.split(':').map(Number);
  
  const schedDate = new Date(actualDate);
  schedDate.setHours(schedHours, schedMins, 0, 0);

  const diffMs = actualDate.getTime() - schedDate.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  let status: CheckStatus = 'ON_TIME';
  let formattedDiff = 'No Horário';

  if (diffMinutes > toleranceMinutes) {
    status = 'DELAYED';
    formattedDiff = `Atrasado (+${diffMinutes} min)`;
  } else if (diffMinutes < -15) {
    status = 'EARLY';
    formattedDiff = `Adiantado (${Math.abs(diffMinutes)} min antes)`;
  } else if (diffMinutes > 0) {
    status = 'ON_TIME';
    formattedDiff = `No Prazo (+${diffMinutes} min)`;
  } else if (diffMinutes < 0) {
    status = 'ON_TIME';
    formattedDiff = `No Prazo (${Math.abs(diffMinutes)} min antes)`;
  } else {
    status = 'ON_TIME';
    formattedDiff = 'Exato no Horário (0 min)';
  }

  return {
    delayMinutes: diffMinutes,
    status,
    formattedDiff
  };
}

export interface QRScanResult {
  control: DocumentControl;
  task: TaskItem;
}

// Etiquetas impressas carregam uma URL completa (ex: https://app.../?check=HLB-CHECK:...)
// para que QUALQUER câmera (não só o scanner interno do app) consiga abrir o check.
// Extrai o payload interno de dentro do parâmetro "check" quando presente.
function extractPayloadFromUrl(raw: string): string {
  try {
    const url = new URL(raw);
    const fromQuery = url.searchParams.get('check');
    if (fromQuery) return fromQuery;
  } catch {
    // não é uma URL válida — segue tratando como payload cru
  }
  return raw;
}

export function parseMultiControlQRPayload(
  qrRaw: string,
  controls: DocumentControl[]
): QRScanResult | null {
  if (!qrRaw || !controls || controls.length === 0) return null;
  const clean = extractPayloadFromUrl(qrRaw.trim()).trim();

  // 1. Check if structured format: HLB-CHECK:CONTROL_ID:CODE:NAME
  if (clean.startsWith('HLB-CHECK:')) {
    const parts = clean.split(':');
    if (parts.length >= 3) {
      const targetCtrlId = parts[1];
      const targetCode = parts[2];

      const foundCtrl = controls.find(c => c.id === targetCtrlId || c.docCode.toLowerCase() === targetCtrlId.toLowerCase());
      if (foundCtrl) {
        const foundTask = foundCtrl.tasks.find(t => t.code.toLowerCase() === targetCode.toLowerCase() || t.qrPayload === clean);
        if (foundTask) return { control: foundCtrl, task: foundTask };
      }
    }
  }

  // 2. Search across all controls for matching qrPayload or code or task id
  for (const ctrl of controls) {
    // exact payload match
    const payloadMatch = ctrl.tasks.find(t => t.qrPayload.toLowerCase() === clean.toLowerCase());
    if (payloadMatch) return { control: ctrl, task: payloadMatch };

    // exact code match
    const codeMatch = ctrl.tasks.find(t => t.code.toLowerCase() === clean.toLowerCase());
    if (codeMatch) return { control: ctrl, task: codeMatch };

    // exact id match
    const idMatch = ctrl.tasks.find(t => t.id.toLowerCase() === clean.toLowerCase());
    if (idMatch) return { control: ctrl, task: idMatch };

    // loose name match
    const nameMatch = ctrl.tasks.find(t => clean.toLowerCase().includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(clean.toLowerCase()));
    if (nameMatch) return { control: ctrl, task: nameMatch };
  }

  return null;
}
