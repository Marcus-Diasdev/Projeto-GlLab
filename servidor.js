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

function limparAgendamentosAntigos() {
    console.log('[TAREFA AGENDADA] A verificar agendamentos antigos...');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 

    fs.readFile(agendamentosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler agendamentos.json para limpeza:', err);
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
                    console.error('Erro ao salvar agendamentos.json limpo:', err);
                } else {
                    console.log('[TAREFA AGENDADA] Ficheiro de agendamentos foi limpo e salvo.');
                }
            });
        } else {
            console.log('[TAREFA AGENDADA] Nenhum agendamento antigo encontrado.');
        }
    });
}

cron.schedule('1 0 * * *', () => {
    limparAgendamentosAntigos();
}, {
    timezone: "America/Sao_Paulo" 
});

app.post('/salvar-usuario', (req, res) => {
    const novoUsuario = req.body; 

    fs.readFile(dadosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o ficheiro:', err);
            return res.status(500).send('Erro no servidor.');
        }

        const usuarios = JSON.parse(data); 
        usuarios.push(novoUsuario); 

        fs.writeFile(dadosPath, JSON.stringify(usuarios, null, 2), (err) => {
            if (err) {
                console.error('Erro ao escrever no ficheiro:', err);
                return res.status(500).send('Erro no servidor.');
            }
            console.log('Utilizador salvo com sucesso:', novoUsuario.email);
            res.status(200).send('Utilizador salvo com sucesso.'); 
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor a rodar em http://localhost:${PORT}`);
});

app.post('/salvar-agendamento', (req, res) => {
    const novoAgendamento = req.body; 

    fs.readFile(agendamentosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler agendamentos.json:', err);
            return res.status(500).send('Erro no servidor.');
        }

        const agendamentos = JSON.parse(data);
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