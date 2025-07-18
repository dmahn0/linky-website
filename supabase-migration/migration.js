// Firebase to Supabase Migration Script
// This script migrates data from Firebase Firestore to Supabase PostgreSQL

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Configuration
const FIREBASE_CONFIG = {
  // Add your Firebase config here
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Use service key for admin access

// Initialize Firebase
const firebaseApp = initializeApp(FIREBASE_CONFIG);
const firestore = getFirestore(firebaseApp);

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration tracking
const migrationStats = {
  users: { total: 0, migrated: 0, failed: 0 },
  spaces: { total: 0, migrated: 0, failed: 0 },
  jobs: { total: 0, migrated: 0, failed: 0 },
  directSpaces: { total: 0, migrated: 0, failed: 0 },
  educationBookings: { total: 0, migrated: 0, failed: 0 },
  facilityApplications: { total: 0, migrated: 0, failed: 0 }
};

// Helper function to convert Firebase timestamp to PostgreSQL timestamp
function convertTimestamp(timestamp) {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  return timestamp;
}

// Helper function to safely convert Firebase data
function safeConvert(data) {
  if (!data) return null;
  if (typeof data !== 'object') return data;
  
  const converted = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && value.toDate) {
      converted[key] = convertTimestamp(value);
    } else if (Array.isArray(value)) {
      converted[key] = value.map(item => safeConvert(item));
    } else if (typeof value === 'object' && value !== null) {
      converted[key] = safeConvert(value);
    } else {
      converted[key] = value;
    }
  }
  return converted;
}

// Migrate Users
async function migrateUsers() {
  console.log('Starting user migration...');
  const usersCollection = collection(firestore, 'users');
  const snapshot = await getDocs(usersCollection);
  
  migrationStats.users.total = snapshot.size;
  
  for (const doc of snapshot.docs) {
    try {
      const firebaseData = doc.data();
      
      // Transform user data for Supabase
      const supabaseUser = {
        id: uuidv4(),
        uid: doc.id, // Keep Firebase UID for reference
        email: firebaseData.email,
        name: firebaseData.name,
        phone: firebaseData.phone,
        profile_photo: firebaseData.profilePhoto,
        type: firebaseData.type,
        status: firebaseData.status || 'pending',
        status_reason: firebaseData.statusReason,
        created_at: convertTimestamp(firebaseData.createdAt),
        updated_at: convertTimestamp(firebaseData.updatedAt),
        last_login_at: convertTimestamp(firebaseData.lastLoginAt),
        deleted_at: convertTimestamp(firebaseData.deletedAt),
        notification_settings: firebaseData.notificationSettings || {
          email: true,
          sms: true,
          push: true,
          marketing: false
        }
      };
      
      // Handle business-specific fields
      if (firebaseData.type === 'business' && firebaseData.business) {
        supabaseUser.business = safeConvert(firebaseData.business);
      }
      
      // Handle partner-specific fields
      if (firebaseData.type === 'partner' && firebaseData.partner) {
        supabaseUser.partner = safeConvert(firebaseData.partner);
      }
      
      // Insert into Supabase
      const { error } = await supabase
        .from('users')
        .insert(supabaseUser);
      
      if (error) {
        console.error(`Failed to migrate user ${doc.id}:`, error);
        migrationStats.users.failed++;
      } else {
        migrationStats.users.migrated++;
        console.log(`✓ Migrated user: ${firebaseData.email}`);
      }
      
    } catch (error) {
      console.error(`Error processing user ${doc.id}:`, error);
      migrationStats.users.failed++;
    }
  }
}

