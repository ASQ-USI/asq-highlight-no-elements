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
  
  var listElement = function(marker, preview, extended) {
     if (preview.length > 20 && !extended) {
          preview = preview.slice(0,20).concat("...");
     }
     var result = preview + '<div class="range-data">'
     + marker.range.start.row + ':' + marker.range.start.column
     + ' - ' + marker.range.end.row + ':' + marker.range.end.column + '</div>';
     
     return result;
  }

  var onToggleList = function($li, self){
    console.log("target", $li)
    var markers = self.aceEditSession.getMarkers()
      , index= parseInt($li.attr("id").slice(5))
      , marker = markers[index]
      , preview = self.aceEditSession.getTextRange(marker.range);

      // toggle list
      $li
        .toggleClass("collapsed")
        .toggleClass("expanded")
        .find("img")
          .attr("src", $li.hasClass("collapsed") ? "img/close.png" : "img/open.png")
          .end()
        .find('span')
          .html(listElement(markers[index],
                                 preview,
                                 $li.hasClass("expanded")));
        
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
    
  
    $("#rangestext")
      .on("click", ">li>a", function(){
         console.log("click")
        onToggleList($(event.target).parents("li").eq(0), self);
    })
      .on("dblclick", ">li", function(event){
          if ($(event.target)[0].tagName == 'LI') {
               onToggleList($(event.target), self);
          } else {
               onToggleList($(event.target).parents("li").eq(0), self);
          }
          
      })
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
      , markers = this.aceEditSession.getMarkers()
      , markRange = null
      , adjacent = false
      , start = {
          row: null,
          column: null
          }
      , end = {
          row: null,
          column: null
          }
     , toRemove = new Array()
      , oldColor = this.selectionColor
      , currentstart = this.aceEditSession.selection.getSelectionAnchor();

    if (this.oldstart != null) {
         if (currentstart.row == this.oldstart.row && currentstart.column == this.oldstart.column && oldColor == this.selectionColor ) {
              this.aceEditSession.removeMarker(this.lastMarker);
              $("#range"+this.lastMarker).remove();
         }
    }
    markRange = selRange;
    for (var key in markers) {
      var marker = markers[key]
      , mRange = marker.range
      if (marker.type == "text" && key != 2) {
          
          var rangeAdjacency = this.includes(mRange, markRange);
          if (rangeAdjacency == 5) {
               start.row = mRange.start.row;
               start.column = mRange.start.column;
               end.row = markRange.end.row;
               end.column = markRange.end.column;
               adjacent = true;
          }
          
          if (rangeAdjacency == 6) {
               start.row = markRange.start.row;
               start.column = markRange.start.column;
               end.row = mRange.end.row;
               end.column = mRange.end.column;
               adjacent = true;
  
          }
          if (adjacent) {
               toRemove.push(key);
               $("#range"+key).remove();
               
               markRange = new Range(start.row, start.column, end.row, end.column);
          }
      }
    }
    if (!adjacent) {
          markRange = new Range(selRange.start.row, selRange.start.column, selRange.end.row, selRange.end.column);
          this.oldstart = this.aceEditSession.selection.getSelectionAnchor();
          this.oldRange = markRange;
          this.lastMarker = this.addMarker(markRange, "ace_highlight " + this.selectionColor);
          var markers = this.aceEditSession.getMarkers();
          this.$ranges.append(this.printMarker(markers[this.lastMarker], this.lastMarker, false));
    } else {
          var clazz = null;
          for (var i = 0; i < toRemove.length; i++) {
               clazz = markers[toRemove[i]].clazz;
               this.aceEditSession.removeMarker(toRemove[i]);
          }
          var marker1 = this.addMarker(markRange, clazz);
          this.$ranges.append(this.printMarker(markers[marker1], marker1, false));
          this.oldstart = this.aceEditSession.selection.getSelectionAnchor();
          this.oldRange = markRange;
     
     
    }
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
        var rangeIncludes = this.includes(mRange, dehigh);
        switch (rangeIncludes){
          case 1:
               this.aceEditSession.removeMarker(key);
               $("#range"+key).remove();
            if (dehigh.end.row != mRange.end.row || dehigh.end.column != mRange.end.column) {
              var markRange = new Range(dehigh.end.row, dehigh.end.column, mRange.end.row, mRange.end.column);
              var marker1 = this.addMarker(markRange, marker.clazz);
              this.$ranges.append(this.printMarker(markers[marker1], marker1, false));     
            }
            break;

          case 2:
               this.aceEditSession.removeMarker(key);
               $("#range"+key).remove();
            if (mRange.start.row!=dehigh.start.row || mRange.start.column != dehigh.start.column) {
              var markRange = new Range(mRange.start.row, mRange.start.column, dehigh.start.row, dehigh.start.column);
              var marker1 = this.addMarker(markRange, marker.clazz);
              this.$ranges.append(this.printMarker(markers[marker1], marker1, false));
            }
            break;

          case 3:
               this.aceEditSession.removeMarker(key);
               $("#range"+key).remove();
          if (mRange.start.row!=dehigh.start.row || mRange.start.column != dehigh.start.column) {
            var markRange1 = new Range(mRange.start.row, mRange.start.column, dehigh.start.row, dehigh.start.column);
            var marker1 = this.addMarker(markRange1, marker.clazz);
            this.$ranges.append(this.printMarker(markers[marker1], marker1, false));
          }
          if (dehigh.end.row!=mRange.end.row || dehigh.end.column!= mRange.end.column) {
            var markRange2 = new Range(dehigh.end.row, dehigh.end.column, mRange.end.row, mRange.end.column);
            var marker2 = this.addMarker(markRange2, marker.clazz);
            this.$ranges.append(this.printMarker(markers[marker2], marker2, false));
          }
          break;
        }
        
      
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
  * <tt>5</tt>: range1 ends at the same character index where range2 starts
  * <tt>6</tt>: range1 starts at the same character index where range2 ends
  */
  Highlight.prototype.includes = function (range1, range2) {

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

    //range1 ends at the same character index where range2 starts
    if (r1.end == r2.start) return 5;
    
    //range1 starts at the same character index where range2 ends
    if(r1.start == r2.end) return 6;

    //Just overlapping
    return 4;
  }

  Highlight.prototype.consolidate = function (range1, range2) {
    //mark
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
        
        var preview = this.aceEditSession.getTextRange(marker.range);        
        var result = '<li class="collapsed" id=range' 
                      + id
                      + '> <a ><img src="img/close.png" alt="Toggle"></a>' 
                      + '<span>'
                      + listElement(marker, preview, false) 
                      + '</span>'
                      + '</li>';
    
    return result;
  }

  return Highlight;
})();

$(function(){
  var myHighlight =  new Highlight({
  text: "editor",
  lang: "java",
  });
  myHighlight.init();
})