// Complete migration script from Firebase to Supabase
// This script will update all files to use Supabase instead of Firebase

const fs = require('fs');
const path = require('path');

// Files to update
const filesToUpdate = {
    // JavaScript files that need Firebase references replaced
    jsFiles: [
        'firebase-config.js',
        'js/firebase-init.js',
        'js/auth-utils.js',
        'js/utils.js',
        'components/header.js'
    ],
    
    // HTML files that need Firebase SDK references replaced
    htmlFiles: [
        'index.html',
        'index-modular.html',
        'data-check.html',
        'create-test-data.html',
        'test-validation.html',
        'partner-jobs.html',
        'partner-job-completion.html',
        'partners-modular.html',
        'partners-new.html',
        'business/index.html',
        'business/index-new.html',
        'business/index-modular.html',
        'business/jobs.html',
        'business/job-list.html',
        'business/job-request.html',
        'business/job-status.html',
        'business/job-completion-review.html',
        'business/direct-spaces.html',
        'business/space-registration.html',
        'education/index.html',
        'partners/jobs.html'
    ]
};

// Replacement patterns
const replacements = {
    // HTML replacements - Firebase SDK to Supabase SDK
    htmlReplacements: [
        {
            from: /<script src="https:\/\/www\.gstatic\.com\/firebasejs\/[^"]+\/firebase-app-compat\.js"><\/script>/g,
            to: '<!-- Supabase SDK -->\n    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>'
        },
        {
            from: /<script src="https:\/\/www\.gstatic\.com\/firebasejs\/[^"]+\/firebase-auth-compat\.js"><\/script>/g,
            to: ''
        },
        {
            from: /<script src="https:\/\/www\.gstatic\.com\/firebasejs\/[^"]+\/firebase-firestore-compat\.js"><\/script>/g,
            to: ''
        },
        {
            from: /<script src="https:\/\/www\.gstatic\.com\/firebasejs\/[^"]+\/firebase-storage-compat\.js"><\/script>/g,
            to: ''
        },
        {
            from: /<script src="(\.\.\/)*firebase-config\.js"><\/script>/g,
            to: '<script src="$1supabase-config.js"></script>'
        },
        {
            from: /<!-- Firebase SDK -->\s*\n/g,
            to: ''
        },
        {
            from: /<!-- Firebase 설정 -->\s*\n/g,
            to: '<!-- Supabase 설정 -->\n'
        },
        {
            from: /<!-- Firebase 설정 및 스크립트 -->\s*\n/g,
            to: '<!-- Supabase 설정 및 스크립트 -->\n'
        }
    ],
    
    // JavaScript replacements
    jsReplacements: [
        // Firebase auth methods
        {
            from: /firebase\.auth\(\)/g,
            to: 'auth'
        },
        {
            from: /firebase\.firestore\(\)/g,
            to: 'db'
        },
        {
            from: /firebase\.storage\(\)/g,
            to: 'storage'
        },
        {
            from: /firebase\.initializeApp\(/g,
            to: '// Supabase is initialized in supabase-config.js\n    // firebase.initializeApp('
        },
        {
            from: /firebase\.firestore\.FieldValue\.serverTimestamp\(\)/g,
            to: 'new Date().toISOString()'
        },
        {
            from: /FirebaseError/g,
            to: 'Error'
        },
        {
            from: /auth\.createUserWithEmailAndPassword/g,
            to: 'auth.createUserWithEmailAndPassword'
        },
        {
            from: /auth\.signInWithEmailAndPassword/g,
            to: 'auth.signInWithEmailAndPassword'
        },
        {
            from: /auth\.onAuthStateChanged/g,
            to: 'auth.onAuthStateChanged'
        },
        {
            from: /db\.collection\(/g,
            to: 'db.collection('
        },
        {
            from: /storage\.ref\(/g,
            to: 'storage.ref('
        }
    ]
};

// Function to update a file
function updateFile(filePath, replacements) {
    try {
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

// Main migration function
function migrateToSupabase() {
    console.log('🚀 Starting Firebase to Supabase migration...\n');
    
    // Update HTML files
    console.log('📄 Updating HTML files...');
    filesToUpdate.htmlFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        updateFile(filePath, replacements.htmlReplacements);
    });
    
    // Update JavaScript files
    console.log('\n📜 Updating JavaScript files...');
    filesToUpdate.jsFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        updateFile(filePath, replacements.jsReplacements);
    });
    
    // Rename firebase-config.js to firebase-config.old.js if it exists
    const firebaseConfigPath = path.join(__dirname, 'firebase-config.js');
    const firebaseConfigOldPath = path.join(__dirname, 'firebase-config.old.js');
    if (fs.existsSync(firebaseConfigPath) && !fs.existsSync(firebaseConfigOldPath)) {
        fs.renameSync(firebaseConfigPath, firebaseConfigOldPath);
        console.log('\n📁 Renamed firebase-config.js to firebase-config.old.js');
    }
    
    // Create a new firebase-config.js that redirects to supabase-config.js
    const redirectContent = `// This file has been migrated to Supabase
// Please use supabase-config.js instead

// Import Supabase configuration
const script = document.createElement('script');
script.src = 'supabase-config.js';
document.head.appendChild(script);

console.warn('firebase-config.js is deprecated. Please update your imports to use supabase-config.js directly.');
`;
    
    fs.writeFileSync(firebaseConfigPath, redirectContent, 'utf8');
    console.log('✅ Created firebase-config.js redirect file');
    
    console.log('\n✨ Migration complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Test all pages to ensure they work with Supabase');
    console.log('2. Update any inline JavaScript in HTML files that uses Firebase');
    console.log('3. Remove firebase-config.old.js once everything is working');
    console.log('4. Update any server-side code to use Supabase');
}

// Run migration
migrateToSupabase();