'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const sixWeeksAgo = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const userId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

    await queryInterface.bulkInsert('lab_reports', [
      {
        id: 'e2000000-0000-0000-0000-000000000001',
        user_id: userId,
        consultation_id: 'c1000000-0000-0000-0000-000000000001',
        family_member_id: null,
        report_name: 'Complete Blood Count (CBC)',
        report_type: 'Hematology',
        lab_name: 'SRL Diagnostics, Koramangala',
        report_date: sixWeeksAgo.toISOString().split('T')[0],
        ordered_by_doctor: 'Dr. Sneha Kapoor',
        results: JSON.stringify([
          { test_name: 'Hemoglobin', value: 14.2, unit: 'g/dL', reference_range: '13.0 - 17.0', status: 'normal' },
          { test_name: 'WBC Count', value: 7800, unit: '/µL', reference_range: '4000 - 11000', status: 'normal' },
          { test_name: 'Platelet Count', value: 245000, unit: '/µL', reference_range: '150000 - 400000', status: 'normal' },
          { test_name: 'RBC Count', value: 5.1, unit: 'million/µL', reference_range: '4.5 - 5.5', status: 'normal' },
          { test_name: 'Hematocrit', value: 42.5, unit: '%', reference_range: '38.0 - 50.0', status: 'normal' },
        ]),
        flagged_values: '[]',
        overall_interpretation: 'All values within normal limits. No anemia, infection, or platelet abnormalities detected.',
        overall_interpretation_simplified: 'Great news! Your blood test results are all perfectly normal. Your red blood cells, white blood cells, and platelets are all in the healthy range. This means your blood is carrying oxygen well, your immune system looks good, and your blood clotting ability is normal.',
        ai_explanation: null,
        file_url: null,
        raw_text: null,
        status: 'final',
        created_at: sixWeeksAgo,
        updated_at: sixWeeksAgo,
      },
      {
        id: 'e2000000-0000-0000-0000-000000000002',
        user_id: userId,
        consultation_id: 'c1000000-0000-0000-0000-000000000002',
        family_member_id: null,
        report_name: 'Lipid Profile',
        report_type: 'Biochemistry',
        lab_name: 'SRL Diagnostics, Koramangala',
        report_date: oneMonthAgo.toISOString().split('T')[0],
        ordered_by_doctor: 'Dr. Rajesh Sharma',
        results: JSON.stringify([
          { test_name: 'Total Cholesterol', value: 218, unit: 'mg/dL', reference_range: '< 200', status: 'high' },
          { test_name: 'LDL Cholesterol', value: 142, unit: 'mg/dL', reference_range: '< 100', status: 'high' },
          { test_name: 'HDL Cholesterol', value: 48, unit: 'mg/dL', reference_range: '> 40', status: 'normal' },
          { test_name: 'Triglycerides', value: 165, unit: 'mg/dL', reference_range: '< 150', status: 'high' },
          { test_name: 'VLDL Cholesterol', value: 33, unit: 'mg/dL', reference_range: '< 30', status: 'high' },
        ]),
        flagged_values: JSON.stringify([
          { test_name: 'Total Cholesterol', value: 218, message: 'Slightly above the ideal level of 200' },
          { test_name: 'LDL Cholesterol', value: 142, message: 'Higher than optimal. LDL is the "bad" cholesterol that can build up in arteries.' },
          { test_name: 'Triglycerides', value: 165, message: 'Slightly elevated. Often linked to diet high in carbs and sugars.' },
        ]),
        overall_interpretation: 'Dyslipidemia with elevated LDL, total cholesterol, and triglycerides. HDL borderline acceptable. Lifestyle modifications recommended. Consider statin therapy if no improvement in 3 months.',
        overall_interpretation_simplified: 'Your cholesterol results show that some of your fat levels in the blood are higher than ideal. Think of it like too much grease in a pipe — over time it can narrow the pipes. The good news: this is very common and can usually be improved with diet changes, exercise, and sometimes medicine.',
        ai_explanation: null,
        file_url: null,
        raw_text: null,
        status: 'final',
        created_at: oneMonthAgo,
        updated_at: oneMonthAgo,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('lab_reports', null, {});
  },
};
