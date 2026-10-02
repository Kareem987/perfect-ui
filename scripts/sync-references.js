import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const SHADCN_DIR = path.join(ROOT_DIR, "references", "shadcn");
const COSS_DIR = path.join(ROOT_DIR, "references", "coss");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function saveItemFiles(targetDir, files, itemType) {
  for (const file of files) {
    if (!file.content) {
      continue;
    }
    const filename = path.basename(file.path);
    let subfolder = "ui";
    if (file.path.includes("/lib/") || itemType === "registry:lib") {
      subfolder = "lib";
    } else if (file.path.includes("/hooks/") || itemType === "registry:hook") {
      subfolder = "hooks";
    }

    const cleanPath = path.join(targetDir, subfolder, filename);
    ensureDir(path.dirname(cleanPath));
    fs.writeFileSync(cleanPath, file.content, "utf8");

    const rawPath = path.join(targetDir, file.path);
    ensureDir(path.dirname(rawPath));
    fs.writeFileSync(rawPath, file.content, "utf8");
  }
}

async function fetchShadcnItem(itemName) {
  let res = await fetch(
    `https://ui.shadcn.com/r/styles/new-york-v4/${itemName}.json`
  );
  if (!res.ok) {
    res = await fetch(
      `https://ui.shadcn.com/r/styles/new-york/${itemName}.json`
    );
  }
  if (!res.ok) {
    return null;
  }
  return res.json();
}

async function syncShadcn() {
  console.log("==> Syncing shadcn registry...");
  ensureDir(SHADCN_DIR);

  const indexRes = await fetch("https://ui.shadcn.com/r/index.json");
  if (!indexRes.ok) {
    throw new Error(`Failed to fetch shadcn index: ${indexRes.status}`);
  }
  const items = await indexRes.json();
  fs.writeFileSync(
    path.join(SHADCN_DIR, "registry.json"),
    JSON.stringify(items, null, 2),
    "utf8"
  );

  items.push({ name: "utils", type: "registry:lib" });

  const results = await Promise.all(
    items.map(async (item) => {
      const data = await fetchShadcnItem(item.name);
      if (data?.files?.length) {
        saveItemFiles(SHADCN_DIR, data.files, item.type);
        return 1;
      }
      return 0;
    })
  );

  const count = results.reduce((acc, val) => acc + val, 0);
  console.log(`[shadcn] Successfully synced ${count} items.`);
}

async function fetchCossItem(itemName) {
  const res = await fetch(`https://coss.com/ui/r/${itemName}.json`);
  if (!res.ok) {
    return null;
  }
  return res.json();
}

async function syncCoss() {
  console.log("==> Syncing coss registry...");
  ensureDir(COSS_DIR);

  const res = await fetch("https://coss.com/ui/r/registry.json");
  if (!res.ok) {
    throw new Error(`Failed to fetch coss catalog: ${res.status}`);
  }
  const catalog = await res.json();
  fs.writeFileSync(
    path.join(COSS_DIR, "registry.json"),
    JSON.stringify(catalog, null, 2),
    "utf8"
  );

  const coreItems = catalog.items.filter(
    (i) =>
      ["registry:ui", "registry:lib", "registry:hook"].includes(i.type) &&
      i.name !== "ui" &&
      i.name !== "fonts"
  );

  const results = await Promise.all(
    coreItems.map(async (item) => {
      const data = await fetchCossItem(item.name);
      if (data?.files?.length) {
        saveItemFiles(COSS_DIR, data.files, item.type);
        return 1;
      }
      return 0;
    })
  );

  const count = results.reduce((acc, val) => acc + val, 0);
  console.log(`[coss] Successfully synced ${count} items.`);
}

async function main() {
  console.log("Starting reference registries sync...");
  await syncShadcn();
  await syncCoss();
  console.log("==> All reference registries are up to date!");
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
