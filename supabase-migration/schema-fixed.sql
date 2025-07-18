-- Supabase Schema for Linky Platform
-- Firebase to Supabase Migration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_type AS ENUM ('business', 'partner', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');
CREATE TYPE business_type AS ENUM ('studyroom', 'partyroom', 'unmanned', 'office', 'other');
CREATE TYPE transportation_type AS ENUM ('public', 'car', 'bike');
CREATE TYPE experience_type AS ENUM ('6months', '1year', '2years', 'none');
CREATE TYPE partner_level AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE space_type AS ENUM ('studyroom', 'partyroom', 'unmanned', 'office');
CREATE TYPE space_status AS ENUM ('active', 'inactive', 'maintenance');
CREATE TYPE toilet_location AS ENUM ('same', 'outside');
CREATE TYPE job_status AS ENUM ('pending', 'matched', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed');
CREATE TYPE urgency_type AS ENUM ('normal', 'urgent4h', 'urgent2h', 'immediate');
CREATE TYPE education_program AS ENUM ('basic', 'advanced', 'consulting');
CREATE TYPE education_experience AS ENUM ('none', 'planning', 'under1', '1to3', 'over3');
CREATE TYPE education_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE facility_service AS ENUM ('basic', 'premium', 'emergency');
CREATE TYPE facility_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed');
CREATE TYPE space_size AS ENUM ('small', 'medium', 'large', 'xlarge');

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid VARCHAR(255) UNIQUE NOT NULL, -- Firebase Auth UID for compatibility
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    profile_photo TEXT,
    
    -- Account status
    type user_type NOT NULL,
    status user_status NOT NULL DEFAULT 'pending',
    status_reason TEXT,
    
    -- Business fields (JSON for flexibility)
    business JSONB,
    
    -- Partner fields (JSON for flexibility)
    partner JSONB,
    
    -- Notification settings
    notification_settings JSONB DEFAULT '{"email": true, "sms": true, "push": true, "marketing": false}'::JSONB,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_phone CHECK (phone ~ '^010-\d{4}-\d{4}$'),
    CONSTRAINT valid_business_data CHECK (
        type != 'business' OR (
            business IS NOT NULL AND
            business->>'businessName' IS NOT NULL AND
            business->>'businessNumber' IS NOT NULL
        )
    ),
    CONSTRAINT valid_partner_data CHECK (
        type != 'partner' OR (
            partner IS NOT NULL AND
            partner->>'realName' IS NOT NULL
        )
    )
);

-- Create spaces table
CREATE TABLE public.spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic info
    name VARCHAR(200) NOT NULL,
    type space_type NOT NULL,
    size INTEGER NOT NULL CHECK (size > 0),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    
    -- Location info (JSON for flexibility)
    address JSONB NOT NULL,
    
    -- Access info (JSON)
    access_info JSONB,
    
    -- Amenities (JSON)
    amenities JSONB,
    
    -- Operating hours (JSON)
    operating_hours JSONB,
    
    -- Cleaning preferences (JSON)
    cleaning_preferences JSONB,
    
    -- Status
    status space_status NOT NULL DEFAULT 'active',
    
    -- Statistics
    stats JSONB DEFAULT '{"totalJobs": 0, "thisMonthJobs": 0, "averageRating": 0}'::JSONB,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id VARCHAR(50) UNIQUE NOT NULL, -- Format: JOB-YYYYMMDD-NNN
    
    -- Relationships
    space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES users(id),
    partner_id UUID REFERENCES users(id),
    
    -- Status
    status job_status NOT NULL DEFAULT 'pending',
    
    -- Schedule (JSON)
    schedule JSONB NOT NULL,
    
    -- Services (JSON)
    services JSONB NOT NULL,
    
    -- Pricing (JSON)
    pricing JSONB NOT NULL,
    
    -- Matching (JSON)
    matching JSONB,
    
    -- Execution (JSON)
    execution JSONB,
    
    -- Evidence (JSON)
    evidence JSONB,
    
    -- Review (JSON)
    review JSONB,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    
    -- Constraints
    CONSTRAINT valid_partner_assignment CHECK (
        (status = 'pending' AND partner_id IS NULL) OR
        (status != 'pending' AND partner_id IS NOT NULL) OR
        status = 'cancelled'
    )
);

-- Create direct_spaces table (준비중)
CREATE TABLE public.direct_spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic info
    name VARCHAR(200) NOT NULL,
    type space_type NOT NULL,
    size INTEGER NOT NULL CHECK (size > 0),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    
    -- Location and access
    address TEXT NOT NULL,
    access_info TEXT,
    
    -- Operating info
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    hourly_rate INTEGER NOT NULL CHECK (hourly_rate > 0),
    
    -- Status
    status space_status NOT NULL DEFAULT 'active',
    
    -- Statistics (JSON)
    statistics JSONB DEFAULT '{"monthlyRevenue": 0, "occupancyRate": 0, "totalBookings": 0, "averageRating": 0}'::JSONB,
    
    -- Special notes
    special_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create education_bookings table (준비중)
CREATE TABLE public.education_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Booking info
    program education_program NOT NULL,
    program_details JSONB NOT NULL,
    
    -- Applicant info
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    
    -- Experience info
    experience education_experience NOT NULL,
    current_space VARCHAR(200),
    
    -- Goals and inquiry
    goals TEXT,
    inquiry TEXT,
    
    -- Status
    status education_status NOT NULL DEFAULT 'pending',
    
    -- Schedule (when confirmed)
    scheduled_date DATE,
    scheduled_time TIME,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Create facility_applications table (준비중)
