# B3 可重複使用的表單資料庫

## 設計決定

一場工作坊一份試算表，十三張工作表沿用固定欄位。網站可以重用；資料庫每場獨立，不清空上一場成果。完整欄序見 sheets_schema.md，空白 CSV 範本在 database_template/。

這是網站任務表單的資料庫，不是 Google Forms 自動產生的回覆表。Google Forms 的問題標題、時間戳記及回覆欄序不同；只貼 Google 表單網址不會自動對應本資料庫。若另外用 Google Forms，需另建回覆轉換程序，不直接指定它覆寫這十三張表。

## 表單與資料關係

| 表 | 粒度／用途 | 關聯 | 重複提交處理 |
|---|---|---|---|
| participants | 個人報到 | participant_id、group_id | 保留歷次報到，顯示採最新 |
| word_cloud | 個人一次關鍵詞 | participant_id、group_id | 每次都計次 |
| learning_goals | 個人一次目標 | participant_id、group_id | 相同目標合併計次 |
| guide_treasure | 小組一次尋寶 | group_id | 保留每次版本 |
| ai_literacy_selfcheck | 個人一次四面向自評 | participant_id | 全班平均採每人最新完整自評 |
| risk_case_cards | 小組一次案例練習 | group_id、case_id | 保留每次成果 |
| risk_lesson_tasks | 小組一次課堂任務 | group_id | 保留每次成果 |
| prompt_revision | 小組一次 Prompt 改寫 | group_id | 保留原始與改寫文字 |
| lesson_market | 小組一次文字作品 | group_id | 保留每次作品 |
| feedback | 組間一次留言 | from_group_id → to_group_id | 以組別回饋，不精確連到某份作品 |
| ai_rules_traffic_light | 小組一次規範 | group_id | 保留每次分類結果 |
| exit_ticket | 個人一次回校行動 | participant_id、group_id | 保留每張便條 |
| settings | 場次設定 | key | 同 key 不重複建立 |

participant_id 是瀏覽器產生的匿名識別碼，不是 Google 登入身分；換瀏覽器會是另一個人。group_id 是場內的組別代碼，建議使用 1–6，整場保持一致。試算表不是關聯式資料庫，目前 API 不強制外鍵；正式活動先報到再操作。timestamp 由伺服器寫入，UTC ISO 字串。姓名與學校只用於報到，不公開投影。

## 欄位填寫規則

- 分數：ethics_score、tech_score、teaching_score、professional_score，1–5 整數。
- 勾選：gives_direct_answer、requires_reasoning、requires_comparison、requires_own_words，true／false。
- 感受：驚艷、好奇、擔心、困惑、想嘗試。
- 策略：STEP、THINK、FACT、SAFE、CARE。
- 引句與章節：頁碼寫進相應文字欄，例如第一章 p.12，維持既定 schema。
- 三色燈：各色行為寫入各 items 欄，完整規範句存 class_rule。
- 不新增身分證、電話、住址、密碼欄位。自由文字不得填入敏感個資。
- settings 的組別、日期與保留期限是管理紀錄；目前不自動限制網站或自動刪資料。

## 建立下一場，不用重做資料表

1. 在管理用 Apps Script 貼上最新完整 Code.gs。
2. 指令碼屬性新增 NEW_WORKSHOP_ID，例如 b3-20261001-a；NEW_WORKSHOP_TITLE，例如「十月教師共備場」。每一新場次使用新 ID。
3. 從編輯器執行 createWorkshopDatabase()，依 Google 畫面授權。執行紀錄會給出新試算表網址與 ID。
4. 同一 ID 重跑只補缺少的標題／settings，不清空答案；建立中斷可重跑。不要將此管理函式加入公開 doPost action。
5. 為這場課使用獨立 Apps Script 專案，設定 SPREADSHEET_ID 為新表 ID、WORKSHOP_ID 為場次代碼，部署 Web App。單一專案的 Script Properties 為所有部署共用，所以不能只在同一專案新增部署來隔離多場。
6. 將新 /exec URL 設定到該場網站 config.js 並发布，或在管理模式設定目前瀏覽器。管理模式設定不會同步到其他學員裝置。若多場同時進行，請使用不同網站路徑／repository，避免舊場連結被切換。
7. 共用試算表只開給講師與助教。開課前使用兩台裝置測試同一場 Dashboard。
8. 結束後保留該場試算表及網址，取消不需要的 Web App 存取；下一場再建立新 ID。

建立函式只建立新表，不會自動切換目前運行中的 SPREADSHEET_ID，不會替你開啟公開共用。若 registry 對應試算表被刪除，函式會報錯，不會無聲建立重複資料庫。

## 後續擴充界線

這版維持你指定的欄序，沒有作品 ID、回覆 ID 或場次欄，因此不能精準針對單一作品建立多層留言，也不提供跨場次合併查詢。需要這些功能時應另升級 schema，而不是用姓名或列號充當永久 ID。
