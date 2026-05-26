import esbuild from "esbuild";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "chrome-extension", "trustedbums");
const outputDir = path.join(root, "dist", "chrome-extension", "trustedbums");
const packageDir = path.join(root, "dist", "chrome-extension");
const zipPath = path.join(packageDir, "trustedbums-extension.zip");
const isPackageBuild = process.argv.includes("--zip");
const allowPlaceholders = process.argv.includes("--allow-placeholders");

const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY ||
  process.env.VITE_CLERK_PUBLISHABLE_KEY ||
  process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "";
const clerkFrontendApi = process.env.CLERK_FRONTEND_API || process.env.CLERK_FRONTEND_API_URL || "";
const apiBaseUrl =
  process.env.TRUSTED_BUMS_EXTENSION_API_BASE_URL ||
  "https://vaoqvtxqvbptyxddpoju.supabase.co/functions/v1/extension-api-v1";
const extensionSyncHost =
  process.env.TRUSTED_BUMS_EXTENSION_SYNC_HOST ||
  process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST ||
  "https://trustedbums.com";
const crxPublicKey = process.env.CRX_PUBLIC_KEY || "";

function requireValue(name, value) {
  if (!value || value.includes("YOUR_")) {
    throw new Error(`Missing ${name}. Set it before building the production Chrome extension.`);
  }
}

if (!allowPlaceholders) {
  requireValue("CLERK_PUBLISHABLE_KEY", clerkPublishableKey);
  requireValue("CLERK_FRONTEND_API", clerkFrontendApi);
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const manifest = JSON.parse(await readFile(path.join(sourceDir, "manifest.json"), "utf8"));
manifest.host_permissions = manifest.host_permissions.map((permission) =>
  permission
    .replace("$CLERK_FRONTEND_API", clerkFrontendApi || "https://example.clerk.accounts.dev")
    .replace("$CLERK_SYNC_HOST", extensionSyncHost),
);
if (crxPublicKey) {
  manifest.key = crxPublicKey;
}
await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

for (const fileName of ["popup.html", "popup.css"]) {
  await writeFile(
    path.join(outputDir, fileName),
    await readFile(path.join(sourceDir, fileName), "utf8"),
  );
}

const commonBuildOptions = {
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2022",
  sourcemap: !isPackageBuild,
  define: {
    "process.env.CLERK_PUBLISHABLE_KEY": JSON.stringify(clerkPublishableKey || "pk_test_placeholder"),
    "process.env.TRUSTED_BUMS_EXTENSION_API_BASE_URL": JSON.stringify(apiBaseUrl),
    "process.env.TRUSTED_BUMS_EXTENSION_SYNC_HOST": JSON.stringify(extensionSyncHost),
  },
};

await Promise.all([
  esbuild.build({
    ...commonBuildOptions,
    entryPoints: [path.join(sourceDir, "src", "popup.ts")],
    outfile: path.join(outputDir, "popup.js"),
  }),
  esbuild.build({
    ...commonBuildOptions,
    entryPoints: [path.join(sourceDir, "src", "contentScript.ts")],
    outfile: path.join(outputDir, "contentScript.js"),
  }),
]);

if (isPackageBuild) {
  await writeZip(outputDir, zipPath);
  console.log(`Chrome extension package created: ${path.relative(root, zipPath)}`);
} else {
  console.log(`Chrome extension build created: ${path.relative(root, outputDir)}`);
}

async function listFiles(dir, baseDir = dir) {
  const entries = await readdir(dir);
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const entryStat = await stat(fullPath);
    if (entryStat.isDirectory()) {
      files.push(...await listFiles(fullPath, baseDir));
    } else {
      files.push({
        absolutePath: fullPath,
        relativePath: path.relative(baseDir, fullPath).replace(/\\/g, "/"),
      });
    }
  }
  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

async function writeZip(inputDir, outputPath) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  const files = await listFiles(inputDir);
  const localFileParts = [];
  const centralDirectoryParts = [];
  let offset = 0;

  for (const file of files) {
    const data = await readFile(file.absolutePath);
    const name = Buffer.from(file.relativePath);
    const crc = crc32(data);
    const [dosTime, dosDate] = dosTimestamp(new Date());
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localFileParts.push(localHeader, name, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralDirectoryParts.push(centralHeader, name);

    offset += localHeader.length + name.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralDirectoryParts);
  const localFiles = Buffer.concat(localFileParts);
  const endOfCentralDirectory = Buffer.alloc(22);
  endOfCentralDirectory.writeUInt32LE(0x06054b50, 0);
  endOfCentralDirectory.writeUInt16LE(0, 4);
  endOfCentralDirectory.writeUInt16LE(0, 6);
  endOfCentralDirectory.writeUInt16LE(files.length, 8);
  endOfCentralDirectory.writeUInt16LE(files.length, 10);
  endOfCentralDirectory.writeUInt32LE(centralDirectory.length, 12);
  endOfCentralDirectory.writeUInt32LE(localFiles.length, 16);
  endOfCentralDirectory.writeUInt16LE(0, 20);

  await writeFile(outputPath, Buffer.concat([localFiles, centralDirectory, endOfCentralDirectory]));
}


function dosTimestamp(date) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return [dosTime, dosDate];
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
