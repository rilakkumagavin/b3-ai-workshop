window.B3_API_SCHEMAS = {
  "submitParticipant": {
    "sheet": "Participants",
    "fields": [
      "displayName",
      "school",
      "groupName"
    ],
    "required": [
      "displayName",
      "groupName"
    ]
  },
  "submitWordCloud": {
    "sheet": "word_cloud",
    "fields": [
      "word",
      "keyword",
      "mood"
    ],
    "required": [
      "keyword",
      "mood"
    ]
  },
  "submitLearningGoal": {
    "sheet": "LearningGoals",
    "fields": [
      "goal"
    ],
    "required": [
      "goal"
    ]
  },
  "submitGuideTreasure": {
    "sheet": "GuideTreasures",
    "fields": [
      "chapter",
      "finding",
      "classroomQuestion"
    ],
    "required": [
      "chapter",
      "finding"
    ]
  },
  "submitSelfCheck": {
    "sheet": "SelfChecks",
    "fields": [
      "dimension",
      "level",
      "evidence",
      "nextStep",
      "ethicsScore",
      "basicsScore",
      "teachingScore",
      "developmentScore"
    ],
    "required": [
      "dimension",
      "level",
      "ethicsScore",
      "basicsScore",
      "teachingScore",
      "developmentScore"
    ]
  },
  "submitRiskCase": {
    "sheet": "RiskCases",
    "fields": [
      "riskType",
      "scenario",
      "judgment",
      "strategy"
    ],
    "required": [
      "riskType",
      "scenario",
      "judgment"
    ]
  },
  "submitRiskLessonTask": {
    "sheet": "RiskLessonTasks",
    "fields": [
      "grade",
      "subject",
      "riskType",
      "scenario",
      "studentTask",
      "reminder",
      "learningEvidence"
    ],
    "required": [
      "riskType",
      "studentTask",
      "learningEvidence"
    ]
  },
  "submitPromptRevision": {
    "sheet": "PromptRevisions",
    "fields": [
      "lessonTitle",
      "learningGoal",
      "aiTiming",
      "originalPrompt",
      "aiResponse",
      "revisedPrompt",
      "revisionReason",
      "learningEvidence"
    ],
    "required": [
      "lessonTitle",
      "originalPrompt",
      "revisedPrompt"
    ]
  },
  "submitLessonMarket": {
    "sheet": "LessonMarket",
    "fields": [
      "lessonTitle",
      "subject",
      "grade",
      "designSummary",
      "prompt",
      "learningEvidence",
      "artifactUrl"
    ],
    "required": [
      "lessonTitle",
      "designSummary"
    ]
  },
  "submitFeedback": {
    "sheet": "Feedback",
    "fields": [
      "targetRecordId",
      "borrowIdea",
      "suggestion"
    ],
    "required": [
      "targetRecordId",
      "borrowIdea",
      "suggestion"
    ]
  },
  "submitTrafficLightRule": {
    "sheet": "TrafficLightRules",
    "fields": [
      "assignment",
      "greenRule",
      "yellowRule",
      "redRule"
    ],
    "required": [
      "assignment",
      "greenRule",
      "yellowRule",
      "redRule"
    ]
  },
  "submitExitTicket": {
    "sheet": "ExitTickets",
    "fields": [
      "highlight",
      "blocker",
      "firstStep",
      "plannedDate",
      "learningEvidence"
    ],
    "required": [
      "highlight",
      "firstStep"
    ]
  }
};
