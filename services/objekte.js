const db = require('./db');
const helper = require('../helper');

async function getAll(){
  const rows = await db.query(
    `SELECT * FROM Objekte`
  );
  const data = helper.emptyOrRows(rows);
    // const data = []
  return {
    data
  }
}

module.exports = {
  getAll
}