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
            console.log('🔐 Login attempt:', { email, userType });
            
            // 1. Supabase 인증
            const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (authError) {
                console.error('❌ Auth error:', authError);
                throw authError;
            }

            console.log('✅ Auth successful, user ID:', authData.user.id);
            console.log('📋 Session info:', authData.session ? 'Session established' : 'No session');

            // 세션이 확립될 때까지 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 100));

            // 2. 사용자 타입 확인 및 프로필 조회
            console.log('🔍 Getting user profile for:', { authUid: authData.user.id, userType });
            const profile = await this.getUserProfile(authData.user.id, userType);
            
            console.log('📊 Profile result:', profile ? `Found profile ID: ${profile.id}` : 'No profile found');
            
            if (!profile) {
                console.error('❌ No profile found for user type:', userType);
                console.log('💡 Tip: Check if profile exists in', userType === 'partners' ? 'partners_users' : 'business_users', 'table');
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
                    tableName = 'admin_users';
                    break;
                default:
                    throw new Error('Invalid user type');
            }

            console.log('📂 Querying table:', tableName, 'for auth_uid:', authUid);
            
            // 현재 세션 확인
            const { data: { session } } = await this.supabase.auth.getSession();
            console.log('🔑 Current session auth.uid():', session?.user?.id);
            
            // RLS 문제를 피하기 위해 stored function 사용
            let data, error;
            
            if (userType === 'partners') {
                console.log('🔍 Using get_partner_profile function...');
                const result = await this.supabase.rpc('get_partner_profile', {
                    p_auth_uid: authUid
                });
                data = result.data;
                error = result.error;
            } else if (userType === 'business') {
                console.log('🔍 Using get_business_profile function...');
                const result = await this.supabase.rpc('get_business_profile', {
                    p_auth_uid: authUid
                });
                data = result.data;
                error = result.error;
            } else {
                // admin이나 다른 타입은 기존 방식 사용
                const result = await this.supabase
                    .from(tableName)
                    .select('*')
                    .eq('auth_uid', authUid)
                    .single();
                data = result.data;
                error = result.error;
            }

            if (error) {
                console.error('❌ Profile query error:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
                throw error;
            }
            
            console.log('✅ Profile found:', data ? `ID: ${data.id}, Email: ${data.email}` : 'No data');
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
            console.log('🔐 Step 1: Starting Supabase Auth signup...');
            console.log('📧 Email:', email);
            console.log('👤 User type:', userType);
            
            // 1. Supabase Auth 회원가입
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email: email,
                password: password
            });

            console.log('📋 Auth response:', { 
                user: authData?.user?.id, 
                error: authError?.message 
            });

            if (authError) {
                console.error('🚨 Auth signup failed:', authError);
                throw authError;
            }

            if (!authData?.user?.id) {
                console.error('🚨 Auth user ID missing:', authData);
                throw new Error('회원가입 중 사용자 ID를 받을 수 없습니다.');
            }

            console.log('✅ Auth user created:', authData.user.id);
            console.log('🔗 Step 2: Creating profile using stored function...');

            // 2. 프로필 생성 - RLS를 우회하기 위해 stored function 사용
            let profile;
            let profileError;
            
            if (userType === 'business') {
                console.log('📝 Creating business profile with function...');
                const { data, error } = await this.supabase
                    .rpc('create_business_profile', {
                        p_auth_uid: authData.user.id,
                        p_email: email,
                        p_business_name: profileData.business_name,
                        p_business_type: profileData.business_type,
                        p_owner_name: profileData.owner_name || profileData.representative_name,
                        p_phone: profileData.phone,
                        p_address: profileData.address || profileData.business_address,
                        p_business_registration_number: profileData.business_registration_number
                    });
                profile = data;
                profileError = error;
            } else if (userType === 'partners') {
                console.log('📝 Creating partner profile with function...');
                const { data, error } = await this.supabase
                    .rpc('create_partner_profile', {
                        p_auth_uid: authData.user.id,
                        p_email: email,
                        p_name: profileData.name,
                        p_phone: profileData.phone,
                        p_birth_date: profileData.birth_date || null,
                        p_gender: profileData.gender || null,
                        p_address: profileData.address || null,
                        p_bio: profileData.bio || null,
                        p_preferred_job_types: profileData.preferred_job_types || null,
                        p_preferred_areas: profileData.preferred_areas || null
                    });
                profile = data;
                profileError = error;
            } else {
                throw new Error('Invalid user type');
            }

            console.log('📝 Profile creation params:', {
                userType,
                auth_uid: authData.user.id,
                email: email,
                hasProfile: !!profile,
                hasError: !!profileError
            });

            console.log('📊 Profile creation result:', { 
                profile: profile?.id, 
                error: profileError?.message,
                errorCode: profileError?.code,
                errorDetails: profileError?.details
            });

            if (profileError) {
                console.error('🚨 Profile creation failed - attempting Auth cleanup');
                console.error('Full error details:', profileError);
                
                // 프로필 생성 실패시 Auth 사용자 정리 시도 (시도만 하고 에러는 무시)
                try {
                    console.log('🗑️ Attempting to clean up Auth user...');
                    await this.supabase.auth.admin.deleteUser(authData.user.id);
                    console.log('✅ Auth cleanup successful');
                } catch (cleanupError) {
                    console.warn('⚠️ Auth cleanup failed (non-critical):', cleanupError.message);
                }
                
                throw new Error(`프로필 생성 실패: ${profileError.message}`);
            }

            if (!profile) {
                throw new Error('프로필이 생성되었지만 데이터를 받을 수 없습니다.');
            }

            console.log('✅ Profile created successfully:', profile.id);
            console.log('🎯 Step 3: Setting up session...');

            // 3. 회원가입 성공 시 자동 로그인 처리
            this.currentUser = authData.user;
            this.userType = userType;
            this.userProfile = profile;
            
            // 로컬 스토리지에 사용자 타입 저장
            localStorage.setItem('userType', userType);

            console.log('🎉 Signup completed successfully!');
            console.log('👤 User ID:', authData.user.id);
            console.log('📋 Profile ID:', profile.id);

            return {
                success: true,
                user: authData.user,
                profile: profile
            };
        } catch (error) {
            console.error('🚨 Complete signup process failed:', error);
            console.error('Error stack:', error.stack);
            
            return {
                success: false,
                error: error.message || '회원가입 중 알 수 없는 오류가 발생했습니다.'
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