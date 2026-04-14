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
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  } catch (e) {
    console.error(`Git error for ${filePath}:`, e.message);
    return null;
  }
};

// ISO week group
const getWeekGroup = (date) => {
  const d = new Date(date);

  // ISO week correction (Monday-based)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));

  const yearStart = new Date(d.getFullYear(), 0, 1);

  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);

  return `${d.getFullYear()} - W${String(weekNo).padStart(2, "0")}`;
};

// Markdown wrapper
const getPage = (list) => `---
title: History
---

# {{ $frontmatter.title }}

${list}
`;

// Build file list with git dates
const sorted = files
  .map((file) => {
    const filePath = path.join(docsDir, file);
    const time = getGitLastModifiedDate(filePath);
    return { file, time };
  })
  .filter((x) => x.time !== null)
  // newest first
  .sort((a, b) => b.time - a.time);
// last 10 files
// .slice(0, 10);

// Group by week (store structured data)
const groups = sorted.reduce((acc, f) => {
  const group = getWeekGroup(f.time);

  const url = "/" + f.file.replace(".md", "");
  const name = url.split("/").pop();
  const date = f.time.toLocaleDateString("en-CA");

  if (!acc[group]) acc[group] = [];
  acc[group].push({ name, url, date });

  return acc;
}, {});

// Sort groups and items
const list = Object.entries(groups)
  // latest week first
  .sort(([a], [b]) => b.localeCompare(a))
  .map(([range, items]) => {
    const sortedItems = items
      // alphabetical order inside each group
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ name, url, date }) => `- [${name}](${url}) - ${date}`);

    return `:::details ${range} (${items.length})

${sortedItems.join("\n")}

:::`;
  })
  .join("\n\n");

const md = getPage(list);

// Ensure output directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

fs.writeFileSync(outputPath, md);

console.log(`History generated at ${outputPath}`);
