// 임시 해결책: 제약조건에 맞춘 회원가입 수정

// business_users와 partner_users를 구분하지 않고
// 현재 users 테이블의 제약조건에 맞춰 데이터 저장

async function signUpWithConstraints(userData) {
    const supabase = window.supabaseClient;
    
    try {
        // 1. Supabase Auth 생성
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password
        });

        if (authError) throw authError;

        // 2. users 테이블에 저장할 데이터 준비
        const userRecord = {
            uid: authData.user.id,
            email: userData.email,
            name: userData.name,
            phone: userData.phone || '010-0000-0000', // phone은 NOT NULL
            type: userData.type,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        // 3. 타입별 필수 필드 추가
        if (userData.type === 'partner') {
            // partner는 특별한 필수 필드가 없는 것으로 보임
            // work_areas 필드가 테이블에 없음
        } else if (userData.type === 'business') {
            // business도 특별한 필수 필드가 없는 것으로 보임
            // business_name 등의 필드가 테이블에 없음
        }

        // 4. 추가 정보는 별도 처리 또는 무시
        console.log('추가 정보 (저장되지 않음):', {
            businessName: userData.businessName,
            businessNumber: userData.businessNumber,
            residence: userData.residence,
            workAreas: userData.workAreas
        });

        // 5. users 테이블에 저장
        const { error: dbError } = await supabase
            .from('users')
            .insert([userRecord]);

        if (dbError) {
            console.error('DB 저장 오류:', dbError);
            throw dbError;
        }

        return { success: true, user: authData.user };
    } catch (error) {
        console.error('회원가입 오류:', error);
        return { success: false, error: error.message };
    }
}

// auth-modal.js의 supabaseSignUp 함수를 이걸로 대체하면
// 일단 회원가입은 가능해집니다.
// 단, 비즈니스/파트너 추가 정보는 저장되지 않습니다.