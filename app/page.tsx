"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Building2, MapPin, Clock, Plus, Link2, Unlink, Search, 
  CheckCircle2, XCircle, Smartphone, LayoutDashboard, Users, GripVertical, Info, FileText, BarChart3, Download, Camera, AlertTriangle, ChevronDown, Briefcase, LogOut, Shield
} from 'lucide-react';
import { Posto, Apontamento, Prestadora, Servico, Escala, Perfil, StatusOS } from '@/types';
import { toPostoDB, fromPostoDB, toApontDB, fromApontDB } from '@/utils/mappers';
import { formatMoney } from '@/utils/formatters';

import SidebarBtn from '../components/ui/SidebarBtn';
import TabCatalogos from '@/components/tabs/TabCatalogos';
import TabEmpresas from '@/components/tabs/TabEmpresas';
import TabPostos from '@/components/tabs/TabPostos';
import TabVinculos from '@/components/tabs/TabVinculos';
import TabOS from '@/components/tabs/TabOS';
import TabMedicao from '../components/tabs/TabMedicao';
import TabMonitoramento from '@/components/tabs/TabMonitoramento';
import TabUsuarios from '../components/tabs/TabUsuarios';
import TabVisaoGeral from '../components/tabs/TabVisaoGeral';

export default function GWEPEnterpriseApp() {
  const router = useRouter();
  
  const [prestadoras, setPrestadoras] = useState<Prestadora[]>([]);
  const [postos, setPostos] = useState<Posto[]>([]);
  const [apontamentos, setApontamentos] = useState<Apontamento[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  
  const [currentUser, setCurrentUser] = useState<Perfil | null>(null);
  const [gestaoAberto, setGestaoAberto] = useState(true);
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        const { data: profile } = await supabase.from('perfis').select('*').eq('email', session.user.email).single();
        if (profile) {
          setCurrentUser(profile);
        } else {
          // Fallback provisório para evitar tela branca caso a tabela ainda não exista ou não tenha o perfil
          setCurrentUser({ email: session.user.email || '', role: 'MASTER', telas_permitidas: ['empresas', 'postos', 'catalogos', 'vinculos', 'os', 'medicao', 'usuarios', 'monitoramento'] });
        }
        loadData();
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login');
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    const [r1, r2, r3, r4, r5] = await Promise.all([
      supabase.from('empresas').select('*').order('created_at', { ascending: false }),
      supabase.from('postos').select('*').order('created_at', { ascending: false }),
      supabase.from('apontamentos').select('*').order('created_at', { ascending: false }),
      supabase.from('servicos').select('*').order('nome', { ascending: true }),
      supabase.from('escalas').select('*').order('carga_horaria', { ascending: true })
    ]);
    const r6 = await supabase.from('perfis').select('*').order('created_at', { ascending: false });
    
    if (r1.data) setPrestadoras(r1.data);
    if (r2.data) setPostos(r2.data.map(fromPostoDB));
    if (r3.data) setApontamentos(r3.data.map(fromApontDB));
    if (r4.data) setServicos(r4.data);
    if (r5.data) setEscalas(r5.data);
    if (r6 && r6.data) setPerfis(r6.data);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-cyan-400 font-mono text-xl flex items-center justify-center animate-pulse">Sincronizando com GWEP Cloud...</div>;

  const handleVincular = async (postoId: string, prestadoraId: string | null, dataAcao?: string) => {
    const { error } = await supabase.from('postos').update({ prestadora_id: prestadoraId }).eq('id', postoId);
    if (!error) {
      setPostos(postos.map(p => p.id === postoId ? { ...p, prestadoraId } : p));
      
      if (prestadoraId && dataAcao) {
        await supabase.from('historico_vinculos').insert([{
          posto_id: postoId,
          empresa_id: prestadoraId,
          data_implantacao: dataAcao
        }]);
      } else if (!prestadoraId && dataAcao) {
        // Find the active history record for this posto (where data_encerramento is null) and close it
        const { data: hist } = await supabase.from('historico_vinculos')
          .select('id').eq('posto_id', postoId).is('data_encerramento', null).limit(1);
          
        if (hist && hist.length > 0) {
          await supabase.from('historico_vinculos')
            .update({ data_encerramento: dataAcao })
            .eq('id', hist[0].id);
        }
      }
    } else {
      alert('Erro ao vincular no Supabase: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const salvarPosto = async (novo: Posto) => {
    const dbPosto = toPostoDB(novo);
    const isNew = novo.id.startsWith('po-');
    if (isNew) {
      delete (dbPosto as any).id;
      const { data, error } = await supabase.from('postos').insert([dbPosto]).select();
      if (!error && data) setPostos([fromPostoDB(data[0]), ...postos]);
      else if (error) {
        console.error('Falha Supabase Inserir Posto:', error, dbPosto);
        alert('Falha ao salvar Posto na nuvem: ' + error.message + '\nDetalhes: ' + JSON.stringify(error.details || error.hint));
      }
    } else {
      const { error } = await supabase.from('postos').update(dbPosto).eq('id', dbPosto.id);
      if (!error) setPostos(postos.map(p => p.id === novo.id ? novo : p));
      else {
        console.error('Falha Supabase Atualizar Posto:', error, dbPosto);
        alert('Falha ao atualizar Posto: ' + error.message);
      }
    }
  };

  const criarPrestadora = async (nova: Prestadora) => {
    const { data, error } = await supabase.from('empresas').insert([{ nome: nova.nome, cnpj: nova.cnpj }]).select();
    if (!error && data) setPrestadoras([data[0], ...prestadoras]);
    else if (error) alert('Falha ao salvar Empresa na nuvem: ' + error.message);
  };

  const criarServico = async (nome: string) => {
    const { data, error } = await supabase.from('servicos').insert([{ nome }]).select();
    if (!error && data) setServicos([...servicos, data[0]].sort((a,b)=>a.nome.localeCompare(b.nome)));
    else if (error) alert('Erro ao criar serviço: ' + error.message);
  };

  const salvarPerfil = async (p: Perfil) => {
    if (p.id) {
      const { error } = await supabase.from('perfis').update(p).eq('id', p.id);
      if (!error) setPerfis(perfis.map(x => x.id === p.id ? p : x));
      else alert("Erro ao atualizar: " + error.message);
    } else {
      const { data, error } = await supabase.from('perfis').insert([p]).select();
      if (!error && data) setPerfis([...perfis, data[0]]);
      else alert("Erro ao criar perfil: " + error.message);
    }
  };

  const criarEscala = async (nome: string, cargaHoraria: number) => {
    const { data, error } = await supabase.from('escalas').insert([{ nome, carga_horaria: cargaHoraria }]).select();
    if (!error && data) setEscalas([...escalas, data[0]].sort((a,b)=>a.carga_horaria - b.carga_horaria));
    else if (error) alert('Erro ao criar escala: ' + error.message);
  };

  const tratarOcorrencia = async (postoId: string, observacao: string) => {
    if (!currentUser) return alert('Sessão expirada.');
    
    // Injeta marcação automática (tratado)
    const newApont: Apontamento = {
      id: `ap-${Date.now()}`,
      postoId,
      tecnico: 'Automático (Tratamento Manual)',
      checkIn: new Date().toISOString(),
      checkOut: new Date().toISOString(),
      falta: false,
      atrasoMinutos: 0,
      valorOriginal: 0,
      descontoCalculado: 0,
      valorFaturado: 0,
      status: 'Medido' as StatusOS,
      tratadoPor: currentUser.email,
      observacaoTratamento: observacao
    };

    const dbObj = toApontDB(newApont);
    const { data, error } = await supabase.from('apontamentos').insert([dbObj]).select();
    
    if (!error && data) {
      setApontamentos([fromApontDB(data[0]), ...apontamentos]);
      alert('Ocorrência tratada com sucesso! A batida foi registrada.');
    } else if (error) {
      alert('Erro ao tratar ocorrência: ' + error.message);
    }
  };

  const salvarOS = async (id: string, updates: Partial<Apontamento>) => {
    const ap = apontamentos.find(a => a.id === id);
    if (!ap) return;
    const { error } = await supabase.from('apontamentos').update(updates).eq('id', id);
    if (!error) setApontamentos(apontamentos.map(a => a.id === id ? { ...a, ...updates } : a));
    else alert('Erro ao atualizar: ' + error.message);
  };

  const canAccess = (tab: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'MASTER') return true;
    return currentUser.telas_permitidas.includes(tab);
  };
  const showGestao = canAccess('postos') || canAccess('catalogos') || canAccess('vinculos') || canAccess('monitoramento');

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(30, 41, 59, 0.8); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.3); }
      `}} />
      <div className="flex items-center justify-center h-screen w-screen bg-[#050B14] p-4 lg:p-8 text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
        {/* GLOBAL BACKLIGHT EFFECTS */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-cyan-500/20 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-blue-600/20 blur-[180px] rounded-full pointer-events-none" />

        {/* MAIN FLOATING GLASS CONTAINER */}
        <div className="w-full h-full max-w-[1920px] mx-auto bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex overflow-hidden relative z-10">

        {/* SIDEBAR */}
        <aside className="w-[260px] border-r border-white/5 bg-[#080D18]/40 flex flex-col z-20 shrink-0">
          <div className="p-8 flex items-center gap-4 border-b border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <Shield className="w-6 h-6 text-slate-950" />
            </div>
            <h1 className="text-3xl font-black text-slate-100 tracking-tight leading-none">GWEP<br/><span className="text-cyan-400 font-light text-base tracking-widest uppercase mt-1 block">FieldControl</span></h1>
          </div>
          
          <nav className="flex-1 p-5 space-y-3 overflow-y-auto">
            <SidebarBtn active={activeTab==='visao-geral'} onClick={()=>setActiveTab('visao-geral')} icon={<LayoutDashboard />} label="Visão Geral" />
            {canAccess('empresas') && <SidebarBtn active={activeTab==='empresas'} onClick={()=>setActiveTab('empresas')} icon={<Building2 />} label="Empresas" />}
            
            {showGestao && (
              <div className="mb-2 mt-2">
                <button onClick={()=>setGestaoAberto(!gestaoAberto)} className="w-full flex justify-between items-center px-4 py-3 text-sm font-bold text-slate-500 hover:text-cyan-400 uppercase tracking-widest transition-all rounded-xl hover:bg-white/5 group">
                  <span className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    Gestão Operacional
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${gestaoAberto ? 'rotate-180' : ''}`} />
                </button>
                
                {gestaoAberto && (
                  <div className="pl-4 space-y-2 border-l border-white/10 ml-6 mt-2">
                    {canAccess('postos') && <SidebarBtn active={activeTab==='postos'} onClick={()=>setActiveTab('postos')} icon={<MapPin />} label="Postos de Serviço" small />}
                    {canAccess('catalogos') && <SidebarBtn active={activeTab==='catalogos'} onClick={()=>setActiveTab('catalogos')} icon={<Clock />} label="Jornada - Escala" small />}
                    {canAccess('vinculos') && <SidebarBtn active={activeTab==='vinculos'} onClick={()=>setActiveTab('vinculos')} icon={<Link2 />} label="Vínculos Operacionais" small />}
                    {canAccess('monitoramento') && <SidebarBtn active={activeTab==='monitoramento'} onClick={()=>setActiveTab('monitoramento')} icon={<AlertTriangle />} label="Monitoramento (CCO)" small />}
                  </div>
                )}
              </div>
            )}

            {canAccess('os') && <SidebarBtn active={activeTab==='os'} onClick={()=>setActiveTab('os')} icon={<FileText />} label="Auditoria (Logs)" />}
            {canAccess('medicao') && <SidebarBtn active={activeTab==='medicao'} onClick={()=>setActiveTab('medicao')} icon={<BarChart3 />} label="Medição e Relatórios" />}
            {canAccess('usuarios') && <SidebarBtn active={activeTab==='usuarios'} onClick={()=>setActiveTab('usuarios')} icon={<Users />} label="Controle de Usuários" />}
          </nav>

          <div className="p-6 border-t border-white/5 bg-slate-950/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500 font-mono leading-tight">
                Sistema Híbrido V3<br/>Enterprise Edition
              </div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" title="Sistema Online" />
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors text-sm font-bold border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" /> Sair do Sistema
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col z-10 w-full h-full relative bg-transparent">
          {/* TOP BAR */}
          <header className="h-20 border-b border-white/5 bg-transparent px-10 flex items-center justify-between shrink-0 z-30">
            <div className="flex items-center gap-3">
               <span className="text-slate-500 font-medium tracking-wide">Visão Geral</span>
               <span className="text-slate-700">/</span>
               <span className="text-cyan-400 font-bold capitalize tracking-wide">{activeTab.replace('-', ' ')}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-slate-200">{currentUser?.email}</span>
                <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">{currentUser?.role}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-slate-900 shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center justify-center text-white font-bold text-sm">
                {currentUser?.email.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>
          
          {/* CONTENT WRAPPER */}
          <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
            <div className="w-full h-full flex flex-col">
              {activeTab === 'visao-geral' && <TabVisaoGeral prestadoras={prestadoras} postos={postos} apontamentos={apontamentos} onNavigate={setActiveTab} />}
              {activeTab === 'empresas' && canAccess('empresas') && <TabEmpresas prestadoras={prestadoras} onCreate={criarPrestadora} />}
              {activeTab === 'postos' && canAccess('postos') && <TabPostos postos={postos} servicos={servicos} escalas={escalas} onSave={salvarPosto} />}
              {activeTab === 'catalogos' && canAccess('catalogos') && <TabCatalogos servicos={servicos} escalas={escalas} onCreateServico={criarServico} onCreateEscala={criarEscala} />}
              {activeTab === 'vinculos' && canAccess('vinculos') && <TabVinculos postos={postos} prestadoras={prestadoras} onVincular={handleVincular} isDragging={isDragging} setIsDragging={setIsDragging} />}
              {activeTab === 'monitoramento' && canAccess('monitoramento') && <TabMonitoramento postos={postos} apontamentos={apontamentos} currentUser={currentUser} onTratarOcorrencia={tratarOcorrencia} />}
              {activeTab === 'os' && canAccess('os') && <TabOS apontamentos={apontamentos} postos={postos} prestadoras={prestadoras} servicos={servicos} onSaveOS={salvarOS} />}
              {activeTab === 'medicao' && canAccess('medicao') && <TabMedicao apontamentos={apontamentos} postos={postos} prestadoras={prestadoras} />}
              {activeTab === 'usuarios' && canAccess('usuarios') && <TabUsuarios perfis={perfis} onSave={salvarPerfil} currentUser={currentUser} />}
            </div>
          </div>
        </main>
        </div>
      </div>
    </>
  );
}
