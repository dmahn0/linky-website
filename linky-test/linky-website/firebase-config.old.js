// ⚠️ WARNING: This file is deprecated and should not be used!
// This is the old Firebase configuration that has been migrated to Supabase.
// Please use supabase-config.js instead.
// DO NOT USE THIS FILE IN PRODUCTION!

// Firebase 설정 및 초기화
// 실제 Firebase 프로젝트 생성 후 여기에 설정값 입력

// Firebase SDK 설정
const firebaseConfig = {
  apiKey: "AIzaSyCeuP7pniU-g_cTZxFIn7heq5WQLzzqRKc",
  authDomain: "linkykorea-b8700.firebaseapp.com",
  projectId: "linkykorea-b8700",
  storageBucket: "linkykorea-b8700.firebasestorage.app",
  messagingSenderId: "178024786798",
  appId: "1:178024786798:web:20f4d491c930846dd02f7f",
  measurementId: "G-08LZYNW1SV"
};
// Firebase 초기화
let app, auth, db, storage;

// Firebase SDK가 로드된 후 초기화
function initializeFirebase() {
  try {
    // Firebase 앱 초기화
    app = // Supabase is initialized in supabase-config.js
    // firebase.initializeApp(firebaseConfig);
    
    // 서비스 초기화
    auth = auth;
    db = db;
    storage = storage;
    
    console.log('Firebase 초기화 성공');
    
    // 인증 상태 변화 감지
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('사용자 로그인됨:', user.uid);
        handleUserLoggedIn(user);
      } else {
        console.log('사용자 로그아웃됨');
        handleUserLoggedOut();
      }
    });
    
  } catch (error) {
    console.error('Firebase 초기화 오류:', error);
  }
}

// 사용자 로그인 처리
async function handleUserLoggedIn(user) {
  try {
    // 사용자 상태 확인
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      
      // 승인되지 않은 사용자는 로그아웃 처리
      if (userData.status !== 'approved') {
        await auth.signOut();
        return;
      }
    }
    
    // 로그인 상태 UI 업데이트
    const authButtons = document.querySelectorAll('.auth-required');
    authButtons.forEach(btn => btn.style.display = 'block');
    
    const loginButtons = document.querySelectorAll('.login-required');
    loginButtons.forEach(btn => btn.style.display = 'none');
    
    // 사용자 정보 로드
    loadUserProfile(user.uid);
  } catch (error) {
    console.error('사용자 상태 확인 오류:', error);
  }
}

// 사용자 로그아웃 처리
function handleUserLoggedOut() {
  // 로그아웃 상태 UI 업데이트
  const authButtons = document.querySelectorAll('.auth-required');
  authButtons.forEach(btn => btn.style.display = 'none');
  
  const loginButtons = document.querySelectorAll('.login-required');
  loginButtons.forEach(btn => btn.style.display = 'block');
}

// 사용자 프로필 로드
async function loadUserProfile(uid) {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('사용자 데이터:', userData);
      
      // UI에 사용자 정보 표시
      updateUserUI(userData);
    }
  } catch (error) {
    console.error('사용자 프로필 로드 오류:', error);
  }
}

// UI 업데이트
function updateUserUI(userData) {
  // 사용자 이름 표시
  const userNameElements = document.querySelectorAll('.user-name');
  userNameElements.forEach(el => el.textContent = userData.name || '사용자');
  
  // 사용자 타입별 메뉴 표시
  const businessMenus = document.querySelectorAll('.business-menu');
  const partnerMenus = document.querySelectorAll('.partner-menu');
  
  if (userData.type === 'business') {
    businessMenus.forEach(menu => menu.style.display = 'block');
    partnerMenus.forEach(menu => menu.style.display = 'none');
  } else if (userData.type === 'partner') {
    businessMenus.forEach(menu => menu.style.display = 'none');
    partnerMenus.forEach(menu => menu.style.display = 'block');
  }
}

