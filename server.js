const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

const API_BASE =
  process.env.FFDATA_API_URL ||
  "https://free-ff-api-src-5plp.onrender.com";

function cleanRegion(region) {
  const value = String(region || "BD").trim().toUpperCase();

  const supported = [
    "IND",
    "BR",
    "SG",
    "RU",
    "ID",
    "TW",
    "US",
    "VN",
    "TH",
    "ME",
    "PK",
    "CIS",
    "BD"
  ];

  return supported.includes(value) ? value : "BD";
}

app.get("/", (req, res) => {
  res.json({
    service: "FF Guild Backend",
    status: "online",
    api: API_BASE
  });
});


app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "FF Guild Backend"
  });
});


app.get("/api/guild", async (req, res) => {

  const guildID = String(
    req.query.guildID || ""
  ).trim();

  const region = cleanRegion(
    req.query.region
  );


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


  const url =
    API_BASE +
    "/api/v1/guildInfo" +
    "?region=" +
    encodeURIComponent(region) +
    "&guildID=" +
    encodeURIComponent(guildID);


  console.log("=================================");
  console.log("Guild request");
  console.log("Region:", region);
  console.log("Guild ID:", guildID);
  console.log("URL:", url);
  console.log("=================================");


  try {

    const controller =
      new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      25000
    );


    let response;

    try {

      response = await fetch(url, {
        method: "GET",

        headers: {
          "Accept": "application/json",
          "User-Agent": "FF-Guild-Show/1.0"
        },

        cache: "no-store",

        signal: controller.signal
      });

    } finally {

      clearTimeout(timeout);

    }


    const text =
      await response.text();


    let data;

    try {

      data = text
        ? JSON.parse(text)
        : {};

    } catch {

      data = {
        raw: text
      };

    }


    console.log(
      "Upstream status:",
      response.status
    );


    /*
      Upstream API failed
    */
    if (!response.ok) {

      console.error(
        "Upstream API error:",
        data
      );


      return res.status(502).json({

        error:
          "Upstream Free Fire API error",

        upstreamStatus:
          response.status,

        message:
          data?.message ||
          data?.error ||
          "The Free Fire API did not return a successful response.",

        details: data,

        region,

        guildID

      });

    }


    /*
      Empty response
    */
    if (
      !data ||
      (
        typeof data === "object" &&
        Object.keys(data).length === 0
      )
    ) {

      return res.status(502).json({

        error:
          "Free Fire API returned an empty response.",

        region,

        guildID

      });

    }


    /*
      Successful response
    */
    return res.json({

      source:
        "free-ff-api",

      region,

      guildID,

      data

    });


  } catch (error) {

    console.error(
      "Backend error:",
      error
    );


    if (error.name === "AbortError") {

      return res.status(504).json({

        error:
          "Free Fire API timeout",

        message:
          "The upstream Free Fire API took too long to respond.",

        region,

        guildID

      });

    }


    return res.status(502).json({

      error:
        "Could not reach the upstream Free Fire API",

      message:
        error.message,

      region,

      guildID

    });

  }

});


app.listen(PORT, () => {

  console.log(
    "FF Guild backend running on port " +
    PORT
  );

});
