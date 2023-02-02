const express = require("express");
var cors = require("cors");
var cookie = require("cookie-parser");
const app = express();
const port = 3200;
const objekte = require("./services/objekte");
const auftraggeber = require("./services/auftraggeber");
const auth = require("./services/auth");
const pruefungen = require("./services/pruefungen");
const rauchmelder = require("./services/rauchmelder");
const wohnungen = require("./services/wohnungen");
const statistics = require("./services/statistics");
const { default: functions } = require("./services/auth");
const cookieParser = require("cookie-parser");

app.use(express.json());

var whitelist = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://tobiashld.github.io" /** other domains if any */,
];
var corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
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
app.get("/", (req, res) => {
  res.json({ message: "ok" });
});
app.post("/login", (req, res) => {
  auth.login(req, res).catch((err) => {
    res.status(401).json({ error: "Login fehlgeschlagen" });
  });
});
app.post("/signup", (req, res) => {
  auth.signup(req, res).catch((err) => {
    res.status(401).json({ error: "Signup fehlgeschlagen", errormessage: err });
  });
});
app.post("/changepw", auth.authenticateToken, (req, res) => {
  auth.changepw(req, res).catch((err) => {
    res
      .status(401)
      .json({ error: "Password ändern fehlgeschlagen", errormessage: err });
  });
});
app.get("/statistics/pruefungen", auth.authenticateToken, (req, res) => {
  statistics.getPruefungenStatistics(req, res).catch((err) => {
    res
      .status(401)
      .json({
        error: "Statistische Daten auswerten fehlgeschlagen",
        errormessage: err,
      });
    // res.status(401).json(err.message)
  });
});
app.post("/refreshtoken", (req, res) => {
  auth.handleRefreshToken(req, res);
  // .catch(err=>{
  //     res.status(401).json({error:"Session erneuern fehlgeschlagen",errormessage:err})
  // })
});
app.get("/user", auth.authenticateToken, (req, res) => {
  auth.getOwnUser(req, res);
});

app.get("/objekte", auth.authenticateToken, async (req, res) => {
  try {
    if (Object.keys(req.query).length <= 0) {
      objekte.getAll(req, res);
    } else {
      objekte.getAllWithParams(req, res, req.query);
    }
  } catch (err) {
    console.error(`Error while getting Objekte `, err.message);
  }
});
app.post("/objekte", auth.authenticateToken, async (req, res) => {
  objekte.createObjekt(req, res).catch((err) => {
    res.status(200).json({ error: "Hinzufügen des Objektes fehlgeschlagen" });
  });
});
app.delete("/objekte/:id", auth.authenticateToken, async (req, res) => {
  var objektid = req.params.id;
  objekte.deleteObjekt(req, res, objektid).catch((err) => {
    res.status(200).json({ error: "Löschen des Objektes fehlgeschlagen" });
  });
});
app.put("/objekte/:id", auth.authenticateToken, async (req, res) => {
  var objektid = req.params.id;
  objekte.changeObjekt(req, res, objektid).catch((err) => {
    res.status(200).json({ error: "Verändern des Objektes fehlgeschlagen" });
  });
});
app.get("/auftraggeber", auth.authenticateToken, async (req, res) => {
  try {
    if (Object.keys(req.query).length <= 0) {
      auftraggeber.getAll(req, res);
    } else {
      auftraggeber.getAllWithParams(req, res, req.query);
    }
  } catch (err) {
    console.error(`Error while getting Auftraggeber `, err.message);
  }
});
app.post("/auftraggeber", auth.authenticateToken, async (req, res) => {
  auftraggeber.createAuftraggeber(req, res).catch((err) => {
    res
      .status(200)
      .json({ error: "Hinzufügen des Auftraggebers fehlgeschlagen" });
  });
});
app.put("/auftraggeber/:id", auth.authenticateToken, async (req, res) => {
  var auftraggeberid = req.params.id;
  auftraggeber.changeAuftraggeber(req, res, auftraggeberid).catch((err) => {
    res
      .status(200)
      .json({ error: "Verändern des Auftraggebers fehlgeschlagen" });
  });
});
app.delete("/auftraggeber/:id", auth.authenticateToken, async (req, res) => {
  var auftraggeberid = req.params.id;
  auftraggeber.deleteAuftraggeber(req, res, auftraggeberid).catch((err) => {
    res.status(200).json({ error: "Löschen des Auftraggebers fehlgeschlagen" });
  });
});
app.get("/pruefungen", auth.authenticateToken, async (req, res) => {
  try {
    if (Object.keys(req.query).length <= 0) {
      pruefungen.getAllInklRauchmelder(req, res);
    } else {
      pruefungen.getAllWithParams(req, res, req.query);
    }
  } catch (err) {
    console.error(`Error while getting Pruefungen `, err.message);
  }
});
app.post("/pruefungen", auth.authenticateToken, async (req, res) => {
  pruefungen.createPruefung(req, res).catch((err) => {
    res.status(200).json({ error: "Hinzufügen der Prüfung fehlgeschlagen" });
    throw err;
  });
});
app.put("/pruefungen/:id", auth.authenticateToken, async (req, res) => {
  var pruefungsid = req.params.id;
  pruefungen.changePruefung(req, res, pruefungsid).catch((err) => {
    res.status(200).json({ error: "Verändern der Prüfung fehlgeschlagen" });
    throw err;
  });
});
app.delete("/pruefungen/:id", auth.authenticateToken, async (req, res) => {
  var pruefungsid = req.params.id;
  pruefungen.deletePruefung(req, res, pruefungsid).catch((err) => {
    res.status(200).json({ error: "Löschen der Prüfung fehlgeschlagen" });
    throw err;
  });
});

