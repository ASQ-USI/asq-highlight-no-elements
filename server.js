var express = require('express');
var main = require('./routes/main')
var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use("/styles", express.static(__dirname + '/styles'));
    
});

app.get('/', main.questions);




app.listen(3000);