const db = require("./db");
const helper = require("../helper");

async function getAll(request, response) {
  db.query(`SELECT * FROM objekte`, response);
}
async function getAllWithParam(request, response, key, value) {
  const query = 'SELECT * FROM public.objekte WHERE "' + key + '" = ' + value;
  db.query(query, response);
}

async function getAllWithParams(request, response, params) {
  const paramsQuery = Object.keys(params)
    .map(
      (key) =>
        `objekte."` +
        key.toString() +
        `" =` +
        (isNaN(params[key]) ? ` '${params[key]}'` : ` ${params[key]}`)
    )
    .join(" AND ");
  const query = "SELECT * FROM public.objekte WHERE " + paramsQuery;
  console.log(query);
  db.query(query, response);
}
async function createObjekt(request, response) {
  var objekt = request.body;

  const query = `INSERT INTO public.objekte("objekt", "beschreibung", "auftraggeberID","straße","hausnummer","plz","ort") VALUES('${objekt.objekt}', '${objekt.beschreibung}',${objekt.auftraggeberID},'${objekt.straße}',${objekt.hausnummer},${objekt.plz},'${objekt.ort}');`;
  db.query(query, response);
}

async function changeObjekt(request, response, objektid) {
  var objekt = request.body;
  const q =
    `UPDATE public.objekte SET ` +
    mapObjectToParams(objekt) +
    ` WHERE id=${objektid};`;
  db.query(q, response);
}

async function deleteObjekt(request, response, objektid) {
  const q = "DELETE FROM public.objekte WHERE id=" + objektid + ";";
  db.query(q, response);
}

function mapObjectToParams(params) {
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

module.exports = {
  getAll,
  getAllWithParams,
  getAllWithParam,
  createObjekt,
  deleteObjekt,
  changeObjekt,
};
