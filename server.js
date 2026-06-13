import express from "express";

const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
  console.log("GitHub webhook received:");
  console.log(req.body);

  res.status(200).send("ok");
});

app.get("/", (req, res) => {
  res.send("JunkDiff bot is running");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});