var mongoose= require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
    
var HighlightAnswer = new Schema({
	text: { type: String},
	task: { type: String},
	indexes: {type: Array, default: []}
});

mongoose.model('HighlightAnswer', HighlightAnswer);

