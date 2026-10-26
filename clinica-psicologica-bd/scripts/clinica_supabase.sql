DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'forma_pagamento') THEN
        CREATE TYPE public.forma_pagamento AS ENUM ('dinheiro','cartao_credito','cartao_debito','pix','convenio');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'modalidade_consulta') THEN
        CREATE TYPE public.modalidade_consulta AS ENUM ('presencial','online');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'motivo_remanejamento') THEN
        CREATE TYPE public.motivo_remanejamento AS ENUM ('falta_paciente','cancelamento_psicologo','adiantamento','remanejamento_emergencial');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prioridade_triagem') THEN
        CREATE TYPE public.prioridade_triagem AS ENUM ('baixa','normal','alta','emergencia');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_comunicacao') THEN
        CREATE TYPE public.status_comunicacao AS ENUM ('rascunho','enviado','visualizado','respondido');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_consulta') THEN
        CREATE TYPE public.status_consulta AS ENUM ('agendada','confirmada','em_andamento','realizada','cancelada','paciente_faltou');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_pagamento') THEN
        CREATE TYPE public.status_pagamento AS ENUM ('pendente','pago_parcial','pago_total','cancelado');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_tratamento') THEN
        CREATE TYPE public.status_tratamento AS ENUM ('ativo','triagem','alta','transferido');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_triagem') THEN
        CREATE TYPE public.status_triagem AS ENUM ('pendente','em_analise','agendado','concluido','cancelado');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_vinculo') THEN
        CREATE TYPE public.status_vinculo AS ENUM ('ativo','encerrado','transferido');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_agendamento') THEN
        CREATE TYPE public.tipo_agendamento AS ENUM ('agendado','encaixe','remarcado');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_analise_ia') THEN
        CREATE TYPE public.tipo_analise_ia AS ENUM ('resumo','evolucao','intervencao','predicao','sentimento');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_comunicacao') THEN
        CREATE TYPE public.tipo_comunicacao AS ENUM ('feedback','tarefa','orientacao','relatorio','modelo');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_lembrete') THEN
        CREATE TYPE public.tipo_lembrete AS ENUM ('24h_antes','1h_antes','pos_consulta');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_servico') THEN
        CREATE TYPE public.tipo_servico AS ENUM ('individual','grupo','casal','familiar');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_usuario') THEN
        CREATE TYPE public.tipo_usuario AS ENUM ('admin','psicologo','cliente');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    data_nascimento DATE NOT NULL,
    tipo public.tipo_usuario NOT NULL,
    data_cadastro TIMESTAMP DEFAULT NOW(),
    ativo BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON public.usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON public.usuarios(tipo);

CREATE TABLE IF NOT EXISTS public.admin_detalhes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    cargo VARCHAR(50) NOT NULL,
    permissao_especial VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS public.psicologos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    crp VARCHAR(20) NOT NULL UNIQUE,
    especialidade VARCHAR(100) NOT NULL,
    abordagem_terapeutica VARCHAR(100),
    valor_consulta DECIMAL(10,2) NOT NULL CHECK (valor_consulta > 0),
    curriculo TEXT,
    supervisor_id UUID REFERENCES public.psicologos(id),
    eh_estagiario BOOLEAN DEFAULT FALSE,
    campus VARCHAR(50),
    sala VARCHAR(20),
    disponivel BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_psicologos_crp ON public.psicologos(crp);
CREATE INDEX IF NOT EXISTS idx_psicologos_supervisor ON public.psicologos(supervisor_id);

CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    endereco VARCHAR(200),
    convenio VARCHAR(50),
    responsavel VARCHAR(100),
    curso VARCHAR(100),
    periodo VARCHAR(20),
    data_ultima_triagem DATE,
    status_tratamento public.status_tratamento DEFAULT 'ativo'::public.status_tratamento
);

CREATE TABLE IF NOT EXISTS public.vinculo_psicologo_paciente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_psicologo UUID NOT NULL REFERENCES public.psicologos(id) ON DELETE CASCADE,
    id_cliente UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    data_inicio_vinculo DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fim_vinculo DATE,
    status_vinculo public.status_vinculo DEFAULT 'ativo'::public.status_vinculo
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_vinculo_ativo ON public.vinculo_psicologo_paciente (id_psicologo, id_cliente) WHERE (status_vinculo = 'ativo'::public.status_vinculo);

CREATE INDEX IF NOT EXISTS idx_vinculo_cliente ON public.vinculo_psicologo_paciente(id_cliente);
CREATE INDEX IF NOT EXISTS idx_vinculo_psicologo ON public.vinculo_psicologo_paciente(id_psicologo);

