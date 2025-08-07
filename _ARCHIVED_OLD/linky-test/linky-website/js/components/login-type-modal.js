// 통합 로그인 타입 선택 모달
class LoginTypeModal {
    constructor() {
        this.createModal();
    }

    createModal() {
        const modalHTML = `
            <div id="loginTypeModal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 500px;">
                    <span class="modal-close" onclick="loginTypeModal.close()">&times;</span>
                    
                    <div style="text-align: center; padding: 20px 0;">
                        <h2 style="font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 10px;">
                            로그인 유형 선택
                        </h2>
                        <p style="color: #6b7280; margin-bottom: 30px;">
                            어떤 유형의 사용자이신가요?
                        </p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                            <!-- 비즈니스 옵션 -->
                            <div class="login-type-option" onclick="loginTypeModal.selectType('business')" 
                                 style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; cursor: pointer; text-align: center; transition: all 0.3s;">
                                <div style="font-size: 48px; margin-bottom: 15px;">🏢</div>
                                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">공간 사업자</h3>
                                <p style="font-size: 14px; color: #6b7280; line-height: 1.4;">
                                    스터디룸, 파티룸, 오피스 등<br>공간을 운영하고 계신 분
                                </p>
                            </div>
                            
                            <!-- 파트너 옵션 -->
                            <div class="login-type-option" onclick="loginTypeModal.selectType('partner')"
                                 style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 30px; cursor: pointer; text-align: center; transition: all 0.3s;">
                                <div style="font-size: 48px; margin-bottom: 15px;">🧹</div>
                                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">정리 파트너</h3>
                                <p style="font-size: 14px; color: #6b7280; line-height: 1.4;">
                                    공간 정리 서비스를<br>제공하고 싶은 분
                                </p>
                            </div>
                        </div>
                        
                        <p style="font-size: 12px; color: #9ca3af;">
                            계정이 없으시다면 로그인 화면에서 회원가입을 선택하세요.
                        </p>
                    </div>
                </div>
            </div>
            
            <style>
                .login-type-option:hover {
                    border-color: #22c55e !important;
                    background: #f0fdf4 !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
                }
                
                .login-type-option:active {
                    transform: translateY(0);
                }
                
                #loginTypeModal .modal-content {
                    animation: modalSlideIn 0.3s ease-out;
                }
                
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @media (max-width: 768px) {
                    #loginTypeModal .modal-content {
                        max-width: 90% !important;
                        margin: 20px auto !important;
                    }
                    
                    #loginTypeModal .modal-content > div {
                        padding: 15px 0 !important;
                    }
                    
                    #loginTypeModal .modal-content > div > div {
                        grid-template-columns: 1fr !important;
                        gap: 15px !important;
                    }
                    
                    .login-type-option {
                        padding: 25px 20px !important;
                    }
                }
            </style>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    open() {
        const modal = document.getElementById('loginTypeModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    close() {
        const modal = document.getElementById('loginTypeModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    selectType(type) {
        this.close();
        
        if (type === 'business') {
            // 비즈니스 로그인 모달 열기
            if (typeof businessSignupModal !== 'undefined') {
                businessSignupModal.open('login');
            } else {
                console.error('businessSignupModal not found');
            }
        } else if (type === 'partner') {
            // 파트너 로그인 모달 열기
            if (typeof partnerSignupModal !== 'undefined') {
                partnerSignupModal.open('login');
            } else {
                console.error('partnerSignupModal not found');
            }
        }
    }
}

// 전역 인스턴스 생성
const loginTypeModal = new LoginTypeModal();

// 모달 외부 클릭시 닫기
window.addEventListener('click', (event) => {
    const modal = document.getElementById('loginTypeModal');
    if (event.target === modal) {
        loginTypeModal.close();
    }
});