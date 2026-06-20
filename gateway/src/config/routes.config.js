const env = require('./environment');

const routesConfig = [
  {
    path: '/api/v1/auth',
    target: env.AUTH_SERVICE_URL,
    pathRewrite: { '^/api/v1/auth': '/api/v1/auth' },
    public: true,
  },
  {
    path: '/api/v1/consultations',
    target: env.CONSULTATION_SERVICE_URL,
    pathRewrite: { '^/api/v1/consultations': '/api/v1/consultations' },
    public: false,
  },
  {
    path: '/api/v1/prescriptions',
    target: env.PRESCRIPTION_SERVICE_URL,
    pathRewrite: { '^/api/v1/prescriptions': '/api/v1/prescriptions' },
    public: false,
  },
  {
    path: '/api/v1/reminders',
    target: env.REMINDER_SERVICE_URL,
    pathRewrite: { '^/api/v1/reminders': '/api/v1/reminders' },
    public: false,
  },
  {
    path: '/api/v1/lab-reports',
    target: env.LABREPORT_SERVICE_URL,
    pathRewrite: { '^/api/v1/lab-reports': '/api/v1/lab-reports' },
    public: false,
  },
  {
    path: '/api/v1/symptoms',
    target: env.SYMPTOM_SERVICE_URL,
    pathRewrite: { '^/api/v1/symptoms': '/api/v1/symptoms' },
    public: false,
  },
  {
    path: '/api/v1/ai',
    target: env.AI_COMPANION_SERVICE_URL,
    pathRewrite: { '^/api/v1/ai': '/api/v1/ai' },
    public: false,
  },
  {
    path: '/api/v1/health-summary',
    target: env.HEALTH_SUMMARY_SERVICE_URL,
    pathRewrite: { '^/api/v1/health-summary': '/api/v1/health-summary' },
    public: false,
  },
  {
    path: '/api/v1/family',
    target: env.FAMILY_SERVICE_URL,
    pathRewrite: { '^/api/v1/family': '/api/v1/family' },
    public: false,
  },
];

module.exports = routesConfig;
