/* Shared aggregate contract; also copied into Code.gs for Apps Script. */
function b3InteractiveAggregate(rows) {
  const words = new Map(), latest = new Map();
  const keys = ['ethicsScore','basicsScore','teachingScore','developmentScore'];
  rows.forEach(r => {
    if (r.action === 'submitWordCloud') {
      const keyword = (r.data.keyword || r.data.word || '').trim();
      const mood = r.data.mood || '未分類';
      if (keyword) {
        const id = JSON.stringify([keyword,mood]);
        const item = words.get(id) || {keyword,mood,count:0};
        item.count++; words.set(id,item);
      }
    }
    if (r.action === 'submitSelfCheck' && keys.every(k => /^[1-5]$/.test(r.data[k]))) {
      const previous = latest.get(r.participantId);
      if (!previous || String(r.timestamp) >= String(previous.timestamp)) latest.set(r.participantId,r);
    }
  });
  return {word_cloud:[...words.values()], radar:{count:latest.size,
    scores:keys.map(k => latest.size ? [...latest.values()].reduce((s,r) => s+Number(r.data[k]),0)/latest.size : null)}};
}
