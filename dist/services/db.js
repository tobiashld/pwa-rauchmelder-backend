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
Object.defineProperty(exports, "__esModule", { value: true });
// const Pool = require("pg").Pool;
const pg_1 = require("pg");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const pool = new pg_1.Pool({
    user: "postgres",
    host: "199.247.20.90",
    database: "rauchmelderverwaltung",
    password: "HibTHuib13JaWxoza4P",
    port: 5432,
});
function query(sql, response, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        if (cb) {
            pool.query(sql, (error, results) => {
                if (error) {
                    throw error;
                }
                cb(results.rows, response);
            });
        }
        else {
            pool.query(sql, (error, results) => {
                if (error) {
                    throw error;
                }
                response.status(200).json({
                    status: 200,
                    data: results.rows,
                });
            });
        }
    });
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
exports.default = {
    query,
    // transaction,
    pool,
    prisma
};
