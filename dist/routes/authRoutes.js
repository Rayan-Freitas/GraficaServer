"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
exports.authRoutes = router;
// Mock de banco de dados de usuários
let users = {};
// Função para gerar o token JWT
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};
// Rota de registro
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // Verifica se o usuário já existe
    if (users[username]) {
        return res.status(400).send('User already exists');
    }
    // Criptografa a senha
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    // Adiciona o novo usuário no "banco de dados"
    users[username] = { username, password: hashedPassword };
    // Retorna uma mensagem de sucesso
    res.status(201).send('User registered');
}));
// Rota de login
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = users[username];
    if (!user) {
        return res.status(400).send('Invalid credentials');
    }
    const validPassword = yield bcryptjs_1.default.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).send('Invalid credentials');
    }
    // Gera o token JWT
    const token = generateToken(user.username);
    res.json({ token });
}));
