// Final cleanup script for remaining Firebase references
const fs = require('fs');
const path = require('path');

// Files to update
const filesToUpdate = [
    'check-scripts.html',
    'create-test-data.html',
    'data-check.html',
    'education/index.html',
    'facility/index.html',
    'business/job-detail.html',
    'business/job-request.html'
];

// Specific replacements for remaining issues
const replacements = [
    // typeof checks
    {
        from: /typeof firebase === 'undefined'/g,
        to: "typeof window.supabaseClient === 'undefined'"
    },
    {
        from: /typeof firebase !== 'undefined'/g,
        to: "typeof window.supabaseClient !== 'undefined'"
    },
    {
        from: /typeof firebase/g,
        to: "typeof window.supabaseClient"
    },
    // Firebase console URL
    {
        from: /https:\/\/console\.firebase\.google\.com\/project\/\$\{[^}]+\}\.projectId\}\/firestore/g,
        to: "https://supabase.com/dashboard/project/mzihuflrbspvyjknxlad"
    },
    // Firebase Firestore FieldValue
    {
        from: /firebase\.firestore\?\.FieldValue\?\.serverTimestamp\(\)/g,
        to: "new Date().toISOString()"
    },
    {
        from: /firebase\.firestore\.FieldValue\.serverTimestamp\(\)/g,
        to: "new Date().toISOString()"
    },
    // Firebase auth and firestore checks
    {
        from: /firebase\.auth && firebase\.firestore/g,
        to: "window.auth && window.db"
    },
    // Firebase config references
    {
        from: /typeof firebaseConfig/g,
        to: "typeof window.supabaseClient"
    },
    // Firebase app initialization comments
    {
        from: /\/\/ firebase\.initializeApp/g,
        to: "// Supabase is initialized automatically"
    }
];

// Function to update file
function updateFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        replacements.forEach(({ from, to }) => {
            if (content.match(from)) {
                content = content.replace(from, to);
                updated = true;
            }
        });
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filePath}`);
        } else {
            console.log(`⏭️  No changes needed: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

// Main function
function finalCleanup() {
    console.log('🧹 Starting final Firebase cleanup...\n');
    
    filesToUpdate.forEach(file => {
        const filePath = path.join(__dirname, file);
        updateFile(filePath);
    });
    
    // Also update the firebase-config.old.js to prevent any accidental usage
    const firebaseOldPath = path.join(__dirname, 'firebase-config.old.js');
    if (fs.existsSync(firebaseOldPath)) {
        // Add a warning at the top of the file
        let oldContent = fs.readFileSync(firebaseOldPath, 'utf8');
        const warning = `// ⚠️ WARNING: This file is deprecated and should not be used!
// This is the old Firebase configuration that has been migrated to Supabase.
// Please use supabase-config.js instead.
// DO NOT USE THIS FILE IN PRODUCTION!

`;
        if (!oldContent.startsWith('// ⚠️ WARNING:')) {
            fs.writeFileSync(firebaseOldPath, warning + oldContent, 'utf8');
            console.log('✅ Added warning to firebase-config.old.js');
        }
    }
    
    console.log('\n✨ Final cleanup complete!');
    console.log('\n📋 Summary of changes:');
    console.log('1. Replaced all remaining typeof firebase checks');
    console.log('2. Updated Firebase console URLs to Supabase dashboard');
    console.log('3. Replaced Firebase FieldValue.serverTimestamp() with ISO strings');
    console.log('4. Fixed remaining Firebase auth and firestore references');
    console.log('\n🎯 Next steps:');
    console.log('1. Test all pages thoroughly');
    console.log('2. Verify authentication flows work correctly');
    console.log('3. Check that data operations (read/write) function properly');
    console.log('4. Remove firebase-config.old.js once everything is confirmed working');
}

// Run cleanup
finalCleanup();