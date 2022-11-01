const express = require("express");
var cors = require('cors')
const app = express();
const port = 3000;
const objekte = require('./services/objekte');
const auftraggeber = require('./services/auftraggeber')
const auth = require('./services/auth')
const pruefungen = require('./services/pruefungen')
const rauchmelder = require('./services/rauchmelder')
const wohnungen = require('./services/wohnungen');
const { default: functions } = require("./services/auth");
app.use(express.json());
app.use(cors())
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.get("/", (req, res) => {
  res.json({ message: "ok" });
});
app.post("/login",(req,res)=>{
    auth.login(req,res).catch(err=>{
        res.status(401).json({error:"Login fehlgeschlagen"})
    })
})


app.get("/objekte",async (req,res)=>{
    try {
        if(Object.keys(req.query).length <= 0){
            objekte.getAll(req,res,);
        }else{
            objekte.getAllWithParams(req,res,req.query)
        }
    } catch (err) {
        console.error(`Error while getting Objekte `, err.message);
    }
})
app.post("/objekte",async (req,res)=>{
    objekte.createObjekt(req,res).catch(err=>{
        res.status(200).json({error:"Hinzufügen des Objektes fehlgeschlagen"})
    })
})
app.delete("/objekte/:id",async (req,res)=>{
    var objektid = req.params.id
    objekte.deleteObjekt(req,res,objektid).catch(err=>{
        res.status(200).json({error:"Löschen des Objektes fehlgeschlagen"})
    })
})
app.put("/objekte/:id",async (req,res)=>{
    var objektid = req.params.id
    objekte.changeObjekt(req,res,objektid).catch(err=>{
        res.status(200).json({error:"Verändern des Objektes fehlgeschlagen"})
    })
})
app.get("/auftraggeber",async (req,res)=>{
    try {
        if(Object.keys(req.query).length <= 0){
            auftraggeber.getAll(req,res);
        }else{
            auftraggeber.getAllWithParams(req,res,req.query)
        }
    } catch (err) {
        console.error(`Error while getting Auftraggeber `, err.message);
    }
})
app.post("/auftraggeber",async (req,res)=>{
    auftraggeber.createAuftraggeber(req,res).catch(err=>{
        res.status(200).json({error:"Hinzufügen des Auftraggebers fehlgeschlagen"})
    })
})
app.put("/auftraggeber/:id",async (req,res)=>{
    var auftraggeberid = req.params.id
    auftraggeber.changeAuftraggeber(req,res,auftraggeberid).catch(err=>{
        res.status(200).json({error:"Verändern des Auftraggebers fehlgeschlagen"})
    })
})
app.delete("/auftraggeber/:id",async (req,res)=>{
    var auftraggeberid = req.params.id
    auftraggeber.deleteAuftraggeber(req,res,auftraggeberid).catch(err=>{
        res.status(200).json({error:"Löschen des Auftraggebers fehlgeschlagen"})
    })
})
app.get("/pruefungen",async (req,res)=>{
    try {
        if(Object.keys(req.query).length <= 0){
           pruefungen.getAllInklRauchmelder(req,res,);
        }else{
           pruefungen.getAllWithParams(req,res,req.query)
        }
    } catch (err) {
        console.error(`Error while getting Pruefungen `, err.message);
    }
})
app.post("/pruefungen",async (req,res)=>{
    
        pruefungen.createPruefung(req,res).catch(err=>{
            res.status(200).json({error:"Hinzufügen der Prüfung fehlgeschlagen"})
            throw err
    })
})
app.put("/pruefungen/:id",async (req,res)=>{
    var pruefungsid = req.params.id
    pruefungen.changePruefung(req,res,pruefungsid).catch(err=>{
        res.status(200).json({error:"Verändern der Prüfung fehlgeschlagen"})
        throw err
    })
})
app.delete("/pruefungen/:id",async (req,res)=>{
    var pruefungsid = req.params.id
    pruefungen.deletePruefung(req,res,pruefungsid).catch(err=>{
        res.status(200).json({error:"Löschen der Prüfung fehlgeschlagen"})
        throw err
    })
})

app.get("/rauchmelder",async (req,res)=>{
    try {
        if(Object.keys(req.query).length <= 0){
           rauchmelder.getAll(req,res,);
        }else{
           rauchmelder.getAllWithParams(req,res,req.query)
        }
    } catch (err) {
        console.error(`Error while getting Rauchmelder `, err.message);
    }
})
app.put("/rauchmelder/:id",async (req,res)=>{
    var rauchmelderid = req.params.id
    rauchmelder.changeRauchmelder(req,res,rauchmelderid).catch(err=>{
        res.status(200).json({error:"Verändern des Rauchmelders fehlgeschlagen"})
    })
})
app.delete("/rauchmelder/:id",async (req,res)=>{
    var rauchmelderid = req.params.id
    rauchmelder.deleteRauchmelder(req,res,rauchmelderid).catch(err=>{
        res.status(200).json({error:"Löschen des Rauchmelders fehlgeschlagen"})
    })
})
app.post("/rauchmelder",async (req,res)=>{
    rauchmelder.createRauchmelder(req,res).catch(err=>{
        res.status(200).json({error:"Hinzufügen des Rauchmelders fehlgeschlagen"})
    })
})
app.get("/wohnungen",async (req,res)=>{
    try {
        if(Object.keys(req.query).length <= 0){
           wohnungen.getAll(req,res,);
        }else{
           wohnungen.getAllWithParams(req,res,req.query)
        }
    } catch (err) {
        console.error(`Error while getting Wohnungen `, err.message);
    }
})
app.post("/wohnungen",async (req,res)=>{
    wohnungen.createWohnung(req,res).catch(err=>{
        res.status(200).json({error:"Hinzufügen der Wohnung fehlgeschlagen"})
    })
})
app.delete("/wohnungen/:id",async (req,res)=>{
    var wohnungsid = req.params.id
    wohnungen.deleteWohnung(req,res,wohnungsid).catch(err=>{
        res.status(200).json({error:"Löschen der Wohnung fehlgeschlagen"})
    })
})
app.put("/wohnungen/:id",async (req,res)=>{
    var wohnungsid = req.params.id
    wohnungen.changeWohnung(req,res,wohnungsid).catch(err=>{
        res.status(200).json({error:"Verändern der Wohnung fehlgeschlagen"})
    })
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});