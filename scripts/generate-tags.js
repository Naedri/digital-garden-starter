import fg from "fast-glob";
import fs from "fs";
import matter from "gray-matter";
import path from "path";

const docsDir = "docs";
const tagsDir = path.join(docsDir, "_generated/tags");
const outputPath = path.join(tagsDir, "index.md");

const files = await fg(["**/*.md"], {
  cwd: docsDir,
  ignore: [
    "_generated/**",
    "graph.md",
    "index.md",
    "tags/**",
    ".obsidian/**",
    "_templates/**"
  ]
});

const getPageOneTag = (tag, pages, list) => `---
title: ${tag.toUpperCase()} tag
---

# {{ $frontmatter.title }}

${pages.length} page(s) using this tag.

${list}
`;

const getPageIndexTag = (tagList) => `---
title: Tags
---

# {{ $frontmatter.title }}

${tagList}
`;

const tags = {};

// Browsing tags of files
for (const file of files) {
  const fullPath = path.join(docsDir, file);
  const content = fs.readFileSync(fullPath, "utf-8");
  const { data } = matter(content);

  if (!data.tags) continue;

  const title = data.title ?? path.basename(file, ".md");
  const url = "/" + file.replace(/\.md$/, "");

  for (const tag of data.tags) {
    if (!tags[tag]) tags[tag] = [];

    tags[tag].push({
      title,
      url
    });
  }
}

// Resetting folder
fs.rmSync(tagsDir, { recursive: true, force: true });
fs.mkdirSync(tagsDir, { recursive: true });

// Page of one tag listing pages
for (const [tag, pages] of Object.entries(tags)) {
  const list = pages.map((p) => `- [${p.title}](${p.url})`).join("\n");

  const md = getPageOneTag(tag, pages, list);

  fs.writeFileSync(path.join(tagsDir, `${tag}.md`), md);
}

// Page indexing tags
const tagList = Object.entries(tags)
  .sort((a, b) => {
    // page number
    if (b[1].length != a[1].length) return b[1].length - a[1].length;
    // tag names
    else return b[0] - a[0];
  })
  .map(
    ([tag, pages]) => `- [${tag}](/_generated/tags/${tag}) (${pages.length})`
  )
  .join("\n");

const index = getPageIndexTag(tagList);

fs.writeFileSync(outputPath, index);

console.log("Tags _generated :", Object.keys(tags));
