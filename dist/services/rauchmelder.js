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
const helper = require("../helper");
function getAll(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.default.prisma.rauchmelder
            .findMany({
            include: {
                aktuellerRauchmelder: true,
                wohnungen: true,
            },
            orderBy: {
                id: "asc",
            },
        })
            .then((data) => {
            response.status(200).json({
                status: 200,
                data: data,
            });
        });
        // db.query(
        //   `SELECT * from rauchmelderhistorie`,
        //   response,
        //   rauchmelderMapping
        // );
    });
}
function getActiveWithHistoryId(request, response, historyId) {
    db_1.default.prisma.rauchmelder
        .findMany({
        where: {
            aktuelleHistorienID: historyId,
        },
        include: {
            aktuellerRauchmelder: true,
        },
        orderBy: {
            aktuelleHistorienID: "asc",
        },
    })
        .then((data) => {
        response.status(200).json({
            status: 200,
            data: data,
        });
    });
}
function getAllWithObjectId(request, response, objektId) {
    return __awaiter(this, void 0, void 0, function* () {
        // db.prisma.rauchmelderhistorie.findMany({
        //   where:{
        //     rauchmelder:{
        //       wohnungen:{
        //         objektID:{
        //           equals:objektId
        //         }
        //       }
        //     }
        //   },
        //   include:{
        //     rauchmelder:{
        //       include:{
        //         wohnungen:{
        //           include:{objekt:true}
        //         }
        //       }
        //     }
        //   },
        //   orderBy:{id:"asc"}
        // })
        db_1.default.prisma.rauchmelder
            .findMany({
            where: {
                wohnungen: {
                    objektID: {
                        equals: objektId,
                    },
                },
            },
            include: {
                aktuellerRauchmelder: true,
                wohnungen: {
                    include: {
                        objekte: true,
                    },
                },
            },
            orderBy: {
                aktuelleHistorienID: "asc",
            },
        })
            .then((data) => {
            console.log(data);
            response.status(200).json({
                status: 200,
                data: data,
            });
        });
    });
}
function getAllWithParams(request, response, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const paramsQuery = Object.keys(params)
            .map((key) => `rauchmelder."` +
            key.toString() +
            `" =` +
            (isNaN(params[key]) ? ` '${params[key]}'` : ` ${params[key]}`))
            .join(" AND ");
        const query = `SELECT rauchmelder.id,rauchmelder."wohnungsID",rauchmelder.raum, rauchmelder.seriennr, rauchmelder.produktionsdatum, rauchmelder."letztePruefungsID", public.wohnungen.nachname as mieter,public.objekte.id as objektid,public.objekte.objekt as objektname
  FROM public.rauchmelder
  join public.wohnungen on public.wohnungen.id = public.rauchmelder."wohnungsID" 
  join public.objekte on public.objekte.id = public.rauchmelder."objektID" WHERE ` +
            paramsQuery;
        db_1.default.query(query, response);
    });
}
function createRauchmelder(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.default.prisma.rauchmelder
            .create({
            include: {
                aktuellerRauchmelder: true,
            },
            data: Object.assign({}, request.body),
        })
            .then((data) => {
            response.status(200).json({
                status: 200,
                data: data,
            });
        });
        // let rauchmelder = request.body
        // const query = `INSERT INTO public.rauchmelder("objektID", raum, seriennr, produktionsdatum, "letztePruefungsID", "wohnungsID") VALUES(${rauchmelder.objektID}, '${rauchmelder.raum}','${rauchmelder.seriennr}','${rauchmelder.produktionsdatum}',0,'${rauchmelder.wohnungsID}');`;
        // db.query(
        //   query,
        //   response
        // )
    });
}
function changeRauchmelder(request, response, rauchmelderid) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.default.prisma.rauchmelderhistorie
            .update({
            data: Object.assign({}, request.body),
            where: {
                id: rauchmelderid,
            },
        })
            .then((data) => {
            response.status(200).json({
                status: 200,
                data: data,
            });
        });
        // let rauchmelder = request.body
        // const q = `UPDATE public.rauchmelder SET `+mapObjectToParams(rauchmelder)+` WHERE id=${rauchmelderid};`;
        // db.query(
        //   q,
        //   response
        //   )
    });
}
function getWithHistoryId(request, response, rauchmelderhistorienid) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.default.prisma.rauchmelderhistorie
            .findMany({
            where: {
                id: {
                    equals: rauchmelderhistorienid,
                },
            },
        })
            .then((data) => {
            response.status(200).json({
                status: 200,
                data: data,
            });
        });
    });
}
function getHistory(request, response, rauchmelderhistorienid) {
    return __awaiter(this, void 0, void 0, function* () {
        db_1.default.prisma.rauchmelderhistorie
            .findMany({
            select: {
                rauchmelder: {
                    select: {
                        rauchmelderhistorie: true,
                        wohnungen: {
                            select: {
                                nachname: true,
                                vorname: true,
                                etage: true,
                                wohnungslage: true,
                                haus: true,
                                objektID: true,
                            },
                        },
                    },
                },
            },
            where: {
                id: rauchmelderhistorienid,
            },
        })
            .then((data) => {
            response.status(200).json({
                status: 200,
                data: data,
            });
        });
    });
}
function switchAndCreateRauchmelder(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        // let newRauchmelder : Rauchmelder = {
        //   produktionsdatum:new Date(2001,10,10),
        //   seriennr:'101010101',
        //   raum:'penis',
        //   isactive:true
        // }
        // let altRauchmelderBz : RauchmelderBeziehung= {
        //   id:951,
        //   aktuelleHistorienID:954,
        //   wohnungsID:295,
        //   aktuellerRauchmelder:{
        //     id:954,
        //     raum:'Flur',
        //     produktionsdatum:new Date(2001,10,10),
        //     seriennr:'101010101',
        //     isactive:true
        //   }
        // }
        let newRauchmelder = request.body.newRauchmelder;
        let altRauchmelderBz = request.body.altRauchmelderBz;
        db_1.default.prisma.rauchmelderhistorie
            .create({
            data: {
                produktionsdatum: newRauchmelder.produktionsdatum,
                raum: altRauchmelderBz.aktuellerRauchmelder.raum,
                seriennr: newRauchmelder.seriennr,
                isactive: true,
                installedAt: new Date(),
                outOfOrderAt: null,
                rauchmelder: {
                    connect: {
                        id: altRauchmelderBz.id,
                    },
                },
            },
            include: {
                rauchmelder: true,
            },
        })
            .then((value) => {
            console.log(altRauchmelderBz.aktuellerRauchmelder.id);
            db_1.default.prisma.rauchmelderhistorie
                .update({
                data: {
                    isactive: false,
                    outOfOrderAt: new Date(),
                },
                where: {
                    id: altRauchmelderBz.aktuellerRauchmelder.id,
                },
            })
                .then((test) => {
                db_1.default.prisma.rauchmelder
                    .update({
                    data: {
                        aktuelleHistorienID: value.id,
                    },
                    where: {
                        id: altRauchmelderBz.id,
                    },
                })
                    .then((test) => {
                    response.status(200).json({
                        status: 200,
                        data: value,
                    });
                });
            });
        })
            .catch((e) => {
            throw e;
        });
    });
}
function deleteRauchmelder(request, response, rauchmelderid) {
    return __awaiter(this, void 0, void 0, function* () {
        // db.prisma.rauchmelder.update({
        // 	data:{
        // 		rauchmelderhistorie:{
        // 			disconnect:{
        // 				id:
        // 			}
        // 		}
        // 	},
        // 	where:{
        // 		id:rauchmelderid
        // 	}
        // })
        const q = "DELETE FROM public.rauchmelder WHERE id=" + rauchmelderid + ";";
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
const rauchmelderMapping = (rows, response) => {
    let data = helper.emptyOrRows(rows);
    if (data.length > 0) {
        // data.forEach((rauchmelderhistorie:any)=>{
        //   let query = `UPDATE
        //     public.rauchmelderhistorie SET
        //     "wohnungsID"=${rauchmelderhistorie.id}
        //     WHERE id=${rauchmelderhistorie.id};
        //   `
        //   console.log(query)
        //   db.pool.query(query).catch(e=>{
        //         console.log(e)
        //       })
        // })
        // data.forEach(rauchmelder=>{
        //   console.log(rauchmelder)
        //   const query = `
        //       UPDATE
        //         public.rauchmelder SET
        //         "qrNummer"=${rauchmelder.id}
        //         WHERE id=${rauchmelder.id};
        //   `
        //   db.pool.query(query).catch(e=>{
        //     console.log(e)
        //   })
        // })
        // mapping von rauchmeldern zu rauchmelderhistorie
        // data.forEach(rauchmelder=>{
        //   const query = `INSERT INTO public.rauchmelderhistorie (id,"wohnungsID", raum, seriennr, produktionsdatum, "installedAt", "outOfOrderAt", isactive) VALUES(${rauchmelder.id}, ${rauchmelder.wohnungsID},'${rauchmelder.raum}','${rauchmelder.seriennr}','${rauchmelder.produktionsdatum.split(".").reverse().join("")}',NULL,NULL,true);`;
        //   db.pool.query(query).catch(e=>{})
        // })
        response.status(200).json({
            status: 200,
            data: data,
        });
    }
    else {
        response.status(200).json({
            status: 406,
            error: "keine Daten",
        });
    }
};
exports.default = {
    getAllWithObjectId,
    getAll,
    getHistory,
    getAllWithParams,
    getActiveWithHistoryId,
    switchAndCreateRauchmelder,
    changeRauchmelder,
    deleteRauchmelder,
    createRauchmelder,
    getWithHistoryId,
};
