//Dependendencies: jquery

//MARGARITA: you should document the funtions and methods like here:
//http://www.2ality.com/2011/08/jsdoc-intro.html
// You don't neet to generate the files

var Highlight = (function(){
//MARGARITA: more about strict mode here:
//A nice presentation about the strict mode in javascript and what to take into consideration when using it
//URL(video):https://www.youtube.com/watch?v=gq95_h-IrHo
//URL(presentation in HTML): http://geelen.github.io/web-directions-talk/
"use strict";

  /* Private vars and functions */

  var Range = ace.require('ace/range').Range;

  var minimum = function (pos1, pos2) {
    if (pos1.row == pos2.row){
      return pos1.column <= pos2.column ? pos1 : pos2;
    }

    return pos1.row < pos2.row ? pos1 : pos2;
  }

  var maximum = function (pos1, pos2) {

    if (pos1.row == pos2.row){
      return pos1.column >= pos2.column ? pos1 : pos2;
    }

    return pos1.row > pos2.row ? pos1 : pos2;
  }

  /**
   * Creates an instance of Highlight.
   *
   * @constructor
   * @this {Highlight}
   * @param {Object} options Options for the highlighting.
   */
  var Highlight = function(options){
    this.defaultOptions = {
      text: "editor",
      lang: "javascript",
    };
    this.settings = $.extend({}, this.defaultOptions, options)
    this.$ranges = null;
    this.aceEditSession=null;
    this.selectionColor = "hexff0000";
    this.oldRange = null;
    this.oldstart = null;
    this.lastMarker = null;
  }

  /**
  * Initialization function. Should be called when the DOM
  * is ready, or when the window is loaded. 
  * 
  */
  Highlight.prototype.init = function(){

    var self=this;
    this.$ranges = $("#rangestext");


    //setup Color picker plugin
    $('.simple_color').simpleColor({
     cellWidth: 20,
     boxWidth: 20,
     border: '1px solid #000',
     cellHeight: 20,
     columns: 4,
     colors: ["ff0000", "0000ff", "00ff00", "ffffff"],
     onSelect: function (hex) {
       self.selectionColor = "hex" + hex;
     }
    });

    ///setup ace editor
    var aceeditor = ace.edit(this.settings.text);
    aceeditor.setReadOnly(true);

    this.aceEditSession = aceeditor.getSession()
    this.aceEditSession.setMode("ace/mode/"+this.settings.lang.toLowerCase());

    //bind the 'this' keyword to the this.onChangeSelection function
    var onChangeSelection = this.onChangeSelection.bind(this)
    //handle selection events
    this.aceEditSession.selection.on('changeSelection', function (e) {
     setTimeout(onChangeSelection, 5)
    });
  }


  /**
  * Adds a new Marker to the aceEditSession
  * 
  */
  Highlight.prototype.addMarker = function (markRange, clazz) {
     return this.aceEditSession.addMarker(markRange, clazz, "text", false);
    }


  /**
  * Handles changeSelection events
  * 
  */
  Highlight.prototype.onChangeSelection = function() {
   if (this.aceEditSession.selection.isEmpty()) return;

   this.selectionColor == "hexffffff" ?  this.eraseChange() : this.highlightChange()
   console.log(this.aceEditSession.getMarkers());
  }

  /**
  * Adds a new Marker to the aceEditSession
  * 
  */
  Highlight.prototype.highlightChange = function(){
    var selRange = this.aceEditSession.selection.getRange()
      , oldColor = this.selectionColor
      , currentstart = this.aceEditSession.selection.getSelectionAnchor();

    if (this.oldstart != null) {
         if (currentstart.row == this.oldstart.row && currentstart.column == this.oldstart.column && oldColor == this.selectionColor ) {
              this.aceEditSession.removeMarker(this.lastMarker);
              console.log("lstaMarker: " + this.lastMarker)
              $("#option"+this.lastMarker).remove();
         }
    }
    var markRange = new Range(selRange.start.row, selRange.start.column, selRange.end.row, selRange.end.column);
    this.oldstart = this.aceEditSession.selection.getSelectionAnchor();
    this.oldRange = markRange;
    this.lastMarker = this.addMarker(markRange, "ace_highlight " + this.selectionColor);
    var markers = this.aceEditSession.getMarkers();
    this.$ranges.append(this.printMarker(markers[this.lastMarker], this.lastMarker));     
  }


  /**
  * Erases Markers
  * 
  */
  Highlight.prototype.eraseChange = function(){
    var selRange = this.aceEditSession.selection.getRange() 
      , markers = this.aceEditSession.getMarkers()
      , dehigh = null;

    for (var key in markers) {
      var marker = markers[key]
      , mRange = marker.range
      console.log("marker0: " + marker)
      if (marker.type == "text" && key != 2) {
        dehigh = selRange;
        var currentstart = this.aceEditSession.selection.getSelectionAnchor();
        if (currentstart.row == this.oldstart.row && currentstart.column == this.oldstart.column) {
         dehigh = this.rangeMinus(this.oldRange, dehigh);
        }
        var rangeIncludes = this.includes2(marker.range, dehigh);

        switch (rangeIncludes){
          case 1:
            if (dehigh.end.row != mRange.end.row || dehigh.end.column != mRange.end.column) {
              var markRange = new Range(dehigh.end.row, dehigh.end.column, mRange.end.row, mRange.end.column);
              var marker1 = this.addMarker(markRange, marker.clazz);
              this.$ranges.append(this.printMarker(markers[marker1], marker1));     
            }
            break;

          case 2:
            if (mRange.start.row!=dehigh.start.row || mRange.start.column != dehigh.start.column) {
              var markRange = new Range(mRange.start.row, mRange.start.column, dehigh.start.row, dehigh.start.column);
              var marker1 = this.addMarker(markRange, marker.clazz);
              this.$ranges.append(this.printMarker(markers[marker1], marker1));
            }
            break;

          case 3:
          if (mRange.start.row!=dehigh.start.row || mRange.start.column != dehigh.start.column) {
            var markRange1 = new Range(mRange.start.row, mRange.start.column, dehigh.start.row, dehigh.start.column);
            var marker1 = this.addMarker(markRange1, marker.clazz);
            this.$ranges.append(this.printMarker(markers[marker1], marker1));
          }
          if (dehigh.end.row!=mRange.end.row || dehigh.end.column!= mRange.end.column) {
            var markRange2 = new Range(dehigh.end.row, dehigh.end.column, mRange.end.row, mRange.end.column);
            var marker2 = this.addMarker(markRange2, marker.clazz);
            this.$ranges.append(this.printMarker(markers[marker2], marker2));
          }
          break;
        }
        this.aceEditSession.removeMarker(key);
        $("#option"+key).remove();
      
      }
    }

    var markRange = new Range(selRange.start.row, selRange.start.column, selRange.end.row, selRange.end.column);
    this.oldstart = this.aceEditSession.selection.getSelectionAnchor();
    this.oldRange = markRange;
  }

  /**
  * Checks if ranges 1 includes range 2
  * @param {Ace.Range} range1
  * @param {Ace.Range} range2
  * @returns {Number} <tt>0</tt>: range1 is a superset of range2 
  * <tt>1</tt>: range1 and range2 start at the same character index 
  * <tt>2</tt>: range1 and range2 end at the same character index 
  * <tt>3</tt>: range1 is disjoint form range2
  * <tt>4</tt>: range1 overlaps with range2 but it's not a superset of it
  */
  Highlight.prototype.includes = function (range1, range2) {

    //range1 is a superset of range2
    var isSuperSet = range1.start.row <= range2.start.row 
      && range1.start.column <= range2.start.column
      && range1.end.row >= range2.end.row 
      && range1.end.column >= range2.end.column;

    if (isSuperSet) return 3;

    //range1 is disjoint with range2
    //disjoint case 1
    var isDisJoint1 = range1.start.row < range2.start.row 
      && (range1.end.row < range2.start.row 
          || (range1.end.row == range2.start.row && range1.end.column < range2.start.column )
          );

    //disjoint case 2
    var isDisJoint2 = range1.start.row == range2.start.row 
      && range1.start.column < range2.start.column 
      && (range1.end.row == range1.start.row && range1.end.column < range2.start.column );
    
    //disjoint case 3
    var isDisJoint3 = range1.start.row == range2.start.row 
      && range1.start.column > range2.start.column 
      && (range2.end.row == range2.start.row && range2.end.column < range1.start.column );

    //disjoint case 4
    var isDisJoint4 = range1.start.row > range2.start.row 
      && (range1.start.row > range2.end.row 
          || (range1.start.row == range2.end.row && range1.start.column > range2.end.column )
          );

    if (isDisJoint1 || isDisJoint2 || isDisJoint3 || isDisJoint4) return 0;

    //range1 starts at the same character as range2
    var isSameStart = range1.start.row == range2.start.row 
      && range1.start.column == range2.start.column

    if (isSameStart) return 1; 

    //range1 finishes at the same character as range2
    var isSameEnd = range1.end.row == range2.end.row 
      && range1.end.column == range2.end.column 

    if (isSameEnd) return 2;

    //Just overlapping
    return 4;
  }

  /**
  * Checks if ranges 1 includes range 2
  * @param {Ace.Range} range1
  * @param {Ace.Range} range2
  * @returns {Number} <tt>0</tt>: range1 is a superset of range2 
  * <tt>1</tt>: range1 and range2 start at the same character index 
  * <tt>2</tt>: range1 and range2 end at the same character index 
  * <tt>3</tt>: range1 is disjoint form range2
  * <tt>4</tt>: range1 overlaps with range2 but it's not a superset of it
  */
  Highlight.prototype.includes2 = function (range1, range2) {

    /* In order to avoid lots of "ifs" we use the following method:
    * We reduce the dimensions of the start end end properties to 1.
    * in order to do that, we assign maxC to be the largerst column + 1.
    * we assume that each row has at most maxC characters. 
    * Then we assign the start and end scores for each range, where
    * score = (number_of_rows * maxC) + curent_row_column 
    */


    // Max character per line so that our math work out
    var maxC = Math.max(range1.start.column , range1.end.column,
                                   range2.start.column, range2.end.column) + 1; 

    var r1 = {
      start: range1.start.row*maxC + range1.start.column,
      end: range1.end.row*maxC + range1.end.column
    },

    r2 = {
      start: range2.start.row*maxC + range2.start.column,
      end: range2.end.row*maxC + range2.end.column
    }

    //range1 is a superset of range2
    if(r1.start <= r2.start && r1.end >= r2.end) return 3;

    //range1 is disjoint range2
    if (r1.start > r2.end || r2.start > r1.end) return 0;

    //range1 starts at the same character as range2
    if (r1.start == r2.start) return 1;

    //range1 finishes at the same character as range2
    if (r1.end == r2.end) return 2;

    //Just overlapping
    return 4;
  }



Highlight.prototype.includesOld = function (range1, range2) {

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
   



  Highlight.prototype.rangeMinus = function(range1, range2) {
    var resultstart, resultend;
    //MARGARITA: vars resultstart, resultend and result were globals because you had no
    // "var" keyword before them. Also, and this is a common pattern, if you have common
    // pieces of code at the end of conditional clauses you just put on instance of this common
    // piece of code outside the conditional clauses. Like I did now at the return
    if ((range1.start.row == range2.start.row) && (range1.start.column == range2.start.column)) {
        resultstart = minimum(range1.end, range2.end);
        resultend = maximum(range1.end, range2.end);
        
    } else { //MARGARITA  do you need the if inside the else here?
        if ((range1.end.row == range2.end.row) && (range1.end.column == range2.end.column)) {
        resultstart = minimum(range1.start, range2.start);
        resultend = maximum(range1.start, range2.start);
        
        }
    }

    return new Range(resultstart.row, resultstart.column,
                     resultend.row, resultend.column);
  }

  Highlight.prototype.printMarker = function(marker, id) {
    var result = "<option id=option" +id+ ">Range (From: [row: " 
        + marker.range.start.row + ", col: "+ marker.range.start.column 
        + "], To: [row: " + marker.range.end.row + ", col: " 
        + marker.range.end.column + "])</option>"
    
    return result;
  }

  return Highlight;
})();

  window.onload = function () {

    var myHighlight =  new Highlight({
      text: "editor",
      lang: "java",
    });
    myHighlight.init();
   
  }
