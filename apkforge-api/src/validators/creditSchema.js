const { z } = require('zod');
const purchaseSchema = z.object({ packId: z.enum(['starter_pack','builder_pack','pro_pack','studio_pack']), customerPhone: z.string().min(10) });
module.exports = { purchaseSchema };
