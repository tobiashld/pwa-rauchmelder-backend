const db = require('./db');
const helper = require('../helper');

async function getAll(request, response,){
  db.query(
    `SELECT * FROM public.auftraggeber;`,
    response,
    );
  
}


async function getAllWithParam(request, response,key,value){
    
    const query = 'SELECT * FROM public.auftraggeber WHERE '+key+' = '+value
    db.query(
        query,
        response
    );
}

async function getAllWithParams(request, response,params){
    const paramsQuery = Object.keys(params).map(key=>`auftraggeber."`+key.toString()+`" =`+(Number.isNaN(params[key])?` '${params[key]}'`:` ${params[key]}`)).join(" AND ");
    const query = 'SELECT * FROM public.auftraggeber WHERE ' +paramsQuery
    db.query(
        query,
        response
    );
}

async function createAuftraggeber(request, response){
        
        let auftraggeber = request.body
        
        const query = `INSERT INTO public.auftraggeber("name", "straße", "hausnummer","plz","ort","telefon","email") VALUES('${auftraggeber.name}', '${auftraggeber.straße}',${auftraggeber.hausnummer},'${auftraggeber.plz}','${auftraggeber.ort}','${auftraggeber.telefon}','${auftraggeber.email}');`;
        db.query(
          query,
          response
        )

}

async function changeAuftraggeber(request,response,auftraggeberid){
    let auftraggeber = request.body
    const q = `UPDATE public.auftraggeber SET `+mapObjectToParams(auftraggeber)+` WHERE id=${auftraggeberid};`;
    db.query(
      q,
      response
      )


}
async function deleteAuftraggeber(request,response,auftraggeberid){
    const q = "DELETE FROM public.auftraggeber WHERE id="+auftraggeberid+";"
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
  createAuftraggeber,
  changeAuftraggeber,
  deleteAuftraggeber
}