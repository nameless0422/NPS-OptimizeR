
## 1. 인증 및 사용자 관리

1. **회원가입 / 로그인**
    
    - `POST /api/v1/auth/register`
        
        - 요청: `{ "username": str, "password": str, … }`
            
        - 응답: `201 Created`
            
    - `POST /api/v1/auth/login`
        
        - 요청: `{ "username": str, "password": str }`
            
        - 응답: `{ "access_token": str, "token_type": "bearer" }`
            
2. **내 정보 조회**
    
    - `GET /api/v1/auth/me`
        
        - 인증된 토큰 필요
            
        - 응답: `{ "user_id": UUID, "username": str, "email": str, … }`
            

---

## 2. 건강 지표 입력 & 계산

- **엔드포인트**  
    `POST /api/v1/users/me/health`
    
- **요청** (`HealthInput` – 앞서 정의한 스키마)
    
- **동작**
    
    1. 사용자가 보낸 건강 정보 저장
        
    2. `calculate_life_expectancy(...)` 호출 → `estimated_death_age` 산출
        
    3. DB에 `health_record` 생성 (입력+결과)
        
- **응답**
    
    ```json
    {
      "record_id": UUID,
      "estimated_death_age": 82.7
    }
    ```
    
- **이력 조회** (선택)  
    `GET /api/v1/users/me/health` → 사용자가 과거에 입력·계산한 모든 `health_record` 배열 반환
    

---

## 3. 재무 지표 입력 & 계산

- **엔드포인트**  
    `POST /api/v1/users/me/finance`
    
- **요청** (`FinanceInput`)
    
- **동작**
    
    1. 사용자가 보낸 재무 정보 저장
        
    2. `calculate_economic_score(...)` 호출 → `score` 산출
        
    3. DB에 `finance_record` 생성 (입력+결과)
        
- **응답**
    
    ```json
    {
      "record_id": UUID,
      "score": 7.3
    }
    ```
    
- **이력 조회** (선택)  
    `GET /api/v1/users/me/finance` → 모든 `finance_record` 반환
    

---

## 4. 최종 연금 플랜 계산

- **엔드포인트**  
    `POST /api/v1/users/me/pension`
    
- **요청** (`PensionInput` + 선택적 레퍼런스)
    
    ```jsonc
    {
      // 연금 기본 입력
      "Identification_number": "650423",
      "Dependent_parent_count": 1,
      // ... 기타 필드 ...
      // (선택) 이전 health/finance 결과 참조
      "health_record_id": "UUID",
      "finance_record_id": "UUID"
    }
    ```
    
- **동작**
    
    1. DB에서 `health_record`, `finance_record` 불러오기
        
    2. 사망예상나이·경제점수 등 지표를 연금 로직(`plan_pension`)에 투입
        
    3. `PensionOutput` 산출 후 저장
        
- **응답** (`PensionOutput`)
    
    ```json
    {
      "payout_type": "정상수급",
      "adjustment_years": 1,
      "public_monthly": 300000,
      "private_monthly": 120000,
      "private_annual": 1440000,
      "total_monthly_after_tax": 380000,
      "pension_start_age": 66
    }
    ```
    
- **이력 조회**  
    `GET /api/v1/users/me/pension` → 과거 모든 연금 계산 결과 리스트
    

---
### 요약

1. **인증 → 사용자 정보**
    
2. **건강 입력 → 사망예상나이**
    
3. **재무 입력 → 경제점수**
    
4. **연금 입력 + (건강·재무 결과) → 최종 연금 플랜**
    
---
### 건강
#### input

