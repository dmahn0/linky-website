// 헤더 컴포넌트
class HeaderComponent {
    constructor(options = {}) {
        this.options = {
            showBusinessMenu: options.showBusinessMenu || false,
            showPartnerMenu: options.showPartnerMenu || false,
            currentPage: options.currentPage || 'home'
        };
        this.render();
        this.bindEvents();
    }

    render() {
        const headerHTML = `
            <header class="header">
                <div class="header-content">
                    <a href="${this.getBasePath()}" class="logo">🔗 Linky</a>
                    
                    <nav class="nav-menu" id="navMenu">
                        ${this.getNavMenuItems()}
                    </nav>
                    
                    <button class="mobile-menu-btn" id="mobileMenuBtn">☰</button>
                </div>
            </header>
        `;

        // 헤더를 body 최상단에 삽입
        const headerRoot = document.getElementById('header-root');
        if (headerRoot) {
            headerRoot.innerHTML = headerHTML;
        } else {
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }
    }

    getBasePath() {
        // 현재 경로에 따라 기본 경로 결정
        const path = window.location.pathname;
        if (path.includes('/business/') || path.includes('/partners/')) {
            return '../';
        }
        return './';
    }

    getNavMenuItems() {
        const basePath = this.getBasePath();
        let menuHTML = '';

        // 기본 메뉴
        if (this.options.currentPage === 'home') {
            menuHTML = `
                <a href="#features">특징</a>
                <a href="#pricing">가격</a>
                <a href="#process">이용방법</a>
                <a href="#apply" class="btn btn-primary login-required" id="headerApplyBtn">시작하기</a>
            `;
        } else if (this.options.showBusinessMenu) {
            // 사업자 메뉴
            menuHTML = `
                <!-- 로그인 전 메뉴 -->
                <div class="login-required">
                    <a href="#services">서비스</a>
                    <a href="#pricing">요금</a>
                    <a href="direct-spaces.html">직영공간</a>
                    <a href="../education/">교육/컨설팅</a>
                    <a href="../facility/">시설관리</a>
                    <button class="btn btn-secondary" onclick="if(window.businessSignupModal) businessSignupModal.openLogin(); else alert('잠시 후 다시 시도해주세요.');">로그인</button>
                    <button class="btn btn-primary" onclick="if(window.businessSignupModal) businessSignupModal.open(); else alert('잠시 후 다시 시도해주세요.');">회원가입</button>
                </div>
                
                <!-- 로그인 후 메뉴 -->
                <div class="auth-required" style="display: none;">
                    <a href="space-registration.html">공간 등록</a>
                    <a href="job-request.html">정리 요청</a>
                    <a href="jobs.html">작업 현황</a>
                    <a href="direct-spaces.html">직영공간</a>
                    <a href="../education/">교육</a>
                    <span class="user-name"></span>
                    <button class="btn btn-secondary" onclick="handleLogout()">로그아웃</button>
                </div>
            `;
        } else if (this.options.showPartnerMenu) {
            // 파트너 메뉴
            menuHTML = `
                <!-- 로그인 전 메뉴 -->
                <div class="login-required">
                    <a href="#benefits">혜택</a>
                    <a href="#faq">FAQ</a>
                    <a href="#reviews">후기</a>
                    <button class="btn btn-secondary" onclick="if(window.partnerSignupModal) partnerSignupModal.openLogin(); else alert('잠시 후 다시 시도해주세요.');">로그인</button>
                    <button class="btn btn-primary" onclick="if(window.partnerSignupModal) partnerSignupModal.open(); else alert('잠시 후 다시 시도해주세요.');">파트너 지원</button>
                </div>
                
                <!-- 로그인 후 메뉴 -->
                <div class="auth-required" style="display: none;">
                    <a href="#dashboard">대시보드</a>
                    <a href="#jobs">내 작업</a>
                    <a href="#earnings">수익 관리</a>
                    <span class="user-name"></span>
                    <button class="btn btn-secondary" onclick="handleLogout()">로그아웃</button>
                </div>
            `;
        }

        return menuHTML;
    }

    bindEvents() {
        // 모바일 메뉴 토글
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');

        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });

            // 메뉴 항목 클릭 시 모바일 메뉴 닫기
            navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                });
            });
        }

        // 시작하기/지원하기 버튼 클릭 이벤트
        const applyBtn = document.getElementById('headerApplyBtn');
        if (applyBtn) {
            applyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.authModal) {
                    authModal.openSignupSelect();
                }
            });
        }

        // 스크롤 시 헤더 스타일 변경
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            const header = document.querySelector('.header');
            
            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        });
    }

    // 인증 상태에 따른 메뉴 업데이트
    updateAuthState(user) {
        const authRequired = document.querySelectorAll('.auth-required');
        const loginRequired = document.querySelectorAll('.login-required');
        const userNameElements = document.querySelectorAll('.user-name');

        if (user) {
            // 로그인 상태
            authRequired.forEach(el => {
                if (el.tagName === 'DIV') {
                    el.style.display = 'flex';
                } else {
                    el.style.display = 'inline-block';
                }
            });
            loginRequired.forEach(el => el.style.display = 'none');
            userNameElements.forEach(el => el.textContent = (user.name || '사용자') + '님');
        } else {
            // 로그아웃 상태
            authRequired.forEach(el => el.style.display = 'none');
            loginRequired.forEach(el => {
                if (el.tagName === 'DIV') {
                    el.style.display = 'flex';
                } else {
                    el.style.display = 'inline-block';
                }
            });
        }
    }
}

// 전역 함수로 로그아웃 처리
async function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        try {
            await auth.signOut();
            window.location.reload();
        } catch (error) {
            console.error('로그아웃 오류:', error);
        }
    }
}