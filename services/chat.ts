import { randomUUID } from "crypto";
import db from "./db"

const clients : {[key:string]:any} = {}

async function addNachricht(request: any,response: any,chatid:string){
    // db.prisma.nachrichten.create({
    //     data:{
    //         nachricht:
    //     }
    // })
}
function onConnection(ws:any,req:any,connection: WebSocket){
    const userId = randomUUID();
    console.log(`Recieved a new connection.`);

    // Store the new connection and handle messages
    clients[userId] = connection;
    console.log(`${userId} connected.`);
}
function onClose(ws:any,req:any,connection:WebSocket){
    

    // Store the new connection and handle messages
    
}


export default{
    onConnection,
    onClose
}