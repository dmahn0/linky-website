// 비즈니스 사용자 전용 API
class BusinessAPI {
    constructor() {
        this.tableName = 'business_users';
    }

    // 프로필 조회
    async getProfile(authUid) {
        try {
            const { data, error } = await window.supabaseClient
                .from(this.tableName)
                .select('*')
                .eq('auth_uid', authUid)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('프로필 조회 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 프로필 업데이트
    async updateProfile(authUid, updates) {
        try {
            const { data, error } = await window.supabaseClient
                .from(this.tableName)
                .update(updates)
                .eq('auth_uid', authUid)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('프로필 업데이트 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 비즈니스 정보 업데이트 (사업자번호, 주소 등)
    async updateBusinessInfo(authUid, businessInfo) {
        const allowedFields = [
            'business_name',
            'business_number',
            'business_type',
            'business_address',
            'representative_name'
        ];

        // 허용된 필드만 필터링
        const filteredInfo = {};
        for (const [key, value] of Object.entries(businessInfo)) {
            if (allowedFields.includes(key)) {
                filteredInfo[key] = value;
            }
        }

        return this.updateProfile(authUid, filteredInfo);
    }

    // 은행 정보 업데이트
    async updateBankInfo(authUid, bankInfo) {
        try {
            const { bank_name, account_number, account_holder } = bankInfo;
            
            // 모든 필드가 있거나 모두 없어야 함
            if ((bank_name || account_number || account_holder) && 
                !(bank_name && account_number && account_holder)) {
                throw new Error('은행 정보는 모든 필드를 입력해야 합니다.');
            }

            const { data, error } = await window.supabaseClient
                .from(this.tableName)
                .update({
                    bank_name,
                    account_number,
                    account_holder
                })
                .eq('auth_uid', authUid)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('은행 정보 업데이트 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 공간 목록 조회
    async getSpaces(authUid) {
        try {
            const { data, error } = await window.supabaseClient
                .from('spaces')
                .select('*')
                .eq('owner_id', authUid)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('공간 목록 조회 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 공간 생성
    async createSpace(authUid, spaceData) {
        try {
            const { data, error } = await window.supabaseClient
                .from('spaces')
                .insert({
                    ...spaceData,
                    owner_id: authUid
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('공간 생성 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 공간 업데이트
    async updateSpace(spaceId, authUid, updates) {
        try {
            const { data, error } = await window.supabaseClient
                .from('spaces')
                .update(updates)
                .eq('id', spaceId)
                .eq('owner_id', authUid)  // 본인 소유 공간만 수정 가능
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('공간 업데이트 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 공간 삭제
    async deleteSpace(spaceId, authUid) {
        try {
            const { error } = await window.supabaseClient
                .from('spaces')
                .delete()
                .eq('id', spaceId)
                .eq('owner_id', authUid);  // 본인 소유 공간만 삭제 가능

            if (error) throw error;
            return { error: null };
        } catch (error) {
            console.error('공간 삭제 오류:', error);
            return { error: error.message };
        }
    }

    // 작업 요청 목록 조회
    async getJobs(authUid, status = null) {
        try {
            let query = window.supabaseClient
                .from('jobs')
                .select(`
                    *,
                    space:spaces(name, address),
                    partner:partner_users(name, phone)
                `)
                .eq('business_id', authUid)
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('작업 목록 조회 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 작업 요청 생성
    async createJob(authUid, jobData) {
        try {
            const { data, error } = await window.supabaseClient
                .from('jobs')
                .insert({
                    ...jobData,
                    business_id: authUid,
                    status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('작업 생성 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 작업 상태 업데이트
    async updateJobStatus(jobId, authUid, status) {
        try {
            const allowedStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
            if (!allowedStatuses.includes(status)) {
                throw new Error('유효하지 않은 상태입니다.');
            }

            const { data, error } = await window.supabaseClient
                .from('jobs')
                .update({ status })
                .eq('id', jobId)
                .eq('business_id', authUid)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('작업 상태 업데이트 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 통계 조회
    async getStatistics(authUid) {
        try {
            // 이번 달 통계
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const { data: monthlyJobs, error: monthlyError } = await window.supabaseClient
                .from('jobs')
                .select('id, status, price')
                .eq('business_id', authUid)
                .gte('created_at', startOfMonth.toISOString());

            if (monthlyError) throw monthlyError;

            // 전체 통계
            const { data: profile, error: profileError } = await window.supabaseClient
                .from(this.tableName)
                .select('monthly_usage, total_spent, space_count')
                .eq('auth_uid', authUid)
                .single();

            if (profileError) throw profileError;

            // 통계 계산
            const stats = {
                monthly: {
                    total_jobs: monthlyJobs.length,
                    completed_jobs: monthlyJobs.filter(j => j.status === 'completed').length,
                    pending_jobs: monthlyJobs.filter(j => j.status === 'pending').length,
                    monthly_spent: monthlyJobs
                        .filter(j => j.status === 'completed')
                        .reduce((sum, j) => sum + (j.price || 0), 0)
                },
                total: {
                    monthly_usage: profile.monthly_usage || 0,
                    total_spent: profile.total_spent || 0,
                    space_count: profile.space_count || 0
                }
            };

            return { data: stats, error: null };
        } catch (error) {
            console.error('통계 조회 오류:', error);
            return { data: null, error: error.message };
        }
    }
}

// 전역 인스턴스 생성
const businessAPI = new BusinessAPI();