// Migrate Spaces
async function migrateSpaces() {
  console.log('\\nStarting spaces migration...');
  const spacesCollection = collection(firestore, 'spaces');
  const snapshot = await getDocs(spacesCollection);
  
  migrationStats.spaces.total = snapshot.size;
  
  // First, get user ID mapping
  const { data: users } = await supabase
    .from('users')
    .select('id, uid');
  
  const userIdMap = {};
  users.forEach(user => {
    userIdMap[user.uid] = user.id;
  });
  
  for (const doc of snapshot.docs) {
    try {
      const firebaseData = doc.data();
      
      // Transform space data for Supabase
      const supabaseSpace = {
        id: uuidv4(),
        owner_id: userIdMap[firebaseData.ownerId],
        name: firebaseData.name,
        type: firebaseData.type,
        size: firebaseData.size,
        capacity: firebaseData.capacity,
        address: safeConvert(firebaseData.address),
        access_info: safeConvert(firebaseData.accessInfo),
        amenities: safeConvert(firebaseData.amenities),
        operating_hours: safeConvert(firebaseData.operatingHours),
        cleaning_preferences: safeConvert(firebaseData.cleaningPreferences),
        status: firebaseData.status || 'active',
        stats: safeConvert(firebaseData.stats) || {
          totalJobs: 0,
          thisMonthJobs: 0,
          averageRating: 0
        },
        created_at: convertTimestamp(firebaseData.createdAt),
        updated_at: convertTimestamp(firebaseData.updatedAt)
      };
      
      // Insert into Supabase
      const { error } = await supabase
        .from('spaces')
        .insert(supabaseSpace);
      
      if (error) {
        console.error(`Failed to migrate space ${doc.id}:`, error);
        migrationStats.spaces.failed++;
      } else {
        migrationStats.spaces.migrated++;
        console.log(`✓ Migrated space: ${firebaseData.name}`);
      }
      
    } catch (error) {
      console.error(`Error processing space ${doc.id}:`, error);
      migrationStats.spaces.failed++;
    }
  }
}

// Migrate Jobs
async function migrateJobs() {
  console.log('\\nStarting jobs migration...');
  const jobsCollection = collection(firestore, 'jobs');
  const snapshot = await getDocs(jobsCollection);
  
  migrationStats.jobs.total = snapshot.size;
  
  // Get ID mappings
  const { data: users } = await supabase
    .from('users')
    .select('id, uid');
  
  const { data: spaces } = await supabase
    .from('spaces')
    .select('id, name');
  
  const userIdMap = {};
  users.forEach(user => {
    userIdMap[user.uid] = user.id;
  });
  
  // Note: You'll need to implement a proper space ID mapping based on your Firebase structure
  
  for (const doc of snapshot.docs) {
    try {
      const firebaseData = doc.data();
      
      // Transform job data for Supabase
      const supabaseJob = {
        id: uuidv4(),
        job_id: firebaseData.jobId || doc.id,
        space_id: spaces[0]?.id, // You'll need proper mapping here
        business_id: userIdMap[firebaseData.businessId],
        partner_id: firebaseData.partnerId ? userIdMap[firebaseData.partnerId] : null,
        status: firebaseData.status || 'pending',
        schedule: safeConvert(firebaseData.schedule),
        services: safeConvert(firebaseData.services),
        pricing: safeConvert(firebaseData.pricing),
        matching: safeConvert(firebaseData.matching),
        execution: safeConvert(firebaseData.execution),
        evidence: safeConvert(firebaseData.evidence),
        review: safeConvert(firebaseData.review),
        created_at: convertTimestamp(firebaseData.createdAt),
        updated_at: convertTimestamp(firebaseData.updatedAt),
        completed_at: convertTimestamp(firebaseData.completedAt),
        cancelled_at: convertTimestamp(firebaseData.cancelledAt),
        cancel_reason: firebaseData.cancelReason
      };
      
      // Insert into Supabase
      const { error } = await supabase
        .from('jobs')
        .insert(supabaseJob);
      
      if (error) {
        console.error(`Failed to migrate job ${doc.id}:`, error);
        migrationStats.jobs.failed++;
      } else {
        migrationStats.jobs.migrated++;
        console.log(`✓ Migrated job: ${firebaseData.jobId}`);
      }
      
    } catch (error) {
      console.error(`Error processing job ${doc.id}:`, error);
      migrationStats.jobs.failed++;
    }
  }
}

// Migrate other collections (if they exist)
async function migrateOtherCollections() {
  // Similar pattern for directSpaces, educationBookings, facilityApplications
  // These are marked as "준비중" (in preparation) so they might not have data yet
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting Firebase to Supabase migration...');
  console.log('=========================================\\n');
  
  try {
    // Run migrations in order due to foreign key constraints
    await migrateUsers();
    await migrateSpaces();
    await migrateJobs();
    await migrateOtherCollections();
    
    // Print summary
    console.log('\\n=========================================');
    console.log('📊 Migration Summary:');
    console.log('=========================================');
    
    Object.entries(migrationStats).forEach(([collection, stats]) => {
      if (stats.total > 0) {
        const successRate = ((stats.migrated / stats.total) * 100).toFixed(2);
        console.log(`\\n${collection}:`);
        console.log(`  Total: ${stats.total}`);
        console.log(`  Migrated: ${stats.migrated} (${successRate}%)`);
        console.log(`  Failed: ${stats.failed}`);
      }
    });
    
    console.log('\\n✅ Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();