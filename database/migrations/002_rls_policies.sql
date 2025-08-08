-- ============================================
-- Row Level Security (RLS) Policies
-- Version: 1.0.0
-- Date: 2025-01-08
-- ============================================

-- Enable RLS on all tables
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BUSINESS_USERS POLICIES
-- ============================================
-- Users can read their own profile
CREATE POLICY "Users can view own business profile" ON business_users
    FOR SELECT USING (auth.uid() = auth_uid);

-- Users can update their own profile
CREATE POLICY "Users can update own business profile" ON business_users
    FOR UPDATE USING (auth.uid() = auth_uid);

-- Users can insert their own profile
CREATE POLICY "Users can insert own business profile" ON business_users
    FOR INSERT WITH CHECK (auth.uid() = auth_uid);

-- ============================================
-- PARTNERS_USERS POLICIES
-- ============================================
-- Users can read their own profile
CREATE POLICY "Users can view own partner profile" ON partners_users
    FOR SELECT USING (auth.uid() = auth_uid);

-- Users can update their own profile
CREATE POLICY "Users can update own partner profile" ON partners_users
    FOR UPDATE USING (auth.uid() = auth_uid);

-- Users can insert their own profile
CREATE POLICY "Users can insert own partner profile" ON partners_users
    FOR INSERT WITH CHECK (auth.uid() = auth_uid);

-- Businesses can view partner profiles (for job assignments)
CREATE POLICY "Businesses can view partner profiles" ON partners_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM business_users WHERE auth_uid = auth.uid()
        )
    );

-- ============================================
-- SPACES POLICIES
-- ============================================
-- Business owners can manage their own spaces
CREATE POLICY "Business can view own spaces" ON spaces
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM business_users WHERE auth_uid = auth.uid()
        )
    );

CREATE POLICY "Business can insert own spaces" ON spaces
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT id FROM business_users WHERE auth_uid = auth.uid()
        )
    );

CREATE POLICY "Business can update own spaces" ON spaces
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM business_users WHERE auth_uid = auth.uid()
        )
    );

CREATE POLICY "Business can delete own spaces" ON spaces
    FOR DELETE USING (
        business_id IN (
            SELECT id FROM business_users WHERE auth_uid = auth.uid()
        )
    );

-- Partners can view spaces for jobs they're working on
CREATE POLICY "Partners can view job spaces" ON spaces
    FOR SELECT USING (
        id IN (
            SELECT space_id FROM jobs 
            WHERE partner_id IN (
                SELECT id FROM partners_users WHERE auth_uid = auth.uid()
            )
        )
    );

-- ============================================
-- JOBS POLICIES
-- ============================================
-- Business owners can manage their own jobs
CREATE POLICY "Business can view own jobs" ON jobs
    FOR SELECT USING (
        business_id IN (
            SELECT id FROM business_users WHERE auth_uid = auth.uid()
        )
    );

CREATE POLICY "Business can insert own jobs" ON jobs
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT id FROM business_users WHERE auth_uid = auth.uid()
        )
    );

CREATE POLICY "Business can update own jobs" ON jobs
    FOR UPDATE USING (
        business_id IN (
            SELECT id FROM business_users WHERE auth_uid = auth.uid()
        )
    );

CREATE POLICY "Business can delete own jobs" ON jobs
    FOR DELETE USING (
        business_id IN (
            SELECT id FROM business_users WHERE auth_uid = auth.uid()
        )
    );

-- Partners can view available jobs (pending status)
CREATE POLICY "Partners can view available jobs" ON jobs
    FOR SELECT USING (
        status = 'pending' 
        AND EXISTS (
            SELECT 1 FROM partners_users WHERE auth_uid = auth.uid()
        )
    );

-- Partners can view and update their assigned jobs
CREATE POLICY "Partners can view assigned jobs" ON jobs
    FOR SELECT USING (
        partner_id IN (
            SELECT id FROM partners_users WHERE auth_uid = auth.uid()
        )
    );

