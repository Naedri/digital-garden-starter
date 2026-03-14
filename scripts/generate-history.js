import fg from "fast-glob";
import fs from "fs";
import path from "path";

const docsDir = "docs";
const outputPath = path.join(docsDir, "generated/history.md");

const files = await fg(["**/*.md"], {
  cwd: docsDir,
  ignore: ["generated/**", "graph.md", "index.md"]
});

if (files.length === 0) {
  console.log("No files found.");
} else {
  console.log("Found files:", files);
}

const getPage = (list) => `---
title: History
---

# {{ $frontmatter.title }}

${list}
`;

const sorted = files
  .map((file) => ({
    file,
    time: fs.statSync(path.join(docsDir, file)).mtime
  }))
  .sort((a, b) => b.time - a.time)
  .slice(0, 10);

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
