const db = require('./db');

async function getPruefungenStatistics(req,res){
    const q = 'select SUM("selberRaum"::INTEGER) AS "selberRaum", SUM("baulichUnveraendert"::INTEGER) AS "baulichUnveraendert",SUM("hindernisseUmgebung"::INTEGER) AS "hindernisseUmgebung", SUM("relevanteBeschaedigung"::INTEGER) AS "relevanteBeschaedigung", SUM("oeffnungenFrei"::INTEGER) AS "oeffnungenFrei",SUM("warnmelderGereinigt"::INTEGER) AS "warnmelderGereinigt",SUM("pruefungErfolgreich"::INTEGER) AS "pruefungErfolgreich", SUM("batterieGut"::INTEGER) AS "batterieGut" FROM "pruefungenListe"'
    db.query(q,res)
}



module.exports = {
    getPruefungenStatistics,
  }