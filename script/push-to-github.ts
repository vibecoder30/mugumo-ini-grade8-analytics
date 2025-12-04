import { getGitHubClient } from '../server/github';
import * as fs from 'fs';
import * as path from 'path';

const REPO_NAME = 'mugumo-ini-grade8-analytics';
const REPO_DESCRIPTION = 'Grade 8 Student Performance Analytics Dashboard for Mugumo-ini Junior Secondary School';

// Files/folders to exclude
const EXCLUDE = [
  'node_modules',
  '.git',
  'dist',
  '.replit',
  'replit.nix',
  '.upm',
  '.cache',
  '.config',
  'package-lock.json',
  '.breakpoints',
  'generated-icon.png'
];

async function getAllFiles(dir: string, baseDir: string = dir): Promise<{path: string, content: string}[]> {
  const files: {path: string, content: string}[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (EXCLUDE.some(ex => relativePath.startsWith(ex) || entry.name === ex)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      files.push(...await getAllFiles(fullPath, baseDir));
    } else {
      try {
        const content = fs.readFileSync(fullPath);
        // Check if binary
        const isBinary = content.includes(0);
        if (!isBinary) {
          files.push({
            path: relativePath,
            content: content.toString('base64')
          });
        } else {
          // For binary files like images
          files.push({
            path: relativePath,
            content: content.toString('base64')
          });
        }
      } catch (e) {
        console.log(`Skipping ${relativePath}: ${e}`);
      }
    }
  }
  return files;
}

async function main() {
  console.log('🔗 Connecting to GitHub...');
  const octokit = await getGitHubClient();
  
  // Get authenticated user
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`✅ Connected as: ${user.login}`);
  
  // Check if repo exists
  let repoExists = false;
  try {
    await octokit.repos.get({
      owner: user.login,
      repo: REPO_NAME
    });
    repoExists = true;
    console.log(`📁 Repository "${REPO_NAME}" already exists`);
  } catch (e: any) {
    if (e.status === 404) {
      console.log(`📁 Creating new repository: ${REPO_NAME}`);
    } else {
      throw e;
    }
  }
  
  // Create repo if it doesn't exist
  if (!repoExists) {
    await octokit.repos.createForAuthenticatedUser({
      name: REPO_NAME,
      description: REPO_DESCRIPTION,
      private: false,
      auto_init: true
    });
    console.log(`✅ Repository created: https://github.com/${user.login}/${REPO_NAME}`);
    
    // Wait a moment for GitHub to initialize
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // Get all files
  console.log('📂 Gathering project files...');
  const files = await getAllFiles('.');
  console.log(`Found ${files.length} files to upload`);
  
  // Get the default branch's latest commit
  const { data: ref } = await octokit.git.getRef({
    owner: user.login,
    repo: REPO_NAME,
    ref: 'heads/main'
  });
  const latestCommitSha = ref.object.sha;
  
  // Get the tree of the latest commit
  const { data: latestCommit } = await octokit.git.getCommit({
    owner: user.login,
    repo: REPO_NAME,
    commit_sha: latestCommitSha
  });
  
  // Create blobs for all files
  console.log('📤 Uploading files to GitHub...');
  const treeItems: any[] = [];
  
  for (const file of files) {
    try {
      const { data: blob } = await octokit.git.createBlob({
        owner: user.login,
        repo: REPO_NAME,
        content: file.content,
        encoding: 'base64'
      });
      
      treeItems.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
      
      process.stdout.write('.');
    } catch (e) {
      console.log(`\n⚠️ Failed to upload ${file.path}`);
    }
  }
  console.log('\n');
  
  // Create tree
  console.log('🌳 Creating commit tree...');
  const { data: tree } = await octokit.git.createTree({
    owner: user.login,
    repo: REPO_NAME,
    base_tree: latestCommit.tree.sha,
    tree: treeItems
  });
  
  // Create commit
  console.log('💾 Creating commit...');
  const { data: newCommit } = await octokit.git.createCommit({
    owner: user.login,
    repo: REPO_NAME,
    message: 'Initial commit: Mugumo-ini Grade 8 Analytics Dashboard',
    tree: tree.sha,
    parents: [latestCommitSha]
  });
  
  // Update reference
  await octokit.git.updateRef({
    owner: user.login,
    repo: REPO_NAME,
    ref: 'heads/main',
    sha: newCommit.sha
  });
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ SUCCESS! Your project is now on GitHub!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🔗 Repository: https://github.com/${user.login}/${REPO_NAME}`);
  console.log('═══════════════════════════════════════════════════════');
}

main().catch(console.error);
