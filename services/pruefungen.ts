import db from './db';
const jwt = require("jsonwebtoken")
const helper = require('../helper');

async function getAllInklRauchmelder(request:any, response: any,){
    let {accessToken,refreshToken} = request.cookies
    let {username,id} = jwt.decode(refreshToken)
    if(username !== "admin"){
        db.query(
            `SELECT pruefungen.timestamp as pruefungszeit,pruefungen.*,"pruefungenListe".id as listenid,"pruefungenListe".*,users.*,objekte.* FROM pruefungen Join "pruefungenListe" On "pruefungenListe"."pruefungsID" = pruefungen.id Join users On users.user_id = pruefungen."userID" Join objekte On pruefungen."objektID" = objekte.id WHERE pruefungen."userID" = ${id};`,
            response,
            getAllMapping
            );
    }else{
        
        db.query(
            `SELECT pruefungen.timestamp as pruefungszeit,pruefungen.*,"pruefungenListe".id as listenid,"pruefungenListe".*,users.*,objekte.* FROM pruefungen Join "pruefungenListe" On "pruefungenListe"."pruefungsID" = pruefungen.id Join users On users.user_id = pruefungen."userID" Join objekte On pruefungen."objektID" = objekte.id;`,
            response,
            getAllMapping
            );
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
  
  
}

function getAllMapping(dataparam: any,response: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { data: any[]; }): void; new(): any; }; }; }){
    let data = helper.emptyOrRows(dataparam);
    if(data.length > 0){
        // mapping auf das gewünschte format
        data = data.reduce(function (r: { [x: string]: { rauchmelder: { id: any; rauchmelderId: any; selberRaum: any; baulichUnveraendert: any; hindernisseUmgebung: any; relevanteBeschaedigung: any; oeffnungenFrei: any; warnmelderGereinigt: any; pruefungErfolgreich: any; batterieGut: any; grund: any; anmerkungen: any; anmerkungenZwei: any; }[]; }; }, a: { pruefungsID: string | number; pruefungszeit: any; userID: any; username: any; objektID: any; objekt: any; beschreibung: any; straße: any; hausnummer: any; plz: any; ort: any; listenid: any; rauchmelderID: any; selberRaum: any; baulichUnveraendert: any; hindernisseUmgebung: any; relevanteBeschaedigung: any; oeffnungenFrei: any; warnmelderGereinigt: any; pruefungErfolgreich: any; batterieGut: any; grund: any; anmerkungen: any; anmerkungenZwei: any; }) {
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
                id:a.listenid,
                rauchmelderId:a.rauchmelderID,
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
async function getAllWithParam(request: any, response: any,key: string,value: string){
    
    const query = 'SELECT pruefungen.timestamp as pruefungszeit,pruefungen.*,"pruefungenListe".*,users.*,objekte.* FROM pruefungen Join "pruefungenListe" On "pruefungenListe"."pruefungsID" = pruefungen.id Join users On users.user_id = pruefungen."userID" Join objekte On pruefungen."objektID" = objekte.id WHERE '+key+' = '+value
    db.query(
        query,
        response
    );
}

async function getAllWithParams(request: any, response: any,params: { [x: string]: any; }){
    const paramsQuery = Object.keys(params).map(key=>`pruefungen."`+key.toString()+`" =`+(Number.isNaN(params[key])?` '${params[key]}'`:` ${params[key]}`)).join(" AND ");
    const query = 'SELECT pruefungen.timestamp as pruefungszeit,pruefungen.*,"pruefungenListe".*,users.*,objekte.* FROM pruefungen Join "pruefungenListe" On "pruefungenListe"."pruefungsID" = pruefungen.id Join users On users.user_id = pruefungen."userID" Join objekte On pruefungen."objektID" = objekte.id WHERE ' +paramsQuery
    db.query(
        query,
        response,
        getAllMapping
    );
}

async function createPruefung(request: any, response:any){
        const {accessToken,refreshToken} = request.cookies
        let pruefung = request.body
        let user = jwt.decode(refreshToken)
        let timestamp = new Date()
        let client = await db.pool.connect()
        try{
            await client.query('BEGIN')

            const query = `INSERT INTO public.pruefungen("objektID", "userID", "timestamp") VALUES(`+pruefung.objektid+','+user.id+`,'`
            +timestamp.getHours()+':'+timestamp.getMinutes()+':'+timestamp.getSeconds()+' '+timestamp.getDate()+'.'+timestamp.getMonth()+'.'+timestamp.getFullYear()
            +`') RETURNING id;`;

            let res = await client.query(query)


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
                status:200,
                data:"Pruefung erfolgreich hinzugefügt"
            })

        }catch(e){
            await client.query('ROLLBACK')
            throw e
        }finally{
            client.release()
        }

}

async function changePruefung(request: any,response: any,pruefungsid: any){
    let pruefung = request.body
    let client = await db.pool.connect()
    try{
        await client.query('BEGIN')

        const q = `UPDATE public.pruefungen SET `+mapObjectToParams(pruefung)+` WHERE id=${pruefungsid};`;
        let res = await client.query(q)

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
async function deletePruefung(request: any,response: any,pruefungsid: string){
    const q = "DELETE FROM public.pruefungen WHERE id="+pruefungsid+";"
    db.query(q,response)
}
function mapObjectToParams(params: { [x: string]: any; }){
    return Object.keys(params)
        .filter((value)=>{
            return (value === "id" || value === "rauchmelder")?false:true;
        })
        .map(key=>{
            return (typeof params[key] === "boolean" || typeof params[key] === "number")?`"${key}"=${params[key]}`:`"${key}"='${params[key]}'`
        }).join(",")
}

export default{
  getAllInklRauchmelder,
  getAllWithParams,
  getAllWithParam,
  createPruefung,
  changePruefung,
  deletePruefung
}