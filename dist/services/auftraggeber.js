"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
const helper = require("../helper");
function getAll(request, response) {
    db_1.default.query(`SELECT * FROM public.auftraggeber;`, response);
}
function getAllWithParam(request, response, key, value) {
    const query = "SELECT * FROM public.auftraggeber WHERE " + key + " = " + value;
    db_1.default.query(query, response);
}
function getAllWithParams(request, response, params) {
    const paramsQuery = Object.keys(params)
        .map((key) => `auftraggeber."` +
        key.toString() +
        `" =` +
        (Number.isNaN(params[key]) ? ` '${params[key]}'` : ` ${params[key]}`))
        .join(" AND ");
    const query = "SELECT * FROM public.auftraggeber WHERE " + paramsQuery;
    db_1.default.query(query, response);
}
function createAuftraggeber(request, response) {
    let auftraggeber = request.body;
    const query = `INSERT INTO public.auftraggeber("name", "straße", "hausnummer","plz","ort","telefon","email") VALUES('${auftraggeber.name}', '${auftraggeber.straße}',${auftraggeber.hausnummer},'${auftraggeber.plz}','${auftraggeber.ort}','${auftraggeber.telefon}','${auftraggeber.email}');`;
    db_1.default.query(query, response);
}
function changeAuftraggeber(request, response, auftraggeberid) {
    let auftraggeber = request.body;
    const q = `UPDATE public.auftraggeber SET ` +
        mapObjectToParams(auftraggeber) +
        ` WHERE id=${auftraggeberid};`;
    db_1.default.query(q, response);
}
function deleteAuftraggeber(request, response, auftraggeberid) {
    const q = "DELETE FROM public.auftraggeber WHERE id=" + auftraggeberid + ";";
    db_1.default.query(q, response);
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
const exportFunctions = {
    getAll,
    getAllWithParams,
    getAllWithParam,
    createAuftraggeber,
    changeAuftraggeber,
    deleteAuftraggeber,
};
exports.default = exportFunctions;
