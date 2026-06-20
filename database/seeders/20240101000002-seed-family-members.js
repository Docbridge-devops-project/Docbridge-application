'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const sixWeeksAgo = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000);

    await queryInterface.bulkInsert('family_members', [
      {
        id: 'f1a2b3c4-d5e6-7890-abcd-ef1234500001',
        primary_user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        first_name: 'Priya',
        last_name: 'Mehta',
        relationship: 'spouse',
        date_of_birth: '1992-08-22',
        gender: 'female',
        blood_group: 'O+',
        known_allergies: '{}',
        chronic_conditions: '{}',
        avatar_url: null,
        notes: null,
        is_active: true,
        created_at: sixWeeksAgo,
        updated_at: now,
      },
      {
        id: 'f1a2b3c4-d5e6-7890-abcd-ef1234500002',
        primary_user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        first_name: 'Aarav',
        last_name: 'Mehta',
        relationship: 'child',
        date_of_birth: '2018-03-10',
        gender: 'male',
        blood_group: 'B+',
        known_allergies: '{Peanuts}',
        chronic_conditions: '{}',
        avatar_url: null,
        notes: 'Regular pediatric checkups every 6 months',
        is_active: true,
        created_at: sixWeeksAgo,
        updated_at: now,
      },
      {
        id: 'f1a2b3c4-d5e6-7890-abcd-ef1234500003',
        primary_user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        first_name: 'Ramesh',
        last_name: 'Mehta',
        relationship: 'parent',
        date_of_birth: '1958-11-05',
        gender: 'male',
        blood_group: 'A+',
        known_allergies: '{}',
        chronic_conditions: '{Type 2 Diabetes,Hypertension}',
        avatar_url: null,
        notes: 'Takes metformin and amlodipine daily',
        is_active: true,
        created_at: sixWeeksAgo,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('family_members', null, {});
  },
};
