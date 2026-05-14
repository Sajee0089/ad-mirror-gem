#!/usr/bin/env node
/**
 * Meta Tag Validator - Validates SEO meta tags against strict rules
 * 
 * Rules enforced:
 * - Title: 65 chars max, unique per route
 * - Description: 120-155 chars
 * - OG URL must match Canonical URL exactly
 * 
 * Usage: node scripts/validate-meta-tags.mjs <route-pattern>
 * Example: node scripts/validate-meta-tags.mjs "src/pages/*.tsx"
 */

import { readFileSync, readdirSync } from "node:fs";
import { resolve, extname } from "node:path";
import { glob } from "glob";

const MAX_TITLE_LENGTH = 65;
const MIN_DESC_LENGTH = 120;
const MAX_DESC_LENGTH = 155;

const extractMetaTags = (content) => {
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/);
  const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/);
  const ogUrlMatch = content.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/);
  const canonicalMatch = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/);

  return {
    title: titleMatch ? titleMatch[1] : null,
    description: descMatch ? descMatch[1] : null,
    ogUrl: ogUrlMatch ? ogUrlMatch[1] : null,
    canonical: canonicalMatch ? canonicalMatch[1] : null,
  };
};

const validate = async (pattern) => {
  const files = await glob(pattern);
  const errors = [];
  const warnings = [];
  const seen = new Set();

  files.forEach((file) => {
    try {
      const content = readFileSync(file, "utf-8");
      const tags = extractMetaTags(content);

      if (!tags.title) {
        errors.push(`[${file}] Missing <title> tag`);
        return;
      }

      if (tags.title.length > MAX_TITLE_LENGTH) {
        errors.push(`[${file}] Title exceeds ${MAX_TITLE_LENGTH} chars (${tags.title.length}): "${tags.title}"`);
      }

      if (seen.has(tags.title)) {
        errors.push(`[${file}] Duplicate title: "${tags.title}"`);
      }
      seen.add(tags.title);

      if (!tags.description) {
        warnings.push(`[${file}] Missing description`);
      } else if (tags.description.length < MIN_DESC_LENGTH || tags.description.length > MAX_DESC_LENGTH) {
        errors.push(`[${file}] Description must be ${MIN_DESC_LENGTH}-${MAX_DESC_LENGTH} chars (${tags.description.length}): "${tags.description}"`);
      }

      if (tags.canonical && tags.ogUrl && tags.canonical !== tags.ogUrl) {
        errors.push(`[${file}] OG URL mismatch:\n  Canonical: ${tags.canonical}\n  OG URL: ${tags.ogUrl}`);
      }
    } catch (e) {
      errors.push(`[${file}] Parse error: ${e.message}`);
    }
  });

  console.log(`\n📊 Meta Tag Validation Report\n`);
  console.log(`✓ Scanned ${files.length} files\n`);

  if (errors.length > 0) {
    console.log(`❌ ERRORS (${errors.length}):`);
    errors.forEach((e) => console.log(`  - ${e}`));
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach((w) => console.log(`  - ${w}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`✅ All meta tags validated successfully!\n`);
  }

  process.exit(errors.length > 0 ? 1 : 0);
};

const pattern = process.argv[2] || "src/pages/*.tsx";
validate(pattern);
