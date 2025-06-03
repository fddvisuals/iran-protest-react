const fs = require('fs');
const path = require('path');

// Create public directories
const dirs = ['images', 'documents'];
dirs.forEach(dir => {
  if (!fs.existsSync(`public/${dir}`)) {
    fs.mkdirSync(`public/${dir}`, { recursive: true });
  }
});

// Copy images
const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) {
    console.error(`Source directory does not exist: ${src}`);
    return;
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
};

// Copy assets
if (fs.existsSync('images')) {
  copyDir('images', 'public/images');
}

if (fs.existsSync('documents')) {
  copyDir('documents', 'public/documents');
}

console.log('Assets copied successfully!');
