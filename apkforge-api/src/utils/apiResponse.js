const success  = (res, data = {}, status = 200) => res.status(status).json({ success: true,  ...data });
const error    = (res, message, status = 400, code = null) => {
  const body = { success: false, error: message };
  if (code) body.code = code;
  return res.status(status).json(body);
};
const paginate = (res, data, total, page, limit) =>
  res.status(200).json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
module.exports = { success, error, paginate };
