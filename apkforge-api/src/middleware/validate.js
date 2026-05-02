const { error } = require('../utils/apiResponse');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const messages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    return error(res, `Validation failed: ${messages}`, 400, 'INVALID_REQUEST');
  }
  req.body = result.data;
  next();
};

module.exports = validate;
