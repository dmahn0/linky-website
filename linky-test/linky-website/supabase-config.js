// Supabase Configuration for Browser
// Drop-in replacement for Firebase

// Supabase 초기화
// 프로덕션에서는 환경변수를 사용하세요
const supabaseUrl = window.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = window.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// 전역 변수로 Supabase 클라이언트 생성
let supabaseClient;

// Supabase SDK가 로드될 때까지 대기하는 Promise
function waitForSupabaseSDK() {
    return new Promise((resolve) => {
        function checkSDK() {
            if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
                resolve();
            } else {
                setTimeout(checkSDK, 50);
            }
        }
        checkSDK();
    });
}

// Supabase 초기화
async function initializeSupabase() {
    try {
        // SDK 로드 대기
        await waitForSupabaseSDK();
        
        const { createClient } = window.supabase;
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        window.supabaseClient = supabaseClient; // 전역 변수로 설정
        
        console.log('Supabase 클라이언트 초기화 완료');
        console.log('window.supabaseClient:', window.supabaseClient);
        
        // 초기화 완료 이벤트 발생
        window.dispatchEvent(new Event('supabaseReady'));
        
        // auth 객체의 supabaseClient 참조 업데이트
        updateAuthFunctions();
    } catch (error) {
        console.error('Supabase 초기화 오류:', error);
    }
}

// auth 함수들이 supabaseClient를 사용하도록 업데이트
function updateAuthFunctions() {
    // auth 객체가 초기화된 supabaseClient를 사용하도록 보장
    console.log('Auth 함수 업데이트 완료');
}

// 즉시 초기화 시작
initializeSupabase();

// Firebase 호환 API
const auth = {
    // 현재 사용자
    currentUser: null,
    
    // 인증 상태 변경 리스너
    onAuthStateChanged: function(callback) {
        // supabaseClient가 준비될 때까지 대기
        if (!window.supabaseClient) {
            console.log('onAuthStateChanged: Waiting for supabaseClient...');
            const waitInterval = setInterval(() => {
                if (window.supabaseClient) {
                    clearInterval(waitInterval);
                    this.onAuthStateChanged(callback);
                }
            }, 100);
            return () => clearInterval(waitInterval);
        }
        
        // 초기 상태 확인
        window.supabaseClient.auth.getUser().then(({ data: { user } }) => {
            this.currentUser = user;
            callback(user);
        }).catch(error => {
            console.error('onAuthStateChanged getUser error:', error);
            callback(null);
        });
        
        // 상태 변경 구독
        const { data: { subscription } } = window.supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth state change event:', event, session?.user?.email);
            this.currentUser = session?.user || null;
            callback(session?.user || null);
        });
        
        // 구독 해제 함수 반환
        return () => subscription?.unsubscribe();
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
                    .limit(1);
                    
                const insertedRecord = result && result.length > 0 ? result[0] : null;
                    
                if (error) throw error;
                return { id: insertedRecord?.id };
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
                            .limit(1);
                            
                        const record = data && data.length > 0 ? data[0] : null;
                            
                        if (error) throw error;
                        return {
                            exists: !!record,
                            data: () => record,
                            id: record?.id
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