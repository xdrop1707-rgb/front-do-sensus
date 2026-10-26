##PARTE 1 - ENUMS E TABELAS

CREATE TYPE tipo_usuario AS ENUM ('admin', 'psicologo', 'cliente');
CREATE TYPE status_consulta AS ENUM ('agendada', 'confirmada', 'em_andamento', 'realizada', 'cancelada', 'paciente_faltou');
CREATE TYPE tipo_agendamento AS ENUM ('agendado', 'encaixe', 'remarcado');
CREATE TYPE status_vinculo AS ENUM ('ativo', 'encerrado', 'transferido');
CREATE TYPE forma_pagamento AS ENUM ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'convenio');
CREATE TYPE status_pagamento AS ENUM ('pendente', 'pago_parcial', 'pago_total', 'cancelado');
CREATE TYPE motivo_remanejamento AS ENUM ('falta_paciente', 'cancelamento_psicologo', 'adiantamento', 'remanejamento_emergencial');
CREATE TYPE tipo_lembrete AS ENUM ('24h_antes', '1h_antes', 'pos_consulta');
CREATE TYPE status_triagem AS ENUM ('pendente', 'em_analise', 'agendado', 'concluido', 'cancelado');
CREATE TYPE prioridade_triagem AS ENUM ('baixa', 'normal', 'alta', 'emergencia');
CREATE TYPE status_tratamento AS ENUM ('ativo', 'triagem', 'alta', 'transferido');
CREATE TYPE tipo_comunicacao AS ENUM ('feedback', 'tarefa', 'orientacao', 'relatorio', 'modelo');
CREATE TYPE status_comunicacao AS ENUM ('rascunho', 'enviado', 'visualizado', 'respondido');
CREATE TYPE tipo_analise_ia AS ENUM ('resumo', 'evolucao', 'intervencao', 'predicao', 'sentimento');
CREATE TYPE modalidade_consulta AS ENUM ('presencial', 'online');
CREATE TYPE tipo_servico AS ENUM ('individual', 'grupo', 'casal', 'familiar');

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,
    telefone VARCHAR(15) NOT NULL,
    data_nascimento DATE NOT NULL,
    tipo tipo_usuario NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_usuarios_cpf ON usuarios(cpf);

CREATE TABLE admin_detalhes (
    id_usuario INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    cargo VARCHAR(50) NOT NULL,
    permissao_especial VARCHAR(100)
);

CREATE TABLE psicologos (
    id_usuario INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    crp VARCHAR(20) NOT NULL UNIQUE,
    especialidade VARCHAR(100) NOT NULL,
    abordagem_terapeutica VARCHAR(100),
    valor_consulta DECIMAL(10,2) NOT NULL CHECK (valor_consulta > 0),
    curriculo TEXT,
    supervisor_id INTEGER REFERENCES psicologos(id_usuario),
    eh_estagiario BOOLEAN DEFAULT FALSE,
    campus VARCHAR(50),
    sala VARCHAR(20),
    disponivel BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_psicologos_crp ON psicologos(crp);
CREATE INDEX idx_psicologos_supervisor ON psicologos(supervisor_id);

CREATE TABLE clientes (
    id_usuario INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    endereco VARCHAR(200),
    convenio VARCHAR(50),
    responsavel VARCHAR(100),
    curso VARCHAR(100),
    periodo VARCHAR(20),
    data_ultima_triagem DATE,
    status_tratamento status_tratamento DEFAULT 'ativo'
);

CREATE TABLE vinculo_psicologo_paciente (
    id SERIAL PRIMARY KEY,
    id_psicologo INTEGER NOT NULL REFERENCES psicologos(id_usuario) ON DELETE CASCADE,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id_usuario) ON DELETE CASCADE,
    data_inicio_vinculo DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fim_vinculo DATE,
    status_vinculo status_vinculo DEFAULT 'ativo'
);

CREATE UNIQUE INDEX uk_vinculo_ativo ON vinculo_psicologo_paciente (id_psicologo, id_cliente) 
WHERE status_vinculo = 'ativo';

CREATE INDEX idx_vinculo_cliente ON vinculo_psicologo_paciente(id_cliente);
CREATE INDEX idx_vinculo_psicologo ON vinculo_psicologo_paciente(id_psicologo);

