const express = require("express");
const fs = require("fs");
const dotenv = require("dotenv");
const { Octokit } = require("@octokit/rest");
const { createAppAuth } = require("@octokit/auth-app");

dotenv.config();

const app = express();
app.use(express.json());

const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, "utf8");

app.get("/", (req, res) => {
  res.send("JunkDiff backend is running");
});

app.post("/webhook", async (req, res) => {
  try {
    console.log("GitHub webhook received");

    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.log("Event:", event);
    console.log("Action:", payload.action);

    if (event === "issue_comment" && payload.action === "created") {
      const commentText = payload.comment.body;

      if (commentText.trim() === "/junkdiff") {
        const installationId = payload.installation.id;

        const auth = createAppAuth({
          appId: process.env.APP_ID,
          privateKey: privateKey,
        });

        const installationAuth = await auth({
          type: "installation",
          installationId: installationId,
        });

        const octokit = new Octokit({
          auth: installationAuth.token,
        });

        await octokit.issues.createComment({
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          issue_number: payload.issue.number,
          body: "JunkDiff received your command. AI review coming soon.",
        });

        console.log("Bot replied to issue");
      }
    }

    res.status(200).send("ok");
  } catch (error) {
    console.error(error);
    res.status(500).send("error");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});