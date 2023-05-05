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
const db_1 = __importDefault(require("./db"));
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const { jwtDecode } = require("jwt-decode");
// get config vars
dotenv.config();
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username, password } = req.body;
        db_1.default.query(`SELECT * FROM users WHERE username='${username}'`, res, (row, response) => validateLogin(row, req, response));
    });
}
function signup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username, password } = req.body;
        let hashedPassword = yield bcrypt.hash(password, 10);
        db_1.default.query(`INSERT INTO public.users ("username", "password", "admin","salt") VALUES ('${username}', '${hashedPassword}', false,'10');`, res);
    });
}
function changepw(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { password } = req.body;
        let hashedPassword = yield bcrypt.hash(password, 10);
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        let payload = parseJwt(token);
        let query = `UPDATE public.users SET password='${hashedPassword}' WHERE user_id=${payload.id};`;
        db_1.default.query(query, res);
    });
}
function parseJwt(token) {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}
function getOwnUser(req, res) {
    const { accessToken, refreshToken } = req.cookies;
    if (refreshToken) {
        let user = jwt.decode(refreshToken);
        res.status(200).json({ status: 200, data: user });
    }
    else {
        res.status(200).json({ status: 420, error: "No Token" });
    }
}
function validateLogin(rows, request, response) {
    const { username, password } = request.body;
    if (rows && rows.length > 0) {
        bcrypt.compare(password, rows[0].password).then((isSame) => {
            if (isSame) {
                let newAccessToken = generateAccessToken({
                    username: rows[0].username,
                    id: rows[0].user_id,
                });
                let newRefreshToken = generateRefreshToken({
                    username: rows[0].username,
                    id: rows[0].user_id,
                });
                response
                    .status(200)
                    .cookie("accessToken", newAccessToken, {
                    expires: new Date(new Date().getTime() + 60 * 60 * 1000),
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                })
                    .cookie("refreshToken", newRefreshToken, {
                    expires: new Date(new Date().getTime() + 172800 * 1000),
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                })
                    .json({ status: 200, token: newAccessToken });
            }
            else {
                response.status(401).json({ error: "Falsches Passwort" });
            }
        });
    }
    else {
        response.status(401).json({ error: "Falscher Benutzername" });
    }
}
function authenticateTokenWs(req, cb) {
    const { accessToken, refreshToken } = req.cookies;
    jwt.verify(accessToken ? accessToken : "", process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            cb(false);
        }
        else {
            cb(true, user);
        }
    });
}
const wsAuthMiddleware = (ws, req, next) => {
    authenticateTokenWs(req, (auth, payload) => {
        if (auth) {
            req.payload = payload;
            next();
        }
        else {
            ws.send(JSON.stringify({ stage: 2, data: "Sie müssen sich erneut anmelden!" }));
        }
    });
};
function authenticateToken(req, res, next) {
    const { accessToken, refreshToken } = req.cookies;
    jwt.verify(accessToken ? accessToken : "", process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            if (refreshToken == null) {
                return res
                    .cookie("accessToken", null, {
                    expires: new Date(new Date().getTime() - 60 * 60 * 1000),
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                })
                    .cookie("refreshToken", null, {
                    expires: new Date(new Date().getTime() - 172800 * 1000),
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                })
                    .status(200)
                    .json({ status: 479, error: "Kein Token vorhanden" });
            }
            else {
                let payload = jwt.decode(refreshToken);
                let newAccessToken = generateAccessToken({
                    username: payload.username,
                    id: payload.id,
                });
                res.cookie("accessToken", newAccessToken, {
                    expires: new Date(new Date().getTime() + 60 * 60 * 1000),
                    httpOnly: true,
                });
            }
        }
        next();
    });
}
function handleRefreshToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { accessToken, refreshToken } = req.cookies;
        if (refreshToken == null)
            return res.status(200).json({ status: 400, error: "Session abgelaufen" });
        jwt.verify(refreshToken, process.env.TOKEN_SECRET, (err, payload) => {
            if (err) {
                res.status(200).json({ status: 400, error: "Session abgelaufen" });
            }
            else {
                let newAccessToken = generateAccessToken({
                    username: payload.username,
                    id: payload.id,
                });
                let expiresIn = new Date();
                expiresIn.setTime(payload.exp);
                res
                    .status(200)
                    .cookie("accessToken", newAccessToken, {
                    expires: new Date(new Date().getTime() + 60 * 60 * 1000),
                    httpOnly: true,
                })
                    .json({ status: 200, token: newAccessToken });
            }
        });
    });
}
function generateAccessToken(data) {
    return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: 60 * 60 });
}
function generateRefreshToken(data) {
    return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: 172800 });
}
let thisExport = {
    login,
    signup,
    authenticateToken,
    authenticateTokenWs,
    getOwnUser,
    generateAccessToken,
    handleRefreshToken,
    changepw,
    wsAuthMiddleware,
};
exports.default = thisExport;
