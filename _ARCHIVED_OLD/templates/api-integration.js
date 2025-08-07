/**
 * TODO: API 통합 모듈 설명
 * @module APIModuleName
 * @description API 엔드포인트와의 통신을 담당하는 모듈
 */

// 설정 및 클라이언트 임포트
import { API_ENDPOINTS, API_CONFIG } from '/config/api.config.js';
import { supabaseClient } from '/js/utils/supabase-client.js';

/**
 * API 모듈 클래스
 */
class APIModuleName {
    constructor() {
        // 기본 헤더 설정
        this.headers = {
            'Content-Type': 'application/json',
            // TODO: 추가 헤더 설정
        };
        
        // 요청 중 상태 관리
        this.pendingRequests = new Map();
    }
    
    /**
     * GET 요청
     * @param {string} endpoint - 엔드포인트 키 또는 경로
     * @param {Object} params - 쿼리 파라미터
     * @returns {Promise<Object>}
     */
    async get(endpoint, params = {}) {
        const url = this.buildUrl(endpoint, params);
        return this.request('GET', url);
    }
    
    /**
     * POST 요청
     * @param {string} endpoint
     * @param {Object} data - 요청 본문
     * @returns {Promise<Object>}
     */
    async post(endpoint, data = {}) {
        const url = this.buildUrl(endpoint);
        return this.request('POST', url, data);
    }
    
    /**
     * PUT 요청
     * @param {string} endpoint
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async put(endpoint, data = {}) {
        const url = this.buildUrl(endpoint);
        return this.request('PUT', url, data);
    }
    
    /**
     * DELETE 요청
     * @param {string} endpoint
     * @returns {Promise<Object>}
     */
    async delete(endpoint) {
        const url = this.buildUrl(endpoint);
        return this.request('DELETE', url);
    }
    
    /**
     * 공통 요청 처리
     * @private
     */
    async request(method, url, data = null) {
        // 중복 요청 방지
        const requestKey = `${method}:${url}`;
        if (this.pendingRequests.has(requestKey)) {
            return this.pendingRequests.get(requestKey);
        }
        
        // 요청 옵션
        const options = {
            method,
            headers: await this.getHeaders(),
        };
        
        if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
            options.body = JSON.stringify(data);
        }
        
        // 요청 Promise 생성
        const requestPromise = this.executeRequest(url, options);
        
        // 펜딩 요청으로 등록
        this.pendingRequests.set(requestKey, requestPromise);
        
        try {
            const result = await requestPromise;
            return result;
        } finally {
            // 완료 후 펜딩 목록에서 제거
            this.pendingRequests.delete(requestKey);
        }
    }
    
    /**
     * 실제 요청 실행
     * @private
     */
    async executeRequest(url, options) {
        try {
            const response = await fetch(url, options);
            
            // 응답 상태 체크
            if (!response.ok) {
                throw await this.handleErrorResponse(response);
            }
            
            // 응답 파싱
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
            
        } catch (error) {
            // 네트워크 에러 처리
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new Error('네트워크 연결을 확인해주세요');
            }
            throw error;
        }
    }
    
    /**
     * URL 생성
     * @private
     */
    buildUrl(endpoint, params = {}) {
        // 엔드포인트가 설정에 있는지 확인
        let baseUrl = API_ENDPOINTS[endpoint] || endpoint;
        
        // 절대 경로가 아니면 API 기본 URL 추가
        if (!baseUrl.startsWith('http')) {
            baseUrl = `${API_CONFIG.BASE_URL}${baseUrl}`;
        }
        
        // 쿼리 파라미터 추가
        const url = new URL(baseUrl);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.append(key, value);
            }
        });
        
        return url.toString();
    }
    
    /**
     * 헤더 가져오기
     * @private
     */
    async getHeaders() {
        const headers = { ...this.headers };
        
        // 인증 토큰 추가
        const token = await this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }
    
    /**
     * 인증 토큰 가져오기
     * @private
     */
    async getAuthToken() {
        // SupabaseClient에서 토큰 추출
        const currentUser = supabaseClient.getCurrentUser();
        return currentUser?.access_token || null;
    }
    
    /**
     * 에러 응답 처리
     * @private
     */
    async handleErrorResponse(response) {
        let errorMessage = `요청 실패 (${response.status})`;
        
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
            // JSON 파싱 실패 시 텍스트로 시도
            try {
                errorMessage = await response.text() || errorMessage;
            } catch {
                // 파싱 실패
            }
        }
        
        // 상태 코드별 처리
        switch (response.status) {
            case 401:
                // 인증 실패 - 로그인 페이지로
                window.location.href = '/login.html';
                break;
            case 403:
                errorMessage = '권한이 없습니다';
                break;
            case 404:
                errorMessage = '요청한 리소스를 찾을 수 없습니다';
                break;
            case 500:
                errorMessage = '서버 오류가 발생했습니다';
                break;
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        return error;
    }
}

// 싱글톤 인스턴스
const apiModule = new APIModuleName();

// Named exports - 실제 사용 예시
export const SampleAPI = {
    /**
     * TODO: 실제 API 메서드 구현
     * 예시: 목록 조회
     */
    async getList(params = {}) {
        try {
            const response = await apiModule.get('SAMPLE_LIST', params);
            return {
                success: true,
                data: response.data || response,
                total: response.total || 0
            };
        } catch (error) {
            console.error('[SampleAPI] getList error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    /**
     * 예시: 상세 조회
     */
    async getDetail(id) {
        try {
            const response = await apiModule.get(`SAMPLE_DETAIL/${id}`);
            return {
                success: true,
                data: response
            };
        } catch (error) {
            console.error('[SampleAPI] getDetail error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    /**
     * 예시: 생성
     */
    async create(data) {
        try {
            const response = await apiModule.post('SAMPLE_CREATE', data);
            return {
                success: true,
                data: response
            };
        } catch (error) {
            console.error('[SampleAPI] create error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    /**
     * 예시: 수정
     */
    async update(id, data) {
        try {
            const response = await apiModule.put(`SAMPLE_UPDATE/${id}`, data);
            return {
                success: true,
                data: response
            };
        } catch (error) {
            console.error('[SampleAPI] update error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    /**
     * 예시: 삭제
     */
    async remove(id) {
        try {
            await apiModule.delete(`SAMPLE_DELETE/${id}`);
            return {
                success: true
            };
        } catch (error) {
            console.error('[SampleAPI] remove error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

// 기본 export
export default apiModule;