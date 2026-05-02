const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const auth    = require('../middleware/auth');
const usersDb = require('../db/users');
const { success, error } = require('../utils/apiResponse');

// GET /user/profile
router.get('/profile', auth, async (req, res) => {
  try {
    if (req.isAdmin) return success(res, { user: { id:'admin', name:'Admin', email:'admin@apkforge.dev', plan:'agency', isAdmin:true } });
    const user = await usersDb.findById(req.user.id);
    return success(res, { user: { id:user.id, name:user.name, email:user.email, createdAt:user.created_at } });
  } catch (err) { return error(res, err.message, 500); }
});

// PUT /user/profile
router.put('/profile', auth, async (req, res) => {
  try {
    if (req.isAdmin) return error(res, 'Admin profile is managed via .env', 400);
    const { name, email, password } = req.body;
    const updates = {};
    if (name)     updates.name          = name;
    if (email)    updates.email         = email;
    if (password) updates.password_hash = await bcrypt.hash(password, 12);
    const updated = await usersDb.updateUser(req.user.id, updates);
    return success(res, { user: { id:updated.id, name:updated.name, email:updated.email } });
  } catch (err) { return error(res, err.message, 500); }
});

// DELETE /user/account
router.delete('/account', auth, async (req, res) => {
  try {
    if (req.isAdmin) return error(res, 'Admin account cannot be deleted', 400);
    await usersDb.deleteUser(req.user.id);
    return success(res, { message: 'Account deleted' });
  } catch (err) { return error(res, err.message, 500); }
});

module.exports = router;
