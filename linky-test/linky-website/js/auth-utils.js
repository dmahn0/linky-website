// 인증 관련 공통 유틸리티 함수들 - Supabase 버전

// 사용자 로그인 시 처리
async function handleUserLoggedIn(user) {
    try {
        // Supabase에서 사용자 정보 가져오기
        const { data: userData, error } = await window.supabaseClient
            .from('users')
            .select('*')
            .eq('uid', user.id)
            .single();

        if (error || !userData) {
            console.warn('사용자 문서가 존재하지 않습니다:', error);
            return null;
        }
        
        // 승인 상태 확인 (status가 없는 경우 approved로 간주)
        if (userData.status && userData.status !== 'approved') {
            console.log('사용자 승인 대기 중:', userData.status);
            
            if (userData.status === 'pending') {
                showPendingApprovalMessage();
            } else if (userData.status === 'rejected') {
                showRejectedMessage();
            }
            
            // 승인되지 않은 사용자는 로그아웃
            await window.supabaseClient.auth.signOut();
            return null;
        }
        
        // status가 없으면 approved로 설정
        if (!userData.status) {
            userData.status = 'approved';
            console.log('User status not set, defaulting to approved');
        }

        // uid가 포함된 완전한 사용자 데이터
        const completeUserData = {
            uid: user.id,
            email: user.email,
            ...userData
        };

        // 전역 사용자 객체 업데이트
        window.currentUser = completeUserData;

        // UI 업데이트
        updateUIForAuthState(true, completeUserData);
        
        // 헤더 컴포넌트 업데이트
        if (window.headerComponent) {
            window.headerComponent.updateAuthState(completeUserData);
        }

        // Analytics 트래킹
        if (typeof trackEvent !== 'undefined') {
            trackEvent('User', 'login', userData.type);
        }

        return completeUserData;
    } catch (error) {
        console.error('사용자 로그인 처리 오류:', error);
        return null;
    }
}

// 사용자 로그아웃 시 처리
function handleUserLoggedOut() {
    // 전역 사용자 객체 초기화
    window.currentUser = null;

    // UI 업데이트
    updateUIForAuthState(false);
    
    // 헤더 컴포넌트 업데이트
    if (window.headerComponent) {
        window.headerComponent.updateAuthState(null);
    }

    // Analytics 트래킹
    if (typeof trackEvent !== 'undefined') {
        trackEvent('User', 'logout');
    }
}

// 인증 상태에 따른 UI 업데이트
function updateUIForAuthState(isAuthenticated, userData = null) {
    const authRequired = document.querySelectorAll('.auth-required');
    const loginRequired = document.querySelectorAll('.login-required');
    const userNameElements = document.querySelectorAll('.user-name');

    if (isAuthenticated && userData) {
        // 로그인 상태
        authRequired.forEach(el => el.style.display = 'block');
        loginRequired.forEach(el => el.style.display = 'none');
        userNameElements.forEach(el => el.textContent = userData.name || '사용자');

        // 사용자 타입별 메뉴 표시
        updateMenuByUserType(userData.type);
    } else {
        // 로그아웃 상태
        authRequired.forEach(el => el.style.display = 'none');
        loginRequired.forEach(el => el.style.display = 'block');
    }
}

// 사용자 타입별 메뉴 업데이트
function updateMenuByUserType(userType) {
    const businessMenus = document.querySelectorAll('.business-menu');
    const partnerMenus = document.querySelectorAll('.partner-menu');
    const adminMenus = document.querySelectorAll('.admin-menu');

    // 모든 메뉴 숨기기
    businessMenus.forEach(menu => menu.style.display = 'none');
    partnerMenus.forEach(menu => menu.style.display = 'none');
    adminMenus.forEach(menu => menu.style.display = 'none');

    // 사용자 타입에 따라 메뉴 표시
    switch (userType) {
        case 'business':
            businessMenus.forEach(menu => menu.style.display = 'block');
            break;
        case 'partner':
            partnerMenus.forEach(menu => menu.style.display = 'block');
            break;
        case 'admin':
            adminMenus.forEach(menu => menu.style.display = 'block');
            businessMenus.forEach(menu => menu.style.display = 'block');
            partnerMenus.forEach(menu => menu.style.display = 'block');
            break;
    }
}

