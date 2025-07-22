// 인증 모달 관리 및 폼 처리
class AuthModal {
  constructor() {
    this.currentModal = null;
    this.currentStep = 1;
    this.formData = {};
    this.init();
  }
  
  init() {
    this.createModalHTML();
    this.bindEvents();
  }
  
  // 모달 HTML 생성
  createModalHTML() {
    // 모달 스타일 추가
    const modalStyles = `
      <style>
        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0,0,0,0.4);
          animation: fadeIn 0.3s;
        }
        
        .modal-content {
          background-color: #fefefe;
          margin: 20px auto;
          padding: 30px;
          border: none;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          animation: slideIn 0.3s;
        }
        
        /* 스크롤바 스타일링 */
        .modal-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .modal-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .modal-content::-webkit-scrollbar-thumb {
          background: #22c55e;
          border-radius: 4px;
        }
        
        .modal-content::-webkit-scrollbar-thumb:hover {
          background: #16a34a;
        }
        
        .modal-close {
          color: #aaa;
          position: fixed;
          right: calc(50% - 230px);
          top: 40px;
          z-index: 1001;
          font-size: 28px;
          font-weight: bold;
          cursor: pointer;
        }
        
        .modal-close:hover,
        .modal-close:focus {
          color: #000;
        }
        
        .modal-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          text-align: center;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        /* 반응형 디자인 */
        @media (max-width: 768px) {
          .modal-content {
            width: 95%;
            padding: 20px;
            margin: 10px auto;
            max-height: 95vh;
          }
          
          .modal-close {
            right: 15px;
            top: 25px;
            position: fixed;
          }
          
          .two-column {
            grid-template-columns: 1fr !important;
            gap: 15px;
          }
        }
      </style>
    `;
    
    const modalHTML = modalStyles + `
      <!-- 로그인/회원가입 선택 모달 -->
      <div id="authSelectModal" class="modal">
        <div class="modal-content" style="max-width: 400px;">
          <span class="modal-close" onclick="event.stopPropagation(); authModal.close();">&times;</span>
          <h3 class="modal-title">Linky 시작하기</h3>
          <p style="margin-bottom: 30px; color: #6b7280; text-align: center;">
            어떤 서비스를 이용하시겠어요?
          </p>
          
          <div style="display: grid; gap: 15px;">
            <button class="btn btn-outline" onclick="authModal.openSignup('business')" style="padding: 20px;">
              <div style="text-align: left;">
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">🏢 공간 사업자</div>
                <div style="font-size: 14px; color: #6b7280;">스터디룸, 파티룸 등의 정리 서비스가 필요해요</div>
              </div>
            </button>
            
            <button class="btn btn-outline" onclick="authModal.openSignup('partner')" style="padding: 20px;">
              <div style="text-align: left;">
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">👤 정리 파트너</div>
                <div style="font-size: 14px; color: #6b7280;">정리 서비스를 제공하고 수익을 얻고 싶어요</div>
              </div>
            </button>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin-bottom: 10px;">이미 계정이 있으신가요?</p>
            <button class="btn btn-primary" onclick="authModal.openLogin()">로그인</button>
          </div>
        </div>
      </div>
      
      <!-- 회원가입 모달 -->
      <div id="signupModal" class="modal">
        <div class="modal-content" style="max-width: 500px;">
          <span class="modal-close" onclick="event.stopPropagation(); authModal.close();">&times;</span>
          <div id="signupContent">
            <!-- 동적으로 내용이 변경됩니다 -->
          </div>
        </div>
      </div>
      
      <!-- 로그인 모달 -->
      <div id="loginModal" class="modal">
        <div class="modal-content" style="max-width: 400px;">
          <span class="modal-close" onclick="event.stopPropagation(); authModal.close();">&times;</span>
          <h3 class="modal-title">로그인</h3>
          
          <form id="loginForm">
            <div class="form-group">
              <label class="form-label">이메일</label>
              <input type="email" name="email" class="form-input" placeholder="이메일을 입력하세요" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">비밀번호</label>
              <input type="password" name="password" class="form-input" placeholder="비밀번호를 입력하세요" required>
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px;">
              <span class="btn-text">로그인</span>
              <span class="loading" style="display: none;"></span>
            </button>
            
            <div style="text-align: center; margin-top: 15px;">
              <a href="#" onclick="authModal.openSignupSelect()" style="color: #22c55e; text-decoration: none;">
                계정이 없으신가요? 회원가입
              </a>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // body에 모달 HTML 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
  
  // 이벤트 바인딩
  bindEvents() {
    // 로그인 폼 제출
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      this.handleLogin(e);
    });
    
    // 모달 외부 클릭 시 닫기 (모달 배경 클릭 시에만)
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal') && e.target === e.currentTarget) {
        this.close();
      }
    });
    
    // ESC 키로 모달 닫기
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentModal) {
        this.close();
      }
    });
  }
  
  // 회원가입 선택 모달 열기
  openSignupSelect() {
    this.close();
    this.currentModal = 'authSelectModal';
    document.getElementById('authSelectModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  
  // 로그인 모달 열기
  openLogin() {
    console.log('openLogin 호출됨');
    this.close();
    this.currentModal = 'loginModal';
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
      loginModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      console.log('로그인 모달 표시됨');
    } else {
      console.error('로그인 모달을 찾을 수 없습니다');
    }
  }
  
  // 회원가입 모달 열기
  openSignup(type) {
    this.close();
    this.currentModal = 'signupModal';
    this.currentStep = 1;
    this.formData = { type };
    
    this.renderSignupStep();
    document.getElementById('signupModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  
  // 회원가입 단계별 렌더링
  renderSignupStep() {
    const content = document.getElementById('signupContent');
    const { type } = this.formData;
    const isBusinessStep2 = type === 'business' && this.currentStep === 2;
    const isPartnerStep2 = type === 'partner' && this.currentStep === 2;
    
    if (this.currentStep === 1) {
      // 1단계: 기본 정보
      content.innerHTML = `
        <h3 class="modal-title">
          ${type === 'business' ? '🏢 사업자 회원가입' : '👤 파트너 회원가입'} (1/2)
        </h3>
        <p style="margin-bottom: 20px; color: #6b7280; font-size: 14px;">
          기본 정보를 입력해주세요
        </p>
        
        <form id="signupStep1Form" onsubmit="event.preventDefault();">
          <div class="form-group">
            <label class="form-label">이름 *</label>
            <input type="text" name="name" class="form-input" placeholder="이름을 입력하세요" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">이메일 *</label>
            <input type="email" name="email" class="form-input" placeholder="이메일을 입력하세요" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">비밀번호 *</label>
            <input type="password" name="password" class="form-input" placeholder="8자 이상 입력하세요" required minlength="8">
          </div>
          
          <div class="form-group">
            <label class="form-label">비밀번호 확인 *</label>
            <input type="password" name="passwordConfirm" class="form-input" placeholder="비밀번호를 다시 입력하세요" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">휴대폰 번호 *</label>
            <input type="tel" name="phone" class="form-input" placeholder="010-0000-0000" required>
          </div>
          
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px;">
            다음 단계
          </button>
          
          <div style="text-align: center; margin-top: 15px;">
            <a href="#" onclick="event.preventDefault(); authModal.openLogin();" style="color: #22c55e; text-decoration: none;">
              이미 계정이 있으신가요? 로그인
            </a>
          </div>
        </form>
      `;
      
      // 1단계 폼 이벤트 바인딩
      document.getElementById('signupStep1Form').addEventListener('submit', (e) => {
        this.handleSignupStep1(e);
      });
      
    } else if (isBusinessStep2) {
      // 2단계: 사업자 추가 정보
      content.innerHTML = `
        <h3 class="modal-title">🏢 사업자 회원가입 (2/2)</h3>
        <p style="margin-bottom: 20px; color: #6b7280; font-size: 14px;">
          사업장 정보를 입력해주세요
        </p>
        
        <form id="signupStep2Form" onsubmit="event.preventDefault();">
          <div class="form-group">
            <label class="form-label">사업장명 *</label>
            <input type="text" name="businessName" class="form-input" placeholder="사업장명을 입력하세요" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">사업자등록번호</label>
            <input type="text" name="businessNumber" class="form-input" placeholder="000-00-00000" pattern="[0-9]{3}-[0-9]{2}-[0-9]{5}">
          </div>
          
          <div class="form-group">
            <label class="form-label">사업장 주소 *</label>
            <input type="text" name="businessAddress" class="form-input" placeholder="사업장 주소를 입력하세요" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">공간 종류 *</label>
            <select name="businessType" class="form-select" required>
              <option value="">선택해주세요</option>
              <option value="studyroom">스터디룸</option>
              <option value="partyroom">파티룸</option>
              <option value="unmanned">무인매장</option>
              <option value="office">공유오피스</option>
              <option value="other">기타</option>
            </select>
          </div>
          
          <!-- 개인정보 수집 및 마케팅 활용 동의 -->
          <div class="form-group" style="margin: 20px 0 15px 0;">
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; background: #f8fafc;">
              <label style="display: flex; align-items: flex-start; font-size: 14px; font-weight: 600; margin-bottom: 10px;">
                <input type="checkbox" name="allPrivacyAgree" style="margin-right: 8px; margin-top: 2px; min-width: 16px;" required>
                개인정보 수집·이용 및 마케팅 활용에 동의합니다 (필수)
              </label>
              <div style="max-height: 150px; overflow-y: auto; font-size: 11px; color: #374151; line-height: 1.4; padding: 12px; background: white; border-radius: 4px; border: 1px solid #e5e7eb;">
                <p><strong>■ 개인정보 수집·이용에 관한 사항</strong></p>
                <p><strong>1. 개인정보의 수집·이용 목적</strong><br>
                회원가입, 서비스 제공, 본인확인, 고객상담, 정산 및 대금결제, 서비스 개선</p>
                
                <p><strong>2. 수집하는 개인정보 항목</strong><br>
                - 필수항목: 성명, 이메일, 휴대폰번호, 사업장명, 사업자등록번호, 사업장주소, 공간종류, 거주지역, 활동희망지역, 활동가능시간대, 이동수단<br>
                - 자동수집: 접속IP, 쿠키, 서비스 이용기록, 접속로그</p>
                
                <p><strong>3. 개인정보의 보유·이용기간</strong><br>
                회원탈퇴 시까지. 단, 관계법령에 따라 보존의무가 있는 경우 해당 기간까지 보관</p>
                
                <p><strong>4. 개인정보 제3자 제공</strong><br>
                원칙적으로 개인정보를 제3자에게 제공하지 않으며, 제공 시 사전 동의를 받습니다.</p>
                
                <p><strong>5. 개인정보 처리업무 위탁</strong><br>
                - Firebase(Google): 회원정보 저장 및 관리<br>
                - 결제대행업체: 결제처리 및 정산<br>
                - SMS/이메일 발송업체: 알림 서비스</p>
                
                <p><strong>■ 마케팅 활용에 관한 사항</strong></p>
                <p><strong>1. 마케팅 활용 목적</strong><br>
                신규 서비스 안내, 이벤트 정보 제공, 맞춤형 혜택 및 광고 제공</p>
                
                <p><strong>2. 마케팅 활용 방법</strong><br>
                이메일, SMS, MMS, 앱 푸시알림, 전화</p>
                
                <p><strong>3. 마케팅 활용 기간</strong><br>
                동의일로부터 동의 철회 시 또는 회원 탈퇴 시까지</p>
                
                <p style="margin-top: 10px;"><strong>※ 동의 거부 권리 및 불이익</strong><br>
                위 개인정보 수집·이용에 대한 동의는 서비스 이용을 위해 필요하며, 거부 시 회원가입 및 서비스 이용이 제한됩니다. 마케팅 활용 동의 거부 시에도 서비스 이용에는 제한이 없으나, 맞춤형 서비스 및 혜택 제공이 제한될 수 있습니다.</p>
              </div>
            </div>
          </div>
          
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn btn-outline" style="flex: 1;" onclick="authModal.goToPrevStep()">
              이전
            </button>
            <button type="submit" class="btn btn-primary" style="flex: 2;">
              <span class="btn-text">회원가입 완료</span>
              <span class="loading" style="display: none;"></span>
            </button>
          </div>
        </form>
      `;
      
      // 2단계 폼 이벤트 바인딩
      document.getElementById('signupStep2Form').addEventListener('submit', (e) => {
        this.handleSignupStep2(e);
      });
      
    } else if (isPartnerStep2) {
      // 2단계: 파트너 추가 정보
      content.innerHTML = `
        <h3 class="modal-title">👤 파트너 회원가입 (2/2)</h3>
        <p style="margin-bottom: 20px; color: #6b7280; font-size: 14px;">
          활동 정보를 입력해주세요
        </p>
        
        <form id="signupStep2Form" onsubmit="event.preventDefault();">
          <div class="form-group">
            <label class="form-label">거주 지역 (구 단위) *</label>
            <input type="text" name="residence" class="form-input" placeholder="예: 강남구, 서초구" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">활동 희망 지역 *</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
              <label style="display: flex; align-items: center;">
                <input type="checkbox" name="workAreas" value="강남구" style="margin-right: 8px;"> 강남구
              </label>
              <label style="display: flex; align-items: center;">
                <input type="checkbox" name="workAreas" value="서초구" style="margin-right: 8px;"> 서초구
              </label>
              <label style="display: flex; align-items: center;">
                <input type="checkbox" name="workAreas" value="송파구" style="margin-right: 8px;"> 송파구
              </label>
              <label style="display: flex; align-items: center;">
                <input type="checkbox" name="workAreas" value="영등포구" style="margin-right: 8px;"> 영등포구
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">활동 가능 시간대</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
              <label style="display: flex; align-items: center;">
                <input type="checkbox" name="availableTimes" value="weekday_morning" style="margin-right: 8px;"> 평일 오전
              </label>
              <label style="display: flex; align-items: center;">
                <input type="checkbox" name="availableTimes" value="weekday_afternoon" style="margin-right: 8px;"> 평일 오후
              </label>
              <label style="display: flex; align-items: center;">
                <input type="checkbox" name="availableTimes" value="weekend_morning" style="margin-right: 8px;"> 주말 오전
              </label>
              <label style="display: flex; align-items: center;">
                <input type="checkbox" name="availableTimes" value="weekend_afternoon" style="margin-right: 8px;"> 주말 오후
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">이동 수단</label>
            <select name="transportation" class="form-select">
              <option value="">선택해주세요</option>
              <option value="public">대중교통</option>
              <option value="car">자가용</option>
              <option value="bike">자전거/킥보드</option>
            </select>
          </div>
          
          <!-- 개인정보 수집 및 마케팅 활용 동의 -->
          <div class="form-group" style="margin: 20px 0 15px 0;">
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; background: #f8fafc;">
              <label style="display: flex; align-items: flex-start; font-size: 14px; font-weight: 600; margin-bottom: 10px;">
                <input type="checkbox" name="allPrivacyAgree" style="margin-right: 8px; margin-top: 2px; min-width: 16px;" required>
                개인정보 수집·이용 및 마케팅 활용에 동의합니다 (필수)
              </label>
              <div style="max-height: 150px; overflow-y: auto; font-size: 11px; color: #374151; line-height: 1.4; padding: 12px; background: white; border-radius: 4px; border: 1px solid #e5e7eb;">
                <p><strong>■ 개인정보 수집·이용에 관한 사항</strong></p>
                <p><strong>1. 개인정보의 수집·이용 목적</strong><br>
                회원가입, 서비스 제공, 본인확인, 고객상담, 정산 및 대금결제, 서비스 개선</p>
                
                <p><strong>2. 수집하는 개인정보 항목</strong><br>
                - 필수항목: 성명, 이메일, 휴대폰번호, 사업장명, 사업자등록번호, 사업장주소, 공간종류, 거주지역, 활동희망지역, 활동가능시간대, 이동수단<br>
                - 자동수집: 접속IP, 쿠키, 서비스 이용기록, 접속로그</p>
                
                <p><strong>3. 개인정보의 보유·이용기간</strong><br>
                회원탈퇴 시까지. 단, 관계법령에 따라 보존의무가 있는 경우 해당 기간까지 보관</p>
                
                <p><strong>4. 개인정보 제3자 제공</strong><br>
                원칙적으로 개인정보를 제3자에게 제공하지 않으며, 제공 시 사전 동의를 받습니다.</p>
                
                <p><strong>5. 개인정보 처리업무 위탁</strong><br>
                - Firebase(Google): 회원정보 저장 및 관리<br>
                - 결제대행업체: 결제처리 및 정산<br>
                - SMS/이메일 발송업체: 알림 서비스</p>
                
                <p><strong>■ 마케팅 활용에 관한 사항</strong></p>
                <p><strong>1. 마케팅 활용 목적</strong><br>
                신규 서비스 안내, 이벤트 정보 제공, 맞춤형 혜택 및 광고 제공</p>
                
                <p><strong>2. 마케팅 활용 방법</strong><br>
                이메일, SMS, MMS, 앱 푸시알림, 전화</p>
                
                <p><strong>3. 마케팅 활용 기간</strong><br>
                동의일로부터 동의 철회 시 또는 회원 탈퇴 시까지</p>
                
                <p style="margin-top: 10px;"><strong>※ 동의 거부 권리 및 불이익</strong><br>
                위 개인정보 수집·이용에 대한 동의는 서비스 이용을 위해 필요하며, 거부 시 회원가입 및 서비스 이용이 제한됩니다. 마케팅 활용 동의 거부 시에도 서비스 이용에는 제한이 없으나, 맞춤형 서비스 및 혜택 제공이 제한될 수 있습니다.</p>
              </div>
            </div>
          </div>
          
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn btn-outline" style="flex: 1;" onclick="authModal.goToPrevStep()">
              이전
            </button>
            <button type="submit" class="btn btn-primary" style="flex: 2;">
              <span class="btn-text">회원가입 완료</span>
              <span class="loading" style="display: none;"></span>
            </button>
          </div>
        </form>
      `;
      
      // 2단계 폼 이벤트 바인딩
      document.getElementById('signupStep2Form').addEventListener('submit', (e) => {
        this.handleSignupStep2(e);
      });
    }
  }
  
  // 이전 단계로 이동
  goToPrevStep() {
    this.currentStep--;
    this.renderSignupStep();
  }
  
  // 1단계 폼 처리
  handleSignupStep1(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // 비밀번호 확인
    if (data.password !== data.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // 폼 데이터 저장
    Object.assign(this.formData, data);
    
    // 다음 단계로 이동
    this.currentStep++;
    this.renderSignupStep();
  }
  
  // 2단계 폼 처리 (회원가입 완료)
  async handleSignupStep2(e) {
    e.preventDefault();
    
    const form = e.target;
    
    // 개인정보 수집 및 마케팅 활용 동의 체크 확인
    const allPrivacyAgree = form.querySelector('input[name="allPrivacyAgree"]');
    
    if (!allPrivacyAgree || !allPrivacyAgree.checked) {
      alert('개인정보 수집·이용 및 마케팅 활용에 동의해주세요.');
      return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const loading = submitBtn.querySelector('.loading');
    
    // 로딩 상태
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';
    
    try {
      const formData = new FormData(form);
      const step2Data = Object.fromEntries(formData.entries());
      
      // 체크박스 데이터 처리
      const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
      const checkboxData = {};
      checkboxes.forEach(cb => {
        if (!checkboxData[cb.name]) checkboxData[cb.name] = [];
        checkboxData[cb.name].push(cb.value);
      });
      
      // 최종 사용자 데이터 구성
      const userData = {
        ...this.formData,
        ...step2Data,
        ...checkboxData
      };
      
      console.log('회원가입 데이터:', userData);
      
      // Supabase 인증 및 사용자 생성
      const result = await this.supabaseSignUp(userData);
      
      console.log('회원가입 결과:', result);
      
      if (result.success) {
        console.log('회원가입 성공 - 알림 표시');
        
        // 버튼 숨기기
        if (submitBtn) {
          submitBtn.style.display = 'none';
        }
        
        // 모달 내용을 성공 메시지로 변경
        const signupContent = document.getElementById('signupContent');
        if (signupContent) {
          signupContent.innerHTML = `
            <div style="text-align: center; padding: 40px;">
              <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
              <h2 style="color: #22c55e; margin-bottom: 20px;">회원가입이 완료되었습니다!</h2>
              <p style="color: #6b7280; margin-bottom: 30px;">
                관리자 승인 후 서비스를 이용하실 수 있습니다.<br>
                승인 완료 시 이메일로 안내드리겠습니다.
              </p>
              <button class="btn btn-primary" style="
                padding: 12px 30px;
                background: #22c55e;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
              " onclick="authModal.close(); setTimeout(() => window.location.reload(), 100);">
                확인
              </button>
            </div>
          `;
          
          // 모달이 보이도록 확인
          const modal = document.getElementById('signupModal');
          if (modal) {
            modal.style.display = 'flex';
          }
        } else {
          // 백업 방법: alert 사용
          alert('회원가입이 완료되었습니다!\n관리자 승인 후 서비스를 이용하실 수 있습니다.');
          this.close();
          // 메인 페이지로 이동
          const currentPath = window.location.pathname;
          if (currentPath.includes('./business/')) {
            window.location.replace('../index.html');
          } else if (currentPath.includes('./partners/')) {
            window.location.replace('../index.html');
          } else {
            window.location.replace('index.html');
          }
        }
        
      } else {
        console.log('회원가입 실패:', result.error);
        
        // 에러 메시지도 모달로 표시
        const signupContent = document.getElementById('signupContent');
        signupContent.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 20px; color: #ef4444;">❌</div>
            <h2 style="color: #ef4444; margin-bottom: 20px;">회원가입 실패</h2>
            <p style="color: #6b7280; margin-bottom: 30px;">
              ${result.error}
            </p>
            <button class="btn btn-primary" onclick="authModal.close();">
              닫기
            </button>
          </div>
        `;
        
        // 실패 시에만 로딩 상태 해제
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        loading.style.display = 'none';
      }
      
    } catch (error) {
      console.error('회원가입 오류:', error);
      
      // 예외 발생 시 모달로 표시
      const signupContent = document.getElementById('signupContent');
      signupContent.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 20px; color: #ef4444;">⚠️</div>
          <h2 style="color: #ef4444; margin-bottom: 20px;">오류 발생</h2>
          <p style="color: #6b7280; margin-bottom: 30px;">
            회원가입 중 오류가 발생했습니다.<br>
            잠시 후 다시 시도해주세요.
          </p>
          <button class="btn btn-primary" onclick="authModal.close();">
            닫기
          </button>
        </div>
      `;
    }
  }
  
  // 로그인 처리
  async handleLogin(e) {
    console.log('handleLogin 함수 호출됨');
    e.preventDefault();
    e.stopPropagation();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const loading = submitBtn.querySelector('.loading');
    
    // 로딩 상태
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';
    
    try {
      const formData = new FormData(form);
      const { email, password } = Object.fromEntries(formData.entries());
      console.log('폼 데이터 추출 완료:', { email });
      
      let result;
      try {
        result = await this.supabaseSignIn(email, password);
        console.log('로그인 결과:', result);
      } catch (signInError) {
        console.error('supabaseSignIn 호출 중 에러:', signInError);
        throw signInError;
      }
      
      if (result && result.success) {
        console.log('로그인 성공 처리 시작');
        this.close();
        this.reset();
        
        // 사용자 타입에 따른 리다이렉트
        const user = result.userData || result.user; // userData가 있으면 우선 사용
        console.log('로그인 성공, 사용자 정보:', user);
        console.log('사용자 타입:', user?.type);
        
        // 현재 경로 확인
        const currentPath = window.location.pathname;
        const isInBusinessDir = currentPath.includes('/business/');
        const isInPartnersDir = currentPath.includes('/partners/');
        
        console.log('현재 경로:', currentPath);
        console.log('Business 디렉토리:', isInBusinessDir);
        console.log('Partners 디렉토리:', isInPartnersDir);
        
        // 사용자 데이터가 없는 경우 처리
        if (!user) {
          console.warn('사용자 데이터를 찾을 수 없습니다. 메인 페이지로 이동합니다.');
          alert('로그인은 성공했으나 사용자 정보가 없습니다.\n\n이전 시스템에서 가입한 계정인 경우, 관리자에게 문의해주세요.\n\n새로운 계정으로 회원가입을 진행해주시기 바랍니다.');
          
          // 로그아웃 처리
          await auth.signOut();
          window.location.replace('./');
          return;
        }
        
        // 사용자 타입이 없는 경우 처리
        if (!user.type) {
          console.warn('사용자 타입이 없습니다. 기본 처리를 수행합니다.');
          
          // userData가 없는 경우 (Auth에만 있는 사용자)
          if (!result.userData) {
            alert('로그인은 성공했으나 프로필 정보가 없습니다.\n\n이전 시스템에서 가입한 계정인 경우, 관리자에게 문의해주세요.\n\n새로운 계정으로 회원가입을 진행해주시기 바랍니다.');
            await auth.signOut();
            window.location.replace('../'); // 메인 페이지로
            return;
          }
          
          // userData는 있지만 type이 없는 경우
          alert('사용자 타입이 설정되지 않았습니다. 관리자에게 문의해주세요.');
          await auth.signOut();
          window.location.replace('../'); // 메인 페이지로
          return;
        }
        
        if (user.type === 'business') {
          // 사업자는 대시보드로 즉시 이동
          console.log('비즈니스 계정 로그인 성공, 대시보드로 이동');
          
          // 현재 경로에 따라 상대 경로 결정
          let targetUrl;
          if (isInBusinessDir) {
            targetUrl = 'dashboard.html';
          } else {
            targetUrl = './business/dashboard.html';
          }
          
          console.log(`리다이렉트 대상: ${targetUrl}`);
          console.log('리다이렉트 실행 중...');
          
          // 잠시 대기 후 리다이렉트 (디버깅을 위해)
          setTimeout(() => {
            console.log('실제 리다이렉트 시작');
            window.location.replace(targetUrl);
          }, 500);
          
          return; // 추가 코드 실행 방지
        } else if (user.type === 'partner') {
          // 파트너는 파트너 페이지로
          if (isInPartnersDir) {
            // 파트너 디렉토리에 있으면 대시보드로 바로 이동
            console.log('파트너 대시보드로 이동');
            window.location.replace('./dashboard.html');
          } else if (isInBusinessDir) {
            window.location.replace('../partners/');
          } else {
            window.location.replace('./partners/');
          }
        } else {
          // 기타 경우 페이지 새로고침
          console.log('페이지 새로고침');
          window.location.reload();
        }
      } else {
        console.error('로그인 실패:', result);
        console.error('로그인 실패 상세:', result);
        
        // 에러 메시지에 따른 친화적인 안내
        let errorMessage = result.error || '알 수 없는 오류';
        let userFriendlyMessage = '';
        
        if (errorMessage.includes('Invalid login credentials')) {
          userFriendlyMessage = '이메일 또는 비밀번호가 올바르지 않습니다.\n\n확인사항:\n• 이메일 주소가 정확한지 확인\n• 비밀번호가 정확한지 확인\n• 계정이 생성되어 있는지 확인';
        } else if (errorMessage.includes('Email not confirmed')) {
          userFriendlyMessage = '이메일 인증이 필요합니다.\n등록하신 이메일에서 인증을 완료해주세요.';
        } else if (errorMessage.includes('too many requests')) {
          userFriendlyMessage = '너무 많은 시도로 인해 일시적으로 차단되었습니다.\n잠시 후 다시 시도해주세요.';
        } else {
          userFriendlyMessage = `로그인에 실패했습니다.\n\n오류 내용: ${errorMessage}\n\n문제가 지속되면 고객센터에 문의해주세요.`;
        }
        
        alert(userFriendlyMessage);
      }
      
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      // 로딩 상태 해제
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      loading.style.display = 'none';
    }
    
    return false; // 폼 제출 방지
  }
  
  // 모달 닫기
  close() {
    if (this.currentModal) {
      document.getElementById(this.currentModal).style.display = 'none';
      document.body.style.overflow = 'auto';
      this.currentModal = null;
    }
  }
  
  
  // 상태 초기화
  reset() {
    this.currentStep = 1;
    this.formData = {};
  }

  // Supabase 회원가입
  async supabaseSignUp(userData) {
    try {
      // supabaseClient가 정의되어 있는지 확인
      if (!window.supabaseClient) {
        console.error('supabaseClient가 정의되지 않았습니다.');
        alert('시스템 오류가 발생했습니다. 페이지를 새로고침해주세요.');
        return { success: false, error: 'Supabase client not initialized' };
      }
      
      const supabaseClient = window.supabaseClient;
      
      // 1. Supabase Auth에 사용자 생성
      const { data: authData, error: authError } = await window.supabaseClient.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            type: userData.type
          }
        }
      });

      if (authError) throw authError;

      // 2. users 테이블에 사용자 정보 저장
      if (authData.user) {
        const userRecord = {
          uid: authData.user.id,
          email: userData.email,
          name: userData.name,
          type: userData.type,
          status: 'pending',  // 모든 사용자에게 기본 status 추가
          created_at: new Date().toISOString()  // 생성일시 추가
        };

        // 선택적 필드 추가 (존재하는 경우만)
        if (userData.phone) userRecord.phone = userData.phone;
        
        // 비즈니스 타입의 경우 - 최소한의 정보만 저장
        if (userData.type === 'business') {
          console.log('비즈니스 추가 정보:', {
            businessName: userData.businessName,
            businessNumber: userData.businessNumber,
            businessType: userData.businessType,
            businessAddress: userData.businessAddress
          });
          
          // 파트너와 동일한 필드 구조 사용 (임시)
          userRecord.residence = userData.businessAddress || '서울시';
          userRecord.work_areas = ['강남구']; // 기본값
        }
        
        // 파트너 타입의 경우 valid_partner_data 제약 조건 만족을 위한 기본값
        if (userData.type === 'partner') {
          // residence가 없으면 기본값 설정 (제약 조건 위반 방지)
          userRecord.residence = userData.residence || '서울시';
          // work_areas로 변경 (언더스코어 사용)
          userRecord.work_areas = (userData.workAreas && userData.workAreas.length > 0) 
            ? userData.workAreas 
            : ['강남구'];
        }
        
        // 추가 정보들은 테이블 스키마 확인 후 추가 예정
        // 현재는 기본 컬럼만 사용하여 회원가입 오류 방지
        /*
        // 사업자 추가 정보
        if (userData.type === 'business') {
          if (userData.businessName) userRecord.businessName = userData.businessName;
          if (userData.businessNumber) userRecord.businessNumber = userData.businessNumber;
          if (userData.businessAddress) userRecord.businessAddress = userData.businessAddress;
          if (userData.businessType) userRecord.businessType = userData.businessType;
        }

        // 파트너 추가 정보
        if (userData.type === 'partner') {
          if (userData.residence) userRecord.residence = userData.residence;
          if (userData.workAreas) userRecord.workAreas = userData.workAreas;
        }
        */

        console.log('users 테이블에 저장할 데이터:', userRecord);
        
        const { data: insertedData, error: dbError } = await window.supabaseClient
          .from('users')
          .insert([userRecord])
          .select();

        if (dbError) {
          console.error('DB 저장 오류:', dbError);
          console.error('오류 상세:', {
            code: dbError.code,
            message: dbError.message,
            details: dbError.details,
            hint: dbError.hint
          });
          // Auth 사용자 삭제 (롤백) - admin API는 클라이언트에서 사용 불가
          // await window.supabaseClient.auth.admin.deleteUser(authData.user.id);
          throw dbError;
        }
        
        console.log('DB 저장 성공! 생성된 사용자:', insertedData);
        
        // 저장 후 즉시 조회해서 확인
        const { data: verifyData, error: verifyError } = await window.supabaseClient
          .from('users')
          .select('*')
          .eq('uid', authData.user.id)
          .single();
          
        console.log('저장 직후 확인 조회:', { verifyData, verifyError });
      }

      return { success: true, user: authData.user };
    } catch (error) {
      console.error('회원가입 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // Supabase 로그인
  async supabaseSignIn(email, password) {
    console.log('supabaseSignIn 함수 시작');
    try {
      console.log('로그인 시도:', email);
      
      // supabaseClient 확인
      if (!window.supabaseClient) {
        console.error('supabaseClient가 정의되지 않았습니다.');
        return { success: false, error: 'Supabase client not initialized' };
      }
      
      const supabaseClient = window.supabaseClient;
      console.log('supabaseClient 확인 완료');
      
      console.log('signInWithPassword 호출 전');
      
      // 직접 Supabase 로그인 호출
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      console.log('signInWithPassword 호출 후');
      console.log('Supabase 로그인 응답:', { data, error });

      if (error) throw error;

      // 사용자 정보 조회 (중복 방지)
      console.log('users 테이블 조회 시작 - UID:', data.user.id);
      const { data: userData, error: userError } = await window.supabaseClient
        .from('users')
        .select('*')
        .eq('uid', data.user.id)
        .limit(1);
      
      const userRecord = userData && userData.length > 0 ? userData[0] : null;

      console.log('사용자 정보 조회 결과:', { userData, userError, userRecord });
      console.log('조회된 레코드 수:', userData ? userData.length : 0);
      console.log('사용자 UID:', data.user.id);
      console.log('사용자 이메일:', data.user.email);
      
      if (userRecord) {
        console.log('찾은 사용자 정보:', {
          id: userRecord.id,
          email: userRecord.email,
          type: userRecord.type,
          status: userRecord.status
        });
      }

      if (userError) {
        console.error('사용자 정보 조회 오류:', userError);
      } else if (!userRecord) {
        console.warn('Users 테이블에서 해당 사용자를 찾을 수 없습니다. UID:', data.user.id);
        
        // Auth 정보로부터 이메일 가져오기
        const email = data.user.email;
        
        // 이메일로 사용자 정보 다시 조회 시도
        console.log('이메일로 사용자 정보 재조회 시도:', email);
        const { data: emailUserData, error: emailError } = await window.supabaseClient
          .from('users')
          .select('*')
          .eq('email', email)
          .limit(1);
          
        if (emailUserData && emailUserData.length > 0) {
          console.log('이메일로 사용자 정보 찾음:', emailUserData[0]);
          userRecord = emailUserData[0];
        } else {
          console.log('이메일로도 사용자를 찾을 수 없음');
          console.log('Auth User ID:', data.user.id);
          console.log('Auth User Email:', data.user.email);
        }
      } else {
        console.log('사용자 레코드 조회 성공:', userRecord);
      }

      return { 
        success: true, 
        user: data.user,
        userData: userRecord
      };
    } catch (error) {
      console.error('supabaseSignIn 에러 발생:', error);
      console.error('로그인 오류 상세:', error);
      console.error('에러 스택:', error.stack);
      return { success: false, error: error.message };
    }
  }
}

// 전역 인증 모달 인스턴스
let authModal;

// 초기화 함수 (더 견고한 버전)
let initAttempts = 0;
const maxAttempts = 50; // 10초 대기

function initializeAuthModal() {
  if (authModal) {
    console.log('AuthModal: 이미 초기화됨, 건너뜀');
    return;
  }
  
  initAttempts++;
  console.log(`AuthModal: 초기화 시도 ${initAttempts}/${maxAttempts}, supabaseClient 상태:`, !!window.supabaseClient);
  
  if (window.supabaseClient) {
    console.log('AuthModal: Supabase 클라이언트 준비 완료');
    try {
      authModal = new AuthModal();
      window.authModal = authModal; // 전역으로 노출
      console.log('AuthModal: 초기화 완료');
    } catch (error) {
      console.error('AuthModal: 초기화 중 오류:', error);
      // 오류 발생 시 다시 시도
      if (initAttempts < maxAttempts) {
        setTimeout(initializeAuthModal, 300);
      }
    }
  } else if (initAttempts < maxAttempts) {
    console.log('AuthModal: Supabase 클라이언트 대기 중...');
    setTimeout(initializeAuthModal, 200);
  } else {
    console.error('AuthModal: 초기화 시간 초과. Supabase 설정을 확인하세요.');
  }
}

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  console.log('AuthModal: DOM 로드 완료, 초기화 시작');
  initializeAuthModal();
});