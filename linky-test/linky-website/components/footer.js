// 푸터 컴포넌트
class FooterComponent {
    constructor() {
        this.render();
    }

    render() {
        const footerHTML = `
            <footer class="footer">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>Linky Korea</h3>
                        <p>무인공간 정리 서비스의 새로운 기준</p>
                        <div class="social-links">
                            <a href="#" aria-label="Instagram">📷</a>
                            <a href="#" aria-label="Blog">📝</a>
                            <a href="#" aria-label="YouTube">📺</a>
                        </div>
                    </div>
                    
                    <div class="footer-section">
                        <h4>서비스</h4>
                        <ul>
                            <li><a href="${this.getBasePath()}business/">사업자</a></li>
                            <li><a href="${this.getBasePath()}partners.html">파트너</a></li>
                            <li><a href="#pricing">요금안내</a></li>
                            <li><a href="#faq">자주 묻는 질문</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h4>회사</h4>
                        <ul>
                            <li><a href="#about">회사소개</a></li>
                            <li><a href="#contact">연락처</a></li>
                            <li><a href="#terms">이용약관</a></li>
                            <li><a href="#privacy">개인정보처리방침</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h4>문의하기</h4>
                        <p>📧 help@linkykorea.com</p>
                        <p>📱 1566-1234</p>
                        <p>평일 09:00 - 18:00</p>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>&copy; 2025 Linky Korea. All rights reserved.</p>
                </div>
            </footer>
        `;

        // 푸터를 지정된 위치에 삽입
        const footerRoot = document.getElementById('footer-root');
        if (footerRoot) {
            footerRoot.innerHTML = footerHTML;
        } else {
            document.body.insertAdjacentHTML('beforeend', footerHTML);
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
}