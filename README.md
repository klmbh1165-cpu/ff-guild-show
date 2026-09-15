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
const res = await fetch(
    "https://ff-guild-show.onrender.com/api/guild?region=BD&guildID= ") +
    encodeURIComponent(guildId)
 );

  if (!res.ok) {
    throw new Error("Guild not found");
  }

  const result = await res.json();

  return result.data;
## Deploying

Deploy this backend separately from a static Netlify frontend, for exampleonn a Node-compatible hosting provider. Then put the backend URL into the frontend.

The upstream API documentation currently lists `/api/v1/guildInfo` with `region` and `guildID`, including `BD` as a supported region.
