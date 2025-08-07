// Authentication Manager
class AuthManager {
    constructor() {
        // Supabase 클라이언트 초기화
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.error('Supabase client not loaded');
            throw new Error('Supabase 클라이언트가 로드되지 않았습니다.');
        }
        
        this.currentUser = null;
        this.userType = null;
        this.userProfile = null;
    }

    // 로그인
    async login(email, password, userType) {
        try {
            // 1. Supabase 인증
            const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (authError) throw authError;

            // 2. 사용자 타입 확인 및 프로필 조회
            const profile = await this.getUserProfile(authData.user.id, userType);
            
            if (!profile) {
                await this.logout();
                throw new Error('해당 사용자 타입으로 등록된 계정이 없습니다.');
            }

            // 3. 세션 정보 저장
            this.currentUser = authData.user;
            this.userType = userType;
            this.userProfile = profile;
            
            // 로컬 스토리지에 사용자 타입 저장
            localStorage.setItem('userType', userType);
            
            return {
                success: true,
                user: authData.user,
                profile: profile
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 로그아웃
    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;

            // 세션 정보 초기화
            this.currentUser = null;
            this.userType = null;
            this.userProfile = null;
            
            // 로컬 스토리지 정리
            localStorage.removeItem('userType');
            
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }

    // 현재 세션 확인
    async checkSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error || !session) {
                return null;
            }

            // 저장된 사용자 타입 확인
            const userType = localStorage.getItem('userType');
            if (!userType) {
                return null;
            }

            // 프로필 조회
            const profile = await this.getUserProfile(session.user.id, userType);
            if (!profile) {
                await this.logout();
                return null;
            }

            this.currentUser = session.user;
            this.userType = userType;
            this.userProfile = profile;
            
            return {
                user: session.user,
                userType: userType,
                profile: profile
            };
        } catch (error) {
            console.error('Session check error:', error);
            return null;
        }
    }

    // 사용자 프로필 조회
    async getUserProfile(authUid, userType) {
        try {
            let tableName;
            
            switch(userType) {
                case 'business':
                    tableName = 'business_users';
                    break;
                case 'partners':
                    tableName = 'partners_users';
                    break;
                case 'admin':
                    tableName = 'admins';
                    break;
                default:
                    throw new Error('Invalid user type');
            }

            const { data, error } = await this.supabase
                .from(tableName)
                .select('*')
                .eq('auth_uid', authUid)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get profile error:', error);
            return null;
        }
    }

    // 인증 필요한 페이지 보호
    async requireAuth(requiredType = null) {
        const session = await this.checkSession();
        
        if (!session) {
            // 로그인 페이지로 리다이렉트
            this.redirectToLogin();
            return false;
        }

        // 특정 사용자 타입이 필요한 경우
        if (requiredType && session.userType !== requiredType) {
            alert('접근 권한이 없습니다.');
            this.redirectToLogin();
            return false;
        }

        return true;
    }

    // 로그인 페이지로 리다이렉트
    redirectToLogin() {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('/business/')) {
            window.location.href = ROUTES.business.login;
        } else if (currentPath.includes('/partners/')) {
            window.location.href = ROUTES.partners.login;
        } else {
            window.location.href = ROUTES.landing;
        }
    }

    // 대시보드로 리다이렉트
    redirectToDashboard(userType) {
        if (userType === 'business') {
            window.location.href = ROUTES.business.dashboard;
        } else if (userType === 'partners') {
            window.location.href = ROUTES.partners.dashboard;
        }
    }

    // 회원가입
    async signup(email, password, userType, profileData) {
        try {
            // 1. Supabase Auth 회원가입
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email: email,
                password: password
            });

            if (authError) throw authError;

            // 2. 프로필 생성
            const tableName = userType === 'business' ? 'business_users' : 'partners_users';
            
            const profileToInsert = {
                ...profileData,
                auth_uid: authData.user.id,
                email: email,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            const { data: profile, error: profileError } = await this.supabase
                .from(tableName)
                .insert([profileToInsert])
                .select()
                .single();

            if (profileError) {
                // 프로필 생성 실패시 Auth 사용자 삭제 시도
                console.error('Profile creation failed:', profileError);
                throw profileError;
            }

            return {
                success: true,
                user: authData.user,
                profile: profile
            };
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// 전역 인스턴스 생성
const authManager = new AuthManager();

// TODO: 페이지별 인증 체크는 각 페이지에서 직접 호출하도록 변경
// 자동 실행으로 인한 원하지 않는 리다이렉트 방지를 위해 주석 처리
/*
document.addEventListener('DOMContentLoaded', async () => {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath.includes('signup.html');
    
    if (!isLoginPage && !currentPath.includes('/landing/')) {
        // 인증이 필요한 페이지
        const requiredType = currentPath.includes('/business/') ? 'business' : 
                           currentPath.includes('/partners/') ? 'partners' : null;
        
        await authManager.requireAuth(requiredType);
    }
});
*/