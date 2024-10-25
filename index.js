import * as github from '@actions/github';
import * as core from '@actions/core';

async function main() {
  try {
    console.log('cleaning up org...');

    core.notice('Done!');
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
