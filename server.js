const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const UPSTREAMS = [
"https://free-ff-api-src-5plp.onrender.com"
];

const ALLOWED_REGIONS = [
"IND", "BR", "SG", "RU", "ID", "TW",
"US", "VN", "TH", "ME", "PK", "CIS", "BD"
];

function cleanRegion(value) {
const region = String(value || "BD").trim().toUpperCase();
return ALLOWED_REGIONS.includes(region) ? region : "BD";
}

function normalizeGuild(data, guildID, region) {
return {
guildID:
data.guildID ||
data.guildId ||
data.clanId ||
guildID,

guildName:
  data.guildName ||
  data.name ||
  data.clanName ||
  "Unknown Guild",

guildLevel:
  data.guildLevel ??
  data.level ??
  data.clanLevel ??
  "N/A",

memberCount:
  data.memberCount ??
  data.members ??
  data.memberNum ??
  "N/A",

capacity:
  data.capacity ??
  "N/A",

region:
  data.region ||
  region,

leader:
  data.leaderName ||
  data.leader ||
  data.captainId ||
  "N/A",

experience:
  data.experience ??
  data.exp ??
  data.guildExp ??
  "N/A",

slogan:
  data.slogan ||
  "",

raw: data

};
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
error: "Guild ID is required",
example: "/api/guild?region=BD&guildID=YOUR_GUILD_ID"
});
}

const errors = [];

for (const base of UPSTREAMS) {
const url =
"${base}/api/v1/guildInfo" +
"?region=${encodeURIComponent(region)}" +
"&guildID=${encodeURIComponent(guildID)}";

try {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    }
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (!response.ok) {
    errors.push({
      url,
      status: response.status,
      response: text.slice(0, 500)
    });
    continue;
  }

  if (!data) {
    errors.push({
      url,
      status: response.status,
      response: "Invalid JSON response"
    });
    continue;
  }

  return res.json({
    source: "free-ff-api",
    region,
    guildID,
    data: normalizeGuild(data, guildID, region)
  });

} catch (error) {
  errors.push({
    url,
    error: error.message
  });
}

}

return res.status(502).json({
error: "Free Fire Guild API is currently unavailable",
region,
guildID,
details: errors
});
});

app.listen(PORT, () => {
console.log("FF Guild backend running on port ${PORT}");
});
