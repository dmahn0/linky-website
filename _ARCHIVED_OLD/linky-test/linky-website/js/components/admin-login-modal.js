// 관리자 로그인 모달 컴포넌트
class AdminLoginModal {
    constructor() {
        this.modal = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        // 모달 HTML 생성
        this.createModal();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    createModal() {
        // 모달 HTML
        const modalHTML = `
            <div id="adminLoginModal" class="modal-overlay" style="display: none;">
                <div class="modal-container">
                    <div class="modal-header">
                        <div class="modal-logo">
                            <span class="logo-icon">🔒</span>
                            <span class="logo-text">관리자 로그인</span>
                        </div>
                        <button class="modal-close" onclick="adminLoginModal.close()">&times;</button>
                    </div>
                    
                    <div class="modal-content">
                        <form id="adminLoginForm" class="auth-form">
                            <div class="form-group">
                                <label for="adminEmail">이메일</label>
                                <input type="email" id="adminEmail" name="email" required 
                                       placeholder="admin@example.com">
                            </div>
                            
                            <div class="form-group">
                                <label for="adminPassword">비밀번호</label>
                                <input type="password" id="adminPassword" name="password" required 
                                       placeholder="비밀번호를 입력하세요">
                            </div>
                            
                            <button type="submit" class="btn-primary" id="adminLoginBtn">
                                <span class="btn-text">로그인</span>
                                <div class="btn-loading" style="display: none;">
                                    <div class="spinner"></div>
                                    <span>로그인 중...</span>
                                </div>
                            </button>
                        </form>
                        
                        <div class="admin-info">
                            <p>⚠️ 관리자 계정이 필요합니다</p>
                            <p>계정이 없으면 <a href="create-admin.html" target="_blank">여기서 생성</a>하세요</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // DOM에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('adminLoginModal');
    }

    setupEventListeners() {
        // 로그인 폼 제출
        document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        // 모달 외부 클릭 시 닫기
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    async handleLogin() {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const loginBtn = document.getElementById('adminLoginBtn');

        // 로딩 상태 시작
        this.setLoading(true);

        try {
            // Supabase Auth 로그인
            const { data: { user }, error: authError } = await window.supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;

            if (!user) {
                throw new Error('로그인에 실패했습니다.');
            }

            // 관리자 권한 확인
            const { data: adminData, error: adminError } = await window.supabaseClient
                .from('admins')
                .select('*')
                .eq('auth_uid', user.id)
                .single();

            if (adminError || !adminData) {
                // 관리자가 아니면 로그아웃
                await window.supabaseClient.auth.signOut();
                throw new Error('관리자 권한이 없습니다.');
            }

            // 성공 - 관리자 페이지로 리다이렉트
            this.close();
            window.location.href = 'admin/';

        } catch (error) {
            console.error('관리자 로그인 오류:', error);
            
            // 오류 메시지 표시
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(isLoading) {
        const btnText = document.querySelector('#adminLoginBtn .btn-text');
        const btnLoading = document.querySelector('#adminLoginBtn .btn-loading');
        const loginBtn = document.getElementById('adminLoginBtn');

        if (isLoading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
            loginBtn.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            loginBtn.disabled = false;
        }
    }

    showError(message) {
        // 기존 에러 메시지 제거
        const existingError = document.querySelector('.admin-error');
        if (existingError) {
            existingError.remove();
        }

        // 새 에러 메시지 추가
        const errorDiv = document.createElement('div');
        errorDiv.className = 'admin-error';
        errorDiv.style.cssText = `
            background: #fee2e2;
            color: #dc2626;
            padding: 12px;
            border-radius: 6px;
            margin-top: 15px;
            font-size: 14px;
            text-align: center;
        `;
        errorDiv.textContent = message;

        document.getElementById('adminLoginForm').appendChild(errorDiv);

        // 3초 후 제거
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 3000);
    }

    open() {
        this.modal.style.display = 'flex';
        this.isOpen = true;
        
        // 첫 번째 입력 필드에 포커스
        setTimeout(() => {
            document.getElementById('adminEmail').focus();
        }, 100);
    }

    close() {
        this.modal.style.display = 'none';
        this.isOpen = false;
        
        // 폼 초기화
        document.getElementById('adminLoginForm').reset();
        
        // 에러 메시지 제거
        const errorDiv = document.querySelector('.admin-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
}

// 스타일 추가
const adminLoginStyles = `
<style id="admin-login-modal-styles">
    #adminLoginModal .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    }

    #adminLoginModal .modal-container {
        background: white;
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        width: 90%;
        max-width: 400px;
        max-height: 90vh;
        overflow: hidden;
        animation: modalSlideUp 0.3s ease-out;
    }

    @keyframes modalSlideUp {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    #adminLoginModal .modal-header {
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        padding: 24px;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    #adminLoginModal .modal-logo {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    #adminLoginModal .logo-icon {
        font-size: 24px;
    }

    #adminLoginModal .logo-text {
        font-size: 20px;
        font-weight: bold;
    }

    #adminLoginModal .modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
    }

    #adminLoginModal .modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    #adminLoginModal .modal-content {
        padding: 32px 24px;
    }

    #adminLoginModal .form-group {
        margin-bottom: 20px;
    }

    #adminLoginModal .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #374151;
        font-size: 14px;
    }

    #adminLoginModal .form-group input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    #adminLoginModal .form-group input:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    #adminLoginModal .btn-primary {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
    }

    #adminLoginModal .btn-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 25px -12px rgba(79, 70, 229, 0.4);
    }

    #adminLoginModal .btn-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    #adminLoginModal .btn-loading {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    #adminLoginModal .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    #adminLoginModal .admin-info {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 14px;
    }

    #adminLoginModal .admin-info p {
        margin-bottom: 8px;
    }

    #adminLoginModal .admin-info a {
        color: #4f46e5;
        text-decoration: none;
        font-weight: 600;
    }

    #adminLoginModal .admin-info a:hover {
        text-decoration: underline;
    }

    /* 반응형 */
    @media (max-width: 480px) {
        #adminLoginModal .modal-container {
            width: 95%;
            margin: 20px;
        }
        
        #adminLoginModal .modal-content {
            padding: 24px 20px;
        }
    }
</style>
`;

// 페이지 로드 시 스타일과 모달 인스턴스 생성
document.addEventListener('DOMContentLoaded', function() {
    // 스타일 추가
    document.head.insertAdjacentHTML('beforeend', adminLoginStyles);
    
    // 전역 인스턴스 생성
    window.adminLoginModal = new AdminLoginModal();
    
    console.log('관리자 로그인 모달 초기화 완료');
});