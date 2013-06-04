var express = require('express');
var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use("/styles", express.static(__dirname + '/styles'));
    
});

app.get('/', function(req, res){
	var questions = new Array();
	questions.push("What values will be stored in the above three boolean variables?");
	questions.push("Do we really need an <code>after</code> <b>and</b> a <code>before</code> method? Do we <b>want</b> both?");
	
  res.render('page', {questions: questions });
});



app.listen(3000);