# B3 AI 教學導航任務站

HTML、CSS、原生 JavaScript 的三小時工作坊網站，使用 Google 試算表與 Apps Script。八頁涵蓋十張任務卡、講師 Dashboard 與資源摘要。

## 本機啟動

執行 `python site/generate.py`，再執行 `python -m http.server 8765 --directory site/dist`，開啟 http://localhost:8765。先在 checkin 報到。API URL 留空時使用 localStorage，不跨裝置同步。

## Google 試算表與 Apps Script

1. 建立新試算表，一場工作坊一份。共用權限設「受限制」，只加入講師與助教。
2. 從「擴充功能 → Apps Script」開啟編輯器，將 apps_script/Code.gs 全部貼入 Code.gs。不需再貼其他 JS。
3. 在「專案設定 → 指令碼屬性」加入 SPREADSHEET_ID，值是試算表網址 /d/ 與 /edit 之間的 ID，不要寫進程式碼。
4. 可設定 WORKSHOP_ID，預設 b3-demo，前端 config 使用相同名稱。
5. 執行 setupSheets()，按畫面授權，確認產生 data/sheets_schema.md 的 13 張工作表。舊欄位不符時拒絕覆寫；先備份再人工遷移。
6. 選「部署 → 新增部署 → 網頁應用程式」，執行身分選部署者，存取範圍依學校政策設定。学員不需要試算表編輯權。
7. 將部署的 /exec URL 填入 public/assets/js/config.js 的 APPS_SCRIPT_WEB_APP_URL。再執行產生指令，同步到 site/dist。URL 只維護這個來源檔。
8. 更新程式後，在管理部署選新版本；不能只儲存 Code.gs。用真實瀏覽器提交一筆，確認試算表新增資料與 Dashboard 更新。

執行身分與存取設定參考 [Google 官方 Web Apps 文件](https://developers.google.com/apps-script/guides/web)。目前尚未替使用者執行線上部署。

## API 與 CORS

POST JSON 使用 `{ "action": "submitWordCloud", "payload": { "participant_id": "p001", "mood": "驚艷", "keyword": "備課變快" } }`。
成功回傳 success、message、data；失敗回傳 success:false 與 message。timestamp 由伺服器產生。getDashboardData 可用 POST，也保留 GET。

前端用 text/plain;charset=utf-8 傳送 JSON 字串，避免 application/json 的預檢。不要使用無法驗證提交結果的 no-cors。若回傳登入頁或遭網域政策限制，需確認部署存取設定；前端自行加入 CORS 標頭不能解除限制。連線失敗會保留輸入，不會偷偷切換離線資料庫。

## GitHub Pages

建立專用網站 repository，將 site/dist **裡面的內容**放在 repository 根目錄，確保 index.html 直接位於根目錄。不要把整個教材包、帳密或金鑰上傳。
在 Settings → Pages 選 Deploy from a branch，指定分支與根目錄 /，儲存後等待發布。更新程式或 config 後，重新產生 dist 並同步。
參考 [GitHub Pages 發布來源說明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 在簡報加入 QR Code

先取得正式網站 URL（不能是 localhost）。用學校核准的 QR Code 工具轉為 PNG，插入簡報任務地圖頁，旁邊放可點擊的網站網址備援。需要直達任務可使用 checkin.html 或 lesson.html。正式上課前用手機行動網路掃碼，確認報到、送出與 Dashboard 都能使用。

## 資料與安全

- 不收集身分證、電話、住址。姓名可用暱稱；公開投影只顯示組別，缺少組別顯示未分組。
- API 檢查欄位、必填、型別、長度及分數。自由文字仍需講師確認，可隱藏不適合投影的卡片。
- 不提交 Google 密碼、OAuth Secret、API Key、服務帳號金鑰。設定使用 Script Properties；.gitignore 無法移除已提交的秘密歷史。
- 目前未使用 Google 登入。若加入，只辨識使用者，不授予試算表編輯權。
- 尋寶頁碼填入章節／引句欄，例如「第一章 p.12」，維持指定欄序。
- 教案上傳指指定欄位的文字作品提交，不提供任意檔案上傳。資源頁提供教材摘要，正式教材連結需講師確認授權後加入。
- 本機測試不代表真實 Google 部署及跨來源連線已驗證。
