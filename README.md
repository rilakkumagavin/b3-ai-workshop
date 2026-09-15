# B3 AI 教學導航任務站

## 2026-09-15 互動共學新版

已加入共學大廳、後端驗證的主持人控制台、共用試算表設定、開放／暫停提交，以及成果自動更新。請以 [新版部署說明](DEPLOYMENT.md) 為準；下方保留早期靜態示範紀錄。

網站來源為根目錄 `generate.py`、`assets/js/`、`styles.css` 與 `app.js`。執行 `python generate.py` 會同步產生根目錄與 `dist/` 網頁。後端使用 `project-backup/apps_script/Code.gs` 與 `admin-api.gs`。

執行 `node tests/backend.cjs` 可檢查後端；`node tests/preview-server.cjs` 提供隔離模擬預覽。新版尚未推送或部署到正式 Google／GitHub 網站。

---

純 HTML、CSS、原生 JavaScript 的八頁靜態示範網站，沒有後端或建置依賴。

## 使用方式

公開網站內容位於 `dist/`。可直接開啟 `dist/index.html`，或以任何靜態 HTTP 伺服器提供 `dist/`。透過 HTTP 使用可獲得一致的跨頁示範狀態。

頁面：index.html、checkin.html、guide.html、literacy.html、lesson.html、checkout.html、dashboard.html、resources.html。

共用外觀：`dist/styles.css`。互動：`dist/app.js`。八頁的內容生成來源：`generate.py`，可用 Python 執行以重新產生 HTML。網站執行不需要 Python。

## 示範資料與互動

- 預設林老師／海星組，完成任務卡 1、2。
- 任務可標示完成或取消，進度同步到所有頁面。
- 筆記與進度使用 sessionStorage，只保留在目前分頁的瀏覽工作階段，不會傳送到伺服器。
- 暖身計時器、STEP 判斷練習、Prompt 複製、教學筆記、示範重設與教材摘要可操作。
- 儀表板的 24 位教師、6 組、12 份作品等為固定假資料，不是即時統計。
- 教材補給箱提供示範摘要，未串接正式下載、AI 服務或 Padlet。

## 視覺來源

海洋背景沿用本工作區 B3 簡報的 OpenAI ImageGen 生成素材，2026-09-14。教材框架與任務編號依 B3 新版 27 頁大綱：任務順序為 1、2、3、4、5、6、9、7、8、10。

## 驗證

8 頁均檢查桌面與手機版寬度、導覽列、任務進度、返回首頁連結。另驗證任務完成跨頁同步、風險題回饋、筆記重新載入與重設。沒有後端框架、外部字型或執行時套件依賴。
