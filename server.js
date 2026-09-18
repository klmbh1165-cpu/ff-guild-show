const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

const PRIMARY_API =
  process.env.FFDATA_API_URL ||
  "https://free-ff-api-src-5plp.onrender.com";

const FALLBACK_API =
  "https://get-clan-info.vercel.app";

const SUPPORTED_REGIONS = [
  "IND", "BR", "SG", "RU", "ID", "TW",
  "US", "VN", "TH", "ME", "PK", "CIS", "BD"
];

function cleanRegion(region) {
  const value = String(region || "BD").trim().toUpperCase();

  return SUPPORTED_REGIONS.includes(value)
    ? value
    : "BD";
}

async function fetchJSON(url) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 20000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "FF-Guild-Show/1.0"
      },
      cache: "no-store",
      signal: controller.signal
    });

    const text = await response.text();

    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {
        raw: text
      };
    }

    return {
      ok: response.ok,
      status: response.status,
      data
    };

  } finally {
    clearTimeout(timeout);
  }
}


// HOME
app.get("/", (req, res) => {
  res.json({
    service: "FF Guild Backend",
    status: "online",
    message: "Backend is running"
  });
});


// HEALTH
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "FF Guild Backend"
  });
});


// GUILD SEARCH
app.get("/api/guild", async (req, res) => {

  const guildID = String(
    req.query.guildID || ""
  ).trim();

  const region = cleanRegion(
    req.query.region
  );


  // Validate Guild ID
  if (!guildID) {
    return res.status(400).json({
      error: "Guild ID is required"
    });
  }

  if (!/^\d+$/.test(guildID)) {
    return res.status(400).json({
      error: "Guild ID must contain numbers only"
    });
  }


  console.log("--------------------------------");
  console.log("Guild request");
  console.log("Region:", region);
  console.log("Guild ID:", guildID);


  // =====================================
  // PRIMARY API
  // =====================================

  try {

    const primaryURL =
      PRIMARY_API +
      "/api/v1/guildInfo" +
      "?region=" +
      encodeURIComponent(region) +
      "&guildID=" +
      encodeURIComponent(guildID);

    console.log("Primary URL:", primaryURL);

    const result =
      await fetchJSON(primaryURL);

    console.log(
      "Primary status:",
      result.status
    );

    if (result.ok) {

      return res.json({
        source: "primary",
        region: region,
        guildID: guildID,
        data: result.data
      });

    }

  } catch (error) {

    console.log(
      "Primary API error:",
      error.message
    );

  }


  // =====================================
  // FALLBACK API
  // =====================================

  try {

    const fallbackURL =
      FALLBACK_API +
      "/get_clan_info?clan_id=" +
      encodeURIComponent(guildID);

    console.log(
      "Fallback URL:",
      fallbackURL
    );

    const result =
      await fetchJSON(fallbackURL);

    console.log(
      "Fallback status:",
      result.status
    );

    if (result.ok) {

      return res.json({
        source: "fallback",
        region: region,
        guildID: guildID,
        data: result.data
      });

    }

  } catch (error) {

    console.log(
      "Fallback API error:",
      error.message
    );

  }


  // =====================================
  // BOTH FAILED
  // =====================================

  return res.status(502).json({
    error: "All Guild APIs failed",
    message:
      "No Guild API returned a successful response.",
    region: region,
    guildID: guildID
  });

});


// 404
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});


// START SERVER
app.listen(PORT, () => {

  console.log(
    "FF Guild Backend running on port " + PORT
  );

});
