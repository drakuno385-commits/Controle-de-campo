'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, XCircle, AlertTriangle, Settings, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Posto, Apontamento, Servico, Escala, Prestadora } from '../../types';
import { toApontDB, fromApontDB, fromPostoDB } from '../../utils/mappers';

export default function AppTecnicoMobile() {
  const [postos, setPostos] = useState<Posto[]>([]);
  const [prestadoras, setPrestadoras] = useState<Prestadora[]>([]);
  const [apontamentos, setApontamentos] = useState<Apontamento[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);

  const [postoFixo, setPostoFixo] = useState<string | null>(null);
  const [prestadoraFixa, setPrestadoraFixa] = useState<string | null>(null);
  const [setupStep, setSetupStep] = useState<'empresa' | 'posto'>('empresa');
  const [setupEmpresaId, setSetupEmpresaId] = useState('');
  const [tecnico, setTecnico] = useState("");
  const [servicoId, setServicoId] = useState("");
  
  const [foto, setFoto] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [aiLoading, setAiLoading] = useState(true);
  const faceapiRef = useRef<any>(null);
  
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [resPostos, resAponts, resServicos, resEscalas, resPrestadoras] = await Promise.all([
        supabase.from('postos').select('*'),
        supabase.from('apontamentos').select('*').order('created_at', { ascending: false }),
        supabase.from('servicos').select('*'),
        supabase.from('escalas').select('*'),
        supabase.from('empresas').select('*')
      ]);

      if (resPostos.data) setPostos(resPostos.data.map(fromPostoDB));
      if (resAponts.data) setApontamentos(resAponts.data.map(fromApontDB));
      if (resServicos.data) setServicos(resServicos.data);
      if (resEscalas.data) setEscalas(resEscalas.data);
      if (resPrestadoras.data) setPrestadoras(resPrestadoras.data);

      const salvoPostoFixo = localStorage.getItem('gwep_posto_fixo');
      const salvoPrestadoraFixa = localStorage.getItem('gwep_prestadora_fixa');
      if (salvoPostoFixo) setPostoFixo(salvoPostoFixo);
      if (salvoPrestadoraFixa) setPrestadoraFixa(salvoPrestadoraFixa);

      setLoading(false);
    };
    fetchData();

    // IA Load
    const loadAI = async () => {
      try {
        const fa = await import('face-api.js');
        faceapiRef.current = fa;
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
        await Promise.all([
          fa.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          fa.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          fa.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setAiLoading(false);
      } catch (e) {
        console.error("Erro ao carregar IA:", e);
      }
    };
    loadAI();
  }, []);

  const postoSelecionado = postos.find(p => p.id === postoFixo);

  useEffect(() => {
    if (postoSelecionado && postoSelecionado.servicosIds && postoSelecionado.servicosIds.length > 0) {
      if (!postoSelecionado.servicosIds.includes(servicoId)) {
        setServicoId(postoSelecionado.servicosIds[0]);
      }
    }
  }, [postoFixo, postoSelecionado]);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      alert("Erro ao acessar a câmera: " + err.message);
      setShowCamera(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob: any) => {
        if (blob) {
          const file = new File([blob], "webcam_photo.jpg", { type: "image/jpeg" });
          setFoto(file);
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const ativo = apontamentos.find((a) => a.tecnico === tecnico && a.checkOut === null && !a.falta);

  const checkIn = async () => {
    if (!postoFixo || !postoSelecionado) return;
    if (!tecnico.trim()) return alert("Digite seu nome!");
    if (!foto) return alert("É obrigatório enviar uma foto!");

    if (apontamentos.find(a => a.tecnico === tecnico && a.status === 'Em Andamento')) {
      return alert("Já há um turno ativo para este técnico!");
    }

    setEnviando(true);

    try {
      if (faceapiRef.current) {
        const faceapi = faceapiRef.current;
        const currentImg = await faceapi.bufferToImage(foto);
        const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 });
        const currentDetection = await faceapi.detectSingleFace(currentImg, options).withFaceLandmarks().withFaceDescriptor();

        if (!currentDetection) {
          setEnviando(false);
          return alert("❌ Nenhum rosto detectado na sua foto! Certifique-se de que seu rosto está bem iluminado e visível.");
        }

        const now = new Date();
        const todayStr = now.toISOString().substring(0, 10);
        const todayOutrosFotos = apontamentos.filter(a => a.checkIn.startsWith(todayStr) && a.fotoUrl && a.tecnico !== tecnico);

        for (const ap of todayOutrosFotos) {
          const imgUrl = ap.fotoUrl;
          if (!imgUrl) continue;
          
          const targetImg = await faceapi.fetchImage(imgUrl);
          const targetDetection = await faceapi.detectSingleFace(targetImg).withFaceLandmarks().withFaceDescriptor();
          
          if (targetDetection) {
            const distance = faceapi.euclideanDistance(currentDetection.descriptor, targetDetection.descriptor);
            if (distance < 0.5) { 
              setEnviando(false);
              return alert(`🚨 ALERTA DE FRAUDE (AI): O rosto detectado nesta foto é o mesmo que registrou ponto hoje em nome de "${ap.tecnico}"! Ação bloqueada.`);
            }
          }
        }
      }
    } catch (e) {
      console.error("Erro na validação biométrica:", e);
    }

    // Calculos de Turno
    const now = new Date();
    let turnoExecutado = 'Diurno';
    const h = now.getHours();
    const absMin = h * 60 + now.getMinutes();
    let expectedAbsMin = absMin;

    if (h >= 17 || h < 6) { 
      if (postoSelecionado.temNoturno) {
        turnoExecutado = 'Noturno';
        const [ph, pm] = (postoSelecionado.horaInicioNoturno || "18:00").split(':').map(Number);
        expectedAbsMin = ph * 60 + pm;
        if (h < 6 && ph >= 17) expectedAbsMin -= 24 * 60;
      }
    } else { 
      if (postoSelecionado.temDiurno) {
        turnoExecutado = 'Diurno';
        const [ph, pm] = (postoSelecionado.horaInicioDiurno || "06:00").split(':').map(Number);
        expectedAbsMin = ph * 60 + pm;
      }
    }

    const ocupados = apontamentos.filter(a => a.postoId === postoFixo && a.status === 'Em Andamento' && a.turnoRealizado === turnoExecutado);
    const limite = turnoExecutado === 'Diurno' ? (postoSelecionado.qtdDiurno || 1) : (postoSelecionado.qtdNoturno || 1);
    if (ocupados.length >= limite) {
      setEnviando(false);
      return alert(`❌ Bloqueado: O limite de efetivo para este posto no turno ${turnoExecutado} (${limite} vagas) já foi atingido!`);
    }

    let atraso = absMin - expectedAbsMin;
    if (atraso < 0 || atraso > 12 * 60) atraso = 0;

    let fotoUrl = null;
    const extensao = foto.name.split('.').pop() || 'jpg';
    const safeTecnico = tecnico.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '_');
    const nomeArquivo = `${Date.now()}_${safeTecnico}.${extensao}`;
    const { error: uploadError } = await supabase.storage.from('fotos_ponto').upload(nomeArquivo, foto);
    if (uploadError) {
      setEnviando(false);
      return alert("Erro ao enviar foto para a nuvem: " + uploadError.message);
    }
    const { data: publicUrlData } = supabase.storage.from('fotos_ponto').getPublicUrl(nomeArquivo);
    fotoUrl = publicUrlData.publicUrl;

    const novoApontamento: Apontamento = {
      id: '', postoId: postoFixo, tecnico, checkIn: now.toISOString(), checkOut: null,
      falta: false, atrasoMinutos: atraso, valorOriginal: null, descontoCalculado: 0, valorFaturado: null, status: 'Em Andamento',
      fotoUrl, turnoRealizado: turnoExecutado, servicoId: servicoId || null
    };

    const dbObj = toApontDB(novoApontamento);
    delete (dbObj as any).id;
    const { data, error } = await supabase.from('apontamentos').insert([dbObj]).select();
    if (!error && data) setApontamentos([fromApontDB(data[0]), ...apontamentos]);
    else if (error) alert('Falha ao registrar check-in: ' + error.message);

    setEnviando(false);
    setFoto(null);
  };

  const checkOut = async () => {
    if (!ativo) return;
    setEnviando(true);
    const posto = postos.find(p => p.id === ativo.postoId);
    if (!posto) { setEnviando(false); return; }

    const isNight = ativo.turnoRealizado ? ativo.turnoRealizado === 'Noturno' : (new Date(ativo.checkIn).getHours() >= 17 || new Date(ativo.checkIn).getHours() < 6);
    const valorUnitarioBase = isNight ? (posto.valorNoturno || posto.valorDiurno || 0) : (posto.valorDiurno || posto.valorNoturno || 0);
    const valorDiaUnitario = posto.faturamento === 'Mensal' ? (valorUnitarioBase / 30) : valorUnitarioBase;
    
    const escalaObj = escalas.find(e => e.id === posto.escalaId);
    const cargaHoraria = escalaObj ? escalaObj.carga_horaria : 8;

    const now = new Date();
    const horasTrabalhadas = (now.getTime() - new Date(ativo.checkIn).getTime()) / (1000 * 60 * 60);
    const horasFaltantes = Math.max(0, cargaHoraria - horasTrabalhadas);

    let desconto = 0;
    if (horasFaltantes > 0) {
      const valorHora = valorDiaUnitario / cargaHoraria;
      desconto = horasFaltantes * valorHora;
    }

    const apAtualizado = {
      ...ativo, checkOut: now.toISOString(),
      valorOriginal: valorDiaUnitario, descontoCalculado: desconto, valorFaturado: valorDiaUnitario - desconto, status: 'Medido' as const
    };

    const dbApAtualizado = toApontDB(apAtualizado);
    delete (dbApAtualizado as any).id;
    const { error } = await supabase.from('apontamentos').update(dbApAtualizado).eq('id', ativo.id);
    if (!error) setApontamentos(apontamentos.map(a => a.id === ativo.id ? apAtualizado : a));
    else alert('Falha ao finalizar turno: ' + error.message);
    setEnviando(false);
  };

  if (loading) {
    return <div className="flex h-screen bg-slate-950 items-center justify-center text-cyan-500 font-bold">Carregando App...</div>;
  }

  // TELA DE SETUP (Primeiro Acesso) - 2 Passos
  if (!postoFixo || !prestadoraFixa) {
    const postosDaEmpresa = postos.filter(p => p.prestadoraId === setupEmpresaId);

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 fade-in">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              <Building2 className="w-8 h-8 text-slate-900" />
            </div>
            <h1 className="text-3xl font-black text-white">Setup Inicial</h1>
            <p className="text-slate-500 text-sm mt-2">Vincule este aparelho ao local de trabalho fixo.</p>
          </div>

          {/* Indicador de Passos */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex-1 h-1.5 rounded-full transition-all ${setupStep === 'empresa' || setupStep === 'posto' ? 'bg-cyan-500' : 'bg-slate-800'}`} />
            <div className={`flex-1 h-1.5 rounded-full transition-all ${setupStep === 'posto' ? 'bg-cyan-500' : 'bg-slate-800'}`} />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            {setupStep === 'empresa' && (
              <>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Passo 1 de 2</p>
                <h2 className="text-xl font-black text-white mb-6">Qual é a sua empresa?</h2>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Empresa Prestadora</label>
                <select
                  value={setupEmpresaId}
                  onChange={e => setSetupEmpresaId(e.target.value)}
                  className="w-full bg-slate-950 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-cyan-400 mb-6 appearance-none"
                >
                  <option value="" disabled>-- Selecionar Empresa --</option>
                  {prestadoras.map(pr => (
                    <option key={pr.id} value={pr.id}>{pr.nome}</option>
                  ))}
                </select>
                <button
                  disabled={!setupEmpresaId}
                  onClick={() => setSetupStep('posto')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 font-black text-lg disabled:opacity-40 active:scale-95 transition-all shadow-lg"
                >
                  Próximo →
                </button>
              </>
            )}

            {setupStep === 'posto' && (
              <>
                <button onClick={() => setSetupStep('empresa')} className="text-slate-500 text-xs font-bold mb-4 hover:text-cyan-400 transition-colors">← Voltar</button>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Passo 2 de 2</p>
                <h2 className="text-xl font-black text-white mb-6">Qual é o seu posto?</h2>
                {postosDaEmpresa.length === 0 ? (
                  <p className="text-amber-400 text-sm font-bold text-center py-4">Nenhum posto vinculado a esta empresa ainda.</p>
                ) : (
                  <>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Posto de Trabalho</label>
                    <select
                      defaultValue=""
                      onChange={e => {
                        const postoId = e.target.value;
                        if (!postoId) return;
                        localStorage.setItem('gwep_posto_fixo', postoId);
                        localStorage.setItem('gwep_prestadora_fixa', setupEmpresaId);
                        setPostoFixo(postoId);
                        setPrestadoraFixa(setupEmpresaId);
                      }}
                      className="w-full bg-slate-950 p-4 rounded-xl text-white outline-none border border-slate-700 focus:border-cyan-400 mb-6 appearance-none"
                    >
                      <option value="" disabled>-- Selecionar Posto --</option>
                      {postosDaEmpresa.map(p => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                      ))}
                    </select>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // TELA DO APP MOBILE
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 relative overflow-hidden fade-in selection:bg-cyan-500/30">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-slate-950 to-blue-950/20 pointer-events-none z-0" />

      {/* Relógio Simulado Header */}
      <div className="relative z-10 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Posto Vinculado</span>
          <span className="font-bold text-cyan-400 text-sm truncate max-w-[150px]">{postoSelecionado?.nome}</span>
        </div>
        
        <div className="flex gap-2 items-center">
          <button onClick={() => { 
            localStorage.removeItem('gwep_posto_fixo');
            localStorage.removeItem('gwep_prestadora_fixa');
            setPostoFixo(null);
            setPrestadoraFixa(null);
            setSetupStep('empresa');
            setSetupEmpresaId('');
          }} className="ml-2 text-slate-600 hover:text-rose-400 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative z-10 flex flex-col p-6 overflow-y-auto">
        {enviando && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center rounded-3xl text-center px-6 m-6">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-cyan-400 font-bold animate-pulse text-lg mb-2">Processando...</p>
            <p className="text-xs text-slate-400">Verificando IA e salvando registro.</p>
          </div>
        )}

        {!ativo ? (
          <div className="flex flex-col flex-1 max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight mt-4">Check-in</h2>
            <p className="text-sm text-slate-400 mb-8">Identifique-se e registre sua presença.</p>
            
            <div className="mb-6 group">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 block mb-2">Nome do Técnico</label>
              <input 
                value={tecnico} 
                onChange={e=>setTecnico(e.target.value)} 
                placeholder="Ex: João Silva"
                className="bg-slate-900 text-white font-bold text-xl border border-slate-800 rounded-2xl outline-none w-full p-4 focus:border-cyan-400 focus:bg-slate-800 transition-colors shadow-inner" 
              />
            </div>

            {(postoSelecionado?.servicosIds?.length ?? 0) > 0 && (
              <div className="mb-8 group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 block mb-2">Serviço Assumido</label>
                <select value={servicoId} onChange={e=>setServicoId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-lg text-cyan-400 outline-none font-bold appearance-none focus:border-cyan-400 shadow-inner">
                  {postoSelecionado?.servicosIds?.map((sid: string) => {
                    const s = servicos.find(srv=>srv.id === sid);
                    return s ? <option key={sid} value={sid}>{s.nome}</option> : null;
                  })}
                </select>
              </div>
            )}

            <div className="mb-8 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Foto / Biometria</p>
              
              {!showCamera && !foto && (
                <button onClick={startCamera} disabled={aiLoading || !tecnico} className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl border-2 border-slate-800 bg-slate-900 text-slate-300 hover:border-cyan-500 transition-all font-bold disabled:opacity-50 shadow-lg">
                  <Camera className="w-6 h-6" /> {aiLoading ? "Carregando IA..." : "Abrir Câmera"}
                </button>
              )}

              {showCamera && (
                <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <video ref={videoRef} className="w-full h-[300px] object-cover" playsInline muted />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 items-center">
                    <button onClick={takePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.5)] active:scale-95 transition-transform flex items-center justify-center">
                      <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    </button>
                    <button onClick={stopCamera} className="absolute right-6 w-12 h-12 bg-rose-500/80 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-lg active:bg-rose-600 transition-colors">
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}

              {foto && !showCamera && (
                <div className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-cyan-500 bg-cyan-500/10 text-cyan-400">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-bold">Foto Registrada!</span>
                  </div>
                  <button onClick={() => setFoto(null)} className="text-rose-400 font-bold text-sm bg-rose-500/10 px-4 py-2 rounded-xl active:bg-rose-500/20">
                    Descartar
                  </button>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 pb-8">
              <button onClick={checkIn} disabled={!foto || !tecnico} className="w-full py-5 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 font-black text-xl shadow-[0_0_30px_rgba(34,211,238,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100">
                BATER PONTO
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 items-center justify-center max-w-sm mx-auto w-full">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="w-56 h-56 rounded-full border-4 border-cyan-500/30 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.2)] bg-slate-900/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent animate-[spin_4s_linear_infinite]" style={{ transformOrigin: 'bottom center', height: '50%', top: '0' }}></div>
                <div className="text-center relative z-10 flex flex-col items-center">
                  <span className="block text-5xl font-black text-cyan-400 font-mono tracking-tight">{simDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-4 bg-slate-950 border border-slate-800 px-4 py-2 rounded-full shadow-inner">Turno em Andamento</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full p-6 text-center shadow-2xl mb-8">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Técnico Ativo</p>
              <p className="text-2xl font-black text-white">{tecnico}</p>
              
              {ativo.atrasoMinutos > 0 && (
                <div className="mt-4 bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Atraso Registrado: {ativo.atrasoMinutos}m.
                </div>
              )}
            </div>

            <button onClick={checkOut} className="w-full py-5 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white font-black text-xl shadow-[0_0_30px_rgba(225,29,72,0.4)] active:scale-95 transition-all mt-auto mb-8">
              FINALIZAR TURNO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
