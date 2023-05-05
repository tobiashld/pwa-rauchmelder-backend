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
const alleFunctions = {
    getAll,
    getAllWithParams,
    createObjekt,
    deleteObjekt,
    changeObjekt,
};
function getAll(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.default.prisma.objekte
            .findMany({
            include: {
                auftraggeber: true,
            },
        })
            .then((data) => {
            response.status(200).json({
                status: 200,
                data: data,
            });
        });
        // db.query(`SELECT * FROM objekte`, response);
    });
}
function getAllWithParams(request, response, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const paramsQuery = Object.keys(params)
            .map((key) => key.match(RegExp("[A-Z]"))
            ? `objekte.` +
                key.toString() +
                ` =` +
                (isNaN(params[key]) ? ` '${params[key]}'` : ` ${params[key]}`)
            : `objekte."` +
                key.toString() +
                `" =` +
                (isNaN(params[key]) ? ` '${params[key]}'` : ` ${params[key]}`))
            .join(" AND ");
        const query = "SELECT * FROM public.objekte WHERE " + paramsQuery;
        db_1.default.query(query, response);
    });
}
function createObjekt(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        var objekt = request.body;
        const query = `INSERT INTO public.objekte("objekt", "beschreibung", "auftraggeberID","straße","hausnummer","plz","ort") VALUES('${objekt.objekt}', '${objekt.beschreibung}',${objekt.auftraggeberID},'${objekt.straße}',${objekt.hausnummer},${objekt.plz},'${objekt.ort}');`;
        db_1.default.query(query, response);
    });
}
function changeObjekt(request, response, objektid) {
    return __awaiter(this, void 0, void 0, function* () {
        var objekt = request.body;
        const q = `UPDATE public.objekte SET ` +
            mapObjectToParams(objekt) +
            ` WHERE id=${objektid};`;
        db_1.default.query(q, response);
    });
}
function deleteObjekt(request, response, objektid) {
    return __awaiter(this, void 0, void 0, function* () {
        const q = "DELETE FROM public.objekte WHERE id=" + objektid + ";";
        db_1.default.query(q, response);
    });
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
exports.default = alleFunctions;
