// API Client for Linky Platform
class API {
    constructor() {
        if (!window.supabase) {
            const { createClient } = supabase;
            this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            this.supabase = window.supabase;
        }
    }

    // Generic CRUD operations
    async select(table, conditions = {}, options = {}) {
        try {
            let query = this.supabase.from(table).select(options.select || '*');
            
            // Apply conditions
            Object.entries(conditions).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    query = query.in(key, value);
                } else {
                    query = query.eq(key, value);
                }
            });

            // Apply ordering
            if (options.order) {
                query = query.order(options.order.column, { 
                    ascending: options.order.ascending !== false 
                });
            }

            // Apply limit
            if (options.limit) {
                query = query.limit(options.limit);
            }

            const { data, error } = await query;
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error(`Select error on ${table}:`, error);
            return { success: false, error: error.message };
        }
    }

    async insert(table, data) {
        try {
            const { data: result, error } = await this.supabase
                .from(table)
                .insert(data)
                .select();
            
            if (error) throw error;
            return { success: true, data: result };
        } catch (error) {
            console.error(`Insert error on ${table}:`, error);
            return { success: false, error: error.message };
        }
    }

    async update(table, id, updates, idColumn = 'id') {
        try {
            const { data, error } = await this.supabase
                .from(table)
                .update(updates)
                .eq(idColumn, id)
                .select();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error(`Update error on ${table}:`, error);
            return { success: false, error: error.message };
        }
    }

    async delete(table, id, idColumn = 'id') {
        try {
            const { error } = await this.supabase
                .from(table)
                .delete()
                .eq(idColumn, id);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error(`Delete error on ${table}:`, error);
            return { success: false, error: error.message };
        }
    }
}

// Business-specific API
class BusinessAPI extends API {
    constructor() {
        super();
    }

    // 대시보드 통계 조회
    async getDashboardStats(authUid) {
        try {
            // 프로필 조회
            const profile = await this.select('business_users', { auth_uid: authUid });
            if (!profile.success) throw new Error('프로필 조회 실패');

            // 공간 수 조회
            const spaces = await this.select('spaces', { owner_id: authUid });
            
            // 작업 통계 조회
            const jobs = await this.select('jobs', { business_id: authUid });
            
            const stats = {
                profile: profile.data[0],
                spaceCount: spaces.data?.length || 0,
                activeJobs: jobs.data?.filter(j => ['pending', 'assigned', 'in_progress'].includes(j.status)).length || 0,
                completedJobs: jobs.data?.filter(j => j.status === 'completed').length || 0,
                monthlySpent: this.calculateMonthlySpent(jobs.data || [])
            };

            return { success: true, data: stats };
        } catch (error) {
            console.error('Dashboard stats error:', error);
            return { success: false, error: error.message };
        }
    }

    // 공간 관리
    async getSpaces(authUid) {
        return await this.select('spaces', { owner_id: authUid }, {
            order: { column: 'created_at', ascending: false }
        });
    }

    async createSpace(authUid, spaceData) {
        const data = {
            ...spaceData,
            owner_id: authUid,
            created_at: new Date().toISOString()
        };
        return await this.insert('spaces', data);
    }

    async updateSpace(spaceId, updates) {
        return await this.update('spaces', spaceId, {
            ...updates,
            updated_at: new Date().toISOString()
        });
    }

    async deleteSpace(spaceId) {
        return await this.delete('spaces', spaceId);
    }

    // 작업 관리
    async getJobs(authUid) {
        return await this.select('jobs', { business_id: authUid }, {
            select: `
                *,
                space:spaces(name, address),
                partner:partners_users(name, phone, rating)
            `,
            order: { column: 'created_at', ascending: false }
        });
    }

    async createJob(authUid, jobData) {
        const data = {
            ...jobData,
            business_id: authUid,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        return await this.insert('jobs', data);
    }

    async assignPartner(jobId, partnerId) {
        return await this.update('jobs', jobId, {
            partner_id: partnerId,
            status: 'assigned',
            updated_at: new Date().toISOString()
        });
    }

    // 유틸리티
    calculateMonthlySpent(jobs) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return jobs
            .filter(job => {
                if (job.status !== 'completed' || !job.final_price) return false;
                const jobDate = new Date(job.created_at);
                return jobDate.getMonth() === currentMonth && 
                       jobDate.getFullYear() === currentYear;
            })
            .reduce((sum, job) => sum + parseFloat(job.final_price || 0), 0);
    }
}

// Partners-specific API
class PartnersAPI extends API {
    constructor() {
        super();
    }

    // 대시보드 통계 조회
    async getDashboardStats(authUid) {
        try {
            // 프로필 조회
            const profile = await this.select('partners_users', { auth_uid: authUid });
            if (!profile.success) throw new Error('프로필 조회 실패');

            // 작업 통계 조회
            const jobs = await this.select('jobs', { partner_id: authUid });
            
            const stats = {
                profile: profile.data[0],
                rating: profile.data[0]?.rating || 0,
                completedJobs: profile.data[0]?.completed_jobs || 0,
                monthlyEarnings: profile.data[0]?.this_month_earnings || 0,
                activeJobs: jobs.data?.filter(j => ['assigned', 'in_progress'].includes(j.status)).length || 0,
                pendingApplications: 0 // TODO: job_applications 테이블 조회
            };

            return { success: true, data: stats };
        } catch (error) {
            console.error('Dashboard stats error:', error);
            return { success: false, error: error.message };
        }
    }

    // 작업 검색 (지원 가능한 작업)
    async getAvailableJobs() {
        return await this.select('jobs', { status: 'pending' }, {
            select: `
                *,
                space:spaces(name, address, area),
                business:business_users(business_name, phone)
            `,
            order: { column: 'scheduled_date', ascending: true }
        });
    }

    // 내 작업 조회
    async getMyJobs(authUid) {
        return await this.select('jobs', { partner_id: authUid }, {
            select: `
                *,
                space:spaces(name, address),
                business:business_users(business_name, phone)
            `,
            order: { column: 'scheduled_date', ascending: true }
        });
    }

    // 작업 지원
    async applyForJob(jobId, partnerId, message = '') {
        const application = {
            job_id: jobId,
            partner_id: partnerId,
            message: message,
            applied_at: new Date().toISOString(),
            status: 'pending'
        };
        return await this.insert('job_applications', application);
    }

    // 작업 상태 업데이트
    async updateJobStatus(jobId, status, additionalData = {}) {
        const updates = {
            status: status,
            ...additionalData,
            updated_at: new Date().toISOString()
        };

        // 상태별 추가 데이터
        if (status === 'in_progress') {
            updates.actual_start_time = new Date().toISOString();
        } else if (status === 'completed') {
            updates.actual_end_time = new Date().toISOString();
        }

        return await this.update('jobs', jobId, updates);
    }

    // 프로필 업데이트
    async updateProfile(authUid, updates) {
        return await this.update('partners_users', authUid, {
            ...updates,
            updated_at: new Date().toISOString()
        }, 'auth_uid');
    }
}

// 전역 API 인스턴스
const api = new API();
const businessAPI = new BusinessAPI();
const partnersAPI = new PartnersAPI();