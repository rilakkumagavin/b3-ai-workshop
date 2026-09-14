# B3 前端 API

`config.js` 的 `APPS_SCRIPT_WEB_APP_URL` 留空時使用 localStorage；填入已部署的 Apps Script `/exec` 網址後使用網路 API。`WORKSHOP_ID` 為場次 ID，請依研習設定。這些檔案均為公開前端程式，勿放密碼或金鑰。

載入順序：`config.js`、`api-schema.js`、`api.js`、表單程式。現有網站的 `site/generate.py` 會將這三個檔案同步至 `site/dist/assets/js/`，並由八個 HTML 頁面載入。修改設定後執行產生器，或同步修改實際部署的 config.js。

```js
try {
  const result = await B3API.submit('submitLearningGoal', {goal: '練習分步提示'});
  // result.mode 是 local 或 remote；僅在成功後顯示成功訊息。
} catch (error) {
  // 顯示 error.message，勿清空表單。
}
const result = await B3API.getDashboardData();
```

支援 Code.gs 的 12 種提交 action 與 getDashboardData。本文以 `JSON.stringify` 編碼，傳送 POST；Content-Type 使用 `text/plain;charset=utf-8` 承載 JSON，避免 Apps Script 的 application/json 跨來源預檢問題。不是表單編碼，亦未使用 no-cors。必須驗證 JSON 的 `ok`，不能只判斷 HTTP 200。正式跨來源連線仍需使用實際部署網址測試其登入與存取設定。

離線資料庫 key：`b3-api-records-v1`，存放 action、workshopId、participantId、data、recordId、timestamp。匿名學員 ID key：`b3-participant-id-v1`。資料依同源保存、重新整理後仍存在；清除瀏覽器資料會移除，不會自動同步到遠端。私密模式或儲存容量不足時明確報錯。

目前六個表單分別提交：學習目標、自評、風險課堂任務、Prompt 修訂、同儕回饋與離場行動。每個表單共用 submit 事件，送出中停用按鈕避免連點，成功與失敗均不清空欄位。任務完成切換、計時器、選擇題提示不是資料提交表單，維持原操作。儀表板原有班級假資料仍為示範；真實／離線彙總可透過 `getDashboardData()` 取得。

網址只要已設定，即使無效或連線失敗也不回退至 localStorage。逾時可能已寫入伺服器，請先確認再重送，沒有自動重試或保證去重。既有「重設示範進度與筆記」不刪除 API 離線提交資料。

`api-schema.js` 與後端 B3_SCHEMAS 一致；後端欄位調整時需同步更新此檔。部署端仍以 Code.gs 驗證為準。本版已測試離線保存、POST JSON、伺服器錯誤、非 JSON 回應、失敗保留欄位與六個表單掛接。尚未連上正式 Apps Script 端點。
