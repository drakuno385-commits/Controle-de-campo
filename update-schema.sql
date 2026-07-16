-- 1. Adicionar prestadora_id na tabela apontamentos
ALTER TABLE public.apontamentos ADD COLUMN IF NOT EXISTS prestadora_id uuid REFERENCES public.empresas(id) ON DELETE SET NULL;

-- 2. Criar a tabela de histórico de vínculos
CREATE TABLE IF NOT EXISTS public.historico_vinculos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  posto_id uuid REFERENCES public.postos(id) ON DELETE CASCADE,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE,
  data_implantacao date NOT NULL,
  data_encerramento date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Configurar Segurança (RLS) para o histórico
ALTER TABLE public.historico_vinculos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura para autenticados" ON public.historico_vinculos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir leitura anonima app" ON public.historico_vinculos FOR SELECT TO anon USING (true);
CREATE POLICY "Permitir gravação para autenticados" ON public.historico_vinculos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Opcional: Para evitar nulos nos apontamentos antigos, vamos preenchê-los retroativamente baseados nos vínculos atuais
UPDATE public.apontamentos a
SET prestadora_id = p.prestadora_id
FROM public.postos p
WHERE a.posto_id = p.id AND a.prestadora_id IS NULL;
