const fs = require("fs");
const Reader = require("@maxmind/geoip2-node").Reader;
// Typescript:
// import { Reader } from '@maxmind/geoip2-node';

const dbBuffer = fs.readFileSync("./data/GeoLite2-City.mmdb");
const reader = Reader.openBuffer(dbBuffer);

const express = require("express");
const app = express();
const port = 9001;

// console.log(data);

// console.log(data.country.isoCode);

// console.log(data.city.names.en);

// GET /users 路由，用于获取所有用户列表
app.get("/:ip", (req, res) => {
	const ip = req.params.ip;
	data = reader.city(ip);
	res.json(data);
});

app.listen(port, () => {
	console.log(`Server is listening at http://localhost:${port}`);
});
