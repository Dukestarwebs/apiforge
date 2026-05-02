const morgan = require('morgan');
const logger  = morgan('[:date[iso]] :method :url :status :res[content-length] - :response-time ms');
module.exports = logger;
