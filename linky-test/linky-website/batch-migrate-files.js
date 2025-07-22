// Batch migration script for remaining HTML files
const fs = require('fs');
const path = require('path');

// List of remaining files to migrate
const remainingFiles = [
    'partners/earnings.html',
    'partners/job-detail.html',
    'partners/dashboard.html',
    'partners-new.html',
    'business/index-new.html',
    'partner-jobs.html',
    'business/job-completion-review.html',
    'partner-job-completion.html',
    'index-modular.html',
    'test-validation.html',
    'business/index-modular.html',
    'partners-modular.html',
    'business/job-status.html',
    'admin/index.html',
    'create-test-data.html',
    'business/job-detail.html',
    'facility/index.html',
    'education/index.html',
    'business/direct-spaces.html',
    'data-check.html'
];

// Firebase patterns to replace
const firebasePatterns = [
    {
        // Standard Firebase SDK with storage
        pattern: /    <!-- Firebase SDK -->\n    <script src="https:\/\/www\.gstatic\.com\/firebasejs\/9\.22\.1\/firebase-app-compat\.js"><\/script>\n    <script src="https:\/\/www\.gstatic\.com\/firebasejs\/9\.22\.1\/firebase-auth-compat\.js"><\/script>\n    <script src="https:\/\/www\.gstatic\.com\/firebasejs\/9\.22\.1\/firebase-firestore-compat\.js"><\/script>\n    <script src="https:\/\/www\.gstatic\.com\/firebasejs\/9\.22\.1\/firebase-storage-compat\.js"><\/script>\n    \n    <!-- Firebase 설정 -->\n    <script src="(\.\.\/)*firebase-config\.js"><\/script>/g,
        replacement: (match, relativePath) => {
            const prefix = relativePath || '';
            return `    <!-- Supabase SDK -->\n    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n    \n    <!-- Supabase 설정 -->\n    <script src="${prefix}supabase-config.js"></script>`;
        }
    },
    {
        // Standard Firebase SDK without storage
        pattern: /    <!-- Firebase SDK -->\n    <script src="https:\/\/www\.gstatic\.com\/firebasejs\/9\.22\.1\/firebase-app-compat\.js"><\/script>\n    <script src="https:\/\/www\.gstatic\.com\/firebasejs\/9\.22\.1\/firebase-auth-compat\.js"><\/script>\n    <script src="https:\/\/www\.gstatic\.com\/firebasejs\/9\.22\.1\/firebase-firestore-compat\.js"><\/script>\n    \n    <!-- Firebase 설정 -->\n    <script src="(\.\.\/)*firebase-config\.js"><\/script>/g,
        replacement: (match, relativePath) => {
            const prefix = relativePath || '';
            return `    <!-- Supabase SDK -->\n    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n    \n    <!-- Supabase 설정 -->\n    <script src="${prefix}supabase-config.js"></script>`;
        }
    },
    {
        // Alternative Firebase SDK format (no spacing between scripts)
        pattern: /    <!-- Firebase SDK -->\n    <script src="https:\/\/www\.gstatic\.com\/firebasejs\/9\.22\.1\/firebase-app-compat\.js"><\/script>\n    <script src="https:\/\/www\.gstatic\.com\/firebasejs\/9\.22\.1\/firebase-auth-compat\.js"><\/script>\n    <script src="https:\/\/www\.gstatic\.com\/firebasejs\/9\.22\.1\/firebase-firestore-compat\.js"><\/script>\n    \n    <script src="(\.\.\/)*firebase-config\.js"><\/script>/g,
        replacement: (match, relativePath) => {
            const prefix = relativePath || '';
            return `    <!-- Supabase SDK -->\n    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n    \n    <script src="${prefix}supabase-config.js"></script>`;
        }
    }
];

// Process a single file
function processFile(filePath) {
    const fullPath = path.join(__dirname, filePath);
    
    try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        
        // Apply all patterns
        firebasePatterns.forEach(({ pattern, replacement }) => {
            if (pattern.test(content)) {
                content = content.replace(pattern, replacement);
                modified = true;
            }
        });
        
        // Additional replacements
        if (content.includes('<!-- Firebase 설정 및 스크립트 -->')) {
            content = content.replace(/<!-- Firebase 설정 및 스크립트 -->/g, '<!-- Supabase 설정 및 스크립트 -->');
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✓ ${filePath} - migrated successfully`);
            return true;
        } else {
            console.log(`- ${filePath} - no changes needed`);
            return false;
        }
    } catch (error) {
        console.error(`✗ ${filePath} - error: ${error.message}`);
        return false;
    }
}

// Run migration
console.log('Starting batch migration...\n');
let successCount = 0;
let errorCount = 0;

remainingFiles.forEach(file => {
    if (processFile(file)) {
        successCount++;
    } else {
        errorCount++;
    }
});

console.log(`\nBatch migration complete:`);
console.log(`- Successfully migrated: ${successCount} files`);
console.log(`- Errors or no changes: ${errorCount} files`);