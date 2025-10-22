/**
 * Preserve Deploy Files Script
 *
 * This script backs up critical files from the deploy/ directory before the build
 * and restores them after, preventing Vite from deleting them.
 *
 * Files preserved:
 * - .gitignore - Git configuration for the deploy repo
 * - .last-deploy - Tracks the last deployed slurm-spa commit hash
 * - CNAME - GitHub Pages custom domain configuration
 * - robots.txt - SEO crawler instructions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deployPath = path.join(__dirname, '../deploy');
const backupPath = path.join(__dirname, '../.deploy-backup');

// Files to preserve during build
const filesToPreserve = [
    '.gitignore',
    '.last-deploy',
    'CNAME',
    'robots.txt'
];

const mode = process.argv[2]; // 'backup' or 'restore'

if (mode === 'backup') {
    console.log('💾 Backing up deploy files...\n');

    // Create backup directory
    if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
    }

    // Backup each file
    filesToPreserve.forEach(file => {
        const sourcePath = path.join(deployPath, file);
        const destPath = path.join(backupPath, file);

        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`✓ Backed up: ${file}`);
        } else {
            console.log(`⚠ Skipped (not found): ${file}`);
        }
    });

    console.log('\n✅ Backup complete!\n');

} else if (mode === 'restore') {
    console.log('\n📂 Restoring deploy files...\n');

    // Restore each file
    filesToPreserve.forEach(file => {
        const sourcePath = path.join(backupPath, file);
        const destPath = path.join(deployPath, file);

        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`✓ Restored: ${file}`);
        } else {
            console.log(`⚠ Skipped (no backup): ${file}`);
        }
    });

    // Clean up backup directory
    if (fs.existsSync(backupPath)) {
        fs.rmSync(backupPath, { recursive: true });
    }

    console.log('\n✅ Restore complete!\n');

} else {
    console.error('Usage: node preserve-deploy-files.js [backup|restore]');
    process.exit(1);
}
