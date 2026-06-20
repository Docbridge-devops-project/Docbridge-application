const SYSTEM_PROMPT = `You are DocBridge AI, a caring and knowledgeable health companion. Your role is to help patients understand their health better AFTER they have visited their doctor.

CRITICAL RULES:
1. NEVER diagnose conditions. You explain what the doctor has already diagnosed.
2. NEVER recommend starting, stopping, or changing medications. Only explain what was prescribed.
3. ALWAYS use simple, everyday language. Avoid medical jargon.
4. ALWAYS include a medical disclaimer reminding users to consult their doctor.
5. Be empathetic, warm, and encouraging. Patients may be anxious.
6. When explaining medicines, include: what it does in simple terms, common side effects to watch for, food interactions, and when to call the doctor.
7. When explaining lab results, compare values to normal ranges in simple terms.
8. When analyzing symptoms, look for patterns but never diagnose.
9. Use analogies and metaphors to explain complex concepts (e.g., "think of blood pressure like water pressure in a hose").
10. If asked about something outside your scope, gently redirect to their doctor.
11. ALWAYS refer to the provided 'Patient Health Context' (which contains the user's profile, recent consultations, active medications, ongoing symptoms, recent lab reports, and family members' health history) to answer questions. NEVER ask the user to provide details that are already present in this context.`;

function buildChatPrompt(userMessage, context = {}) {
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

  if (context.healthSnapshot) {
    messages.push({
      role: 'system',
      content: `Patient Health Context:\n${JSON.stringify(context.healthSnapshot, null, 2)}\n\nUse this context to provide personalized, relevant responses. Reference specific medications, conditions, lab results, and family members' health history when relevant.`,
    });
  }

  if (context.chatHistory && context.chatHistory.length > 0) {
    for (const msg of context.chatHistory.slice(-10)) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: 'user', content: userMessage });
  return messages;
}

function buildMedicineExplainPrompt(medicineData) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Please explain this medicine in simple, everyday language that anyone can understand:

Medicine: ${medicineData.medicineName}
Generic Name: ${medicineData.genericName || 'Not specified'}
Dosage: ${medicineData.dosage}
Frequency: ${medicineData.frequency}
Purpose: ${medicineData.purpose || 'Not specified'}
Instructions: ${medicineData.instructions || 'Not specified'}

Please cover:
1. What this medicine does (in simple terms)
2. Why the doctor prescribed it
3. Important things to know while taking it
4. Common side effects to watch for
5. Foods or drinks to avoid
6. When to contact the doctor about this medicine` },
  ];
}

function buildLabReportExplainPrompt(reportData) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Please explain these lab results in simple language:

Report: ${reportData.reportName}
Type: ${reportData.reportType}
Date: ${reportData.reportDate}

Results:
${JSON.stringify(reportData.results, null, 2)}

Flagged Values:
${JSON.stringify(reportData.flaggedValues || [], null, 2)}

Doctor's Interpretation: ${reportData.overallInterpretation || 'Not provided'}

Please explain:
1. What each test measures (in simple terms)
2. Whether results are normal, high, or low — and what that means
3. Any values that need attention and why
4. What the patient should do next
5. Questions to ask the doctor at the next visit` },
  ];
}

function buildSymptomInsightPrompt(symptomData, context = {}) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Please provide insights about this symptom based on the patient's health context:

Symptom: ${symptomData.symptomName}
Severity: ${symptomData.severity}/10
Location: ${symptomData.bodyLocation || 'Not specified'}
Duration: ${symptomData.durationHours ? symptomData.durationHours + ' hours' : 'Ongoing'}
Triggers: ${symptomData.triggers || 'Not specified'}
Relieved by: ${symptomData.relievedBy || 'Not specified'}

Current Medications: ${context.medications ? context.medications.map(m => m.medicine_name).join(', ') : 'None listed'}

Please provide:
1. Possible connections to current medications (side effects?)
2. Patterns to watch for
3. Self-care tips
4. When this symptom warrants calling the doctor
5. Questions to ask the doctor about this symptom` },
  ];
}

function buildGenerateQuestionsPrompt(context = {}) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Based on the following health context, generate 5-8 smart questions this patient should ask their doctor at their next visit:

Current Conditions: ${context.conditions ? context.conditions.join(', ') : 'Not specified'}
Current Medications: ${context.medications ? context.medications.map(m => `${m.medicine_name} ${m.dosage}`).join(', ') : 'None'}
Recent Symptoms: ${context.symptoms ? context.symptoms.map(s => `${s.symptom_name} (severity ${s.severity}/10)`).join(', ') : 'None'}
Recent Lab Results: ${context.labHighlights || 'None'}

Generate questions that:
1. Help the patient understand their condition better
2. Clarify medication concerns
3. Address symptom patterns
4. Discuss lifestyle changes
5. Plan for future health monitoring` },
  ];
}

const SUGGESTED_QUESTIONS = [
  "What does my latest blood test mean?",
  "Can you explain my blood pressure medicine in simple terms?",
  "What foods should I avoid with my current medications?",
  "I have been feeling dizzy — could it be from my medicine?",
  "What questions should I ask my doctor at my next visit?",
  "Help me understand my cholesterol numbers",
  "What side effects should I watch for with my prescriptions?",
  "Can you explain what my diagnosis means in simple terms?",
];

module.exports = {
  buildChatPrompt, buildMedicineExplainPrompt, buildLabReportExplainPrompt,
  buildSymptomInsightPrompt, buildGenerateQuestionsPrompt, SUGGESTED_QUESTIONS,
};
