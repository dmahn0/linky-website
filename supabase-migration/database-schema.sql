-- Supabase Database Schema for Linky Platform
-- 기존 Firebase 구조를 Supabase PostgreSQL로 마이그레이션

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (회원 정보)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    uid TEXT UNIQUE NOT NULL, -- Firebase Auth UID 호환
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    type TEXT CHECK (type IN ('business', 'partner', 'admin')) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Business specific fields
    business JSONB DEFAULT '{}',
    -- {
    --   "businessName": "string",
    --   "businessNumber": "string",
    --   "businessType": "string",
    --   "businessAddress": "string"
    -- }
    
    -- Partner specific fields
    partner JSONB DEFAULT '{}',
    -- {
    --   "vehicleType": "string",
    --   "activityArea": ["area1", "area2"],
    --   "preferredTime": "string",
    --   "experience": "string"
    -- }
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    
    -- Marketing consent
    privacy_agreed BOOLEAN DEFAULT false,
    privacy_agreed_at TIMESTAMPTZ,
    marketing_agreed BOOLEAN DEFAULT false,
    marketing_agreed_at TIMESTAMPTZ
);

-- Spaces table (공간 정보)
CREATE TABLE spaces (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER, -- 평수
    
    -- Address
    address JSONB NOT NULL,
    -- {
    --   "fullAddress": "string",
    --   "sido": "string",
    --   "sigungu": "string",
    --   "detail": "string"
    -- }
    
    -- Facilities
    facilities JSONB DEFAULT '{}',
    -- {
    --   "rooms": number,
    --   "seats": number,
    --   "hasToilet": boolean,
    --   "hasKitchen": boolean,
    --   "hasParking": boolean
    -- }
    
    -- Operating hours
    operating_hours JSONB DEFAULT '{}',
    -- {
    --   "open": "09:00",
    --   "close": "23:00",
    --   "is24Hours": boolean
    -- }
    
    -- Cleaning schedule
    cleaning_schedule JSONB DEFAULT '{}',
    -- {
    --   "frequency": "daily",
    --   "preferredTime": "morning"
    -- }
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table (작업 요청)
CREATE TABLE jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id TEXT UNIQUE NOT NULL, -- JOB-YYYYMMDD-XXX 형식
    
    -- References
    space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
    business_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'waiting', 'matched', 'in_progress', 'completed', 'cancelled')),
    
    -- Schedule
    schedule JSONB NOT NULL,
    -- {
    --   "requestedDate": "2024-01-20",
    --   "requestedTime": "10:00",
    --   "urgency": "normal",
    --   "estimatedDuration": 30,
    --   "flexibleTime": boolean
    -- }
    
    -- Services
    services JSONB NOT NULL,
    -- {
    --   "basic": { "selected": true, "price": 12000, "details": "..." },
    --   "floor": { "selected": true, "price": 3000, "size": "20평" },
    --   "customRequests": "추가 요청사항"
    -- }
    
    -- Pricing
    pricing JSONB NOT NULL,
    -- {
    --   "basePrice": 12000,
    --   "additionalServices": 3000,
    --   "urgencyFee": 0,
    --   "totalPrice": 15000,
    --   "commission": 3000,
    --   "partnerEarnings": 12000
    -- }
    
    -- Matching
    matching JSONB DEFAULT '{}',
    -- {
    --   "requestedAt": "timestamp",
    --   "acceptedAt": "timestamp",
    --   "approvedAt": "timestamp",
    --   "completedAt": "timestamp"
    -- }
    
    -- Completion
    completion JSONB DEFAULT '{}',
    -- {
    --   "reportedAt": "timestamp",
    --   "photos": ["url1", "url2"],
    --   "notes": "완료 메모"
    -- }
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pending Approvals table (승인 대기)
CREATE TABLE pending_approvals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT CHECK (type IN ('user_registration', 'job_matching')) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- For job matching
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    partner_name TEXT,
    partner_email TEXT,
    
    -- For user registration
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Approval info
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by TEXT,
    rejected_at TIMESTAMPTZ,
    rejected_by TEXT,
    rejection_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Config table (시스템 설정)
CREATE TABLE config (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default config
INSERT INTO config (id, data) VALUES 
('pricing', '{
    "basic": {
        "name": "기본 정리정돈",
        "basePrice": 12000,
        "description": "쓰레기 정리, 테이블/의자 정리, 기본 소모품 보충"
    },
    "floor": {
        "name": "바닥 청소",
        "pricePerPyeong": 500,
        "minPrice": 3000
    },
    "toilet": {
        "name": "화장실 청소",
        "pricePerUnit": 5000
    },
    "dishes": {
        "name": "설거지/주방정리",
        "price": 5000
    },
    "urgency": {
        "multiplier": 1.5
    }
}'),
('system', '{
    "serviceAreas": ["서울", "경기", "인천"],
    "operatingHours": {
        "start": "06:00",
        "end": "23:00"
    },
    "commission": 0.2
}');

-- Create indexes for better performance
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_spaces_owner ON spaces(owner_id);
CREATE INDEX idx_jobs_business ON jobs(business_id);
CREATE INDEX idx_jobs_partner ON jobs(partner_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_space ON jobs(space_id);
CREATE INDEX idx_approvals_type ON pending_approvals(type);
CREATE INDEX idx_approvals_status ON pending_approvals(status);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_approvals ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Public profiles are viewable by everyone" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = uid);

-- Spaces policies
CREATE POLICY "Spaces are viewable by everyone" ON spaces
    FOR SELECT USING (true);

CREATE POLICY "Users can create own spaces" ON spaces
    FOR INSERT WITH CHECK (owner_id = (SELECT id FROM users WHERE uid = auth.uid()));

CREATE POLICY "Users can update own spaces" ON spaces
    FOR UPDATE USING (owner_id = (SELECT id FROM users WHERE uid = auth.uid()));

-- Jobs policies
CREATE POLICY "Jobs are viewable by relevant users" ON jobs
    FOR SELECT USING (
        business_id = (SELECT id FROM users WHERE uid = auth.uid()) OR
        partner_id = (SELECT id FROM users WHERE uid = auth.uid()) OR
        status = 'pending'
    );

CREATE POLICY "Business can create jobs" ON jobs
    FOR INSERT WITH CHECK (business_id = (SELECT id FROM users WHERE uid = auth.uid()));

CREATE POLICY "Relevant users can update jobs" ON jobs
    FOR UPDATE USING (
        business_id = (SELECT id FROM users WHERE uid = auth.uid()) OR
        partner_id = (SELECT id FROM users WHERE uid = auth.uid())
    );

-- Create functions for updated_at trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_timestamp_users
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_spaces
    BEFORE UPDATE ON spaces
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_jobs
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_approvals
    BEFORE UPDATE ON pending_approvals
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Create views for easier queries
CREATE VIEW job_details AS
SELECT 
    j.*,
    s.name as space_name,
    s.address,
    s.type as space_type,
    bu.name as business_name,
    bu.email as business_email,
    pu.name as partner_name,
    pu.email as partner_email
FROM jobs j
LEFT JOIN spaces s ON j.space_id = s.id
LEFT JOIN users bu ON j.business_id = bu.id
LEFT JOIN users pu ON j.partner_id = pu.id;