CREATE TABLE IF NOT EXISTS public.triagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_cliente UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    id_psicologo UUID REFERENCES public.psicologos(id),
    data_solicitacao TIMESTAMP DEFAULT NOW(),
    data_triagem TIMESTAMP,
    status public.status_triagem DEFAULT 'pendente'::public.status_triagem,
    motivo TEXT,
    prioridade public.prioridade_triagem DEFAULT 'normal'::public.prioridade_triagem,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_triagens_status ON public.triagens(status);
CREATE INDEX IF NOT EXISTS idx_triagens_cliente ON public.triagens(id_cliente);

CREATE TABLE IF NOT EXISTS public.consultas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_cliente UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    id_psicologo UUID NOT NULL REFERENCES public.psicologos(id) ON DELETE CASCADE,
    id_vinculo UUID NOT NULL REFERENCES public.vinculo_psicologo_paciente(id) ON DELETE CASCADE,
    data_hora_consulta TIMESTAMP NOT NULL,
    duracao INTEGER DEFAULT 50 CHECK (duracao > 0),
    status public.status_consulta DEFAULT 'agendada'::public.status_consulta,
    tipo_agendamento public.tipo_agendamento DEFAULT 'agendado'::public.tipo_agendamento,
    modalidade public.modalidade_consulta DEFAULT 'presencial'::public.modalidade_consulta,
    local_atendimento VARCHAR(100),
    tipo_servico public.tipo_servico DEFAULT 'individual'::public.tipo_servico,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_psicologo_horario ON public.consultas (id_psicologo, data_hora_consulta);
CREATE INDEX IF NOT EXISTS idx_consultas_data_hora ON public.consultas(data_hora_consulta);
CREATE INDEX IF NOT EXISTS idx_consultas_status ON public.consultas(status);
CREATE INDEX IF NOT EXISTS idx_consultas_cliente_psicologo ON public.consultas(id_cliente, id_psicologo);
CREATE INDEX IF NOT EXISTS idx_consultas_vinculo ON public.consultas(id_vinculo);

CREATE TABLE IF NOT EXISTS public.pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_consulta UUID NOT NULL UNIQUE REFERENCES public.consultas(id) ON DELETE CASCADE,
    valor_total DECIMAL(10,2) NOT NULL CHECK (valor_total > 0),
    forma_pagamento public.forma_pagamento NOT NULL,
    status_pagamento public.status_pagamento DEFAULT 'pendente'::public.status_pagamento,
    data_pagamento TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON public.pagamentos(status_pagamento);

CREATE TABLE IF NOT EXISTS public.prontuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_consulta UUID NOT NULL UNIQUE REFERENCES public.consultas(id) ON DELETE CASCADE,
    id_psicologo UUID NOT NULL REFERENCES public.psicologos(id) ON DELETE CASCADE,
    id_cliente UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    data_anotacao TIMESTAMP DEFAULT NOW(),
    conteudo TEXT NOT NULL,
    status_clinico VARCHAR(50),
    humor_predominante VARCHAR(30),
    revisao_medicacao BOOLEAN DEFAULT FALSE,
    intervencoes TEXT,
    plano_proximo TEXT
);

CREATE INDEX IF NOT EXISTS idx_prontuario_cliente ON public.prontuario(id_cliente);
CREATE INDEX IF NOT EXISTS idx_prontuario_psicologo ON public.prontuario(id_psicologo);

CREATE TABLE IF NOT EXISTS public.remanejamento_consultas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_consulta_original UUID NOT NULL REFERENCES public.consultas(id) ON DELETE CASCADE,
    id_consulta_nova UUID NOT NULL REFERENCES public.consultas(id) ON DELETE CASCADE,
    motivo public.motivo_remanejamento NOT NULL,
    data_remanejamento TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_consulta_original ON public.remanejamento_consultas (id_consulta_original);

CREATE TABLE IF NOT EXISTS public.lembretes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_consulta UUID NOT NULL REFERENCES public.consultas(id) ON DELETE CASCADE,
    data_envio TIMESTAMP,
    enviado BOOLEAN DEFAULT FALSE,
    tipo_lembrete public.tipo_lembrete NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lembretes_enviado ON public.lembretes(enviado);

CREATE TABLE IF NOT EXISTS public.comunicacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_consulta UUID NOT NULL REFERENCES public.consultas(id) ON DELETE CASCADE,
    id_psicologo UUID NOT NULL REFERENCES public.psicologos(id) ON DELETE CASCADE,
    id_cliente UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    assunto VARCHAR(200) NOT NULL,
    conteudo TEXT NOT NULL,
    tipo public.tipo_comunicacao DEFAULT 'feedback'::public.tipo_comunicacao,
    status public.status_comunicacao DEFAULT 'rascunho'::public.status_comunicacao,
    data_envio TIMESTAMP,
    data_visualizacao TIMESTAMP,
    modelo_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comunicacoes_consulta ON public.comunicacoes(id_consulta);
CREATE INDEX IF NOT EXISTS idx_comunicacoes_cliente ON public.comunicacoes(id_cliente);
CREATE INDEX IF NOT EXISTS idx_comunicacoes_status ON public.comunicacoes(status);

