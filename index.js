import * as github from '@actions/github';
import * as core from '@actions/core';
import { removeMembersFromOrg } from './src/remove-members-from-org.js';
import { removedMembersReport } from './src/removed-members-report.js';


// Note: use when running locally
import * as dotenv from 'dotenv';
const env = dotenv.config();
const token = process.env.GITHUB_TOKEN;
const owner = process.env.OWNER;
const listPath = process.env.LIST_PATH;
const reportPath = process.env.REPORT_PATH;
const totalDays = 30;

// const context = github.context;

async function main() {
  try {
    const octokit = new github.getOctokit(token);

    const inactiveMembers = await removeMembersFromOrg.removeMembers(
      listPath,
      owner,
      totalDays,
      octokit
    )

    const summary = removedMembersReport.createReport(inactiveMembers, reportPath);

    core.notice(summary);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();

export default main;
