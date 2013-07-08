function hsvToRgb(h, s, v) {
	var r, g, b;
	var i;
	var f, p, q, t;
 
	// Make sure our arguments stay in-range
	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));
 
	// We accept saturation and value arguments from 0 to 100 because that's
	// how Photoshop represents those values. Internally, however, the
	// saturation and value are calculated from a range of 0 to 1. We make
	// That conversion here.
	s /= 100;
	v /= 100;
 
	if(s == 0) {
		// Achromatic (grey)
		r = g = b = v;
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
 
	h /= 60; // sector 0 to 5
	i = Math.floor(h);
	f = h - i; // factorial part of h
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));
 
	switch(i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
 
		case 1:
			r = q;
			g = v;
			b = p;
			break;
 
		case 2:
			r = p;
			g = v;
			b = t;
			break;
 
		case 3:
			r = p;
			g = q;
			b = v;
			break;
 
		case 4:
			r = t;
			g = p;
			b = v;
			break;
 
		default: // case 5:
			r = v;
			g = p;
			b = q;
	}
 
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function randomColors(total)
{
    var i = 360 / (total - 1); 
    var r = [];
    for (var x=0; x<total; x++)
    {
        r.push(hsvToRgb(i * x, 100, 100)); 
    }
    return r;
}


exports.questions = function(req, res) {
	var questions = new Array();
	var colors = 3;

	
	var clear = '<button  type="button" id="clear" class="btn">Clear</button>';
	var submit = '<button type="submit" id="submit" class="btn">Submit</button>';
	var buttonred = '<button type="button" id="red" class="btn color btn-danger span1">Red</button>';
	var buttonblue = '<button type="button" id="blue" class="btn color btn-primary span1">Blue</button>';
	var buttongreen = '<button type="button" id="green" class="btn color btn-success span1">Green</button><br>' ;
	var colorpalette = '<div class="row">'+buttonred+buttonblue+buttongreen+'</div>';
	var inputhighlight = '<input type="hidden" name="hidden"/>';
	var textarea = '<textarea id="myTextArea" rows="3">TimeStamp t1 = new TimeStamp(1);\nTimeStamp t2 = new TimeStamp(2);\nTimeStamp t3 = new TimeStamp(3);\nTimeStamp t4 = new TimeStamp(4);\nTimeStamp t5 = new TimeStamp(5);\nTimeStamp t6 = new TimeStamp(6);\nTimeStamp t7 = new TimeStamp(7);</textarea><br>';
        var inputprependfirst = '<div class="input-prepend"><span class="add-on">';
	var inputprependsecond = '</span><input class="span2" id="prependedInput" type="text"></div><br>';
	questions.push("What values will be stored in the above three boolean variables?"+inputprependfirst+"equal"+inputprependsecond+inputprependfirst+"endAfterStart"+inputprependsecond+inputprependfirst+"endBeforeStart"+inputprependsecond);
	//questions.push("Do we really need an <code>after</code> <b>and</b> a <code>before</code> method? Do we <b>want</b> both?"+formstart+textarea+submit+formend);
	questions.push("Highlight the variable names in the following code:<br>"+colorpalette+textarea+inputhighlight+submit+clear);
  res.render('page', {questions: questions});
}

exports.submit = function(req, res) {
	
	var highlightAnswer= db.model('HighlightAnswer', schemas.highlighSchema);
	var parsed = JSON.parse(req.body.hidden);
	var newAnswer = new highlightAnswer({
		text: parsed[0],
		task: "Highlight the variable names",
		indexes: parsed[1]
		
	});
	newAnswer.save();	
	console.log(newAnswer);
	var results = new Array();
	var markers = "";
	for (var i=0; i<newAnswer.indexes.length; i++) {
		markers = markers+"editor.markText({ line: "+newAnswer.indexes[i].from.line+", ch: "+newAnswer.indexes[i].from.ch +"},{line: "+newAnswer.indexes[i].to.line+", ch: "+newAnswer.indexes[i].to.ch+"}, {className: 'bg'});\n";
	}
	results.push('<textarea id="myTextArea" rows="3">'+newAnswer.text+'</textarea><br>');
	results.push(markers);
	res.render('result', {results: results});
}

