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
function getPruefungenStatistics(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const q = 'select SUM("selberRaum"::INTEGER) AS "selberRaum", SUM("baulichUnveraendert"::INTEGER) AS "baulichUnveraendert",SUM("hindernisseUmgebung"::INTEGER) AS "hindernisseUmgebung", SUM("relevanteBeschaedigung"::INTEGER) AS "relevanteBeschaedigung", SUM("oeffnungenFrei"::INTEGER) AS "oeffnungenFrei",SUM("warnmelderGereinigt"::INTEGER) AS "warnmelderGereinigt",SUM("pruefungErfolgreich"::INTEGER) AS "pruefungErfolgreich", SUM("batterieGut"::INTEGER) AS "batterieGut" FROM "pruefungenListe"';
        db_1.default.query(q, res);
    });
}
exports.default = {
    getPruefungenStatistics,
};
