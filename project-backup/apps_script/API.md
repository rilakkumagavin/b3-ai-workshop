# 單一 Web App API

所有前端讀寫使用 `POST APPS_SCRIPT_WEB_APP_URL`。送出的 JSON 為：

```json
{"action":"submitWordCloud","payload":{"participant_id":"p001","name":"王老師","group_id":"1","mood":"驚艷","keyword":"備課變快","note":"AI 可以幫我整理活動流程"}}
```

成功回應：

```json
{"success":true,"message":"資料已寫入","data":{"action":"submitWordCloud","sheet":"word_cloud","recordId":"提交確認碼","timestamp":"伺服器時間"}}
```

失敗回應包含 `success:false`、`message`、`data:{}` 與 `error.code`。前端必須檢查 success；HTTP 成功不代表資料寫入成功。

Dashboard 使用 `{"action":"getDashboardData","payload":{}}`。保留 doGet 作為唯讀相容入口。

使用 SpreadsheetApp 直接附加資料列，不需要 Google Sheets API 金鑰。優先使用指令碼屬性 SPREADSHEET_ID；未設定時使用綁定試算表。請部署最新 Code.gs。每份試算表對應一場工作坊。

跨來源瀏覽器請求以 `Content-Type: text/plain;charset=utf-8` 傳送 JSON 字串，前端程式已處理。欄位名稱與順序見 data/sheets_schema.md。timestamp 由伺服器寫入，請勿由 payload 提供。

舊版 `{action,data}`／`ok` 契約已改為 `{action,payload}`／`success`，請同步更新前端與 Web App 部署。URL 未設定時仍使用本機離線資料。
