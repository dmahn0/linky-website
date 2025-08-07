// 파트너 사용자 전용 API
class PartnerAPI {
    constructor() {
        this.tableName = 'partner_users';
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

    // 활동 지역 업데이트
    async updateWorkAreas(authUid, areas) {
        try {
            if (!Array.isArray(areas) || areas.length === 0) {
                throw new Error('최소 1개 이상의 활동 지역을 선택해야 합니다.');
            }

            const { data, error } = await window.supabaseClient
                .from(this.tableName)
                .update({ work_areas: areas })
                .eq('auth_uid', authUid)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('활동 지역 업데이트 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 활동 가능 시간 업데이트
    async updateAvailableTimes(authUid, times) {
        try {
            const { data, error } = await window.supabaseClient
                .from(this.tableName)
                .update({ available_times: times })
                .eq('auth_uid', authUid)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('활동 시간 업데이트 오류:', error);
            return { data: null, error: error.message };
        }
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

    // 내 활동 지역의 대기 중인 작업 조회
    async getAvailableJobs(partnerId) {
        try {
            // 먼저 파트너의 활동 지역 조회
            const { data: profile, error: profileError } = await this.getProfile(partnerId);
            if (profileError) throw profileError;

            const workAreas = profile.work_areas || [];
            if (workAreas.length === 0) {
                return { data: [], error: null };
            }

            // 활동 지역의 대기 중인 작업 조회
            const { data, error } = await window.supabaseClient
                .from('jobs')
                .select(`
                    *,
                    space:spaces(name, address, area, type),
                    business:business_users(business_name, phone)
                `)
                .eq('status', 'pending')
                .in('area', workAreas)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('작업 목록 조회 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 내가 수락한 작업 목록 조회
    async getMyJobs(partnerId, status = null) {
        try {
            let query = window.supabaseClient
                .from('jobs')
                .select(`
                    *,
                    space:spaces(name, address, type),
                    business:business_users(business_name, phone)
                `)
                .eq('partner_id', partnerId)
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('내 작업 목록 조회 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 작업 수락
    async acceptJob(jobId, partnerId) {
        try {
            // 먼저 작업이 아직 대기 중인지 확인
            const { data: job, error: jobError } = await window.supabaseClient
                .from('jobs')
                .select('status, partner_id')
                .eq('id', jobId)
                .single();

            if (jobError) throw jobError;

            if (job.status !== 'pending') {
                throw new Error('이미 다른 파트너가 수락한 작업입니다.');
            }

            if (job.partner_id) {
                throw new Error('이미 배정된 작업입니다.');
            }

            // 작업 수락
            const { data, error } = await window.supabaseClient
                .from('jobs')
                .update({
                    partner_id: partnerId,
                    status: 'accepted',
                    accepted_at: new Date().toISOString()
                })
                .eq('id', jobId)
                .eq('status', 'pending')  // 다시 한번 체크
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('작업 수락 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 작업 상태 업데이트
    async updateJobStatus(jobId, partnerId, status) {
        try {
            const allowedStatuses = ['in_progress', 'completed'];
            if (!allowedStatuses.includes(status)) {
                throw new Error('유효하지 않은 상태입니다.');
            }

            const updates = { status };
            
            // 완료 시 완료 시간 기록
            if (status === 'completed') {
                updates.completed_at = new Date().toISOString();
            }

            const { data, error } = await window.supabaseClient
                .from('jobs')
                .update(updates)
                .eq('id', jobId)
                .eq('partner_id', partnerId)  // 본인이 수락한 작업만 업데이트 가능
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('작업 상태 업데이트 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 작업 포기
    async cancelJob(jobId, partnerId, reason) {
        try {
            const { data, error } = await window.supabaseClient
                .from('jobs')
                .update({
                    partner_id: null,
                    status: 'pending',
                    cancel_reason: reason,
                    cancelled_at: new Date().toISOString()
                })
                .eq('id', jobId)
                .eq('partner_id', partnerId)
                .in('status', ['accepted', 'in_progress'])  // 수락 또는 진행 중인 작업만 취소 가능
                .select()
                .single();

            if (error) throw error;

            // 취소 횟수 증가
            await this.incrementCancelCount(partnerId);

            return { data, error: null };
        } catch (error) {
            console.error('작업 취소 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 취소 횟수 증가
    async incrementCancelCount(partnerId) {
        try {
            const { data: profile } = await this.getProfile(partnerId);
            const currentCount = profile.cancelled_jobs || 0;

            await window.supabaseClient
                .from(this.tableName)
                .update({ cancelled_jobs: currentCount + 1 })
                .eq('auth_uid', partnerId);
        } catch (error) {
            console.error('취소 횟수 업데이트 오류:', error);
        }
    }

    // 통계 조회
    async getStatistics(partnerId) {
        try {
            const { data: profile, error: profileError } = await this.getProfile(partnerId);
            if (profileError) throw profileError;

            // 이번 달 시작일
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            // 이번 달 완료된 작업
            const { data: monthlyJobs, error: monthlyError } = await window.supabaseClient
                .from('jobs')
                .select('price, completed_at')
                .eq('partner_id', partnerId)
                .eq('status', 'completed')
                .gte('completed_at', startOfMonth.toISOString());

            if (monthlyError) throw monthlyError;

            // 이번 달 수익 계산
            const thisMonthEarnings = monthlyJobs.reduce((sum, job) => sum + (job.price || 0), 0);

            const stats = {
                profile: {
                    rating: profile.rating || 0,
                    level: profile.level || 'bronze',
                    completed_jobs: profile.completed_jobs || 0,
                    cancelled_jobs: profile.cancelled_jobs || 0,
                    total_earnings: profile.total_earnings || 0
                },
                monthly: {
                    completed_jobs: monthlyJobs.length,
                    earnings: thisMonthEarnings
                }
            };

            return { data: stats, error: null };
        } catch (error) {
            console.error('통계 조회 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 평점 조회
    async getRatings(partnerId) {
        try {
            const { data, error } = await window.supabaseClient
                .from('ratings')
                .select(`
                    *,
                    business:business_users(business_name),
                    job:jobs(id, space_id)
                `)
                .eq('partner_id', partnerId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('평점 조회 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 알림 설정 조회
    async getNotificationSettings(partnerId) {
        try {
            const { data, error } = await window.supabaseClient
                .from('notification_settings')
                .select('*')
                .eq('user_id', partnerId)
                .eq('user_type', 'partner')
                .single();

            if (error && error.code === 'PGRST116') {
                // 설정이 없으면 기본값 반환
                return {
                    data: {
                        email: true,
                        sms: true,
                        push: true,
                        marketing: false
                    },
                    error: null
                };
            }

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('알림 설정 조회 오류:', error);
            return { data: null, error: error.message };
        }
    }

    // 알림 설정 업데이트
    async updateNotificationSettings(partnerId, settings) {
        try {
            const { data, error } = await window.supabaseClient
                .from('notification_settings')
                .upsert({
                    user_id: partnerId,
                    user_type: 'partner',
                    ...settings
                })
                .eq('user_id', partnerId)
                .eq('user_type', 'partner')
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('알림 설정 업데이트 오류:', error);
            return { data: null, error: error.message };
        }
    }
}

// 전역 인스턴스 생성
const partnerAPI = new PartnerAPI();