CREATE TABLE IF NOT EXISTS public.anexos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_comunicacao UUID NOT NULL REFERENCES public.comunicacoes(id) ON DELETE CASCADE,
    nome_arquivo VARCHAR(200) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    tipo_arquivo VARCHAR(50),
    tamanho INTEGER,
    data_upload TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anexos_comunicacao ON public.anexos(id_comunicacao);

CREATE TABLE IF NOT EXISTS public.modelos_comunicacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_psicologo UUID NOT NULL REFERENCES public.psicologos(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    assunto VARCHAR(200) NOT NULL,
    conteudo TEXT NOT NULL,
    tipo public.tipo_comunicacao DEFAULT 'feedback'::public.tipo_comunicacao,
    compartilhado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modelos_psicologo ON public.modelos_comunicacao(id_psicologo);

CREATE TABLE IF NOT EXISTS public.analises_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_prontuario UUID NOT NULL REFERENCES public.prontuario(id) ON DELETE CASCADE,
    id_consulta UUID NOT NULL REFERENCES public.consultas(id) ON DELETE CASCADE,
    id_psicologo UUID NOT NULL REFERENCES public.psicologos(id) ON DELETE CASCADE,
    tipo_analise public.tipo_analise_ia NOT NULL,
    conteudo TEXT NOT NULL,
    dados_processados JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_analise_ia_unique ON public.analises_ia (id_prontuario, tipo_analise);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (
        auth_user_id,
        nome,
        email,
        telefone,
        data_nascimento,
        tipo
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
        (COALESCE(NEW.raw_user_meta_data->>'data_nascimento', '2000-01-01'))::DATE,
        COALESCE((NEW.raw_user_meta_data->>'tipo')::tipo_usuario, 'cliente')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_triagens_updated_at ON public.triagens;
CREATE TRIGGER update_triagens_updated_at
    BEFORE UPDATE ON public.triagens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_comunicacoes_updated_at ON public.comunicacoes;
CREATE TRIGGER update_comunicacoes_updated_at
    BEFORE UPDATE ON public.comunicacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_modelos_comunicacao_updated_at ON public.modelos_comunicacao;
CREATE TRIGGER update_modelos_comunicacao_updated_at
    BEFORE UPDATE ON public.modelos_comunicacao
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.atualizar_vinculo_ao_encerrar_consulta() RETURNS trigger
    LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status IN ('realizada', 'cancelada', 'paciente_faltou') THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.consultas
            WHERE id_vinculo = NEW.id_vinculo
            AND id <> NEW.id
            AND status NOT IN ('realizada', 'cancelada', 'paciente_faltou')
        ) THEN
            UPDATE public.vinculo_psicologo_paciente
            SET status_vinculo = 'encerrado',
                data_fim_vinculo = CURRENT_DATE
            WHERE id = NEW.id_vinculo
            AND status_vinculo = 'ativo';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_atualizar_vinculo ON public.consultas;
CREATE TRIGGER trigger_atualizar_vinculo AFTER UPDATE OF status ON public.consultas FOR EACH ROW EXECUTE FUNCTION public.atualizar_vinculo_ao_encerrar_consulta();

CREATE OR REPLACE FUNCTION public.check_prontuario_consulta_realizada() RETURNS trigger
    LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.consultas
        WHERE id = NEW.id_consulta
        AND status = 'realizada'
    ) THEN
        RAISE EXCEPTION 'Só é possível criar prontuário para consulta realizada';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_prontuario ON public.prontuario;
CREATE TRIGGER trigger_check_prontuario BEFORE INSERT ON public.prontuario FOR EACH ROW EXECUTE FUNCTION public.check_prontuario_consulta_realizada();

CREATE OR REPLACE FUNCTION public.criar_lembretes_ao_agendar() RETURNS trigger
    LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public.lembretes (id_consulta, tipo_lembrete, data_envio)
    VALUES (NEW.id, '24h_antes', NEW.data_hora_consulta - INTERVAL '24 hours'),
           (NEW.id, '1h_antes', NEW.data_hora_consulta - INTERVAL '1 hour');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_criar_lembretes ON public.consultas;
CREATE TRIGGER trigger_criar_lembretes AFTER INSERT ON public.consultas FOR EACH ROW EXECUTE FUNCTION public.criar_lembretes_ao_agendar();

CREATE OR REPLACE FUNCTION public.criar_pagamento_ao_agendar() RETURNS trigger
    LANGUAGE plpgsql AS $$
DECLARE
    v_valor DECIMAL(10,2);
BEGIN
    SELECT valor_consulta INTO v_valor
    FROM public.psicologos
    WHERE id = NEW.id_psicologo;
    
    INSERT INTO public.pagamentos (id_consulta, valor_total, forma_pagamento, status_pagamento)
    VALUES (NEW.id, v_valor, 'pix', 'pendente');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_criar_pagamento ON public.consultas;
