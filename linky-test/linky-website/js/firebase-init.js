// Firebase 초기 데이터 설정 스크립트
// 이 스크립트는 개발 환경에서 초기 데이터를 설정하는 용도입니다.

// 시스템 설정 초기화
async function initializeSystemConfig() {
  try {
    // 기본 가격 설정
    await db.collection('config').doc('pricing').set({
      basic: 12000,
      floor: {
        small: 3000,    // 15평 이하
        medium: 5000,   // 16-30평
        large: 8000     // 31평 이상
      },
      dishes: 3000,
      toilet: 3000,
      urgency: {
        urgent4h: 10000,   // 4시간 내
        urgent2h: 20000,   // 2시간 내
        immediate: 30000   // 즉시
      },
      commission: 0.2,     // 20% 수수료
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // 시스템 설정
    await db.collection('config').doc('system').set({
      version: '1.0.0',
      maintenanceMode: false,
      announcement: null,
      serviceAreas: ['강남구', '서초구', '송파구', '영등포구', '마포구'],
      workingHours: {
        weekday: { start: '09:00', end: '22:00' },
        weekend: { start: '10:00', end: '20:00' }
      },
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('시스템 설정 초기화 완료');
  } catch (error) {
    console.error('시스템 설정 초기화 오류:', error);
  }
}

// 관리자 계정 생성
async function createAdminAccount(email, password) {
  try {
    // Firebase Auth에서 관리자 생성
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Firestore에 관리자 정보 저장
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: email,
      name: '시스템 관리자',
      phone: '010-0000-0000',
      type: 'admin',
      status: 'approved',
      profilePhoto: null,
      notificationSettings: {
        email: true,
        sms: true,
        push: true,
        marketing: true
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // 관리자 권한 설정 (Custom Claims는 서버에서 설정해야 함)
    console.log('관리자 계정 생성 완료:', user.uid);
    console.log('주의: Firebase Admin SDK를 통해 custom claims를 설정해야 합니다.');
    
    return user;
  } catch (error) {
    console.error('관리자 계정 생성 오류:', error);
    return null;
  }
}

// 테스트 데이터 생성
async function createTestData() {
  try {
    // 테스트 사업자 생성
    const testBusiness = {
      uid: 'test-business-001',
      email: 'test.business@example.com',
      name: '김사장',
      phone: '010-1111-2222',
      type: 'business',
      status: 'approved',
      profilePhoto: null,
      business: {
        businessName: '강남 스터디카페',
        businessNumber: '123-45-67890',
        businessType: 'studyroom',
        businessAddress: '서울시 강남구 논현동 123-45',
        representativeName: '김사장',
        bankAccount: {
          bank: '국민은행',
          accountNumber: '1234-5678-9012',
          accountHolder: '김사장'
        },
        monthlyUsage: 0,
        totalSpent: 0,
        spaceCount: 0
      },
      notificationSettings: {
        email: true,
        sms: true,
        push: true,
        marketing: false
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // 테스트 파트너 생성
    const testPartner = {
      uid: 'test-partner-001',
      email: 'test.partner@example.com',
      name: '이파트너',
      phone: '010-3333-4444',
      type: 'partner',
      status: 'approved',
      profilePhoto: null,
      partner: {
        realName: '이파트너',
        idNumber: null,
        idCardPhoto: null,
        workInfo: {
          areas: ['강남구', '서초구'],
          availableTimes: {
            weekday: ['morning', 'afternoon'],
            weekend: ['morning']
          },
          transportation: 'public',
          experience: '1year'
        },
        performance: {
          rating: 4.8,
          completedJobs: 25,
          cancelledJobs: 1,
          totalEarnings: 360000,
          thisMonthEarnings: 72000,
          level: 'silver'
        },
        bankAccount: {
          bank: '카카오뱅크',
          accountNumber: '3333-4444-5555',
          accountHolder: '이파트너'
        }
      },
      notificationSettings: {
        email: true,
        sms: true,
        push: true,
        marketing: false
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // 테스트 공간 생성
    const testSpace = {
      ownerId: 'test-business-001',
      name: '논현동 스터디룸 A',
      type: 'studyroom',
      size: 15,
      capacity: 6,
      address: {
        fullAddress: '서울시 강남구 논현동 123-45 3층',
        sido: '서울시',
        sigungu: '강남구',
        dong: '논현동',
        detail: '논현빌딩 3층 301호',
        postalCode: '06120',
        coordinates: {
          lat: 37.5172,
          lng: 127.0286
        }
      },
      accessInfo: {
        entrancePassword: '1234',
        parkingAvailable: true,
        parkingInfo: '건물 지하 1층 (2시간 무료)',
        publicTransport: '강남역 5번 출구 도보 5분',
        specialInstructions: '정문 비밀번호 입력 후 엘리베이터 이용'
      },
      amenities: {
        hasToilet: true,
        toiletLocation: 'same',
        hasSink: true,
        hasKitchen: false,
        hasAircon: true,
        hasHeating: true,
        hasWifi: true,
        hasCCTV: true
      },
      operatingHours: {
        weekday: { open: '09:00', close: '22:00' },
        weekend: { open: '10:00', close: '20:00' },
        holidays: []
      },
      cleaningPreferences: {
        defaultServices: ['basic'],
        prohibitedItems: ['음식물쓰레기'],
        specialRequests: '회의 테이블 배치는 ㅁ자로 유지해주세요',
        photoRequired: true
      },
      status: 'active',
      stats: {
        totalJobs: 0,
        thisMonthJobs: 0,
        averageRating: 0
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('테스트 데이터 생성 준비 완료');
    console.log('실제 생성은 주석 처리되어 있습니다. 필요시 주석을 해제하세요.');
    
    // 실제 데이터 생성 (필요시 주석 해제)
    // await db.collection('users').doc(testBusiness.uid).set(testBusiness);
    // await db.collection('users').doc(testPartner.uid).set(testPartner);
    // await db.collection('spaces').add(testSpace);
    
  } catch (error) {
    console.error('테스트 데이터 생성 오류:', error);
  }
}

// 초기화 함수
async function initializeFirebaseData() {
  console.log('Firebase 초기 데이터 설정 시작...');
  
  // 1. 시스템 설정 초기화
  await initializeSystemConfig();
  
  // 2. 관리자 계정 생성 (필요시 주석 해제)
  // await createAdminAccount('admin@linkykorea.com', 'secure-password-here');
  
  // 3. 테스트 데이터 생성 (개발 환경에서만)
  // await createTestData();
  
  console.log('Firebase 초기 데이터 설정 완료!');
}

// 사용법:
// 1. 브라우저 콘솔에서 실행: initializeFirebaseData()
// 2. 특정 함수만 실행: initializeSystemConfig()
// 3. 관리자 생성: createAdminAccount('email', 'password')