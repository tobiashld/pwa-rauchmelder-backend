const db = require('./db');
const helper = require('../helper');

async function getAllInklRauchmelder(request, response,){
  db.query(
    `SELECT pruefungen.timestamp as pruefungszeit,pruefungen.*,"pruefungenListe".*,users.*,objekte.* FROM pruefungen Join "pruefungenListe" On "pruefungenListe"."pruefungsID" = pruefungen.id Join users On users.user_id = pruefungen."userID" Join objekte On pruefungen."objektID" = objekte.id;`,
    response,
    getAllMapping
    );
  
}

function getAllMapping(dataparam,response){
    let data = helper.emptyOrRows(dataparam);
    if(data.length > 0){
        // mapping auf das gewünschte format
        data = data.reduce(function (r, a) {
            r[a.pruefungsID] = r[a.pruefungsID] || {
                id:a.pruefungsID,
                timestamp:a.pruefungszeit,
                user:{
                    id:a.userID,
                    username:a.username
                },
                objekt:{
                    id:a.objektID,
                    name:a.objekt,
                    beschreibung:a.beschreibung,
                    straße:a.straße,
                    hausnummer:a.hausnummer,
                    plz:a.plz,
                    ort:a.ort
                },
                rauchmelder:[]
            };
            r[a.pruefungsID].rauchmelder = r[a.pruefungsID].rauchmelder || [];
            r[a.pruefungsID].rauchmelder.push({
                id:a.rauchmelderID,
                selberRaum:a.selberRaum,
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
  response.status(200).json({data:Object.keys(data).map(key=>data[key])})
}
async function getAllWithParam(request, response,key,value){
    
    const query = 'SELECT pruefungen.timestamp as pruefungszeit,pruefungen.*,"pruefungenListe".*,users.*,objekte.* FROM pruefungen Join "pruefungenListe" On "pruefungenListe"."pruefungsID" = pruefungen.id Join users On users.user_id = pruefungen."userID" Join objekte On pruefungen."objektID" = objekte.id WHERE '+key+' = '+value
    db.query(
        query,
        response
    );
}

async function getAllWithParams(request, response,params){
    const paramsQuery = Object.keys(params).map(key=>`pruefungen."`+key.toString()+`" =`+(Number.isNaN(params[key])?` '${params[key]}'`:` ${params[key]}`)).join(" AND ");
    const query = 'SELECT pruefungen.timestamp as pruefungszeit,pruefungen.*,"pruefungenListe".*,users.*,objekte.* FROM pruefungen Join "pruefungenListe" On "pruefungenListe"."pruefungsID" = pruefungen.id Join users On users.user_id = pruefungen."userID" Join objekte On pruefungen."objektID" = objekte.id WHERE ' +paramsQuery
    db.query(
        query,
        response,
        getAllMapping
    );
}

async function createPruefung(request, response){
        
        let pruefung = request.body
        let timestamp = new Date()
        let client = await db.pool.connect()
        try{
            await client.query('BEGIN')

            const query = `INSERT INTO public.pruefungen("objektID", "userID", "timestamp") VALUES(`+pruefung.objektid+','+pruefung.userid+`,'`
            +timestamp.getHours()+':'+timestamp.getMinutes()+':'+timestamp.getSeconds()+' '+timestamp.getDate()+'.'+timestamp.getMonth()+'.'+timestamp.getFullYear()
            +`') RETURNING id;`;

            res = await client.query(query)


            for(let geprRauchmelder of pruefung.rauchmelder){
                const queryTwo = `INSERT INTO public."pruefungenListe"("rauchmelderID", "selberRaum","baulichUnveraendert","hindernisseUmgebung","relevanteBeschaedigung","oeffnungenFrei","warnmelderGereinigt","pruefungErfolgreich","batterieGut",timestamp,"pruefungsID",grund,anmerkungen,"anmerkungenZwei")
                 VALUES (`
                    +geprRauchmelder.id+`,`
                    +geprRauchmelder.selberRaum+`,`
                    +geprRauchmelder.baulichUnveraendert+`,`
                    +geprRauchmelder.hindernisseUmgebung+`,`
                    +geprRauchmelder.relevanteBeschaedigung+`,`
                    +geprRauchmelder.oeffnungenFrei+`,`
                    +geprRauchmelder.warnmelderGereinigt+`,`
                    +geprRauchmelder.pruefungErfolgreich+`,`
                    +geprRauchmelder.batterieGut+`,'`
                    +geprRauchmelder.timestamp+`',`
                    +res.rows[0].id+`,`
                    +geprRauchmelder.grund+`,'`
                    +geprRauchmelder.anmerkungen+`','`
                    +geprRauchmelder.anmerkungenZwei+`'
                 );`
                await client.query(queryTwo)
            }

            await client.query('COMMIT')
            response.status(200).json({
                data:"Pruefung erfolgreich hinzugefügt"
            })

        }catch(e){
            await client.query('ROLLBACK')
            throw e
        }finally{
            client.release()
        }

}

async function changePruefung(request,response,pruefungsid){
    let pruefung = request.body
    let client = await db.pool.connect()
    try{
        await client.query('BEGIN')

        const q = `UPDATE public.pruefungen SET `+mapObjectToParams(pruefung)+` WHERE id=${pruefungsid};`;
        res = await client.query(q)

        if(pruefung.rauchmelder){
            for(let geprRauchmelder of pruefung.rauchmelder){
                const queryTwo = `UPDATE public."pruefungenListe"
                SET `+mapObjectToParams(geprRauchmelder)+` WHERE id=${geprRauchmelder.id} AND "pruefungsID"=${pruefungsid};`
                await client.query(queryTwo)
            }
        }
        await client.query('COMMIT')
        response.status(200).json({
            data:"Pruefung erfolgreich geändert"
        })

    }catch(e){
        await client.query('ROLLBACK')
        throw e
    }finally{
        client.release()
    }
}
async function deletePruefung(request,response,pruefungsid){
    const q = "DELETE FROM public.pruefungen WHERE id="+pruefungsid+";"
    db.query(q,response)
}
function mapObjectToParams(params){
    return Object.keys(params)
        .filter((value)=>{
            return (value === "id" || value === "rauchmelder")?false:true;
        })
        .map(key=>{
            return (typeof params[key] === "boolean" || typeof params[key] === "number")?`"${key}"=${params[key]}`:`"${key}"='${params[key]}'`
        }).join(",")
}

module.exports = {
  getAllInklRauchmelder,
  getAllWithParams,
  getAllWithParam,
  createPruefung,
  changePruefung,
  deletePruefung
}