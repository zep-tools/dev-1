import { Octokit } from "@octokit/rest";
import SlackBolt from "@slack/bolt";

const app = new SlackBolt.App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
});

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const BRANCHES = [
  "publish/dev-1",
  "publish/dev-2",
  "publish/dev-3",
  "publish/dev-4",
  "publish/dev-5",
  "publish/dev-6",
  "publish/dev-7",
  "publish/dev-8",
  "publish/stage",
];

export default async (req, res) => {
  try {
    app.command("/dev_프론트_퀴즈", async ({ ack, client, command }) => {
      await ack();

      const thread = await client.chat.postMessage({
        channel: command.channel_id,
        text: "🔎 dev_프론트_퀴즈",
      });
      const threadTs = thread.ts;

      let message = "";
      for (const branch of BRANCHES) {
        const { data: commit } = await octokit.repos.getCommit({
          owner: "zep-us",
          repo: "zep-quiz-client",
          ref: branch,
        });

        message += `• \`${branch}\`\n`;
        message += `${new Date(commit.commit.author.date).toLocaleString(
          "ko-KR",
          { timeZone: "Asia/Seoul" }
        )}\n`;
        message += `${commit.commit.message}\n\n`;
      }

      await client.chat.postMessage({
        channel: command.channel_id,
        text: message.trim(),
        thread_ts: threadTs,
      });
    });

    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
