const express = require('express');
const fs = require('fs'); 
const path = require('path');
const cron = require('node-cron');
const app = express();
const PORT = 3000;
app.use(express.static(path.join(__dirname, '')));
app.use(express.json());
const dadosPath = path.join(__dirname, 'dados.json');
const agendamentosPath = path.join(__dirname, 'agendamentos.json');

async function enviarComandoIntune(laboratorio, acao) {
    console.log(`[INTUNE API] --------------------------------------`);
    console.log(`[INTUNE API] A autenticar no Microsoft Graph (simulado)...`);
    const labMap = {
        "Lab 01 (informática a)": "id-grupo-intune-lab01",
        "Lab 02 (informática b)": "id-grupo-intune-lab02",
        "Lab 03 (Redes)": "id-grupo-intune-lab03",
        "Lab 04 (Física/Elétrica)": "id-grupo-intune-lab04",
        "Lab 05 (3D)": "id-grupo-intune-lab05",
        "Lab 06 (Mecânica)": "id-grupo-intune-lab06",
        "Lab 07 (Anatomia)": "id-grupo-intune-lab07",
        "Lab 08 (Semiologia)": "id-grupo-intune-lab08",
        "Lab 09 (Química)": "id-grupo-intune-lab09"
    };

    const groupId = labMap[laboratorio];

    if (!groupId) {
        console.error(`[INTUNE API] ERRO: Laboratório "${laboratorio}" não mapeado para um Grupo de Dispositivos Intune.`);
        return;
    }

    let scriptId;
    let acaoDesc;

    if (acao === 'warn') {
        scriptId = 'SCRIPT_ID_AVISO_15_MIN';
        acaoDesc = `AVISO DE DESLIGAMENTO (15 min) para o grupo ${groupId}`;
    } else {
        scriptId = 'SCRIPT_ID_SHUTDOWN_IMEDIATO'; 
        acaoDesc = `DESLIGAMENTO FORÇADO para o grupo ${groupId}`;
    }
    
    console.log(`[INTUNE API] SUCESSO: Ordem de "${acaoDesc}" enviada para: ${laboratorio}`);
    console.log(`[INTUNE API] --------------------------------------`);
}

function limparAgendamentosAntigos() {
    console.log('[TAREFA AGENDADA] A verificar agendamentos antigos...');
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 

    fs.readFile(agendamentosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('[TAREFA AGENDADA] ERRO: Não foi possível ler agendamentos.json para limpeza.', err);
            return;
        }

        const todosAgendamentos = JSON.parse(data);

        const agendamentosValidos = todosAgendamentos.filter(ag => {
            const dataAgendamento = new Date(ag.data + 'T00:00:00');
            return dataAgendamento >= hoje;
        });

        if (agendamentosValidos.length < todosAgendamentos.length) {
            let numRemovidos = todosAgendamentos.length - agendamentosValidos.length;
            console.log(`[TAREFA AGENDADA] ${numRemovidos} agendamentos antigos foram removidos.`);

            fs.writeFile(agendamentosPath, JSON.stringify(agendamentosValidos, null, 2), (err) => {
                if (err) {
                    console.error('[TAREFA AGENDADA] ERRO: Não foi possível salvar agendamentos.json limpo.', err);
                } else {
                    console.log('[TAREFA AGENDADA] Ficheiro de agendamentos foi limpo e salvo.');
                }
            });
        } else {
            console.log('[TAREFA AGENDADA] Nenhum agendamento antigo encontrado.');
        }
    });
}

function simularAvisoDesligamento() {
    const agora = new Date();
    const dataHoje = agora.toISOString().split('T')[0];
    let periodoAtual = null;
    
    const hora = agora.getHours();
    const minuto = agora.getMinutes();

    if (hora === 12 && minuto === 0) periodoAtual = 'Manhã';
    else if (hora === 17 && minuto === 0) periodoAtual = 'Tarde';
    else if (hora === 22 && minuto === 0) periodoAtual = 'Noite';

    if (!periodoAtual) return; 

    console.log(`[AVISO] Verificando laboratórios para AVISAR (Período: ${periodoAtual})...`);

    fs.readFile(agendamentosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('[AVISO] ERRO CRÍTICO: Não foi possível ler o ficheiro agendamentos.json.', err);
            return; 
        }

        const todosAgendamentos = JSON.parse(data);
        const labsUsadosAgora = todosAgendamentos.filter(ag => 
            ag.data === dataHoje && ag.periodo.startsWith(periodoAtual)
        );

        if (labsUsadosAgora.length === 0) {
            console.log(`[AVISO] Nenhum laboratório agendado para ${periodoAtual}.`);
            return;
        }
        
        const labsParaAvisar = new Set(labsUsadosAgora.map(ag => ag.laboratorio));
        labsParaAvisar.forEach(lab => {
            enviarComandoIntune(lab, 'warn');
        });
    });
}

