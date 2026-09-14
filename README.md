# Free Fire Guild Backend

This backend keeps the external API call away from the browser.

## 1. Install

```bash
npm install
```

## 2. Run

```bash
npm start
```

The server runs on:

```text
http://localhost:3000
```

## 3. Test

Open:

```text
http://localhost:3000/api/health
```

Then:

```text
http://localhost:3000/api/guild?region=BD&guildID=YOUR_GUILD_ID
```

## 4. Connect the HTML

In the HTML `fetchGuildById()` function, call:

```js
const res = await fetch(
  "https://YOUR-BACKEND-DOMAIN.com/api/guild?region=BD&guildID=" +
  encodeURIComponent(guildId)
);
if (!res.ok) throw new Error("Guild not found");
const result = await res.json();
return normalizeApiData(result);
```

Important:
- This uses an unofficial third-party Free Fire API.
- It is not a Garena official API.
- The upstream service can change, fail, rate-limit, or return incomplete data.
- Do not put private API keys in the frontend.
- Use only data and access methods that you are permitted to use.

## Deploying

Deploy this backend separately from a static Netlify frontend, for example on a Node-compatible hosting provider. Then put the backend URL into the frontend.

The upstream API documentation currently lists `/api/v1/guildInfo` with `region` and `guildID`, including `BD` as a supported region.
