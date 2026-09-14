# B3 互動功能檢查

- 任務 1（checkin）：讀取 API 的 word_cloud 彙總資料，依 keyword 加總，以字級呈現次數；mood 篩選與空資料提示通過。
- 任務 4（guide）：四面向 1–5 分即時雷達與文字分數；dashboard 採每位學員最新完整自評平均，通過重複提交測試。
- 任務 5（literacy）：五種虛構案例隨機抽取，不連續抽到同一卡；STEP／THINK／FACT／SAFE／CARE 選擇、動作輸入、成果卡與提交通過。
- 任務 7（lesson）：原始與修正 Prompt 並列、四項自評、不爆雷提示與檢核結果儲存通過。提示是文字線索與自評，不是 AI 回答品質判定。
- 任務 9（literacy）：拖曳、按鈕分類、重新分類、自動規範句、六張完成才可送出，以及重新載入後還原通過。
- 所有提交均經 B3API；測試失敗回應保留 Prompt 輸入，無靜默轉存。
- 390px 手機寬度五個互動頁無水平溢出；已檢視手機 dashboard 截圖。
- Apps Script 模擬測試通過十二種提交、timestamp、欄位驗證、場次隔離、公式轉義、schema 不符拒絕寫入與互動彙總。

## 執行與限制

使用 Edge / Playwright 測試 `.build/test-interactions.cjs`；Apps Script 使用 `.build/test-gas-interactive.cjs` 模擬環境測試。尚未部署或測試真實 Google Web App。

API URL 空白時讀寫本機 localStorage，不會跨裝置同步。需在 public/assets/js/config.js 填入正式 /exec URL，重新執行 site/generate.py，同步至網站。既有 Google 工作表升級欄位請參照 data/sheets_schema.md，並重新部署 Code.gs。WordCloud 舊資料需遷移至 word_cloud。

互動原始碼位於 public/assets/js/interactions.js，產生網站時會複製至 site/dist/assets/js。班級示範統計表保留清楚的假資料標示；文字雲與雷達使用實際 API／本機提交資料，沒有混入示範人數。
