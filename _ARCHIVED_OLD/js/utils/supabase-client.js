/**
 * Supabase 클라이언트 유틸리티
 * Supabase 연결 및 인증 관리
 */

import { API_CONFIG } from '/config/api.config.js';
import { APP_CONFIG } from '/config/app.config.js';

class SupabaseClient {
    constructor() {
        this.supabaseUrl = API_CONFIG.SUPABASE_URL;
        this.supabaseKey = API_CONFIG.SUPABASE_ANON_KEY;
        this.client = null;
        this.currentUser = null;
        this.authListeners = new Set();
        
        this.init();
    }
    
    /**
     * Supabase 클라이언트 초기화
     */
    async init() {
        try {
            // Supabase JS SDK 동적 로드
            if (!window.supabase) {
                await this.loadSupabaseSDK();
            }
            
            // Supabase 클라이언트 생성
            this.client = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
            
            // 인증 상태 감지
            this.client.auth.onAuthStateChange((event, session) => {
                this.currentUser = session?.user || null;
                this.notifyAuthListeners(event, session);
            });
            
            // 현재 세션 복원
            const { data: { session } } = await this.client.auth.getSession();
            if (session) {
                this.currentUser = session.user;
            }
            
        } catch (error) {
            console.error('[SupabaseClient] 초기화 실패:', error);
        }
    }
    
    /**
     * Supabase SDK 동적 로드
     */
    async loadSupabaseSDK() {
        return new Promise((resolve, reject) => {
            if (window.supabase) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@supabase/supabase-js@2';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Supabase SDK 로드 실패'));
            document.head.appendChild(script);
        });
    }
    
    /**
     * 회원가입
     */
    async signUp(email, password, metadata = {}) {
        try {
            const { data, error } = await this.client.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            });
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('[SupabaseClient] 회원가입 실패:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 로그인
     */
    async signIn(email, password) {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('[SupabaseClient] 로그인 실패:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 로그아웃
     */
    async signOut() {
        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            
            this.currentUser = null;
            return { success: true };
            
        } catch (error) {
            console.error('[SupabaseClient] 로그아웃 실패:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 현재 사용자 정보
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * 인증 상태 확인
     */
    isAuthenticated() {
        return !!this.currentUser;
    }
    
    /**
     * 사용자 타입 가져오기
     */
    async getUserType() {
        if (!this.currentUser) return null;
        
        try {
            // business_users 테이블에서 확인
            const { data: businessUser } = await this.client
                .from('business_users')
                .select('auth_uid')
                .eq('auth_uid', this.currentUser.id)
                .single();
                
            if (businessUser) return 'business';
            
            // partner_users 테이블에서 확인
            const { data: partnerUser } = await this.client
                .from('partner_users')
                .select('auth_uid')
                .eq('auth_uid', this.currentUser.id)
                .single();
                
            if (partnerUser) return 'partner';
            
            return null;
            
        } catch (error) {
            console.error('[SupabaseClient] 사용자 타입 확인 실패:', error);
            return null;
        }
    }
    
    /**
     * 테이블 데이터 조회
     */
    async select(table, options = {}) {
        try {
            let query = this.client.from(table).select(options.select || '*');
            
            // 필터 적용
            if (options.filters) {
                options.filters.forEach(filter => {
                    query = query.filter(filter.column, filter.operator, filter.value);
                });
            }
            
            // 정렬
            if (options.orderBy) {
                query = query.order(options.orderBy.column, { 
                    ascending: options.orderBy.ascending || false 
                });
            }
            
            // 페이징
            if (options.range) {
                query = query.range(options.range.from, options.range.to);
            }
            
            const { data, error, count } = await query;
            
            if (error) throw error;
            return { success: true, data, count };
            
        } catch (error) {
            console.error(`[SupabaseClient] ${table} 조회 실패:`, error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 테이블 데이터 삽입
     */
    async insert(table, data) {
        try {
            const { data: result, error } = await this.client
                .from(table)
                .insert(data)
                .select();
            
            if (error) throw error;
            return { success: true, data: result };
            
        } catch (error) {
            console.error(`[SupabaseClient] ${table} 삽입 실패:`, error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 테이블 데이터 업데이트
     */
    async update(table, data, filters) {
        try {
            let query = this.client.from(table).update(data);
            
            // 필터 적용
            filters.forEach(filter => {
                query = query.filter(filter.column, filter.operator, filter.value);
            });
            
            const { data: result, error } = await query.select();
            
            if (error) throw error;
            return { success: true, data: result };
            
        } catch (error) {
            console.error(`[SupabaseClient] ${table} 업데이트 실패:`, error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 테이블 데이터 삭제
     */
    async delete(table, filters) {
        try {
            let query = this.client.from(table).delete();
            
            // 필터 적용
            filters.forEach(filter => {
                query = query.filter(filter.column, filter.operator, filter.value);
            });
            
            const { error } = await query;
            
            if (error) throw error;
            return { success: true };
            
        } catch (error) {
            console.error(`[SupabaseClient] ${table} 삭제 실패:`, error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 실시간 구독
     */
    subscribe(table, callback, filters = {}) {
        try {
            let channel = this.client
                .channel(`${table}_changes`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: table,
                    ...filters
                }, callback);
            
            channel.subscribe();
            return channel;
            
        } catch (error) {
            console.error(`[SupabaseClient] ${table} 구독 실패:`, error);
            return null;
        }
    }
    
    /**
     * 구독 해제
     */
    unsubscribe(channel) {
        if (channel) {
            this.client.removeChannel(channel);
        }
    }
    
    /**
     * 파일 업로드
     */
    async uploadFile(bucket, fileName, file) {
        try {
            const { data, error } = await this.client.storage
                .from(bucket)
                .upload(fileName, file);
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('[SupabaseClient] 파일 업로드 실패:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 파일 URL 가져오기
     */
    getFileUrl(bucket, fileName) {
        try {
            const { data } = this.client.storage
                .from(bucket)
                .getPublicUrl(fileName);
            
            return data.publicUrl;
            
        } catch (error) {
            console.error('[SupabaseClient] 파일 URL 가져오기 실패:', error);
            return null;
        }
    }
    
    /**
     * 인증 상태 리스너 등록
     */
    onAuthStateChange(callback) {
        this.authListeners.add(callback);
        
        // 해제 함수 반환
        return () => {
            this.authListeners.delete(callback);
        };
    }
    
    /**
     * 인증 리스너들에게 알림
     */
    notifyAuthListeners(event, session) {
        this.authListeners.forEach(callback => {
            try {
                callback(event, session);
            } catch (error) {
                console.error('[SupabaseClient] 인증 리스너 오류:', error);
            }
        });
    }
    
    /**
     * RPC 함수 호출
     */
    async rpc(functionName, params = {}) {
        try {
            const { data, error } = await this.client.rpc(functionName, params);
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error(`[SupabaseClient] RPC ${functionName} 실패:`, error);
            return { success: false, error: error.message };
        }
    }
}

// 싱글톤 인스턴스
let instance = null;

export default {
    getInstance() {
        if (!instance) {
            instance = new SupabaseClient();
        }
        return instance;
    }
};

// 편의를 위한 named export
export const supabaseClient = SupabaseClient.getInstance();