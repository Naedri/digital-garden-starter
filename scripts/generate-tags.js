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
    "_templates/**",
    ".obsidian/**",
    "graph.md",
    "index.md",
    "tags/**"
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

// Page indexing tags (alphabetical grouping)

const groups = {
  "0-9": [],
  "A-F": [],
  "G-K": [],
  "L-P": [],
  "Q-U": [],
  "V-Z": []
};

function getGroup(tag) {
  const first = tag[0].toUpperCase();

  if (/[0-9]/.test(first)) return "0-9";
  if (first >= "A" && first <= "F") return "A-F";
  if (first >= "G" && first <= "K") return "G-K";
  if (first >= "L" && first <= "P") return "L-P";
  if (first >= "Q" && first <= "U") return "Q-U";
  if (first >= "V" && first <= "Z") return "V-Z";
  return "Other";
}

// alphabetical sort
const sortedTags = Object.entries(tags).sort((a, b) =>
  a[0].localeCompare(b[0], undefined, { sensitivity: "base" })
);

// distribute tags into groups
for (const [tag, pages] of sortedTags) {
  const group = getGroup(tag);

  groups[group].push(`- [${tag}](/_generated/tags/${tag}) (${pages.length})`);
}

// build grouped markdown containers
const tagList = Object.entries(groups)
  .filter(([, list]) => list.length > 0)
  .map(
    ([range, list]) => `
:::details ${range} (${list.length})
${list.join("\n")}
:::
`
  )
  .join("\n");

// generate index page
const index = getPageIndexTag(tagList);

// Ensure output directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

fs.writeFileSync(outputPath, index);

console.log("Tags generated :", Object.keys(tags));
