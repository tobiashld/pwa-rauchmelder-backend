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
const clients = {};
function addNachricht(request, response, chatid) {
    return __awaiter(this, void 0, void 0, function* () {
        // db.prisma.nachrichten.create({
        //     data:{
        //         nachricht:
        //     }
        // })
    });
}
function onConnection(ws, req, payload) {
    console.log(`Recieved a new connection.`);
    clients[payload.id] = ws;
    console.log(`${payload.id} connected.`);
    db_1.default.prisma.chats.findMany({
        include: {
            chatteilnehmer: {
                include: {
                    user: true
                }
            },
            nachrichten: {
                include: {
                    user: true
                }
            }
        },
        where: {
            chatteilnehmer: {
                some: {
                    user: {
                        user_id: payload.id
                    }
                }
            }
        }
    }).then(chats => {
        ws.send(JSON.stringify({ stage: 1, data: payload.id, chats: chats }));
    }).catch(error => console.log(error));
}
function onClose(ws, req, connection) {
    // Store the new connection and handle messages
}
function onMessage(ws, payload, message) {
    let deserializedMessage = JSON.parse(message);
    db_1.default.prisma.nachrichten.create({
        data: {
            chat: {
                connectOrCreate: {
                    where: {
                        id: deserializedMessage.chat
                    },
                    create: {
                        chatteilnehmer: {
                            create: {
                                user: {
                                    connect: {
                                        user_id: payload.id
                                    }
                                }
                            }
                        }
                    }
                }
            },
            nachricht: deserializedMessage.message,
            user: {
                connect: {
                    user_id: payload.id
                }
            }
        }
    }).then(nachricht => {
        db_1.default.prisma.chatteilnehmer.findMany({
            include: {
                user: true
            },
            where: {
                chat: {
                    id: nachricht.chatid
                }
            }
        }).then(teilnehmer => {
            var _a;
            let sender = (_a = teilnehmer.find(einzel => einzel.userid === payload.id)) === null || _a === void 0 ? void 0 : _a.user;
            console.log("nachricht gespeichert und wird geschickt");
            teilnehmer.forEach(einzelTeilnehmer => {
                if (clients[einzelTeilnehmer.userid] && einzelTeilnehmer.userid !== payload.id) {
                    clients[einzelTeilnehmer.userid].send(JSON.stringify({ stage: 2, data: { nachricht: deserializedMessage.message, chat: deserializedMessage.chat, user: { username: sender === null || sender === void 0 ? void 0 : sender.username, email: sender === null || sender === void 0 ? void 0 : sender.email } } }));
                    console.log("connection gefunden und nachricht raus");
                }
            });
        });
    });
}
function onSupport(ws, userUUID, message) {
    setTimeout(() => ws.send(JSON.stringify({ stage: 2, data: "Dies ist eine Automatische Antwort von unserem Chatbot! Ihr Anliegen wird direkt an den Support weitergegeben" })), 1000);
    db_1.default.prisma.chats.findMany({
        where: {
            chatteilnehmer: {
                every: {
                    OR: [
                        {
                            userid: userUUID
                        },
                        {
                            userid: "bd6cfedf-6590-4ab7-b5a2-f41c813d2626"
                        }
                    ]
                }
            }
        }
    }).then(chats => {
        let id = chats.length > 0 ? chats[0].id : "00000000-0000-0000-0000-000000000000";
        db_1.default.prisma.nachrichten.create({
            data: {
                nachricht: message,
                user: {
                    connect: {
                        user_id: userUUID
                    }
                },
                chat: {
                    connectOrCreate: {
                        where: {
                            id: id
                        },
                        create: {
                            chatteilnehmer: {
                                create: [
                                    {
                                        userid: userUUID
                                    },
                                    {
                                        userid: "bd6cfedf-6590-4ab7-b5a2-f41c813d2626"
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        }).then(nachricht => { }).catch(error => console.log("ERROR", error));
    });
}
exports.default = {
    onConnection,
    onClose,
    onMessage,
    onSupport
};
