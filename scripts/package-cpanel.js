const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

async function main() {
console.log('🚀 Starting cPanel deployment package creation...');

// Paths
const outDir = path.join(__dirname, '..', 'out');
const deployDir = path.join(__dirname, '..', 'cpanel-deploy');

// Clean and create deploy directory
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir, { recursive: true });

// Check if out directory exists
if (!fs.existsSync(outDir)) {
  console.error('❌ Build output directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Copy all files from out directory to deploy directory
console.log('📁 Copying build files...');
copyDirectory(outDir, deployDir);

// Create deployment instructions
const instructions = `
# cPanel Deployment Instructions

## Files to Upload
Upload all files from the 'cpanel-deploy' directory to your cPanel public_html directory.

## Steps:
1. Access your cPanel File Manager
2. Navigate to public_html directory
3. Upload all files from the 'cpanel-deploy' folder
4. Extract if uploaded as a zip file
5. Ensure all files are in the root of public_html (not in a subdirectory)

## Important Files:
- index.html (main entry point)
- _next/ (Next.js static assets)
- All other HTML files for routing

## Notes:
- This is a static export, no server-side functionality required
- All Web3 functionality runs client-side
- Make sure your domain supports HTTPS for Web3 wallet connections

## File Structure in public_html:
public_html/
├── index.html
├── _next/
│   ├── static/
│   └── ...
├── favicon.ico
└── other static files...
`;

fs.writeFileSync(path.join(deployDir, 'DEPLOYMENT_INSTRUCTIONS.txt'), instructions);

// Create a simple deployment info file
const deployInfo = {
  buildDate: new Date().toISOString(),
  buildType: 'static-export',
  targetPlatform: 'cPanel',
  files: getFileList(deployDir),
  totalFiles: getFileCount(deployDir)
};

fs.writeFileSync(path.join(deployDir, 'deployment-info.json'), JSON.stringify(deployInfo, null, 2));

// Create ZIP file for easy upload
console.log('📦 Creating ZIP file for easy upload...');
await createZipFile(deployDir);

console.log('✅ cPanel deployment package created successfully!');
console.log(`📦 Files ready in: ${deployDir}`);
console.log(`📄 Total files: ${deployInfo.totalFiles}`);
console.log('🗜️ ZIP file created: cpanel-deploy.zip');
console.log('📋 Check DEPLOYMENT_INSTRUCTIONS.txt for upload instructions');

// Helper functions
function copyDirectory(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getFileList(dir, fileList = [], basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      getFileList(fullPath, fileList, relativePath);
    } else {
      fileList.push(relativePath);
    }
  }

  return fileList;
}

function getFileCount(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += getFileCount(path.join(dir, entry.name));
    } else {
      count++;
    }
  }

  return count;
}

// Create ZIP file function
function createZipFile(sourceDir) {
  return new Promise((resolve, reject) => {
    const zipPath = path.join(__dirname, '..', 'cpanel-deploy.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`📦 ZIP file created: ${archive.pointer()} total bytes`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}
}

// Run the main function
main().catch(console.error);
