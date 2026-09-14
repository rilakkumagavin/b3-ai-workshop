/* Only projection fields leave the aggregation layer. No participant IDs or profiles. */
function b3ProjectionData(rows) {
  const profiles = new Map();
  rows.filter(r=>r.action==='submitParticipant').forEach(r=>profiles.set(r.participantId,r.data));
  const names=[...profiles.values()].map(p=>p.displayName).filter(Boolean);
  function clean(value) {
    let text=String(value||'');
    names.forEach(name=>{text=text.split(name).join('［姓名已隱藏］');});
    return text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'［Email 已隱藏］')
      .replace(/\b[A-Z][12]\d{8}\b/gi,'［證號已隱藏］')
      .replace(/(?:\+886[-\s]?|0)(?:\d[-\s]?){8,9}\b/g,'［電話已隱藏］');
  }
  const group=r=>clean(r.data.group_id||profiles.get(r.participantId)?.groupName)||'未分組';
  const pick=(action,fields)=>rows.filter(r=>r.action===action).map(r=>({group:group(r),...Object.fromEntries(fields.map(k=>[k,clean(r.data[k])]))}));
  const goals=new Map();
  rows.filter(r=>r.action==='submitLearningGoal').forEach(r=>{const goal=clean(r.data.goal).trim();if(goal)goals.set(goal,(goals.get(goal)||0)+1);});
  return {projection:{
    wordCloud:rows.filter(r=>r.action==='submitWordCloud').map(r=>({keyword:clean(r.data.keyword||r.data.word),mood:clean(r.data.mood||'未分類'),count:1})),
    market:pick('submitLessonMarket',['lesson_title','ai_entry_point','original_prompt','revised_prompt','avoid_thinking_replacement']),
    feedback:pick('submitFeedback',['to_group_id','feedback_type','feedback_text']),
    goals:[...goals].map(([goal,count])=>({goal,count})).sort((a,b)=>b.count-a.count),
    risks:[...pick('submitRiskCase',['scenario','judgment','strategy']),...pick('submitRiskLessonTask',['scenario','riskType','studentTask','learningEvidence'])],
    prompts:pick('submitPromptRevision',['lessonTitle','originalPrompt','revisedPrompt']),
    rules:pick('submitTrafficLightRule',['greenRule','yellowRule','redRule']),
    actions:pick('submitExitTicket',['firstStep'])
  }};
}
