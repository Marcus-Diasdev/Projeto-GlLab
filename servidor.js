const express = require('express');
const fs = require('fs'); 
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '')));
app.use(express.json());

const dadosPath = path.join(__dirname, 'dados.json');

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