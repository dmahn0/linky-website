// 파트너 전용 회원가입/로그인 모달
class PartnerSignupModal {
    constructor() {
        this.partnerAuth = new PartnerAuth();
        this.isLoading = false;
        this.createModal();
    }

    createModal() {
        // 모달 HTML 생성
        const modalHTML = `
            <div id="partnerAuthModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="modal-close" onclick="partnerSignupModal.close()">&times;</span>
                    
                    <!-- 로그인 폼 -->
                    <div id="partnerLoginForm" style="display: none;">
                        <h2 class="modal-title">파트너 로그인</h2>
                        <p style="color: #6b7280; margin-bottom: 24px;">
                            링키 파트너 전용 로그인 페이지입니다.
                        </p>
                        
                        <form onsubmit="partnerSignupModal.handleLogin(event)">
                            <div class="form-group">
                                <label class="form-label">이메일</label>
                                <input type="email" class="form-input" name="email" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">비밀번호</label>
                                <input type="password" class="form-input" name="password" required>
                            </div>
                            
                            <button type="submit" class="btn btn-primary" style="width: 100%;">
                                <span class="btn-text">로그인</span>
                                <span class="loading" style="display: none;"></span>
                            </button>
                        </form>
                        
                        <p style="text-align: center; margin-top: 20px; color: #6b7280;">
                            아직 파트너가 아니신가요? 
                            <a href="#" onclick="partnerSignupModal.showSignup()" style="color: #22c55e;">파트너 지원하기</a>
                        </p>
                    </div>
                    
                    <!-- 회원가입 폼 -->
                    <div id="partnerSignupForm" style="display: none;">
                        <h2 class="modal-title">파트너 지원하기</h2>
                        <p style="color: #6b7280; margin-bottom: 24px;">
                            링키 파트너가 되어 추가 수입을 만들어보세요.
                        </p>
                        
                        <form onsubmit="partnerSignupModal.handleSignup(event)">
                            <!-- 계정 정보 -->
                            <div style="margin-bottom: 24px;">
                                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">계정 정보</h3>
                                
                                <div class="form-group">
                                    <label class="form-label">이메일 *</label>
                                    <input type="email" class="form-input" name="email" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">비밀번호 *</label>
                                    <input type="password" class="form-input" name="password" required minlength="6">
                                    <small style="color: #6b7280;">최소 6자 이상</small>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">전화번호 *</label>
                                    <input type="tel" class="form-input" name="phone" required 
                                           placeholder="010-0000-0000">
                                </div>
                            </div>
                            
                            <!-- 파트너 정보 -->
                            <div style="margin-bottom: 24px;">
                                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">파트너 정보</h3>
                                
                                <div class="form-group">
                                    <label class="form-label">이름 *</label>
                                    <input type="text" class="form-input" name="name" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">거주지역 *</label>
                                    <select class="form-select" name="residence" required>
                                        <option value="">선택하세요</option>
                                        <option value="서울">서울</option>
                                        <option value="경기">경기</option>
                                        <option value="인천">인천</option>
                                        <option value="부산">부산</option>
                                        <option value="대구">대구</option>
                                        <option value="광주">광주</option>
                                        <option value="대전">대전</option>
                                        <option value="울산">울산</option>
                                        <option value="세종">세종</option>
                                        <option value="강원">강원</option>
                                        <option value="충북">충북</option>
                                        <option value="충남">충남</option>
                                        <option value="전북">전북</option>
                                        <option value="전남">전남</option>
                                        <option value="경북">경북</option>
                                        <option value="경남">경남</option>
                                        <option value="제주">제주</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">활동 가능 지역 * (복수선택 가능)</label>
                                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px;">
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" name="workAreas" value="강남구" style="margin-right: 4px;"> 강남구
                                        </label>
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" name="workAreas" value="서초구" style="margin-right: 4px;"> 서초구
                                        </label>
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" name="workAreas" value="송파구" style="margin-right: 4px;"> 송파구
                                        </label>
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" name="workAreas" value="강동구" style="margin-right: 4px;"> 강동구
                                        </label>
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" name="workAreas" value="성동구" style="margin-right: 4px;"> 성동구
                                        </label>
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" name="workAreas" value="광진구" style="margin-right: 4px;"> 광진구
                                        </label>
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" name="workAreas" value="중구" style="margin-right: 4px;"> 중구
                                        </label>
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" name="workAreas" value="용산구" style="margin-right: 4px;"> 용산구
                                        </label>
                                        <label style="display: flex; align-items: center;">
                                            <input type="checkbox" name="workAreas" value="마포구" style="margin-right: 4px;"> 마포구
                                        </label>
                                    </div>
                                    <small style="color: #6b7280; display: block; margin-top: 8px;">최소 1개 이상 선택</small>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">이동수단</label>
                                    <select class="form-select" name="transportation">
                                        <option value="">선택하세요</option>
                                        <option value="public">대중교통</option>
                                        <option value="car">자차</option>
                                        <option value="bike">오토바이/자전거</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">활동 가능 시간대</label>
                                    <div style="margin-top: 8px;">
                                        <label style="display: block; margin-bottom: 8px;">평일</label>
                                        <label style="display: inline-flex; align-items: center; margin-right: 16px;">
                                            <input type="checkbox" name="weekdayMorning" style="margin-right: 4px;"> 오전 (9-12시)
                                        </label>
                                        <label style="display: inline-flex; align-items: center; margin-right: 16px;">
                                            <input type="checkbox" name="weekdayAfternoon" style="margin-right: 4px;"> 오후 (12-18시)
                                        </label>
                                        <label style="display: inline-flex; align-items: center;">
                                            <input type="checkbox" name="weekdayEvening" style="margin-right: 4px;"> 저녁 (18-22시)
                                        </label>
                                    </div>
                                    <div style="margin-top: 12px;">
                                        <label style="display: block; margin-bottom: 8px;">주말</label>
                                        <label style="display: inline-flex; align-items: center; margin-right: 16px;">
                                            <input type="checkbox" name="weekendMorning" style="margin-right: 4px;"> 오전 (9-12시)
                                        </label>
                                        <label style="display: inline-flex; align-items: center; margin-right: 16px;">
                                            <input type="checkbox" name="weekendAfternoon" style="margin-right: 4px;"> 오후 (12-18시)
                                        </label>
                                        <label style="display: inline-flex; align-items: center;">
                                            <input type="checkbox" name="weekendEvening" style="margin-right: 4px;"> 저녁 (18-22시)
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label style="display: flex; align-items: center;">
                                    <input type="checkbox" required style="margin-right: 8px;">
                                    <a href="/terms" target="_blank" style="color: #22c55e;">이용약관</a> 및 
                                    <a href="/privacy" target="_blank" style="color: #22c55e;">개인정보처리방침</a>에 동의합니다
                                </label>
                            </div>
                            
                            <button type="submit" class="btn btn-primary" style="width: 100%;">
                                <span class="btn-text">파트너 지원하기</span>
                                <span class="loading" style="display: none;"></span>
                            </button>
                        </form>
                        
                        <p style="text-align: center; margin-top: 20px; color: #6b7280;">
                            이미 파트너이신가요? 
                            <a href="#" onclick="partnerSignupModal.showLogin()" style="color: #22c55e;">로그인</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // DOM에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // 모달 열기/닫기
    open(mode = 'login') {
        const modal = document.getElementById('partnerAuthModal');
        modal.style.display = 'block';
        
        if (mode === 'login') {
            this.showLogin();
        } else {
            this.showSignup();
        }
    }

    close() {
        const modal = document.getElementById('partnerAuthModal');
        modal.style.display = 'none';
        this.resetForms();
    }

    showLogin() {
        document.getElementById('partnerLoginForm').style.display = 'block';
        document.getElementById('partnerSignupForm').style.display = 'none';
    }

    showSignup() {
        document.getElementById('partnerLoginForm').style.display = 'none';
        document.getElementById('partnerSignupForm').style.display = 'block';
    }

    // 로그인 처리
    async handleLogin(event) {
        event.preventDefault();
        if (this.isLoading) return;

        const form = event.target;
        const formData = new FormData(form);
        
        this.setLoading(true, 'login');
        
        try {
            const result = await this.partnerAuth.signIn(
                formData.get('email'),
                formData.get('password')
            );
            
            if (result.error) {
                alert(result.error);
                return;
            }
            
            // 로그인 성공
            this.close();
            
            // 대시보드로 이동
            window.location.href = 'partners/dashboard.html';
            
        } catch (error) {
            console.error('로그인 오류:', error);
            alert('로그인 중 오류가 발생했습니다.');
        } finally {
            this.setLoading(false, 'login');
        }
    }

    // 회원가입 처리
    async handleSignup(event) {
        event.preventDefault();
        if (this.isLoading) return;

        const form = event.target;
        const formData = new FormData(form);
        
        // 활동 가능 지역 수집
        const workAreas = [];
        const areaCheckboxes = form.querySelectorAll('input[name="workAreas"]:checked');
        areaCheckboxes.forEach(checkbox => workAreas.push(checkbox.value));
        
        if (workAreas.length === 0) {
            alert('활동 가능 지역을 최소 1개 이상 선택해주세요.');
            return;
        }
        
        // 활동 가능 시간대 수집
        const availableTimes = {
            weekday: [],
            weekend: []
        };
        
        if (form.weekdayMorning.checked) availableTimes.weekday.push('morning');
        if (form.weekdayAfternoon.checked) availableTimes.weekday.push('afternoon');
        if (form.weekdayEvening.checked) availableTimes.weekday.push('evening');
        
        if (form.weekendMorning.checked) availableTimes.weekend.push('morning');
        if (form.weekendAfternoon.checked) availableTimes.weekend.push('afternoon');
        if (form.weekendEvening.checked) availableTimes.weekend.push('evening');
        
        // 폼 데이터를 객체로 변환
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone'),
            name: formData.get('name'),
            residence: formData.get('residence'),
            workAreas: workAreas,
            transportation: formData.get('transportation') || null,
            availableTimes: availableTimes
        };
        
        this.setLoading(true, 'signup');
        
        try {
            const result = await this.partnerAuth.signUp(userData);
            
            if (result.error) {
                alert(result.error);
                return;
            }
            
            // 회원가입 성공
            alert('파트너 지원이 완료되었습니다. 심사 후 연락드리겠습니다.');
            this.showLogin();
            
        } catch (error) {
            console.error('회원가입 오류:', error);
            alert('파트너 지원 중 오류가 발생했습니다.');
        } finally {
            this.setLoading(false, 'signup');
        }
    }

    // 로딩 상태 설정
    setLoading(loading, mode) {
        this.isLoading = loading;
        const formId = mode === 'login' ? 'partnerLoginForm' : 'partnerSignupForm';
        const form = document.querySelector(`#${formId} form`);
        const button = form.querySelector('button[type="submit"]');
        const btnText = button.querySelector('.btn-text');
        const spinner = button.querySelector('.loading');
        
        button.disabled = loading;
        btnText.style.display = loading ? 'none' : 'inline';
        spinner.style.display = loading ? 'inline-block' : 'none';
    }

    // 폼 초기화
    resetForms() {
        const forms = document.querySelectorAll('#partnerAuthModal form');
        forms.forEach(form => form.reset());
    }
}

// 전역 인스턴스 생성
const partnerSignupModal = new PartnerSignupModal();

// 모달 외부 클릭시 닫기
window.addEventListener('click', (event) => {
    const modal = document.getElementById('partnerAuthModal');
    if (event.target === modal) {
        partnerSignupModal.close();
    }
});