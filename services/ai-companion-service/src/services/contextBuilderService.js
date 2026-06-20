const NodeCache = require('node-cache');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

const cache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

async function fetchFromService(url, userId) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-user-id': userId,
        'x-user-email': 'internal-ai@docbridge.health',
        'x-user-role': 'patient',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      logger.error(`Error fetching from ${url}: Status ${response.status}`);
      return [];
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    logger.error(`Failed to fetch from ${url}: ${error.message}`);
    return [];
  }
}

async function buildUserContext(userId) {
  const cacheKey = `context_${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.debug(`Using cached health context for user ${userId}`);
    return cached;
  }

  logger.debug(`Building fresh health context for user ${userId}`);

  try {
    const consultationUrl = `${process.env.CONSULTATION_SERVICE_URL || 'http://consultation-service-svc:3002'}/api/v1/consultations?limit=5`;
    const prescriptionUrl = `${process.env.PRESCRIPTION_SERVICE_URL || 'http://prescription-service-svc:3003'}/api/v1/prescriptions/active`;
    const symptomUrl = `${process.env.SYMPTOM_SERVICE_URL || 'http://symptom-service-svc:3006'}/api/v1/symptoms/ongoing`;
    const labReportUrl = `${process.env.LABREPORT_SERVICE_URL || 'http://labreport-service-svc:3005'}/api/v1/lab-reports?limit=3`;
    const familyUrl = `${process.env.FAMILY_SERVICE_URL || 'http://family-service-svc:3009'}/api/v1/family`;

    const consultationsPromise = fetchFromService(consultationUrl, userId);
    const medicationsPromise = fetchFromService(prescriptionUrl, userId);
    const symptomsPromise = fetchFromService(symptomUrl, userId);
    const labReportsPromise = fetchFromService(labReportUrl, userId);
    const familyPromise = fetchFromService(familyUrl, userId);

    const userPromise = sequelize.query(
      `SELECT first_name, last_name, date_of_birth, gender, blood_group, known_allergies, chronic_conditions
       FROM users WHERE id = :userId`,
      { replacements: { userId }, raw: true }
    );

    const [consultations, medications, symptoms, labReports, familyMembers, [userInfo]] = await Promise.all([
      consultationsPromise,
      medicationsPromise,
      symptomsPromise,
      labReportsPromise,
      familyPromise,
      userPromise
    ]);

    const context = {
      user: Array.isArray(userInfo) ? userInfo[0] : userInfo,
      recentConsultations: Array.isArray(consultations) ? consultations : [],
      activeMedications: Array.isArray(medications) ? medications : [],
      ongoingSymptoms: Array.isArray(symptoms) ? symptoms : [],
      recentLabReports: Array.isArray(labReports) ? labReports : [],
      familyMembers: Array.isArray(familyMembers) ? familyMembers : [],
    };

    cache.set(cacheKey, context);
    return context;
  } catch (error) {
    logger.error('Error building user context:', { message: error.message });
    return { user: {}, recentConsultations: [], activeMedications: [], ongoingSymptoms: [], recentLabReports: [], familyMembers: [] };
  }
}

function invalidateCache(userId) {
  cache.del(`context_${userId}`);
}

module.exports = { buildUserContext, invalidateCache };
