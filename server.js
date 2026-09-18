const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ==========================================
// API CONFIGURATION
// ==========================================

// Primary Free Fire Guild API
const PRIMARY_API =
  process.env.FFDATA_API_URL ||
  "https://free-ff-api-src-5plp.onrender.com";

// Fallback Guild API
const FALLBACK_API =
  "https://get-clan-info.vercel.app";

// Supported Free Fire regions
const SUPPORTED_REGIONS = [
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


// ==========================================
// REGION CLEANER
// ==========================================

function cleanRegion(region) {
  const value = String(region || "BD")
    .trim()
    .toUpperCase();

  if (SUPPORTED_REGIONS.includes(value)) {
    return value;
  }

  return "BD";
}


// ==========================================
// FETCH JSON WITH TIMEOUT
// ==========================================

async function fetchJSON(url, timeoutMs = 15000) {

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {

    const response = await fetch(url, {
      method: "GET",

      headers: {
        "Accept": "application/json",
        "User-Agent": "FF-Guild-Show/1.0"
      },

      cache: "no-store",

      signal: controller.signal
    });


    const text = await response.text();

    let data;


    try {

      data = text
        ? JSON.parse(text)
        : {};

    } catch {

      data = {
       
