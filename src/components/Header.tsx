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
  RefreshCw,
  Download,
  Upload,
  LogOut,
  UserCog,
  Users,
  Building2,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';
import type { UserAccount, DocumentControl, Company } from '../types';
import { ControlSelector } from './ControlSelector';
import { VerifIQLogo } from './VerifIQLogo';

export type AppTab = 'home' | 'dashboard' | 'matrix' | 'mobile' | 'qrcodes' | 'reports' | 'settings';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
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
  onImportBackup
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBackupMenu, setShowBackupMenu] = useState(false);

  const isAdmin = authUser.role === 'ADMIN';
  const isViewer = authUser.role === 'VIEWER';
  const isOperator = authUser.role === 'OPERATOR';

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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Left Side: Brand Logo + Context Actions */}
          <div className="flex items-center gap-3 min-w-0">
            {/* VerifIQ Brand Emblem */}
            <div 
              onClick={() => isAdmin && setActiveTab('home')}
              className={`flex items-center gap-2 ${isAdmin ? 'cursor-pointer' : ''}`}
              title={isAdmin ? "VerifIQ BPF - Voltar para Empresas" : "VerifIQ BPF"}
            >
              <VerifIQLogo size="sm" showText={false} />
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-black text-slate-900 text-sm tracking-tight">
                  Verif<span className="text-emerald-600">IQ</span>
                </span>
                <span className="text-[9px] text-slate-400 font-medium tracking-wide">
                  BPF Suite
                </span>
              </div>
            </div>

            {/* Admin: Back to Companies Directory Button */}
            {isAdmin && activeTab !== 'home' && (
              <button
                onClick={() => setActiveTab('home')}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
                title="Voltar ao Diretório de Empresas"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">Empresas</span>
              </button>
            )}

            {/* Active Company Name Badge */}
            {activeCompany && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 max-w-[150px] sm:max-w-[200px] truncate">
                <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">{activeCompany.name}</span>
              </div>
            )}

            {/* Document Control Selector — visible for Admin and Viewer when inside company */}
            {!isOperator && activeControl && activeTab !== 'home' && (
              <ControlSelector
                controls={controls}
                activeControl={activeControl}
                onSelectControl={onSelectControl}
                onOpenCreateControl={isAdmin ? onOpenCreateControl : undefined}
                onOpenEditControl={isAdmin ? onOpenEditControl : undefined}
                onDuplicateControl={isAdmin ? onDuplicateControl : undefined}
                onDeleteControl={isAdmin ? onDeleteControl : undefined}
              />
            )}
          </div>

          {/* Right Side: Clean Minimalist Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Quick User Management (Admin only) */}
            {isAdmin && onOpenUserManagement && (
              <button
                onClick={onOpenUserManagement}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-all"
                title="Gestão de Contas, Acessos e Perfis"
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden lg:inline">Contas</span>
              </button>
            )}

            {/* Quick QR Scanner Button (Admin and Operator) */}
            {!isViewer && (
              <button
                onClick={onOpenQuickScan}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all transform active:scale-95"
                title="Abrir Câmera para Escanear QR Code"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Escanear QR</span>
              </button>
            )}

            {/* Print Button (Matrix View) */}
            {activeTab === 'matrix' && (
              <button
                onClick={onPrint}
                className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors"
                title="Imprimir Modelo Oficial (A4 Paisagem)"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
            )}

            {/* User Profile Button */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className={`w-7 h-7 rounded-xl text-white text-xs font-bold flex items-center justify-center shadow-xs ${authUser.avatarColor || 'bg-emerald-700'}`}>
                  {authUser.initials}
                </div>
                <div className="text-left hidden xl:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{authUser.name}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    {isAdmin ? '👑 Admin' : isViewer ? '📊 Visualizador' : '📱 Operador'}
                  </div>
                </div>
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="font-extrabold text-xs text-slate-900">{authUser.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{authUser.email || `Matrícula: ${authUser.badgeNumber}`}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                      <span>Perfil: {isAdmin ? 'Administrador (Total)' : isViewer ? 'Visualizador (Cliente)' : 'Operador (Check)'}</span>
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    {isAdmin && onOpenUserManagement && (
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

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setActiveTab('home');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <Home className="w-4 h-4 text-emerald-600" />
                        <span>Diretório de Empresas</span>
                      </button>
                    )}

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

            {/* Quick Sair / Logout Button */}
            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              title="Encerrar Sessão / Trocar de Usuário"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden md:inline">Sair</span>
            </button>

            {/* Admin Backup Menu */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setShowBackupMenu(!showBackupMenu)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Opções de Backup"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {showBackupMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                    <button
                      onClick={() => {
                        onExportBackup();
                        setShowBackupMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar Backup (JSON)</span>
                    </button>
                    <label className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
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
                      <span>Resetar Dados</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Role-Based Navigation Tabs Bar */}
        {!isOperator && (
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-slate-100 text-xs font-medium custom-scrollbar">
            
            {/* ADMIN ONLY: Início (Empresas) */}
            {isAdmin && (
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
            )}

            {/* ADMIN & VIEWER: Dashboard B.I */}
            {activeTab !== 'home' && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard & B.I</span>
              </button>
            )}

            {/* ADMIN & VIEWER: Matriz do Documento */}
            {activeTab !== 'home' && (
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
            )}

            {/* ADMIN ONLY: Check Mobile */}
            {isAdmin && activeTab !== 'home' && (
              <button
                onClick={() => setActiveTab('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'mobile'
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Visão Operador</span>
              </button>
            )}

            {/* ADMIN ONLY: QR Codes */}
            {isAdmin && activeTab !== 'home' && (
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
            )}

            {/* ADMIN & VIEWER: Relatórios de Auditoria */}
            {activeTab !== 'home' && (
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
            )}

            {/* ADMIN ONLY: Configurações do Modelo */}
            {isAdmin && activeTab !== 'home' && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'settings'
                    ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Modelos & Colunas</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
