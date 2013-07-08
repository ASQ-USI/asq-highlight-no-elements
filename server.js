var express = require('express')
, main = require('./routes/main')
, app = express()
, path = require('path');

mongoose = require('mongoose');
db = mongoose.createConnection('localhost', 'challenge');
schemas = require('./models/models.js');


app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
    
});

app.get('/', main.questions);
app.post('/', main.submit);




app.listen(3000, function(){
  console.log("Express server listening on port 3000");
});