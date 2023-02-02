const Pool = require("pg").Pool;
const PrismaClient = require("@prisma/client").PrismaClient

const prisma = new PrismaClient()

const pool = new Pool({
  user: "postgres",
  host: "199.247.20.90",
  database: "rauchmelderverwaltung",
  password: "HibTHuib13JaWxoza4P",
  port: 5432,
});

async function query(sql, response, cb) {
  if (cb) {
    pool.query(sql, (error, results) => {
      if (error) {
        throw error;
      }
      cb(results.rows, response);
    });
  } else {
    pool.query(sql, (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json({
        status:200,
        data: results.rows,
      });
    });
  }
}

async function transaction(transactionalSql, response, cb) {
  if (!transactionalSql) {
    response.status(500).json({ error: "Transaction failed" });
    return;
  }

  pool.connect((err, client, done) => {
    const shouldAbort = (err) => {
      if (err) {
        console.error("Error in transaction", err.stack);
        client.query("ROLLBACK", (err) => {
          if (err) {
            console.error("Error rolling back client", err.stack);
          }
          // release the client back to the pool
          done();
        });
      }
      return !!err;
    };
    client.query("BEGIN", (err) => {
      const shouldAbort = (err) => {
        if (err) {
          console.error("Error in transaction", err.stack);
          client.query("ROLLBACK", (err) => {
            if (err) {
              console.error("Error rolling back client", err.stack);
            }
            // release the client back to the pool
            done();
          });
        }
        return !!err;
      };
      client.query("BEGIN", (err) => {
        if (shouldAbort(err)) return;
        const queryText = "INSERT INTO users(name) VALUES($1) RETURNING id";
        client.query(queryText, ["brianc"], (err, res) => {
          if (shouldAbort(err)) return;
          const insertPhotoText =
            "INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)";
          const insertPhotoValues = [res.rows[0].id, "s3.bucket.foo"];
          client.query(insertPhotoText, insertPhotoValues, (err, res) => {
            if (shouldAbort(err)) return;
            client.query("COMMIT", (err) => {
              if (err) {
                console.error("Error committing transaction", err.stack);
                throw new Error("Transaktion fehlgeschlagen")
              }
            });
          });
        });
      });
    });
  });
}

module.exports = {
  query,
  transaction,
  pool,
  prisma
};