CREATE TRIGGER trigger_criar_pagamento AFTER INSERT ON public.consultas FOR EACH ROW EXECUTE FUNCTION public.criar_pagamento_ao_agendar();

CREATE OR REPLACE FUNCTION public.sp_agendar_consulta(
    p_id_cliente UUID,
    p_id_psicologo UUID,
    p_data_hora TIMESTAMP,
    p_observacoes TEXT DEFAULT NULL,
    p_modalidade VARCHAR(20) DEFAULT 'presencial',
    p_local_atendimento VARCHAR(100) DEFAULT NULL,
    p_tipo_servico VARCHAR(20) DEFAULT 'individual'
)
RETURNS UUID AS $$
DECLARE
    v_id_vinculo UUID;
    v_consulta_id UUID;
    v_id_triagem UUID;
    v_triagem_temp UUID;
BEGIN
    SELECT id INTO v_id_vinculo
    FROM public.vinculo_psicologo_paciente
    WHERE id_psicologo = p_id_psicologo 
    AND id_cliente = p_id_cliente
    AND status_vinculo = 'ativo'
    ORDER BY data_inicio_vinculo DESC
    LIMIT 1;
    
    IF v_id_vinculo IS NULL THEN
        INSERT INTO public.vinculo_psicologo_paciente (id_psicologo, id_cliente, data_inicio_vinculo, status_vinculo)
        VALUES (p_id_psicologo, p_id_cliente, CURRENT_DATE, 'ativo')
        RETURNING id INTO v_id_vinculo;
    END IF;
    
    INSERT INTO public.consultas (id_cliente, id_psicologo, id_vinculo, data_hora_consulta, observacoes, modalidade, local_atendimento, tipo_servico)
    VALUES (p_id_cliente, p_id_psicologo, v_id_vinculo, p_data_hora, p_observacoes, p_modalidade::modalidade_consulta, p_local_atendimento, p_tipo_servico::tipo_servico)
    RETURNING id INTO v_consulta_id;
    
    SELECT id INTO v_triagem_temp
    FROM public.triagens
    WHERE id_cliente = p_id_cliente 
    AND status = 'pendente'
    ORDER BY data_solicitacao
    LIMIT 1;
    
    IF v_triagem_temp IS NOT NULL THEN
        UPDATE public.triagens 
        SET status = 'agendado',
            id_psicologo = p_id_psicologo,
            data_triagem = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_triagem_temp
        RETURNING id INTO v_id_triagem;
        
        UPDATE public.clientes 
        SET status_tratamento = 'ativo',
            data_ultima_triagem = CURRENT_DATE
        WHERE id = p_id_cliente;
    END IF;
    
    RETURN v_consulta_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.sp_cancelar_consulta(
    p_consulta_id UUID,
    p_motivo VARCHAR(100) DEFAULT 'Cancelado pelo paciente'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_id_cliente UUID;
BEGIN
    SELECT id_cliente INTO v_id_cliente
    FROM public.consultas
    WHERE id = p_consulta_id;
    
    IF NOT EXISTS (
        SELECT 1 FROM public.consultas 
        WHERE id = p_consulta_id 
        AND status IN ('agendada', 'confirmada')
    ) THEN
        RETURN FALSE;
    END IF;
    
    UPDATE public.consultas 
    SET status = 'cancelada',
        observacoes = COALESCE(observacoes, '') || ' | Motivo: ' || p_motivo
    WHERE id = p_consulta_id;
    
    UPDATE public.pagamentos 
    SET status_pagamento = 'cancelado'
    WHERE id_consulta = p_consulta_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.sp_realizar_consulta(
    p_consulta_id UUID,
    p_prontuario TEXT,
    p_status_clinico VARCHAR(50) DEFAULT NULL,
    p_humor_predominante VARCHAR(30) DEFAULT NULL,
    p_revisao_medicacao BOOLEAN DEFAULT FALSE,
    p_intervencoes TEXT DEFAULT NULL,
    p_plano_proximo TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_status_atual TEXT;
    v_id_cliente UUID;
    v_id_psicologo UUID;
BEGIN
    SELECT status::TEXT, id_cliente, id_psicologo 
    INTO v_status_atual, v_id_cliente, v_id_psicologo
    FROM public.consultas
    WHERE id = p_consulta_id;
    
    IF v_status_atual IS NULL THEN
        RETURN FALSE;
    END IF;
    
    IF v_status_atual NOT IN ('agendada', 'confirmada', 'em_andamento') THEN
        RETURN FALSE;
    END IF;
    
    UPDATE public.consultas 
    SET status = 'realizada'
    WHERE id = p_consulta_id;
    
    INSERT INTO public.prontuario (id_consulta, id_psicologo, id_cliente, conteudo, status_clinico, humor_predominante, revisao_medicacao, intervencoes, plano_proximo)
    VALUES (p_consulta_id, v_id_psicologo, v_id_cliente, p_prontuario, p_status_clinico, p_humor_predominante, p_revisao_medicacao, p_intervencoes, p_plano_proximo);
    
    UPDATE public.pagamentos 
    SET status_pagamento = 'pago_total',
        data_pagamento = CURRENT_TIMESTAMP
    WHERE id_consulta = p_consulta_id
    AND status_pagamento = 'pendente';
    
    INSERT INTO public.lembretes (id_consulta, tipo_lembrete)
    VALUES (p_consulta_id, 'pos_consulta');
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.sp_registrar_falta(p_id_consulta UUID) RETURNS boolean
    LANGUAGE plpgsql AS $$
BEGIN
    UPDATE public.consultas
    SET status = 'paciente_faltou'
    WHERE id = p_id_consulta
    AND status IN ('agendada', 'confirmada');
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_remanejar_consulta(
    p_id_consulta UUID,
    p_nova_data_hora TIMESTAMP,
    p_motivo public.motivo_remanejamento
) RETURNS UUID
    LANGUAGE plpgsql AS $$
DECLARE
    v_id_nova_consulta UUID;
    v_id_cliente UUID;
    v_id_psicologo UUID;
    v_id_vinculo UUID;
    v_observacoes TEXT;
    v_modalidade modalidade_consulta;
    v_local_atendimento VARCHAR(100);
    v_tipo_servico tipo_servico;
BEGIN
    SELECT id_cliente, id_psicologo, id_vinculo, observacoes, modalidade, local_atendimento, tipo_servico
    INTO v_id_cliente, v_id_psicologo, v_id_vinculo, v_observacoes, v_modalidade, v_local_atendimento, v_tipo_servico
    FROM public.consultas
    WHERE id = p_id_consulta
    AND status NOT IN ('realizada', 'cancelada', 'paciente_faltou');
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Consulta não encontrada ou não pode ser remanejada';
    END IF;
    UPDATE public.consultas
    SET status = 'cancelada'
    WHERE id = p_id_consulta;
    INSERT INTO public.consultas (id_vinculo, id_cliente, id_psicologo, data_hora_consulta, status, tipo_agendamento, modalidade, local_atendimento, tipo_servico)
    SELECT id_vinculo, id_cliente, id_psicologo, p_nova_data_hora, 'agendada', 'remarcado', modalidade, local_atendimento, tipo_servico
    FROM public.consultas
    WHERE id = p_id_consulta
    RETURNING id INTO v_id_nova_consulta;
    INSERT INTO public.remanejamento_consultas (id_consulta_original, id_consulta_nova, motivo)
    VALUES (p_id_consulta, v_id_nova_consulta, p_motivo);
    RETURN v_id_nova_consulta;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_criar_triagem(
    p_id_cliente UUID,
    p_motivo TEXT,
    p_prioridade VARCHAR(20) DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
    v_triagem_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.clientes WHERE id = p_id_cliente) THEN
        RAISE EXCEPTION 'Cliente não encontrado';
    END IF;
    INSERT INTO public.triagens (id_cliente, motivo, prioridade, status)
    VALUES (p_id_cliente, p_motivo, p_prioridade::prioridade_triagem, 'pendente')
    RETURNING id INTO v_triagem_id;
    UPDATE public.clientes 
    SET status_tratamento = 'triagem',
        data_ultima_triagem = CURRENT_DATE
    WHERE id = p_id_cliente;
    RETURN v_triagem_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.sp_enviar_feedback(
    p_id_consulta UUID,
    p_assunto VARCHAR(200),
    p_conteudo TEXT,
    p_tipo VARCHAR(20) DEFAULT 'feedback'
)
RETURNS UUID AS $$
DECLARE
    v_comunicacao_id UUID;
    v_id_cliente UUID;
    v_id_psicologo UUID;
BEGIN
    SELECT id_cliente, id_psicologo INTO v_id_cliente, v_id_psicologo
    FROM public.consultas
    WHERE id = p_id_consulta;
    IF v_id_cliente IS NULL THEN
        RETURN NULL;
    END IF;
    INSERT INTO public.comunicacoes (id_consulta, id_psicologo, id_cliente, assunto, conteudo, tipo, status, data_envio)
    VALUES (p_id_consulta, v_id_psicologo, v_id_cliente, p_assunto, p_conteudo, p_tipo::tipo_comunicacao, 'enviado', CURRENT_TIMESTAMP)
    RETURNING id INTO v_comunicacao_id;
    RETURN v_comunicacao_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.sp_gerar_analise_ia(
    p_id_prontuario UUID,
    p_tipo public.tipo_analise_ia,
    p_conteudo TEXT
) RETURNS UUID
    LANGUAGE plpgsql AS $$
DECLARE
    v_id UUID;
    v_id_consulta UUID;
    v_id_psicologo UUID;
BEGIN
    SELECT id_consulta, id_psicologo INTO v_id_consulta, v_id_psicologo
    FROM public.prontuario
    WHERE id = p_id_prontuario;
    IF v_id_consulta IS NULL THEN
        RETURN NULL;
    END IF;
    INSERT INTO public.analises_ia (id_prontuario, id_consulta, id_psicologo, tipo_analise, conteudo)
    VALUES (p_id_prontuario, v_id_consulta, v_id_psicologo, p_tipo, p_conteudo)
    ON CONFLICT (id_prontuario, tipo_analise) DO UPDATE
    SET conteudo = EXCLUDED.conteudo,
        created_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$;

CREATE OR REPLACE VIEW public.vw_pacientes_ativos AS
 SELECT v.id,
    v.id_cliente,
    uc.nome AS cliente,
    v.id_psicologo,
    up.nome AS psicologo,
    v.data_inicio_vinculo,
    v.data_fim_vinculo,
    v.status_vinculo
   FROM ((public.vinculo_psicologo_paciente v
     JOIN public.usuarios uc ON ((uc.id = v.id_cliente)))
     JOIN public.usuarios up ON ((up.id = v.id_psicologo)))
  WHERE (v.status_vinculo = 'ativo'::public.status_vinculo);

CREATE OR REPLACE VIEW public.vw_prontuario_completo AS
 SELECT p.id,
    p.id_consulta,
    p.id_cliente,
    uc.nome AS cliente,
    p.id_psicologo,
    up.nome AS psicologo,
    p.data_anotacao,
    p.conteudo,
    p.status_clinico,
    p.humor_predominante,
    p.revisao_medicacao,
    p.intervencoes,
    p.plano_proximo
   FROM ((public.prontuario p
     JOIN public.usuarios uc ON ((uc.id = p.id_cliente)))
     JOIN public.usuarios up ON ((up.id = p.id_psicologo)));

CREATE OR REPLACE VIEW public.vw_triagens_pendentes AS
 SELECT t.id,
    t.id_cliente,
    u.nome AS cliente,
    t.data_solicitacao,
    t.prioridade,
    t.observacoes,
    t.status
   FROM (public.triagens t
     JOIN public.usuarios u ON ((u.id = t.id_cliente)))
  WHERE (t.status = ANY (ARRAY['pendente'::public.status_triagem, 'em_analise'::public.status_triagem]))
  ORDER BY CASE t.prioridade WHEN 'emergencia'::public.prioridade_triagem THEN 1 WHEN 'alta'::public.prioridade_triagem THEN 2 WHEN 'normal'::public.prioridade_triagem THEN 3 WHEN 'baixa'::public.prioridade_triagem THEN 4 ELSE NULL::integer END, t.data_solicitacao;

CREATE OR REPLACE VIEW public.vw_dashboard_admin AS
SELECT 
    (SELECT COUNT(*) FROM public.clientes c JOIN public.usuarios u ON c.id_usuario = u.id WHERE u.ativo = TRUE) AS pacientes_ativos,
    (SELECT COUNT(*) FROM public.triagens WHERE status = 'pendente') AS triagens_pendentes,
    (SELECT COUNT(*) FROM public.consultas WHERE DATE(data_hora_consulta) = CURRENT_DATE) AS sessoes_hoje,
    (SELECT COUNT(*) FROM public.consultas WHERE status = 'agendada' AND data_hora_consulta > CURRENT_TIMESTAMP) AS agendamentos_futuros,
    (SELECT COUNT(*) FROM public.comunicacoes WHERE status = 'rascunho') AS rascunhos_pendentes,
    (SELECT COUNT(*) FROM public.comunicacoes WHERE status = 'enviado' AND data_envio > CURRENT_DATE - INTERVAL '7 days') AS enviados_ultima_semana,
    (SELECT COUNT(*) FROM public.prontuario WHERE DATE(data_anotacao) = CURRENT_DATE) AS prontuarios_hoje;

CREATE OR REPLACE VIEW public.vw_relatorio_consultas AS
SELECT 
    c.id AS consulta_id,
    u1.nome AS paciente_nome,
    u1.telefone AS paciente_telefone,
    u1.email AS paciente_email,
    cl.curso AS paciente_curso,
    cl.status_tratamento::TEXT AS status_tratamento,
    u2.nome AS psicologo_nome,
    u2.email AS psicologo_email,
    ps.especialidade AS psicologo_especialidade,
    ps.campus,
    ps.sala,
    c.data_hora_consulta,
    c.status::TEXT AS status_consulta,
    c.tipo_agendamento::TEXT AS tipo_agendamento,
    c.modalidade::TEXT AS modalidade,
    c.local_atendimento,
    c.tipo_servico::TEXT AS tipo_servico,
    pg.valor_total,
    pg.status_pagamento::TEXT AS status_pagamento,
    pg.forma_pagamento::TEXT AS forma_pagamento,
    pg.data_pagamento,
    pr.status_clinico,
    pr.humor_predominante,
    pr.revisao_medicacao,
    LEFT(pr.conteudo, 100) AS prontuario_resumido,
    c.data_criacao AS data_agendamento,
    v.status_vinculo::TEXT AS status_vinculo,
    t.status::TEXT AS status_triagem,
    t.prioridade::TEXT AS prioridade_triagem
FROM public.consultas c
JOIN public.clientes cl ON c.id_cliente = cl.id
JOIN public.usuarios u1 ON cl.id_usuario = u1.id
JOIN public.psicologos ps ON c.id_psicologo = ps.id
JOIN public.usuarios u2 ON ps.id_usuario = u2.id
LEFT JOIN public.pagamentos pg ON c.id = pg.id_consulta
LEFT JOIN public.prontuario pr ON c.id = pr.id_consulta
LEFT JOIN public.vinculo_psicologo_paciente v ON c.id_vinculo = v.id
LEFT JOIN public.triagens t ON cl.id = t.id_cliente AND t.status != 'cancelado'
ORDER BY c.data_hora_consulta DESC;

CREATE OR REPLACE VIEW public.vw_agenda_dia AS
SELECT 
    c.id AS consulta_id,
    u1.nome AS paciente,
    u2.nome AS psicologo,
    c.data_hora_consulta,
    c.status::TEXT AS status,
    c.modalidade::TEXT AS modalidade,
    c.local_atendimento,
    c.tipo_servico::TEXT AS tipo_servico,
    c.duracao
FROM public.consultas c
JOIN public.clientes cl ON c.id_cliente = cl.id
JOIN public.usuarios u1 ON cl.id_usuario = u1.id
JOIN public.psicologos ps ON c.id_psicologo = ps.id
JOIN public.usuarios u2 ON ps.id_usuario = u2.id
WHERE DATE(c.data_hora_consulta) = CURRENT_DATE
AND c.status NOT IN ('cancelada', 'paciente_faltou')
ORDER BY c.data_hora_consulta;

CREATE OR REPLACE VIEW public.vw_faturamento_mensal AS
SELECT 
    DATE_TRUNC('month', c.data_hora_consulta) AS mes,
    u.nome AS psicologo,
    COUNT(c.id) AS total_consultas,
    SUM(pg.valor_total) AS faturamento_bruto,
    SUM(CASE WHEN pg.status_pagamento = 'pago_total' THEN pg.valor_total ELSE 0 END) AS faturamento_recebido,
    AVG(pg.valor_total) AS ticket_medio,
    COUNT(CASE WHEN c.modalidade = 'presencial' THEN 1 END) AS consultas_presenciais,
    COUNT(CASE WHEN c.modalidade = 'online' THEN 1 END) AS consultas_online
FROM public.consultas c
JOIN public.psicologos ps ON c.id_psicologo = ps.id
JOIN public.usuarios u ON ps.id_usuario = u.id
LEFT JOIN public.pagamentos pg ON c.id = pg.id_consulta
WHERE c.status = 'realizada'
GROUP BY DATE_TRUNC('month', c.data_hora_consulta), u.nome
ORDER BY mes DESC, u.nome;

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_detalhes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psicologos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vinculo_psicologo_paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prontuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remanejamento_consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelos_comunicacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analises_ia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios veem seu proprio perfil" ON public.usuarios;
CREATE POLICY "Usuarios veem seu proprio perfil" ON public.usuarios
    FOR SELECT
    TO authenticated
    USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios atualizam seu proprio perfil" ON public.usuarios;
CREATE POLICY "Usuarios atualizam seu proprio perfil" ON public.usuarios
    FOR UPDATE
    TO authenticated
    USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Psicologos visiveis para todos" ON public.psicologos;
CREATE POLICY "Psicologos visiveis para todos" ON public.psicologos
    FOR SELECT
    TO authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "Admin e psicologos podem gerenciar psicologos" ON public.psicologos;
CREATE POLICY "Admin e psicologos podem gerenciar psicologos" ON public.psicologos
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_user_id = auth.uid()
            AND tipo IN ('admin', 'psicologo')
        )
    );

