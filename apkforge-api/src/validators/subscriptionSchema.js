const { z } = require('zod');
const upgradeSchema = z.object({ plan: z.enum(['starter','builder','pro','agency']), customerPhone: z.string().min(10) });
module.exports = { upgradeSchema };