CREATE TABLE triagens (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id_usuario) ON DELETE CASCADE,
    id_psicologo INTEGER REFERENCES psicologos(id_usuario),
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_triagem TIMESTAMP,
    status status_triagem DEFAULT 'pendente',
    motivo TEXT,
    prioridade prioridade_triagem DEFAULT 'normal',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_triagens_status ON triagens(status);
CREATE INDEX idx_triagens_cliente ON triagens(id_cliente);

CREATE TABLE consultas (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id_usuario) ON DELETE CASCADE,
    id_psicologo INTEGER NOT NULL REFERENCES psicologos(id_usuario) ON DELETE CASCADE,
    id_vinculo INTEGER NOT NULL REFERENCES vinculo_psicologo_paciente(id) ON DELETE CASCADE,
    data_hora_consulta TIMESTAMP NOT NULL,
    duracao INTEGER DEFAULT 50 CHECK (duracao > 0),
    status status_consulta DEFAULT 'agendada',
    tipo_agendamento tipo_agendamento DEFAULT 'agendado',
    modalidade modalidade_consulta DEFAULT 'presencial',
    local_atendimento VARCHAR(100),
    tipo_servico tipo_servico DEFAULT 'individual',
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_psicologo_horario UNIQUE (id_psicologo, data_hora_consulta)
);

CREATE INDEX idx_consultas_data_hora ON consultas(data_hora_consulta);
CREATE INDEX idx_consultas_status ON consultas(status);
CREATE INDEX idx_consultas_cliente_psicologo ON consultas(id_cliente, id_psicologo);
CREATE INDEX idx_consultas_vinculo ON consultas(id_vinculo);

CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    id_consulta INTEGER NOT NULL UNIQUE REFERENCES consultas(id) ON DELETE CASCADE,
    valor_total DECIMAL(10,2) NOT NULL CHECK (valor_total > 0),
    forma_pagamento forma_pagamento NOT NULL,
    status_pagamento status_pagamento DEFAULT 'pendente',
    data_pagamento TIMESTAMP
);

CREATE INDEX idx_pagamentos_status ON pagamentos(status_pagamento);

CREATE TABLE prontuario (
    id SERIAL PRIMARY KEY,
    id_consulta INTEGER NOT NULL UNIQUE REFERENCES consultas(id) ON DELETE CASCADE,
    id_psicologo INTEGER NOT NULL REFERENCES psicologos(id_usuario) ON DELETE CASCADE,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id_usuario) ON DELETE CASCADE,
    data_anotacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    conteudo TEXT NOT NULL,
    status_clinico VARCHAR(50),
    humor_predominante VARCHAR(30),
    revisao_medicacao BOOLEAN DEFAULT FALSE,
    intervencoes TEXT,
    plano_proximo TEXT
);

CREATE INDEX idx_prontuario_cliente ON prontuario(id_cliente);
CREATE INDEX idx_prontuario_psicologo ON prontuario(id_psicologo);

CREATE TABLE remanejamento_consultas (
    id SERIAL PRIMARY KEY,
    id_consulta_original INTEGER NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
    id_consulta_nova INTEGER NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
    motivo motivo_remanejamento NOT NULL,
    data_remanejamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_consulta_original UNIQUE (id_consulta_original)
);

CREATE TABLE lembretes (
    id SERIAL PRIMARY KEY,
    id_consulta INTEGER NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
    data_envio TIMESTAMP,
    enviado BOOLEAN DEFAULT FALSE,
    tipo_lembrete tipo_lembrete NOT NULL
);

CREATE INDEX idx_lembretes_enviado ON lembretes(enviado);

CREATE TABLE comunicacoes (
    id SERIAL PRIMARY KEY,
    id_consulta INTEGER NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
    id_psicologo INTEGER NOT NULL REFERENCES psicologos(id_usuario) ON DELETE CASCADE,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id_usuario) ON DELETE CASCADE,
    assunto VARCHAR(200) NOT NULL,
    conteudo TEXT NOT NULL,
    tipo tipo_comunicacao DEFAULT 'feedback',
    status status_comunicacao DEFAULT 'rascunho',
    data_envio TIMESTAMP,
    data_visualizacao TIMESTAMP,
    modelo_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comunicacoes_consulta ON comunicacoes(id_consulta);
