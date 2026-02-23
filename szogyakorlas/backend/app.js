import express from "express";
import db from "./data/database.js";

const app = express();

app.get("/elofordulas/:szam", (req, res) => {
    const szam = req.params.szam;
    const szavak = db.prepare("SELECT * FROM szavak WHERE gyakori > ?").all(szam);
    return res.status(200).json(szavak);
});

app.get("/melleknev", (req, res) => {
    const szoreszlet = req.query.szoreszlet;
    const szavak = db.prepare("SELECT * FROM szavak WHERE szofaj = 'mn' AND szoto LIKE ?").all(szoreszlet + "%");
    return res.status(200).json(szavak);
});

app.get("/szofajok", (req, res) => {
    const szofajok = db.prepare("SELECT szofaj, COUNT(szofaj) as szotovekszama FROM szavak GROUP BY szofaj").all();
    return res.status(200).json(szofajok);
});

app.get("/gyakorisag/:gyakorisag", (req, res) => {
    const gyakorisag = db.prepare("SELECT szoto FROM szavak GROUP BY szoto HAVING COUNT(*) >= ?").all(req.params.gyakorisag);
    return res.status(200).json(gyakorisag);
    /*Bizonyos szótövek többször is előfordulhatnak az adatbázisban. Ennek az az oka, hogy
egy a szótőnek különböző jelentései is lehetnek, és ezért eltérő szófajokhoz is
tartozhat. Készítsen GET /gyakorisag végpontra lekérdezést, amely megadja azokat a
szótöveket, amelyek legalább a megadott mennyiségben szerepelnek az
adatbázisban!
Példa:
/gyakorisag/3
*/ 
});

app.get("/modosit", (req, res) => {
    const { szoto, szofaj, gyakori } = req.query;
    const szofajok = db.prepare("SELECT EXISTS (SELECT 1 FROM szavak WHERE szofaj = ?) as van").all(szofaj);
    if (szofajok[0].van == 0)
        return res.status(400).json({message : "Hibás szófaj"});
    const szo = db.prepare("SELECT * FROM szavak WHERE szoto = ?").get(szoto);
    if (!szo && gyakori >= 10000)
        db.prepare("INSERT INTO szavak (szoto, szofaj, gyakori) VALUES (?,?,?)").run(szoto, szofaj, gyakori);
    else 
        return res.status(400).json({message: "Nem megfelelő mennyiség."});
    if (szo && gyakori < 10000)
        return res.status(400).json({message: "Nem megfelelő mennyiség."});
    return res.status(200).json(szo); 
});

app.listen(3423, () => {
    console.log("http://localhost:3423/");
});