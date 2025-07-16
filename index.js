const express = require("express");
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const { Reader } = require("@maxmind/geoip2-node");

const app = express();
const port = process.env.PORT || 9001;

const dbBuffer = fs.readFileSync(path.join(__dirname, "data", "GeoLite2.mmdb"));
const reader = Reader.openBuffer(dbBuffer);

const {
	DB_HOST = "",
	DB_USER = "",
	DB_PASS = "",
	DB_NAME = "",
	DB_PORT = 3306,
	API_PREFIX = "/api/v1",
} = process.env;

const pool = mysql.createPool({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASS,
	database: DB_NAME,
	port: Number(DB_PORT),
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

// CORS 设置，只允许特定来源访问
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "https://ip.haruka.hk");
	res.setHeader("Access-Control-Allow-Methods", "GET");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization"
	);
	next();
});

app.get(`${API_PREFIX}/user/qq/:qq`, async (req, res) => {
	const qq = req.params.qq;
	console.log(`Received request for qq=${qq}`);

	if (!qq) {
		return res.status(400).json({ error: "Missing qq parameter" });
	}

	try {
		const [rows] = await pool.execute(
			"SELECT * FROM userrole WHERE qq = ? LIMIT 1",
			[qq]
		);
		if (rows.length === 0) {
			return res.status(404).json({ error: "User not found" });
		} else {
			return res.json(rows[0]);
		}
	} catch (error) {
		console.error("Database query error:", error);
		return res.status(500).json({
			error: "Database query error",
			details: error.message,
		});
	}
});

app.get(`${API_PREFIX}/ip/:ip`, (req, res) => {
	const ip = req.params.ip;

	try {
		const data = reader.country(ip);
		return res.json(data);
	} catch (error) {
		if (error.message === "The address " + ip + " is not in the database") {
			return res.status(404).send(error.message);
		} else {
			console.error("GeoIP lookup error:", error);
			return res.status(500).send("Internal Server Error");
		}
	}
});

app.listen(port, () => {
	console.log(`Server is listening at http://localhost:${port}`);
});