DROP POLICY IF EXISTS "Psicologo ve seus clientes" ON public.clientes;
CREATE POLICY "Psicologo ve seus clientes" ON public.clientes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.vinculo_psicologo_paciente v
            JOIN public.psicologos p ON v.id_psicologo = p.id
            JOIN public.usuarios u ON p.id_usuario = u.id
            WHERE v.id_cliente = id
            AND u.auth_user_id = auth.uid()
            AND v.status_vinculo = 'ativo'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = id_usuario
            AND auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_user_id = auth.uid()
            AND tipo = 'admin'
        )
    );

DROP POLICY IF EXISTS "Cliente ve suas consultas" ON public.consultas;
CREATE POLICY "Cliente ve suas consultas" ON public.consultas
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.clientes c
            JOIN public.usuarios u ON c.id_usuario = u.id
            WHERE c.id = id_cliente
            AND u.auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.psicologos p
            JOIN public.usuarios u ON p.id_usuario = u.id
            WHERE p.id = id_psicologo
            AND u.auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_user_id = auth.uid()
            AND tipo = 'admin'
        )
    );

DROP POLICY IF EXISTS "Cliente pode agendar consultas" ON public.consultas;
CREATE POLICY "Cliente pode agendar consultas" ON public.consultas
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clientes c
            JOIN public.usuarios u ON c.id_usuario = u.id
            WHERE c.id = id_cliente
            AND u.auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.psicologos p
            JOIN public.usuarios u ON p.id_usuario = u.id
            WHERE p.id = id_psicologo
            AND u.auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_user_id = auth.uid()
            AND tipo = 'admin'
        )
    );

