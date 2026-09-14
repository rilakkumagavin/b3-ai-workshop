function b3ToSheet(action, data, identity) {
  const spec=B3_SHEET_CONTRACT[action], result={};
  Object.keys(data).forEach(k=>{const target=spec.aliases[k]||k;if(spec.fields.includes(target)&&target!=='timestamp')result[target]=String(data[k]??'');});
  if(spec.fields.includes('participant_id'))result.participant_id=identity.participantId||result.participant_id||'';
  if(spec.fields.includes('name'))result.name=result.name||identity.name||'';
  if(spec.fields.includes('group_id'))result.group_id=result.group_id||identity.groupId||'';
  if(action==='submitRiskCase' && data.scenario && !data.case_id){let hash=0;for(const ch of data.scenario)hash=(hash*31+ch.charCodeAt(0))>>>0;result.case_id='case-'+hash.toString(16);}
  if(action==='submitFeedback'){result.from_group_id=result.from_group_id||identity.groupId||'';if(data.borrowIdea||data.suggestion){result.feedback_type='同儕回饋';result.feedback_text=[data.borrowIdea,data.suggestion].filter(Boolean).join('\n');}}
  if(action==='submitTrafficLightRule')result.class_rule=data.class_rule||[data.greenRule,data.yellowRule,data.redRule].filter(Boolean).join('\n');
  spec.fields.forEach(k=>{if(k!=='timestamp' && data[k]!==undefined)result[k]=String(data[k]);});
  if(action==='submitRiskCase' && data.judgment){result.strategy=data.judgment;result.student_reminder=data.student_reminder||data.strategy||'';}
  if(action==='submitTrafficLightRule'){for(const k of ['green_items','yellow_items','red_items'])result[k]=(result[k]||'').replace(/^我們可以：|^我們使用前要與老師確認並說明方式：|^我們不會：/,'').replace(/。$/,'').replace(/^本組尚未列出.*行為$/,'（尚未列出）');}
  if(action==='submitTrafficLightRule')result.class_rule=`在我們班，學生使用 AI 時，可以${result.green_items||'（尚未列出）'}，需要說明${result.yellow_items||'（尚未列出）'}，不能${result.red_items||'（尚未列出）'}。`;
  return result;
}
function b3FromSheet(action,data) {
  const result={...data};Object.entries(B3_SHEET_CONTRACT[action].aliases).forEach(([k,v])=>{result[k]=data[v]||'';});
  if(action==='submitParticipant'){result.displayName=data.name;result.groupName=data.group_id;}
  return result;
}
