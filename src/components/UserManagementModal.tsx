import React, { useState } from 'react';
import type { UserAccount, Company, UserRole } from '../types';
import { 
  X, 
  Users, 
  UserPlus, 
  Lock, 
  Eye, 
  EyeOff, 
  Mail, 
  Shield, 
  Trash2, 
  Edit3, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Search,
  UserCog,
  Building2,
  Crown,
  BarChart3,
  Smartphone
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  authUser: UserAccount;
  companies: Company[];
  onSaveUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
}

const AVATAR_COLORS = [
  { name: 'Roxo Imperial', class: 'bg-purple-700' },
  { name: 'Esmeralda', class: 'bg-emerald-600' },
  { name: 'Azul Real', class: 'bg-blue-600' },
  { name: 'Âmbar / Laranja', class: 'bg-amber-600' },
  { name: 'Rosa / Framboesa', class: 'bg-rose-600' },
  { name: 'Índigo Moderno', class: 'bg-indigo-600' },
  { name: 'Verde Petróleo', class: 'bg-teal-700' },
  { name: 'Ardósia / Grafite', class: 'bg-slate-700' },
];

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  authUser,
  companies,
  onSaveUser,
  onDeleteUser
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'my-profile'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'ADMIN' | 'VIEWER' | 'OPERATOR'>('ALL');
  
  // Edit State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    email: string;
    password: string;
    badgeNumber: string;
    role: 'ADMIN' | 'VIEWER' | 'OPERATOR';
    avatarColor: string;
    initials: string;
    companyId?: string;
    companyName?: string;
  }>({
    name: '',
    email: '',
    password: '',
    badgeNumber: '',
    role: 'OPERATOR',
    avatarColor: 'bg-emerald-600',
    initials: '',
    companyId: companies[0]?.id || '',
    companyName: companies[0]?.name || ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  // Auto calculate initials
  const computeInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'US';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      initials: computeInitials(name)
    }));
  };

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setFormData({
      id: `usr-${Date.now()}`,
      name: '',
      email: '',
      password: '',
      badgeNumber: String(Math.floor(1000 + Math.random() * 9000)),
      role: 'OPERATOR',
      avatarColor: 'bg-emerald-600',
      initials: '',
      companyId: companies[0]?.id || '',
      companyName: companies[0]?.name || ''
    });
    setShowPassword(false);
    setActiveTab('create');
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUserId(user.id);
    const userCompany = companies.find(c => c.id === user.companyId) || companies[0];
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email || '',
      password: user.password || '',
      badgeNumber: user.badgeNumber || '',
      role: user.role,
      avatarColor: user.avatarColor || 'bg-emerald-600',
      initials: user.initials || computeInitials(user.name),
      companyId: user.companyId || userCompany?.id || '',
      companyName: user.companyName || userCompany?.name || ''
    });
    setShowPassword(false);
    setActiveTab('create');
  };

  const handleOpenMyProfile = () => {
    setEditingUserId(authUser.id);
    setFormData({
      id: authUser.id,
      name: authUser.name,
      email: authUser.email || '',
      password: authUser.password || '',
      badgeNumber: authUser.badgeNumber || '',
      role: authUser.role,
      avatarColor: authUser.avatarColor || 'bg-purple-700',
      initials: authUser.initials || computeInitials(authUser.name),
      companyId: authUser.companyId,
      companyName: authUser.companyName
    });
    setShowPassword(false);
    setActiveTab('my-profile');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!formData.name.trim()) {
      setFeedbackMsg({ text: 'Por favor, informe o nome completo.', type: 'error' });
      return;
    }

    if (formData.email && !formData.email.includes('@')) {
      setFeedbackMsg({ text: 'Por favor, insira um e-mail válido.', type: 'error' });
      return;
    }

    // Check duplicate email
    const duplicateEmail = users.find(u => 
      u.id !== formData.id && 
      u.email && 
      formData.email && 
      u.email.toLowerCase() === formData.email.trim().toLowerCase()
    );

    if (duplicateEmail) {
      setFeedbackMsg({ text: `O e-mail ${formData.email} já está cadastrado para outro usuário.`, type: 'error' });
      return;
    }

    const initials = formData.initials.trim().toUpperCase() || computeInitials(formData.name);
    const selectedCompany = companies.find(c => c.id === formData.companyId);

    const userToSave: UserAccount = {
      id: formData.id || `usr-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      password: formData.password.trim() || undefined,
      badgeNumber: formData.badgeNumber.trim() || String(Math.floor(1000 + Math.random() * 9000)),
      role: formData.role,
      avatarColor: formData.avatarColor,
      initials,
      companyId: formData.role === 'ADMIN' ? undefined : (formData.companyId || companies[0]?.id),
      companyName: formData.role === 'ADMIN' ? undefined : (selectedCompany?.name || companies[0]?.name)
    };

    onSaveUser(userToSave);

    setFeedbackMsg({ 
      text: editingUserId ? `Conta de "${userToSave.name}" atualizada com sucesso!` : `Nova conta "${userToSave.name}" criada com sucesso!`, 
      type: 'success' 
    });

    setTimeout(() => {
      setFeedbackMsg(null);
      setActiveTab('list');
    }, 1000);
  };

  const handleDelete = (user: UserAccount) => {
    if (user.id === authUser.id) {
      alert('Você não pode excluir a conta atualmente conectada.');
      return;
    }

    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    if (user.role === 'ADMIN' && adminCount <= 1) {
      alert('Não é possível excluir o único administrador do sistema.');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a conta de "${user.name}" (${user.email || user.badgeNumber})?`)) {
      onDeleteUser(user.id);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      !searchQuery.trim() ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.badgeNumber.includes(searchQuery.trim());

    const matchesRole = filterRole === 'ALL' || u.role === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
              <UserCog className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>Gestão de Contas, E-mails & Acessos</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  {users.length} usuários
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80">
                Cadastre e-mails, credenciais e redefina senhas de operadores e administradores
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

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                setActiveTab('list');
                setFeedbackMsg(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Lista de Usuários ({users.length})</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'create' && !editingUserId
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Cadastrar Novo E-mail / Usuário</span>
            </button>

            <button
              onClick={handleOpenMyProfile}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'my-profile'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Meu Perfil & Alterar Senha</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-b border-rose-200'
          }`}>
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: LIST OF USERS */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              
              {/* Search & Role Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nome, e-mail ou matrícula..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold self-stretch sm:self-auto justify-center">
                  <button
                    onClick={() => setFilterRole('ALL')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      filterRole === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todos ({users.length})
                  </button>
                  <button
                    onClick={() => setFilterRole('ADMIN')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      filterRole === 'ADMIN' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Admins
                  </button>
                  <button
                    onClick={() => setFilterRole('VIEWER')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      filterRole === 'VIEWER' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Visualizadores
                  </button>
                  <button
                    onClick={() => setFilterRole('OPERATOR')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      filterRole === 'OPERATOR' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Operadores
                  </button>
                </div>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredUsers.map((user) => {
                  const isCurrent = user.id === authUser.id;

                  return (
                    <div
                      key={user.id}
                      className={`p-4 bg-white border rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all ${
                        isCurrent 
                          ? 'border-emerald-500/80 ring-2 ring-emerald-500/10 bg-emerald-50/20' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className={`w-11 h-11 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs ${user.avatarColor || 'bg-emerald-600'}`}>
                          {user.initials}
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {user.name}
                            </h4>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">
                                Você (Logado)
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{user.email || 'Sem e-mail cadastrado'}</span>
                          </p>

                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                              Mat: {user.badgeNumber}
                            </span>
                            <span className="font-bold text-emerald-700">
                              {user.role === 'ADMIN' ? '👑 Admin' : user.role === 'VIEWER' ? '📊 Visualizador' : '📱 Operador'}
                            </span>
                            {user.password && (
                              <span className="text-slate-400 flex items-center gap-0.5" title="Conta protegida por senha">
                                <Lock className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Com senha</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-2 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors border border-slate-100"
                          title="Editar dados e redefinir senha"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        {!isCurrent && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Excluir conta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Nenhum usuário encontrado com os filtros atuais.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2 & 3: FORM (CREATE / EDIT / MY PROFILE) */}
          {(activeTab === 'create' || activeTab === 'my-profile') && (
            <form onSubmit={handleSaveForm} className="max-w-2xl mx-auto space-y-4">
              
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl text-white font-bold text-base flex items-center justify-center shadow-xs ${formData.avatarColor}`}>
                    {formData.initials || computeInitials(formData.name)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {activeTab === 'my-profile' 
                        ? 'Meu Perfil & Credenciais' 
                        : editingUserId 
                          ? `Editar Conta: ${formData.name || 'Usuário'}` 
                          : 'Nova Conta de Acesso'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Preencha os campos abaixo para salvar as permissões e credenciais
                    </p>
                  </div>
                </div>

                <span className="font-mono font-bold text-xs bg-white text-emerald-800 px-2.5 py-1 rounded-xl border border-emerald-200">
                  Rubrica: [{formData.initials || 'US'}]
                </span>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Nome Completo */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome Completo do Usuário / Operador: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: João da Silva Santos"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>E-mail Corporativo:</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="exemplo@empresa.com.br"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Senha */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Senha de Acesso:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? 'Ocultar' : 'Ver Senha'}</span>
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Deixe em branco ou digite a nova senha"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Matrícula */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Número de Matrícula / Crachá:
                  </label>
                  <input
                    type="text"
                    value={formData.badgeNumber}
                    onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                    placeholder="Ex: 2085"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Perfil de Acesso (Cargo) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nível de Acesso (Perfil):</span>
                  </label>
                  <select
                    value={formData.role}
                    disabled={activeTab === 'my-profile' && authUser.role !== 'ADMIN'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="ADMIN">👑 Administrador (Acesso Total a Todas as Empresas)</option>
                    <option value="VIEWER">📊 Visualizador / Cliente (Monitoramento & B.I da Empresa)</option>
                    <option value="OPERATOR">📱 Operador (Execução de Checks & Scanner QR)</option>
                  </select>
                </div>

                {/* Empresa Vinculada (Obrigatório para Visualizadores e Operadores) */}
                {formData.role !== 'ADMIN' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Empresa Vinculada ao Acesso: *
                    </label>
                    <select
                      value={formData.companyId || (companies[0]?.id || '')}
                      onChange={(e) => {
                        const comp = companies.find(c => c.id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          companyId: e.target.value,
                          companyName: comp?.name
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-emerald-50/60 border border-emerald-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.tradeName || c.name})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rubrica Customizada */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Rubrica Oficial (Iniciais):
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={formData.initials}
                    onChange={(e) => setFormData({ ...formData, initials: e.target.value.toUpperCase() })}
                    placeholder="Ex: AR"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
                  />
                </div>

                {/* Cor do Avatar */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cor de Identificação Visual:
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {AVATAR_COLORS.map(c => (
                      <button
                        key={c.class}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarColor: c.class })}
                        className={`w-6 h-6 rounded-lg transition-transform ${c.class} ${
                          formData.avatarColor === c.class ? 'ring-2 ring-slate-900 scale-110 shadow-sm' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('list');
                    setFeedbackMsg(null);
                  }}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Voltar à Lista
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Dados da Conta</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>Usuários autenticados têm registros auditados com data, hora e rubrica.</span>
          <span className="font-medium text-emerald-800">BPF / GMP Compliant</span>
        </div>
      </div>
    </div>
  );
};
