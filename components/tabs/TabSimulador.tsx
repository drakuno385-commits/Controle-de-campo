import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, MapPin, Clock, Plus, Link2, Unlink, Search, 
  CheckCircle2, XCircle, Smartphone, LayoutDashboard, Users, GripVertical, Info, FileText, BarChart3, Download, Camera, AlertTriangle, ChevronDown, Briefcase
} from 'lucide-react';
import { Posto, Apontamento, Prestadora, Servico, Escala, Perfil } from '../../types';
import { formatMoney } from '../../utils/formatters';

export default function TabSimulador({ postos, apontamentos, servicos, onCheckIn, onCheckOut, onFalta }: any) {
  const [tecnico, setTecnico] = useState("João Silva");
  const [postoId, setPostoId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [simDate, setSimDate] = useState(() => { const d = new Date(); d.setSeconds(0); d.setMilliseconds(0); return d; });
  const [foto, setFoto] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [aiLoading, setAiLoading] = useState(true);
  const faceapiRef = useRef<any>(null);
  
  // Controle da Webcam (Desktop/Navegador)
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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

  const addMinutes = (m: number) => setSimDate(prev => new Date(prev.getTime() + m * 60000));
  
  const postosValidos = postos.filter((p: Posto) => p.prestadoraId !== null);
  const postoSelecionado = postos.find((p: Posto) => p.id === postoId);

  useEffect(() => {
    if (postosValidos.length > 0 && !postoSelecionado) {
      setPostoId(postosValidos[0].id);
    }
  }, [postosValidos, postoSelecionado]);

  useEffect(() => {
    if (postoSelecionado && postoSelecionado.servicosIds?.length > 0) {
      if (!postoSelecionado.servicosIds.includes(servicoId)) {
        setServicoId(postoSelecionado.servicosIds[0]);
      }
    } else {
      setServicoId("");
    }
  }, [postoId, postoSelecionado]);

  const ativo = apontamentos.find((a: Apontamento) => a.tecnico === tecnico && a.checkOut === null && !a.falta);

  const handleBaterPonto = async () => {
    if (!foto) {
      alert("É obrigatório enviar uma foto do local para registrar o ponto!");
      return;
    }
    
    setEnviando(true);

    try {
      if (faceapiRef.current) {
        const faceapi = faceapiRef.current;
        
        // Carrega a foto atual
        const currentImg = await faceapi.bufferToImage(foto);
        const currentDetection = await faceapi.detectSingleFace(currentImg).withFaceLandmarks().withFaceDescriptor();

        if (!currentDetection) {
          setEnviando(false);
          return alert("❌ Nenhum rosto detectado na sua foto! Certifique-se de que seu rosto está bem iluminado e visível.");
        }

        // Busca fotos de HOJE de OUTROS técnicos
        const todayStr = simDate.toISOString().substring(0, 10);
        const todayOutrosFotos = apontamentos.filter((a: Apontamento) => 
          a.checkIn.startsWith(todayStr) && 
          a.fotoUrl && 
          a.tecnico !== tecnico
        );

        for (const ap of todayOutrosFotos) {
          // Busca a imagem do cloud
          const imgUrl = ap.fotoUrl;
          if (!imgUrl) continue;
          
          const targetImg = await faceapi.fetchImage(imgUrl);
          const targetDetection = await faceapi.detectSingleFace(targetImg).withFaceLandmarks().withFaceDescriptor();
          
          if (targetDetection) {
            const distance = faceapi.euclideanDistance(currentDetection.descriptor, targetDetection.descriptor);
            if (distance < 0.5) { // Threshold rigoroso (0.6 é o padrão, <0.5 garante alta semelhança)
              setEnviando(false);
              return alert(`🚨 ALERTA DE FRAUDE (AI): O rosto detectado nesta foto é o mesmo que registrou ponto hoje em nome de "${ap.tecnico}"! Ação bloqueada.`);
            }
          }
        }
      }
    } catch (e) {
      console.error("Erro na validação biométrica:", e);
      // Fallback em caso de erro de rede para as fotos antigas
    }

    await onCheckIn(postoId, tecnico, simDate, foto, servicoId);
    setEnviando(false);
    setFoto(null);
  };

  return (
    <div className="flex flex-col items-center pt-8 w-full fade-in">
      <div className="mb-10 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex gap-5 items-center shadow-xl">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tempo Decorrido:</span>
        <span className="font-mono text-cyan-400 bg-slate-950 px-4 py-2 rounded-lg font-bold text-base border border-cyan-500/10 shadow-inner">{simDate.toLocaleString('pt-BR')}</span>
        <div className="flex gap-3 ml-2">
          <button onClick={()=>addMinutes(-60)} className="text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">-1h</button>
          <button onClick={()=>addMinutes(15)} className="text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">+15m</button>
          <button onClick={()=>addMinutes(60)} className="text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">+1h</button>
        </div>
      </div>

      <div className="w-[400px] bg-slate-950 rounded-[56px] border-[12px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-white/10" style={{minHeight: '800px'}}>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-0" />
        {ativo && <div className="absolute inset-0 bg-emerald-950/10 pointer-events-none z-0 transition-all duration-1000" />}
        {enviando && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-cyan-400 font-bold animate-pulse text-lg mb-2">Analisando Biometria...</p>
            <p className="text-xs text-slate-400">Verificando banco de dados contra fraudes.</p>
          </div>
        )}

        <div className="h-8 flex justify-between items-center px-10 text-xs font-bold text-white/60 pt-2 shrink-0 relative z-10">
          <span>{simDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-5 h-3 border border-white/60 rounded-[3px] relative"><div className="absolute left-0 top-0 h-full w-[80%] bg-white/60" /></div>
          </div>
        </div>

        <div className="p-8 flex-1 flex flex-col relative z-10 overflow-y-auto">
          <div className="flex items-center gap-4 mb-8 mt-4">
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Users className="w-7 h-7 text-cyan-400" />
            </div>
            <div className="flex-1 group">
              <p className="text-xs text-slate-400 uppercase tracking-widest group-focus-within:text-cyan-400 transition-colors">Identificação</p>
              <input value={tecnico} onChange={e=>setTecnico(e.target.value)} className="bg-transparent text-white font-bold text-xl border-b border-dashed border-white/20 outline-none w-full pb-2 mt-1 focus:border-cyan-400 transition-colors" />
            </div>
          </div>

          {!ativo ? (
            <div className="flex flex-col flex-1">
              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Novo Expediente</h2>
              <p className="text-sm text-slate-400 mb-6">Confirme o local de trabalho e registre sua presença.</p>
              
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-inner mb-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 block mb-1">Local</label>
                  <select value={postoId} onChange={e=>setPostoId(e.target.value)} className="w-full bg-slate-950/50 p-4 rounded-xl text-base text-slate-200 outline-none font-semibold appearance-none border border-slate-700 focus:border-cyan-400">
                    {postosValidos.map((p: Posto) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                
                {postoSelecionado?.servicosIds?.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 block mb-1">Serviço Assumido</label>
                    <select value={servicoId} onChange={e=>setServicoId(e.target.value)} className="w-full bg-slate-950/50 p-4 rounded-xl text-base text-cyan-400 outline-none font-semibold appearance-none border border-slate-700 focus:border-cyan-400">
                      {postoSelecionado.servicosIds.map((sid: string) => {
                        const s = servicos.find((srv:any)=>srv.id === sid);
                        if(!s) return null;
                        return <option key={sid} value={sid}>{s.nome}</option>
                      })}
                    </select>
                  </div>
                )}
              </div>

              <div className="mb-6 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Validação Biométrica</p>
                
                {!showCamera && !foto && (
                  <button onClick={startCamera} disabled={aiLoading} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-slate-800 bg-slate-900/50 text-slate-300 hover:border-cyan-500 hover:bg-slate-800 transition-all font-bold disabled:opacity-50">
                    <Camera className="w-6 h-6" /> {aiLoading ? "Carregando Agente IA..." : "Abrir Câmera"}
                  </button>
                )}

                {showCamera && (
                  <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-cyan-500">
                    <video ref={videoRef} className="w-full h-[250px] object-cover" playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <button onClick={takePhoto} className="w-14 h-14 bg-white rounded-full border-4 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:scale-110 transition-transform flex items-center justify-center">
                        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      </button>
                      <button onClick={stopCamera} className="absolute right-4 top-1 w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-400">
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}

                {foto && !showCamera && (
                  <div className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 border-cyan-500 bg-cyan-500/10 text-cyan-400 transition-all">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-bold text-sm">Foto Registrada!</span>
                    </div>
                    <button onClick={() => setFoto(null)} className="text-rose-400 hover:text-rose-300 font-bold text-xs bg-rose-500/10 px-3 py-1.5 rounded-lg">
                      Descartar
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 mt-auto">
                <button onClick={handleBaterPonto} disabled={postosValidos.length === 0 || !foto} className="w-full py-5 rounded-[32px] bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 font-black text-xl shadow-[0_0_40px_rgba(52,211,153,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100">
                  BATER PONTO
                </button>
                <button onClick={() => onFalta(postoId, tecnico, simDate)} className="w-full py-4 rounded-[32px] border-2 border-rose-500/30 text-rose-400 font-bold text-sm hover:bg-rose-500/10 hover:border-rose-500/50 active:scale-95 transition-all disabled:opacity-50">
                  Registrar Falta Diária
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 items-center justify-center">
              <div className="relative mb-12 mt-8">
                <div className="absolute inset-0 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="w-48 h-48 rounded-full border-[3px] border-cyan-500/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent animate-[spin_3s_linear_infinite]" style={{ transformOrigin: 'bottom center', height: '50%', top: '0' }}></div>
                  <div className="text-center relative z-10">
                    <span className="block text-5xl font-black text-cyan-400 font-mono tracking-tight">{simDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-3 block bg-slate-950/50 border border-slate-800 px-3 py-1.5 rounded-full">Trabalhando</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl w-full p-6 mb-auto text-center backdrop-blur-sm shadow-inner">
                <p className="text-xs text-slate-400 uppercase tracking-widest">Localização Confirmada</p>
                <p className="text-lg font-bold text-slate-100 mt-2">{postos.find((p:any) => p.id === ativo.postoId)?.nome}</p>
                
                {ativo.atrasoMinutos > 0 && (
                  <div className="mt-5 bg-rose-950/30 border border-rose-500/30 text-rose-400 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" /> Penalidade: Atraso de {ativo.atrasoMinutos}m.
                  </div>
                )}
              </div>

              <button onClick={() => onCheckOut(ativo.id, simDate)} className="w-full py-6 mt-8 rounded-[32px] bg-gradient-to-br from-rose-500 to-red-600 text-white font-black text-xl shadow-[0_0_40px_rgba(225,29,72,0.4)] hover:scale-105 active:scale-95 transition-all">
                FINALIZAR TURNO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}