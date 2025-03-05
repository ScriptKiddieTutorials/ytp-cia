const express = require("express");
const cors = require("cors");

// Configuration
const USERNAME = "administrator";
const PASSWORD = "EBAY4KoDTzZ@2o";

const PORT = 5000;
const MIDPOINT_API = "http://104.155.229.110:8080/midpoint/ws/rest";
const MODEL_API = "http://localhost:8000";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basically reinvented a proxy, because http-proxy-middleware seems to be incompatible with CORS
app.post("/midpoint/*", async (req, res) => {
  const endpoint = req.params[0];
  const response = await fetch(`${MIDPOINT_API}/${endpoint}`, {
    method: "POST", // POST
    headers: {
      Authorization:
        "Basic " + Buffer.from(USERNAME + ":" + PASSWORD).toString("base64"),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });

  try {
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.json({});
  }
});

app.get("/model/*", async (req, res) => {
  const endpoint = req.params[0];
  const params = new URLSearchParams(req.query).toString();
  console.log(endpoint);
  console.log(params);
  const response = await fetch(`${MODEL_API}/${endpoint}?${params}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

/*
app.use(
  "/",
  createProxyMiddleware({
    auth: USERNAME + ":" + PASSWORD,
    target: TARGET_API,
    changeOrigin: true,
  })
);
*/
