 // function formIntercept() {
 //      var editor = $('#myTextArea').data('CodeMirrorInstance');
 //      var markers = editor.getAllMarks();
 //      var toJson = new Array();
 //      for (var i = 0; i < markers.length; i++) {
 //      toJson.push(markers[i].find());
 //      }
 //      var finalSend = new Array();
 //      finalSend.push(editor.getValue());
 //      finalSend.push(toJson);
 //      document.getElementById("submitform").elements["hidden"].value = JSON.stringify(finalSend);
 //      }
 window.onload = function () {
      
      /// CLEAN ME UP - WATCH FOR CONFLICTS
      var myTextArea = document.getElementById("myTextArea");
      
      

      var editor = CodeMirror.fromTextArea(myTextArea, {
       lineNumbers: true,
        matchBrackets: true,
        mode: "text/x-java",
  readOnly: true
      });
      $('#myTextArea').data('CodeMirrorInstance', editor);
      
      
      var aceeditor = ace.edit("editor");
      aceeditor.setReadOnly(true);
      aceeditor.getSession().setMode("ace/mode/java");
      
      var Range = ace.require('ace/range').Range
      , aceEditSession =  aceeditor.getSession()

      //handle selection events
      aceEditSession.selection.on('changeCursor', function(e) {
          console.log(aceEditSession.selection.isEmpty());
          
          if (!aceEditSession.selection.isEmpty()) {
               //get selection range
               //var selRange = aceEditSession.selection.getRange()
               //convert range to range!!!
               //, markRange = new Range(selRange.start.row,selRange.start.column,selRange.end.row,selRange.end.column)
        
               //add new marker with class "ace_highlight" and "blue"
               //aceEditSession.addMarker(markRange,"ace_highlight blue", "text", false);
               //console.log(aceEditSession.getMarkers());
          }
        
     });      
      
      
      
      
      // document.getElementById("clear").onclick = function() {
      // var markers = editor.getAllMarks();
      // for (var i = 0; i < markers.length; i++) {
      // markers[i].clear();
      // }
 
      // }
      
      // $('.color').click(function() {
      // colorclass = $(this).attr("id");
      // console.log(colorclass);
      // });

      
      // var oldstart = ({line: 0, ch: 0});
      // var oldend = ({line: 0, ch: 0});
      
      // var colorclass = "red";
      
      // editor.on("cursorActivity", function() {
      // var markerscursor = editor.findMarksAt(editor.getCursor("start"));
      // var existsmarker = false;
      // if (markerscursor.length >0) {
      // if (editor.somethingSelected()) {
      
      // for (var i = 0; i< markerscursor.length; i++) {
      //       if (markerscursor[i].className == colorclass) {
      //       existsmarker = true;
      //       var start = markerscursor[i].find().from;
      //       var end = markerscursor[i].find().to;
      //       markerscursor[i].clear();
      //       editor.markText(start,editor.getCursor("start"), {className: colorclass});
      //       editor.markText(editor.getCursor("end"), end ,{className: colorclass});
      //       }
      // }
      // }
      // }
      
      // if (!existsmarker) {
      // if (oldstart.line == editor.getCursor("start").line && oldstart.ch == editor.getCursor("start").ch && editor.somethingSelected()) {
      // oldend = editor.getCursor("end");
      // } else {
      
      // if (oldend.line == editor.getCursor("end").line && oldend.ch == editor.getCursor("end").ch && editor.somethingSelected()) {
      //       oldstart = editor.getCursor("start");
      // } else {
            
      //       editor.markText(oldstart, oldend, {className: colorclass});
      //       oldstart = editor.getCursor("start");
      //       oldend = editor.getCursor("end"); 
      // }
      // }  
      // }
      // console.log(editor.getAllMarks());
      
      // });

 }
      
 function CodeHighlightOn(elem, id)
 {
   var target = document.getElementById(id);
   if(null != target) {
     elem.cacheClassElem = elem.className;
     elem.cacheClassTarget = target.className;
     target.className = "code-highlighted";
     elem.className   = "code-highlighted";
   }
 }
 function CodeHighlightOff(elem, id)
 {
   var target = document.getElementById(id);
   if(elem.cacheClassElem)
     elem.className = elem.cacheClassElem;
   if(elem.cacheClassTarget)
     target.className = elem.cacheClassTarget;
 }