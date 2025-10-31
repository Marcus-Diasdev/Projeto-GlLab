const json = './dados.json';
const switchDoTema = document.getElementById('switchCheckDefault');
const regexEmail = /^[^\s@]+@unifatec\.edu\.(br|us|pt|es)$/;


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

function cadastrar() {
    document.querySelector('h1').innerHTML = 'Novo cadastro';
    document.querySelector('p').innerHTML = 'Insira seu e-mail (primeiro campo) e crie uma senha (segundo campo) e confirme ela (terceiro campo)';
    document.getElementById('login').hidden = true;
    document.getElementById('senha').hidden = true;
    document.getElementById('button-login').hidden = true;
    document.getElementById('button-cadastrar').hidden = true;
    const cadastroDeUsuario = document.querySelector('.login');
    cadastroDeUsuario.innerHTML = '<input type="email" placeholder="Insira seu e-mail" id="e-mail"><input type="password" id="senha1" placeholder="Insira a sua senha"><input type="password" id="senha2" placeholder="Confirmar senha"><button onclick="conferirCadastro()" class="button-blue button-login">Confirmar</button><button onclick="voltar()" class="button-gray button-login">Voltar</button>';
}

async function conferirCadastro() {
    let email = document.getElementById('e-mail').value.toLowerCase();
    let senha1 = document.getElementById('senha1').value;
    let senha2 = document.getElementById('senha2').value;

    if (!regexEmail.test(email)) {
        alert('Digite um e-mail válido! Exemplo:"exemplo@unifatec.edu.br"');
        return;
    } else if (senha1.length < 8 || senha1.length > 32) {
        alert('A senha deve ter entre 8 e 32 caracteres!');
        return;
    } else if (senha1 !== senha2) {
        alert('As duas senhas são diferentes!');
        return;
    }

    try {
        const response = await fetch(json);
        const dados = await response.json();
        const emailJaExiste = dados.some(usuario => usuario.email === email);

        if (emailJaExiste) {
            alert('Esse e-mail já está cadastrado!');
        } else {
            const novoUsuario = { email: email, senha: senha1 };

            const respostaDoServidor = await fetch('/salvar-usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(novoUsuario),
            });

            if (respostaDoServidor.ok) {
                alert('Cadastro realizado com sucesso!');
                window.location.reload();
            } else {
                throw new Error('O servidor não conseguiu guardar o utilizador.');
            }
        }
    } catch (erro) {
        console.error("Houve um erro no processo de cadastro:", erro);
        alert("Não foi possível realizar o cadastro. Tente novamente mais tarde.");
    }
}

function voltar() {
    window.location.reload();
}

async function logar() {
    let login = document.getElementById('login').value.toLowerCase();
    let senha = document.getElementById('senha').value;

    if (!regexEmail.test(login)) {
        alert('Digite um e-mail válido! Exemplo:"exemplo@unifatec.edu.br"');
        return;
    }

    try {
        const response = await fetch(json);
        const dados = await response.json();
        const usuarioEncontrado = dados.find(usuario => usuario.email === login);

        if (!usuarioEncontrado) {
            alert('E-mail não cadastrado!');
        } else {
            if (usuarioEncontrado.senha === senha) {
                window.location.href = './pagina-inicial/index.html';
            } else {
                alert('Senha incorreta!');
            }
        }

    } catch (erro) {
        console.error("Erro ao tentar logar:", erro);
        alert("Não foi possível processar o login. Tente novamente mais tarde.");
    }
}