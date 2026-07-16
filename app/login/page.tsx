"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import './login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciais inválidas. Verifique seu acesso.');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#02040a] font-body text-white relative flex flex-col items-center justify-center overflow-hidden selection:bg-[#00f3ff] selection:text-black">
        {/* Background Layers */}
        <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a1628] via-[#050508] to-[#000000]" />
        <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern opacity-10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="scan-line" />

        {/* Top Navbar Simulation */}
        <nav className="fixed top-0 z-50 w-full glass-panel border-b border-[#00f3ff]/10 shadow-[0_5px_30px_rgba(0,0,0,0.3)]">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-lg tracking-[0.3em] text-white drop-shadow-[0_0_12px_rgba(0,243,255,0.5)] glow-text">GWEP</span>
            </div>
            <a href="https://gwep.com.br" className="text-[10px] font-accent font-semibold tracking-widest text-gray-400 hover:text-[#00f3ff] transition-colors">VOLTAR AO SITE</a>
          </div>
        </nav>

        {/* Login Container */}
        <div className="relative z-10 w-full max-w-md px-6 pt-20">
          <div className="glass-panel rounded-3xl p-10 sm:p-12 shadow-[0_0_40px_rgba(0,243,255,0.05)] text-center transform transition-all hover:border-[#00f3ff]/30">
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#f5a623]" />
              <span className="text-[10px] font-accent font-semibold tracking-[0.3em] text-[#f5a623] uppercase">Sistema Corporativo</span>
              <div className="w-8 h-px bg-[#f5a623]" />
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-white mb-2">
              Acesso <span className="text-[#00f3ff] italic glow-text">GWEP</span>
            </h1>
            
            <p className="text-sm text-gray-400 font-light mb-10">
              Insira suas credenciais para acessar o painel de operações.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm font-body">
                <ShieldAlert className="w-5 h-5 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5 text-left">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest font-accent">E-mail corporativo</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#040c1c] border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder:text-gray-600 focus:border-[#00f3ff]/50 focus:outline-none focus:shadow-[0_0_15px_rgba(0,243,255,0.15)] transition-all font-body"
                  placeholder="seu.nome@gwep.com.br"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest font-accent">Senha</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#040c1c] border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder:text-gray-600 focus:border-[#00f3ff]/50 focus:outline-none focus:shadow-[0_0_15px_rgba(0,243,255,0.15)] transition-all font-body tracking-[0.2em]"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="glass-button w-full mt-8 flex items-center justify-center px-10 py-4 text-sm font-body font-semibold text-white uppercase tracking-widest transition-all duration-300 hover:text-[#00f3ff] rounded-full disabled:opacity-50 disabled:pointer-events-none group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3 text-[#00f3ff]" /> : <ArrowRight className="w-5 h-5 mr-3 text-[#00f3ff] group-hover:translate-x-1 transition-transform" />}
                <span className={loading ? 'text-gray-400' : 'text-white'}>
                  {loading ? 'Autenticando' : 'Entrar no Sistema'}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 text-center z-10">
          <p className="text-[10px] font-accent text-gray-500 uppercase tracking-[0.2em]">
            © 2026 GWEP. Tecnologia com propósito humano.
          </p>
        </div>
      </div>
    </>
  );
}