| 변수    | 타입  | 설명                                                                                          |
| ----- | --- | ------------------------------------------------------------------------------------------- |
| cage  | int | 현재 나이 (years)                                                                               |
| sex   | str | 성별 (`"Male"` 또는 `"Female"`)                                                                 |
| race  | str | 인종 (예: `"Asian"`, `"White"`, `"Black"`, 등)                                                  |
| wbr   | str | 지역 분류 (예: `"East Asia & Pacific"`, `"Europe & Central Asia"`, 등)                            |
| drk   | int | 알코올 음주량 (주당 음주 횟수)                                                                          |
| smk   | int | 흡연량 (주당 평균 흡연 횟수)                                                                           |
| mpa   | int | 중강도 신체 활동 시간 (주간 분 단위)                                                                      |
| hpa   | int | 고강도 신체 활동 시간 (주간 분 단위)                                                                      |
| hsd   | int | 수면 시간 (하루 평균 시간, hours)                                                                     |
| sys   | str | 혈압 (예: `"Normal (SBP <120)"`, `"Elevated (120–129)"`, `"High (≥130)"` 등)                    |
| bmi   | str | 체질량지수(BMI) (예: `"Underweight (<18.5)"`, `"Normal (18.5–24.9)"`, `"Overweight (25–29.9)"` 등) |
| hbc   | str | 고혈중 콜레스테롤 병력 (`"Yes"`/`"No"`)                                                               |
| cvd   | str | 심혈관질환 병력 (`"Yes"`/`"No"`)                                                                   |
| copd  | str | 만성폐쇄성폐질환 병력 (`"Yes"`/`"No"`)                                                                |
| dia   | str | 당뇨병 병력 (`"Yes"`/`"No"`)                                                                     |
| dep   | str | 우울증 병력 (`"Yes"`/`"No"`)                                                                     |
| can   | str | 암 병력 (`"Yes"`/`"No"`)                                                                       |
| alz   | str | 알츠하이머 병력 (`"Yes"`/`"No"`)                                                                   |
| fcvd  | str | 심혈관질환 가족력 (`"Yes"`/`"No"`)                                                                  |
| fcopd | str | COPD 가족력 (`"Yes"`/`"No"`)                                                                   |
| fdia  | str | 당뇨병 가족력 (`"Yes"`/`"No"`)                                                                    |
| fdep  | str | 우울증 가족력 (`"Yes"`/`"No"`)                                                                    |
| fcan  | str | 암 가족력 (`"Yes"`/`"No"`)                                                                      |
| falz  | str | 알츠하이머 가족력 (`"Yes"`/`"No"`)                                                                  |
#### output

| 의미          | 타입      |
| ----------- | ------- |
| 계산된 추정 사망나이 | `float` |


---

### 재무
#### input

| 변수                  | 설명          | 타입     | 기본값     |
| ------------------- | ----------- | ------ | ------- |
| `age`               | 현재 나이       | `int`  | `55`    |
| `total_assets`      | 총 자산(원)     | `int`  | `0`     |
| `monthly_expense`   | 월 기본 생활비(원) | `int`  | `0`     |
| `monthly_income`    | 월 소득(원)     | `int`  | `0`     |
| `cohabiting_family` | 동거 가족 수     | `int`  | `0`     |
| `dependents`        | 부양 가족 수     | `int`  | `0`     |
| `has_own_house`     | 자가 주거 여부    | `bool` | `False` |
| `has_insurance`     | 보험 가입 여부    | `bool` | `False` |
#### output

| 키                 | 의미                                                          | 타입      |
| ----------------- | ----------------------------------------------------------- | ------- |
| `score`           | 계산된 “생존 기반 경제 점수” (0.00~10.00)                              | `float` |

---

### 전체 연금
#### input
|변수|타입|설명|
|---|---|---|
|Name|str|사용자 이름|
|Identification_number|str|주민등록번호 앞 6자리 (YYMMDD)|
|Dependent_parent_count|int|부양 부모 수|
|Child_count|int|부양 자녀 수|
|Spouse|str|배우자 유무 ('Y' 또는 'N')|
|Public_pension|bool|공적연금 가입 여부|
|Subscription_period|int|공적연금 가입 기간 (년)|
|Monthly_insurance_premium|int|공적연금 월 납입 보험료 (원)|
|Annual_income|int|연간 근로소득 (원)|
|Non_taxable_payment|int|2001년 이전 비과세 납입액 (원)|
|Taxable_payment|int|2002년 이후 과세 납입액 (원)|
|Private_pension|bool|개인연금 가입 여부|
|Private_subscription_period|int|개인연금 가입 기간 (년)|
|Private_monthly_premium|int|개인연금 월 납입 보험료 (원)|
#### output
|변수|타입|설명|
|---|---|---|
|수급 유형|str|추천 수급 유형 (조기수급/정상수급/연기수급)|
|조정 년수|int|수급 개시 시점 조정 년수 (0~5)|
|공적연금 월수령액|int|해당 시나리오 공적연금 월간 수령액 (원)|
|개인연금 월/연간 수령액|int|일시금 여부에 따른 월간/연간 수령액 (원)|
|총 월수령액(세후)|int|공적+개인 합산 후 세금 공제된 월 실수령액 (원)|
|연금 수령 시작 나이|int|연금 수급 개시 나이|
