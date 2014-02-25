var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var groupSchema = new mongoose.Schema({
	personOne: {type: Schema.ObjectId, ref:'User'},
	personTwo: {type: Schema.ObjectId, ref:'User'},
	scheduleTime: Date
});

module.exports = mongoose.model('Meeting', groupSchema);