// 승인 대기 메시지 표시
function showPendingApprovalMessage() {
    const message = `
        <div class="alert info" style="display: block; text-align: center; max-width: 600px; margin: 20px auto;">
            <h3 style="margin-bottom: 10px;">승인 대기 중입니다</h3>
            <p>회원가입이 완료되었습니다. 관리자 승인 후 서비스를 이용하실 수 있습니다.</p>
            <p>영업일 기준 1-2일 내에 처리됩니다.</p>
        </div>
    `;
    
    const container = document.querySelector('.hero-section') || document.querySelector('main');
    if (container) {
        container.innerHTML = message;
    }
}

// 거부 메시지 표시
function showRejectedMessage() {
    const message = `
        <div class="alert error" style="display: block; text-align: center; max-width: 600px; margin: 20px auto;">
            <h3 style="margin-bottom: 10px;">승인이 거부되었습니다</h3>
            <p>회원가입 승인이 거부되었습니다.</p>
            <p>자세한 사항은 고객센터(help@linkykorea.com)로 문의해주세요.</p>
        </div>
    `;
    
    const container = document.querySelector('.hero-section') || document.querySelector('main');
    if (container) {
        container.innerHTML = message;
    }
}

// 인증 상태 확인
async function checkAuthStatus() {
    try {
        // Supabase 현재 세션 확인
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (session && session.user) {
            console.log('Auth state: authenticated', session.user.id);
            const userData = await handleUserLoggedIn(session.user);
            console.log('User data after login handling:', userData);
            return { isAuthenticated: true, user: userData };
        } else {
            console.log('Auth state: not authenticated');
            handleUserLoggedOut();
            return { isAuthenticated: false, user: null };
        }
    } catch (error) {
        console.error('인증 상태 확인 오류:', error);
        handleUserLoggedOut();
        return { isAuthenticated: false, user: null };
    }
}

// Supabase 인증 상태 변화 리스너 설정
function setupAuthListener() {
    if (!window.supabaseClient) {
        console.warn('setupAuthListener: supabaseClient not ready, retrying...');
        setTimeout(setupAuthListener, 100);
        return;
    }
    
    window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session) {
            await handleUserLoggedIn(session.user);
        } else if (event === 'SIGNED_OUT') {
            handleUserLoggedOut();
        }
    });
}

// 보호된 페이지 접근 확인
async function requireAuth(allowedTypes = ['business', 'partner', 'admin']) {
    const { isAuthenticated, user } = await checkAuthStatus();
    
    if (!isAuthenticated || !user) {
        alert('로그인이 필요합니다.');
        window.location.replace('/');
        return false;
    }

    if (!allowedTypes.includes(user.type)) {
        alert('접근 권한이 없습니다.');
        window.location.replace('/');
        return false;
    }

    return true;
}

// 로그아웃 처리 (전역 함수)
async function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        try {
            await window.supabaseClient.auth.signOut();
            if (typeof trackEvent !== 'undefined') {
                trackEvent('User', 'logout');
            }
            window.location.replace('/');
        } catch (error) {
            console.error('로그아웃 오류:', error);
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    }
}

// 페이지 로드 시 인증 리스너 설정
if (typeof window !== 'undefined') {
    // supabaseReady 이벤트 리스너
    window.addEventListener('supabaseReady', () => {
        console.log('auth-utils: supabaseReady 이벤트 받음');
        setupAuthListener();
    });
    
    // 이미 로드된 경우 즉시 실행
    if (window.supabaseClient) {
        setupAuthListener();
    }
}