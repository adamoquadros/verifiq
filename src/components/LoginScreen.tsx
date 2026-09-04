import React, { useState } from 'react';
import type { UserAccount } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  UserPlus, 
  X,
  KeyRound,
  IdCard,
  UserCheck
} from 'lucide-react';

interface LoginScreenProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterUser?: (user: UserAccount) => void;
  isNeonConnected?: boolean | null;
}

const AVATAR_COLORS = [
  'bg-purple-700',
  'bg-emerald-600',
  'bg-blue-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-indigo-600',
  'bg-teal-700',
  'bg-slate-700'
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  onLoginSuccess,
  onRegisterUser,
  isNeonConnected
}) => {
  const [emailOrBadge, setEmailOrBadge] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal para criar nova conta na tela de login
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBadge, setRegBadge] = useState('');
  const [regRole, setRegRole] = useState<'ADMIN' | 'SUPERVISOR' | 'OPERATOR'>('OPERATOR');
  const [regColor, setRegColor] = useState('bg-emerald-600');
  const [regError, setRegError] = useState<string | null>(null);

  const computeInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'US';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanInput = emailOrBadge.trim().toLowerCase();
    const foundUser = users.find(u => 
      (u.email && u.email.toLowerCase() === cleanInput) ||
      u.badgeNumber.toLowerCase() === cleanInput ||
      u.name.toLowerCase().includes(cleanInput)
    );

    if (!foundUser) {
      setErrorMsg('Credenciais não encontradas. Verifique o e-mail ou matrícula.');
      return;
    }

    if (foundUser.password && password) {
      if (foundUser.password.trim() !== password.trim()) {
        setErrorMsg('Senha incorreta. Por favor, tente novamente.');
        return;
      }
    }

    onLoginSuccess(foundUser);
  };

  const handleQuickLogin = (user: UserAccount) => {
    onLoginSuccess(user);
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Por favor, informe o nome completo.');
      return;
    }

    const duplicate = users.find(u => 
      (regEmail && u.email && u.email.toLowerCase() === regEmail.trim().toLowerCase()) ||
      (regBadge && u.badgeNumber.toLowerCase() === regBadge.trim().toLowerCase())
    );

    if (duplicate) {
      setRegError('Já existe um usuário cadastrado com esse e-mail ou matrícula.');
      return;
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim() || `${regName.toLowerCase().replace(/\s+/g, '')}@verifiq.com`,
      password: regPassword.trim() || '1234',
      badgeNumber: regBadge.trim() || String(Math.floor(1000 + Math.random() * 9000)),
      role: regRole,
      avatarColor: regColor,
      initials: computeInitials(regName)
    };

    if (onRegisterUser) {
      onRegisterUser(newUser);
    }

    setIsRegisterOpen(false);
    // Realiza login automático com a nova conta criada
    onLoginSuccess(newUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white text-3xl shadow-xl shadow-emerald-900/40 ring-4 ring-emerald-500/20 mb-2">
            🌿
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>VerifIQ</span>
            <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-mono">
              BPF
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 font-medium">
            Sistema Digital de Gestão, Controle & Rastreabilidade BPF
          </p>

          {/* Status do Neon DB */}
          <div className="flex justify-center pt-1">
            {isNeonConnected === true && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Banco de Dados Neon Cloud Conectado</span>
              </span>
            )}
            {isNeonConnected === false && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Modo Local / Sincronizando</span>
              </span>
            )}
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-slate-900">Acesso ao Sistema</h2>
                <p className="text-[11px] text-slate-500">Identifique-se para iniciar os registros</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setRegName('');
                setRegEmail('');
                setRegPassword('');
                setRegBadge(String(Math.floor(1000 + Math.random() * 9000)));
                setRegError(null);
                setIsRegisterOpen(true);
              }}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors"
              title="Cadastrar Nova Conta"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Nova Conta</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleFormLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>E-mail ou Matrícula:</span>
              </label>
              <input
                type="text"
                required
                value={emailOrBadge}
                onChange={(e) => setEmailOrBadge(e.target.value)}
                placeholder="Ex: adamo@herbarium.com ou 2085"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Senha / Código de Acesso:</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-extrabold text-xs shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Acessar Painel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Section (1-Click for Testing) */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Contas para Teste Rápido (1-Clique)</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-mono">
                {users.length} disponíveis
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-2xl text-left transition-all group flex items-center gap-2.5"
                  title={`Entrar como ${user.name}`}
                >
                  <div className={`w-8 h-8 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 ${user.avatarColor || 'bg-emerald-600'}`}>
                    {user.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-[11px] text-slate-900 truncate group-hover:text-emerald-900">
                      {user.name}
                    </div>
                    <div className="text-[9px] text-emerald-700 font-semibold truncate">
                      {user.role === 'ADMIN' ? '👑 Admin' : user.role === 'SUPERVISOR' ? '⭐ Supervisor' : '✓ Operador'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-emerald-100/60 font-medium">
          Sistema em conformidade com as Boas Práticas de Fabricação (BPF / GMP)
        </div>
      </div>

      {/* Modal de Criação de Conta na Tela de Login */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95">
            
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">Criar Nova Conta</h3>
                  <p className="text-[11px] text-emerald-200/80">O usuário será salvo no Neon PostgreSQL</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccountSubmit} className="p-6 space-y-4 text-xs">
              {regError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {regError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: Carlos Andrade"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="carlos@herbarium.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Matrícula</label>
                  <input
                    type="text"
                    value={regBadge}
                    onChange={(e) => setRegBadge(e.target.value)}
                    placeholder="Ex: 3042"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Senha de Acesso</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Perfil de Acesso</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="OPERATOR">Operador (Check)</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">Administrador (Total)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Cor do Avatar</label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setRegColor(color)}
                      className={`w-7 h-7 rounded-xl ${color} transition-transform ${regColor === color ? 'ring-2 ring-emerald-600 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-extrabold shadow-md transition-all transform active:scale-95"
                >
                  Cadastrar & Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
