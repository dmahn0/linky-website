-- ============================================
-- Linky Platform MVP Database Schema
-- Version: 1.0.0
-- Date: 2025-01-08
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Drop existing tables (if any) in correct order
-- ============================================
DROP TABLE IF EXISTS settlements CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS spaces CASCADE;
DROP TABLE IF EXISTS partners_users CASCADE;
DROP TABLE IF EXISTS business_users CASCADE;

-- ============================================
-- 1. BUSINESS_USERS TABLE
-- ============================================
CREATE TABLE business_users (
    id BIGSERIAL PRIMARY KEY,
    auth_uid UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50),
    business_registration_number VARCHAR(20),
    owner_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    space_type VARCHAR(50),
    space_count INTEGER DEFAULT 1,
    address TEXT,
    bank_name VARCHAR(50),
    bank_account_number VARCHAR(50),
    bank_account_holder VARCHAR(100),
    marketing_agreed BOOLEAN DEFAULT false,
    terms_agreed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_business_users_auth_uid ON business_users(auth_uid);
CREATE INDEX idx_business_users_email ON business_users(email);

-- ============================================
-- 2. PARTNERS_USERS TABLE
-- ============================================
CREATE TABLE partners_users (
    id BIGSERIAL PRIMARY KEY,
    auth_uid UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50) UNIQUE,
    phone VARCHAR(20) NOT NULL,
    birth_date DATE,
    gender VARCHAR(10),
    preferred_work_types TEXT[],
    preferred_areas TEXT[],
    experience_level VARCHAR(20) DEFAULT 'beginner',
    introduction TEXT,
    profile_image_url TEXT,
    bank_name VARCHAR(50),
    bank_account_number VARCHAR(50),
    bank_account_holder VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.00,
    completed_jobs INTEGER DEFAULT 0,
    this_month_earnings DECIMAL(12,2) DEFAULT 0.00,
    total_earnings DECIMAL(12,2) DEFAULT 0.00,
    marketing_agreed BOOLEAN DEFAULT false,
    sms_agreed BOOLEAN DEFAULT false,
    email_agreed BOOLEAN DEFAULT false,
    push_agreed BOOLEAN DEFAULT false,
    night_work_agreed BOOLEAN DEFAULT false,
    terms_agreed_at TIMESTAMPTZ,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_partners_users_auth_uid ON partners_users(auth_uid);
CREATE INDEX idx_partners_users_email ON partners_users(email);
CREATE INDEX idx_partners_users_nickname ON partners_users(nickname);
CREATE INDEX idx_partners_users_preferred_areas ON partners_users USING GIN(preferred_areas);

-- ============================================
-- 3. SPACES TABLE
-- ============================================
CREATE TABLE spaces (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    space_type VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    address_detail TEXT,
    postal_code VARCHAR(10),
    area VARCHAR(50),
    size_sqm DECIMAL(10,2),
    floor_number INTEGER,
    has_elevator BOOLEAN DEFAULT false,
    has_parking BOOLEAN DEFAULT false,
    parking_info TEXT,
    special_notes TEXT,
    access_method TEXT,
    status VARCHAR(20) DEFAULT 'active',
    regular_cleaning_day VARCHAR(20),
    regular_cleaning_time TIME,
    regular_price DECIMAL(10,2),
    photos JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_spaces_business_id ON spaces(business_id);
CREATE INDEX idx_spaces_area ON spaces(area);
CREATE INDEX idx_spaces_status ON spaces(status);

-- ============================================
-- 4. JOBS TABLE
-- ============================================
CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    partner_id BIGINT REFERENCES partners_users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    estimated_duration INTEGER DEFAULT 120,
    base_price DECIMAL(10,2) NOT NULL,
    final_price DECIMAL(10,2),
    special_requirements TEXT,
    tools_provided BOOLEAN DEFAULT false,
    tools_list TEXT,
    completion_notes TEXT,
    completion_photos JSONB DEFAULT '[]',
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    actual_duration INTEGER,
    partner_rating INTEGER,
    partner_review TEXT,
    business_rating INTEGER,
    business_review TEXT,
    cancelled_at TIMESTAMPTZ,
    cancelled_by VARCHAR(20),
    cancellation_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_jobs_business_id ON jobs(business_id);
CREATE INDEX idx_jobs_space_id ON jobs(space_id);
CREATE INDEX idx_jobs_partner_id ON jobs(partner_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- ============================================
-- 5. JOB_APPLICATIONS TABLE
-- ============================================
CREATE TABLE job_applications (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    partner_id BIGINT NOT NULL REFERENCES partners_users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    message TEXT,
    proposed_price DECIMAL(10,2),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, partner_id)
);

-- Create indexes
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_partner_id ON job_applications(partner_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- ============================================
-- 6. REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    reviewer_type VARCHAR(20) NOT NULL,
    reviewer_id BIGINT NOT NULL,
    reviewee_type VARCHAR(20) NOT NULL,
    reviewee_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_public BOOLEAN DEFAULT true,
    photos JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_reviews_job_id ON reviews(job_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_type, reviewer_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_type, reviewee_id);

-- ============================================
-- 7. SETTLEMENTS TABLE
-- ============================================
CREATE TABLE settlements (
    id BIGSERIAL PRIMARY KEY,
    partner_id BIGINT NOT NULL REFERENCES partners_users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_jobs INTEGER DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    platform_fee DECIMAL(12,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    net_amount DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    notes TEXT,
    job_details JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_settlements_partner_id ON settlements(partner_id);
CREATE INDEX idx_settlements_period ON settlements(period_start, period_end);
CREATE INDEX idx_settlements_status ON settlements(status);

-- ============================================
-- Trigger for updated_at columns
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_business_users_updated_at BEFORE UPDATE ON business_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_users_updated_at BEFORE UPDATE ON partners_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settlements_updated_at BEFORE UPDATE ON settlements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Grant permissions for Supabase
-- ============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;