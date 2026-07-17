import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, MapPin, Users, X, ChevronRight } from 'lucide-react';
import { Prestadora, Posto } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prestadoras: Prestadora[];
  postos: Posto[];
  onNavigate: (tab: string) => void;
}

export default function CommandPalette({ isOpen, onClose, prestadoras, postos, onNavigate }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const lowerQuery = query.toLowerCase();
  
  const filteredEmpresas = query.length > 1 
    ? prestadoras.filter(p => p.nome.toLowerCase().includes(lowerQuery) || p.cnpj.includes(lowerQuery))
    : [];
    
  const filteredPostos = query.length > 1
    ? postos.filter(p => p.nome.toLowerCase().includes(lowerQuery))
    : [];

  const handleSelect = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#0A1120] border border-white/10 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Input Area */}
        <div className="flex items-center px-4 border-b border-white/10 relative">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-0 text-slate-200 text-lg placeholder:text-slate-500 focus:ring-0 px-4 py-5 outline-none font-medium"
            placeholder="Buscar empresas, postos ou usuários..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.length <= 1 && (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm font-medium">Digite pelo menos 2 caracteres para buscar.</p>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs font-mono">
                <span className="bg-white/5 px-2 py-1 rounded">Busca Rápida</span>
                <span className="bg-white/5 px-2 py-1 rounded">Ctrl + K</span>
              </div>
            </div>
          )}

          {query.length > 1 && filteredEmpresas.length === 0 && filteredPostos.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm">Nenhum resultado encontrado para "{query}".</p>
            </div>
          )}

          {filteredEmpresas.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-2">Empresas</h3>
              {filteredEmpresas.map(e => (
                <button 
                  key={e.id}
                  onClick={() => handleSelect('empresas')}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-left group transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-900/30 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-medium truncate">{e.nome}</p>
                    <p className="text-slate-500 text-xs font-mono truncate">{e.cnpj}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {filteredPostos.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-2">Postos Operacionais</h3>
              {filteredPostos.map(p => (
                <button 
                  key={p.id}
                  onClick={() => handleSelect('postos')}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 text-left group transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-medium truncate">{p.nome}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
