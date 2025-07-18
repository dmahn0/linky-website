// 인증 관련 공통 유틸리티 함수들

// 사용자 로그인 시 처리
async function handleUserLoggedIn(user) {
    try {
        // 사용자 정보 가져오기
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            console.warn('사용자 문서가 존재하지 않습니다.');
            return null;
        }

        const userData = userDoc.data();
        
        // 승인 상태 확인 (status가 없는 경우 approved로 간주)
        if (userData.status && userData.status !== 'approved') {
            console.log('사용자 승인 대기 중:', userData.status);
            
            if (userData.status === 'pending') {
                showPendingApprovalMessage();
            } else if (userData.status === 'rejected') {
                showRejectedMessage();
            }
            
            // 승인되지 않은 사용자는 로그아웃
            await auth.signOut();
            return null;
        }
        
        // status가 없으면 approved로 설정
        if (!userData.status) {
            userData.status = 'approved';
            console.log('User status not set, defaulting to approved');
        }

        // uid가 포함된 완전한 사용자 데이터
        const completeUserData = {
            uid: user.uid,
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
        trackEvent('User', 'login', userData.type);

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
    trackEvent('User', 'logout');
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
function checkAuthStatus() {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            console.log('Auth state changed:', user ? user.uid : 'null');
            if (user) {
                const userData = await handleUserLoggedIn(user);
                console.log('User data after login handling:', userData);
                resolve({ isAuthenticated: true, user: userData });
            } else {
                handleUserLoggedOut();
                resolve({ isAuthenticated: false, user: null });
            }
            unsubscribe();
        });
    });
}

// 보호된 페이지 접근 확인
async function requireAuth(allowedTypes = ['business', 'partner', 'admin']) {
    const { isAuthenticated, user } = await checkAuthStatus();
    
    if (!isAuthenticated || !user) {
        alert('로그인이 필요합니다.');
        window.location.href = '/';
        return false;
    }

    if (!allowedTypes.includes(user.type)) {
        alert('접근 권한이 없습니다.');
        window.location.href = '/';
        return false;
    }

    return true;
}

// 로그아웃 처리 (전역 함수)
async function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        try {
            await auth.signOut();
            trackEvent('User', 'logout');
            window.location.href = '/';
        } catch (error) {
            console.error('로그아웃 오류:', error);
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    }
}