import { randomUUID } from "crypto";
import db from "./db"
import auth from './auth'

const clients : {[key:string]:any} = {}

async function addNachricht(request: any,response: any,chatid:string){
    // db.prisma.nachrichten.create({
    //     data:{
    //         nachricht:
    //     }
    // })
}
function onConnection(ws:any,req:any,payload:any){
    console.log(`Recieved a new connection.`);
    clients[payload.id] = ws;
    console.log(`${payload.id} connected.`);
    db.prisma.chats.findMany({
        include:{
            chatteilnehmer:{
                include:{
                    user:true
                }
            },
            nachrichten:{
                include:{
                    user:true
                }
            }
        },
        where:{
            chatteilnehmer:{
                some:{
                    user:{
                        user_id:payload.id
                    }
                }
            }
        }
    }).then(chats=>{
        ws.send(JSON.stringify({stage:1,data:payload.id,chats:chats}))
    }).catch(error=>console.log(error))
}
function onClose(ws:any,req:any,connection:WebSocket){
    

    // Store the new connection and handle messages
    
}
function onMessage(ws:any,payload:any,message:string){
    let deserializedMessage:{chat:string,message:string,from:string} = JSON.parse(message)
    
    db.prisma.nachrichten.create({
        data:{
            chat:{
                connectOrCreate:{
                    where:{
                        id:deserializedMessage.chat
                    },
                    create:{
                        chatteilnehmer:{
                            create:{
                                user:{
                                    connect:{
                                        user_id:payload.id
                                    }
                                }
                            }
                        }
                    }
                }
            },
            nachricht:deserializedMessage.message,
            user:{
                connect:{
                    user_id:payload.id
                }
            }
        }
    }).then(nachricht=>{
        db.prisma.chatteilnehmer.findMany({
            include:{
                user:true
            },
            where:{
                chat:{
                    id:nachricht.chatid
                }
            }
        }).then(teilnehmer=>{
            let sender = teilnehmer.find(einzel=>einzel.userid===payload.id)?.user
            console.log("nachricht gespeichert und wird geschickt")
            teilnehmer.forEach(einzelTeilnehmer=>{
                if(clients[einzelTeilnehmer.userid] && einzelTeilnehmer.userid !== payload.id){
                    clients[einzelTeilnehmer.userid].send(JSON.stringify({stage:2,data:{nachricht:deserializedMessage.message,chat:deserializedMessage.chat,user:{username:sender?.username,email:sender?.email}}}))
                    console.log("connection gefunden und nachricht raus")
                }
            })
        })
    })
    
}
function onSupport(ws:any,userUUID:string,message:string){
    
    setTimeout(()=>ws.send(JSON.stringify({stage:2,data:"Dies ist eine Automatische Antwort von unserem Chatbot! Ihr Anliegen wird direkt an den Support weitergegeben"})),1000)
    db.prisma.chats.findMany({
        where:{
            chatteilnehmer:{
                every:{
                    OR:[
                        {
                            userid:userUUID
                        },
                        {
                            userid:"bd6cfedf-6590-4ab7-b5a2-f41c813d2626"
                        }
                    ]
                }
            }
        }
    }).then(chats=>{
        let id = chats.length>0?chats[0].id:"00000000-0000-0000-0000-000000000000"
        db.prisma.nachrichten.create({
            data:{
                nachricht:message,
                user:{
                    connect:{
                        user_id:userUUID
                    }
                },
                chat:{
                    connectOrCreate:{
                        where:{
                            id:id
                        },
                        create:{
                            chatteilnehmer:{
                                create:[
                                    {
                                        userid:userUUID
                                    },
                                    {
                                        userid:"bd6cfedf-6590-4ab7-b5a2-f41c813d2626"
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }).then(nachricht=>{}).catch(error=>console.log("ERROR",error))
    })
}


export default{
    onConnection,
    onClose,
    onMessage,
    onSupport
}