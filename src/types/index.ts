export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type CheckStatus = 'ON_TIME' | 'DELAYED' | 'EARLY' | 'PENDING' | 'MISSED';

export type CheckMethod = 'QR_CODE' | 'MANUAL';

export interface Sector {
  id: string;
  name: string;
  category?: 'DIARIO_ALMOXARIFADO' | 'DIARIO_PRODUCAO' | 'SEMANAL' | 'CUSTOM';
  color?: string;
}

export interface TaskItem {
  id: string;
  code: string;
  name: string;
  sectorId: string;
  recurrence: RecurrenceType;
  daysOfWeek?: number[];
  hasScheduledTime?: boolean; // Se false, atividade é apenas de conferência (sem horário programado)
  scheduledTime?: string; // "08:30" (ou primeiro horário padrão quando ativo)
  scheduledTimes?: string[]; // Ex: ["09:30", "14:00", "16:00"] para múltiplas checagens ao dia
  toleranceMinutes: number;
  description?: string;
  popRef?: string;
  qrPayload: string;
  active: boolean;
}

export type UserRole = 'ADMIN' | 'VIEWER' | 'OPERATOR';

export interface UserOperator {
  id: string;
  name: string;
  initials: string;
  badgeNumber: string;
  email?: string;
  role: UserRole;
  avatarColor: string;
  companyId?: string; // Obrigatório para VIEWER e OPERATOR
  companyName?: string;
}

export interface UserAccount extends UserOperator {
  password?: string;
}


export interface DocumentControl {
  id: string;
  companyId: string;
  title: string;
  docCode: string;
  revision: string;
  pageInfo: string;
  popRef: string;
  emissionDate: string;
  companyName: string;
  documentType: string;
  confidentialText: string;
  sectors: Sector[];
  tasks: TaskItem[];
  showColumnTimes?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  name: string;
  tradeName: string;
  cnpj?: string;
  documentCodePrefix?: string;
  logoUrl?: string; // Base64 data URL or image path
  primaryColor: string;
  controls: DocumentControl[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CheckRecord {
  id: string;
  companyId: string;
  controlId: string;
  taskId: string;
  taskName: string;
  sectorId: string;
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1..31
  month: number; // 1..12
  year: number;
  scheduledTime?: string; // "08:30" (ou omitido quando apenas conferência)
  checkedAt: string; // ISO string
  checkedTime: string; // "08:35"
  userId: string;
  userName: string;
  userInitials: string;
  status: CheckStatus;
  delayMinutes: number;
  method: CheckMethod;
  notes?: string;
  locationValidation?: boolean;
}

export interface DocumentMetadata {
  companyName: string;
  documentType: string;
  docCode: string;
  revision: string;
  pageInfo: string;
  title: string;
  popRef: string;
  emissionDate: string;
  confidentialText: string;
}
