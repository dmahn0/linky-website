// 사용자 마이그레이션 헬퍼
// Auth에는 있지만 users 테이블에 없는 사용자를 처리

async function migrateUser(authUser) {
  try {
    console.log('사용자 마이그레이션 시작:', authUser.email);
    
    // 1. 먼저 이메일로 기존 사용자 확인
    const { data: existingUser, error: checkError } = await window.supabaseClient
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .single();
    
    if (existingUser) {
      console.log('기존 사용자 발견:', existingUser);
      
      // uid가 다른 경우 업데이트
      if (existingUser.uid !== authUser.id) {
        console.log('UID 불일치 - 업데이트 필요');
        const { data: updatedUser, error: updateError } = await window.supabaseClient
          .from('users')
          .update({ uid: authUser.id })
          .eq('email', authUser.email)
          .select()
          .single();
        
        if (updateError) {
          console.error('UID 업데이트 실패:', updateError);
          return null;
        }
        
        return updatedUser;
      }
      
      return existingUser;
    }
    
    // 2. 새 사용자 생성 (이메일 도메인으로 타입 추측)
    const email = authUser.email.toLowerCase();
    let userType = 'partner'; // 기본값
    let userName = authUser.email.split('@')[0]; // 이메일 앞부분을 임시 이름으로
    
    // 비즈니스 이메일 패턴 확인
    if (email.includes('business') || email.includes('company') || email.includes('corp')) {
      userType = 'business';
    }
    
    // 현재 페이지 경로로 타입 추측
    const currentPath = window.location.pathname;
    if (currentPath.includes('/business/')) {
      userType = 'business';
    } else if (currentPath.includes('/partners/')) {
      userType = 'partner';
    }
    
    console.log('새 사용자 생성 - 타입:', userType);
    
    const newUser = {
      uid: authUser.id,
      email: authUser.email,
      name: userName,
      type: userType,
      status: 'active', // 임시로 active 설정
      created_at: new Date().toISOString()
    };
    
    // 파트너 타입인 경우 필수 필드 추가
    if (userType === 'partner') {
      newUser.residence = '서울시';
      newUser.work_areas = ['강남구']; // 또는 workAreas
    }
    
    const { data: createdUser, error: createError } = await window.supabaseClient
      .from('users')
      .insert([newUser])
      .select()
      .single();
    
    if (createError) {
      console.error('사용자 생성 실패:', createError);
      
      // 제약 조건 오류인 경우 상세 정보 출력
      if (createError.code === '23514') {
        console.error('제약 조건 위반:', createError.details);
      }
      
      return null;
    }
    
    console.log('새 사용자 생성 완료:', createdUser);
    return createdUser;
    
  } catch (error) {
    console.error('사용자 마이그레이션 오류:', error);
    return null;
  }
}

// 전역 함수로 노출
window.migrateUser = migrateUser;