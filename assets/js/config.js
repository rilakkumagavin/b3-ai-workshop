// Fill in your deployed Apps Script /exec URL. Empty means localStorage mode.
window.B3_DEFAULT_CONFIG = Object.freeze({
  APPS_SCRIPT_WEB_APP_URL: '',
  WORKSHOP_ID: 'b3-demo',
  REQUEST_TIMEOUT_MS: 20000
});
window.B3_CONNECTION_KEY = 'b3-connection-settings-v1';
window.B3_CONFIG = (() => {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(window.B3_CONNECTION_KEY) || '{}'); } catch {}
  return Object.freeze({...window.B3_DEFAULT_CONFIG,
    APPS_SCRIPT_WEB_APP_URL: typeof saved.apiUrl === 'string' ? saved.apiUrl : window.B3_DEFAULT_CONFIG.APPS_SCRIPT_WEB_APP_URL,
    GOOGLE_FORM_URL: typeof saved.formUrl === 'string' ? saved.formUrl : ''});
})();
