-- =============================================
-- 닉네임 필드 추가 및 중복 방지 구현
-- =============================================

-- 1. 전체 시스템 닉네임 관리 테이블 생성
CREATE TABLE IF NOT EXISTS nicknames (
  nickname TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('business', 'partner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, user_type)
);

-- 닉네임 테이블 인덱스
CREATE INDEX idx_nicknames_user ON nicknames(user_id, user_type);

-- 2. business_users 테이블에 닉네임 필드 추가
ALTER TABLE business_users 
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- 3. partner_users 테이블에 닉네임 필드 추가
ALTER TABLE partner_users 
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- 4. 기존 사용자들에게 임시 닉네임 부여
UPDATE business_users 
SET nickname = 'business_' || SUBSTRING(id::text, 1, 8)
WHERE nickname IS NULL;

UPDATE partner_users 
SET nickname = 'partner_' || SUBSTRING(id::text, 1, 8)
WHERE nickname IS NULL;

-- 5. nicknames 테이블에 기존 데이터 삽입
INSERT INTO nicknames (nickname, user_id, user_type)
SELECT nickname, id, 'business' FROM business_users
WHERE nickname IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO nicknames (nickname, user_id, user_type)
SELECT nickname, id, 'partner' FROM partner_users
WHERE nickname IS NOT NULL
ON CONFLICT DO NOTHING;

-- 6. 닉네임 관리 함수 생성
CREATE OR REPLACE FUNCTION check_nickname_unique()
RETURNS TRIGGER AS $$
BEGIN
  -- 닉네임이 NULL이거나 비어있으면 통과
  IF NEW.nickname IS NULL OR NEW.nickname = '' THEN
    RETURN NEW;
  END IF;
  
  -- nicknames 테이블에서 중복 체크
  IF EXISTS (
    SELECT 1 FROM nicknames 
    WHERE nickname = NEW.nickname 
    AND (user_id != NEW.id OR user_type != TG_ARGV[0])
  ) THEN
    RAISE EXCEPTION '이미 사용 중인 닉네임입니다: %', NEW.nickname;
  END IF;
  
  -- nicknames 테이블 업데이트
  IF TG_OP = 'INSERT' THEN
    INSERT INTO nicknames (nickname, user_id, user_type)
    VALUES (NEW.nickname, NEW.id, TG_ARGV[0])
    ON CONFLICT (user_id, user_type) 
    DO UPDATE SET nickname = EXCLUDED.nickname;
  ELSIF TG_OP = 'UPDATE' AND OLD.nickname IS DISTINCT FROM NEW.nickname THEN
    -- 기존 닉네임 삭제
    DELETE FROM nicknames 
    WHERE user_id = OLD.id AND user_type = TG_ARGV[0];
    
    -- 새 닉네임 삽입
    IF NEW.nickname IS NOT NULL AND NEW.nickname != '' THEN
      INSERT INTO nicknames (nickname, user_id, user_type)
      VALUES (NEW.nickname, NEW.id, TG_ARGV[0]);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. 트리거 생성
CREATE TRIGGER check_business_nickname
BEFORE INSERT OR UPDATE OF nickname ON business_users
FOR EACH ROW
EXECUTE FUNCTION check_nickname_unique('business');

CREATE TRIGGER check_partner_nickname
BEFORE INSERT OR UPDATE OF nickname ON partner_users
FOR EACH ROW
EXECUTE FUNCTION check_nickname_unique('partner');

-- 8. 닉네임 삭제 시 nicknames 테이블에서도 삭제
CREATE OR REPLACE FUNCTION delete_nickname()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM nicknames 
  WHERE user_id = OLD.id AND user_type = TG_ARGV[0];
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_business_nickname
AFTER DELETE ON business_users
FOR EACH ROW
EXECUTE FUNCTION delete_nickname('business');

CREATE TRIGGER delete_partner_nickname
AFTER DELETE ON partner_users
FOR EACH ROW
EXECUTE FUNCTION delete_nickname('partner');

-- 9. RLS 정책 추가 (nicknames 테이블)
ALTER TABLE nicknames ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 닉네임 중복 체크를 할 수 있도록 허용
CREATE POLICY "Anyone can check nicknames" ON nicknames
  FOR SELECT USING (true);

-- 사용자는 자신의 닉네임만 수정 가능
CREATE POLICY "Users can manage own nickname" ON nicknames
  FOR ALL USING (
    auth.uid() = user_id
  );

-- 10. 닉네임 유효성 검사 제약조건 추가
ALTER TABLE business_users
ADD CONSTRAINT valid_nickname CHECK (
  nickname IS NULL OR 
  (LENGTH(nickname) >= 2 AND LENGTH(nickname) <= 20 AND nickname ~ '^[a-zA-Z0-9가-힣_-]+$')
);

ALTER TABLE partner_users
ADD CONSTRAINT valid_nickname CHECK (
  nickname IS NULL OR 
  (LENGTH(nickname) >= 2 AND LENGTH(nickname) <= 20 AND nickname ~ '^[a-zA-Z0-9가-힣_-]+$')
);

-- 11. 닉네임 중복 체크 함수 (클라이언트에서 사용)
CREATE OR REPLACE FUNCTION is_nickname_available(check_nickname TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM nicknames WHERE nickname = check_nickname
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 닉네임 필드를 NOT NULL로 설정 (나중에 실행)
-- ALTER TABLE business_users ALTER COLUMN nickname SET NOT NULL;
-- ALTER TABLE partner_users ALTER COLUMN nickname SET NOT NULL;

COMMENT ON TABLE nicknames IS '전체 시스템 닉네임 중복 방지 테이블';
COMMENT ON COLUMN business_users.nickname IS '사용자 닉네임 (2-20자, 영문/숫자/한글/특수문자(_-) 허용)';
COMMENT ON COLUMN partner_users.nickname IS '파트너 닉네임 (2-20자, 영문/숫자/한글/특수문자(_-) 허용)';