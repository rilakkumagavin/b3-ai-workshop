/* Shared browser/server validation. Do not log rejected text. */
function b3PrivacyCheck(data) {
  for (const value of Object.values(data)) {
    if (typeof value !== 'string') continue;
    if (/\b[A-Z][12]\d{8}\b/i.test(value) || /(?:\+886[-\s]?9|09)(?:\d[-\s]?){8}\b/.test(value) || /0[2-8][-\s]?\d{3,4}[-\s]?\d{4}\b/.test(value) || /[\u4e00-\u9fff]{2,}[縣市][^\n]{0,25}[路街][^\n]{0,15}\d+號/.test(value)) {
      throw new Error('請移除身分證號、電話或住址後再送出；只需填寫教學內容與組別。');
    }
  }
}
function b3RequiredFields(action) {
  return ({submitParticipant:['name','group_id'],submitWordCloud:['keyword','mood'],submitLearningGoal:['goal'],submitGuideTreasure:['sail_chapter','sail_quote'],submitSelfCheck:['ethics_score','tech_score','teaching_score','professional_score'],submitRiskCase:['case_id','strategy'],submitRiskLessonTask:['student_task','learning_evidence'],submitPromptRevision:['lesson_title','original_prompt','revised_prompt'],submitLessonMarket:['lesson_title'],submitFeedback:['to_group_id','feedback_text'],submitTrafficLightRule:['green_items','yellow_items','red_items','class_rule'],submitExitTicket:['first_action']})[action] || [];
}
