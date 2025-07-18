#!/usr/bin/env python3
"""
Git Auto-Commit Watcher
파일 변경을 감지하고 자동으로 Git 커밋을 수행합니다.
"""

import os
import time
import subprocess
from datetime import datetime
from pathlib import Path
import sys

# 설정
WATCH_DIR = Path(__file__).parent
IGNORE_PATTERNS = ['.git', '__pycache__', 'node_modules', '*.log', '.env']
CHECK_INTERVAL = 30  # 초 단위

def is_ignored(path):
    """파일이 무시 패턴에 해당하는지 확인"""
    path_str = str(path)
    for pattern in IGNORE_PATTERNS:
        if pattern in path_str:
            return True
    return False

def get_git_status():
    """Git 상태 확인"""
    try:
        result = subprocess.run(
            ['git', 'status', '--porcelain'],
            capture_output=True,
            text=True,
            cwd=WATCH_DIR
        )
        return result.stdout.strip()
    except Exception as e:
        print(f"Git 상태 확인 실패: {e}")
        return None

def commit_changes():
    """변경사항 커밋"""
    try:
        # 변경사항 추가
        subprocess.run(['git', 'add', '-A'], cwd=WATCH_DIR)
        
        # 커밋 메시지 생성
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        commit_msg = f"Auto commit: {timestamp}"
        
        # 커밋
        result = subprocess.run(
            ['git', 'commit', '-m', commit_msg],
            capture_output=True,
            text=True,
            cwd=WATCH_DIR
        )
        
        if result.returncode == 0:
            print(f"✅ 커밋 완료: {commit_msg}")
        else:
            print(f"❌ 커밋 실패: {result.stderr}")
            
    except Exception as e:
        print(f"커밋 중 오류 발생: {e}")

def main():
    print(f"🔍 Git 자동 커밋 감시 시작...")
    print(f"📁 감시 디렉토리: {WATCH_DIR}")
    print(f"⏱️  확인 주기: {CHECK_INTERVAL}초")
    print("종료하려면 Ctrl+C를 누르세요.\n")
    
    try:
        while True:
            status = get_git_status()
            
            if status:
                print(f"\n변경사항 감지:")
                print(status)
                commit_changes()
            else:
                print(".", end="", flush=True)
            
            time.sleep(CHECK_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n\n👋 Git 자동 커밋 감시를 종료합니다.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()