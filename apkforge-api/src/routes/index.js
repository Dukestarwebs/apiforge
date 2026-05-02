const router = require('express').Router();
router.use('/auth',         require('./auth'));
router.use('/build',        require('./build'));
router.use('/builds',       require('./builds'));
router.use('/credits',      require('./credits'));
router.use('/keys',         require('./keys'));
router.use('/subscription', require('./subscription'));
router.use('/user',         require('./user'));
router.use('/keystore',     require('./keystore'));
router.use('/webhooks',     require('./webhook'));
// Cron job endpoints (called by Vercel cron)
router.use('/jobs',         require('./jobs'));
module.exports = router;
