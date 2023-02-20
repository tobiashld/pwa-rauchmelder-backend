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
const db = require('./db');
const helper = require('../helper');
function getAll(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        db.
            db.query(`SELECT rauchmelder.id,rauchmelder."wohnungsID",rauchmelder.raum, rauchmelder.seriennr, rauchmelder.produktionsdatum, rauchmelder."letztePruefungsID", public.wohnungen.nachname as mieter,public.objekte.id as objektid,public.objekte.objekt as objektname
    FROM public.rauchmelder
    join public.wohnungen on public.wohnungen.id = public.rauchmelder."wohnungsID" 
    join public.objekte on public.objekte.id = public.rauchmelder."objektID";`, response, rauchmelderMapping);
    });
}
function getAllWithParams(request, response, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const paramsQuery = Object.keys(params).map(key => `rauchmelder."` + key.toString() + `" =` + (isNaN(params[key]) ? ` '${params[key]}'` : ` ${params[key]}`)).join(" AND ");
        const query = `SELECT rauchmelder.id,rauchmelder."wohnungsID",rauchmelder.raum, rauchmelder.seriennr, rauchmelder.produktionsdatum, rauchmelder."letztePruefungsID", public.wohnungen.nachname as mieter,public.objekte.id as objektid,public.objekte.objekt as objektname
  FROM public.rauchmelder
  join public.wohnungen on public.wohnungen.id = public.rauchmelder."wohnungsID" 
  join public.objekte on public.objekte.id = public.rauchmelder."objektID" WHERE ` + paramsQuery;
        db.query(query, response);
    });
}
function createRauchmelder(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        let rauchmelder = request.body;
        const query = `INSERT INTO public.rauchmelder("objektID", raum, seriennr, produktionsdatum, "letztePruefungsID", "wohnungsID") VALUES(${rauchmelder.objektID}, '${rauchmelder.raum}','${rauchmelder.seriennr}','${rauchmelder.produktionsdatum}',0,'${rauchmelder.wohnungsID}');`;
        db.query(query, response);
    });
}
function changeRauchmelder(request, response, rauchmelderid) {
    return __awaiter(this, void 0, void 0, function* () {
        let rauchmelder = request.body;
        const q = `UPDATE public.rauchmelder SET ` + mapObjectToParams(rauchmelder) + ` WHERE id=${rauchmelderid};`;
        db.query(q, response);
    });
}
function getVariante(request, response, rauchmelderhistorienid) {
    return __awaiter(this, void 0, void 0, function* () {
        const q = ``;
        db.query(q, response);
    });
}
function connectRauchmelderhistorieToRauchmelder(request, response, rauchmelderhistorienid, rauchmelderid) {
    return __awaiter(this, void 0, void 0, function* () { });
}
function deleteRauchmelder(request, response, rauchmelderid) {
    return __awaiter(this, void 0, void 0, function* () {
        const q = "DELETE FROM public.rauchmelder WHERE id=" + rauchmelderid + ";";
        db.query(q, response);
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
const rauchmelderMapping = (rows, response) => {
    let data = helper.emptyOrRows(rows);
    if (data.length > 0) {
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
module.exports = {
    getAll,
    getAllWithParams,
    changeRauchmelder,
    deleteRauchmelder,
    createRauchmelder,
    getVariante
};
