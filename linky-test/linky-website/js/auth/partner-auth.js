// 파트너 사용자 인증
// partner_users 테이블 전용

class PartnerAuth extends AuthManager {
  constructor() {
    super('partner');
  }

  // 파트너 프로필 데이터 준비
  prepareProfileData(authUid, formData) {
    return {
      auth_uid: authUid,
      email: formData.email,
      phone: formData.phone || '',
      name: formData.name,
      residence: formData.residence,
      work_areas: formData.workAreas || [],
      transportation: formData.transportation || null,
      available_times: this.formatAvailableTimes(formData.availableTimes),
      status: 'pending'
    };
  }

  // 가능 시간 포맷팅
  formatAvailableTimes(availableTimes) {
    if (!availableTimes || !Array.isArray(availableTimes)) {
      return { weekday: [], weekend: [] };
    }

    const times = {
      weekday: [],
      weekend: []
    };

    availableTimes.forEach(time => {
      if (time.includes('weekday')) {
        const period = time.replace('weekday_', '');
        times.weekday.push(period);
      } else if (time.includes('weekend')) {
        const period = time.replace('weekend_', '');
        times.weekend.push(period);
      }
    });

    return times;
  }

  // 파트너 정보 검증
  validatePartnerData(formData) {
    const errors = [];

    // 필수 필드 확인
    if (!formData.email) errors.push('이메일을 입력해주세요.');
    if (!formData.password) errors.push('비밀번호를 입력해주세요.');
    if (!formData.name) errors.push('이름을 입력해주세요.');
    if (!formData.phone) errors.push('전화번호를 입력해주세요.');
    if (!formData.residence) errors.push('거주 지역을 입력해주세요.');
    if (!formData.workAreas || formData.workAreas.length === 0) {
      errors.push('활동 희망 지역을 하나 이상 선택해주세요.');
    }

    // 이메일 형식 확인
    if (formData.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        errors.push('올바른 이메일 주소를 입력해주세요.');
      }
    }

    // 전화번호 형식 확인
    if (formData.phone) {
      const phonePattern = /^(010|011|016|017|018|019)-?\d{3,4}-?\d{4}$/;
      if (!phonePattern.test(formData.phone.replace(/-/g, ''))) {
        errors.push('올바른 휴대폰 번호를 입력해주세요.');
      }
    }

    return errors;
  }

  // 파트너 회원가입 (검증 포함)
  async signUp(formData) {
    // 데이터 검증
    const errors = this.validatePartnerData(formData);
    if (errors.length > 0) {
      return { success: false, error: errors.join('\n') };
    }

    // 부모 클래스의 signUp 호출
    return await super.signUp(formData);
  }

  // 파트너 프로필 업데이트
  async updateProfile(updates) {
    const supabase = this.getSupabase();
    if (!supabase) {
      return { success: false, error: 'Supabase not initialized' };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      // available_times 포맷팅
      if (updates.availableTimes) {
        updates.available_times = this.formatAvailableTimes(updates.availableTimes);
        delete updates.availableTimes;
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('auth_uid', user.id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, profile: data };
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // 활동 지역 업데이트
  async updateWorkAreas(areas) {
    return await this.updateProfile({ work_areas: areas });
  }

  // 가능한 작업 목록 가져오기
  async getAvailableJobs() {
    const supabase = this.getSupabase();
    if (!supabase) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from(this.tableName)
        .select('work_areas')
        .eq('auth_uid', user.id)
        .single();

      if (!profile || !profile.work_areas) return [];

      // 파트너의 활동 지역에 해당하는 작업 조회
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select(`
          *,
          spaces (
            name,
            address,
            type
          )
        `)
        .eq('status', 'pending')
        .in('area', profile.work_areas)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return jobs || [];
    } catch (error) {
      console.error('작업 목록 조회 오류:', error);
      return [];
    }
  }

  // 내 작업 목록 가져오기
  async getMyJobs(status = null) {
    const supabase = this.getSupabase();
    if (!supabase) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('auth_uid', user.id)
        .single();

      if (!profile) return [];

      let query = supabase
        .from('jobs')
        .select(`
          *,
          spaces (
            name,
            address,
            type
          ),
          business_users (
            business_name,
            phone
          )
        `)
        .eq('partner_id', profile.id);

      if (status) {
        query = query.eq('status', status);
      }

      const { data: jobs, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      return jobs || [];
    } catch (error) {
      console.error('내 작업 목록 조회 오류:', error);
      return [];
    }
  }

  // 실적 통계 가져오기
  async getStats() {
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from(this.tableName)
        .select('rating, completed_jobs, cancelled_jobs, total_earnings, this_month_earnings, level')
        .eq('auth_uid', user.id)
        .single();

      return profile;
    } catch (error) {
      console.error('실적 통계 조회 오류:', error);
      return null;
    }
  }
}

// 전역 인스턴스 생성
window.partnerAuth = new PartnerAuth();