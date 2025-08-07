// 어드민 사용자 인증
// admins 테이블 전용

class AdminAuth extends AuthManager {
  constructor() {
    super('admin');
    this.tableName = 'admins';
    this.redirectPath = './admin/dashboard.html';
  }

  // 어드민은 회원가입이 아닌 초대 방식으로만 생성
  async signUp(formData) {
    return { 
      success: false, 
      error: '어드민은 직접 회원가입할 수 없습니다. 관리자에게 문의하세요.' 
    };
  }

  // 어드민 프로필 데이터 준비 (초대 시 사용)
  prepareProfileData(authUid, formData) {
    return {
      auth_uid: authUid,
      email: formData.email,
      name: formData.name,
      role: formData.role || 'admin',
      permissions: formData.permissions || {}
    };
  }

  // 어드민 권한 확인
  async checkPermission(permission) {
    const supabase = this.getSupabase();
    if (!supabase) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: admin } = await supabase
        .from(this.tableName)
        .select('role, permissions')
        .eq('auth_uid', user.id)
        .single();

      if (!admin) return false;

      // 수퍼 어드민은 모든 권한 보유
      if (admin.role === 'super_admin') return true;

      // 일반 어드민은 permissions 확인
      return admin.permissions && admin.permissions[permission] === true;
    } catch (error) {
      console.error('권한 확인 오류:', error);
      return false;
    }
  }

  // 어드민인지 확인
  async isAdmin() {
    const supabase = this.getSupabase();
    if (!supabase) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: isAdmin } = await supabase
        .rpc('is_admin', { user_auth_uid: user.id });

      return isAdmin === true;
    } catch (error) {
      console.error('어드민 확인 오류:', error);
      return false;
    }
  }

  // 수퍼 어드민인지 확인
  async isSuperAdmin() {
    const supabase = this.getSupabase();
    if (!supabase) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: isSuperAdmin } = await supabase
        .rpc('is_super_admin', { user_auth_uid: user.id });

      return isSuperAdmin === true;
    } catch (error) {
      console.error('수퍼 어드민 확인 오류:', error);
      return false;
    }
  }

  // 사용자 승인
  async approveUser(userId, userType) {
    const supabase = this.getSupabase();
    if (!supabase) return { success: false, error: 'Supabase not initialized' };

    try {
      const { data, error } = await supabase
        .rpc('approve_user', { 
          user_id: userId, 
          user_type: userType 
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('사용자 승인 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // 모든 비즈니스 사용자 조회
  async getAllBusinessUsers() {
    const supabase = this.getSupabase();
    if (!supabase) return [];

    try {
      // 어드민 권한 확인
      if (!await this.isAdmin()) {
        throw new Error('권한이 없습니다.');
      }

      const { data, error } = await supabase
        .from('business_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('비즈니스 사용자 조회 오류:', error);
      return [];
    }
  }

  // 모든 파트너 사용자 조회
  async getAllPartnerUsers() {
    const supabase = this.getSupabase();
    if (!supabase) return [];

    try {
      // 어드민 권한 확인
      if (!await this.isAdmin()) {
        throw new Error('권한이 없습니다.');
      }

      const { data, error } = await supabase
        .from('partner_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('파트너 사용자 조회 오류:', error);
      return [];
    }
  }

  // 대시보드 통계
  async getDashboardStats() {
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      // 어드민 권한 확인
      if (!await this.isAdmin()) {
        throw new Error('권한이 없습니다.');
      }

      // 비즈니스 사용자 수
      const { count: businessCount } = await supabase
        .from('business_users')
        .select('*', { count: 'exact', head: true });

      // 파트너 사용자 수
      const { count: partnerCount } = await supabase
        .from('partner_users')
        .select('*', { count: 'exact', head: true });

      // 승인 대기 중인 사용자 수
      const { count: pendingBusinessCount } = await supabase
        .from('business_users')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: pendingPartnerCount } = await supabase
        .from('partner_users')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return {
        totalUsers: businessCount + partnerCount,
        businessUsers: businessCount,
        partnerUsers: partnerCount,
        pendingApprovals: pendingBusinessCount + pendingPartnerCount,
        pendingBusiness: pendingBusinessCount,
        pendingPartner: pendingPartnerCount
      };
    } catch (error) {
      console.error('대시보드 통계 조회 오류:', error);
      return null;
    }
  }
}

// 전역 인스턴스 생성
window.adminAuth = new AdminAuth();