/**
 * [API 모듈명] API Module
 * [API 모듈 설명]
 * 
 * @module api/[모듈명]
 * @requires supabase
 * @requires API_CONFIG
 */

import { API_CONFIG, apiHelpers } from '/config/api.config.js';

/**
 * [모듈명] API 클래스
 * Supabase를 사용한 [기능] 관리
 */
class [모듈명]API {
    constructor() {
        this.tableName = '[테이블명]';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5분
    }
    
    /**
     * 목록 조회
     * 
     * @param {Object} filters - 필터 옵션
     * @param {string} filters.userId - 사용자 ID
     * @param {string} filters.status - 상태
     * @param {number} filters.limit - 조회 개수
     * @param {number} filters.offset - 시작 위치
     * @returns {Promise<Object>} 조회 결과
     */
    async getList(filters = {}) {
        try {
            // 캐시 확인
            const cacheKey = JSON.stringify(filters);
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return { success: true, data: cached.data };
                }
            }
            
            // 쿼리 생성
            let query = supabase
                .from(this.tableName)
                .select('*');
            
            // 필터 적용
            if (filters.userId) {
                query = query.eq('user_id', filters.userId);
            }
            
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            
            // 페이지네이션
            const limit = filters.limit || 10;
            const offset = filters.offset || 0;
            query = query.range(offset, offset + limit - 1);
            
            // 정렬
            query = query.order('created_at', { ascending: false });
            
            // 실행
            const { data, error } = await query;
            
            if (error) throw error;
            
