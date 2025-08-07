// 비즈니스 전용 회원가입/로그인 모달
class BusinessSignupModal {
    constructor() {
        this.businessAuth = new BusinessAuth();
        this.isLoading = false;
        this.createModal();
    }

    createModal() {
        // 모달 HTML 생성
        const modalHTML = `
            <div id="businessAuthModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="modal-close" onclick="businessSignupModal.close()">&times;</span>
                    
                    <!-- 로그인 폼 -->
                    <div id="businessLoginForm" style="display: none;">
                        <h2 class="modal-title">비즈니스 로그인</h2>
                        <p style="color: #6b7280; margin-bottom: 24px;">
                            공간 사업자 전용 로그인 페이지입니다.
                        </p>
                        
                        <form onsubmit="businessSignupModal.handleLogin(event)">
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
                            아직 계정이 없으신가요? 
                            <a href="#" onclick="businessSignupModal.showSignup()" style="color: #22c55e;">회원가입</a>
                        </p>
                    </div>
                    
                    <!-- 회원가입 폼 -->
                    <div id="businessSignupForm" style="display: none;">
                        <h2 class="modal-title">비즈니스 회원가입</h2>
                        <p style="color: #6b7280; margin-bottom: 24px;">
                            공간 사업자로 등록하고 링키 서비스를 이용하세요.
                        </p>
                        
                        <form onsubmit="businessSignupModal.handleSignup(event)">
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
                            
                            <!-- 사업자 정보 -->
                            <div style="margin-bottom: 24px;">
                                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">사업자 정보</h3>
                                
                                <div class="form-group">
                                    <label class="form-label">사업체명 *</label>
                                    <input type="text" class="form-input" name="businessName" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">사업자등록번호 *</label>
                                    <input type="text" class="form-input" name="businessNumber" required 
                                           placeholder="000-00-00000" pattern="\\d{3}-\\d{2}-\\d{5}">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">사업체 유형 *</label>
                                    <select class="form-select" name="businessType" required>
                                        <option value="">선택하세요</option>
                                        <option value="studyroom">스터디룸</option>
                                        <option value="partyroom">파티룸</option>
                                        <option value="unmanned">무인매장</option>
                                        <option value="office">오피스</option>
                                        <option value="other">기타</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">사업장 주소 *</label>
                                    <input type="text" class="form-input" name="businessAddress" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">대표자명 *</label>
                                    <input type="text" class="form-input" name="representativeName" required>
                                </div>
                            </div>
                            
                            <!-- 첫 번째 공간 정보 -->
                            <div style="margin-bottom: 24px;">
                                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">첫 번째 공간 정보</h3>
                                <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
                                    회원가입 시 최소 1개의 공간을 등록해야 합니다. 추가 공간은 가입 후 등록할 수 있습니다.
                                </p>
                                
                                <div class="form-group">
                                    <label class="form-label">공간 이름 *</label>
                                    <input type="text" class="form-input" name="spaceName" 
                                           placeholder="예: 강남점, 본사 사무실" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">공간 유형 *</label>
                                    <select class="form-select" name="spaceType" required>
                                        <option value="">선택하세요</option>
                                        <option value="office">사무실</option>
                                        <option value="store">매장</option>
                                        <option value="warehouse">창고</option>
                                        <option value="factory">공장</option>
                                        <option value="other">기타</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">면적 (㎡)</label>
                                    <input type="number" class="form-input" name="spaceArea" 
                                           placeholder="예: 150" min="1">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">공간 주소 *</label>
                                    <input type="text" class="form-input" name="spaceAddress" 
                                           placeholder="사업장 주소와 다른 경우 입력" required>
                                    <small style="color: #6b7280; display: block; margin-top: 4px;">
                                        사업장 주소와 동일하면 같은 주소를 입력하세요
                                    </small>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">상세 주소</label>
                                    <input type="text" class="form-input" name="spaceDetailAddress" 
                                           placeholder="예: 5층 501호">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">청소 주기</label>
                                    <select class="form-select" name="cleaningFrequency">
                                        <option value="daily">매일</option>
                                        <option value="weekly" selected>주 1회</option>
                                        <option value="biweekly">격주</option>
                                        <option value="monthly">월 1회</option>
                                        <option value="custom">기타</option>
                                    </select>
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
                                <span class="btn-text">회원가입</span>
                                <span class="loading" style="display: none;"></span>
                            </button>
                        </form>
                        
                        <p style="text-align: center; margin-top: 20px; color: #6b7280;">
                            이미 계정이 있으신가요? 
                            <a href="#" onclick="businessSignupModal.showLogin()" style="color: #22c55e;">로그인</a>
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
        const modal = document.getElementById('businessAuthModal');
        modal.style.display = 'block';
        
        if (mode === 'login') {
            this.showLogin();
        } else {
            this.showSignup();
        }
    }

    close() {
        const modal = document.getElementById('businessAuthModal');
        modal.style.display = 'none';
        this.resetForms();
    }

    showLogin() {
        document.getElementById('businessLoginForm').style.display = 'block';
        document.getElementById('businessSignupForm').style.display = 'none';
    }

    showSignup() {
        document.getElementById('businessLoginForm').style.display = 'none';
        document.getElementById('businessSignupForm').style.display = 'block';
    }

    // 로그인 처리
    async handleLogin(event) {
        event.preventDefault();
        if (this.isLoading) return;

        const form = event.target;
        const formData = new FormData(form);
        
        this.setLoading(true, 'login');
        
        try {
            const result = await this.businessAuth.signIn(
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
            window.location.href = 'business/dashboard.html';
            
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
        
        // 폼 데이터를 객체로 변환
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone'),
            businessName: formData.get('businessName'),
            businessNumber: formData.get('businessNumber'),
            businessType: formData.get('businessType'),
            businessAddress: formData.get('businessAddress'),
            representativeName: formData.get('representativeName'),
            // 첫 번째 공간 정보
            firstSpace: {
                name: formData.get('spaceName'),
                type: formData.get('spaceType'),
                area: formData.get('spaceArea') ? parseInt(formData.get('spaceArea')) : null,
                address: formData.get('spaceAddress'),
                detail_address: formData.get('spaceDetailAddress'),
                cleaning_frequency: formData.get('cleaningFrequency')
            }
        };
        
        this.setLoading(true, 'signup');
        
        // 30초 타임아웃 설정
        const timeoutId = setTimeout(() => {
            this.setLoading(false, 'signup');
            alert('회원가입이 너무 오래 걸립니다. 다시 시도해주세요.');
        }, 30000);
        
        try {
            console.log('회원가입 데이터:', userData);
            const result = await this.businessAuth.signUp(userData);
            
            // 타임아웃 취소
            clearTimeout(timeoutId);
            
            console.log('회원가입 결과:', result);
            
            if (result.error) {
                console.error('회원가입 오류:', result.error);
                alert(result.error);
                return;
            }
            
            // 회원가입 성공
            if (result.success) {
                alert('회원가입이 완료되었습니다. 관리자 승인 후 서비스를 이용하실 수 있습니다.');
                this.showLogin();
            } else {
                console.error('회원가입 실패:', result);
                alert('회원가입에 실패했습니다: ' + (result.error || '알 수 없는 오류'));
            }
            
        } catch (error) {
            clearTimeout(timeoutId); // 타임아웃 취소
            console.error('회원가입 예외 오류:', error);
            alert('회원가입 중 오류가 발생했습니다: ' + error.message);
        } finally {
            this.setLoading(false, 'signup');
        }
    }

    // 로딩 상태 설정
    setLoading(loading, mode) {
        this.isLoading = loading;
        const formId = mode === 'login' ? 'businessLoginForm' : 'businessSignupForm';
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
        const forms = document.querySelectorAll('#businessAuthModal form');
        forms.forEach(form => form.reset());
    }
}

// 전역 인스턴스 생성
const businessSignupModal = new BusinessSignupModal();

// 모달 외부 클릭시 닫기
window.addEventListener('click', (event) => {
    const modal = document.getElementById('businessAuthModal');
    if (event.target === modal) {
        businessSignupModal.close();
    }
});