// Firebase 인증 함수들
const FirebaseAuth = {
  // 이메일/비밀번호 회원가입
  async signUp(email, password, userData) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // 기본 사용자 정보
      const baseUserData = {
        uid: user.uid,
        email: email,
        name: userData.name,
        phone: userData.phone,
        type: userData.type, // 'business' or 'partner'
        status: 'pending', // 승인 대기
        profilePhoto: null,
        notificationSettings: {
          email: true,
          sms: true,
          push: true,
          marketing: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 사업자 추가 정보
      if (userData.type === 'business') {
        baseUserData.business = {
          businessName: userData.businessName,
          businessNumber: userData.businessNumber || null,
          businessType: userData.businessType,
          businessAddress: userData.businessAddress,
          representativeName: userData.name,
          bankAccount: null, // 추후 입력
          monthlyUsage: 0,
          totalSpent: 0,
          spaceCount: 0
        };
      }
      
      // 파트너 추가 정보
      if (userData.type === 'partner') {
        baseUserData.partner = {
          realName: userData.name,
          idNumber: null, // 추후 입력
          idCardPhoto: null, // 추후 입력
          workInfo: {
            areas: userData.workAreas || [],
            availableTimes: {
              weekday: userData.availableTimes?.filter(t => t.includes('weekday')).map(t => t.split('_')[1]) || [],
              weekend: userData.availableTimes?.filter(t => t.includes('weekend')).map(t => t.split('_')[1]) || []
            },
            transportation: userData.transportation || null,
            experience: 'none'
          },
          performance: {
            rating: 0,
            completedJobs: 0,
            cancelledJobs: 0,
            totalEarnings: 0,
            thisMonthEarnings: 0,
            level: 'bronze'
          },
          bankAccount: null // 추후 입력
        };
      }
      
      // Firestore에 사용자 정보 저장
      try {
        await db.collection('users').doc(user.uid).set(baseUserData);
        console.log('사용자 정보 저장 성공');
      } catch (dbError) {
        console.error('Firestore 저장 오류:', dbError);
        // 사용자는 생성되었으므로 성공으로 처리
      }
      
      // 승인 대기 정보 저장 (선택사항 - 실패해도 진행)
      try {
        await db.collection('pendingApprovals').add({
          userId: user.uid,
          userType: userData.type,
          submittedData: userData,
          status: 'pending',
          submittedAt: new Date().toISOString()
        });
        console.log('승인 대기 정보 저장 성공');
      } catch (pendingError) {
        console.error('승인 대기 정보 저장 오류:', pendingError);
        // 이 오류는 무시하고 진행
      }
      
      console.log('회원가입 성공:', user.uid);
      
      // 회원가입 후 자동 로그아웃 비활성화 (디버깅용)
      // try {
      //   await auth.signOut();
      //   console.log('자동 로그아웃 완료');
      // } catch (logoutError) {
      //   console.error('로그아웃 오류:', logoutError);
      // }
      
      return { success: true, user };
    } catch (error) {
      console.error('회원가입 오류:', error);
      
      // 에러 메시지 한글화
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일입니다.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '비밀번호는 6자 이상이어야 합니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '올바른 이메일 형식이 아닙니다.';
      }
      
      return { success: false, error: errorMessage };
    }
  },
  
  // 이메일/비밀번호 로그인
  async signIn(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // 사용자 상태 확인
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        
        // 승인 상태 확인
        if (userData.status === 'pending') {
          await auth.signOut(); // 로그아웃 처리
          return { 
            success: false, 
            error: '승인 대기 중입니다. 관리자 승인 후 이용하실 수 있습니다.' 
          };
        } else if (userData.status === 'rejected') {
          await auth.signOut(); // 로그아웃 처리
          return { 
            success: false, 
            error: '승인이 거부되었습니다. 고객센터로 문의해주세요.' 
          };
        } else if (userData.status === 'suspended') {
          await auth.signOut(); // 로그아웃 처리
          return { 
            success: false, 
            error: '계정이 정지되었습니다. 고객센터로 문의해주세요.' 
          };
        }
      }
      
      console.log('로그인 성공:', user.uid);
      
      // Firestore에서 사용자 전체 정보 가져오기
      const userFullData = userDoc.exists ? userDoc.data() : { uid: user.uid, email: user.email };
      
      return { success: true, user: userFullData };
    } catch (error) {
      console.error('로그인 오류:', error);
      
      // 에러 메시지 한글화
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found') {
        errorMessage = '등록되지 않은 이메일입니다.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = '비밀번호가 일치하지 않습니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '올바른 이메일 형식이 아닙니다.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = '비활성화된 계정입니다.';
      }
      
      return { success: false, error: errorMessage };
    }
  },
  
  // 로그아웃
  async signOut() {
    try {
      await auth.signOut();
      console.log('로그아웃 성공');
      return { success: true };
    } catch (error) {
      console.error('로그아웃 오류:', error);
      return { success: false, error: error.message };
    }
  },
  
  // 현재 사용자 가져오기
  getCurrentUser() {
    return auth.currentUser;
  },
  
  // 사용자 인증 상태 확인
  isAuthenticated() {
    return auth.currentUser !== null;
  }
};

// Firestore 데이터베이스 함수들
const FirebaseDB = {
  // 사용자 정보 가져오기
  async getUser(uid) {
    try {
      const doc = await db.collection('users').doc(uid).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      return null;
    }
  },
  
  // 사용자 정보 업데이트
  async updateUser(uid, data) {
    try {
      await db.collection('users').doc(uid).update({
        ...data,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('사용자 정보 업데이트 오류:', error);
      return { success: false, error: error.message };
    }
  },
  
  // 공간 생성
  async createSpace(spaceData) {
    try {
      const docRef = await db.collection('spaces').add({
        ...spaceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('공간 생성 성공:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('공간 생성 오류:', error);
      return { success: false, error: error.message };
    }
  },
  
  // 사용자의 공간 목록 가져오기
  async getUserSpaces(userId) {
    try {
      const snapshot = await db.collection('spaces')
        .where('ownerId', '==', userId)
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .get();
      
      const spaces = [];
      snapshot.forEach(doc => {
        spaces.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, spaces };
    } catch (error) {
      console.error('공간 목록 조회 오류:', error);
      return { success: false, error: error.message, spaces: [] };
    }
  },
  
  // 작업 요청 생성
  async createJob(jobData) {
    try {
      // 작업 ID 생성
      const jobId = 'JOB-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + 
                    Math.random().toString(36).substr(2, 6).toUpperCase();
      
      await db.collection('jobs').doc(jobId).set({
        jobId,
        ...jobData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return { success: true, jobId };
    } catch (error) {
      console.error('작업 생성 오류:', error);
      return { success: false, error: error.message };
    }
  }
};

// 페이지 로드 시 Firebase 초기화
document.addEventListener('DOMContentLoaded', function() {
  // Firebase SDK 로드 확인 후 초기화
  if (typeof firebase !== 'undefined') {
    initializeFirebase();
  } else {
    console.error('Firebase SDK가 로드되지 않았습니다.');
  }
});