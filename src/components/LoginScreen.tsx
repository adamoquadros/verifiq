import React, { useState } from 'react';
import type { UserAccount, Company, UserRole } from '../types';
import { VerifIQLogo } from './VerifIQLogo';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserPlus,
  X,
  Building2
} from 'lucide-react';

interface LoginScreenProps {
  users: UserAccount[];
  companies?: Company[];
  onLoginSuccess: (user: UserAccount, rememberMe?: boolean) => void;
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
  companies = [],
  onLoginSuccess,
  onRegisterUser,
  isNeonConnected
}) => {
  const [emailOrBadge, setEmailOrBadge] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal para criar nova conta na tela de login
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBadge, setRegBadge] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('VIEWER');
  const [regCompanyId, setRegCompanyId] = useState('');
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

    onLoginSuccess(foundUser, rememberMe);
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

    const targetCompanyId = regRole === 'ADMIN'
      ? undefined
      : (regCompanyId || (companies.length > 0 ? companies[0].id : 'comp-herbarium'));

    const targetCompanyName = targetCompanyId
      ? (companies.find(c => c.id === targetCompanyId)?.name || 'Herbarium Laboratório')
      : undefined;

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim() || `${regName.toLowerCase().replace(/\s+/g, '')}@verifiq.com`,
      password: regPassword.trim() || '1234',
      badgeNumber: regBadge.trim() || String(Math.floor(1000 + Math.random() * 9000)),
      role: regRole,
      companyId: targetCompanyId,
      companyName: targetCompanyName,
      avatarColor: regColor,
      initials: computeInitials(regName)
    };

    if (onRegisterUser) {
      onRegisterUser(newUser);
    }

    setIsRegisterOpen(false);
    onLoginSuccess(newUser, rememberMe);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* Ambient decoration — soft green glow, formal and understated */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">

        {/* Brand Header */}
        <div className="text-center space-y-4 flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm transition-transform hover:scale-105 duration-300">
            <VerifIQLogo size="lg" showText={false} />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-emerald-600">
              Sistema BPF
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Verif<span className="text-emerald-600">IQ</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xs mx-auto">
              Gestão, controle e rastreabilidade digital de Boas Práticas de Fabricação
            </p>
          </div>

          {/* Status do Neon DB */}
          <div className="flex justify-center pt-1">
            {isNeonConnected === true && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Banco de Dados Neon Cloud Conectado</span>
              </span>
            )}
            {isNeonConnected === false && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Modo Local / Sincronizando</span>
              </span>
            )}
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-7 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-200 space-y-6">

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400">01 — Identificação</span>
              <h2 className="font-bold text-sm text-slate-900 mt-0.5">Acesso ao Sistema</h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setRegName('');
                setRegEmail('');
                setRegPassword('');
                setRegBadge(String(Math.floor(1000 + Math.random() * 9000)));
                setRegRole('VIEWER');
                if (companies.length > 0) setRegCompanyId(companies[0].id);
                setRegError(null);
                setIsRegisterOpen(true);
              }}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors"
              title="Cadastrar Nova Conta"
            >
              <UserPlus className="w-3.5 h-3.5" />
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
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
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
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
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

            <div className="flex items-center justify-between pt-0.5 pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 hover:text-slate-900 group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-700 transition-all"
                />
                <span className="font-semibold group-hover:text-emerald-800 transition-colors">
                  Manter-me conectado
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Acessar Painel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-400 font-medium">
          Sistema VerifIQ • Em conformidade com as Boas Práticas de Fabricação (BPF / GMP)
        </div>
      </div>

      {/* Modal de Criação de Conta na Tela de Login */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95">

            <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl border border-white/20">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Criar Nova Conta</h3>
                  <p className="text-[11px] text-emerald-100">O usuário será salvo no Neon PostgreSQL</p>
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
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: Mariana Silveira"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="mariana@cliente.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Matrícula</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Senha de Acesso</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Perfil de Acesso *</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="VIEWER">📊 Visualizador (Cliente)</option>
                    <option value="OPERATOR">📱 Operador (Check)</option>
                    <option value="ADMIN">👑 Administrador (Total)</option>
                  </select>
                </div>
              </div>

              {/* Se for Visualizador ou Operador, selecione a empresa vinculada */}
              {regRole !== 'ADMIN' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Empresa Vinculada *</span>
                  </label>
                  <select
                    value={regCompanyId || (companies[0]?.id || '')}
                    onChange={(e) => setRegCompanyId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {companies.length === 0 && (
                      <option value="comp-herbarium">Herbarium Laboratório Botânico</option>
                    )}
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {regRole === 'VIEWER'
                      ? 'O visualizador só poderá acessar os dashboards e dados desta empresa.'
                      : 'O operador só poderá operar e registrar checks desta empresa.'}
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Cor do Avatar</label>
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
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all transform active:scale-95"
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
