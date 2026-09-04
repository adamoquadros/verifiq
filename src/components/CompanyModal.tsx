import React, { useState, useRef } from 'react';
import type { Company } from '../types';
import { 
  X, 
  Upload, 
  Building2, 
  Save, 
  Image as ImageIcon, 
  Trash2, 
  Sparkles,
  Check
} from 'lucide-react';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCompany?: Company | null;
  onSaveCompany: (company: Company) => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  initialCompany,
  onSaveCompany
}) => {
  const [name, setName] = useState(initialCompany?.name || '');
  const [tradeName, setTradeName] = useState(initialCompany?.tradeName || '');
  const [cnpj, setCnpj] = useState(initialCompany?.cnpj || '');
  const [docPrefix, setDocPrefix] = useState(initialCompany?.documentCodePrefix || '');
  const [primaryColor, setPrimaryColor] = useState(initialCompany?.primaryColor || 'emerald');
  const [logoUrl, setLogoUrl] = useState<string>(initialCompany?.logoUrl || '');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, JPEG ou SVG).');
      return;
    }

    // Limit to 2MB for local storage safety
    if (file.size > 2.5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2.5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setLogoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const companyId = initialCompany?.id || `comp-${Date.now()}`;
    const newCompany: Company = {
      id: companyId,
      name: name.trim(),
      tradeName: tradeName.trim() || name.trim(),
      cnpj: cnpj.trim() || undefined,
      documentCodePrefix: docPrefix.trim().toUpperCase() || name.substring(0, 3).toUpperCase(),
      logoUrl: logoUrl.trim() || undefined,
      primaryColor,
      controls: initialCompany?.controls || [],
      createdAt: initialCompany?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveCompany(newCompany);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <Building2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {initialCompany ? 'Editar Empresa & Logotipo' : 'Cadastrar Nova Empresa'}
              </h3>
              <p className="text-xs text-emerald-100/80">
                Personalize o nome e anexe a imagem oficial da empresa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Logo Upload Section */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Logotipo da Empresa (Imagem):</span>
              </span>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="text-rose-600 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remover Logo</span>
                </button>
              )}
            </label>

            {logoUrl ? (
              /* Logo Preview Card */
              <div className="p-4 bg-slate-50 border-2 border-emerald-500 rounded-2xl flex items-center justify-between gap-4">
                <div className="h-16 max-w-[200px] flex items-center justify-center p-2 bg-white rounded-xl border border-slate-200 shadow-inner">
                  <img
                    src={logoUrl}
                    alt="Logo da empresa"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex-1 text-[11px] text-slate-600">
                  <span className="font-bold text-emerald-800">✅ Imagem Carregada!</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Esta imagem será exibida no canto superior esquerdo, cabeçalhos dos anexos e impressões.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Trocar Imagem
                </button>
              </div>
            ) : (
              /* Dropzone / Upload area */
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50'
                }`}
              >
                <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-extrabold text-xs text-slate-800">
                  Clique para anexar a imagem do logo ou arraste aqui
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Formatos suportados: PNG, JPG, JPEG, SVG (Máx. 2.5 MB)
                </p>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/svg+xml"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Company Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome Fantasia da Empresa:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Herbarium, PharmaTech, etc."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Prefixo do Código (Documentos):</label>
              <input
                type="text"
                value={docPrefix}
                onChange={(e) => setDocPrefix(e.target.value.toUpperCase())}
                placeholder="Ex: HLB, PHT, BIO..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Razão Social Completa:</label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                placeholder="Ex: Herbarium Laboratório Botânico Ltda."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">CNPJ (Opcional):</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cor do Tema:</label>
              <select
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="emerald">Verde Esmeralda (Padrão)</option>
                <option value="blue">Azul Corporativo</option>
                <option value="indigo">Índigo / Roxo</option>
                <option value="teal">Verde Petróleo</option>
                <option value="slate">Cinza Escuro / Neutro</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Empresa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
