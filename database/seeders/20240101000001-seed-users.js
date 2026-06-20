'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('Arjun@123', 12);
    const now = new Date();
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    await queryInterface.bulkInsert('users', [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'arjun.mehta@gmail.com',
        password_hash: passwordHash,
        first_name: 'Arjun',
        last_name: 'Mehta',
        date_of_birth: '1990-05-15',
        gender: 'male',
        phone: '+91-9876543210',
        avatar_url: null,
        role: 'patient',
        blood_group: 'B+',
        height_cm: 175.00,
        weight_kg: 72.50,
        known_allergies: '{Penicillin,Sulfa drugs}',
        chronic_conditions: '{Mild hypertension}',
        emergency_contact_name: 'Priya Mehta',
        emergency_contact_phone: '+91-9876543211',
        is_active: true,
        is_email_verified: true,
        last_login_at: now,
        created_at: twoMonthsAgo,
        updated_at: now,
      },
      {
        id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        email: 'priya@docbridge.health',
        password_hash: passwordHash,
        first_name: 'Priya',
        last_name: 'Mehta',
        date_of_birth: '1992-08-22',
        gender: 'female',
        phone: '+91-9876543211',
        avatar_url: null,
        role: 'patient',
        blood_group: 'O+',
        height_cm: 162.00,
        weight_kg: 58.00,
        known_allergies: '{}',
        chronic_conditions: '{}',
        emergency_contact_name: 'Arjun Mehta',
        emergency_contact_phone: '+91-9876543210',
        is_active: true,
        is_email_verified: true,
        last_login_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        created_at: twoMonthsAgo,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
