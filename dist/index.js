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
const express = require("express");
var cors = require("cors");
var cookie = require("cookie-parser");
const port = 3200;
const objekte_1 = __importDefault(require("./services/objekte"));
const auftraggeber_1 = __importDefault(require("./services/auftraggeber"));
const auth_1 = __importDefault(require("./services/auth"));
const pruefungen_1 = __importDefault(require("./services/pruefungen"));
const rauchmelder_1 = __importDefault(require("./services/rauchmelder"));
const wohnungen_1 = __importDefault(require("./services/wohnungen"));
const statistics_1 = __importDefault(require("./services/statistics"));
const cookieParser = require("cookie-parser");
const app = express();
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
app.use(express.urlencoded({
    extended: true,
}));
app.use(cookieParser());
app.get("/", (req, res) => {
    res.json({ message: "ok" });
});
app.post("/login", (req, res) => {
    auth_1.default.login(req, res).catch((err) => {
        res.status(401).json({ error: "Login fehlgeschlagen", msg: err });
    });
});
app.post("/signup", (req, res) => {
    auth_1.default.signup(req, res).catch((err) => {
        res.status(401).json({ error: "Signup fehlgeschlagen", errormessage: err });
    });
});
app.post("/changepw", auth_1.default.authenticateToken, (req, res) => {
    auth_1.default.changepw(req, res).catch((err) => {
        res
            .status(401)
            .json({ error: "Password ändern fehlgeschlagen", status: 401 });
    });
});
app.get("/statistics/pruefungen", auth_1.default.authenticateToken, (req, res) => {
    statistics_1.default.getPruefungenStatistics(req, res).catch((err) => {
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
    auth_1.default.handleRefreshToken(req, res);
    // .catch(err=>{
    //     res.status(401).json({error:"Session erneuern fehlgeschlagen",errormessage:err})
    // })
});
app.get("/user", auth_1.default.authenticateToken, (req, res) => {
    auth_1.default.getOwnUser(req, res);
});
app.get("/objekte", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (Object.keys(req.query).length <= 0) {
            objekte_1.default.getAll(req, res);
        }
        else {
            objekte_1.default.getAllWithParams(req, res, req.query);
        }
    }
    catch (err) {
        console.error(`Error while getting Objekte `, err.message);
    }
}));
app.post("/objekte", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    objekte_1.default.createObjekt(req, res).catch((err) => {
        res.status(200).json({ error: "Hinzufügen des Objektes fehlgeschlagen" });
    });
}));
app.delete("/objekte/:id", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var objektid = req.params.id;
    objekte_1.default.deleteObjekt(req, res, objektid).catch((err) => {
        res.status(200).json({ error: "Löschen des Objektes fehlgeschlagen" });
    });
}));
app.put("/objekte/:id", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var objektid = req.params.id;
    objekte_1.default.changeObjekt(req, res, objektid).catch((err) => {
        res.status(200).json({ error: "Verändern des Objektes fehlgeschlagen" });
    });
}));
app.get("/auftraggeber", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (Object.keys(req.query).length <= 0) {
            auftraggeber_1.default.getAll(req, res);
        }
        else {
            auftraggeber_1.default.getAllWithParams(req, res, req.query);
        }
    }
    catch (err) {
        console.error(`Error while getting Auftraggeber `, err.message);
    }
}));
app.post("/auftraggeber", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    auftraggeber_1.default.createAuftraggeber(req, res);
}));
app.put("/auftraggeber/:id", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var auftraggeberid = req.params.id;
    auftraggeber_1.default.changeAuftraggeber(req, res, auftraggeberid);
}));
app.delete("/auftraggeber/:id", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var auftraggeberid = req.params.id;
    auftraggeber_1.default.deleteAuftraggeber(req, res, auftraggeberid);
}));
app.get("/pruefungen", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (Object.keys(req.query).length <= 0) {
            pruefungen_1.default.getAllInklRauchmelder(req, res);
        }
        else {
            pruefungen_1.default.getAllWithParams(req, res, req.query);
        }
    }
    catch (err) {
        console.error(`Error while getting Pruefungen `, err.message);
    }
}));
app.post("/pruefungen", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    pruefungen_1.default.createPruefung(req, res).catch((err) => {
        res.status(200).json({ error: "Hinzufügen der Prüfung fehlgeschlagen" });
        throw err;
    });
}));
app.put("/pruefungen/:id", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var pruefungsid = req.params.id;
    pruefungen_1.default.changePruefung(req, res, pruefungsid).catch((err) => {
        res.status(200).json({ error: "Verändern der Prüfung fehlgeschlagen" });
        throw err;
    });
}));
app.delete("/pruefungen/:id", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var pruefungsid = req.params.id;
    pruefungen_1.default.deletePruefung(req, res, pruefungsid).catch((err) => {
        res.status(200).json({ error: "Löschen der Prüfung fehlgeschlagen" });
        throw err;
    });
}));
app.get("/rauchmelder", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (Object.keys(req.query).length <= 0) {
            rauchmelder_1.default.getAll(req, res);
        }
        else {
            rauchmelder_1.default.getAllWithParams(req, res, req.query);
        }
    }
    catch (err) {
        console.error(`Error while getting Rauchmelder `, err.message);
    }
}));
app.post("/rauchmelder/switch/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("test");
    rauchmelder_1.default.switchAndCreateRauchmelder(req, res);
}));
app.get("/rauchmelder/variant/:variante", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var rauchmelderhistorienid = req.params.variante;
    rauchmelder_1.default.getWithHistoryId(req, res, rauchmelderhistorienid).catch((err) => {
        res
            .status(200)
            .json({ status: 406, error: "Verändern des Rauchmelders fehlgeschlagen" });
    });
}));
app.put("/rauchmelder/:id", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var rauchmelderid = req.params.id;
    rauchmelder_1.default.changeRauchmelder(req, res, rauchmelderid).catch((err) => {
        res
            .status(200)
            .json({ error: "Verändern des Rauchmelders fehlgeschlagen" });
    });
}));
app.delete("/rauchmelder/:id", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var rauchmelderid = req.params.id;
    rauchmelder_1.default.deleteRauchmelder(req, res, rauchmelderid).catch((err) => {
        res.status(200).json({ error: "Löschen des Rauchmelders fehlgeschlagen" });
    });
}));
app.post("/rauchmelder", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    rauchmelder_1.default.createRauchmelder(req, res).catch((err) => {
        res
            .status(200)
            .json({ error: "Hinzufügen des Rauchmelders fehlgeschlagen" });
    });
}));
app.get("/wohnungen", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (Object.keys(req.query).length <= 0) {
            wohnungen_1.default.getAll(req, res);
        }
        else {
            wohnungen_1.default.getAllWithParams(req, res, req.query);
        }
    }
    catch (err) {
        console.error(`Error while getting Wohnungen `, err.message);
    }
}));
app.post("/wohnungen", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    wohnungen_1.default.createWohnung(req, res).catch((err) => {
        res.status(200).json({ error: "Hinzufügen der Wohnung fehlgeschlagen" });
    });
}));
app.delete("/wohnungen/:id", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var wohnungsid = req.params.id;
    wohnungen_1.default.deleteWohnung(req, res, wohnungsid).catch((err) => {
        res.status(200).json({ error: "Löschen der Wohnung fehlgeschlagen" });
    });
}));
app.put("/wohnungen/:id", auth_1.default.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var wohnungsid = req.params.id;
    wohnungen_1.default.changeWohnung(req, res, wohnungsid).catch((err) => {
        res.status(200).json({ error: "Verändern der Wohnung fehlgeschlagen" });
    });
}));
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