            // 캐시 저장
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            return {
                success: true,
                data,
                count: data.length
            };
        } catch (error) {
            console.error('[모듈명] getList error:', error);
            return {
                success: false,
                error: apiHelpers.handleError(error)
            };
        }
    }
    
    /**
     * 단일 항목 조회
     * 
     * @param {string} id - 항목 ID
     * @returns {Promise<Object>} 조회 결과
     */
    async getById(id) {
        try {
            if (!id) {
                throw new Error('ID is required');
            }
            
            // 캐시 확인
            const cacheKey = `item-${id}`;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return { success: true, data: cached.data };
                }
            }
            
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            
            // 캐시 저장
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('[모듈명] getById error:', error);
            return {
                success: false,
                error: apiHelpers.handleError(error)
            };
        }
    }
    
    /**
     * 생성
     * 
     * @param {Object} data - 생성할 데이터
     * @returns {Promise<Object>} 생성 결과
     */
    async create(data) {
        try {
            // 유효성 검사
            const validation = this.validateData(data);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            
            // 타임스탬프 추가
            const createData = {
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { data: newData, error } = await supabase
                .from(this.tableName)
                .insert(createData)
                .select()
                .single();
            
            if (error) throw error;
            
            // 캐시 무효화
            this.clearCache();
            
            return {
                success: true,
                data: newData
            };
        } catch (error) {
            console.error('[모듈명] create error:', error);
            return {
                success: false,
                error: apiHelpers.handleError(error)
            };
        }
    }
    
    /**
     * 수정
     * 
     * @param {string} id - 항목 ID
     * @param {Object} updates - 수정할 데이터
     * @returns {Promise<Object>} 수정 결과
     */
    async update(id, updates) {
        try {
            if (!id) {
                throw new Error('ID is required');
            }
            
            // 유효성 검사 (부분적)
            const validation = this.validateData(updates, true);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
            
            // 타임스탬프 업데이트
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };
            
            const { data, error } = await supabase
                .from(this.tableName)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            // 캐시 무효화
            this.clearCache();
            
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('[모듈명] update error:', error);
            return {
                success: false,
                error: apiHelpers.handleError(error)
            };
        }
    }
    
    /**
     * 삭제
     * 
     * @param {string} id - 항목 ID
     * @returns {Promise<Object>} 삭제 결과
     */
    async delete(id) {
        try {
            if (!id) {
                throw new Error('ID is required');
            }
            
            const { error } = await supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            // 캐시 무효화
            this.clearCache();
            
            return {
                success: true,
                message: '삭제되었습니다.'
            };
        } catch (error) {
            console.error('[모듈명] delete error:', error);
            return {
                success: false,
                error: apiHelpers.handleError(error)
            };
        }
    }
    
    /**
     * 검색
     * 
     * @param {string} query - 검색어
     * @param {Array<string>} fields - 검색할 필드
     * @returns {Promise<Object>} 검색 결과
     */
    async search(query, fields = ['name', 'description']) {
        try {
            if (!query) {
                return { success: true, data: [] };
            }
            
            // ILIKE를 사용한 부분 일치 검색
            let orConditions = fields.map(field => 
                `${field}.ilike.%${query}%`
            ).join(',');
            
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .or(orConditions)
                .limit(20);
            
            if (error) throw error;
            
            return {
                success: true,
                data,
                count: data.length
            };
        } catch (error) {
            console.error('[모듈명] search error:', error);
            return {
                success: false,
                error: apiHelpers.handleError(error)
            };
        }
    }
    
    /**
     * 통계 조회
     * 
     * @param {Object} params - 통계 파라미터
     * @returns {Promise<Object>} 통계 결과
     */
    async getStats(params = {}) {
        try {
            // 전체 개수
            const { count: totalCount } = await supabase
                .from(this.tableName)
                .select('*', { count: 'exact', head: true });
            
            // 상태별 개수 (예시)
            const statusCounts = {};
            const statuses = ['pending', 'active', 'completed'];
            
            for (const status of statuses) {
                const { count } = await supabase
                    .from(this.tableName)
                    .select('*', { count: 'exact', head: true })
                    .eq('status', status);
                
                statusCounts[status] = count || 0;
            }
            
            return {
                success: true,
                data: {
                    total: totalCount || 0,
                    byStatus: statusCounts,
                    lastUpdated: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('[모듈명] getStats error:', error);
            return {
                success: false,
                error: apiHelpers.handleError(error)
            };
        }
    }
    
    /**
     * 데이터 유효성 검사
     * 
     * @private
     * @param {Object} data - 검증할 데이터
     * @param {boolean} partial - 부분 검증 여부
     * @returns {Object} 검증 결과
     */
    validateData(data, partial = false) {
        const errors = [];
        
        // 필수 필드 검증 (생성 시에만)
        if (!partial) {
            // if (!data.requiredField) {
            //     errors.push('필수 필드가 누락되었습니다.');
            // }
        }
        
        // 데이터 타입 검증
        // if (data.email && !this.isValidEmail(data.email)) {
        //     errors.push('유효한 이메일 주소가 아닙니다.');
        // }
        
        // 길이 검증
        // if (data.description && data.description.length > 500) {
        //     errors.push('설명은 500자를 초과할 수 없습니다.');
        // }
        
        return {
            valid: errors.length === 0,
            error: errors.join(', ')
        };
    }
    
    /**
     * 이메일 유효성 검사
     * 
     * @private
     * @param {string} email - 이메일 주소
     * @returns {boolean} 유효성 여부
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * 캐시 초기화
     * 
     * @private
     */
    clearCache() {
        this.cache.clear();
    }
    
    /**
     * 실시간 구독
     * 
     * @param {Function} callback - 변경 시 호출될 콜백
     * @returns {Object} 구독 객체
     */
    subscribe(callback) {
        const subscription = supabase
            .channel(`${this.tableName}_changes`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: this.tableName
                },
                (payload) => {
                    // 캐시 무효화
                    this.clearCache();
                    
                    // 콜백 실행
                    if (callback) {
                        callback(payload);
                    }
                }
            )
            .subscribe();
        
        return subscription;
    }
    
    /**
     * 구독 해제
     * 
     * @param {Object} subscription - 구독 객체
     */
    unsubscribe(subscription) {
        if (subscription) {
            supabase.removeChannel(subscription);
        }
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
const [모듈명]API = new [모듈명]API();
export default [모듈명]API;