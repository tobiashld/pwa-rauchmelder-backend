import { Rauchmelder, RauchmelderBeziehung } from '../types/rauchmelder';
import db from './db';

const helper = require('../helper');

async function getAll(request:any,response:any,){
  db.prisma.rauchmelder.findMany({
    include:{
      aktuellerRauchmelder:true,
      wohnungen:true
    },
    orderBy:{
      id:"asc"
    }
  }).then(data=>{
    response.status(200).json({
      status:200,
      data: data,
    });
  })
  
  

  // db.query(
  //   `SELECT * from rauchmelderhistorie`,
  //   response,
  //   rauchmelderMapping
  // );
  
}

function getActiveWithHistoryId(request:any,response:any,historyId:number){
  db.prisma.rauchmelder.findMany({
    where:{
      aktuelleHistorienID:historyId
    },
    include:{
      aktuellerRauchmelder:true
    },
    orderBy:{
      aktuelleHistorienID:"asc"
    }
  }).then(data=>{
    response.status(200).json({
      status:200,
      data: data,
    });
  })
}
async function getAllWithObjectId(request:any,response:any,objektId:number){
  db.prisma.rauchmelder.findMany({
    where:{
      wohnungen:{
        objektID:{
          equals:objektId
        }
      }
    },
    include:{
      aktuellerRauchmelder:true
    },
    orderBy:{
      aktuelleHistorienID:"asc"
    }
  }).then(data=>{
    response.status(200).json({
      status:200,
      data: data,
    });
  })
}


async function getAllWithParams(request:any, response:any,params:any){
  const paramsQuery = Object.keys(params).map(key=>`rauchmelder."`+key.toString()+`" =`+(isNaN(params[key])?` '${params[key]}'`:` ${params[key]}`)).join(" AND ");
  const query = `SELECT rauchmelder.id,rauchmelder."wohnungsID",rauchmelder.raum, rauchmelder.seriennr, rauchmelder.produktionsdatum, rauchmelder."letztePruefungsID", public.wohnungen.nachname as mieter,public.objekte.id as objektid,public.objekte.objekt as objektname
  FROM public.rauchmelder
  join public.wohnungen on public.wohnungen.id = public.rauchmelder."wohnungsID" 
  join public.objekte on public.objekte.id = public.rauchmelder."objektID" WHERE ` +paramsQuery
  db.query(
      query,
      response
  );
}

async function createRauchmelder(request:any, response:any){
  db.prisma.rauchmelder.create({
    include:{
      aktuellerRauchmelder:true
    },
    data:{
      ...request.body
    }
  }).then(data=>{
    response.status(200).json({
      status:200,
      data: data,
    });
  })
      // let rauchmelder = request.body
      
      // const query = `INSERT INTO public.rauchmelder("objektID", raum, seriennr, produktionsdatum, "letztePruefungsID", "wohnungsID") VALUES(${rauchmelder.objektID}, '${rauchmelder.raum}','${rauchmelder.seriennr}','${rauchmelder.produktionsdatum}',0,'${rauchmelder.wohnungsID}');`;
      // db.query(
      //   query,
      //   response
      // )

}

async function changeRauchmelder(request:any,response:any,rauchmelderid:any){
  db.prisma.rauchmelderhistorie.update({
    data:{
      ...request.body
    },
    where:{
      id:rauchmelderid
    }
  }).then(data=>{
    response.status(200).json({
      status:200,
      data: data,
    });
  })
  // let rauchmelder = request.body
  // const q = `UPDATE public.rauchmelder SET `+mapObjectToParams(rauchmelder)+` WHERE id=${rauchmelderid};`;
  // db.query(
  //   q,
  //   response
  //   )


}

async function getWithHistoryId(request:any,response:any,rauchmelderhistorienid:any){
  db.prisma.rauchmelderhistorie.findMany({
    where:{
      id:{
        equals:rauchmelderhistorienid
      }
    }
  }).then(data=>{
    response.status(200).json({
      status:200,
      data: data,
    });
  })
}

async function getHistory(request:any,response:any,rauchmelderhistorienid:number){
  db.prisma.rauchmelderhistorie.findMany({
    select:{
      rauchmelder:{
        select:{
          rauchmelderHistorie:true,
          wohnungen:{
            select:{
              nachname:true,
              vorname:true,
              etage:true,
              wohnungslage:true,
              haus:true,
              objektID:true,
            }
          }
        }
      }
    },
    where:{
      id:rauchmelderhistorienid
    },
    
    
  }).then(data=>{
    response.status(200).json({
      status:200,
      data:data
    })
  })
}

async function switchAndCreateRauchmelder(request:any,response:any){




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
  let newRauchmelder : Rauchmelder = request.body.newRauchmelder
  let altRauchmelderBz : RauchmelderBeziehung= request.body.altRauchmelderBz
  console.log("new",newRauchmelder)
  console.log("old",altRauchmelderBz)

  db.prisma.rauchmelderhistorie.create({
    data:{
      produktionsdatum:newRauchmelder.produktionsdatum,
      raum:altRauchmelderBz.aktuellerRauchmelder.raum,
      seriennr:newRauchmelder.seriennr,
      isactive:true,
      installedAt:new Date(),
      outOfOrderAt:null,
      rauchmelder:{
        connect:{
          id:altRauchmelderBz.id
        }
      },

    },
    include:{
      rauchmelder:true
    }
  }).then(value=>{
    console.log(altRauchmelderBz.aktuellerRauchmelder.id)
    db.prisma.rauchmelderhistorie.update({
      
      data:{
        isactive:false,
        outOfOrderAt:new Date()
      },
      where:{
        id:altRauchmelderBz.aktuellerRauchmelder.id
      },
    }).then(test=>{
      db.prisma.rauchmelder.update({
        data:{
          aktuelleHistorienID:value.id
        },
        where:{
          id:altRauchmelderBz.id
        }
      }).then(test=>{
        response.status(200).json({
          status:200,
          data: value,
        });
      })
      
    })
    
  }).catch(e=>{
    throw e
  })

  
}


async function deleteRauchmelder(request:any,response:any,rauchmelderid:number){
  const q = "DELETE FROM public.rauchmelder WHERE id="+rauchmelderid+";"
  db.query(q,response)
}
function mapObjectToParams(params:any){
  return Object.keys(params)
      .filter((value)=>{
          return (value === "id")?false:true;
      })
      .map(key=>{
          return (typeof params[key] === "boolean" || typeof params[key] === "number")?`"${key}"=${params[key]}`:`"${key}"='${params[key]}'`
      }).join(",")
}


const rauchmelderMapping = (rows:any,response:any)=>{
  let data = helper.emptyOrRows(rows);
  if(data.length > 0){
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
      status:200,
      data: data,
    });
  }else{
    response.status(200).json({
      status:406,
      error:"keine Daten",
    });
  }
}
export default {
  getAllWithObjectId,
  getAll,
  getHistory,
  getAllWithParams,
  getActiveWithHistoryId,
  switchAndCreateRauchmelder,
  changeRauchmelder,
  deleteRauchmelder,
  createRauchmelder,
  getWithHistoryId
}