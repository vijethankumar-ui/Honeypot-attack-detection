const fs = require("fs");
const express = require("express");
const geoip = require("geoip-lite");
const app = express();
const PORT = 3000;

const LOG_PATH = "/home/cowrie/cowrie/var/log/cowrie/cowrie.json";

app.get("/attacks", (req, res) => {
    fs.readFile(LOG_PATH, "utf8", (err, data) => {
        if (err) return res.json([]);

        const lines = data.trim().split("\n");
        const attacks = lines.map(l => JSON.parse(l))
            .filter(e => e.src_ip)
            .map(e => {
                let loc = geoip.lookup(e.src_ip);
                return {
                    ip: e.src_ip,
                    lat: loc?.ll?.[0] || 0,
                    lon: loc?.ll?.[1] || 0,
                    time: e.timestamp
                };
            });

        res.json(attacks);
    });
});

app.listen(PORT, () => console.log("API running on port", PORT));
