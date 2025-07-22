// Firebase to Supabase Data Migration Script
// 이 스크립트는 Firebase에서 Supabase로 데이터를 이전합니다

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';

// Firebase 설정
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};

// Supabase 설정
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_KEY'; // Service key for admin access

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firebaseDb = getFirestore(firebaseApp);

// Initialize Supabase with service key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration functions
async function migrateUsers() {
  console.log('Starting user migration...');
  
  try {
    // Get all users from Firebase
    const usersSnapshot = await getDocs(collection(firebaseDb, 'users'));
    const users = [];
    
    usersSnapshot.forEach((doc) => {
      users.push({
        uid: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${users.length} users to migrate`);
    
    // Insert users into Supabase
    for (const user of users) {
      // Transform Firebase data to Supabase format
      const supabaseUser = {
        uid: user.uid,
        email: user.email,
        name: user.name,
        phone: user.phone,
        type: user.type,
        status: user.status || 'approved',
        business: user.business || {},
        partner: user.partner || {},
        created_at: user.createdAt?.toDate?.() || new Date().toISOString(),
        updated_at: user.updatedAt?.toDate?.() || new Date().toISOString(),
        approved_at: user.approvedAt?.toDate?.() || null,
        privacy_agreed: user.privacyAgreed || false,
        privacy_agreed_at: user.privacyAgreedAt?.toDate?.() || null,
        marketing_agreed: user.marketingAgreed || false,
        marketing_agreed_at: user.marketingAgreedAt?.toDate?.() || null
      };
      
      const { data, error } = await supabase
        .from('users')
        .upsert(supabaseUser, { onConflict: 'uid' });
      
      if (error) {
        console.error(`Error migrating user ${user.uid}:`, error);
      } else {
        console.log(`✓ Migrated user: ${user.email}`);
      }
    }
    
    console.log('User migration completed!');
  } catch (error) {
    console.error('User migration failed:', error);
  }
}

async function migrateSpaces() {
  console.log('Starting spaces migration...');
  
  try {
    const spacesSnapshot = await getDocs(collection(firebaseDb, 'spaces'));
    const spaces = [];
    
    spacesSnapshot.forEach((doc) => {
      spaces.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${spaces.length} spaces to migrate`);
    
    for (const space of spaces) {
      // Get owner's Supabase ID
      const { data: owner } = await supabase
        .from('users')
        .select('id')
        .eq('uid', space.ownerId)
        .single();
      
      if (!owner) {
        console.error(`Owner not found for space ${space.id}`);
        continue;
      }
      
      const supabaseSpace = {
        owner_id: owner.id,
        name: space.name,
        type: space.type,
        size: space.size,
        address: space.address,
        facilities: space.facilities || {},
        operating_hours: space.operatingHours || {},
        cleaning_schedule: space.cleaningSchedule || {},
        status: space.status || 'active',
        created_at: space.createdAt?.toDate?.() || new Date().toISOString(),
        updated_at: space.updatedAt?.toDate?.() || new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('spaces')
        .insert(supabaseSpace);
      
      if (error) {
        console.error(`Error migrating space ${space.id}:`, error);
      } else {
        console.log(`✓ Migrated space: ${space.name}`);
      }
    }
    
    console.log('Spaces migration completed!');
  } catch (error) {
    console.error('Spaces migration failed:', error);
  }
}

async function migrateJobs() {
  console.log('Starting jobs migration...');
  
  try {
    const jobsSnapshot = await getDocs(collection(firebaseDb, 'jobs'));
    const jobs = [];
    
    jobsSnapshot.forEach((doc) => {
      jobs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${jobs.length} jobs to migrate`);
    
    for (const job of jobs) {
      // Get related IDs
      const { data: business } = await supabase
        .from('users')
        .select('id')
        .eq('uid', job.businessId)
        .single();
      
      const { data: space } = await supabase
        .from('spaces')
        .select('id')
        .eq('name', job.spaceInfo?.name)
        .eq('owner_id', business?.id)
        .single();
      
      let partnerId = null;
      if (job.partnerId) {
        const { data: partner } = await supabase
          .from('users')
          .select('id')
          .eq('uid', job.partnerId)
          .single();
        partnerId = partner?.id;
      }
      
      const supabaseJob = {
        job_id: job.jobId || job.id,
        space_id: space?.id,
        business_id: business?.id,
        partner_id: partnerId,
        status: job.status || 'pending',
        schedule: job.schedule || {},
        services: job.services || {},
        pricing: job.pricing || {},
        matching: job.matching || {},
        completion: job.completion || {},
        created_at: job.createdAt?.toDate?.() || new Date().toISOString(),
        updated_at: job.updatedAt?.toDate?.() || new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('jobs')
        .insert(supabaseJob);
      
      if (error) {
        console.error(`Error migrating job ${job.id}:`, error);
      } else {
        console.log(`✓ Migrated job: ${job.jobId}`);
      }
    }
    
    console.log('Jobs migration completed!');
  } catch (error) {
    console.error('Jobs migration failed:', error);
  }
}

async function migratePendingApprovals() {
  console.log('Starting pending approvals migration...');
  
  try {
    const approvalsSnapshot = await getDocs(collection(firebaseDb, 'pendingApprovals'));
    const approvals = [];
    
    approvalsSnapshot.forEach((doc) => {
      approvals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${approvals.length} pending approvals to migrate`);
    
    for (const approval of approvals) {
      let jobId = null;
      let partnerId = null;
      let userId = null;
      
      if (approval.type === 'job_matching' && approval.jobId) {
        const { data: job } = await supabase
          .from('jobs')
          .select('id')
          .eq('job_id', approval.jobId)
          .single();
        jobId = job?.id;
        
        if (approval.partnerId) {
          const { data: partner } = await supabase
            .from('users')
            .select('id')
            .eq('uid', approval.partnerId)
            .single();
          partnerId = partner?.id;
        }
      }
      
      if (approval.type === 'user_registration' && approval.userId) {
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('uid', approval.userId)
          .single();
        userId = user?.id;
      }
      
      const supabaseApproval = {
        type: approval.type,
        status: approval.status || 'pending',
        job_id: jobId,
        partner_id: partnerId,
        partner_name: approval.partnerName,
        partner_email: approval.partnerEmail,
        user_id: userId,
        requested_at: approval.requestedAt?.toDate?.() || new Date().toISOString(),
        approved_at: approval.approvedAt?.toDate?.() || null,
        approved_by: approval.approvedBy,
        rejected_at: approval.rejectedAt?.toDate?.() || null,
        rejected_by: approval.rejectedBy,
        rejection_reason: approval.rejectionReason,
        created_at: approval.createdAt?.toDate?.() || new Date().toISOString(),
        updated_at: approval.updatedAt?.toDate?.() || new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('pending_approvals')
        .insert(supabaseApproval);
      
      if (error) {
        console.error(`Error migrating approval ${approval.id}:`, error);
      } else {
        console.log(`✓ Migrated approval: ${approval.id}`);
      }
    }
    
    console.log('Pending approvals migration completed!');
  } catch (error) {
    console.error('Pending approvals migration failed:', error);
  }
}

async function migrateConfig() {
  console.log('Starting config migration...');
  
  try {
    const configSnapshot = await getDocs(collection(firebaseDb, 'config'));
    
    for (const doc of configSnapshot.docs) {
      const { data: existing } = await supabase
        .from('config')
        .select('id')
        .eq('id', doc.id)
        .single();
      
      if (!existing) {
        const { error } = await supabase
          .from('config')
          .insert({
            id: doc.id,
            data: doc.data(),
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.error(`Error migrating config ${doc.id}:`, error);
        } else {
          console.log(`✓ Migrated config: ${doc.id}`);
        }
      }
    }
    
    console.log('Config migration completed!');
  } catch (error) {
    console.error('Config migration failed:', error);
  }
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting Firebase to Supabase migration...\n');
  
  // Run migrations in order
  await migrateUsers();
  console.log('');
  
  await migrateSpaces();
  console.log('');
  
  await migrateJobs();
  console.log('');
  
  await migratePendingApprovals();
  console.log('');
  
  await migrateConfig();
  console.log('');
  
  console.log('✅ Migration completed!');
}

// Run the migration
runMigration().catch(console.error);