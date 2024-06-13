const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Modify the paths for main and module
packageJson.main = 'main.js';
packageJson.module = 'module.js';

const distFolderPath = path.resolve(__dirname, '../dist');
const distPackageJsonPath = path.join(distFolderPath, 'package.json');

if (!fs.existsSync(distFolderPath)) {
  console.log(`Creating directory: ${distFolderPath}`);
  fs.mkdirSync(distFolderPath, { recursive: true });
}

// Write the modified package.json to the dist folder
try {
  fs.writeFileSync(distPackageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`package.json has been copied and modified at ${distPackageJsonPath}`);
} catch (error) {
  console.error(`Error writing package.json to ${distPackageJsonPath}:`, error);
}
