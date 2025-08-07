# Supabase MCP 설정 가이드

## 1. Supabase Service Key 가져오기

1. https://app.supabase.com 접속
2. 프로젝트 선택
3. Settings → API 이동
4. **service_role key (secret)** 복사 (anon key 아님!)

## 2. .mcp.json 수정

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=ivwsjjlvxluqyhcwlcxb"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "여기에_SERVICE_ROLE_KEY_붙여넣기"
      }
    }
  }
}
```

## 3. 주의사항

- **SUPABASE_ACCESS_TOKEN**에는 반드시 **service_role key**를 사용해야 함
- anon key는 MCP에서 작동하지 않음
- `--read-only` 플래그 제거 (쓰기 권한 필요시)

## 4. Claude Code 재시작

MCP 설정 변경 후 Claude Code를 재시작해야 적용됨

## 현재 설정 정보

- Project ID: `ivwsjjlvxluqyhcwlcxb`
- Project URL: `https://ivwsjjlvxluqyhcwlcxb.supabase.co`
- 현재 사용 중인 키: anon key (MCP 작동 안 함)
- 필요한 키: service_role key