DROP POLICY IF EXISTS "Psicologo ve prontuarios de seus pacientes" ON public.prontuario;
CREATE POLICY "Psicologo ve prontuarios de seus pacientes" ON public.prontuario
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.psicologos p
            JOIN public.usuarios u ON p.id_usuario = u.id
            WHERE p.id = id_psicologo
            AND u.auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.clientes c
            JOIN public.usuarios u ON c.id_usuario = u.id
            WHERE c.id = id_cliente
            AND u.auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_user_id = auth.uid()
            AND tipo = 'admin'
        )
    );

DROP POLICY IF EXISTS "Psicologo pode criar prontuario" ON public.prontuario;
CREATE POLICY "Psicologo pode criar prontuario" ON public.prontuario
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.psicologos p
            JOIN public.usuarios u ON p.id_usuario = u.id
            WHERE p.id = id_psicologo
            AND u.auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_user_id = auth.uid()
            AND tipo = 'admin'
        )
    );

DROP POLICY IF EXISTS "Psicologo ve comunicacoes" ON public.comunicacoes;
CREATE POLICY "Psicologo ve comunicacoes" ON public.comunicacoes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.psicologos p
            JOIN public.usuarios u ON p.id_usuario = u.id
            WHERE p.id = id_psicologo
            AND u.auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.clientes c
            JOIN public.usuarios u ON c.id_usuario = u.id
            WHERE c.id = id_cliente
            AND u.auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_user_id = auth.uid()
            AND tipo = 'admin'
        )
    );

