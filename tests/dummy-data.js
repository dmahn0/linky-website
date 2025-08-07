// 더미 데이터 생성 스크립트
// Supabase를 통해 테스트 데이터를 프로그래밍 방식으로 생성

// 사용법:
// 1. 브라우저 콘솔에서 실행하거나
// 2. Node.js 환경에서 실행 (Supabase 라이브러리 설치 필요)

const DUMMY_DATA = {
    // Business 테스트 계정
    businessUsers: [
        {
            email: 'test.business@linky.com',
            password: 'test1234',
            profile: {
                phone: '010-1234-5678',
                nickname: 'testbiz',
                status: 'approved',
                business_name: '테스트 카페',
                business_number: '123-45-67890',
                business_type: 'office',
                business_address: '서울시 강남구 테헤란로 123',
                representative_name: '김사장',
                bank_name: '국민은행',
                account_number: '123456-78-901234',
                account_holder: '김사장'
            }
        },
        {
            email: 'test.business2@linky.com',
            password: 'test1234',
            profile: {
                phone: '010-2345-6789',
                nickname: 'cafebiz',
                status: 'approved',
                business_name: '스타트업 오피스',
                business_number: '234-56-78901',
                business_type: 'office',
                business_address: '서울시 서초구 서초대로 456',
                representative_name: '이대표',
                bank_name: '신한은행',
                account_number: '234567-89-012345',
                account_holder: '이대표'
            }
        }
    ],

    // Partner 테스트 계정
    partnerUsers: [
        {
            email: 'test.partner@linky.com',
            password: 'test1234',
            profile: {
                phone: '010-9876-5432',
                nickname: 'cleanpro',
                status: 'approved',
                name: '김파트너',
                residence: '서울시 강남구',
                work_areas: ['강남구', '서초구', '송파구'],
                transportation: 'public',
                available_times: {
                    weekday: ['09:00-18:00'],
                    weekend: ['10:00-16:00']
                },
                bank_name: '우리은행',
                account_number: '987654-32-109876',
                account_holder: '김파트너',
                rating: 4.5,
                completed_jobs: 25,
                level: 'silver'
            }
        },
        {
            email: 'test.partner2@linky.com',
            password: 'test1234',
            profile: {
                phone: '010-8765-4321',
                nickname: 'speedclean',
                status: 'approved',
                name: '박파트너',
                residence: '서울시 서초구',
                work_areas: ['서초구', '강남구', '용산구'],
                transportation: 'car',
                available_times: {
                    weekday: ['08:00-20:00'],
                    weekend: ['09:00-18:00']
                },
                bank_name: '하나은행',
                account_number: '876543-21-098765',
                account_holder: '박파트너',
                rating: 4.8,
                completed_jobs: 42,
                level: 'gold'
            }
        }
    ],

    // 공간 데이터
    spaces: [
        {
            name: '1층 매장',
            type: 'store',
            area: 50,
            address: '서울시 강남구 테헤란로 123',
            detail_address: '테스트빌딩 1층',
            cleaning_frequency: 'weekly',
            notes: '입구 유리문 청소 주의'
        },
        {
            name: '2층 사무실',
            type: 'office',
            area: 30,
            address: '서울시 강남구 테헤란로 123',
            detail_address: '테스트빌딩 2층',
            cleaning_frequency: 'biweekly',
            notes: '회의실 집중 청소 필요'
        },
        {
            name: '메인 오피스',
            type: 'office',
            area: 100,
            address: '서울시 서초구 서초대로 456',
            detail_address: '스타트업타워 5층',
            cleaning_frequency: 'daily',
            notes: '매일 오전 7시 이전 청소'
        }
    ],

    // 작업 데이터
    jobs: [
        {
            title: '정기 청소 - 1층 매장',
            description: '매장 전체 청소 및 유리창 청소',
            job_type: 'cleaning',
            scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2일 후
            scheduled_time: '09:00:00',
            estimated_duration: 120,
            status: 'pending',
            base_price: 50000,
            special_requirements: ['유리창 청소', '바닥 왁싱']
        },
        {
            title: '주간 청소 - 사무실',
            description: '사무실 전체 청소 및 쓰레기 처리',
            job_type: 'cleaning',
            scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1일 후
            scheduled_time: '18:00:00',
            estimated_duration: 90,
            status: 'assigned',
            base_price: 35000,
            special_requirements: ['쓰레기 분리수거', '화장실 청소']
        },
        {
            title: '일일 청소 - 오피스',
            description: '오피스 일일 청소',
            job_type: 'cleaning',
            scheduled_date: new Date(),
            scheduled_time: '07:00:00',
            estimated_duration: 60,
            status: 'in_progress',
            base_price: 30000,
            special_requirements: ['조용히 작업']
        }
    ]
};

