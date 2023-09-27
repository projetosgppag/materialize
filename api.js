const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3000;

const allowedOrigins = [
    'http://127.0.0.1:5500/cadastro.html',
    'http://127.0.0.1:5500/index.html',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:3000/cadastro',
    'http://127.0.0.1:3000/login',
    'http://127.0.0.1:3000'

];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Acesso não permitido por CORS'));
        }
    }
};

app.use(cors(corsOptions));

app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).send();
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cool_db'
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao MySQL');
});


app.use(bodyParser.json());

app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    db.query('SELECT * FROM users WHERE email = ? AND senha = ?', [email, senha], (err, results) => {
        if (err) {
            console.error('Erro ao consultar o banco de dados:', err);
            return res.status(500).json({ mensagem: 'Erro ao consultar o banco de dados' });
        }

        if (results.length === 0) {
            return res.status(401).json({ mensagem: 'Credenciais inválidas' });
        }

        res.status(200).json({ mensagem: 'autenticado' });
    });
});



app.post('/cadastro', (req, res) => {
    const userData = req.body;
    console.log('Rota /cadastro foi acionada');

    db.query('INSERT INTO users (firstname, senha, email, telefone, cep, numero, logradouro, bairro, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userData.firstname, userData.senha, userData.email, userData.telefone, userData.cep, userData.numero, userData.logradouro, userData.bairro, userData.cidade, userData.estado],
        (err, results) => {
            if (err) {
                console.error('Erro ao inserir usuário no banco de dados:', err);
                return res.status(500).json({ mensagem: 'Erro ao inserir usuário no banco de dados' });
            }

            res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
        }
    );

});

app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});