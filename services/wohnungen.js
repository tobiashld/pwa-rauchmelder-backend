const db = require('./db');
const helper = require('../helper');

async function getAll(request, response,){
  db.query(
    `SELECT * FROM public.wohnungen;`,
    response,
    );
  
}


async function getAllWithParam(request, response,key,value){
    
    const query = 'SELECT * FROM public.wohnungen WHERE '+key+' = '+value
    db.query(
        query,
        response
    );
}

async function getAllWithParams(request, response,params){
    const paramsQuery = Object.keys(params).map(key=>`wohnungen."`+key.toString()+`" =`+(Number.isNaN(params[key])?` '${params[key]}'`:` ${params[key]}`)).join(" AND ");
    const query = 'SELECT * FROM public.wohnungen WHERE ' +paramsQuery
    db.query(
        query,
        response
    );
}

async function createWohnung(request, response){
        
        let wohnung = request.body
        
        const query = `INSERT INTO public.wohnungen("objektID", "etage", "wohnungslage","haus","vorname","nachname") VALUES(${wohnung.objektID}, '${wohnung.etage}','${wohnung.wohnungslage}','${wohnung.haus}','${wohnung.vorname}','${wohnung.nachname}');`;
        db.query(
          query,
          response
        )

}

async function changeWohnung(request,response,wohnungsid){
    let wohnung = request.body
    const q = `UPDATE public.wohnungen SET `+mapObjectToParams(wohnung)+` WHERE id=${wohnungsid};`;
    db.query(
      q,
      response
      )


}
async function deleteWohnung(request,response,wohnungsid){
    const q = "DELETE FROM public.wohnungen WHERE id="+wohnungsid+";"
    db.query(q,response)
}
function mapObjectToParams(params){
    return Object.keys(params)
        .filter((value)=>{
            return (value === "id")?false:true;
        })
        .map(key=>{
            return (typeof params[key] === "boolean" || typeof params[key] === "number")?`"${key}"=${params[key]}`:`"${key}"='${params[key]}'`
        }).join(",")
}

module.exports = {
  getAll,
  getAllWithParams,
  getAllWithParam,
  createWohnung,
  changeWohnung,
  deleteWohnung
}