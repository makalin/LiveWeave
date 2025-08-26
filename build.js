const fs = require('fs');
const path = require('path');

async function build() {
  try {
    console.log('Building LiveWeave...');
    
    // Read the main source file
    const sourceCode = fs.readFileSync('liveweave.js', 'utf8');
    
    // Simple minification (remove comments and extra whitespace)
    const minified = sourceCode
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*([{}:;,=><+\-*/])\s*/g, '$1') // Remove spaces around operators
      .trim();
    
    // Write minified file
    fs.writeFileSync('liveweave.min.js', minified);
    console.log('✓ Created liveweave.min.js');
    
    console.log('Build completed successfully!');
    
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

build();