function simularDesligamentoLabs() {
    const agora = new Date();
    const dataHoje = agora.toISOString().split('T')[0];
    let periodoAtual = null;
    const hora = agora.getHours();
    const minuto = agora.getMinutes();

    if (hora === 12 && minuto === 15) periodoAtual = 'Manhã';
    else if (hora === 17 && minuto === 15) periodoAtual = 'Tarde';
    else if (hora === 22 && minuto === 15) periodoAtual = 'Noite';

    if (!periodoAtual) return; 

    console.log(`[DESLIGAMENTO] Verificando laboratórios para DESLIGAR (Período: ${periodoAtual})...`);

    fs.readFile(agendamentosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('[DESLIGAMENTO] ERRO CRÍTICO: Não foi possível ler o ficheiro agendamentos.json.', err);
            return; 
        }

        const todosAgendamentos = JSON.parse(data);
        const labsUsadosAgora = todosAgendamentos.filter(ag => 
            ag.data === dataHoje && ag.periodo.startsWith(periodoAtual)
        );

        if (labsUsadosAgora.length === 0) {
            console.log(`[DESLIGAMENTO] Nenhum laboratório para desligar.`);
            return;
        }
        
        const labsParaDesligar = new Set(labsUsadosAgora.map(ag => ag.laboratorio));
        labsParaDesligar.forEach(lab => {
            enviarComandoIntune(lab, 'shutdown');
        });
    });
}

cron.schedule('1 0 * * *', () => {
    limparAgendamentosAntigos();
}, { timezone: "America/Sao_Paulo" }); 

cron.schedule('0 12,17,22 * * *', () => {
    simularAvisoDesligamento();
}, { timezone: "America/Sao_Paulo" });

cron.schedule('15 12,17,22 * * *', () => {
    simularDesligamentoLabs();
}, { timezone: "America/Sao_Paulo" });

app.post('/salvar-usuario', (req, res) => {
    const novoUsuario = req.body; 

    fs.readFile(dadosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o ficheiro dados.json:', err);
            return res.status(500).send('Erro no servidor.');
        }

        const usuarios = JSON.parse(data); 
        usuarios.push(novoUsuario); 

        fs.writeFile(dadosPath, JSON.stringify(usuarios, null, 2), (err) => {
            if (err) {
                console.error('Erro ao escrever no ficheiro dados.json:', err);
                return res.status(500).send('Erro no servidor.');
            }
            console.log('Utilizador salvo com sucesso:', novoUsuario.email);
            res.status(200).send('Utilizador salvo com sucesso.'); 
        });
    });
});

app.post('/salvar-agendamento', (req, res) => {
    const novoAgendamento = req.body; 

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 
    const dataAgendamento = new Date(novoAgendamento.data + 'T00:00:00');

    if (dataAgendamento < hoje) {
        console.warn(`[VALIDAÇÃO] Rejeitado: Tentativa de agendar no passado (${novoAgendamento.data}).`);
        return res.status(400).send('Não é possível agendar em datas passadas.');
    } 

    fs.readFile(agendamentosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler agendamentos.json:', err);
            return res.status(500).send('Erro no servidor.');
        }

        const agendamentos = JSON.parse(data);
        const jaExiste = agendamentos.some(ag => 
            ag.laboratorio === novoAgendamento.laboratorio &&
            ag.data === novoAgendamento.data &&
            ag.periodo === novoAgendamento.periodo
        );

        if (jaExiste) {
            console.warn(`[VALIDAÇÃO] Rejeitado: Tentativa de agendamento duplicado.`);
            return res.status(409).send('Este laboratório já está reservado nesta data e período.');
        }
        agendamentos.push(novoAgendamento);

        fs.writeFile(agendamentosPath, JSON.stringify(agendamentos, null, 2), (err) => {
            if (err) {
                console.error('Erro ao salvar agendamento:', err);
                return res.status(500).send('Erro no servidor.');
            }
            console.log('Agendamento salvo com sucesso:', novoAgendamento.laboratorio);
            res.status(200).send('Agendamento salvo com sucesso.');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor a rodar em http://localhost:${PORT}`);
    console.log('[INICIALIZAÇÃO] Executando limpeza de agendamentos ao iniciar...');
    limparAgendamentosAntigos();
});