const Prescription = require('./Prescription');
const SideEffectLog = require('./SideEffectLog');

Prescription.hasMany(SideEffectLog, { foreignKey: 'prescription_id', as: 'sideEffects' });
SideEffectLog.belongsTo(Prescription, { foreignKey: 'prescription_id', as: 'prescription' });

module.exports = { Prescription, SideEffectLog };
