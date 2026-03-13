import express, { json } from "express";
import db from "./data/database.js";

const PORT = 3000;
const PREFIX = "/rengesek";

const app = express();

app.use(json());

app.get(PREFIX + "/telepulesek/:varmegye", (req, res) => {
    const county = req.params.varmegye;
    const towns = db.prepare("SELECT nev FROM telepules WHERE varmegye = ? ORDER BY nev").all(county);
    return res.status(200).json(towns);
});

app.get(PREFIX + "/varmegye/statisztika", (req, res) => {
    const sql = `   SELECT telepules.varmegye, COUNT(naplo.telepid) as db
                    FROM naplo
                    JOIN telepules ON telepules.id = naplo.telepid
                    GROUP BY telepules.varmegye
                    ORDER BY db DESC`;
    const county = db.prepare(sql).all();
    return res.status(200).json(county);
});

app.get(PREFIX + "/intenzitas", (req, res) => {
    const sql = `   SELECT substr(datum, 1,4) as ev, COUNT(id) as db
                    FROM naplo
                    WHERE intenzitas > 3
                    GROUP BY ev
                    ORDER BY db DESC
                    LIMIT 3`;
    const year = db.prepare(sql).all();
    return res.status(200).json(year);
})

app.post(PREFIX + "/uj", (req, res) => {
    const {datum, ido, telepules, varmegye, magnitudo, intenzitas} = req.body;
    if (!datum || !ido || !telepules || !varmegye || !magnitudo || !intenzitas)
        return res.status(400).json({"message":"Hiányzó adatok."});
    let town = db.prepare("SELECT * FROM telepules WHERE nev = ?").get(telepules);
    let row;
    if (!town){
        town = db.prepare("INSERT INTO telepules (nev, varmegye) VALUES (?,?)").run(telepules,varmegye);
        row = db.prepare("INSERT INTO naplo (datum, ido, telepid, magnitudo, intenzitas) VALUES (?,?,?,?,?)").run(datum, ido, town.lastInsertRowid, magnitudo, intenzitas);
    }
    else 
        row = db.prepare("INSERT INTO naplo (datum, ido, telepid, magnitudo, intenzitas) VALUES (?,?,?,?,?)").run(datum, ido, town.id, magnitudo, intenzitas);
    return res.status(201).json({"message": "Földrengés sikeresen rögzítve","id": row.lastInsertRowid });
});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});