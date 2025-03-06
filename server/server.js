const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

// Configuration
const PORT = 5000;
const MIDPOINT_API = "http://104.155.229.110:8080/midpoint/ws/rest";
const MODEL_API = "http://localhost:8000";

// Constants
const SYS_PROMPT = `Provided login records flagged as anomalies by an AI detection system, generate a report analyzing their commonalities.

1. Limit your response to 150 words.
2. Your response should be insightful for a system admin.
3. Use HTML instead of Markdown formatting.
4. Do not include tables.
`;

const app = express();
const openai = new OpenAI({});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basically reinvented a proxy, because http-proxy-middleware seems to be incompatible with CORS
app.post("/midpoint/*", async (req, res) => {
  const endpoint = req.params[0];
  const response = await fetch(`${MIDPOINT_API}/${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization:
        "Basic " + Buffer.from(req.headers["authorization"]).toString("base64"),
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

async function getReport(message) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYS_PROMPT },
      { role: "user", content: message },
    ],
  });
  return response?.choices[0]?.message.content;
}

app.post("/report", async (req, res) => {
  res.json(await getReport(req.body.csvData));
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