// 더미 데이터 생성 함수
async function createDummyData() {
    console.log('🚀 더미 데이터 생성 시작...');
    
    try {
        // 1. Business 사용자 생성
        console.log('📦 Business 사용자 생성 중...');
        for (const business of DUMMY_DATA.businessUsers) {
            const { data: authData, error: authError } = await authManager.signup(
                business.email,
                business.password,
                'business',
                business.profile
            );
            
            if (authError) {
                console.error(`❌ Business 사용자 생성 실패 (${business.email}):`, authError);
            } else {
                console.log(`✅ Business 사용자 생성 완료: ${business.email}`);
                
                // 공간 생성
                if (authData && authData.user) {
                    for (const space of DUMMY_DATA.spaces.slice(0, 2)) {
                        await businessAPI.createSpace(authData.user.id, space);
                    }
                    console.log(`✅ 공간 생성 완료`);
                }
            }
        }
        
        // 2. Partner 사용자 생성
        console.log('👷 Partner 사용자 생성 중...');
        for (const partner of DUMMY_DATA.partnerUsers) {
            const { data: authData, error: authError } = await authManager.signup(
                partner.email,
                partner.password,
                'partner',
                partner.profile
            );
            
            if (authError) {
                console.error(`❌ Partner 사용자 생성 실패 (${partner.email}):`, authError);
            } else {
                console.log(`✅ Partner 사용자 생성 완료: ${partner.email}`);
            }
        }
        
        console.log('🎉 더미 데이터 생성 완료!');
        console.log('');
        console.log('테스트 계정 정보:');
        console.log('=================');
        console.log('Business: test.business@linky.com / test1234');
        console.log('Partner: test.partner@linky.com / test1234');
        
    } catch (error) {
        console.error('❌ 더미 데이터 생성 중 오류:', error);
    }
}

// 더미 데이터 삭제 함수 (정리용)
async function cleanupDummyData() {
    console.log('🧹 더미 데이터 정리 시작...');
    
    const testEmails = [
        'test.business@linky.com',
        'test.business2@linky.com',
        'test.partner@linky.com',
        'test.partner2@linky.com'
    ];
    
    try {
        // Business users 삭제
        const { error: businessError } = await supabase
            .from('business_users')
            .delete()
            .in('email', testEmails);
        
        if (businessError) {
            console.error('Business users 삭제 실패:', businessError);
        } else {
            console.log('✅ Business users 정리 완료');
        }
        
        // Partner users 삭제
        const { error: partnerError } = await supabase
            .from('partner_users')
            .delete()
            .in('email', testEmails);
        
        if (partnerError) {
            console.error('Partner users 삭제 실패:', partnerError);
        } else {
            console.log('✅ Partner users 정리 완료');
        }
        
        console.log('🎉 더미 데이터 정리 완료!');
        
    } catch (error) {
        console.error('❌ 더미 데이터 정리 중 오류:', error);
    }
}

// 사용법 안내
console.log('=================================');
console.log('더미 데이터 생성 스크립트');
console.log('=================================');
console.log('');
console.log('사용법:');
console.log('1. 더미 데이터 생성: createDummyData()');
console.log('2. 더미 데이터 삭제: cleanupDummyData()');
console.log('');
console.log('주의: 이 스크립트는 브라우저 콘솔에서 실행하세요.');
console.log('     (auth.js와 api.js가 로드된 페이지에서)');