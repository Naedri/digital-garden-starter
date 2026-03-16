import fg from "fast-glob";
import fs from "fs";
import path from "path";

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

const getPage = (list) => `---
title: Historique
---

# {{ $frontmatter.title }}

${list}
`;

const sorted = files
  .map((file) => {
    const filePath = path.join(docsDir, file);
    try {
      const { mtime } = fs.statSync(filePath);
      const day = new Date(
        mtime.getFullYear(),
        mtime.getMonth(),
        mtime.getDate()
      );
      return { file, time: day };
    } catch (error) {
      console.error("Error reading file stats:", error.message);
      return { file, time: null };
    }
  })
  .filter((res) => res.time !== null)
  .sort((a, b) => {
    if (b.time != a.time) return b.time - a.time;
    else b.file - a.file;
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
