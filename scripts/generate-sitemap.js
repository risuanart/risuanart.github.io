const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");
const SITEMAP_PATH = path.join(REPO_ROOT, "sitemap.xml");

function gitFiles(patterns) {
  const out = execSync(`git ls-files ${patterns.map((p) => `'${p}'`).join(" ")}`, { cwd: REPO_ROOT })
    .toString()
    .split("\n")
    .filter(Boolean);
  return out.filter((f) => !f.includes(" 2/") && !f.endsWith(" 2.html"));
}

function lastModDate(file) {
  const date = execSync(`git log -1 --format=%ad --date=short -- "${file}"`, { cwd: REPO_ROOT }).toString().trim();
  return date || new Date().toISOString().slice(0, 10);
}

const files = gitFiles(["*/index.html", "index.html"]).sort();

const urls = [];
for (const file of files) {
  const contents = fs.readFileSync(path.join(REPO_ROOT, file), "utf8");
  if (contents.includes("noindex")) continue; // 轉址頁與明確 noindex 頁一律不列入
  const urlPath = file === "index.html" ? "/" : "/" + file.slice(0, -"index.html".length);
  urls.push({ loc: `https://risuanart.com${urlPath}`, lastmod: lastModDate(file) });
}

const body = urls
  .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`)
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

fs.writeFileSync(SITEMAP_PATH, xml);
console.log(`Wrote ${urls.length} URLs to ${SITEMAP_PATH}`);
