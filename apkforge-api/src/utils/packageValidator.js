const isValidPackageName = (name) => /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/.test(name);
module.exports = { isValidPackageName };