CREATE POLICY "Partners can update assigned jobs" ON jobs
    FOR UPDATE USING (
        partner_id IN (
            SELECT id FROM partners_users WHERE auth_uid = auth.uid()
        )
    );

-- ============================================
-- JOB_APPLICATIONS POLICIES
-- ============================================
-- Partners can manage their own applications
CREATE POLICY "Partners can view own applications" ON job_applications
    FOR SELECT USING (
        partner_id IN (
            SELECT id FROM partners_users WHERE auth_uid = auth.uid()
        )
    );

CREATE POLICY "Partners can insert own applications" ON job_applications
    FOR INSERT WITH CHECK (
        partner_id IN (
            SELECT id FROM partners_users WHERE auth_uid = auth.uid()
        )
    );

CREATE POLICY "Partners can update own applications" ON job_applications
    FOR UPDATE USING (
        partner_id IN (
            SELECT id FROM partners_users WHERE auth_uid = auth.uid()
        )
    );

-- Businesses can view applications for their jobs
CREATE POLICY "Business can view job applications" ON job_applications
    FOR SELECT USING (
        job_id IN (
            SELECT id FROM jobs 
            WHERE business_id IN (
                SELECT id FROM business_users WHERE auth_uid = auth.uid()
            )
        )
    );

CREATE POLICY "Business can update job applications" ON job_applications
    FOR UPDATE USING (
        job_id IN (
            SELECT id FROM jobs 
            WHERE business_id IN (
                SELECT id FROM business_users WHERE auth_uid = auth.uid()
            )
        )
    );

-- ============================================
-- REVIEWS POLICIES
-- ============================================
-- Users can view reviews they wrote or received
CREATE POLICY "Users can view related reviews" ON reviews
    FOR SELECT USING (
        (reviewer_type = 'business' AND reviewer_id IN (
            SELECT id FROM business_users WHERE auth_uid = auth.uid()
        )) OR
        (reviewer_type = 'partner' AND reviewer_id IN (
            SELECT id FROM partners_users WHERE auth_uid = auth.uid()
        )) OR
        (reviewee_type = 'business' AND reviewee_id IN (
            SELECT id FROM business_users WHERE auth_uid = auth.uid()
        )) OR
        (reviewee_type = 'partner' AND reviewee_id IN (
            SELECT id FROM partners_users WHERE auth_uid = auth.uid()
        ))
    );

-- Users can insert reviews for completed jobs
CREATE POLICY "Users can insert reviews" ON reviews
    FOR INSERT WITH CHECK (
        (reviewer_type = 'business' AND reviewer_id IN (
            SELECT id FROM business_users WHERE auth_uid = auth.uid()
        )) OR
        (reviewer_type = 'partner' AND reviewer_id IN (
            SELECT id FROM partners_users WHERE auth_uid = auth.uid()
        ))
    );

-- Public reviews are visible to all authenticated users
CREATE POLICY "Public reviews are visible" ON reviews
    FOR SELECT USING (
        is_public = true 
        AND EXISTS (
            SELECT 1 FROM business_users WHERE auth_uid = auth.uid()
            UNION
            SELECT 1 FROM partners_users WHERE auth_uid = auth.uid()
        )
    );

-- ============================================
-- SETTLEMENTS POLICIES
-- ============================================
-- Partners can view their own settlements
CREATE POLICY "Partners can view own settlements" ON settlements
    FOR SELECT USING (
        partner_id IN (
            SELECT id FROM partners_users WHERE auth_uid = auth.uid()
        )
    );

-- Service role can manage all settlements (for admin/system)
-- This is handled by service_role automatically

-- ============================================
-- Additional Security Notes
-- ============================================
-- 1. All policies check auth.uid() to ensure user is authenticated
-- 2. Business users can only access their own data
-- 3. Partners can only access their own data and public job listings
-- 4. Cross-user data access is restricted except for specific use cases
-- 5. Service role bypasses RLS for admin operations