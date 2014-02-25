var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var groupSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  users: ['User'],
  count: {type: Number, default: 0},
  times: []
});

module.exports = mongoose.model('Group', groupSchema);
