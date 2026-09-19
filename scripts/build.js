#!/usr/bin/env node
// Scans images/<album>/*.{jpg,jpeg,png,webp,gif} and writes data/albums.json.
// Each album folder may have a thumbs/ subfolder with same-named smaller
// previews (falls back to the full image when a thumb is missing).
// Usage: node scripts/build.js

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "images");
const OUT_FILE = path.join(ROOT, "data", "albums.json");
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function readMeta(albumDir) {
  const metaFile = path.join(albumDir, "album.json");
  if (fs.existsSync(metaFile)) {
    try {
      return JSON.parse(fs.readFileSync(metaFile, "utf8"));
    } catch (e) {
      console.warn(`  aviso: ${metaFile} invalido, ignorando (${e.message})`);
    }
  }
  return {};
}

function titleize(slug) {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildAlbum(slug) {
  const albumDir = path.join(IMAGES_DIR, slug);
  const thumbsDir = path.join(albumDir, "thumbs");
  const meta = readMeta(albumDir);

  const files = fs
    .readdirSync(albumDir)
    .filter((f) => EXTS.has(path.extname(f).toLowerCase()))
    .sort();

  const images = files.map((file) => {
    const hasThumb = fs.existsSync(path.join(thumbsDir, file));
    return {
      file: `images/${slug}/${file}`,
      thumb: hasThumb ? `images/${slug}/thumbs/${file}` : `images/${slug}/${file}`,
    };
  });

  return {
    slug,
    title: meta.title || titleize(slug),
    date: meta.date || null,
    description: meta.description || null,
    images,
  };
}

function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error("Pasta images/ nao encontrada.");
    process.exit(1);
  }

  const albumSlugs = fs
    .readdirSync(IMAGES_DIR)
    .filter((name) => fs.statSync(path.join(IMAGES_DIR, name)).isDirectory());

  const albums = albumSlugs.map(buildAlbum).filter((a) => a.images.length > 0);

  albums.sort((a, b) => a.slug.localeCompare(b.slug));

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify({ albums }, null, 2));

  for (const a of albums) {
    console.log(`- ${a.slug}: ${a.images.length} imagens`);
  }
  console.log(`\nOK: ${albums.length} album(ns) escrito(s) em data/albums.json`);
}

main();
