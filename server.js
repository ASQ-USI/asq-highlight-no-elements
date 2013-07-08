var express = require('express');
var main = require('./routes/main')
var app = express();

mongoose = require('mongoose');
db = mongoose.createConnection('localhost', 'challenge');
schemas = require('./models/models.js');


app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.use(express.bodyParser());
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use("/styles", express.static(__dirname + '/styles'));
    app.use("/codemirror", express.static(__dirname + '/codemirror'));
    app.use("/ace", express.static(__dirname + '/ace'));
    
});

app.get('/', main.questions);
app.post('/', main.submit);




app.listen(3000);