app.get("/rauchmelder", auth.authenticateToken, async (req, res) => {
  try {
    if (Object.keys(req.query).length <= 0) {
      rauchmelder.getAll(req, res);
    } else {
      rauchmelder.getAllWithParams(req, res, req.query);
    }
  } catch (err) {
    console.error(`Error while getting Rauchmelder `, err.message);
  }
});
app.put("/rauchmelder/:id", auth.authenticateToken, async (req, res) => {
  var rauchmelderid = req.params.id;
  rauchmelder.changeRauchmelder(req, res, rauchmelderid).catch((err) => {
    res
      .status(200)
      .json({ error: "Verändern des Rauchmelders fehlgeschlagen" });
  });
});
app.delete("/rauchmelder/:id", auth.authenticateToken, async (req, res) => {
  var rauchmelderid = req.params.id;
  rauchmelder.deleteRauchmelder(req, res, rauchmelderid).catch((err) => {
    res.status(200).json({ error: "Löschen des Rauchmelders fehlgeschlagen" });
  });
});
app.post("/rauchmelder", auth.authenticateToken, async (req, res) => {
  rauchmelder.createRauchmelder(req, res).catch((err) => {
    res
      .status(200)
      .json({ error: "Hinzufügen des Rauchmelders fehlgeschlagen" });
  });
});
app.get("/wohnungen", auth.authenticateToken, async (req, res) => {
  try {
    if (Object.keys(req.query).length <= 0) {
      wohnungen.getAll(req, res);
    } else {
      wohnungen.getAllWithParams(req, res, req.query);
    }
  } catch (err) {
    console.error(`Error while getting Wohnungen `, err.message);
  }
});
app.post("/wohnungen", auth.authenticateToken, async (req, res) => {
  wohnungen.createWohnung(req, res).catch((err) => {
    res.status(200).json({ error: "Hinzufügen der Wohnung fehlgeschlagen" });
  });
});
app.delete("/wohnungen/:id", auth.authenticateToken, async (req, res) => {
  var wohnungsid = req.params.id;
  wohnungen.deleteWohnung(req, res, wohnungsid).catch((err) => {
    res.status(200).json({ error: "Löschen der Wohnung fehlgeschlagen" });
  });
});
app.put("/wohnungen/:id", auth.authenticateToken, async (req, res) => {
  var wohnungsid = req.params.id;
  wohnungen.changeWohnung(req, res, wohnungsid).catch((err) => {
    res.status(200).json({ error: "Verändern der Wohnung fehlgeschlagen" });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
