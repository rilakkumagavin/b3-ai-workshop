# 講師 Dashboard 檢查

完成七區：AI 經驗文字雲、今日目標統計、四面向平均、風險任務牆、Prompt 前後對照牆、三色燈規範牆、回校行動牆。

- 全部資料共用一次 getDashboardData 請求；手動更新有載入、成功時間與失敗提示，失敗保留上次成功畫面。
- 七區皆可單獨展開至視窗大小，以結束按鈕或 Esc 返回。作品牆一般每頁六張，投影每頁兩張。
- 只顯示組別；以 Participants 的 participantId 配對 groupName，未報到顯示「未分組」，不以姓名替代。
- 投影資料採欄位白名單，不回傳個人識別碼、學校、聯絡欄位或完整報到資料。成果文字遮蔽已知姓名、常見電話、Email、證號；任意自由文字不能保證自動辨識完整，提供講師隱藏單卡功能。隱藏狀態僅保留在本次開啟頁面。
- 目標統計以相同文字計次，不宣稱語意分類；雷達使用每人最新完整自評。
- Playwright 已驗證七區、逐區展開／Esc、組別預設、敏感資料遮蔽、卡片隱藏恢復、失敗保留資料及手機無水平溢出。已檢視 1440×900 Prompt 投影截圖。
- Apps Script 模擬測試通過。尚未連線至真實 Google Web App；URL 未設定時使用本機資料。

檔案：site/dist/dashboard.html；public/assets/js/dashboard.js、dashboard-data.js；apps_script/Code.gs。修改來源後執行 site/generate.py 同步靜態網站。部署時需更新 Code.gs 的 Web App 版本；無新增工作表欄位。
