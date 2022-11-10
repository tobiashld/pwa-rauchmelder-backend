const db = require('./db');
const helper = require('../helper');

async function getAll(request,response,){
  db.query(
    `SELECT rauchmelder.id,rauchmelder.raum, rauchmelder.seriennr, rauchmelder.produktionsdatum, rauchmelder."letztePruefungsID", public.wohnungen.nachname as mieter,public.objekte.id as objektid,public.objekte.objekt as objektname
    FROM public.rauchmelder
    join public.wohnungen on public.wohnungen.id = public.rauchmelder."wohnungsID" 
    join public.objekte on public.objekte.id = public.rauchmelder."objektID";`,
    response,
    rauchmelderMapping()
  );
  
}
async function getAllWithParams(request, response,params){
  const paramsQuery = Object.keys(params).map(key=>`rauchmelder."`+key.toString()+`" =`+(isNaN(params[key])?` '${params[key]}'`:` ${params[key]}`)).join(" AND ");
  const query = `SELECT rauchmelder.id,rauchmelder.raum, rauchmelder.seriennr, rauchmelder.produktionsdatum, rauchmelder."letztePruefungsID", public.wohnungen.nachname as mieter,public.objekte.id as objektid,public.objekte.objekt as objektname
  FROM public.rauchmelder
  join public.wohnungen on public.wohnungen.id = public.rauchmelder."wohnungsID" 
  join public.objekte on public.objekte.id = public.rauchmelder."objektID" WHERE ` +paramsQuery
  db.query(
      query,
      response
  );
}

async function createRauchmelder(request, response){
      
      let rauchmelder = request.body
      
      const query = `INSERT INTO public.rauchmelder("objektID", raum, seriennr, produktionsdatum, "letztePruefungsID", "wohnungsID") VALUES(${rauchmelder.objektID}, '${rauchmelder.raum}','${rauchmelder.seriennr}','${rauchmelder.produktionsdatum}',0,'${rauchmelder.wohnungsID}');`;
      db.query(
        query,
        response
      )

}

async function changeRauchmelder(request,response,rauchmelderid){
  let rauchmelder = request.body
  const q = `UPDATE public.rauchmelder SET `+mapObjectToParams(rauchmelder)+` WHERE id=${rauchmelderid};`;
  db.query(
    q,
    response
    )


}
async function deleteRauchmelder(request,response,rauchmelderid){
  const q = "DELETE FROM public.rauchmelder WHERE id="+rauchmelderid+";"
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


const rauchmelderMapping = (rows,response)=>{
  let data = helper.emptyOrRows(rows);
  if(data.length > 0){
    data = data.map(rauchmelder=>{
      
    })
  }
}
module.exports = {
  getAll,
  getAllWithParams,
  changeRauchmelder,
  deleteRauchmelder,
  createRauchmelder
}