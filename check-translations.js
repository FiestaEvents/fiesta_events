import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load translation files
const enPath = path.join(__dirname, 'src/i18n/locales/en/translation.json');
const frPath = path.join(__dirname, 'src/i18n/locales/fr/translation.json');
const arPath = path.join(__dirname, 'src/i18n/locales/ar/translation.json');

const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const frTranslations = JSON.parse(fs.readFileSync(frPath, 'utf8'));
const arTranslations = JSON.parse(fs.readFileSync(arPath, 'utf8'));

// Function to check if a nested key exists
function hasKey(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return false;
    }
  }
  
  return true;
}

// Function to recursively find files
function findFiles(dir, extension, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, extension, fileList);
    } else if (path.extname(file) === extension) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Extract keys from source files
console.log('Extracting translation keys from source files...');
const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir, '.jsx').concat(findFiles(srcDir, '.js'));
const usedKeys = new Set();
const regex = /t\(['"]([^'"]+)['"]\)/g;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    if (key && !key.includes('${') && !key.includes(' ') && key.includes('.')) {
       usedKeys.add(key);
    }
  }
});

const sortedKeys = Array.from(usedKeys).sort();
console.log(`Total unique keys found: ${sortedKeys.length}\n`);

const missingEn = [];
const missingFr = [];
const missingAr = [];

sortedKeys.forEach(key => {
  if (!hasKey(enTranslations, key)) missingEn.push(key);
  if (!hasKey(frTranslations, key)) missingFr.push(key);
  if (!hasKey(arTranslations, key)) missingAr.push(key);
});

console.log('=== MISSING KEYS REPORT ===\n');
console.log(`English (en): ${missingEn.length} missing keys`);
if (missingEn.length > 0 && missingEn.length <= 50) {
  console.log(missingEn.join('\n'));
}

console.log(`\nFrench (fr): ${missingFr.length} missing keys`);
if (missingFr.length > 0 && missingFr.length <= 50) {
  console.log(missingFr.join('\n'));
}

console.log(`\nArabic (ar): ${missingAr.length} missing keys`);
if (missingAr.length > 0 && missingAr.length <= 50) {
  console.log(missingAr.join('\n'));
}

// Save detailed report
const report = {
  totalKeysChecked: sortedKeys.length,
  missingInEnglish: missingEn,
  missingInFrench: missingFr,
  missingInArabic: missingAr
};

fs.writeFileSync(
  process.env.TEMP + '\\missing_keys_report.json',
  JSON.stringify(report, null, 2)
);

console.log(`\nDetailed report saved to: ${process.env.TEMP}\\missing_keys_report.json`);
