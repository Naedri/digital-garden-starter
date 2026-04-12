import fg from "fast-glob";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const docsDir = "docs";
const outputPath = path.join(docsDir, "_generated/history.md");

const files = await fg(["**/*.md"], {
  cwd: docsDir,
  ignore: [
    "_generated/**",
    "_guidelines/**",
    "_templates/**",
    ".obsidian/**",
    "graph.md",
    "index.md"
  ]
});

if (files.length === 0) {
  console.log("No files found.");
} else {
  console.log("Found files:", files);
}

// Get last meaningful modification from git
const getGitLastModifiedDate = (filePath) => {
  try {
    // Run a Git command to get the last commit date for this file:
    // - git log -1            → only the most recent commit affecting the file
    // - --format=%cI          → output the commit date in ISO 8601 format (easy to parse)
    // - --diff-filter=M       → include only commits where the file was actually modified (content changes)
    // - --follow              → continue history across renames
    // - -- "${filePath}"      → safely pass the file path to Git (handles special characters)
    // execSync(...)           → execute the command synchronously and return stdout as a string
    // .trim()                 → remove trailing newline/whitespace from Git output
    const result = execSync(
      `git log -1 --format=%cI --diff-filter=M --follow -- "${filePath}"`,
      { encoding: "utf-8" }
    ).trim();

    if (!result) return null;

    const d = new Date(result);

    // normalize to day precision
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  } catch (e) {
    console.error(`Git error for ${filePath}:`, e.message);
    return null;
  }
};

const getPage = (list) => `---
title: History
---

# {{ $frontmatter.title }}

${list}
`;

const sorted = files
  .map((file) => {
    const filePath = path.join(docsDir, file);
    const time = getGitLastModifiedDate(filePath);
    return { file, time };
  })
  .filter((res) => res.time !== null)
  .sort((a, b) => {
    let res;
    if (b.time.getTime() !== a.time.getTime()) res = b.time - a.time;
    else res = a.file.localeCompare(b.file);
    return res;
  });
// last 10 files
// .slice(0, 10);

const list = sorted
  .map((f) => {
    const url = "/" + f.file.replace(".md", "");
    const name = url.split("/").pop();
    const date = f.time.toLocaleDateString("en-CA");
    return `- [${name}](${url}) - ${date}`;
  })
  .join("\n");

const md = getPage(list);

fs.writeFileSync(outputPath, md);

console.log(`History generated at ${outputPath}`);
