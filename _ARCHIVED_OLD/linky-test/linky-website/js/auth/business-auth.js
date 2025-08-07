// 비즈니스 사용자 인증
// business_users 테이블 전용

class BusinessAuth extends AuthManager {
  constructor() {
    super('business');
  }

  // 비즈니스 프로필 데이터 준비
  prepareProfileData(authUid, formData) {
    return {
      auth_uid: authUid,
      email: formData.email,
      phone: formData.phone || '',
      nickname: formData.nickname,
      business_name: formData.businessName,
      business_number: formData.businessNumber,
      business_type: formData.businessType || 'other',
      business_address: formData.businessAddress,
      representative_name: formData.representativeName || formData.businessName,
      status: 'pending'
    };
  }

  // 비즈니스 정보 검증
  validateBusinessData(formData) {
    const errors = [];

    // 필수 필드 확인
    if (!formData.email) errors.push('이메일을 입력해주세요.');
    if (!formData.password) errors.push('비밀번호를 입력해주세요.');
    if (!formData.phone) errors.push('전화번호를 입력해주세요.');
    if (!formData.nickname) errors.push('닉네임을 입력해주세요.');
    if (!formData.businessName) errors.push('사업장명을 입력해주세요.');
    if (!formData.businessNumber) errors.push('사업자등록번호를 입력해주세요.');
    if (!formData.businessType) errors.push('사업장 유형을 선택해주세요.');
    if (!formData.businessAddress) errors.push('사업장 주소를 입력해주세요.');

    // 사업자등록번호 형식 확인
    if (formData.businessNumber) {
      const pattern = /^\d{3}-\d{2}-\d{5}$/;
      if (!pattern.test(formData.businessNumber) && formData.businessNumber !== '000-00-00000') {
        errors.push('사업자등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)');
      }
    }

    // 이메일 형식 확인
    if (formData.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        errors.push('올바른 이메일 주소를 입력해주세요.');
      }
    }

    // 전화번호 형식 확인
    if (formData.phone) {
      const phonePattern = /^(010|011|016|017|018|019)-?\d{3,4}-?\d{4}$/;
      if (!phonePattern.test(formData.phone.replace(/-/g, ''))) {
        errors.push('올바른 휴대폰 번호를 입력해주세요.');
      }
    }

    return errors;
  }

  // 비즈니스 회원가입 (검증 포함)
  async signUp(formData) {
    // 데이터 검증
    const errors = this.validateBusinessData(formData);
    if (errors.length > 0) {
      return { success: false, error: errors.join('\n') };
    }

    // 첫 번째 공간 정보 검증
    if (formData.firstSpace) {
      const spaceErrors = this.validateSpaceData(formData.firstSpace);
      if (spaceErrors.length > 0) {
        return { success: false, error: '공간 정보 오류:\n' + spaceErrors.join('\n') };
      }
    }

    // 부모 클래스의 signUp 호출
    const result = await super.signUp(formData);
    
    // 회원가입 성공 시 첫 번째 공간 생성
    if (result.success && formData.firstSpace) {
      try {
        const supabase = this.getSupabase();
        
        console.log('회원가입 성공, 첫 번째 공간 생성 시작:', formData.firstSpace);
        
        // business_users 테이블에서 방금 생성된 프로필 조회
        const { data: profile, error: profileError } = await supabase
          .from(this.tableName)
          .select('id')
          .eq('auth_uid', result.user.id)
          .single();
          
        if (profileError) {
          console.error('프로필 조회 오류:', profileError);
          return result;
        }
          
        if (profile) {
          console.log('프로필 조회 성공:', profile);
          
          // 첫 번째 공간 생성 (owner_id는 auth_uid를 참조)
          const spaceData = {
            owner_id: result.user.id,  // auth_uid 사용
            name: formData.firstSpace.name,
            type: formData.firstSpace.type,
            area: formData.firstSpace.area,
            address: formData.firstSpace.address,
            detail_address: formData.firstSpace.detail_address,
            cleaning_frequency: formData.firstSpace.cleaning_frequency || 'weekly'
          };
          
          console.log('공간 데이터:', spaceData);
          
          const { data: spaceResult, error: spaceError } = await supabase
            .from('spaces')
            .insert(spaceData)
            .select()
            .single();
            
          if (spaceError) {
            console.error('첫 번째 공간 생성 오류:', spaceError);
            alert('회원가입은 성공했지만 첫 공간 등록에 실패했습니다. 로그인 후 공간을 수동으로 등록해주세요.');
          } else {
            console.log('첫 번째 공간 생성 성공:', spaceResult);
            
            // 공간 수 업데이트
            const { error: updateError } = await supabase
              .from(this.tableName)
              .update({ space_count: 1 })
              .eq('id', profile.id);
              
            if (updateError) {
              console.error('공간 수 업데이트 오류:', updateError);
            } else {
              console.log('공간 수 업데이트 성공');
            }
          }
        } else {
          console.error('프로필을 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('첫 번째 공간 생성 중 오류:', error);
      }
    }
    
    return result;
  }

  // 공간 데이터 검증
  validateSpaceData(spaceData) {
    const errors = [];
    
    if (!spaceData.name) errors.push('공간 이름을 입력해주세요.');
    if (!spaceData.type) errors.push('공간 유형을 선택해주세요.');
    if (!spaceData.address) errors.push('공간 주소를 입력해주세요.');
    
    // 면적이 입력된 경우 유효성 검사
    if (spaceData.area && (isNaN(spaceData.area) || spaceData.area <= 0)) {
      errors.push('올바른 면적을 입력해주세요.');
    }
    
    return errors;
  }

  // 비즈니스 프로필 업데이트
  async updateProfile(updates) {
    const supabase = this.getSupabase();
    if (!supabase) {
      return { success: false, error: 'Supabase not initialized' };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('auth_uid', user.id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, profile: data };
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // 공간 목록 가져오기
  async getSpaces() {
    const supabase = this.getSupabase();
    if (!supabase) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // spaces 테이블의 owner_id는 auth_uid를 참조
      const { data: spaces, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('owner_id', user.id)  // auth_uid로 직접 조회
        .order('created_at', { ascending: false });

      if (error) throw error;

      return spaces || [];
    } catch (error) {
      console.error('공간 목록 조회 오류:', error);
      return [];
    }
  }
}

// 전역 인스턴스 생성
window.businessAuth = new BusinessAuth();