const { Octokit } = require('@octokit/rest');

/**
 * Push (create or update) a file to a GitHub repository.
 *
 * @param {Object} options
 * @param {string} options.token      - GitHub Personal Access Token
 * @param {string} options.owner      - Repository owner (user or org)
 * @param {string} options.repo       - Repository name
 * @param {string} options.path       - File path inside the repo (e.g. "src/App.jsx")
 * @param {string} options.content    - File content (plain text)
 * @param {string} options.message    - Commit message
 * @param {string} [options.branch]   - Branch to commit to (defaults to repo default)
 * @returns {Promise<Object>}         - { success, commitUrl, fileUrl, message }
 */
async function pushFileToGitHub({ token, owner, repo, path, content, message, branch }) {
  const octokit = new Octokit({ auth: token });

  // Verify the token is valid by fetching the authenticated user
  let authenticatedUser;
  try {
    const { data } = await octokit.rest.users.getAuthenticated();
    authenticatedUser = data.login;
  } catch (err) {
    throw new Error('Invalid GitHub token. Please check your Personal Access Token.');
  }

  // Resolve the default branch if none specified
  if (!branch) {
    try {
      const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
      branch = repoData.default_branch;
    } catch (err) {
      if (err.status === 404) {
        throw new Error(`Repository "${owner}/${repo}" not found. Make sure it exists and your token has access.`);
      }
      throw err;
    }
  }

  // Check if the file already exists (to get its SHA for updates)
  let existingSha = null;
  try {
    const { data: existingFile } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });
    existingSha = existingFile.sha;
  } catch (err) {
    if (err.status !== 404) {
      throw err;
    }
    // File doesn't exist yet — that's fine, we'll create it
  }

  // Create or update the file
  const params = {
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch,
  };
  if (existingSha) {
    params.sha = existingSha;
  }

  const { data: commitData } = await octokit.rest.repos.createOrUpdateFileContents(params);

  return {
    success: true,
    commitUrl: commitData.commit.html_url,
    fileUrl: commitData.content.html_url,
    message: existingSha
      ? `Updated "${path}" in ${owner}/${repo}`
      : `Created "${path}" in ${owner}/${repo}`,
    authenticatedUser,
  };
}

module.exports = { pushFileToGitHub };
