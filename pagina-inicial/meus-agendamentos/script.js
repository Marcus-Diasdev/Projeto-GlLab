const agendamentosJsonUrl = '../../agendamentos.json';
const indexUrl = '../../index.html';

document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    
    if (!usuarioLogado) {
        alert('Você precisa estar logado para ver esta página.');
        window.location.href = indexUrl; 
    } else {
        carregarAgendamentos(usuarioLogado);
    }
});

async function carregarAgendamentos(usuarioLogado) {
    const listaDiv = document.getElementById('lista-agendamentos');
    
    try {
        const response = await fetch(agendamentosJsonUrl);
        if (!response.ok) {
            throw new Error('Falha ao carregar o ficheiro de agendamentos.');
        }
        const todosAgendamentos = await response.json();

        const meusAgendamentos = todosAgendamentos.filter(ag => ag.usuario === usuarioLogado);

        if (meusAgendamentos.length === 0) {
            listaDiv.innerHTML = '<p class="agendamento-vazio">Você ainda não possui agendamentos.</p>';
            return; 
        }

        let htmlParaExibir = '';
        meusAgendamentos.forEach(ag => {
            htmlParaExibir += `
                <div class="agendamento-item">
                    <h3>${ag.laboratorio}</h3>
                    <p><strong>Data:</strong> ${formatarData(ag.data)}</p>
                    <p><strong>Período:</strong> ${ag.periodo}</p>
                </div>
            `;
        });
        
        listaDiv.innerHTML = htmlParaExibir;

    } catch (erro) {
        console.error('Erro ao carregar agendamentos:', erro);
        listaDiv.innerHTML = '<p class="agendamento-vazio" style="color: red;">Erro ao carregar seus agendamentos.</p>';
    }
}

const switchDoTema = document.getElementById('switchCheckDefault');

function mudarTema() {
    let novoTema = switchDoTema.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', novoTema);
    localStorage.setItem('tema', novoTema);
}

if (switchDoTema) {
    switchDoTema.addEventListener('change', mudarTema);
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo) {
        document.documentElement.setAttribute('data-bs-theme', temaSalvo);
        if (temaSalvo === 'dark') {
            switchDoTema.checked = true;
        }
    }
}

function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = indexUrl;
}

function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}