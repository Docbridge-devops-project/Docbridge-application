'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const userId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const fatherId = 'f1a2b3c4-d5e6-7890-abcd-ef1234500003';

    await queryInterface.bulkInsert('consultations', [
      {
        id: 'c1000000-0000-0000-0000-000000000001',
        user_id: userId,
        family_member_id: null,
        doctor_name: 'Dr. Sneha Kapoor',
        doctor_specialty: 'General Medicine',
        hospital_clinic: 'Apollo Clinic, Koramangala',
        consultation_date: twoMonthsAgo.toISOString().split('T')[0],
        consultation_time: '10:30:00',
        chief_complaint: 'Persistent headaches for 2 weeks, mild dizziness, elevated blood pressure at pharmacy check',
        diagnosis: 'Stage 1 Essential Hypertension (ICD-10: I10)',
        diagnosis_simplified: 'Your blood pressure is slightly higher than normal. This is called mild high blood pressure. It means your heart is working a little harder than it should to pump blood.',
        doctor_notes: 'BP 148/92. No secondary causes suspected. Start lifestyle modifications and low-dose antihypertensive. Review in 4 weeks.',
        follow_up_date: oneMonthAgo.toISOString().split('T')[0],
        follow_up_notes: 'Recheck BP after 4 weeks on medication. Bring home BP readings.',
        status: 'completed',
        is_teleconsultation: false,
        attachments: '[]',
        ai_explanation: 'Your doctor found that your blood pressure is a bit high — 148/92, while a healthy range is usually around 120/80. Think of blood pressure like water pressure in a hose: if it is too high, it can damage the hose over time. Similarly, high blood pressure can slowly damage your heart and blood vessels. The good news is that this is mild and very manageable with some lifestyle changes and a small dose of medicine.',
        created_at: twoMonthsAgo,
        updated_at: twoMonthsAgo,
      },
      {
        id: 'c1000000-0000-0000-0000-000000000002',
        user_id: userId,
        family_member_id: null,
        doctor_name: 'Dr. Rajesh Sharma',
        doctor_specialty: 'General Medicine',
        hospital_clinic: 'Apollo Clinic, Koramangala',
        consultation_date: oneMonthAgo.toISOString().split('T')[0],
        consultation_time: '11:00:00',
        chief_complaint: 'Follow-up for hypertension. Headaches reduced. Occasional mild dizziness when standing quickly.',
        diagnosis: 'Essential Hypertension — improving on treatment',
        diagnosis_simplified: 'Your blood pressure is getting better with the medicine! The mild dizziness when you stand up quickly is a common, harmless side effect that usually goes away.',
        doctor_notes: 'BP improved to 132/86. Continue current medication. Add potassium-rich foods. Reduce sodium. Recheck in 6 weeks.',
        follow_up_date: nextWeek.toISOString().split('T')[0],
        follow_up_notes: 'Continue monitoring at home. Aim for BP below 130/85.',
        status: 'completed',
        is_teleconsultation: false,
        attachments: '[]',
        ai_explanation: null,
        created_at: oneMonthAgo,
        updated_at: oneMonthAgo,
      },
      {
        id: 'c1000000-0000-0000-0000-000000000003',
        user_id: userId,
        family_member_id: null,
        doctor_name: 'Dr. Ananya Iyer',
        doctor_specialty: 'General Medicine',
        hospital_clinic: 'Apollo Clinic, Koramangala',
        consultation_date: nextWeek.toISOString().split('T')[0],
        consultation_time: '10:00:00',
        chief_complaint: null,
        diagnosis: null,
        diagnosis_simplified: null,
        doctor_notes: null,
        follow_up_date: null,
        follow_up_notes: null,
        status: 'scheduled',
        is_teleconsultation: false,
        attachments: '[]',
        ai_explanation: null,
        created_at: twoWeeksAgo,
        updated_at: twoWeeksAgo,
      },
      {
        id: 'c1000000-0000-0000-0000-000000000004',
        user_id: userId,
        family_member_id: fatherId,
        doctor_name: 'Dr. Vikram Patel',
        doctor_specialty: 'Endocrinology',
        hospital_clinic: 'Manipal Hospital, Whitefield',
        consultation_date: twoWeeksAgo.toISOString().split('T')[0],
        consultation_time: '14:30:00',
        chief_complaint: 'Routine diabetes review for father. HbA1c was 7.8% last time. Complaints of occasional numbness in feet.',
        diagnosis: 'Type 2 Diabetes Mellitus with early peripheral neuropathy',
        diagnosis_simplified: 'Your father\'s diabetes is mostly under control but the sugar levels have been slightly high over the past few months. The tingling in his feet is an early sign that high sugar is starting to affect the nerves — catching it early is really good news because it can be managed.',
        doctor_notes: 'HbA1c 7.2% — improved. Continue Metformin 1000mg BD. Add Gabapentin 100mg at night for neuropathy. Foot care education. Annual eye exam due.',
        follow_up_date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        follow_up_notes: '3-month follow up. Repeat HbA1c, fasting glucose, lipid panel. Check feet.',
        status: 'completed',
        is_teleconsultation: false,
        attachments: '[]',
        ai_explanation: null,
        created_at: twoWeeksAgo,
        updated_at: twoWeeksAgo,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('consultations', null, {});
  },
};
