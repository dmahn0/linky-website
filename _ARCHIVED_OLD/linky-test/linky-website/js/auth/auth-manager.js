// 공통 인증 관리자
// 비즈니스/파트너 공통 인증 로직 처리

class AuthManager {
  constructor(userType) {
    this.userType = userType; // 'business' or 'partner'
    this.tableName = `${userType}_users`;
    this.redirectPath = userType === 'business' ? './business/dashboard.html' : './partners/dashboard.html';
  }

  // Supabase 클라이언트 가져오기
  getSupabase() {
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      return null;
    }
    return window.supabaseClient;
  }

  // 회원가입
  async signUp(formData) {
    const supabase = this.getSupabase();
    if (!supabase) {
      return { success: false, error: 'Supabase not initialized' };
    }

    try {
      // 1. Supabase Auth에 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: this.userType
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('사용자 생성 실패');

      // 2. 해당 테이블에 프로필 생성
      const profileData = this.prepareProfileData(authData.user.id, formData);
      const { error: profileError } = await supabase
        .from(this.tableName)
        .insert([profileData]);

      if (profileError) {
        console.error('프로필 생성 오류:', profileError);
        // Auth 사용자는 이미 생성되었으므로 롤백 불가
        throw profileError;
      }

      return { success: true, user: authData.user };
    } catch (error) {
      console.error('회원가입 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // 로그인
  async signIn(email, password) {
    const supabase = this.getSupabase();
    if (!supabase) {
      return { success: false, error: 'Supabase not initialized' };
    }

    try {
      // 1. Supabase Auth로 로그인
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('로그인 실패');

      // 2. 프로필 조회
      const { data: profile, error: profileError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('auth_uid', authData.user.id)
        .single();

      if (profileError || !profile) {
        // 프로필이 없는 경우
        console.error('프로필 조회 오류:', profileError);
        await supabase.auth.signOut();
        throw new Error('프로필 정보가 없습니다. 관리자에게 문의하세요.');
      }

      // 3. 사용자 타입 확인
      if (profile.status !== 'approved' && profile.status !== 'pending') {
        await supabase.auth.signOut();
        throw new Error('계정이 승인되지 않았습니다.');
      }

      return { 
        success: true, 
        user: authData.user,
        profile: profile
      };
    } catch (error) {
      console.error('로그인 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // 로그아웃
  async signOut() {
    const supabase = this.getSupabase();
    if (!supabase) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // 메인 페이지로 리다이렉트
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  }

  // 프로필 데이터 준비 (자식 클래스에서 오버라이드 필요)
  prepareProfileData(authUid, formData) {
    // 기본 구현 - 자식 클래스에서 반드시 오버라이드해야 함
    throw new Error('prepareProfileData 메서드는 자식 클래스에서 구현해야 합니다.');
  }

  // 현재 사용자 가져오기
  async getCurrentUser() {
    const supabase = this.getSupabase();
    if (!supabase) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // 프로필 조회
      const { data: profile } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('auth_uid', user.id)
        .single();

      return {
        auth: user,
        profile: profile
      };
    } catch (error) {
      console.error('사용자 조회 오류:', error);
      return null;
    }
  }

  // 인증 상태 리스너
  onAuthStateChange(callback) {
    const supabase = this.getSupabase();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // 프로필 조회
        const { data: profile } = await supabase
          .from(this.tableName)
          .select('*')
          .eq('auth_uid', session.user.id)
          .single();

        callback({
          auth: session.user,
          profile: profile
        });
      } else {
        callback(null);
      }
    });

    return subscription;
  }

  // 프로필 데이터 준비 (하위 클래스에서 구현)
  prepareProfileData(authUid, formData) {
    throw new Error('prepareProfileData must be implemented by subclass');
  }
}