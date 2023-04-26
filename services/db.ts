// const Pool = require("pg").Pool;
import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log:[
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
    
  ]
})
// prisma.$on('query', (e) => {
//   console.log('Query: ' + e.query)
//   console.log('Params: ' + e.params)
//   console.log('Duration: ' + e.duration + 'ms')
// })
// prisma.$on('error', (e) => {
//   console.log('Message: ' + e.message)
//   console.log('Target: ' + e.target)
// })

const pool = new Pool({
  user: "postgres",
  host: "199.247.20.90",
  database: "rauchmelderverwaltung",
  password: "HibTHuib13JaWxoza4P",
  port: 5432,
});

async function query(sql:any, response:any, cb?:any) {
  if (cb) {
    pool.query(sql, (error:any, results:any) => {
      if (error) {
        throw error;
      }
      cb(results.rows, response);
    });
  } else {
    pool.query(sql, (error:any, results:any) => {
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

// async function transaction(transactionalSql:any, response:any, cb:any) {
//   if (!transactionalSql) {
//     response.status(500).json({ error: "Transaction failed" });
//     return;
//   }

//   pool.connect((err, client, done) => {
//     const shouldAbort = (err) => {
//       if (err) {
//         console.error("Error in transaction", err.stack);
//         client.query("ROLLBACK", (err) => {
//           if (err) {
//             console.error("Error rolling back client", err.stack);
//           }
//           // release the client back to the pool
//           done();
//         });
//       }
//       return !!err;
//     };
//     client.query("BEGIN", (err) => {
//       const shouldAbort = (err) => {
//         if (err) {
//           console.error("Error in transaction", err.stack);
//           client.query("ROLLBACK", (err) => {
//             if (err) {
//               console.error("Error rolling back client", err.stack);
//             }
//             // release the client back to the pool
//             done();
//           });
//         }
//         return !!err;
//       };
//       client.query("BEGIN", (err) => {
//         if (shouldAbort(err)) return;
//         const queryText = "INSERT INTO users(name) VALUES($1) RETURNING id";
//         client.query(queryText, ["brianc"], (err, res) => {
//           if (shouldAbort(err)) return;
//           const insertPhotoText =
//             "INSERT INTO photos(user_id, photo_url) VALUES ($1, $2)";
//           const insertPhotoValues = [res.rows[0].id, "s3.bucket.foo"];
//           client.query(insertPhotoText, insertPhotoValues, (err, res) => {
//             if (shouldAbort(err)) return;
//             client.query("COMMIT", (err) => {
//               if (err) {
//                 console.error("Error committing transaction", err.stack);
//                 throw new Error("Transaktion fehlgeschlagen")
//               }
//             });
//           });
//         });
//       });
//     });
//   });
// }

export default {
  query,
  // transaction,
  pool,
  prisma
};
