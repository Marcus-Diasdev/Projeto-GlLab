const switchDoTema = document.getElementById('switchCheckDefault');

function mudarTema() {
    let novoTema;

    if (switchDoTema.checked) {
        novoTema = 'dark'; 
    } else {
        novoTema = 'light'; 
    }

    document.documentElement.setAttribute('data-bs-theme', novoTema);

    localStorage.setItem('tema', novoTema);
}

switchDoTema.addEventListener('change', mudarTema);

const temaSalvo = localStorage.getItem('tema');

if (temaSalvo) {
    document.documentElement.setAttribute('data-bs-theme', temaSalvo);

    if (temaSalvo === 'dark') {
        switchDoTema.checked = true;
    }
}

(() => {
    const usuarioLogadoEmail = localStorage.getItem('usuarioLogado');
    
    if (!usuarioLogadoEmail) {
        alert('Você precisa estar logado para ver esta página.');
        window.location.href = '../index.html'; 
    } else {
        const welcomeEl = document.getElementById('welcome-message');
        let nomeUsuario = usuarioLogadoEmail.split('@')[0];
        nomeUsuario = nomeUsuario.charAt(0).toUpperCase() + nomeUsuario.slice(1);
        welcomeEl.textContent = `Bem vindo ao GlLab, ${nomeUsuario}!`;
    }
})();


function irParaAgendar() {
    window.location.href = './pagina-de-agendamento/index.html';
}

function irParaMeusAgendamentos() {
    window.location.href = './meus-agendamentos/index.html';
}

function logout() {
    if (confirm('Tem certeza que quer sair da sua conta?')){
        localStorage.removeItem('usuarioLogado');
        alert('Logout realizado com sucesso!');
        window.location.href = '../index.html';
    } else {
        window.location.reload;
    }
}