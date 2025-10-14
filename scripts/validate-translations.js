#!/usr/bin/env node
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const enPath = join(__dirname, '../src/i18n/en.json');
const esPath = join(__dirname, '../src/i18n/es.json');

function getKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      keys.push(fullKey);
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...getKeys(value, fullKey));
    }
  }
  return keys;
}

try {
  const enContent = JSON.parse(readFileSync(enPath, 'utf-8'));
  const esContent = JSON.parse(readFileSync(esPath, 'utf-8'));

  const enKeys = new Set(getKeys(enContent));
  const esKeys = new Set(getKeys(esContent));

  const missingInEs = [...enKeys].filter((k) => !esKeys.has(k));
  const missingInEn = [...esKeys].filter((k) => !enKeys.has(k));

  let hasErrors = false;

  if (missingInEs.length > 0) {
    console.error('❌ Missing in Spanish (es.json):');
    missingInEs.forEach((k) => console.error(`   - ${k}`));
    hasErrors = true;
  }

  if (missingInEn.length > 0) {
    console.error('❌ Missing in English (en.json):');
    missingInEn.forEach((k) => console.error(`   - ${k}`));
    hasErrors = true;
  }

  if (hasErrors) {
    console.error('\n❌ Translation validation failed!');
    process.exit(1);
  }

  console.log(`✅ All translations valid! (${enKeys.size} keys in each language)`);
} catch (error) {
  console.error('❌ Error validating translations:', error.message);
  process.exit(1);
}
