from datetime import date
import os
import sys

src_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

def plan_pension(record):
    # 예시: 가입일부터 10년 뒤에 수급 추천
    recommend = record.start_date.year + 10
    return recommend
