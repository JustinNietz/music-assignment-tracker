'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL ||  'mongodb://JustinNietz1:trumpet1@ds115762.mlab.com:15762/music-form-login-assignments';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||  'mongodb://JustinNietz1:trumpet1@ds115762.mlab.com:15762/music-form-login-assignments';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
