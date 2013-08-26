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
 // returns 0 if range2 is outside range1, 1 if range2 
 // is at the left most border of range1, 2 if its at the
 // rightmost border of range1, 3 if it's inside range 1

 function includes(range1, range2) {
   if (range1.start.row < range2.start.row) {
     if (range1.end.row > range2.end.row) {
       return 3;
     } else {
       if (range1.end.row == range2.end.row) {
         if (range1.end.column == range2.end.column) {
           return 2;
         } else {
           if (range1.end.column > range2.end.column) {
             return 3;
           } else {
             return 0;
           }
         }
       } else {
         return 0;
       }
     }
   } else {
     if (range1.start.row == range2.start.row) {
       if (range1.start.column < range2.start.column) {
         if (range1.end.row > range2.end.row) {
           return 3;
         } else {
           if (range1.end.row == range2.end.row) {
             if (range1.end.column == range2.end.column) {
               return 2;
             } else {

               if (range1.end.column > range2.end.column) {

                 return 3;
               } else {
                 return 0;
               }
             }
           } else {
             return 0;
           }
         }
       } else {
         if (range1.start.column == range2.start.column) {
           if (range1.end.row > range2.end.row) {
             return 1;
           } else {
             if (range1.end.row == range2.end.row) {
               if (range1.end.column == range2.end.column) {
                 return 3;
               } else {
                 if (range1.end.column > range2.end.column) {
                   return 1;
                 } else {
                   return 0;
                 }
               }
             } else {
               return 0;
             }
           }
         } else {
           return 0;
         }

       }
     } else {
       return 0;
     }
   }
 }

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
     onSelect: function (hex) {
       selectionColor = "hex" + hex;
     }
   });

   ///ACE EDITOR

   var aceeditor = ace.edit("editor");
   aceeditor.setReadOnly(true);
   aceeditor.getSession().setMode("ace/mode/java");

   var maybeempty = 0,
     Range = ace.require('ace/range').Range,
     aceEditSession = aceeditor.getSession(),
     removed = false,
     oldstart = null,
     lastMarker = null,
     dehigh = null;

   //handle selection events
   aceEditSession.selection.on('changeSelection', function (e) {
     setTimeout(onChangeSelection, 5)
   });

   function onChangeSelection() {
     var selRange = aceEditSession.selection.getRange();
     if (aceEditSession.selection.isEmpty()) {
       return;
     }
     var markers = aceEditSession.getMarkers();
     console.log(markers);
     for (var marker in markers) {
       if (markers[marker].type == "text" && marker != 2) {
         var markerRange = markers[marker].range;

         dehigh = selRange;
         var currentstart = aceEditSession.selection.getSelectionAnchor();
         if (currentstart.row == oldstart.row && currentstart.column == oldstart.column) {
           if (aceEditSession.selection.isBackwards()) {
             dehigh = new Range(selRange.start.row, selRange.start.column, aceEditSession.selection.getSelectionLead().row, aceEditSession.selection.getSelectionLead().column);
           } else {
             dehigh = new Range(aceEditSession.selection.getSelectionLead().row, aceEditSession.selection.getSelectionLead().column, selRange.end.row, selRange.end.column);

           }
         }
         var rangeIncludes = includes(markers[marker].range, dehigh);
         if (rangeIncludes == 1) {
           //console.log(selRange.end.row, selRange.end.column, markers[marker].range.end.row, markers[marker].range.end.column);
           var markRange = new Range(dehigh.end.row, dehigh.end.column, markers[marker].range.end.row, markers[marker].range.end.column);
           aceEditSession.removeMarker(marker);
           var newMarker = aceEditSession.addMarker(markRange, "ace_highlight " + selectionColor, "text", false);
           removed = true;
           oldstart = aceEditSession.selection.getSelectionAnchor();
         }
         if (rangeIncludes == 2) {
           var markRange = new Range(markers[marker].range.start.row, markers[marker].range.start.column, dehigh.start.row, dehigh.start.column);
           aceEditSession.removeMarker(marker);
           var newMarker = aceEditSession.addMarker(markRange, "ace_highlight " + selectionColor, "text", false);
           removed = true;
         }
         if (rangeIncludes == 3) {
           var markRange1 = new Range(markers[marker].range.start.row, markers[marker].range.start.column, dehigh.start.row, dehigh.start.column);
           var markRange2 = new Range(dehigh.end.row, dehigh.end.column, markers[marker].range.end.row, markers[marker].range.end.column);
           aceEditSession.removeMarker(marker);
           var newMarker1 = aceEditSession.addMarker(markRange1, "ace_highlight " + selectionColor, "text", false);
           var newMarker2 = aceEditSession.addMarker(markRange2, "ace_highlight " + selectionColor, "text", false);
           removed = true;
         }
       }
     }
     if (!removed) {
       var currentstart = aceEditSession.selection.getSelectionAnchor();
       if (oldstart != null) {
         if (currentstart.row == oldstart.row && currentstart.column == oldstart.column) {
           aceEditSession.removeMarker(lastMarker);
         }
       }

       var markRange = new Range(selRange.start.row, selRange.start.column, selRange.end.row, selRange.end.column);
       lastMarker = aceEditSession.addMarker(markRange, "ace_highlight " + selectionColor, "text", false);
       oldstart = aceEditSession.selection.getSelectionAnchor();
     }

     removed = false;
     console.log(" ");
   }




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

 function CodeHighlightOn(elem, id) {
   var target = document.getElementById(id);
   if (null != target) {
     elem.cacheClassElem = elem.className;
     elem.cacheClassTarget = target.className;
     target.className = "code-highlighted";
     elem.className = "code-highlighted";
   }
 }

 function CodeHighlightOff(elem, id) {
   var target = document.getElementById(id);
   if (elem.cacheClassElem)
     elem.className = elem.cacheClassElem;
   if (elem.cacheClassTarget)
     target.className = elem.cacheClassTarget;
 }