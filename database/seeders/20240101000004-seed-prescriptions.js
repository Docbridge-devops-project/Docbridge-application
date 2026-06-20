'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const userId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

    await queryInterface.bulkInsert('prescriptions', [
      {
        id: 'e1000000-0000-0000-0000-000000000001',
        user_id: userId,
        consultation_id: 'c1000000-0000-0000-0000-000000000001',
        family_member_id: null,
        medicine_name: 'Amlodipine',
        generic_name: 'Amlodipine Besylate',
        dosage: '5mg',
        frequency: 'Once daily in the morning',
        duration_days: 90,
        start_date: twoMonthsAgo.toISOString().split('T')[0],
        end_date: threeMonthsLater.toISOString().split('T')[0],
        instructions: 'Take with or without food. Take at the same time every day. Do not stop suddenly.',
        purpose: 'Calcium channel blocker for hypertension management',
        purpose_simplified: 'This medicine helps relax your blood vessels so blood flows more easily, which lowers your blood pressure. Think of it like widening a garden hose so water flows through with less pressure.',
        is_active: true,
        refill_needed: false,
        refill_date: null,
        prescribing_doctor: 'Dr. Sneha Kapoor',
        pharmacy_notes: null,
        ai_explanation: 'Amlodipine is one of the most commonly prescribed blood pressure medicines worldwide. It belongs to a group called calcium channel blockers. Here is how it works: your blood vessel walls have tiny muscles that can tighten or relax. Calcium makes them tighten. This medicine blocks some of that calcium, so your blood vessels stay more relaxed and open, making it easier for blood to flow through. Most people take it once in the morning and it works for a full 24 hours.',
        side_effect_warnings: '{Ankle swelling,Mild dizziness when standing up,Headache in the first few days,Flushing or feeling warm}',
        food_interactions: '{Avoid grapefruit juice — it can increase the medicine effect too much,Limit salt intake to help the medicine work better}',
        created_at: twoMonthsAgo,
        updated_at: twoMonthsAgo,
      },
      {
        id: 'e1000000-0000-0000-0000-000000000002',
        user_id: userId,
        consultation_id: 'c1000000-0000-0000-0000-000000000001',
        family_member_id: null,
        medicine_name: 'Ecosprin',
        generic_name: 'Aspirin (low-dose)',
        dosage: '75mg',
        frequency: 'Once daily after lunch',
        duration_days: 90,
        start_date: twoMonthsAgo.toISOString().split('T')[0],
        end_date: threeMonthsLater.toISOString().split('T')[0],
        instructions: 'Take after meals to protect stomach. Do not take on an empty stomach.',
        purpose: 'Low-dose antiplatelet for cardiovascular risk reduction',
        purpose_simplified: 'This is a very small dose of aspirin that helps keep your blood flowing smoothly. It makes your blood slightly less "sticky" so it does not form clots that could block blood vessels.',
        is_active: true,
        refill_needed: false,
        refill_date: null,
        prescribing_doctor: 'Dr. Sneha Kapoor',
        pharmacy_notes: null,
        ai_explanation: null,
        side_effect_warnings: '{Stomach irritation — always take after food,Easy bruising,If you notice black stools contact your doctor immediately}',
        food_interactions: '{Take after meals,Avoid alcohol — increases stomach bleeding risk}',
        created_at: twoMonthsAgo,
        updated_at: twoMonthsAgo,
      },
      {
        id: 'e1000000-0000-0000-0000-000000000003',
        user_id: userId,
        consultation_id: 'c1000000-0000-0000-0000-000000000001',
        family_member_id: null,
        medicine_name: 'Pan 40',
        generic_name: 'Pantoprazole',
        dosage: '40mg',
        frequency: 'Once daily, 30 minutes before breakfast',
        duration_days: 30,
        start_date: twoMonthsAgo.toISOString().split('T')[0],
        end_date: oneMonthAgo.toISOString().split('T')[0],
        instructions: 'Take on empty stomach, 30 minutes before first meal. Swallow whole, do not crush.',
        purpose: 'Proton pump inhibitor to protect stomach lining while on aspirin',
        purpose_simplified: 'This medicine reduces the acid in your stomach. Since you are taking aspirin, which can irritate the stomach, this acts as a shield to protect your stomach lining.',
        is_active: false,
        refill_needed: false,
        refill_date: null,
        prescribing_doctor: 'Dr. Sneha Kapoor',
        pharmacy_notes: null,
        ai_explanation: null,
        side_effect_warnings: '{Headache,Mild nausea initially,Long-term use may affect calcium absorption}',
        food_interactions: '{Must be taken on empty stomach for best effect}',
        created_at: twoMonthsAgo,
        updated_at: oneMonthAgo,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('prescriptions', null, {});
  },
};
