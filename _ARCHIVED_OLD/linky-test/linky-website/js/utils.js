// 공통 유틸리티 함수들
class LinkyUtils {
    // 날짜 포맷팅
    static formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('ko-KR');
    }

    // 사용자 타입 라벨
    static getTypeLabel(type) {
        const labels = {
            business: '사업자',
            partner: '파트너',
            admin: '관리자'
        };
        return labels[type] || type;
    }

    // 상태 라벨
    static getStatusLabel(status) {
        const labels = {
            pending: '대기중',
            approved: '승인됨',
            rejected: '거부됨',
            active: '활성',
            completed: '완료',
            cancelled: '취소됨',
            matched: '매칭됨',
            confirmed: '확정됨',
            in_progress: '진행중'
        };
        return labels[status] || status;
    }

    // 상태별 색상 설정
    static getStatusConfig(status) {
        const configs = {
            pending: { text: '매칭 대기', color: '#f59e0b', bg: '#fef3c7' },
            matched: { text: '매칭 완료', color: '#3b82f6', bg: '#dbeafe' },
            confirmed: { text: '작업 확정', color: '#8b5cf6', bg: '#e9d5ff' },
            in_progress: { text: '진행 중', color: '#f59e0b', bg: '#fef3c7' },
            completed: { text: '완료', color: '#10b981', bg: '#d1fae5' },
            cancelled: { text: '취소', color: '#ef4444', bg: '#fee2e2' },
            approved: { text: '승인됨', color: '#10b981', bg: '#d1fae5' },
            rejected: { text: '거부됨', color: '#ef4444', bg: '#fee2e2' }
        };
        return configs[status] || configs.pending;
    }

    // 가격 포맷팅
    static formatPrice(price) {
        if (!price && price !== 0) return '0원';
        return `${parseInt(price).toLocaleString()}원`;
    }

    // 긴급도 텍스트
    static getUrgencyText(urgency) {
        const urgencyText = {
            'normal': '일반',
            'urgent4h': '4시간 내 긴급',
            'urgent2h': '2시간 내 긴급',
            'immediate': '즉시 긴급'
        };
        return urgencyText[urgency] || '일반';
    }

    // 알림 표시
    static showAlert(message, type = 'info', containerId = 'alertContainer') {
        const container = document.getElementById(containerId);
        if (!container) {
            alert(message);
            return;
        }

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        container.innerHTML = '';
        container.appendChild(alertDiv);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    }

    // 로딩 상태 표시
    static showLoading(buttonElement, text = '처리 중...') {
        if (!buttonElement) return;
        
        buttonElement.disabled = true;
        buttonElement.originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = `<span class="loading"></span>${text}`;
    }

    // 로딩 상태 해제
    static hideLoading(buttonElement) {
        if (!buttonElement) return;
        
        buttonElement.disabled = false;
        if (buttonElement.originalText) {
            buttonElement.innerHTML = buttonElement.originalText;
        }
    }

    // Job ID 생성
    static generateJobId() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase();
        return `JOB-${dateStr}-${randomStr}`;
    }

    // 사용자 권한 확인
    static async checkUserPermission(user, requiredType, requiredStatus = 'approved') {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (!userDoc.exists) return false;
            
            const userData = userDoc.data();
            return userData.type === requiredType && userData.status === requiredStatus;
        } catch (error) {
            console.error('권한 확인 오류:', error);
            return false;
        }
    }

    // 서비스 가격 계산
    static calculateJobPrice(services, urgency = 'normal') {
        const servicePrices = {
            basic: 12000,
            floor: 3000,
            dishes: 3000,
            toilet: 3000
        };

        const urgencyFees = {
            normal: 0,
            urgent4h: 10000,
            urgent2h: 15000,
            immediate: 20000
        };

        let basePrice = servicePrices.basic;
        let additionalServices = 0;

        // 추가 서비스 가격 계산
        Object.keys(services).forEach(serviceType => {
            if (serviceType !== 'basic' && services[serviceType]?.selected && servicePrices[serviceType]) {
                additionalServices += servicePrices[serviceType];
            }
        });

        const urgencyFee = urgencyFees[urgency] || 0;
        const totalPrice = basePrice + additionalServices + urgencyFee;
        const commission = Math.floor(totalPrice * 0.2);
        const partnerEarnings = totalPrice - commission;

        return {
            basePrice,
            additionalServices,
            urgencyFee,
            totalPrice,
            commission,
            partnerEarnings
        };
    }
}

