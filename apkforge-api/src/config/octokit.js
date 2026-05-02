const { Octokit } = require('@octokit/rest');
const env = require('./env');
const octokit = new Octokit({ auth: env.GITHUB_TOKEN });
module.exports = octokit;
