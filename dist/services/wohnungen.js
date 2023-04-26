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
const helper = require('../helper');
function getAll(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.default.prisma.wohnungen.findMany({
            orderBy: {
                id: "asc"
            }
        }).then(data => {
            response.status(200).json({
                status: 200,
                data: data,
            });
        });
    });
}
function getAllWithParam(request, response, key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'SELECT * FROM public.wohnungen WHERE ' + key + ' = ' + value;
        db_1.default.query(query, response);
    });
}
function getAllWithParams(request, response, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const paramsQuery = Object.keys(params).map(key => `wohnungen."` + key.toString() + `" =` + (Number.isNaN(params[key]) ? ` '${params[key]}'` : ` ${params[key]}`)).join(" AND ");
        const query = 'SELECT * FROM public.wohnungen WHERE ' + paramsQuery;
        db_1.default.query(query, response);
    });
}
function createWohnung(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        let wohnung = request.body;
        const query = `INSERT INTO public.wohnungen("objektID", "etage", "wohnungslage","haus","vorname","nachname") VALUES(${wohnung.objektID}, '${wohnung.etage}','${wohnung.wohnungslage}','${wohnung.haus}','${wohnung.vorname}','${wohnung.nachname}');`;
        db_1.default.query(query, response);
    });
}
function changeWohnung(request, response, wohnungsid) {
    return __awaiter(this, void 0, void 0, function* () {
        let wohnung = request.body;
        const q = `UPDATE public.wohnungen SET ` + mapObjectToParams(wohnung) + ` WHERE id=${wohnungsid};`;
        db_1.default.query(q, response);
    });
}
function deleteWohnung(request, response, wohnungsid) {
    return __awaiter(this, void 0, void 0, function* () {
        const q = "DELETE FROM public.wohnungen WHERE id=" + wohnungsid + ";";
        db_1.default.query(q, response);
    });
}
function mapObjectToParams(params) {
    return Object.keys(params)
        .filter((value) => {
        return (value === "id") ? false : true;
    })
        .map(key => {
        return (typeof params[key] === "boolean" || typeof params[key] === "number") ? `"${key}"=${params[key]}` : `"${key}"='${params[key]}'`;
    }).join(",");
}
exports.default = {
    getAll,
    getAllWithParams,
    getAllWithParam,
    createWohnung,
    changeWohnung,
    deleteWohnung
};
