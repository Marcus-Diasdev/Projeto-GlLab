const agendamentosJsonUrl = '../../agendamentos.json';
const indexUrl = '../../index.html';
let calendario = null; 
const calendarioContainer = document.getElementById('calendario-container');
const labSelect = document.getElementById('laboratorio');

(() => {
    const usuarioLogadoEmail = localStorage.getItem('usuarioLogado');
    if (!usuarioLogadoEmail) {
        alert('Você precisa estar logado para agendar.');
        window.location.href = indexUrl;
    }
    const inputData = document.getElementById('data');
    const hoje = new Date(); 
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    
    const dataDeHojeFormatada = `${ano}-${mes}-${dia}`;
    
    inputData.setAttribute('min', dataDeHojeFormatada);
});

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

labSelect.addEventListener('change', (e) => {
    const labNome = e.target.value;
    if (labNome) {
        calendarioContainer.style.display = 'block';
        inicializarCalendario(labNome);
    } else {
        calendarioContainer.style.display = 'none';
    }
});

async function inicializarCalendario(labNome) {
    if (calendario) {
        calendario.destroy();
    }

    try {
        const response = await fetch(agendamentosJsonUrl);
        const todosAgendamentos = await response.json();
        const agendamentosDoLab = todosAgendamentos.filter(ag => ag.laboratorio === labNome);
        const eventos = agendamentosDoLab.map(ag => {
            let nomeUsuario = ag.usuario.split('@')[0];
            return {
                title: `${ag.periodo} - ${nomeUsuario}`, 
                start: ag.data,
                allDay: true 
            };
        });

        calendario = new FullCalendar.Calendar(calendarioContainer, {
            initialView: 'dayGridMonth', 
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
            },
            events: eventos, 
            locale: 'pt-br', 
            buttonText: {
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana'
            }
        });

        calendario.render();

    } catch (erro) {
        console.error('Erro ao buscar ou renderizar agendamentos:', erro);
        alert('Não foi possível carregar o calendário de agendamentos.');
    }
}

async function agendar() {
    const laboratorio = document.getElementById('laboratorio').value;
    const data = document.getElementById('data').value;
    const periodo = document.getElementById('periodo').value;
    const usuario = localStorage.getItem('usuarioLogado');

    if (!laboratorio || !data || !periodo) {
        alert('Por favor, preencha todos os campos do formulário.');
        return;
    }

    const novoAgendamento = { laboratorio, data, periodo, usuario };

    try {
        const respostaDoServidor = await fetch('/salvar-agendamento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoAgendamento)
        });

        if (respostaDoServidor.ok) {
            alert('Agendamento realizado com sucesso!');
            let nomeUsuario = usuario.split('@')[0];
            calendario.addEvent({
                title: `${periodo} - ${nomeUsuario}`,
                start: data,
                allDay: true
            });
            
            document.getElementById('data').value = '';
            document.getElementById('periodo').value = '';

        } else {
            throw new Error('O servidor não conseguiu salvar o agendamento.');
        }

    } catch (erro) {
        console.error('Erro ao salvar agendamento:', erro);
        alert('Não foi possível salvar o seu agendamento.');
    }
}