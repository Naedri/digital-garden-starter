import fg from "fast-glob";
import fs from "fs";
import path from "path";

const docsDir = "docs";
const outputPath = path.join(docsDir, "public/graph.json");

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

const nodes = [];
const links = [];
const pageSet = new Set();

// 1. Index the pages
for (const file of files) {
  const id = file.replace(/\.md$/, "");
  pageSet.add(id);

  nodes.push({
    id,
    label: path.basename(id),
    group: id.split("/")[0]
  });
}

// 2. Analyze standard Markdown links: [label](/path/to/file)
for (const file of files) {
  const source = file.replace(/\.md$/, "");
  const content = fs.readFileSync(path.join(docsDir, file), "utf8");

  // Matches the content inside the parentheses: ( /path/here )
  // We use [^)]+ to ensure we capture everything until the closing parenthesis
  const matches = [...content.matchAll(/\[.*?\]\((.*?)\)/g)];

  for (const m of matches) {
    let target = m[1];

    if (target.startsWith("http") || target.startsWith("//")) {
      console.log(`Skipping external link: ${target}`);
      continue;
    }

    target = target.replace(/^\//, "");
    target = target.replace(/\.md$/, "");

    if (!pageSet.has(target)) continue;

    links.push({
      source,
      target
    });
  }
}

const graph = {
  nodes,
  links
};

fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));

console.log(`Graph generated: ${nodes.length} nodes, ${links.length} links`);
