const express = require("express");
const app = express();
const port = 3000;
const objekte = require('./services/objekte');
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

app.get("/objekte",async (req,res)=>{
    try {
        res.json(await objekte.getAll());
    } catch (err) {
        console.error(`Error while getting Objekte `, err.message);
    }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});