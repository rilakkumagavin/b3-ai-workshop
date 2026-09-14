# B3 正式工作表結構

以下名稱與欄序完全依照指定清單，不追加共通欄位。

## participants

`participant_id,timestamp,name,school,group_id,role`

## word_cloud

`timestamp,participant_id,name,group_id,mood,keyword,note`

## learning_goals

`timestamp,participant_id,name,group_id,goal,reason`

## guide_treasure

`timestamp,group_id,sail_chapter,sail_quote,keel_quote,hull_chapter,hull_reason`

## ai_literacy_selfcheck

`timestamp,participant_id,name,group_id,ethics_score,tech_score,teaching_score,professional_score,strength,growth_need`

## risk_case_cards

`timestamp,group_id,case_id,risk_type,strategy,student_reminder,practice_activity`

## risk_lesson_tasks

`timestamp,group_id,grade_level,risk_topic,student_scenario,student_task,teacher_reminder,learning_evidence`

## prompt_revision

`timestamp,group_id,lesson_title,ai_entry_point,original_prompt,gives_direct_answer,requires_reasoning,requires_comparison,requires_own_words,revised_prompt,revision_reason`

## lesson_market

`timestamp,group_id,lesson_title,ai_entry_point,original_prompt,revised_prompt,avoid_thinking_replacement`

## feedback

`timestamp,from_group_id,to_group_id,feedback_type,feedback_text`

## ai_rules_traffic_light

`timestamp,group_id,green_items,yellow_items,red_items,class_rule`

## exit_ticket

`timestamp,participant_id,name,group_id,takeaway,stuck_point,first_action,support_needed`

## settings

`key,value,note`

## 使用約定

timestamp 由伺服器產生。participant_id 是匿名識別碼；group_id 是公開投影組別。settings 不是學員提交表，不提供公開寫入 action。分數為 1–5；Prompt 檢查欄位用 true / false 字串。

這份結構沒有 workshopId：一份試算表對應一場工作坊。請在指令碼屬性設定 WORKSHOP_ID（預設 b3-demo），避免其他場次誤讀。recordId 只作提交確認回傳，不新增到表格。

舊版表格不可直接套用新欄序。請先備份，依此清單建立新試算表，再設定 SPREADSHEET_ID、執行 setupSheets 並重新部署；舊資料需人工確認欄位意義後搬移。欄位不符會拒絕讀寫，不覆寫原資料。

前端既有 camelCase 任務資料由 sheet-adapter.js 轉成正式 snake_case JSON；正式 API 同時接受指定欄位。離線模式仍保留原有任務紀錄格式，作為相同畫面的測試資料庫。

尚未填寫的新欄位留空，不推測學員答案。既有案例依情境文字生成固定 case_id；正式案例可直接提交 case_id。feedback 舊版 targetRecordId 暫轉 to_group_id，需由使用者填組別。