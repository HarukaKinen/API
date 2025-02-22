const fs = require("fs");
const Reader = require("@maxmind/geoip2-node").Reader;
const path = require("path");

const dbBuffer = fs.readFileSync(path.join(__dirname, "data", "GeoLite2.mmdb"));

const reader = Reader.openBuffer(dbBuffer);

const express = require("express");
const app = express();
const port = 9001;

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "https://ip.haruka.hk");
	res.setHeader("Access-Control-Allow-Methods", "GET");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization"
	);
	next();
});

app.get("/:ip", (req, res) => {
	const ip = req.params.ip;
	try {
		data = reader.city(ip);
	} catch (error) {
		if (error.message === "The address " + ip + " is not in the database") {
			return res.status(404).send(error.message);
		} else {
			return res.status(500).send("Internal Server Error");
		}
	}
	res.json(data);
});

app.listen(port, () => {
	console.log(`Server is listening at http://localhost:${port}`);
});
