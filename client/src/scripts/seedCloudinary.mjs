//client/src/scripts/seedCloudinary.mjs

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ─── Config ───────────────────────────────────────────────────────────────────
// In ES Modules, we must derive __filename and __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This ensures ROOT points to your public directory correctly
const ROOT = path.resolve(__dirname, "../../public/KritiQ");

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "djnkdy0cw",
  api_key: process.env.CLOUDINARY_API_KEY || "751444919194363",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "gA--QpE_Lbzauy5C5fsYZUBdwS8",
  secure: true,
});


// ─── Folders to seed ─────────────────────────────────────────────────────────
// localDir: path relative to public/KritiQ/
// cloudFolder: destination folder in Cloudinary

const SEED_TARGETS = [
  {
    localDir: "MoviePoster",
    cloudFolder: "kritiq/uploads/images/posters",
    tag: "movie-poster",
  },
  {
    localDir: "MusicPoster",
    cloudFolder: "kritiq/uploads/images/posters",
    tag: "music-poster",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFiles(dir) {
  return fs.readdirSync(dir).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext);
  });
}

// Derive a clean public_id from the filename:
// "King Of Boys.jpg" → "king-of-boys"
function toPublicId(filename) {
  return path
    .basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uploadFile(filePath, cloudFolder, tag, publicId) {
  return cloudinary.uploader.upload(filePath, {
    folder: cloudFolder,
    public_id: publicId,
    overwrite: false, // skip if already uploaded
    invalidate: true,
    tags: [tag, "seed"],
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
    // Auto-format and quality handled by your kritiq_uploads preset
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const results = { moviePosters: [], musicPosters: [], errors: [] };

  for (const target of SEED_TARGETS) {
    const dir = path.join(ROOT, target.localDir);

    if (!fs.existsSync(dir)) {
      console.warn(`⚠️  Skipping — directory not found: ${dir}`);
      continue;
    }

    const files = getFiles(dir);
    console.log(
      `\n📂 ${target.localDir} — ${files.length} files → ${target.cloudFolder}`,
    );

    for (const file of files) {
      const filePath = path.join(dir, file);
      const publicId = toPublicId(file);

      process.stdout.write(`   ⬆️  ${file} ... `);

      try {
        const res = await uploadFile(
          filePath,
          target.cloudFolder,
          target.tag,
          publicId,
        );

        const entry = {
          filename: file,
          public_id: res.public_id,
          secure_url: res.secure_url,
          width: res.width,
          height: res.height,
          format: res.format,
          bytes: res.bytes,
          tag: target.tag,
        };

        if (target.tag === "movie-poster") results.moviePosters.push(entry);
        else results.musicPosters.push(entry);

        console.log(`✅ ${res.public_id}`);
      } catch (err) {
        const message = err?.message || String(err);
        console.log(`❌ ${message}`);
        results.errors.push({ file, error: message });
      }
    }
  }

  // ─── Write results ─────────────────────────────────────────────────────────
  const outPath = path.join(__dirname, "seed-results.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

  console.log("\n─────────────────────────────────────────────");
  console.log(`✅ Movie posters uploaded : ${results.moviePosters.length}`);
  console.log(`✅ Music posters uploaded : ${results.musicPosters.length}`);
  console.log(`❌ Errors                 : ${results.errors.length}`);
  console.log(`📄 Results saved to       : scripts/seed-results.json`);
  console.log("─────────────────────────────────────────────\n");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
