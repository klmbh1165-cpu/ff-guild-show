const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const API_BASE = "https://free-ff-api-src-5plp.onrender.com";

function cleanRegion(value) {
const region = String(value || "BD").trim().toUpperCase();

const allowed = [
"IND", "BR", "SG", "RU", "ID", "TW",
"US", "VN", "TH", "ME", "PK", "CIS", "BD"
];

return allowed.includes(region) ? region : "BD";
}

app.get("/api/health", (req, res) => {
res.json({
ok: true,
service: "FF Guild Backend"
});
});

app.get("/api/guild", async (req, res) => {
const guildID = String(req.query.guildID || "").trim();
const region = cleanRegion(req.query.region);

if (!guildID) {
return res.status(400).json({
error: "Guild ID is required"
});
}

try {
const url =
API_BASE +
"/api/v1/guildInfo?region=" +
encodeURIComponent(region) +
"&guildID=" +
encodeURIComponent(guildID);

const response = await fetch(url);
const text = await response.text();

let data;

try {
  data = JSON.parse(text);
} catch {
  data = { raw: text };
}

if (!response.ok) {
  return res.status(response.status).json({
    error: "Upstream Free Fire API error",
    details: data
  });
}

res.json({
  source: "free-ff-api",
  region: region,
  guildID: guildID,
  data: data
});

} catch (error) {
res.status(502).json({
error: "Could not reach the upstream Free Fire API",
details: error.message
});
}
});

app.listen(PORT, () => {
console.log("FF Guild backend running on port " + PORT);
});