CREATE TABLE public.facility_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Service info
    service_type facility_service NOT NULL,
    service_details JSONB NOT NULL,
    
    -- Business info
    business_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    
    -- Space info
    space_type space_type NOT NULL,
    space_size space_size NOT NULL,
    
    -- Facilities
    facilities TEXT[] NOT NULL,
    
    -- Current issues and inquiry
    current_issues TEXT,
    inquiry TEXT,
    
    -- Status
    status facility_status NOT NULL DEFAULT 'pending',
    
    -- Diagnosis (after visit)
    diagnosis JSONB,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX idx_users_type_status ON users(type, status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

CREATE INDEX idx_spaces_owner_id ON spaces(owner_id);
CREATE INDEX idx_spaces_type ON spaces(type);
CREATE INDEX idx_spaces_status ON spaces(status);
CREATE INDEX idx_spaces_address_sigungu ON spaces((address->>'sigungu'));

CREATE INDEX idx_jobs_space_id ON jobs(space_id);
CREATE INDEX idx_jobs_business_id ON jobs(business_id);
CREATE INDEX idx_jobs_partner_id ON jobs(partner_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_schedule_date ON jobs((schedule->>'requestedDate'));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_direct_spaces_updated_at BEFORE UPDATE ON direct_spaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Fixed for UUID comparison)
-- Users: Can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = uid);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = uid);

-- Spaces: Owners can manage, authenticated users can read
CREATE POLICY "Authenticated users can view spaces" ON spaces
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can manage their spaces" ON spaces
    FOR ALL USING (auth.uid()::text = (SELECT uid FROM users WHERE id = owner_id));

-- Jobs: Related users can access
CREATE POLICY "Users can view jobs" ON jobs
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Business owners can create jobs" ON jobs
    FOR INSERT WITH CHECK (auth.uid()::text = (SELECT uid FROM users WHERE id = business_id));

CREATE POLICY "Related users can update jobs" ON jobs
    FOR UPDATE USING (
        auth.uid()::text = (SELECT uid FROM users WHERE id = business_id) OR
        auth.uid()::text = (SELECT uid FROM users WHERE id = partner_id)
    );

-- Direct spaces: Owner only
CREATE POLICY "Owners can manage direct spaces" ON direct_spaces
    FOR ALL USING (auth.uid()::text = (SELECT uid FROM users WHERE id = owner_id));

-- Education bookings: Anyone can create, admins can manage
CREATE POLICY "Anyone can create education bookings" ON education_bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage education bookings" ON education_bookings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE uid = auth.uid()::text AND type = 'admin')
    );

-- Facility applications: Anyone can create, admins can manage
CREATE POLICY "Anyone can create facility applications" ON facility_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage facility applications" ON facility_applications
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE uid = auth.uid()::text AND type = 'admin')
    );

-- Create functions for real-time features
CREATE OR REPLACE FUNCTION notify_job_changes()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'job_changes',
        json_build_object(
            'job_id', NEW.job_id,
            'status', NEW.status,
            'space_id', NEW.space_id,
            'partner_id', NEW.partner_id
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_changes_trigger
AFTER INSERT OR UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION notify_job_changes();

-- Create views for common queries
CREATE VIEW active_jobs AS
SELECT 
    j.*,
    s.name as space_name,
    s.address->>'fullAddress' as space_address,
    u_business.name as business_name,
    u_partner.name as partner_name
FROM jobs j
JOIN spaces s ON j.space_id = s.id
JOIN users u_business ON j.business_id = u_business.id
LEFT JOIN users u_partner ON j.partner_id = u_partner.id
WHERE j.status NOT IN ('completed', 'cancelled');

CREATE VIEW partner_performance AS
SELECT 
    u.id,
    u.name,
    u.partner->>'level' as level,
    COUNT(CASE WHEN j.status = 'completed' THEN 1 END) as completed_jobs,
    COUNT(CASE WHEN j.status = 'cancelled' AND j.partner_id IS NOT NULL THEN 1 END) as cancelled_jobs,
    AVG(CASE WHEN j.review->>'partnerRating' IS NOT NULL 
        THEN (j.review->>'partnerRating')::numeric END) as average_rating,
    SUM(CASE WHEN j.status = 'completed' 
        THEN (j.pricing->>'partnerEarnings')::numeric END) as total_earnings
FROM users u
LEFT JOIN jobs j ON u.id = j.partner_id
WHERE u.type = 'partner'
GROUP BY u.id, u.name, u.partner->>'level';

-- Add helpful comments
COMMENT ON TABLE users IS '사용자 정보 - 사업자, 파트너, 관리자';
COMMENT ON TABLE spaces IS '일반 공간 정보 - 사업자가 등록한 공간';
COMMENT ON TABLE jobs IS '작업 요청 및 매칭 관리';
COMMENT ON TABLE direct_spaces IS '직영 공간 관리 (준비중)';
COMMENT ON TABLE education_bookings IS '교육/컨설팅 예약 (준비중)';
COMMENT ON TABLE facility_applications IS '시설 관리 서비스 신청 (준비중)';