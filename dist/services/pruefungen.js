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
const helper = require('../helper');
function getAllInklRauchmelder(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        let { accessToken, refreshToken } = request.cookies;
        let { username, id } = jwt.decode(refreshToken);
        if (username !== "admin") {
            db_1.default.query(`SELECT pruefungen.timestamp as pruefungszeit,pruefungen.*,"pruefungenListe".id as listenid,"pruefungenListe".*,users.*,objekte.* FROM pruefungen Join "pruefungenListe" On "pruefungenListe"."pruefungsID" = pruefungen.id Join users On users.user_id = pruefungen."userID" Join objekte On pruefungen."objektID" = objekte.id WHERE pruefungen."userID" = ${id};`, response, getAllMapping);
        }
        else {
            db_1.default.query(`SELECT pruefungen.timestamp as pruefungszeit,pruefungen.*,"pruefungenListe".id as listenid,"pruefungenListe".*,users.*,objekte.* FROM pruefungen Join "pruefungenListe" On "pruefungenListe"."pruefungsID" = pruefungen.id Join users On users.user_id = pruefungen."userID" Join objekte On pruefungen."objektID" = objekte.id;`, response, getAllMapping);
        }
        // if(id===1){
        //     db.prisma.pruefungen.findMany({
        //         where:{
        //             userID:id
        //         },
        //         include:{
        //             pruefungensDetails:{
        //                 include:{
        //                     rauchmelderhistorie:true
        //                 }
        //             }
        //         }
        //     })
        // }
    });
}
function getAllMapping(dataparam, response) {
    let data = helper.emptyOrRows(dataparam);
    if (data.length > 0) {
        // mapping auf das gewünschte format
        data = data.reduce(function (r, a) {
            r[a.pruefungsID] = r[a.pruefungsID] || {
                id: a.pruefungsID,
                timestamp: a.pruefungszeit,
                user: {
                    id: a.userID,
                    username: a.username
                },
                objekt: {
                    id: a.objektID,
                    name: a.objekt,
                    beschreibung: a.beschreibung,
                    straße: a.straße,
                    hausnummer: a.hausnummer,
                    plz: a.plz,
                    ort: a.ort
                },
                rauchmelder: []
            };
            r[a.pruefungsID].rauchmelder = r[a.pruefungsID].rauchmelder || [];
            r[a.pruefungsID].rauchmelder.push({
                id: a.listenid,
                rauchmelderId: a.rauchmelderID,
                selberRaum: a.selberRaum,
                baulichUnveraendert: a.baulichUnveraendert,
                hindernisseUmgebung: a.hindernisseUmgebung,
                relevanteBeschaedigung: a.relevanteBeschaedigung,
                oeffnungenFrei: a.oeffnungenFrei,
                warnmelderGereinigt: a.warnmelderGereinigt,
                pruefungErfolgreich: a.pruefungErfolgreich,
                batterieGut: a.batterieGut,
                grund: a.grund,
                anmerkungen: a.anmerkungen,
                anmerkungenZwei: a.anmerkungenZwei
            });
            return r;
        }, Object.create(null));
    }
    response.status(200).json({ data: Object.keys(data).map(key => data[key]) });
}
function getAllWithParam(request, response, key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'SELECT pruefungen.timestamp as pruefungszeit,pruefungen.*,"pruefungenListe".*,users.*,objekte.* FROM pruefungen Join "pruefungenListe" On "pruefungenListe"."pruefungsID" = pruefungen.id Join users On users.user_id = pruefungen."userID" Join objekte On pruefungen."objektID" = objekte.id WHERE ' + key + ' = ' + value;
        db_1.default.query(query, response);
    });
}
function getAllWithParams(request, response, id) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.default.prisma.pruefungen.findUnique({
            include: {
                objekt: true,
                pruefungenListe: {
                    include: {
                        rauchmelderhistorie: true
                    }
                },
            },
            where: {
                id: Number.parseInt(id)
            }
        }).then(pruefung => {
            response.status(200).json({
                status: 200,
                data: [pruefung]
            });
        });
        // const query = 'SELECT pruefungen.timestamp as pruefungszeit,pruefungen.*,"pruefungenListe".*,users.*,objekte.* FROM pruefungen Join "pruefungenListe" On "pruefungenListe"."pruefungsID" = pruefungen.id Join users On users.user_id = pruefungen."userID" Join objekte On pruefungen."objektID" = objekte.id WHERE ' +paramsQuery
        // db.query(
        //     query,
        //     response,
        //     getAllMapping
        // );
    });
}
function createPruefung(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const { accessToken, refreshToken } = request.cookies;
        let pruefung = request.body;
        let user = jwt.decode(refreshToken);
        let timestamp = new Date();
        let client = yield db_1.default.pool.connect();
        try {
            yield client.query('BEGIN');
            const query = `INSERT INTO public.pruefungen("objektID", "userID", "timestamp") VALUES(` + pruefung.objektid + ',' + user.id + `,'`
                + timestamp.getHours() + ':' + timestamp.getMinutes() + ':' + timestamp.getSeconds() + ' ' + timestamp.getDate() + '.' + timestamp.getMonth() + '.' + timestamp.getFullYear()
                + `') RETURNING id;`;
            let res = yield client.query(query);
            for (let geprRauchmelder of pruefung.rauchmelder) {
                const queryTwo = `INSERT INTO public."pruefungenListe"("rauchmelderID", "selberRaum","baulichUnveraendert","hindernisseUmgebung","relevanteBeschaedigung","oeffnungenFrei","warnmelderGereinigt","pruefungErfolgreich","batterieGut",timestamp,"pruefungsID",grund,anmerkungen,"anmerkungenZwei")
                 VALUES (`
                    + geprRauchmelder.id + `,`
                    + geprRauchmelder.selberRaum + `,`
                    + geprRauchmelder.baulichUnveraendert + `,`
                    + geprRauchmelder.hindernisseUmgebung + `,`
                    + geprRauchmelder.relevanteBeschaedigung + `,`
                    + geprRauchmelder.oeffnungenFrei + `,`
                    + geprRauchmelder.warnmelderGereinigt + `,`
                    + geprRauchmelder.pruefungErfolgreich + `,`
                    + geprRauchmelder.batterieGut + `,'`
                    + geprRauchmelder.timestamp + `',`
                    + res.rows[0].id + `,`
                    + geprRauchmelder.grund + `,'`
                    + geprRauchmelder.anmerkungen + `','`
                    + geprRauchmelder.anmerkungenZwei + `'
                 );`;
                yield client.query(queryTwo);
            }
            yield client.query('COMMIT');
            response.status(200).json({
                status: 200,
                data: "Pruefung erfolgreich hinzugefügt"
            });
        }
        catch (e) {
            yield client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    });
}
function changePruefung(request, response, pruefungsid) {
    return __awaiter(this, void 0, void 0, function* () {
        let pruefung = request.body;
        let client = yield db_1.default.pool.connect();
        try {
            yield client.query('BEGIN');
            const q = `UPDATE public.pruefungen SET ` + mapObjectToParams(pruefung) + ` WHERE id=${pruefungsid};`;
            let res = yield client.query(q);
            if (pruefung.rauchmelder) {
                for (let geprRauchmelder of pruefung.rauchmelder) {
                    const queryTwo = `UPDATE public."pruefungenListe"
                SET ` + mapObjectToParams(geprRauchmelder) + ` WHERE id=${geprRauchmelder.id} AND "pruefungsID"=${pruefungsid};`;
                    yield client.query(queryTwo);
                }
            }
            yield client.query('COMMIT');
            response.status(200).json({
                data: "Pruefung erfolgreich geändert"
            });
        }
        catch (e) {
            yield client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    });
}
function deletePruefung(request, response, pruefungsid) {
    return __awaiter(this, void 0, void 0, function* () {
        const q = "DELETE FROM public.pruefungen WHERE id=" + pruefungsid + ";";
        db_1.default.query(q, response);
    });
}
function mapObjectToParams(params) {
    return Object.keys(params)
        .filter((value) => {
        return (value === "id" || value === "rauchmelder") ? false : true;
    })
        .map(key => {
        return (typeof params[key] === "boolean" || typeof params[key] === "number") ? `"${key}"=${params[key]}` : `"${key}"='${params[key]}'`;
    }).join(",");
}
exports.default = {
    getAllInklRauchmelder,
    getAllWithParams,
    getAllWithParam,
    createPruefung,
    changePruefung,
    deletePruefung
};
