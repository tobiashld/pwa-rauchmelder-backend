import db from "./db";

const alleFunctions = {
	getAll,
	getAllWithParams,
	createObjekt,
	deleteObjekt,
	changeObjekt,
};
async function getAll(request: any, response: any) {
	db.prisma.objekte
		.findMany({
			include: {
				auftraggeber: true,
			},
		})
		.then((data: any) => {
			response.status(200).json({
				status: 200,
				data: data,
			});
		});
	// db.query(`SELECT * FROM objekte`, response);
}

async function getAllWithParams(
	request: any,
	response: any,
	params: { [x: string]: any }
) {
	const paramsQuery = Object.keys(params)
		.map((key) =>
			key.match(RegExp("[A-Z]"))
				? `objekte.` +
				  key.toString() +
				  ` =` +
				  (isNaN(params[key]) ? ` '${params[key]}'` : ` ${params[key]}`)
				: `objekte."` +
				  key.toString() +
				  `" =` +
				  (isNaN(params[key]) ? ` '${params[key]}'` : ` ${params[key]}`)
		)
		.join(" AND ");

	const query = "SELECT * FROM public.objekte WHERE " + paramsQuery;
	db.query(query, response);
}

async function createObjekt(request: { body: any }, response: any) {
	var objekt = request.body;

	const query = `INSERT INTO public.objekte("objekt", "beschreibung", "auftraggeberID","straße","hausnummer","plz","ort") VALUES('${objekt.objekt}', '${objekt.beschreibung}',${objekt.auftraggeberID},'${objekt.straße}',${objekt.hausnummer},${objekt.plz},'${objekt.ort}');`;
	db.query(query, response);
}

async function changeObjekt(
	request: { body: any },
	response: any,
	objektid: any
) {
	var objekt = request.body;
	const q =
		`UPDATE public.objekte SET ` +
		mapObjectToParams(objekt) +
		` WHERE id=${objektid};`;
	db.query(q, response);
}

async function deleteObjekt(request: any, response: any, objektid: string) {
	const q = "DELETE FROM public.objekte WHERE id=" + objektid + ";";
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

export default alleFunctions;
