import { execSync } from "child_process";

export function remarkModifiedTime() {
  return function (tree, file) {
    const filepath = file.history[0];
    
    // Get the last commit that modified this file
    const lastCommit = execSync(`git log -1 --pretty="format:%H" "${filepath}"`).toString().trim();
    
    // Check if the file was actually modified in this commit
    const filesChanged = execSync(`git show --name-only --pretty="" "${lastCommit}"`).toString().trim().split('\n');
    
    if (filesChanged.includes(filepath)) {
      // Only update lastModified if the file was actually modified
      const result = execSync(`git log -1 --pretty="format:%cI" "${filepath}"`);
      file.data.astro.frontmatter.lastModified = result.toString();
    }
  };
}
