const regexEmail = /^[^\s@]+@unifatec\.edu\.(br|us|pt|es)$/;

async function enviarRecuperacao() {
    let email = document.getElementById('email-recuperacao').value.toLowerCase();

    if (!regexEmail.test(email)) {
        alert('Digite um e-mail válido! Exemplo:"exemplo@unifatec.edu.br"');
        return;
    }

    try {
        const response = await fetch(json);
        const dados = await response.json();
        const emailJaExiste = dados.some(usuario => usuario.email === email);

        if (emailJaExiste) {
            console.log(`Simulando envio de recuperação para: ${email}`);
        } else {
            console.log(`Tentativa de recuperação para e-mail não cadastrado: ${email}`);
        }
        alert('Se este e-mail estiver em nosso sistema, um link de recuperação foi enviado.');

        window.location.href = 'index.html';

    } catch (erro) {
        console.error("Erro ao tentar recuperar senha:", erro);
        alert("Não foi possível processar sua solicitação. Tente novamente mais tarde.");
    }
}