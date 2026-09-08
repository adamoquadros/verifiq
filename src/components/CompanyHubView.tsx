import React, { useState } from 'react';
import type { Company, UserAccount } from '../types';
import { 
  Building2, 
  Plus, 
  Search, 
  ArrowRight, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  CheckCircle2, 
  Layers,
  ShieldCheck
} from 'lucide-react';

interface CompanyHubViewProps {
  companies: Company[];
  activeCompany: Company;
  authUser: UserAccount;
  onSelectCompany: (company: Company) => void;
  onOpenCreateCompany: () => void;
  onOpenEditCompany: (company: Company) => void;
  onDeleteCompany: (companyId: string) => void;
}

export const CompanyHubView: React.FC<CompanyHubViewProps> = ({
  companies,
  activeCompany,
  authUser,
  onSelectCompany,
  onOpenCreateCompany,
  onOpenEditCompany,
  onDeleteCompany
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = companies.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.tradeName.toLowerCase().includes(q) ||
      (c.cnpj && c.cnpj.includes(q))
    );
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador do Sistema';
      case 'VIEWER': return 'Visualizador (Cliente)';
      default: return 'Operador Técnico';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Welcome Hero Banner (Formal Corporate Presentation) */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-xs relative overflow-hidden border border-slate-200">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-600 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>00 — Sistema Integrado de Gestão da Qualidade & BPF</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Diretório de Empresas
            </h1>
            <div className="text-xs text-slate-500 font-medium">
              Sessão iniciada: <strong className="text-slate-700">{authUser.name}</strong> • Perfil: <strong className="text-slate-700">{getRoleLabel(authUser.role)}</strong>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Ambiente institucional para seleção e governança de unidades operacionais. Cada entidade empresarial gerencia de forma segregada seus registros normativos, procedimentos operacionais padronizados (POPs), matrizes de checagem física e trilhas de conformidade sanitária em consonância com as Boas Práticas de Fabricação (BPF).
            </p>
          </div>

          <button
            onClick={onOpenCreateCompany}
            className="px-5 py-3.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Unidade</span>
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome da empresa ou CNPJ..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Total de <strong>{companies.length}</strong> empresas cadastradas
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((comp) => {
          const isActive = comp.id === activeCompany.id;
          const totalTasks = comp.controls.reduce((acc, c) => acc + c.tasks.length, 0);

          return (
            <div
              key={comp.id}
              className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between shadow-xs ${
                isActive 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Logo & Status Row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  {/* Logo Display */}
                  <div className="h-16 w-36 bg-slate-50 border border-slate-200 rounded-2xl p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {comp.logoUrl ? (
                      <img
                        src={comp.logoUrl}
                        alt={comp.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="font-extrabold text-sm text-slate-700 font-serif">
                        {comp.name}
                      </div>
                    )}
                  </div>

                  {isActive && (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Empresa Ativa</span>
                    </span>
                  )}
                </div>

                {/* Company Name & Trade Name */}
                <h3 className="font-bold text-lg text-slate-900 leading-tight">
                  {comp.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {comp.tradeName}
                </p>
                {comp.cnpj && (
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    CNPJ: {comp.cnpj}
                  </p>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Controles</div>
                    <div className="text-base font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>{comp.controls.length}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Atividades</div>
                    <div className="text-base font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      <span>{totalTasks}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectCompany(comp)}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs ${
                    isActive
                      ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <span>{isActive ? 'Abrir Espaço Ativo' : 'Acessar Empresa'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEditCompany(comp)}
                    className="p-2.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors"
                    title="Editar Empresa & Logotipo"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {companies.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente excluir a empresa "${comp.name}" e seus controles?`)) {
                          onDeleteCompany(comp.id);
                        }
                      }}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
                      title="Excluir Empresa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
