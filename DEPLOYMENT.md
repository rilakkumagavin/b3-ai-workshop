# 新版互動共學站部署

## 清除本場資料

更新 Apps Script 的 `admin-api.gs` 並在「管理部署」選擇新版本部署（沿用原網址），才可使用新清除按鈕。先暫停提交並儲存，輸入「清除本場資料」，再按「備份並清除本場資料」。後端先複製完整試算表，再清除十二張任務資料表的表頭以下內容；保留 settings、其他工作表及指令碼屬性。備份失敗不清除；部分清除失敗可從雲端硬碟的「清除前備份」恢復。清除後保持暫停，需由主持人重新開放。瀏覽器中的個人草稿／完成進度不會被刪除。

## 本次功能

首頁為共學大廳，顯示報到人數、組別與教案數。學員沿用十張任務卡；文字雲、教案市集、成果牆與共學狀態每次讀取完成後等待 15 秒再更新。背景分頁停止排程，使用者可暫停自動更新。

主持人控制台以後端通行碼驗證。登入票證只保留在頁面記憶體，最長一小時；重新整理、離開或登出後重新解鎖。Google 帳號不是本次登入方式。學員表單的「講師／助教」角色只是資料欄位，不授予管理權限。

## 升級順序

1. 在既有 Apps Script 專案更新 `Code.gs`，並新增 `admin-api.gs`，內容分別使用 `project-backup/apps_script/` 同名檔案。不要再同時貼入舊的 server-v3.js 或 reusable-database.gs。
2. 在 Apps Script 專案設定的 Script Properties 設定 `ADMIN_ACCESS_KEY`，使用至少 6 字元、至多 256 字元的通行碼。不把通行碼放進 HTML、config.js、試算表或 Git。
3. 保留原有 `SPREADSHEET_ID` 與 `WORKSHOP_ID`。可選填 `WORKSHOP_TITLE`；`SUBMISSIONS_OPEN=false` 表示暫停提交，未設定時預設開放。
4. 在管理部署更新既有網頁應用程式版本，沿用 `/exec` 網址。執行者需能編輯預定使用的試算表。Google 試算表共用維持受限制；學員不需要取得試算表權限。
5. 確認 `assets/js/config.js` 的固定 Web App URL 指向此部署。它是公開 API 地址，不是秘密。執行 `python generate.py`，發布根目錄網站或 dist 內容到原 GitHub Pages。
6. 主持人解鎖後貼入試算表網址、填活動名稱、選擇是否開放提交，再儲存。後端檢查全部既有資料表欄位，再補齊缺少的資料表，不清空答案。若補表途中 Google 服務失敗，可能已建立部分空表；原資料庫設定不變，可重試。
7. 使用兩個獨立瀏覽器驗證報到及成果同步、錯誤通行碼被拒絕、未登入無法讀寫管理設定、暫停後提交被拒絕、登出後設定不可見。

正式 Google 後端與網站尚未在本次工作中部署。本機測試不能取代正式 Google 權限、重新導向與跨來源連線驗證。

## 邊界

- 一個 API 同一時間對應一個活動資料庫；切換會讓全班使用新表。多場同時上課需使用不同部署與網站路徑。
- 本次沒有加入自動分組、指定組員角色或 Google 帳號登入；分組由學員依主持人指示填寫，首頁呈現組別人數。
- 登入失敗五次後，全站管理登入暫停五分鐘；由於 Apps Script 無可靠來源 IP，此限制是全域的。管理票證可能因 Google 快取提早回收而需要重登。
- 公開 API 僅提供必要活動狀態、組別統計與投影資料；管理設定只在成功驗證後回傳。歷史上公開的試算表網址已從目前部署紀錄移除，但仍可能存在 Git 舊提交。不要把既有網址已知誤認成試算表可讀取權限；若要求網址也完全保密，正式使用新的受限制試算表，且不再提交其網址。
- 沿用既有提交收據處理，沒有宣稱網路重試完全不重複寫入。逾時後先核對再重送。

Google 官方參考：[Web Apps](https://developers.google.com/apps-script/guides/web)、[Properties Service](https://developers.google.com/apps-script/guides/properties)、[Content Service](https://developers.google.com/apps-script/guides/content)。

## 本機檢查

```powershell
python generate.py
node tests/backend.cjs
node tests/preview-server.cjs
```

最後一個指令啟動 http://127.0.0.1:8766，使用記憶體中的模擬試算表，不會存取正式 Google 資料。驗收用通行碼為 `preview-only-access-key-1234567890123456`，僅供此測試伺服器使用。關閉程序後測試資料消失。

本機已驗證後端身分驗證、限流、到期、登出、通行碼輪替、設定隱私、兩個學員彙整、欄位不符拒絕切換、原資料保留、管理設定版本衝突、暫停與恢復。瀏覽器已驗證解鎖與儲存流程、手機首頁、表單及文字雲載入；未執行正式無障礙認證。
