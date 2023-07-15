// proxy.js
const express = require("express");
const axios = require("axios");

const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/twitch/api/*", (req, res) => {
  const apiUrl = req.originalUrl.replace(
    "/twitch/api",
    "https://api.twitch.tv"
  );
  axios
    .get(apiUrl, { headers: { "Client-ID": "tejwidendk31wwh1a3as0b2erystoi" } })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.listen(port, () => {
  console.log(`Proxy server is running on port ${port}`);
});
