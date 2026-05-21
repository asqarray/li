import { GitHubRepoData } from "../types";

export async function fetchGitHubRepoData(url: string): Promise<GitHubRepoData> {
  const cleanUrl = url.replace(/\/+$/, "");
  // More robust regex to handle various GitHub URL formats and trailing slashes
  const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  if (!match) throw new Error("Invalid GitHub URL. Expected format: https://github.com/owner/repo");

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, ""); // Remove .git suffix if present
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const headers: HeadersInit = {
    "Accept": "application/vnd.github.v3+json",
  };

  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  // Fetch Repo Info
  const repoRes = await fetch(baseUrl, { headers });
  if (!repoRes.ok) throw new Error(`GitHub API Error: ${repoRes.statusText}`);
  const repoInfo = await repoRes.json();

  // Fetch Commits
  const commitsRes = await fetch(`${baseUrl}/commits?per_page=30`, { headers });
  const commits = commitsRes.ok ? await commitsRes.json() : [];

  // Fetch Recursive Tree (from main/master branch)
  const branch = repoInfo.default_branch || "main";
  const treeRes = await fetch(`${baseUrl}/git/trees/${branch}?recursive=1`, { headers });
  const treeData = treeRes.ok ? await treeRes.json() : { tree: [] };

  // Try to fetch package.json
  let packageJson = null;
  try {
    const pkgRes = await fetch(`${baseUrl}/contents/package.json`, { headers });
    if (pkgRes.ok) {
      const pkgData = await pkgRes.json();
      const content = atob(pkgData.content);
      packageJson = JSON.parse(content);
    }
  } catch (e) {
    // Optional
  }

  return {
    owner,
    repo,
    description: repoInfo.description || "",
    topics: repoInfo.topics || [],
    commits: commits.map((c: any) => ({
      message: c.commit.message,
      date: c.commit.author.date,
      author: c.commit.author.name
    })),
    tree: treeData.tree
      .filter((t: any) => t.type === "blob")
      .map((t: any) => t.path)
      .slice(0, 100), // Limit to top 100 files for context
    packageJson
  };
}
