// 간단한 버전의 auth-modal.js
class SimpleAuthModal {
  constructor() {
    console.log('SimpleAuthModal 생성');
    this.loginModal = null;
    this.createLoginModal();
  }

  createLoginModal() {
    const modalHTML = `
      <div id="loginModal" class="modal" style="display: none;">
        <div class="modal-content" style="max-width: 400px; margin: 100px auto; background: white; padding: 30px; border-radius: 8px;">
          <h3>로그인</h3>
          <form id="simpleLoginForm">
            <div style="margin-bottom: 15px;">
              <label>이메일</label>
              <input type="email" name="email" style="width: 100%; padding: 10px;" required>
            </div>
            <div style="margin-bottom: 15px;">
              <label>비밀번호</label>
              <input type="password" name="password" style="width: 100%; padding: 10px;" required>
            </div>
            <button type="submit" style="width: 100%; padding: 10px; background: #22c55e; color: white; border: none; cursor: pointer;">
              로그인
            </button>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.loginModal = document.getElementById('loginModal');
    
    // 폼 이벤트 바인딩
    const form = document.getElementById('simpleLoginForm');
    form.addEventListener('submit', (e) => this.handleLogin(e));
  }

  openLogin() {
    console.log('로그인 모달 열기');
    this.loginModal.style.display = 'block';
  }

  async handleLogin(e) {
    e.preventDefault();
    console.log('로그인 처리 시작');
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    console.log('로그인 시도:', email);
    
    try {
      // 직접 로그인 시도
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        alert('로그인 실패: ' + error.message);
        return;
      }
      
      console.log('로그인 성공!');
      
      // 사용자 정보 조회
      const { data: userData } = await window.supabaseClient
        .from('users')
        .select('*')
        .eq('uid', data.user.id)
        .limit(1);
      
      if (userData && userData.length > 0) {
        const user = userData[0];
        console.log('사용자 타입:', user.type);
        
        // 모달 닫기
        this.loginModal.style.display = 'none';
        
        // 리다이렉트
        if (user.type === 'business') {
          console.log('비즈니스 대시보드로 이동');
          window.location.href = 'dashboard.html';
        } else if (user.type === 'partner') {
          console.log('파트너 대시보드로 이동');
          window.location.href = '../partners/dashboard.html';
        }
      }
      
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  }
}

// 전역 변수
let simpleAuthModal;

// 초기화
document.addEventListener('DOMContentLoaded', function() {
  function initSimpleModal() {
    if (window.supabaseClient) {
      console.log('SimpleAuthModal 초기화');
      simpleAuthModal = new SimpleAuthModal();
      window.simpleAuthModal = simpleAuthModal;
    } else {
      setTimeout(initSimpleModal, 200);
    }
  }
  initSimpleModal();
});