DROP POLICY IF EXISTS "Psicologo pode enviar comunicacoes" ON public.comunicacoes;
CREATE POLICY "Psicologo pode enviar comunicacoes" ON public.comunicacoes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.psicologos p
            JOIN public.usuarios u ON p.id_usuario = u.id
            WHERE p.id = id_psicologo
            AND u.auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_user_id = auth.uid()
            AND tipo = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admin ve tudo" ON public.pagamentos;
CREATE POLICY "Admin ve tudo" ON public.pagamentos
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_user_id = auth.uid()
            AND tipo = 'admin'
        )
    );

DROP POLICY IF EXISTS "Cliente ve seus pagamentos" ON public.pagamentos;
CREATE POLICY "Cliente ve seus pagamentos" ON public.pagamentos
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.consultas c
            JOIN public.clientes cl ON c.id_cliente = cl.id
            JOIN public.usuarios u ON cl.id_usuario = u.id
            WHERE c.id = id_consulta
            AND u.auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Psicologo ve pagamentos de seus pacientes" ON public.pagamentos;
CREATE POLICY "Psicologo ve pagamentos de seus pacientes" ON public.pagamentos
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.consultas c
            JOIN public.psicologos p ON c.id_psicologo = p.id
            JOIN public.usuarios u ON p.id_usuario = u.id
            WHERE c.id = id_consulta
            AND u.auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admin ve todas as triagens" ON public.triagens;
CREATE POLICY "Admin ve todas as triagens" ON public.triagens
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE auth_user_id = auth.uid()
            AND tipo = 'admin'
        )
    );

DROP POLICY IF EXISTS "Psicologo ve triagens" ON public.triagens;
CREATE POLICY "Psicologo ve triagens" ON public.triagens
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.psicologos p
            JOIN public.usuarios u ON p.id_usuario = u.id
            WHERE p.id = id_psicologo
            AND u.auth_user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.clientes c
            JOIN public.usuarios u ON c.id_usuario = u.id
            WHERE c.id = id_cliente
            AND u.auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Cliente ve sua propria triagem" ON public.triagens;
CREATE POLICY "Cliente ve sua propria triagem" ON public.triagens
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.clientes c
            JOIN public.usuarios u ON c.id_usuario = u.id
            WHERE c.id = id_cliente
            AND u.auth_user_id = auth.uid()
        )
    );