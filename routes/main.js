exports.questions = function(req, res) {
	var questions = new Array();
	var formstart = '<form>';
	var formend = '</form>';
	var submit = '<button type="submit" class="btn">Submit</button>';
	var textarea = '<textarea rows="3"></textarea><br>';
        var inputprependfirst = '<div class="input-prepend"><span class="add-on">';
	var inputprependsecond = '</span><input class="span2" id="prependedInput" type="text"></div><br>';
	questions.push("What values will be stored in the above three boolean variables?"+formstart+inputprependfirst+"equal"+inputprependsecond+inputprependfirst+"endAfterStart"+inputprependsecond+inputprependfirst+"endBeforeStart"+inputprependsecond+submit+formend);
	questions.push("Do we really need an <code>after</code> <b>and</b> a <code>before</code> method? Do we <b>want</b> both?"+formstart+textarea+submit+formend);
	
  res.render('page', {questions: questions });
}

