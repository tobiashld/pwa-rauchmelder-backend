const express = require("express");
var cors = require("cors");

var cookie = require("cookie-parser");
import { Express,Request,Response } from "express";
const port = 3200;
import objekte from "./services/objekte";
import auftraggeber from "./services/auftraggeber";
import auth from './services/auth'
import pruefungen from "./services/pruefungen";
import rauchmelder from "./services/rauchmelder"
import wohnungen from "./services/wohnungen";
import statistics from "./services/statistics";
import { Rauchmelder, RauchmelderBeziehung } from "./types/rauchmelder";
const cookieParser = require("cookie-parser");
import expressWs from 'express-ws'
import { randomUUID } from "crypto";
import chat from "./services/chat";


const {app,getWss,applyTo} = expressWs(express(),undefined,{
  wsOptions:{
    verifyClient:(info,cb)=>{
      auth.authenticateTokenWs(info.req,cb)
    }
  }
})
// var expressWs = require('express-ws')(app);
app.use(express.json());


var whitelist = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://tobiashld.github.io" /** other domains if any */,
];
var corsOptions = {
  credentials: true,
  origin: function (origin:any, callback:any) {
    callback(null, true);
    // if (whitelist.indexOf(origin) !== -1) {
    //   callback(null, true)
    // } else {
    //   callback(new Error('Not allowed by CORS'))
    // }
  },
};
app.use(cors(corsOptions));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.get("/", (req: any, res: { json: (arg0: { message: string; }) => void; }) => {
  res.json({ message: "ok" });
});

app.ws('/chat/:chatid',function(ws,req){
  console.log("test")
  chat.onConnection(ws,req)
  ws.on('open',function(connection:WebSocket){
    chat.onConnection(ws,req,connection)
  })
  ws.on('message',function(connection:WebSocket){

  })
  ws.on('close',function(connection:WebSocket){
    chat.onClose(ws,req,connection)
  })
})
app.post("/login", (req,res) => {
  auth.login(req, res).catch((err: any) => {
    res.status(401).json({ error: "Login fehlgeschlagen",msg:err });
  });
});
app.post("/signup", (req, res) => {
  auth.signup(req, res).catch((err: any) => {
    res.status(401).json({ error: "Signup fehlgeschlagen", errormessage: err });
  });
});
app.post("/changepw", auth.authenticateToken, (req, res) => {
  auth.changepw(req, res).catch((err: any) => {
    res
      .status(401)
      .json({ error: "Password ändern fehlgeschlagen", status: 401 });
  });
});
app.get("/statistics/pruefungen", auth.authenticateToken, (req,res) => {
  statistics.getPruefungenStatistics(req, res).catch((err: any) => {
    res
      .status(401)
      .json({
        error: "Statistische Daten auswerten fehlgeschlagen",
        errormessage: err,
      });
    // res.status(401).json(err.message)
  });
});
app.post("/refreshtoken", (req: any, res: any) => {
  auth.handleRefreshToken(req, res);
  // .catch(err=>{
  //     res.status(401).json({error:"Session erneuern fehlgeschlagen",errormessage:err})
  // })
});
app.get("/user", auth.authenticateToken, (req: any, res: any) => {
  auth.getOwnUser(req, res);
});

app.get("/objekte", auth.authenticateToken, async (req: { query: {}; }, res: any) => {
  try {
    if (Object.keys(req.query).length <= 0) {
      objekte.getAll(req, res);
    } else {
      objekte.getAllWithParams(req, res, req.query);
    }
  } catch (err:any) {
    console.error(`Error while getting Objekte `, err.message);
  }
});
app.post("/objekte", auth.authenticateToken, async (req, res) => {
  objekte.createObjekt(req, res).catch((err: any) => {
    res.status(200).json({ error: "Hinzufügen des Objektes fehlgeschlagen" });
  });
});
app.delete("/objekte/:id", auth.authenticateToken, async (req, res) => {
  var objektid = req.params.id;
  objekte.deleteObjekt(req, res, objektid).catch((err: any) => {
    res.status(200).json({ error: "Löschen des Objektes fehlgeschlagen" });
  });
});
app.put("/objekte/:id", auth.authenticateToken, async (req, res) => {
  var objektid = req.params.id;
  objekte.changeObjekt(req, res, objektid).catch((err: any) => {
    res.status(200).json({ error: "Verändern des Objektes fehlgeschlagen" });
  });
});
app.get("/auftraggeber", auth.authenticateToken, async (req:any, res: any) => {
  try {
    if (Object.keys(req.query).length <= 0) {
      auftraggeber.getAll(req, res);
    } else {
      auftraggeber.getAllWithParams(req, res, req.query);
    }
  } catch (err:any) {
    console.error(`Error while getting Auftraggeber `, err.message);
  }
});
app.post("/auftraggeber", auth.authenticateToken, async (req, res) => {
  auftraggeber.createAuftraggeber(req, res)
});
app.put("/auftraggeber/:id", auth.authenticateToken, async (req, res) => {
  var auftraggeberid = req.params.id;
  auftraggeber.changeAuftraggeber(req, res, auftraggeberid)
});
app.delete("/auftraggeber/:id", auth.authenticateToken, async (req, res) => {
  var auftraggeberid = req.params.id;
  auftraggeber.deleteAuftraggeber(req, res, auftraggeberid)
});
app.get("/pruefungen", auth.authenticateToken, async (req: { query: {}; }, res: any) => {
  try {
    if (Object.keys(req.query).length <= 0) {
      pruefungen.getAllInklRauchmelder(req, res);
    } else {
      pruefungen.getAllWithParams(req, res, req.query);
    }
  } catch (err:any) {
    console.error(`Error while getting Pruefungen `, err.message);
  }
});
app.post("/pruefungen", auth.authenticateToken, async (req, res) => {
  pruefungen.createPruefung(req, res).catch((err: any) => {
    res.status(200).json({ error: "Hinzufügen der Prüfung fehlgeschlagen" });
    throw err;
  });
});
app.put("/pruefungen/:id", auth.authenticateToken, async (req, res) => {
  var pruefungsid = req.params.id;
  pruefungen.changePruefung(req, res, pruefungsid).catch((err: any) => {
    res.status(200).json({ error: "Verändern der Prüfung fehlgeschlagen" });
    throw err;
  });
});
app.delete("/pruefungen/:id", auth.authenticateToken, async (req, res) => {
  var pruefungsid = req.params.id;
  pruefungen.deletePruefung(req, res, pruefungsid).catch((err: any) => {
    res.status(200).json({ error: "Löschen der Prüfung fehlgeschlagen" });
    throw err;
  });
});

