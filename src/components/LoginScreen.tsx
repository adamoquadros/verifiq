import React, { useState } from 'react';
import type { UserAccount } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  User, 
  KeyRound,
  CheckCircle2
} from 'lucide-react';

interface LoginScreenProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  onLoginSuccess
}) => {
  const [emailOrBadge, setEmailOrBadge] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanInput = emailOrBadge.trim().toLowerCase();
    const foundUser = users.find(u => 
      (u.email && u.email.toLowerCase() === cleanInput) ||
      u.badgeNumber === cleanInput ||
      u.name.toLowerCase().includes(cleanInput)
    );

    if (!foundUser) {
      setErrorMsg('Credenciais não encontradas. Verifique o e-mail ou matrícula digitados.');
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
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            herbarium
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 font-medium">
            Portal de Gestão & Anexos Controlados Multi-Empresa
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 space-y-5">
          
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900">Autenticação Administrativa</h2>
              <p className="text-[11px] text-slate-500">Acesso completo a empresas, controles e auditoria</p>
            </div>
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
                placeholder="Ex: admin@herbarium.com ou 2085"
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

          {/* Quick Login Section (1-Click for Admins) */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Acesso Rápido de Demonstração (1-Clique)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-2xl text-left transition-all group flex items-center gap-2.5"
                >
                  <div className={`w-8 h-8 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 ${user.avatarColor}`}>
                    {user.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-[11px] text-slate-900 truncate group-hover:text-emerald-900">
                      {user.name}
                    </div>
                    <div className="text-[9px] text-emerald-700 font-semibold truncate">
                      👑 {user.role === 'ADMIN' ? 'Administrador' : user.role}
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
    </div>
  );
};