CREATE INDEX idx_comunicacoes_cliente ON comunicacoes(id_cliente);
CREATE INDEX idx_comunicacoes_status ON comunicacoes(status);

CREATE TABLE anexos (
    id SERIAL PRIMARY KEY,
    id_comunicacao INTEGER NOT NULL REFERENCES comunicacoes(id) ON DELETE CASCADE,
    nome_arquivo VARCHAR(200) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    tipo_arquivo VARCHAR(50),
    tamanho INTEGER,
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_anexos_comunicacao ON anexos(id_comunicacao);

CREATE TABLE modelos_comunicacao (
    id SERIAL PRIMARY KEY,
    id_psicologo INTEGER NOT NULL REFERENCES psicologos(id_usuario) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    assunto VARCHAR(200) NOT NULL,
    conteudo TEXT NOT NULL,
    tipo tipo_comunicacao DEFAULT 'feedback',
    compartilhado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modelos_psicologo ON modelos_comunicacao(id_psicologo);

CREATE TABLE analises_ia (
    id SERIAL PRIMARY KEY,
    id_prontuario INTEGER NOT NULL REFERENCES prontuario(id) ON DELETE CASCADE,
    id_consulta INTEGER NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
    id_psicologo INTEGER NOT NULL REFERENCES psicologos(id_usuario) ON DELETE CASCADE,
    tipo_analise tipo_analise_ia NOT NULL,
    conteudo TEXT NOT NULL,
    dados_processados JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uk_analise_ia_unique ON analises_ia (id_prontuario, tipo_analise);

##PARTE 2 - FUNCTIONS, TRIGGERS, VIEWS, PROCEDURES E DADOS 

CREATE OR REPLACE FUNCTION check_prontuario_consulta_realizada()
RETURNS TRIGGER AS $$
DECLARE
    v_status TEXT;
BEGIN
    SELECT status::TEXT INTO v_status
    FROM consultas 
    WHERE id = NEW.id_consulta;
    
    IF v_status != 'realizada' THEN
        RAISE EXCEPTION 'Prontuário só pode ser criado após a consulta ser realizada. Status atual: %', v_status;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_prontuario
BEFORE INSERT ON prontuario
FOR EACH ROW
EXECUTE FUNCTION check_prontuario_consulta_realizada();

CREATE OR REPLACE FUNCTION atualizar_vinculo_ao_encerrar_consulta()
RETURNS TRIGGER AS $$
DECLARE
    consultas_ativas INTEGER;
BEGIN
    SELECT COUNT(*) INTO consultas_ativas
    FROM consultas
    WHERE id_vinculo = NEW.id_vinculo
    AND status NOT IN ('cancelada', 'realizada', 'paciente_faltou');
    
    IF consultas_ativas = 0 AND NEW.status IN ('realizada', 'paciente_faltou') THEN
        UPDATE vinculo_psicologo_paciente
        SET status_vinculo = 'encerrado',
            data_fim_vinculo = CURRENT_DATE
        WHERE id = NEW.id_vinculo
        AND status_vinculo = 'ativo';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_vinculo
AFTER UPDATE ON consultas
FOR EACH ROW
EXECUTE FUNCTION atualizar_vinculo_ao_encerrar_consulta();

CREATE OR REPLACE FUNCTION criar_lembretes_ao_agendar()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO lembretes (id_consulta, tipo_lembrete) 
    VALUES (NEW.id, '24h_antes');
    
    INSERT INTO lembretes (id_consulta, tipo_lembrete) 
    VALUES (NEW.id, '1h_antes');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_criar_lembretes
AFTER INSERT ON consultas
FOR EACH ROW
EXECUTE FUNCTION criar_lembretes_ao_agendar();

CREATE OR REPLACE FUNCTION criar_pagamento_ao_agendar()
RETURNS TRIGGER AS $$
DECLARE
    valor DECIMAL(10,2);
BEGIN
    SELECT valor_consulta INTO valor
    FROM psicologos
    WHERE id_usuario = NEW.id_psicologo;
    
    INSERT INTO pagamentos (id_consulta, valor_total, status_pagamento, forma_pagamento)
    VALUES (NEW.id, valor, 'pendente', 'pix');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_criar_pagamento
AFTER INSERT ON consultas
FOR EACH ROW
EXECUTE FUNCTION criar_pagamento_ao_agendar();

CREATE OR REPLACE VIEW vw_dashboard_admin AS
SELECT 
    (SELECT COUNT(*) FROM clientes c JOIN usuarios u ON c.id_usuario = u.id WHERE u.ativo = TRUE) AS pacientes_ativos,
    (SELECT COUNT(*) FROM triagens WHERE status = 'pendente') AS triagens_pendentes,
    (SELECT COUNT(*) FROM consultas WHERE DATE(data_hora_consulta) = CURRENT_DATE) AS sessoes_hoje,
    (SELECT COUNT(*) FROM consultas WHERE status = 'agendada' AND data_hora_consulta > CURRENT_TIMESTAMP) AS agendamentos_futuros,
    (SELECT COUNT(*) FROM comunicacoes WHERE status = 'rascunho') AS rascunhos_pendentes,
    (SELECT COUNT(*) FROM comunicacoes WHERE status = 'enviado' AND data_envio > CURRENT_DATE - INTERVAL '7 days') AS enviados_ultima_semana,
    (SELECT COUNT(*) FROM prontuario WHERE DATE(data_anotacao) = CURRENT_DATE) AS prontuarios_hoje;

CREATE OR REPLACE VIEW vw_relatorio_consultas AS
SELECT 
    c.id AS consulta_id,
    u1.nome AS paciente_nome,
    u1.cpf AS paciente_cpf,
    u1.telefone AS paciente_telefone,
    u1.email AS paciente_email,
    cl.curso AS paciente_curso,
    cl.status_tratamento::TEXT AS status_tratamento,
    u2.nome AS psicologo_nome,
    u2.email AS psicologo_email,
    p.especialidade AS psicologo_especialidade,
    p.campus,
    p.sala,
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
FROM consultas c
JOIN clientes cl ON c.id_cliente = cl.id_usuario
JOIN usuarios u1 ON cl.id_usuario = u1.id
JOIN psicologos ps ON c.id_psicologo = ps.id_usuario
JOIN usuarios u2 ON ps.id_usuario = u2.id
LEFT JOIN pagamentos pg ON c.id = pg.id_consulta
LEFT JOIN prontuario pr ON c.id = pr.id_consulta
LEFT JOIN vinculo_psicologo_paciente v ON c.id_vinculo = v.id
LEFT JOIN triagens t ON cl.id_usuario = t.id_cliente AND t.status != 'cancelado'
ORDER BY c.data_hora_consulta DESC;

CREATE OR REPLACE VIEW vw_agenda_dia AS
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
FROM consultas c
JOIN clientes cl ON c.id_cliente = cl.id_usuario
JOIN usuarios u1 ON cl.id_usuario = u1.id
JOIN psicologos ps ON c.id_psicologo = ps.id_usuario
JOIN usuarios u2 ON ps.id_usuario = u2.id
WHERE DATE(c.data_hora_consulta) = CURRENT_DATE
AND c.status NOT IN ('cancelada', 'paciente_faltou')
ORDER BY c.data_hora_consulta;

CREATE OR REPLACE VIEW vw_prontuario_completo AS
SELECT 
    p.id AS prontuario_id,
    u.nome AS paciente_nome,
    u.cpf AS paciente_cpf,
    u.telefone AS paciente_telefone,
    u2.nome AS psicologo_nome,
    c.data_hora_consulta,
    p.data_anotacao,
    p.status_clinico,
    p.humor_predominante,
    p.revisao_medicacao,
    p.conteudo AS evolucao_clinica,
    p.intervencoes,
    p.plano_proximo,
    COALESCE(a.conteudo, '') AS analise_ia_resumo,
    COALESCE(a2.conteudo, '') AS sugestoes_ia,
    COALESCE(a3.conteudo, '') AS predicao_ia
FROM prontuario p
JOIN consultas c ON p.id_consulta = c.id
JOIN clientes cl ON c.id_cliente = cl.id_usuario
JOIN usuarios u ON cl.id_usuario = u.id
JOIN psicologos ps ON c.id_psicologo = ps.id_usuario
JOIN usuarios u2 ON ps.id_usuario = u2.id
LEFT JOIN analises_ia a ON p.id = a.id_prontuario AND a.tipo_analise = 'resumo'
LEFT JOIN analises_ia a2 ON p.id = a2.id_prontuario AND a2.tipo_analise = 'intervencao'
LEFT JOIN analises_ia a3 ON p.id = a3.id_prontuario AND a3.tipo_analise = 'predicao'
ORDER BY c.data_hora_consulta DESC;

CREATE OR REPLACE VIEW vw_faturamento_mensal AS
SELECT 
    DATE_TRUNC('month', c.data_hora_consulta) AS mes,
    u.nome AS psicologo,
    COUNT(c.id) AS total_consultas,
    SUM(pg.valor_total) AS faturamento_bruto,
    SUM(CASE WHEN pg.status_pagamento = 'pago_total' THEN pg.valor_total ELSE 0 END) AS faturamento_recebido,
    AVG(pg.valor_total) AS ticket_medio,
    COUNT(CASE WHEN c.modalidade = 'presencial' THEN 1 END) AS consultas_presenciais,
    COUNT(CASE WHEN c.modalidade = 'online' THEN 1 END) AS consultas_online
FROM consultas c
JOIN psicologos ps ON c.id_psicologo = ps.id_usuario
JOIN usuarios u ON ps.id_usuario = u.id
LEFT JOIN pagamentos pg ON c.id = pg.id_consulta
WHERE c.status = 'realizada'
GROUP BY DATE_TRUNC('month', c.data_hora_consulta), u.nome
ORDER BY mes DESC, u.nome;

CREATE OR REPLACE VIEW vw_pacientes_ativos AS
SELECT 
    u.id AS paciente_id,
    u.nome AS paciente_nome,
    u.email AS paciente_email,
    u.telefone AS paciente_telefone,
    cl.curso,
    cl.status_tratamento::TEXT AS status_tratamento,
    COUNT(c.id) AS total_consultas,
    MAX(c.data_hora_consulta) AS ultima_consulta,
    SUM(pg.valor_total) AS total_gasto,
    COUNT(CASE WHEN c.status = 'realizada' THEN 1 END) AS consultas_realizadas,
    COUNT(CASE WHEN c.status = 'paciente_faltou' THEN 1 END) AS faltas
FROM usuarios u
JOIN clientes cl ON u.id = cl.id_usuario
LEFT JOIN consultas c ON cl.id_usuario = c.id_cliente
LEFT JOIN pagamentos pg ON c.id = pg.id_consulta
WHERE u.tipo = 'cliente'
AND u.ativo = TRUE
GROUP BY u.id, u.nome, u.email, u.telefone, cl.curso, cl.status_tratamento
HAVING COUNT(c.id) > 0
ORDER BY total_consultas DESC;

CREATE OR REPLACE VIEW vw_triagens_pendentes AS
SELECT 
    t.id AS triagem_id,
    u.nome AS paciente_nome,
    u.email AS paciente_email,
    u.telefone AS paciente_telefone,
    t.data_solicitacao,
    t.motivo,
    t.prioridade::TEXT AS prioridade,
    t.status::TEXT AS status,
    u2.nome AS responsavel_triagem
FROM triagens t
JOIN clientes cl ON t.id_cliente = cl.id_usuario
JOIN usuarios u ON cl.id_usuario = u.id
LEFT JOIN psicologos ps ON t.id_psicologo = ps.id_usuario
LEFT JOIN usuarios u2 ON ps.id_usuario = u2.id
WHERE t.status IN ('pendente', 'em_analise')
ORDER BY 
    CASE t.prioridade 
        WHEN 'emergencia' THEN 1
        WHEN 'alta' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'baixa' THEN 4
    END,
    t.data_solicitacao;

CREATE OR REPLACE FUNCTION sp_agendar_consulta(
    p_id_cliente INTEGER,
    p_id_psicologo INTEGER,
    p_data_hora TIMESTAMP,
    p_observacoes TEXT DEFAULT NULL,
    p_modalidade VARCHAR(20) DEFAULT 'presencial',
    p_local_atendimento VARCHAR(100) DEFAULT NULL,
    p_tipo_servico VARCHAR(20) DEFAULT 'individual'
)
RETURNS INTEGER AS $$
DECLARE
    v_id_vinculo INTEGER;
    v_consulta_id INTEGER;
    v_id_triagem INTEGER;
BEGIN
    SELECT id INTO v_id_vinculo
    FROM vinculo_psicologo_paciente
    WHERE id_psicologo = p_id_psicologo 
    AND id_cliente = p_id_cliente
    AND status_vinculo = 'ativo'
    ORDER BY data_inicio_vinculo DESC
    LIMIT 1;
    
    IF v_id_vinculo IS NULL THEN
        INSERT INTO vinculo_psicologo_paciente (id_psicologo, id_cliente, data_inicio_vinculo, status_vinculo)
        VALUES (p_id_psicologo, p_id_cliente, CURRENT_DATE, 'ativo')
        RETURNING id INTO v_id_vinculo;
    END IF;
    
    INSERT INTO consultas (id_cliente, id_psicologo, id_vinculo, data_hora_consulta, observacoes, modalidade, local_atendimento, tipo_servico)
    VALUES (p_id_cliente, p_id_psicologo, v_id_vinculo, p_data_hora, p_observacoes, p_modalidade::modalidade_consulta, p_local_atendimento, p_tipo_servico::tipo_servico)
    RETURNING id INTO v_consulta_id;
    
    UPDATE triagens 
    SET status = 'agendado',
        id_psicologo = p_id_psicologo,
        data_triagem = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id_cliente = p_id_cliente 
    AND status = 'pendente'
    LIMIT 1
    RETURNING id INTO v_id_triagem;
    
    IF v_id_triagem IS NOT NULL THEN
        UPDATE clientes 
        SET status_tratamento = 'ativo',
            data_ultima_triagem = CURRENT_DATE
        WHERE id_usuario = p_id_cliente;
    END IF;
    
    RETURN v_consulta_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_cancelar_consulta(
    p_consulta_id INTEGER,
    p_motivo VARCHAR(100) DEFAULT 'Cancelado pelo paciente'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_id_cliente INTEGER;
BEGIN
    SELECT id_cliente INTO v_id_cliente
    FROM consultas
    WHERE id = p_consulta_id;
    
    IF NOT EXISTS (
        SELECT 1 FROM consultas 
        WHERE id = p_consulta_id 
        AND status IN ('agendada', 'confirmada')
    ) THEN
        RETURN FALSE;
    END IF;
    
    UPDATE consultas 
    SET status = 'cancelada',
        observacoes = COALESCE(observacoes, '') || ' | Motivo: ' || p_motivo
    WHERE id = p_consulta_id;
    
    UPDATE pagamentos 
    SET status_pagamento = 'cancelado'
    WHERE id_consulta = p_consulta_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_realizar_consulta(
    p_consulta_id INTEGER,
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
    v_id_cliente INTEGER;
    v_id_psicologo INTEGER;
BEGIN
    SELECT status::TEXT, id_cliente, id_psicologo 
    INTO v_status_atual, v_id_cliente, v_id_psicologo
    FROM consultas
    WHERE id = p_consulta_id;
    
    IF v_status_atual IS NULL THEN
        RETURN FALSE;
    END IF;
    
    IF v_status_atual NOT IN ('agendada', 'confirmada', 'em_andamento') THEN
        RETURN FALSE;
    END IF;
    
    UPDATE consultas 
    SET status = 'realizada'
    WHERE id = p_consulta_id;
    
    INSERT INTO prontuario (id_consulta, id_psicologo, id_cliente, conteudo, status_clinico, humor_predominante, revisao_medicacao, intervencoes, plano_proximo)
    VALUES (p_consulta_id, v_id_psicologo, v_id_cliente, p_prontuario, p_status_clinico, p_humor_predominante, p_revisao_medicacao, p_intervencoes, p_plano_proximo);
    
    UPDATE pagamentos 
    SET status_pagamento = 'pago_total',
        data_pagamento = CURRENT_TIMESTAMP
    WHERE id_consulta = p_consulta_id
    AND status_pagamento = 'pendente';
    
    INSERT INTO lembretes (id_consulta, tipo_lembrete)
    VALUES (p_consulta_id, 'pos_consulta');
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_registrar_falta(p_id_consulta INTEGER) RETURNS BOOLEAN
    LANGUAGE plpgsql AS $$
BEGIN
    UPDATE consultas
    SET status = 'paciente_faltou',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id_consulta
    AND status IN ('agendada', 'confirmada');
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION sp_remanejar_consulta(
    p_id_consulta INTEGER,
    p_nova_data_hora TIMESTAMP,
    p_motivo motivo_remanejamento,
    p_observacao TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_nova_consulta_id INTEGER;
    v_id_cliente INTEGER;
    v_id_psicologo INTEGER;
    v_id_vinculo INTEGER;
    v_observacoes TEXT;
    v_modalidade modalidade_consulta;
    v_local_atendimento VARCHAR(100);
    v_tipo_servico tipo_servico;
BEGIN
    SELECT id_cliente, id_psicologo, id_vinculo, observacoes, modalidade, local_atendimento, tipo_servico
    INTO v_id_cliente, v_id_psicologo, v_id_vinculo, v_observacoes, v_modalidade, v_local_atendimento, v_tipo_servico
    FROM consultas
    WHERE id = p_id_consulta
    AND status NOT IN ('realizada', 'cancelada', 'paciente_faltou');
    
    IF v_id_cliente IS NULL THEN
        RAISE EXCEPTION 'Consulta original não encontrada';
    END IF;
    
    UPDATE consultas 
    SET status = 'cancelada',
        observacoes = COALESCE(observacoes, '') || ' | Remanejada para: ' || p_nova_data_hora
    WHERE id = p_id_consulta;
    
    INSERT INTO consultas (id_cliente, id_psicologo, id_vinculo, data_hora_consulta, observacoes, tipo_agendamento, modalidade, local_atendimento, tipo_servico)
    VALUES (v_id_cliente, v_id_psicologo, v_id_vinculo, p_nova_data_hora, v_observacoes, 'remarcado', v_modalidade, v_local_atendimento, v_tipo_servico)
    RETURNING id INTO v_nova_consulta_id;
    
    INSERT INTO remanejamento_consultas (id_consulta_original, id_consulta_nova, motivo)
    VALUES (p_id_consulta, v_nova_consulta_id, p_motivo);
    
    RETURN v_nova_consulta_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_criar_triagem(
    p_id_cliente INTEGER,
    p_motivo TEXT,
    p_prioridade VARCHAR(20) DEFAULT 'normal'
)
RETURNS INTEGER AS $$
DECLARE
    v_triagem_id INTEGER;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM clientes WHERE id_usuario = p_id_cliente) THEN
        RAISE EXCEPTION 'Cliente não encontrado';
    END IF;
    
    INSERT INTO triagens (id_cliente, motivo, prioridade, status)
    VALUES (p_id_cliente, p_motivo, p_prioridade::prioridade_triagem, 'pendente')
    RETURNING id INTO v_triagem_id;
    
    UPDATE clientes 
    SET status_tratamento = 'triagem',
        data_ultima_triagem = CURRENT_DATE
    WHERE id_usuario = p_id_cliente;
    
    RETURN v_triagem_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_enviar_feedback(
    p_id_consulta INTEGER,
    p_assunto VARCHAR(200),
    p_conteudo TEXT,
    p_tipo VARCHAR(20) DEFAULT 'feedback'
)
RETURNS INTEGER AS $$
DECLARE
    v_comunicacao_id INTEGER;
    v_id_cliente INTEGER;
    v_id_psicologo INTEGER;
BEGIN
    SELECT id_cliente, id_psicologo INTO v_id_cliente, v_id_psicologo
    FROM consultas
    WHERE id = p_id_consulta;
    
    IF v_id_cliente IS NULL THEN
        RAISE EXCEPTION 'Consulta não encontrada';
    END IF;
    
    INSERT INTO comunicacoes (id_consulta, id_psicologo, id_cliente, assunto, conteudo, tipo, status, data_envio)
    VALUES (p_id_consulta, v_id_psicologo, v_id_cliente, p_assunto, p_conteudo, p_tipo::tipo_comunicacao, 'enviado', CURRENT_TIMESTAMP)
    RETURNING id INTO v_comunicacao_id;
    
    RETURN v_comunicacao_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sp_gerar_analise_ia(
    p_id_prontuario INTEGER,
    p_tipo tipo_analise_ia,
    p_conteudo TEXT
)
RETURNS INTEGER AS $$
DECLARE
    v_id INTEGER;
    v_id_consulta INTEGER;
    v_id_psicologo INTEGER;
BEGIN
    SELECT id_consulta, id_psicologo INTO v_id_consulta, v_id_psicologo
    FROM prontuario
    WHERE id = p_id_prontuario;
    
    IF v_id_consulta IS NULL THEN
        RAISE EXCEPTION 'Prontuário não encontrado';
    END IF;
    
    INSERT INTO analises_ia (id_prontuario, id_consulta, id_psicologo, tipo_analise, conteudo)
    VALUES (p_id_prontuario, v_id_consulta, v_id_psicologo, p_tipo, p_conteudo)
    ON CONFLICT (id_prontuario, tipo_analise) DO UPDATE
    SET conteudo = EXCLUDED.conteudo,
        created_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone, data_nascimento, tipo)
VALUES 
('Admin Sistema', 'admin@clinica.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '12345678901', '11999999999', '1990-01-01', 'admin'),
('Dra. Ana Silva', 'ana.silva@clinica.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '98765432100', '11977777777', '1985-05-15', 'psicologo'),
('Dr. Carlos Souza', 'carlos.souza@clinica.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '98765432101', '11966666666', '1980-08-20', 'psicologo'),
('João Pereira', 'joao.pereira@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '11122233344', '11922222222', '1995-03-10', 'cliente'),
('Maria Oliveira', 'maria.oliveira@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '11122233345', '11911111111', '1992-07-25', 'cliente');

INSERT INTO admin_detalhes (id_usuario, cargo, permissao_especial)
VALUES (1, 'Gerente Geral', 'todos');

INSERT INTO psicologos (id_usuario, crp, especialidade, abordagem_terapeutica, valor_consulta, curriculo, campus, sala)
VALUES 
(2, 'CRP-01/12345', 'Terapia Cognitivo-Comportamental', 'TCC', 150.00, 'Especialista em ansiedade e depressão', 'Campus Central', 'Sala 304'),
(3, 'CRP-01/12346', 'Psicanálise', 'Freudiana', 180.00, 'Mais de 10 anos de experiência', 'Campus Central', 'Sala 210');

INSERT INTO clientes (id_usuario, endereco, convenio, curso, periodo, status_tratamento)
VALUES 
(4, 'Rua das Flores, 123', 'Unimed', 'Psicologia', '3º Ano', 'ativo'),
(5, 'Av. Paulista, 1000', NULL, 'Medicina', '5º Ano', 'ativo');

INSERT INTO vinculo_psicologo_paciente (id_psicologo, id_cliente, data_inicio_vinculo, status_vinculo)
VALUES 
(2, 4, '2024-01-15', 'ativo'),
(3, 5, '2024-02-10', 'ativo');

SELECT sp_agendar_consulta(4, 2, '2026-09-10 14:00:00', 'Primeira consulta', 'presencial', 'Campus Central, Sala 304', 'individual');
SELECT sp_agendar_consulta(5, 3, '2026-09-12 10:00:00', 'Avaliação inicial', 'online', 'https://plataforma.virtual', 'individual');

SELECT sp_realizar_consulta(
    1, 
    'Paciente apresenta sintomas de ansiedade generalizada. Iniciamos técnicas de relaxamento.',
    'Estável',
    'Ansioso',
    TRUE,
    'Técnicas de relaxamento, reestruturação cognitiva',
    'Próxima sessão: continuar TCC'
);

SELECT sp_realizar_consulta(
    2,
    'Paciente em processo de luto. Exploramos associações livres.',
    'Estável',
    'Triste',
    FALSE,
    'Associação livre, acolhimento emocional',
    'Continuar processo psicanalítico'
);

