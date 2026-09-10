import React, { useState, useEffect, useMemo } from 'react';
import type { 
  Company,
  DocumentControl, 
  CheckRecord, 
  UserAccount, 
  TaskItem 
} from './types';
import { storage } from './utils/storage';
import { api } from './services/api';
import { Header, type AppTab } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { CompanyHubView } from './components/CompanyHubView';
import { CompanyModal } from './components/CompanyModal';
import { DashboardView } from './components/DashboardView';
import { DocumentMatrix } from './components/DocumentMatrix';
import { MobileCheckView } from './components/MobileCheckView';
import { QRCodeGeneratorView } from './components/QRCodeGeneratorView';
import { AuditReportView } from './components/AuditReportView';
import { ScheduleConfigView } from './components/ScheduleConfigView';
import { QRScannerModal } from './components/QRScannerModal';
import { CheckDetailModal } from './components/CheckDetailModal';
import { ControlBuilderModal } from './components/ControlBuilderModal';
import { PrintableDocument } from './components/PrintableDocument';
import { UserManagementModal } from './components/UserManagementModal';
import { Download, Sparkles, X } from 'lucide-react';

export function App() {
  // Authentication State
  const [authUser, setAuthUser] = useState<UserAccount | null>(() => storage.getAuthUser());

  // Navigation State (initialized according to user role)
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    const initialUser = storage.getAuthUser();
    if (initialUser?.role === 'OPERATOR') return 'mobile';
    if (initialUser?.role === 'VIEWER') return 'dashboard';
    return 'home';
  });

  // Multi-Company State
  const [companies, setCompanies] = useState<Company[]>(() => storage.getCompanies());
  const [activeCompanyId, setActiveCompanyId] = useState<string>(() => storage.getActiveCompanyId());
  
  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0];

  // Active Document Control State (within active company)
  const [activeControlId, setActiveControlId] = useState<string>(() => {
    const activeComp = companies.find(c => c.id === storage.getActiveCompanyId()) || companies[0];
    return activeComp?.controls[0]?.id || '';
  });

  const activeControl = activeCompany?.controls.find(c => c.id === activeControlId) || activeCompany?.controls[0];

  // Records & Users State
  const [records, setRecords] = useState<CheckRecord[]>(() => storage.getRecords());
  const [users, setUsers] = useState<UserAccount[]>(() => storage.getUsers());

  // Registros "órfãos" (de empresas, modelos, colunas ou operadores já excluídos)
  // não devem aparecer em nenhuma tela — mantemos o array bruto intacto para as
  // regras de negócio (dedupe, exclusão), mas exibimos só os registros válidos.
  const validRecords = useMemo(() => {
    return records.filter(r => {
      const comp = companies.find(c => c.id === r.companyId);
      const ctrl = comp?.controls.find(c => c.id === r.controlId);
      const taskExists = ctrl?.tasks.some(t => t.id === r.taskId) ?? false;
      const userExists = users.some(u => u.id === r.userId);
      return !!comp && !!ctrl && taskExists && userExists;
    });
  }, [records, companies, users]);

  // Neon PostgreSQL Cloud Connection State
  const [isNeonConnected, setIsNeonConnected] = useState<boolean | null>(null);

  // Neon PostgreSQL Cloud Bootstrap & Sync
  useEffect(() => {
    let isMounted = true;

    async function loadFromNeon() {
      try {
        const bootstrap = await api.getBootstrap();
        if (isMounted && bootstrap && bootstrap.ok) {
          if (bootstrap.companies && bootstrap.companies.length > 0) {
            setCompanies(bootstrap.companies);
            storage.saveCompanies(bootstrap.companies);
          }
          if (bootstrap.records) {
            setRecords(bootstrap.records);
            storage.saveRecords(bootstrap.records);
          }
          if (bootstrap.users && bootstrap.users.length > 0) {
            setUsers(bootstrap.users);
            storage.saveUsers(bootstrap.users);
          }
          setIsNeonConnected(true);
        } else if (isMounted) {
          setIsNeonConnected(false);
        }
      } catch (err) {
        console.warn('Operando com armazenamento local de contingência:', err);
        if (isMounted) setIsNeonConnected(false);
      }
    }

    loadFromNeon();

    return () => {
      isMounted = false;
    };
  }, []);

  // Role-based navigation guard & company lock
  useEffect(() => {
    if (!authUser) return;

    // Force company lock for VIEWER and OPERATOR
    if (authUser.companyId && activeCompanyId !== authUser.companyId) {
      if (companies.some(c => c.id === authUser.companyId)) {
        setActiveCompanyId(authUser.companyId);
        storage.setActiveCompanyId(authUser.companyId);
      }
    }

    // Strict Role Tab Restrictions
    if (authUser.role === 'OPERATOR') {
      if (activeTab !== 'mobile') {
        setActiveTab('mobile');
      }
    } else if (authUser.role === 'VIEWER') {
      if (activeTab !== 'dashboard' && activeTab !== 'matrix' && activeTab !== 'reports') {
        setActiveTab('dashboard');
      }
    }
  }, [authUser, activeTab, activeCompanyId, companies]);

  // Modal States
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompanyForModal, setEditingCompanyForModal] = useState<Company | null>(null);

  const [isControlBuilderOpen, setIsControlBuilderOpen] = useState(false);
  const [editingControlForBuilder, setEditingControlForBuilder] = useState<DocumentControl | null>(null);

  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  const [cellModalState, setCellModalState] = useState<{
    isOpen: boolean;
    day: number;
    month: number;
    year: number;
    control: DocumentControl | null;
    task: TaskItem | null;
    record?: CheckRecord;
    scheduledTime?: string;
  }>({
    isOpen: false,
    day: 1,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    control: null,
    task: null
  });

  // PWA Install Prompt
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setInstallPrompt(null);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount, rememberMe: boolean = true) => {
    setAuthUser(user);
    storage.setAuthUser(user, rememberMe);

    if (user.companyId && companies.some(c => c.id === user.companyId)) {
      setActiveCompanyId(user.companyId);
      storage.setActiveCompanyId(user.companyId);
      const targetComp = companies.find(c => c.id === user.companyId);
      if (targetComp && targetComp.controls.length > 0) {
        setActiveControlId(targetComp.controls[0].id);
        storage.setActiveControlId(targetComp.controls[0].id);
      }
    }

    if (user.role === 'OPERATOR') {
      setActiveTab('mobile');
      setIsQRScannerOpen(true);
    } else if (user.role === 'VIEWER') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('home');
    }
  };

  const handleLogout = () => {
    if (confirm('Deseja realmente encerrar a sessão?')) {
      setAuthUser(null);
      storage.setAuthUser(null);
    }
  };

  // User Management Handlers
  const handleSaveUser = (savedUser: UserAccount) => {
    const existingIdx = users.findIndex(u => u.id === savedUser.id);
    let updatedUsers: UserAccount[];
    if (existingIdx >= 0) {
      updatedUsers = [...users];
      updatedUsers[existingIdx] = savedUser;
    } else {
      updatedUsers = [...users, savedUser];
    }
    setUsers(updatedUsers);
    storage.saveUsers(updatedUsers);
    api.saveUser(savedUser);

    // If updating current active session user, sync authUser
    if (authUser && authUser.id === savedUser.id) {
      setAuthUser(savedUser);
      storage.setAuthUser(savedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (authUser && authUser.id === userId) {
      alert('Você não pode excluir a sua própria conta conectada.');
      return;
    }
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    storage.saveUsers(updatedUsers);
    api.deleteUser(userId);
  };

  // Company Handlers
  const handleSelectCompany = (comp: Company) => {
    setActiveCompanyId(comp.id);
    storage.setActiveCompanyId(comp.id);
    if (comp.controls.length > 0) {
      setActiveControlId(comp.controls[0].id);
      storage.setActiveControlId(comp.controls[0].id);
      setActiveTab('dashboard'); // Go to real-time dashboard on company selection
    } else {
      // Empresa recém-criada sem nenhum modelo ainda: limpa o modelo ativo
      // (senão fica preso no modelo da empresa anterior) e leva para a tela
      // que sabe lidar com "nenhum modelo" e oferece criar o primeiro.
      setActiveControlId('');
      storage.setActiveControlId('');
      setActiveTab('settings');
    }
  };

  const handleSaveCompany = (comp: Company) => {
    const updated = storage.saveCompany(comp);
    setCompanies(updated);
    setActiveCompanyId(comp.id);
    storage.setActiveCompanyId(comp.id);
    api.saveCompany(comp);
  };

  const handleDeleteCompany = (compId: string) => {
    const remaining = storage.deleteCompany(compId);
    setCompanies(remaining);
    setActiveCompanyId(remaining[0].id);
    api.deleteCompany(compId);
  };

  const handleOpenCreateCompany = () => {
    setEditingCompanyForModal(null);
    setIsCompanyModalOpen(true);
  };

  const handleOpenEditCompany = (comp: Company) => {
    setEditingCompanyForModal(comp);
    setIsCompanyModalOpen(true);
  };

  const handleUpdateCompanyLogo = (logoBase64: string) => {
    const updatedComp: Company = {
      ...activeCompany,
      logoUrl: logoBase64
    };
    handleSaveCompany(updatedComp);
  };

  // Control Handlers (within Active Company)
  const handleSelectControl = (ctrl: DocumentControl) => {
    setActiveControlId(ctrl.id);
    storage.setActiveControlId(ctrl.id);
  };

  const handleSaveControl = (savedControl: DocumentControl) => {
    const ctrlWithCompany = {
      ...savedControl,
      companyId: activeCompany.id
    };
    const { companies: updatedCompanies } = storage.saveControl(ctrlWithCompany);
    setCompanies(updatedCompanies);
    setActiveControlId(savedControl.id);
    storage.setActiveControlId(savedControl.id);
    api.saveControl(ctrlWithCompany);
  };

  const handleDuplicateControl = (sourceId: string) => {
    const { newControl, companies: updatedCompanies } = storage.duplicateControl(sourceId);
    setCompanies(updatedCompanies);
    setActiveControlId(newControl.id);
    api.saveControl(newControl);
    alert(`Modelo "${newControl.title}" duplicado com sucesso!`);
  };

  const handleDeleteControl = (controlId: string) => {
    const { updatedCompany, companies: updatedCompanies } = storage.deleteControl(controlId);
    setCompanies(updatedCompanies);
    if (updatedCompany.controls.length > 0) {
      setActiveControlId(updatedCompany.controls[0].id);
    }
    setRecords(storage.getRecords());
    api.deleteControl(controlId);
  };

  const handleOpenCreateControl = () => {
    setEditingControlForBuilder(null);
    setIsControlBuilderOpen(true);
  };

  const handleOpenEditControl = (ctrl: DocumentControl) => {
    setEditingControlForBuilder(ctrl);
    setIsControlBuilderOpen(true);
  };

  // Check Records Handlers
  const handleConfirmCheck = (newRecData: Omit<CheckRecord, 'id'>) => {
    const timeKey = (newRecData.scheduledTime || '').replace(':', '');
    const id = `rec-${newRecData.companyId}-${newRecData.controlId}-${newRecData.year}-${String(newRecData.month).padStart(2, '0')}-${String(newRecData.dayNumber).padStart(2, '0')}-${newRecData.taskId}-${timeKey}`;
    const newRecord: CheckRecord = {
      ...newRecData,
      id
    };

    const updated = [
      newRecord,
      ...records.filter(r => !(
        r.controlId === newRecData.controlId &&
        r.dayNumber === newRecData.dayNumber && 
        r.month === newRecData.month && 
        r.year === newRecData.year && 
        r.taskId === newRecData.taskId &&
        (r.scheduledTime === newRecData.scheduledTime || (!r.scheduledTime && !newRecData.scheduledTime))
      ))
    ];

    setRecords(updated);
    storage.saveRecords(updated);
    api.saveRecord(newRecord);

    // Auto-switch only if valid, existing and different
    if (newRecData.companyId && newRecData.companyId !== activeCompany.id && companies.some(c => c.id === newRecData.companyId)) {
      setActiveCompanyId(newRecData.companyId);
      storage.setActiveCompanyId(newRecData.companyId);
    }
    if (newRecData.controlId && newRecData.controlId !== activeControl?.id && activeCompany.controls.some(c => c.id === newRecData.controlId)) {
      setActiveControlId(newRecData.controlId);
      storage.setActiveControlId(newRecData.controlId);
    }
  };

  const handleDeleteCheck = (recordId: string) => {
    const updated = records.filter(r => r.id !== recordId);
    setRecords(updated);
    storage.saveRecords(updated);
    api.deleteRecord(recordId);
  };

  const handleClearRecords = (controlId: string, month?: number, year?: number) => {
    const updated = records.filter(r => {
      if (r.controlId !== controlId) return true;
      if (month !== undefined && year !== undefined) {
        return !(r.month === month && r.year === year);
      }
      return false;
    });
    setRecords(updated);
    storage.saveRecords(updated);
    api.clearRecords(controlId, month, year);
  };

  // Cell Click Handler
  const handleCellClick = (
    day: number, 
    task: TaskItem, 
    record?: CheckRecord, 
    scheduledTime?: string,
    month?: number,
    year?: number
  ) => {
    const now = new Date();
    const effectiveMonth = month ?? record?.month ?? (now.getMonth() + 1);
    const effectiveYear = year ?? record?.year ?? now.getFullYear();
    setCellModalState({
      isOpen: true,
      day,
      month: effectiveMonth,
      year: effectiveYear,
      control: activeControl,
      task,
      record,
      scheduledTime: scheduledTime || record?.scheduledTime || (task.hasScheduledTime !== false ? task.scheduledTime : undefined)
    });
  };

  // Backup & Reset Handlers
  const handleResetData = () => {
    const data = storage.resetToDefault();
    setCompanies(data.companies);
    setActiveCompanyId(data.companies[0].id);
    setActiveControlId(data.companies[0].controls[0].id);
    setRecords(data.records);
    setUsers(data.users);
    setAuthUser(data.authUser);
  };

  const handleExportBackup = () => {
    const jsonStr = storage.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_multiempresas_limpeza_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonStr: string) => {
    const ok = storage.importBackupJson(jsonStr);
    if (ok) {
      setCompanies(storage.getCompanies());
      setActiveCompanyId(storage.getActiveCompanyId());
      setActiveControlId(storage.getActiveControlId());
      setRecords(storage.getRecords());
      setUsers(storage.getUsers());
      alert('Backup multi-empresa restaurado com sucesso!');
    } else {
      alert('Arquivo de backup inválido.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // If not authenticated, render Login Screen
  if (!authUser) {
    return (
      <LoginScreen
        users={users}
        companies={companies}
        onLoginSuccess={handleLoginSuccess}
        onRegisterUser={handleSaveUser}
        isNeonConnected={isNeonConnected}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-emerald-200">
      
      {/* Printable Sheet (Shown only during window.print()) */}
      {activeControl && (
        <PrintableDocument
          company={activeCompany}
          control={activeControl}
          records={validRecords}
          month={new Date().getMonth() + 1}
          year={new Date().getFullYear()}
        />
      )}

      {/* Main Interactive App Container */}
      <div className="flex-1 flex flex-col no-print">
        
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          companies={companies}
          activeCompany={activeCompany}
          onUpdateCompanyLogo={handleUpdateCompanyLogo}
          controls={activeCompany?.controls || []}
          activeControl={activeControl}
          onSelectControl={handleSelectControl}
          onOpenCreateControl={handleOpenCreateControl}
          onOpenEditControl={handleOpenEditControl}
          onDuplicateControl={handleDuplicateControl}
          onDeleteControl={handleDeleteControl}
          authUser={authUser}
          onLogout={handleLogout}
          onOpenQuickScan={() => setIsQRScannerOpen(true)}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          onPrint={handlePrint}
          onResetData={handleResetData}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
        />

        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" />
              <span>Instale o aplicativo <strong>Herbarium Check</strong> no celular para acesso offline rápido</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallPWA}
                className="px-3 py-1 bg-white text-emerald-900 rounded-xl font-bold shadow-xs hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar App</span>
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="p-1 hover:bg-white/10 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Tab Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
          {/* TAB 0: HOME / COMPANY HUB */}
          {activeTab === 'home' && (
            <CompanyHubView
              companies={companies}
              activeCompany={activeCompany}
              authUser={authUser}
              onSelectCompany={handleSelectCompany}
              onOpenCreateCompany={handleOpenCreateCompany}
              onOpenEditCompany={handleOpenEditCompany}
              onDeleteCompany={handleDeleteCompany}
            />
          )}

          {/* TAB: REAL-TIME DASHBOARD & B.I */}
          {activeTab === 'dashboard' && activeControl && (
            <DashboardView
              company={activeCompany}
              controls={activeCompany.controls}
              activeControl={activeControl}
              records={validRecords}
              users={users}
              activeUser={authUser}
              onNavigateToMatrix={() => setActiveTab('matrix')}
              onNavigateToReports={() => setActiveTab('reports')}
            />
          )}

          {/* TAB 1: DOCUMENT MATRIX */}
          {activeTab === 'matrix' && activeControl && (
            <DocumentMatrix
              company={activeCompany}
              control={activeControl}
              records={validRecords}
              activeUser={authUser}
              onCellClick={handleCellClick}
              onOpenEditControl={handleOpenEditControl}
              onPrint={handlePrint}
              onUpdateControl={handleSaveControl}
              onClearRecords={handleClearRecords}
            />
          )}

          {/* TAB 2: MOBILE OPERATOR VIEW */}
          {activeTab === 'mobile' && activeControl && (
            <MobileCheckView
              controls={activeCompany.controls}
              activeControl={activeControl}
              onSelectControl={handleSelectControl}
              records={validRecords}
              activeUser={authUser}
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
              onConfirmCheck={handleConfirmCheck}
              onViewTaskDetail={handleCellClick}
            />
          )}

          {/* TAB 3: QR CODES GENERATOR */}
          {activeTab === 'qrcodes' && activeControl && (
            <QRCodeGeneratorView
              company={activeCompany}
              controls={activeCompany.controls}
              activeControl={activeControl}
            />
          )}

          {/* TAB 4: AUDIT REPORTS */}
          {activeTab === 'reports' && activeControl && (
            <AuditReportView
              records={validRecords}
              controls={activeCompany.controls}
              activeControl={activeControl}
              users={users}
              activeUser={authUser}
              onSaveCheck={handleConfirmCheck}
              onDeleteCheck={handleDeleteCheck}
            />
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <ScheduleConfigView
              company={activeCompany}
              controls={activeCompany.controls}
              activeControl={activeControl as DocumentControl}
              onSelectControl={handleSelectControl}
              onSaveControl={handleSaveControl}
              onDuplicateControl={handleDuplicateControl}
              onDeleteControl={handleDeleteControl}
              onOpenCreateControl={handleOpenCreateControl}
              users={users}
              onUpdateUsers={setUsers}
              onOpenUserManagement={() => setIsUserManagementOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Global QR Code Camera Scanner Modal */}
      {activeControl && (
        <QRScannerModal
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          controls={activeCompany.controls}
          activeControl={activeControl}
          activeUser={authUser}
          onConfirmCheck={handleConfirmCheck}
        />
      )}

      {/* Cell Audit / Check Detail Modal */}
      {cellModalState.isOpen && cellModalState.task && cellModalState.control && (
        <CheckDetailModal
          isOpen={cellModalState.isOpen}
          onClose={() => setCellModalState(prev => ({ ...prev, isOpen: false, task: null, control: null, scheduledTime: undefined }))}
          day={cellModalState.day}
          month={cellModalState.month}
          year={cellModalState.year}
          control={cellModalState.control}
          task={cellModalState.task}
          record={cellModalState.record}
          scheduledTime={cellModalState.scheduledTime}
          activeUser={authUser}
          users={users}
          onSaveCheck={handleConfirmCheck}
          onDeleteCheck={handleDeleteCheck}
        />
      )}

      {/* Visual Control Builder / Editor Modal */}
      <ControlBuilderModal
        isOpen={isControlBuilderOpen}
        onClose={() => setIsControlBuilderOpen(false)}
        initialControl={editingControlForBuilder}
        onSaveControl={handleSaveControl}
      />

      {/* Company Modal (Create / Edit Company & Upload Logo) */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        initialCompany={editingCompanyForModal}
        onSaveCompany={handleSaveCompany}
      />

      {/* User Management & Accounts Modal */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        users={users}
        authUser={authUser}
        companies={companies}
        onSaveUser={handleSaveUser}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
}

export default App;
