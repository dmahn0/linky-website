// Test Supabase Connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다!');
  console.log('');
  console.log('📝 다음 단계를 따라주세요:');
  console.log('1. .env.example을 .env.local로 복사');
  console.log('2. Supabase 대시보드에서 API 키 복사');
  console.log('3. .env.local 파일에 붙여넣기');
  process.exit(1);
}

console.log('🔄 Supabase 연결 테스트 중...');
console.log(`URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ 데이터베이스 연결 실패:', error.message);
      console.log('');
      console.log('💡 확인사항:');
      console.log('1. schema.sql이 Supabase SQL Editor에서 실행되었는지 확인');
      console.log('2. API 키가 올바른지 확인');
      return;
    }
    
    console.log('✅ Supabase 연결 성공!');
    console.log('');
    console.log('📊 다음 단계:');
    console.log('1. Firebase 환경 변수 설정 (.env.local)');
    console.log('2. npm run migrate 실행하여 데이터 마이그레이션');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

testConnection();