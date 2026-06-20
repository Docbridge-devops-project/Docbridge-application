const User = require('./User');
const RefreshToken = require('./RefreshToken');

User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { User, RefreshToken };
