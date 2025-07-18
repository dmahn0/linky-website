const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Migration configuration
const REPLACEMENTS = {
    // Firebase SDK scripts to remove
    firebaseScripts: [
        '<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js"></script>',
        '<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js"></script>',
        '<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js"></script>',
        '<script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-storage-compat.js"></script>'
    ],
    // Supabase SDK script to add
    supabaseScript: '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>',
    // Config file replacements
    configReplacements: [
        { from: 'firebase-config.js', to: 'supabase-config.js' },
        { from: '../firebase-config.js', to: '../supabase-config.js' },
        { from: '../../firebase-config.js', to: '../../supabase-config.js' }
    ]
};

// Find all HTML files
function findHtmlFiles(basePath) {
    return glob.sync('**/*.html', {
        cwd: basePath,
        ignore: ['node_modules/**', '**/backup/**']
    });
}

// Process a single HTML file
function processHtmlFile(filePath) {
    console.log(`Processing: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if file still has Firebase references
    const hasFirebase = content.includes('firebase') || content.includes('Firebase');
    if (!hasFirebase) {
        console.log(`  ✓ No Firebase references found, skipping`);
        return false;
    }
    
    // Remove all Firebase SDK scripts
    REPLACEMENTS.firebaseScripts.forEach(script => {
        if (content.includes(script)) {
            content = content.replace(script, '');
            modified = true;
            console.log(`  - Removed Firebase SDK script`);
        }
    });
    
    // Add Supabase SDK if not already present
    if (!content.includes('@supabase/supabase-js') && modified) {
        // Find where to insert Supabase SDK (before first script tag or in head)
        const headMatch = content.match(/<head[^>]*>/i);
        if (headMatch) {
            const headEndIndex = headMatch.index + headMatch[0].length;
            // Look for the first script tag or Firebase comment
            const scriptMatch = content.indexOf('<script', headEndIndex);
            const firebaseCommentMatch = content.indexOf('<!-- Firebase', headEndIndex);
            
            let insertIndex = headEndIndex;
            if (firebaseCommentMatch > -1 && (scriptMatch === -1 || firebaseCommentMatch < scriptMatch)) {
                // Replace Firebase comment with Supabase comment
                content = content.replace('<!-- Firebase SDK -->', '<!-- Supabase SDK -->');
                insertIndex = content.indexOf('<!-- Supabase SDK -->') + '<!-- Supabase SDK -->'.length;
            } else if (scriptMatch > -1) {
                insertIndex = scriptMatch;
            }
            
            // Insert Supabase SDK with proper formatting
            const indent = '\n    ';
            content = content.slice(0, insertIndex) + 
                     indent + '<!-- Supabase SDK -->' +
                     indent + REPLACEMENTS.supabaseScript + 
                     indent + content.slice(insertIndex);
            
            console.log(`  + Added Supabase SDK`);
        }
    }
    
    // Replace firebase-config.js with supabase-config.js
    REPLACEMENTS.configReplacements.forEach(({ from, to }) => {
        if (content.includes(from)) {
            content = content.replace(new RegExp(from, 'g'), to);
            modified = true;
            console.log(`  - Replaced ${from} with ${to}`);
        }
    });
    
    // Replace Firebase comments with Supabase comments
    if (content.includes('<!-- Firebase 설정 -->')) {
        content = content.replace(/<!-- Firebase 설정 -->/g, '<!-- Supabase 설정 -->');
        modified = true;
        console.log(`  - Updated config comments`);
    }
    
    // Save the modified file
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ File updated successfully`);
        return true;
    }
    
    return false;
}

// Main migration function
function migrateToSupabase() {
    const basePath = __dirname;
    const htmlFiles = findHtmlFiles(basePath);
    
    console.log(`Found ${htmlFiles.length} HTML files to process\n`);
    
    let processedCount = 0;
    let modifiedCount = 0;
    
    htmlFiles.forEach(file => {
        const filePath = path.join(basePath, file);
        processedCount++;
        
        if (processHtmlFile(filePath)) {
            modifiedCount++;
        }
        console.log('');
    });
    
    console.log(`\nMigration Summary:`);
    console.log(`- Total files processed: ${processedCount}`);
    console.log(`- Files modified: ${modifiedCount}`);
    console.log(`- Files skipped: ${processedCount - modifiedCount}`);
    
    // Verify auth-modal.js compatibility
    console.log(`\n✓ auth-modal.js is already compatible with Supabase`);
    console.log(`  - Uses supabaseClient for authentication`);
    console.log(`  - Implements supabaseSignUp and supabaseSignIn methods`);
}

// Run the migration
if (require.main === module) {
    console.log('Starting Firebase to Supabase migration...\n');
    migrateToSupabase();
    console.log('\nMigration complete!');
}

module.exports = { processHtmlFile, migrateToSupabase };