import React, { useState } from 'react';
import { 
  Home,
  FileSpreadsheet, 
  QrCode, 
  Smartphone, 
  BarChart3, 
  Settings, 
  Printer, 
  Camera, 
  UserCheck, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Download,
  Upload,
  Layers,
  LogOut,
  UserCog,
  KeyRound,
  Users
} from 'lucide-react';
import type { UserAccount, DocumentControl, Company } from '../types';
import { ControlSelector } from './ControlSelector';

interface HeaderProps {
  activeTab: 'home' | 'matrix' | 'mobile' | 'qrcodes' | 'reports' | 'settings';
  setActiveTab: (tab: 'home' | 'matrix' | 'mobile' | 'qrcodes' | 'reports' | 'settings') => void;
  companies: Company[];
  activeCompany: Company;
  onUpdateCompanyLogo?: (logoBase64: string) => void;
  controls: DocumentControl[];
  activeControl: DocumentControl;
  onSelectControl: (control: DocumentControl) => void;
  onOpenCreateControl: () => void;
  onOpenEditControl: (control: DocumentControl) => void;
  onDuplicateControl: (controlId: string) => void;
  onDeleteControl: (controlId: string) => void;
  authUser: UserAccount;
  onLogout: () => void;
  onOpenQuickScan: () => void;
  onOpenUserManagement?: () => void;
  onPrint: () => void;
  onResetData: () => void;
  onExportBackup: () => void;
  onImportBackup: (json: string) => void;
  pendingSyncCount?: number;
  isNeonConnected?: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeCompany,
  controls,
  activeControl,
  onSelectControl,
  onOpenCreateControl,
  onOpenEditControl,
  onDuplicateControl,
  onDeleteControl,
  authUser,
  onLogout,
  onOpenQuickScan,
  onOpenUserManagement,
  onPrint,
  onResetData,
  onExportBackup,
  onImportBackup,
  pendingSyncCount = 0,
  isNeonConnected = null
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBackupMenu, setShowBackupMenu] = useState(false);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) onImportBackup(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Left: Dynamic Company Logo & Model Selector (Apenas no espaço ativo de cada empresa) */}
          <div className="flex items-center gap-3 min-w-0">
            {activeTab !== 'home' && (
              <div 
                onClick={() => setActiveTab('home')}
                className="h-10 px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-2xs max-w-[160px] sm:max-w-[200px]"
                title="Clique para voltar ao Painel de Empresas"
              >
                {activeCompany.logoUrl ? (
                  <img
                    src={activeCompany.logoUrl}
                    alt={activeCompany.name}
                    className="max-h-8 max-w-full object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-800 font-serif font-extrabold text-sm">
                    <span>🌿</span>
                    <span className="truncate">{activeCompany.name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Document Control Selector — only visible inside company workspace tabs */}
            {activeControl && activeTab !== 'home' && (
              <ControlSelector
                controls={controls}
                activeControl={activeControl}
                onSelectControl={onSelectControl}
                onOpenCreateControl={onOpenCreateControl}
                onOpenEditControl={onOpenEditControl}
                onDuplicateControl={onDuplicateControl}
                onDeleteControl={onDeleteControl}
              />
            )}
          </div>

          {/* Right: Quick Actions & Admin Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Online Status */}
            <div className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isOnline 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Online {pendingSyncCount > 0 && `(Sync ${pendingSyncCount})`}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Modo Offline</span>
                </>
              )}
            </div>

            {/* Quick User Management Button in Header */}
            {onOpenUserManagement && (
              <button
                onClick={onOpenUserManagement}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-all"
                title="Gestão de Contas, E-mails e Senhas"
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline">Contas & E-mails</span>
              </button>
            )}

            {/* Neon PostgreSQL Cloud Indicator */}
            {isNeonConnected === true && (
              <div 
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold"
                title="Banco de Dados Neon PostgreSQL Conectado em Nuvem"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Neon DB</span>
              </div>
            )}
            {isNeonConnected === false && (
              <div 
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[11px] font-bold"
                title="Operando em contingência local (localStorage)"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Modo Local</span>
              </div>
            )}

            {/* Quick QR Scan Button */}
            <button
              onClick={onOpenQuickScan}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all transform active:scale-95"
              title="Abrir Câmera para Check Rápido"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Escanear QR</span>
            </button>

            {/* Print Button */}
            {activeTab === 'matrix' && (
              <button
                onClick={onPrint}
                className="p-2 sm:px-3 sm:py-2 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors"
                title="Imprimir Modelo Oficial (A4 Paisagem)"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span className="hidden lg:inline">Imprimir</span>
              </button>
            )}

            {/* Authenticated Admin User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-xs ${authUser.avatarColor}`}>
                  {authUser.initials}
                </div>
                <div className="text-left hidden xl:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{authUser.name}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">👑 {authUser.role}</div>
                </div>
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="font-extrabold text-xs text-slate-900">{authUser.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{authUser.email || `Matrícula: ${authUser.badgeNumber}`}</div>
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                      <span>Perfil: {authUser.role}</span>
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    {onOpenUserManagement && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenUserManagement();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <UserCog className="w-4 h-4 text-emerald-600" />
                        <span>Gestão de Contas & E-mails</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveTab('home');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <Home className="w-4 h-4 text-emerald-600" />
                      <span>Painel de Empresas</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Encerrar Sessão (Sair)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 sm:px-2.5 sm:py-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              title="Encerrar Sessão / Trocar de Usuário"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden md:inline">Sair</span>
            </button>

            {/* Backup / Reset Menu */}
            <div className="relative">
              <button
                onClick={() => setShowBackupMenu(!showBackupMenu)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                title="Dados e Backup"
              >
                <Layers className="w-4 h-4" />
              </button>

              {showBackupMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                  <button
                    onClick={() => {
                      onExportBackup();
                      setShowBackupMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Exportar Backup (JSON)</span>
                  </button>
                  <label className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Restaurar Backup</span>
                    <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
                  </label>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => {
                      if (confirm('Deseja resetar todas as empresas, modelos e dados para os valores padrão?')) {
                        onResetData();
                      }
                      setShowBackupMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resetar Todos os Dados</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-slate-100 text-xs font-medium custom-scrollbar">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'home'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Início (Empresas)</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'matrix'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Matriz do Documento</span>
          </button>

          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'mobile'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Check Mobile</span>
          </button>

          <button
            onClick={() => setActiveTab('qrcodes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'qrcodes'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Gerar QR Codes</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'reports'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Auditoria & Relatórios</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Gerenciar Modelos & Colunas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
