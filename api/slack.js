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

// 🔧 추가된 부분: 레포 리스트 정의
const REPOS = [
  { owner: "zep-us", repo: "zep-quiz-client", label: "📦 zep-quiz-client" },
  { owner: "zep-us", repo: "zep-quiz-script", label: "📦 zep-quiz-script" },
];

export default async (req, res) => {
  try {
    if (req.body.command === "/dev_프론트_퀴즈") {
      const { client } = app;

      const thread = await client.chat.postMessage({
        channel: req.body.channel_id,
        text: "🔎 프론트_퀴즈",
      });
      const threadTs = thread.ts;

      let message = `(현재 시간: ${new Date().toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
      })})\n\n`;

      // 🔁 수정된 부분: REPOS 루프로 여러 레포 처리
      for (const { owner, repo, label } of REPOS) {
        message += `${label}\n`;

        for (const branch of BRANCHES) {
          try {
            const { data: commit } = await octokit.repos.getCommit({
              owner,
              repo,
              ref: branch,
            });

            message += `• \`${branch}\`\n`;
            message += `${new Date(commit.commit.author.date).toLocaleString(
              "ko-KR",
              {
                timeZone: "Asia/Seoul",
              }
            )}\n`;
            message += `${commit.commit.message}\n\n`;
          } catch (err) {
            message += `• \`${branch}\` ❌ 브랜치 없음 또는 에러\n\n`;
          }
        }

        message += `\n`; // 레포 간 구분 줄
      }

      await client.chat.postMessage({
        channel: req.body.channel_id,
        text: message.trim(),
        thread_ts: threadTs,
      });
    }
    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
