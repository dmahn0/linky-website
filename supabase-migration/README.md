# Firebase to Supabase Migration Guide

## 🚀 Overview

This guide provides a complete migration path from Firebase to Supabase for the Linky platform.

## 📋 Migration Steps

### 1. Setup Supabase Project

1. Create a new Supabase project at [app.supabase.com](https://app.supabase.com)
2. Save your project URL and anon key
3. Run the schema SQL in Supabase SQL editor:
```bash
# In Supabase Dashboard > SQL Editor
# Copy and paste contents of schema.sql
```

### 2. Configure Environment Variables

Create `.env.local` file:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Firebase (for migration)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### 3. Install Dependencies

```bash
npm install @supabase/supabase-js uuid
```

### 4. Run Migration Script

```bash
node supabase-migration/migration.js
```

### 5. Update Your Code

Replace Firebase imports with Supabase client:

```javascript
// Before (Firebase)
import { db, auth } from './firebase-config';

// After (Supabase)
import { db, auth } from './supabase-migration/supabase-client';
```

## 🔄 Code Changes Required

### Authentication

```javascript
// Firebase
await createUserWithEmailAndPassword(auth, email, password);

// Supabase (same API)
await auth.createUserWithEmailAndPassword(email, password);
```

### Database Operations

```javascript
// Firebase
const snapshot = await getDocs(collection(db, 'users'));

// Supabase
const users = await db.users.list();
```

### Real-time Subscriptions

```javascript
// Firebase
onSnapshot(collection(db, 'jobs'), (snapshot) => {
  // Handle changes
});

// Supabase
const unsubscribe = realtime.subscribeToJobs((payload) => {
  // Handle changes
});
```

## 🎯 Key Benefits

1. **Cost Predictability**: Fixed pricing tiers
2. **SQL Power**: Complex queries, joins, aggregations
3. **Better Performance**: PostgreSQL + proper indexes
4. **Built-in Features**: Auth, Storage, Real-time, Edge Functions
5. **Type Safety**: Generated TypeScript types

## 📊 Migration Checklist

- [ ] Create Supabase project
- [ ] Run schema.sql
- [ ] Configure environment variables
- [ ] Run migration script
- [ ] Update authentication code
- [ ] Update database queries
- [ ] Update real-time listeners
- [ ] Test all features
- [ ] Update deployment configuration

## ⚡ Performance Optimizations

1. **Indexes**: Already created for common queries
2. **Views**: Pre-built for complex queries
3. **RLS**: Row Level Security configured
4. **Connection Pooling**: Automatic with Supabase

## 🔒 Security

1. **Row Level Security**: Configured for all tables
2. **Auth Integration**: Seamless with Supabase Auth
3. **API Keys**: Use environment variables
4. **SSL**: Enforced by default

## 🚨 Important Notes

1. **User IDs**: Firebase UIDs are preserved in the `uid` column
2. **Timestamps**: All converted to PostgreSQL format
3. **JSON Fields**: Preserved as JSONB for flexibility
4. **Real-time**: Different syntax but same functionality

## 📞 Support

If you encounter issues:
1. Check Supabase logs in Dashboard
2. Verify RLS policies
3. Ensure all environment variables are set
4. Check migration script output for errors