// Firebase 공통 함수들
class LinkyFirebase {
    // 사용자 정보 로드
    static async loadUserData(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            return userDoc.exists ? { id: uid, ...userDoc.data() } : null;
        } catch (error) {
            console.error('사용자 정보 로드 오류:', error);
            return null;
        }
    }

    // 공간 정보 로드
    static async loadUserSpaces(ownerId) {
        try {
            const spacesQuery = await db.collection('spaces')
                .where('ownerId', '==', ownerId)
                .where('status', '==', 'active')
                .get();

            const spaces = [];
            spacesQuery.forEach(doc => {
                spaces.push({ id: doc.id, ...doc.data() });
            });
            return spaces;
        } catch (error) {
            console.error('공간 목록 로드 오류:', error);
            return [];
        }
    }

    // 사용자별 작업 목록 로드
    static async loadUserJobs(userId, userType = 'business', limit = 10) {
        try {
            const field = userType === 'business' ? 'businessId' : 'partnerId';
            const jobsQuery = await db.collection('jobs')
                .where(field, '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            const jobs = [];
            jobsQuery.forEach(doc => {
                jobs.push({ id: doc.id, ...doc.data() });
            });
            return jobs;
        } catch (error) {
            console.error('작업 목록 로드 오류:', error);
            return [];
        }
    }

    // 사용 가능한 작업 목록 로드 (파트너용)
    static setupAvailableJobsListener(callback) {
        return db.collection('jobs')
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .onSnapshot(callback);
    }

    // 작업 상태 업데이트
    static async updateJobStatus(jobId, status, additionalData = {}) {
        try {
            const updateData = {
                status,
                updatedAt: new Date().toISOString(),
                ...additionalData
            };

            await db.collection('jobs').doc(jobId).update(updateData);
            return true;
        } catch (error) {
            console.error('작업 상태 업데이트 오류:', error);
            return false;
        }
    }

    // 작업 수락
    static async acceptJob(jobId, partnerId) {
        try {
            const jobRef = db.collection('jobs').doc(jobId);
            const job = await jobRef.get();
            
            if (!job.exists || job.data().status !== 'pending') {
                throw new Error('이미 처리된 작업입니다.');
            }

            await jobRef.update({
                partnerId: partnerId,
                status: 'matched',
                'matching.acceptedAt': new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error('작업 수락 오류:', error);
            throw error;
        }
    }

    // 통계 데이터 로드
    static async loadUserStats(userId, userType) {
        try {
            const field = userType === 'business' ? 'businessId' : 'partnerId';
            const jobsQuery = await db.collection('jobs')
                .where(field, '==', userId)
                .get();

            const jobs = [];
            jobsQuery.forEach(doc => {
                jobs.push(doc.data());
            });

            const thisMonth = new Date();
            const monthlyJobs = jobs.filter(job => {
                const jobDate = job.createdAt?.toDate?.() || new Date(job.createdAt);
                return jobDate.getMonth() === thisMonth.getMonth() && 
                       jobDate.getFullYear() === thisMonth.getFullYear();
            });

            return {
                totalJobs: jobs.length,
                monthlyJobs: monthlyJobs.length,
                pendingJobs: jobs.filter(job => job.status === 'pending').length,
                completedJobs: jobs.filter(job => job.status === 'completed').length,
                cancelledJobs: jobs.filter(job => job.status === 'cancelled').length
            };
        } catch (error) {
            console.error('통계 로드 오류:', error);
            return {
                totalJobs: 0,
                monthlyJobs: 0,
                pendingJobs: 0,
                completedJobs: 0,
                cancelledJobs: 0
            };
        }
    }
}

// 전역 객체로 export
window.LinkyUtils = LinkyUtils;
window.LinkyFirebase = LinkyFirebase;