app.get("/rauchmelder", auth.authenticateToken, async (req: { query: {}; }, res: any) => {
  try {
    if (Object.keys(req.query).length <= 0) {
      rauchmelder.getAll(req, res);
    } else {
      rauchmelder.getAllWithParams(req, res, req.query);
    }
  } catch (err:any) {
    console.error(`Error while getting Rauchmelder `, err.message);
  }
});
app.post("/rauchmelder/switch/create",async (req:{body:{newRauchmelder:Rauchmelder,altRauchmelderBz:RauchmelderBeziehung}},res)=>{
  rauchmelder.switchAndCreateRauchmelder(req,res)
})
app.get("/rauchmelder/objekt/:id",async (req,res)=>{
  console.log(req.params)
  rauchmelder.getAllWithObjectId(req,res,Number.parseInt(req.params.id)).catch((err) => {
    res
      .status(200)
      .json({ status:406,error: "Verändern des Rauchmelders fehlgeschlagen" });
  });
})

app.get("/rauchmelder/variant/:variante", auth.authenticateToken, async (req , res) => {
  var rauchmelderhistorienid = req.params.variante;
  rauchmelder.getWithHistoryId(req,res,rauchmelderhistorienid).catch((err) => {
    res
      .status(200)
      .json({ status:406,error: "Verändern des Rauchmelders fehlgeschlagen" });
  });
   
});

app.get("/rauchmelder/history/:variante",auth.authenticateToken,(req,res)=>{
  var rauchmelderhistorienid = req.params.variante;
  rauchmelder.getHistory(req,res,Number.parseInt(rauchmelderhistorienid)).catch((err) => {
    res
      .status(200)
      .json({ status:406,error: "Verändern des Rauchmelders fehlgeschlagen" });
  });
})

app.put("/rauchmelder/:id", auth.authenticateToken, async (req, res) => {
  var rauchmelderid = req.params.id;
  rauchmelder.changeRauchmelder(req, res, rauchmelderid).catch((err) => {
    res
      .status(200)
      .json({ error: "Verändern des Rauchmelders fehlgeschlagen" });
  });
});
app.delete("/rauchmelder/:id", auth.authenticateToken, async (req: { params: { id: any; }; }, res) => {
  var rauchmelderid = req.params.id;
  rauchmelder.deleteRauchmelder(req, res, rauchmelderid).catch((err) => {
    res.status(200).json({ error: "Löschen des Rauchmelders fehlgeschlagen" });
  });
});
app.post("/rauchmelder", auth.authenticateToken, async (req: any, res) => {
  rauchmelder.createRauchmelder(req, res).catch((err) => {
    res
      .status(200)
      .json({ error: "Hinzufügen des Rauchmelders fehlgeschlagen" });
  });
});
app.get("/wohnungen", auth.authenticateToken, async (req: { query: {}; }, res: any) => {
  try {
    if (Object.keys(req.query).length <= 0) {
      wohnungen.getAll(req, res);
    } else {
      wohnungen.getAllWithParams(req, res, req.query);
    }
  } catch (err:any) {
    console.error(`Error while getting Wohnungen `, err.message);
  }
});
app.post("/wohnungen", auth.authenticateToken, async (req: any, res) => {
  wohnungen.createWohnung(req, res).catch((err: any) => {
    res.status(200).json({ error: "Hinzufügen der Wohnung fehlgeschlagen" });
  });
});
app.delete("/wohnungen/:id", auth.authenticateToken, async (req: { params: { id: any; }; }, res) => {
  var wohnungsid = req.params.id;
  wohnungen.deleteWohnung(req, res, wohnungsid).catch((err: any) => {
    res.status(200).json({ error: "Löschen der Wohnung fehlgeschlagen" });
  });
});
app.put("/wohnungen/:id", auth.authenticateToken, async (req: { params: { id: any; }; }, res) => {
  var wohnungsid = req.params.id;
  wohnungen.changeWohnung(req, res, wohnungsid).catch((err: any) => {
    res.status(200).json({ error: "Verändern der Wohnung fehlgeschlagen" });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
