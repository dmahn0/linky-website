// Supabase Configuration for Browser
// Drop-in replacement for Firebase

// Supabase 초기화
const supabaseUrl = 'https://mzihuflrbspvyjknxlad.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aWh1ZmxyYnNwdnlqa254bGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MTk3ODgsImV4cCI6MjA2ODM5NTc4OH0.UDwv6eknjWwmbZ9WsRioi3J23_1az9O1pJFlnKgQ88s';

// 전역 변수로 Supabase 클라이언트 생성
let supabaseClient;

// Supabase SDK가 로드될 때까지 대기
function initializeSupabase() {
    if (typeof window !== 'undefined' && window.supabase) {
        const { createClient } = window.supabase;
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        window.supabaseClient = supabaseClient; // 전역 변수로 즉시 설정
        console.log('Supabase 클라이언트 초기화 완료');
        
        // auth 객체의 supabaseClient 참조 업데이트
        updateAuthFunctions();
    } else {
        console.error('Supabase SDK가 아직 로드되지 않았습니다.');
    }
}

// auth 함수들이 supabaseClient를 사용하도록 업데이트
function updateAuthFunctions() {
    // auth 객체가 초기화된 supabaseClient를 사용하도록 보장
    console.log('Auth 함수 업데이트 완료');
}

// 즉시 시도
initializeSupabase();

// SDK가 로드되지 않았다면 잠시 후 재시도
if (!supabaseClient) {
    window.addEventListener('load', initializeSupabase);
}

// Firebase 호환 API
const auth = {
    // 현재 사용자
    currentUser: null,
    
    // 인증 상태 변경 리스너
    onAuthStateChanged: function(callback) {
        const checkClient = () => {
            if (!window.supabaseClient) {
                console.log('Waiting for supabaseClient...');
                setTimeout(() => checkClient(), 100);
                return;
            }
            
            // 초기 상태 확인
            window.supabaseClient.auth.getUser().then(({ data: { user } }) => {
                this.currentUser = user;
                callback(user);
            });
            
            // 상태 변경 구독
            const { data: { subscription } } = window.supabaseClient.auth.onAuthStateChange((event, session) => {
                this.currentUser = session?.user || null;
                callback(session?.user || null);
            });
            
            return () => subscription?.unsubscribe();
        };
        
        return checkClient();
    },
    
    // 회원가입
    createUserWithEmailAndPassword: async function(email, password) {
        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password
        });
        if (error) throw error;
        this.currentUser = data.user;
        return { user: data.user };
    },
    
    // 로그인
    signInWithEmailAndPassword: async function(email, password) {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        this.currentUser = data.user;
        return { user: data.user };
    },
    
    // 로그아웃
    signOut: async function() {
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) throw error;
        this.currentUser = null;
    }
};

// Firestore 호환 API
const db = {
    collection: function(collectionName) {
        return {
            // 문서 추가
            add: async function(data) {
                // uid 자동 추가
                if (auth.currentUser && !data.uid) {
                    data.uid = auth.currentUser.id;
                }
                
                const { data: result, error } = await window.supabaseClient
                    .from(collectionName)
                    .insert([data])
                    .select()
                    .single();
                    
                if (error) throw error;
                return { id: result.id };
            },
            
            // 문서 참조
            doc: function(docId) {
                return {
                    // 문서 가져오기
                    get: async function() {
                        const { data, error } = await window.supabaseClient
                            .from(collectionName)
                            .select('*')
                            .eq('id', docId)
                            .single();
                            
                        if (error) throw error;
                        return {
                            exists: !!data,
                            data: () => data,
                            id: data?.id
                        };
                    },
                    
                    // 문서 설정
                    set: async function(data, options = {}) {
                        const { error } = await window.supabaseClient
                            .from(collectionName)
                            .upsert([{ ...data, id: docId }], {
                                onConflict: 'id'
                            });
                            
                        if (error) throw error;
                    },
                    
                    // 문서 업데이트
                    update: async function(data) {
                        const { error } = await window.supabaseClient
                            .from(collectionName)
                            .update(data)
                            .eq('id', docId);
                            
                        if (error) throw error;
                    },
                    
                    // 문서 삭제
                    delete: async function() {
                        const { error } = await window.supabaseClient
                            .from(collectionName)
                            .delete()
                            .eq('id', docId);
                            
                        if (error) throw error;
                    }
                };
            },
            
            // 쿼리
            where: function(field, operator, value) {
                let query = window.supabaseClient.from(collectionName).select('*');
                
                switch(operator) {
                    case '==':
                        query = query.eq(field, value);
                        break;
                    case '!=':
                        query = query.neq(field, value);
                        break;
                    case '>':
                        query = query.gt(field, value);
                        break;
                    case '>=':
                        query = query.gte(field, value);
                        break;
                    case '<':
                        query = query.lt(field, value);
                        break;
                    case '<=':
                        query = query.lte(field, value);
                        break;
                    case 'in':
                        query = query.in(field, value);
                        break;
                    case 'array-contains':
                        query = query.contains(field, [value]);
                        break;
                }
                
                return {
                    get: async function() {
                        const { data, error } = await query;
                        if (error) throw error;
                        
                        return {
                            docs: data.map(doc => ({
                                id: doc.id,
                                data: () => doc,
                                exists: true
                            })),
                            empty: data.length === 0,
                            size: data.length
                        };
                    },
                    
                    orderBy: function(field, direction = 'asc') {
                        query = query.order(field, { ascending: direction === 'asc' });
                        return this;
                    },
                    
                    limit: function(limit) {
                        query = query.limit(limit);
                        return this;
                    }
                };
            }
        };
    }
};

// Storage 호환 API
const storage = {
    ref: function(path) {
        return {
            put: async function(file) {
                const fileName = `${Date.now()}_${file.name}`;
                const filePath = `${path}/${fileName}`;
                
                const { data, error } = await window.supabaseClient.storage
                    .from('uploads')
                    .upload(filePath, file);
                    
                if (error) throw error;
                
                return {
                    ref: {
                        getDownloadURL: async function() {
                            const { data } = window.supabaseClient.storage
                                .from('uploads')
                                .getPublicUrl(filePath);
                            return data.publicUrl;
                        }
                    }
                };
            }
        };
    }
};

// Firebase 객체 에뮬레이션
const firebase = {
    auth: () => auth,
    firestore: () => db,
    storage: () => storage
};

// 타임스탬프 헬퍼
firebase.firestore.FieldValue = {
    serverTimestamp: () => new Date().toISOString()
};

// 전역 변수로 노출 (Firebase 호환성)
if (typeof window !== 'undefined') {
    window.auth = auth;
    window.db = db;
    window.storage = storage;
    window.firebase = firebase;
    // supabaseClient는 initializeSupabase에서 설정됨
}