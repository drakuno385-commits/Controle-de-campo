'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { KeyRound, Eye, EyeOff, Shield, CheckCircle2 } from 'lucide-react';

export default function TrocarSenhaPage() {
  const router = useRouter();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return; }
      setUserEmail(session.user.email || '');

      // Se não precisa trocar senha, redireciona para o sistema
      supabase.from('perfis').select('must_change_password').eq('email', session.user.email).single()
        .then(({ data }) => {
          if (!data?.must_change_password) router.push('/');
        });
    });
  }, [router]);

  const calcularForca = (senha: string) => {
    let forca = 0;
    if (senha.length >= 8) forca++;
    if (/[A-Z]/.test(senha)) forca++;
    if (/[0-9]/.test(senha)) forca++;
    if (/[^A-Za-z0-9]/.test(senha)) forca++;
    return forca;
  };

  const forca = calcularForca(novaSenha);
  const forcaCor = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500'][forca];
  const forcaTexto = ['', 'Fraca', 'Média', 'Boa', 'Forte'][forca];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (novaSenha === 'GWEP@123') {
      setErro('A nova senha não pode ser igual à senha inicial. Escolha uma senha pessoal.');
      return;
    }
    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) { setErro('Erro ao salvar: ' + error.message); setLoading(false); return; }

    // Remove a flag de troca obrigatória
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.email) {
      await supabase.from('perfis').update({ must_change_password: false }).eq('email', session.user.email);
    }

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-4" style={{
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,243,255,0.08), transparent)'
    }}>
      <div className="w-full max-w-md">
        
        {/* LOGO / HEADER */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_40px_rgba(34,211,238,0.4)] flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Defina sua Senha Pessoal</h1>
          <p className="text-slate-400 text-sm mt-2">
            Bem-vindo(a)! Este é seu primeiro acesso como <span className="text-cyan-400 font-bold">{userEmail}</span>.
          </p>
          <p className="text-slate-500 text-xs mt-1">Você precisa criar uma senha pessoal para continuar.</p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300/90">
              A senha inicial <code className="font-mono font-bold text-amber-300">GWEP@123</code> é temporária e não pode ser mantida.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* NOVA SENHA */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Nova Senha</label>
              <div className="relative">
                <input
                  required
                  type={mostrar ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-slate-200 focus:border-cyan-400 outline-none transition-all placeholder:text-slate-600"
                />
                <button type="button" onClick={() => setMostrar(!mostrar)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {mostrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* BARRA DE FORÇA */}
              {novaSenha && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= forca ? forcaCor : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <p className={`text-[10px] font-bold ${['','text-red-400','text-amber-400','text-yellow-300','text-emerald-400'][forca]}`}>
                    Força: {forcaTexto}
                  </p>
                </div>
              )}
            </div>

            {/* CONFIRMAR SENHA */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Confirmar Senha</label>
              <div className="relative">
                <input
                  required
                  type={mostrar ? 'text' : 'password'}
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-slate-200 focus:border-cyan-400 outline-none transition-all placeholder:text-slate-600"
                />
                {confirmar && novaSenha === confirmar && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>

            {/* ERRO */}
            {erro && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-sm text-rose-400">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3.5 rounded-xl text-sm shadow-[0_0_25px_rgba(34,211,238,0.35)] hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Salvar Senha e Entrar no Sistema
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
