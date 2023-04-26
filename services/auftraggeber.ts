import db from "./db";
const helper = require("../helper");

function getAll(request: any, response: any) {
	db.query(`SELECT * FROM public.auftraggeber;`, response);
}

function getAllWithParam(
	request: any,
	response: any,
	key: string,
	value: string
) {
	const query =
		"SELECT * FROM public.auftraggeber WHERE " + key + " = " + value;
	db.query(query, response);
}

function getAllWithParams(
	request: any,
	response: any,
	params: { [x: string]: any }
) {
	const paramsQuery = Object.keys(params)
		.map(
			(key) =>
				`auftraggeber."` +
				key.toString() +
				`" =` +
				(Number.isNaN(params[key]) ? ` '${params[key]}'` : ` ${params[key]}`)
		)
		.join(" AND ");
	const query = "SELECT * FROM public.auftraggeber WHERE " + paramsQuery;
	db.query(query, response);
}

function createAuftraggeber(request: { body: any }, response: any) {
	let auftraggeber = request.body;

	const query = `INSERT INTO public.auftraggeber("name", "straße", "hausnummer","plz","ort","telefon","email") VALUES('${auftraggeber.name}', '${auftraggeber.straße}',${auftraggeber.hausnummer},'${auftraggeber.plz}','${auftraggeber.ort}','${auftraggeber.telefon}','${auftraggeber.email}');`;
	db.query(query, response);
}

function changeAuftraggeber(
	request: { body: any },
	response: any,
	auftraggeberid: any
) {
	let auftraggeber = request.body;
	const q =
		`UPDATE public.auftraggeber SET ` +
		mapObjectToParams(auftraggeber) +
		` WHERE id=${auftraggeberid};`;
	db.query(q, response);
}
function deleteAuftraggeber(
	request: any,
	response: any,
	auftraggeberid: string
) {
	const q = "DELETE FROM public.auftraggeber WHERE id=" + auftraggeberid + ";";
	db.query(q, response);
}
function mapObjectToParams(params: { [x: string]: any }) {
	return Object.keys(params)
		.filter((value) => {
			return value === "id" ? false : true;
		})
		.map((key) => {
			return typeof params[key] === "boolean" || typeof params[key] === "number"
				? `"${key}"=${params[key]}`
				: `"${key}"='${params[key]}'`;
		})
		.join(",");
}

const exportFunctions = {
	getAll,
	getAllWithParams,
	getAllWithParam,
	createAuftraggeber,
	changeAuftraggeber,
	deleteAuftraggeber,
};
export default exportFunctions;
