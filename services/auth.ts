import db from "./db";
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const { jwtDecode } = require("jwt-decode");

// get config vars
dotenv.config();

async function login(
	req: { body: { username: any; password: any } },
	res: any
) {
	const { username, password } = req.body;

	db.query(
		`SELECT * FROM users WHERE username='${username}'`,
		res,
		(row: any, response: any) => validateLogin(row, req, response)
	);
}
async function signup(
	req: { body: { username: any; password: any } },
	res: any
) {
	const { username, password } = req.body;
	let hashedPassword = await bcrypt.hash(password, 10);
	db.query(
		`INSERT INTO public.users ("username", "password", "admin","salt") VALUES ('${username}', '${hashedPassword}', false,'10');`,
		res
	);
}
async function changepw(
	req: { body: { password: any }; headers: { [x: string]: any } },
	res: any
) {
	const { password } = req.body;
	let hashedPassword = await bcrypt.hash(password, 10);
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	let payload = parseJwt(token);
	let query = `UPDATE public.users SET password='${hashedPassword}' WHERE user_id=${payload.id};`;
	db.query(query, res);
}

function parseJwt(token: string) {
	return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

function getOwnUser(
	req: { cookies: { accessToken: any; refreshToken: any } },
	res: {
		status: (arg0: number) => {
			(): any;
			new (): any;
			json: {
				(arg0: { status: number; data?: any; error?: string }): void;
				new (): any;
			};
		};
	}
) {
	const { accessToken, refreshToken } = req.cookies;

	if (refreshToken) {
		let user = jwt.decode(refreshToken);
		res.status(200).json({ status: 200, data: user });
	} else {
		res.status(200).json({ status: 420, error: "No Token" });
	}
}

function validateLogin(
	rows: string | any[],
	request: { body: { username: any; password: any } },
	response: {
		status: (arg0: number) => {
			(): any;
			new (): any;
			cookie: {
				(
					arg0: string,
					arg1: any,
					arg2: {
						expires: Date;
						httpOnly: boolean;
						sameSite: string;
						secure: boolean;
					}
				): {
					(): any;
					new (): any;
					cookie: {
						(
							arg0: string,
							arg1: any,
							arg2: {
								expires: Date;
								httpOnly: boolean;
								sameSite: string;
								secure: boolean;
							}
						): {
							(): any;
							new (): any;
							json: {
								(arg0: { status: number; token: any }): void;
								new (): any;
							};
						};
						new (): any;
					};
				};
				new (): any;
			};
			json: { (arg0: { error: string }): void; new (): any };
		};
	}
) {
	const { username, password } = request.body;
	if (rows && rows.length > 0) {
		bcrypt.compare(password, rows[0].password).then((isSame: any) => {
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
			} else {
				response.status(401).json({ error: "Falsches Passwort" });
			}
		});
	} else {
		response.status(401).json({ error: "Falscher Benutzername" });
	}
}
function authenticateTokenWs(req: any, cb: any) {
	const { accessToken, refreshToken } = req.cookies;

	jwt.verify(
		accessToken ? accessToken : "",
		process.env.TOKEN_SECRET,
		(err: any, user: any) => {
			if (err) {
				cb(false);
			} else {
				cb(true, user);
			}
		}
	);
}

const wsAuthMiddleware = (ws: any, req: any, next: any) => {
	authenticateTokenWs(req, (auth: boolean, payload?: any) => {
		if (auth) {
			req.payload = payload;
			next();
		} else {
			ws.send(
				JSON.stringify({ stage: 2, data: "Sie müssen sich erneut anmelden!" })
			);
		}
		console.log("");
	});
};

function authenticateToken(req: any, res: any, next: any) {
	const { accessToken, refreshToken } = req.cookies;

	jwt.verify(
		accessToken ? accessToken : "",
		process.env.TOKEN_SECRET,
		(err: any, user: any) => {
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
				} else {
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
		}
	);
}

async function handleRefreshToken(
	req: { cookies: { accessToken: any; refreshToken: any } },
	res: {
		status: (arg0: number) => {
			(): any;
			new (): any;
			json: { (arg0: { status: number; error: string }): void; new (): any };
			cookie: {
				(arg0: string, arg1: any, arg2: { expires: Date; httpOnly: boolean }): {
					(): any;
					new (): any;
					json: { (arg0: { status: number; token: any }): void; new (): any };
				};
				new (): any;
			};
		};
	}
) {
	const { accessToken, refreshToken } = req.cookies;

	if (refreshToken == null)
		return res.status(200).json({ status: 400, error: "Session abgelaufen" });
	jwt.verify(
		refreshToken,
		process.env.TOKEN_SECRET,
		(err: any, payload: { username: any; id: any; exp: number }) => {
			if (err) {
				res.status(200).json({ status: 400, error: "Session abgelaufen" });
			} else {
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
		}
	);
}

function generateAccessToken(data: { username: any; id: any }) {
	return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: 60 * 60 });
}
function generateRefreshToken(data: { username: any; id: any }) {
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
export default thisExport;
