const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Current Free Fire API source
const API_BASE =
  process.env.FFDATA_API_URL ||
  "https://free-ff-api-src-5plp.onrender.com";

function cleanRegion(region) {
  const value = String(region || "BD").trim().toUpperCase();
  return value || "BD";
}

app.get("/", (req, res) => {
  res.json({
    service: "FF Guild Backend",
    status: "online"
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

    console.log("Requesting:", url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        raw: text
      };
    }

    if (!response.ok) {
      return res.status(502).json({
        error: "Upstream Free Fire API error",
        upstreamStatus: response.status,
        details: data
      });
    }

    return res.json({
      source: "free-ff-api",
      region,
      guildID,
      data
    });

  } catch (error) {
    console.error("Guild API error:", error);

    return res.status(502).json({
      error: "Could not reach the upstream Free Fire API",
      details:
        error.name === "AbortError"
          ? "Free Fire API request timed out."
          : error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("FF Guild backend running on port " + PORT);
});
