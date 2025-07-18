// Script to update inline Firebase references in HTML files
const fs = require('fs');
const path = require('path');

// HTML files that contain inline JavaScript
const htmlFiles = [
    'create-test-data.html',
    'data-check.html',
    'admin/index.html',
    'business/billing.html',
    'business/dashboard.html',
    'business/direct-spaces.html',
    'business/job-completion-review.html',
    'business/job-list.html',
    'business/job-request.html',
    'business/job-status.html',
    'business/jobs.html',
    'business/space-registration.html',
    'education/index.html',
    'partner-job-completion.html',
    'partner-jobs.html',
    'partners/jobs.html',
    'test-validation.html'
];

// Replacement patterns for inline JavaScript
const replacements = [
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
    // Firebase FieldValue
    {
        from: /firebase\.firestore\.FieldValue\.serverTimestamp\(\)/g,
        to: 'new Date().toISOString()'
    },
    // Firebase app
    {
        from: /firebase\.apps/g,
        to: '(window.supabaseClient ? [window.supabaseClient] : [])'
    },
    {
        from: /firebase\.app\(\)\.options/g,
        to: '{ projectId: "linkykorea-supabase", name: "Linky Platform" }'
    },
    // Collection operations
    {
        from: /db\.collection\(/g,
        to: 'db.collection('
    },
    // Auth operations
    {
        from: /auth\.createUserWithEmailAndPassword/g,
        to: 'auth.createUserWithEmailAndPassword'
    },
    {
        from: /auth\.signInWithEmailAndPassword/g,
        to: 'auth.signInWithEmailAndPassword'
    },
    {
        from: /auth\.signOut/g,
        to: 'auth.signOut'
    },
    {
        from: /auth\.onAuthStateChanged/g,
        to: 'auth.onAuthStateChanged'
    },
    // Storage operations
    {
        from: /storage\.ref\(/g,
        to: 'storage.ref('
    }
];

// Function to update inline JavaScript in HTML files
function updateInlineJavaScript(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Apply replacements
        replacements.forEach(({ from, to }) => {
            if (content.match(from)) {
                content = content.replace(from, to);
                updated = true;
            }
        });
        
        // Additional specific updates for certain patterns
        // Update typeof firebase checks
        content = content.replace(
            /typeof firebase !== 'undefined'/g,
            "typeof window.supabaseClient !== 'undefined'"
        );
        
        // Update Firebase initialization checks
        content = content.replace(
            /if \(typeof firebase !== 'undefined' && firebase\.apps\.length > 0\)/g,
            "if (typeof window.supabaseClient !== 'undefined')"
        );
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated inline JavaScript in: ${filePath}`);
        } else {
            console.log(`⏭️  No inline JavaScript changes needed: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

// Main function
function updateAllInlineFirebase() {
    console.log('🚀 Starting inline Firebase to Supabase updates...\n');
    
    htmlFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            updateInlineJavaScript(filePath);
        } else {
            console.log(`⚠️  File not found: ${filePath}`);
        }
    });
    
    console.log('\n✨ Inline JavaScript update complete!');
    console.log('\n📋 Important notes:');
    console.log('1. Some Firebase-specific features may need manual adjustment');
    console.log('2. Test all functionality to ensure proper migration');
    console.log('3. Update any Firebase console URLs to Supabase dashboard URLs');
}

// Run the update
updateAllInlineFirebase();