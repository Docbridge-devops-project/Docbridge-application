'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const fiveWeeksAgo = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);
    const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const userId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

    await queryInterface.bulkInsert('symptoms', [
      {
        id: 'e3000000-0000-0000-0000-000000000001',
        user_id: userId,
        family_member_id: null,
        symptom_name: 'Headache',
        severity: 6,
        onset_date: fiveWeeksAgo.toISOString().split('T')[0],
        onset_time: '15:00:00',
        duration_hours: 4,
        is_ongoing: false,
        resolved_date: threeWeeksAgo.toISOString().split('T')[0],
        body_location: 'Back of head and temples',
        triggers: 'Stress at work, skipping meals, dehydration',
        relieved_by: 'Rest, drinking water, paracetamol',
        associated_symptoms: '{Mild dizziness,Neck stiffness}',
        notes: 'Was happening almost daily before starting blood pressure medicine. Much better now.',
        ai_insight: 'Your headaches were likely connected to your elevated blood pressure. The pattern of headaches at the back of your head, combined with dizziness, is a classic sign of high blood pressure. The improvement after starting your medicine supports this connection. Keep tracking and let your doctor know if they return.',
        related_consultation_id: 'c1000000-0000-0000-0000-000000000001',
        created_at: fiveWeeksAgo,
        updated_at: threeWeeksAgo,
      },
      {
        id: 'e3000000-0000-0000-0000-000000000002',
        user_id: userId,
        family_member_id: null,
        symptom_name: 'Ankle swelling',
        severity: 3,
        onset_date: threeWeeksAgo.toISOString().split('T')[0],
        onset_time: '18:00:00',
        duration_hours: null,
        is_ongoing: true,
        resolved_date: null,
        body_location: 'Both ankles, more on left side',
        triggers: 'Worse in the evening after sitting for long periods',
        relieved_by: 'Elevating legs, walking around',
        associated_symptoms: '{}',
        notes: 'Started about a week after beginning Amlodipine. Doctor said this is a common side effect.',
        ai_insight: 'Ankle swelling is one of the most common side effects of Amlodipine (your blood pressure medicine). It happens because the medicine relaxes blood vessels, and sometimes fluid can pool in your lower legs. This is usually not dangerous. Tips: elevate your legs when sitting, take short walks every hour, and wear comfortable shoes. Tell your doctor if it gets worse or becomes painful.',
        related_consultation_id: 'c1000000-0000-0000-0000-000000000002',
        created_at: threeWeeksAgo,
        updated_at: threeWeeksAgo,
      },
      {
        id: 'e3000000-0000-0000-0000-000000000003',
        user_id: userId,
        family_member_id: null,
        symptom_name: 'Mild dizziness',
        severity: 2,
        onset_date: tenDaysAgo.toISOString().split('T')[0],
        onset_time: '08:00:00',
        duration_hours: 1,
        is_ongoing: true,
        resolved_date: null,
        body_location: 'General / lightheadedness',
        triggers: 'Standing up quickly from sitting or lying down',
        relieved_by: 'Standing up slowly, drinking water',
        associated_symptoms: '{}',
        notes: 'Happens mostly in the morning. Goes away after a few seconds.',
        ai_insight: null,
        related_consultation_id: null,
        created_at: tenDaysAgo,
        updated_at: tenDaysAgo,
      },
      {
        id: 'e3000000-0000-0000-0000-000000000004',
        user_id: userId,
        family_member_id: null,
        symptom_name: 'Lower back pain',
        severity: 4,
        onset_date: fiveDaysAgo.toISOString().split('T')[0],
        onset_time: '10:00:00',
        duration_hours: 6,
        is_ongoing: true,
        resolved_date: null,
        body_location: 'Lower back, right side',
        triggers: 'Sitting at desk for long hours',
        relieved_by: 'Stretching, hot compress, walking',
        associated_symptoms: '{Slight muscle stiffness}',
        notes: 'Likely from bad posture at work. No radiating pain to legs.',
        ai_insight: null,
        related_consultation_id: null,
        created_at: fiveDaysAgo,
        updated_at: fiveDaysAgo,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('symptoms', null, {});
  },
};
