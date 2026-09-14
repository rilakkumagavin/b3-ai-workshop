/** Run from the Apps Script editor only. Never expose these functions as API actions. */
function createWorkshopDatabase() {
  const props = PropertiesService.getScriptProperties();
  const title = (props.getProperty('NEW_WORKSHOP_TITLE') || '').trim();
  const workshopId = (props.getProperty('NEW_WORKSHOP_ID') || '').trim();
  if (!title) throw new Error('請先設定 NEW_WORKSHOP_TITLE。');
  b3Id_(workshopId, 'NEW_WORKSHOP_ID');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('正在建立場次，請稍後再試。');
  try {
    // A retry returns the same database, without clearing any submitted answers.
    const registryKey = 'B3_DATABASE_' + workshopId;
    const existing = props.getProperty(registryKey);
    const book = existing ? SpreadsheetApp.openById(existing) : SpreadsheetApp.create('B3｜' + title);
    if (!existing) props.setProperty(registryKey, book.getId());
    const specs = Object.values(B3_SHEET_CONTRACT).concat([{sheet:'settings',fields:['key','value','note']}]);
    specs.forEach(spec => {
      const sheet = b3Sheet_(book,spec,true);
      sheet.getRange(1,1,1,spec.fields.length).setFontWeight('bold').setBackground('#dcefeb');
      sheet.setFrozenRows(1);
    });
    const settings = book.getSheetByName('settings');
    const defaults = [
      ['schema_version','b3-1.0','資料結構版本'],
      ['workshop_id',workshopId,'場次唯一代碼'],
      ['workshop_title',title,'課程名稱'],
      ['workshop_date','','開課日期 YYYY-MM-DD'],
      ['duration_minutes','180','三小時課程'],
      ['group_ids','1,2,3,4,5,6','組別清單；目前作為講師設定紀錄'],
      ['projection_identity','group','公開投影使用組別'],
      ['retention_review_date','','講師安排資料保留檢查日期；不自動刪除'],
      ['created_at',new Date().toISOString(),'建立時間']
    ];
    const keys = new Set(settings.getLastRow()>1 ? settings.getRange(2,1,settings.getLastRow()-1,1).getValues().map(r=>r[0]) : []);
    const missing = defaults.filter(row=>!keys.has(row[0]));
    if(missing.length) settings.getRange(settings.getLastRow()+1,1,missing.length,3).setValues(missing);
    SpreadsheetApp.flush();
    const result = {workshopId, spreadsheetId:book.getId(), url:book.getUrl(), reused:!!existing};
    console.log(JSON.stringify(result));
    return result;
  } finally { lock.releaseLock(); }
}
