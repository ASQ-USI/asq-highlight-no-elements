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
      
      ///CODEMIRROR
      var codeMirrorTextArea = document.getElementById("myTextArea");
      var codeMirrorEditor = CodeMirror.fromTextArea(codeMirrorTextArea, {
       lineNumbers: true,
        matchBrackets: true,
        mode: "text/x-java",
     readOnly: true
      });
      
      
      /// SIMPLE COLOR
      
      var selectionColor = "hexff0000";
      
      $('.simple_color').simpleColor({
          cellWidth: 20,
          boxWidth: 20,
          border: '0px solid #fff',
          cellHeight: 20,
          columns: 3,
          colors: ["ff0000", "0000ff", "00ff00"],
          onSelect: function(hex) {
               selectionColor = "hex"+hex;
          }
     });
      
      ///ACE EDITOR
      
      var aceeditor = ace.edit("editor");
      aceeditor.setReadOnly(true);
      aceeditor.getSession().setMode("ace/mode/java");
      
      var maybeempty = 0
      , Range = ace.require('ace/range').Range
      , aceEditSession =  aceeditor.getSession()
      , removed = false
      , oldstart = null
      , oldend = null
      , lastMarker = null;

      //handle selection events
      aceEditSession.selection.on('changeSelection', function(e) {
          
          var selRange = aceEditSession.selection.getRange();

        setTimeout(function(){
          if (aceEditSession.selection.isEmpty()) {return;}
          var markers = aceEditSession.getMarkers();
          console.log(markers);
          for (var marker in markers) {
               if (markers[marker].type == "text" && marker != 2) {
                    
                    if (markers[marker].range.start.row == selRange.start.row && markers[marker].range.start.column == selRange.start.column && markers[marker].range.end.row == selRange.end.row && markers[marker].range.end.column == selRange.end.column) {
                         console.log(markers[marker].range.start, markers[marker].range.end);
                         console.log(selRange.start, selRange.end);
                         aceEditSession.removeMarker(marker);
                         console.log(marker);
                         removed = true;
                         console.log("found");
                         
                    }
               }
          }
          if (!removed) {
               var currentstart = aceEditSession.selection.getSelectionAnchor();
               if (oldstart!= null) {
                    if (currentstart.row == oldstart.row && currentstart.column == oldstart.column) {
                    aceEditSession.removeMarker(lastMarker);
                    console.log("continuing");
               }
               }
               
               var markRange = new Range(selRange.start.row,selRange.start.column,selRange.end.row,selRange.end.column);
               lastMarker = aceEditSession.addMarker(markRange,"ace_highlight "+selectionColor, "text", false);
               oldstart = aceEditSession.selection.getSelectionAnchor();
          }
             
          removed = false;
          console.log(" ");
        },5)
        
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