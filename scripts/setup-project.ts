import * as fs from 'fs';
import * as path from 'path';

// Define the directory structure
const directories = [
    'reports',
    'reports/screenshots',
    'tests',
    'pages',
    'utils',
    'config',
    'scripts'
];

// Create directories if they don't exist
directories.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
        console.log(`Creating directory: ${dir}`);
        fs.mkdirSync(fullPath, { recursive: true });
    } else {
        console.log(`Directory already exists: ${dir}`);
    }
});

console.log('Project setup complete.');

// If running directly, exit with success
if (require.main === module) {
    process.exit(0);
}

export { directories }; 