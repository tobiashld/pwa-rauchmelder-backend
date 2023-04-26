import db from "./db";
const helper = require("../helper");

async function getAll(request: any, response: any) {
	db.prisma.wohnungen
		.findMany({
			orderBy: {
				id: "asc",
			},
			include: {
				objekte: true,
			},
		})
		.then((data: any) => {
			response.status(200).json({
				status: 200,
				data: data,
			});
		});
}

async function getAllWithParam(
	request: any,
	response: any,
	key: string,
	value: string
) {
	const query = "SELECT * FROM public.wohnungen WHERE " + key + " = " + value;
	db.query(query, response);
}

async function getAllWithParams(
	request: any,
	response: any,
	params: { [x: string]: any }
) {
	const paramsQuery = Object.keys(params)
		.map(
			(key) =>
				`wohnungen."` +
				key.toString() +
				`" =` +
				(Number.isNaN(params[key]) ? ` '${params[key]}'` : ` ${params[key]}`)
		)
		.join(" AND ");
	const query = "SELECT * FROM public.wohnungen WHERE " + paramsQuery;
	db.query(query, response);
}

async function createWohnung(request: { body: any }, response: any) {
	let wohnung = request.body;

	const query = `INSERT INTO public.wohnungen("objektID", "etage", "wohnungslage","haus","vorname","nachname") VALUES(${wohnung.objektID}, '${wohnung.etage}','${wohnung.wohnungslage}','${wohnung.haus}','${wohnung.vorname}','${wohnung.nachname}');`;
	db.query(query, response);
}

async function changeWohnung(request: any, response: any, wohnungsid: any) {
	let wohnung = request.body;
	const q =
		`UPDATE public.wohnungen SET ` +
		mapObjectToParams(wohnung) +
		` WHERE id=${wohnungsid};`;
	db.query(q, response);
}
async function deleteWohnung(request: any, response: any, wohnungsid: string) {
	const q = "DELETE FROM public.wohnungen WHERE id=" + wohnungsid + ";";
	db.query(q, response);
}
function mapObjectToParams(params: { [x: string]: any }) {
	return Object.keys(params)
		.filter((value) => {
			let forbidden = ["id", "objekt"];
			return forbidden.includes(value) ? false : true;
		})
		.map((key) => {
			return typeof params[key] === "boolean" || typeof params[key] === "number"
				? `"${key}"=${params[key]}`
				: `"${key}"='${params[key]}'`;
		})
		.join(",");
}

export default {
	getAll,
	getAllWithParams,
	getAllWithParam,
	createWohnung,
	changeWohnung,
	deleteWohnung,
};
