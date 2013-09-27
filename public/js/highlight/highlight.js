//Dependendencies: jquery

//MARGARITA: you should document the funtions and methods like here:
//http://www.2ality.com/2011/08/jsdoc-intro.html
// You don't neet to generate the files

var Highlight = (function(){
//MARGARITA: more about strict mode here:
//A nice presentation about the strict mode in javascript and what to take into consideration when using it
//URL(video):https://www.youtube.com/watch?v=gq95_h-IrHo
//URL(presentation in HTML): http://geelen.github.io/web-directions-talk/
'use strict';

  /* Private vars and functions */

  var Range = ace.require('ace/range').Range;
  var comparePoints = Range.comparePoints;

  function getSpectrumPalette(colors){
      var result = []
        , size = 4
        , bigAr=$.map(colors, function(v, k) {return [k];})

      for (var i=0; i<bigAr.length; i+=size) {
          result.push(bigAr.slice(i,i+size));
      }
      return result;
    }

  function minimum (pos1, pos2) {
    if (pos1.row == pos2.row){
      return pos1.column <= pos2.column ? pos1 : pos2;
    }

    return pos1.row < pos2.row ? pos1 : pos2;
  }

  function maximum (pos1, pos2) {

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
      el: 'editor',
      lang: 'javascript',
    };

    // editor
    this.MODE_HIGHLIGHT = 'modeHighlight';
    this.MODE_EDIT_TEXT = 'modeEditText';

    this.mode = '';

    //highlight modes
    this.HIGHLIGHT_COLOR = 'highlightColor';
    this.HIGHLIGHT_ERASE = 'highlightErase';

    this.highlightMode = this.HIGHLIGHT_COLOR;

    this.syntaxModes = [
      {file: 'coffee'    , name : 'CoffeeScript'},
      {file: 'c_cpp'     , name : 'C/C++'},
      {file: 'css'       , name : 'CSS'},
      {file: 'html'      , name : 'HTML'},
      {file: 'jade'      , name : 'Jade'},
      {file: 'java'      , name : 'Java'},
      {file: 'javascript', name : 'Javascript'},
      {file: 'json'      , name : 'JSON'},
      {file: 'less'      , name : 'LESS'},
      {file: 'php'       , name : 'PHP'},
      {file: 'python'    , name : 'Python'},
      {file: 'ruby'      , name : 'Ruby'},
      {file: 'sass'      , name : 'SASS'},
      {file: 'scss'      , name : 'SCSS'},
      {file: 'sql'       , name : 'SQL'},
      {file: 'xml'       , name : 'XML'},
      {file: 'yaml'      , name : 'YAML'}
    ];

    this.colors={
      'd9534f' :'bootstrapred',
      '428bca' : 'blue',
      '5cb85c' : 'green'
    }

    this.settings = $.extend({}, this.defaultOptions, options)
    this.$ranges = null;
    this.aceEditor = null;
    this.aceEditSession=null;
    this.selectionColor = '';
    this.oldRange = null;
    this.oldstart = null;
    this.lastMarker = null;

    this.rangeIdPrefix = 'he-range-item-'

  }
  
  //prototype methods

  ;(function(){

    /**
    * Initialization function. Should be called when the DOM
    * is ready, or when the window is loaded. 
    * 
    */
    this.init = function(){

      var self=this;
      this.clearSelectionBinded = this.clearSelection.bind(this);
      this.onChangeSelectionBinded = this.onChangeSelection.bind(this);
      
      ///setup ace editor
      this.aceEditor = ace.edit(this.settings.el);
      this.aceEditSession = this.aceEditor.getSession()
      this.aceEditSession.setMode('ace/mode/'+this.settings.lang.toLowerCase());

      this.setMode(this.MODE_HIGHLIGHT);
      this.initColorpicker();

      this.$ranges = $('.he-ranges').eq(0);
      
      //syntax dropdoown
      var modesObj = {
        syntaxModes:this.syntaxModes,
        currentMode:self.settings.lang.toLowerCase()
      }

      dust.render('syntaxModes', modesObj, function(err,out){
        if(err)console.log(err)
        $('.he-syntax-modes').html(out);
      })

      $('#syntaxSelect')
        .selectpicker()
        .on('change.he.syntax', function(event){
          var syntaxMode = $(this).find(':selected').val();
          self.aceEditSession.setMode('ace/mode/'+syntaxMode);
        });  

      //eraser button
      $('.he-eraser').on('click.he.eraser', function(event){
        self.setHighlightMode(self.HIGHLIGHT_ERASE)
      })

      //mode buttons
      $('.he-mode').on('click.he.mode', 'label', function(){
        var newMode = $(this).hasClass('he-edit-label') ?
                        self.MODE_EDIT_TEXT :  self.MODE_HIGHLIGHT;

        if(self.mode === newMode) return;
        self.setMode(newMode)
      })

    //init tooltip
    $('.he-toolbar').tooltip({
        selector: '[data-toggle=tooltip]',
        placement: 'bottom',
        trigger: 'hover',
        container: 'body',
        delay: { show: 1000, hide: 0 }
      })

    $('[data-toggle=tooltip]').on('show.bs.tooltip', function (bsevent) {
      $(bsevent.target).one('click',function(event){
        $(event.target).tooltip('hide')
      })
    })

    //ranges text
    $('.he-ranges')
      .on('click', '.he-code-toggle', function(event){
        event.preventDefault();
        $(event.target).parent('.list-group-item').toggleClass('expanded')
      })
      .on('dblclick', '.list-group-item', function(event){
        $(event.target).toggleClass('expanded')
      }); 
    }

    this.clearSelection = function(){
      this.aceEditSession.selection.clearSelection();
    }

    /**
    * merge specific color
    * 
    */
    this.mergeColor = function(color){
      var ranges = this.getHighlightRanges()
      , self=this;

      var removed = this.merge(ranges[color]);

        $.each(removed, function(){
          self.aceEditSession.removeMarker(this.id)
          $('#' + self.rangeIdPrefix + this.id).remove();
        });

        $.each(ranges[color], function(){
          var marker = self.aceEditSession.getMarkers()[this.id]
            , text = self.aceEditSession.getTextRange(marker.range);

          $('#' + self.rangeIdPrefix + this.id)
            .find('.he-highlighted-summary').html(text.truncate(30,'right','…'))
            .siblings('.he-highlighted-code').html(text);
        });
    }

    /**
    * merge all by color
    * 
    */
    this.mergeByColor = function(){
      var ranges = this.getHighlightRanges()

      for (var color in ranges){
        this.mergeColor(color);
      }
    }

    /**
    * merge overlapping ranges
    * 
    */
    this.merge = function(list) {
        var removed = [];
        
        list = list.sort(function(a, b) {
            return comparePoints(a.start, b.start);
        });
        
        var next = list[0], range;
        for (var i = 1; i < list.length; i++) {
            range = next;
            next = list[i];
            var cmp = comparePoints(range.end, next.start);
            if (cmp < 0)
                continue;

            if (cmp == 0 && !range.isEmpty() && !next.isEmpty())
                continue;

            if (comparePoints(range.end, next.end) < 0) {
                range.end.row = next.end.row;
                range.end.column = next.end.column;
            }

            list.splice(i, 1);
            removed.push(next);
            next = range;
            i--;
        }

        return removed;
    };


    /**
    * Set Editing or highlight mode
    * 
    */
    this.setMode = function (mode) {
      var isHighlight = ((this.mode = mode) == this.MODE_HIGHLIGHT);

      var handlerAction = isHighlight ? 'on':'off';

      this.aceEditor.setReadOnly(isHighlight);
      //this.aceEditor[handlerAction]('mouseup', this.clearSelectionBinded)
      this.aceEditSession
        .selection[handlerAction]('changeSelection', this.onChangeSelectionBinded)
    };

    /**
    * Set Coloring or Erasing mode
    * 
    */
    this.setHighlightMode = function (mode) {
      if (this.highlightMode == mode) return;
      var isColor = ((this.highlightMode = mode) == this.HIGHLIGHT_COLOR);

      if(isColor){
        $('.he-eraser')
          .removeClass('active')
      }else{
        $('.he-eraser')
          .addClass('active')
      }
    };

   /**
    * Re-instantiates colorPicker with the new palette
    * 
    */
    this.setColorPalette = function (colorPalette) {
     this.colors= colorPalette;
     this.initColorpicker(); 
    };

    this.initColorpicker = function () {
       if ($.isEmptyObject(this.colors)) return;

      var self = this
        , spectrumPallete = getSpectrumPalette(this.colors)
        , initColor = spectrumPallete[0][0];

      this.selectionColor = this.colors[initColor];

      $('.he-colorpicker').spectrum('destroy');

      $('.he-colorpicker').spectrum({
        showPaletteOnly: true,
        showPalette:true,
        palette: spectrumPallete,
        color: initColor,
        show: function(color) {

          self.setHighlightMode (self.HIGHLIGHT_COLOR);
        },
        change: function(color) {

          self.setHighlightMode (self.HIGHLIGHT_COLOR);
          self.selectionColor = self.colors[color.toHex()];
        }
      });
    };


   /**
    * Adds a new Marker to the aceEditSession
    * 
    */
    this.addMarker = function (markRange, clazz) {
     return this.aceEditSession.addMarker(markRange, clazz, 'text', false);
    }

    this.getHighlightMarkers = function (){
       //console.log(this.aceEditSession.getMarkers());
       return $.map(this.aceEditSession.getMarkers(), function(v,k){
        return v.clazz.indexOf("ace_highlight")!= -1? v : null
      });
    }

    this.getHighlightRanges = function (){
       var hMarkers = this.getHighlightMarkers()
        , hRanges = {};

       $.each(hMarkers, function(i,v){
        var colorStr =v.clazz
          , hclass="ace_highlight";

        //get color name
        colorStr = colorStr.substring((colorStr.indexOf(hclass)+ hclass.length +1),colorStr.length);
        if(! hRanges.hasOwnProperty(colorStr) ){
          hRanges[colorStr] = [];
        }
        hRanges[colorStr].push(v.range)
        
      });
      return hRanges;
    }


    /**
    * Handles changeSelection events
    * 
    */
    this.onChangeSelection = function(e) {
      setTimeout(function(e){
        if (this.aceEditSession.selection.isEmpty() 
          || $.isEmptyObject(this.colors)) return;
        
        this.highlightMode == this.HIGHLIGHT_COLOR ?   this.highlightChange() : this.eraseChange();
        //console.log(this.aceEditSession.getMarkers());
      }.bind(this,e), 1)

    }

    this.highlightChange = function(){
      var selRange = this.aceEditSession.selection.getRange()
        , markers = this.aceEditSession.getMarkers();

      this.lastMarker = this.addMarker(selRange, 'ace_highlight ' + this.selectionColor);
      selRange.id = this.lastMarker;
      this.addRangeItem(markers[this.lastMarker], this.lastMarker, this.selectionColor);
      this.mergeColor(this.selectionColor);
    }


    /**
    * Adds a new Marker to the aceEditSession
    * 
    */
    // this.highlightChange = function(){
    //   console.log(this.aceEditSession.getMarkers())
    //   var selRange = this.aceEditSession.selection.getRange()
    //     , markers = this.aceEditSession.getMarkers()
    //     , newRange = null
    //     , adjacent = false
    //     , tempRange = null
    //     , toRemove = new Array()
    //     , oldColor = this.selectionColor
    //     , currentstart = this.aceEditSession.selection.getSelectionAnchor();

    //   if (this.oldstart != null) {
    //        if (currentstart.row == this.oldstart.row && currentstart.column == this.oldstart.column && oldColor == this.selectionColor ) {
    //             this.aceEditSession.d(this.lastMarker);
    //             //console.log('#' + this.rangeIdPrefix+this.lastMarker)
    //             $('#' + this.rangeIdPrefix+this.lastMarker).remove();
    //        }
    //   }
    //   newRange = selRange;
    //   for (var key in markers) {
    //     var marker = markers[key]
    //     , mRange = marker.range

    //     if (marker.clazz.indexOf("ace_highlight") != -1) {
    //         var rangeAdjacency = this.includes(mRange, newRange);
    //         if (rangeAdjacency == 5) {
    //              tempRange = new Range(mRange.start.row, mRange.start.column
    //                                 , newRange.end.row, newRange.end.column )
    //              adjacent = true;
    //         }
            
    //         if (rangeAdjacency == 6) {
    //              tempRange = new Range(newRange.start.row, newRange.start.column
    //                                 , mRange.end.row, mRange.end.column )
    //              adjacent = true;
    
    //         }
    //         if (adjacent) {
    //           console.log("it's adjacent")
    //              toRemove.push(key);
    //              $('#' + this.rangeIdPrefix+key).remove();
    //              newRange = tempRange
    //         }
    //     }
    //   }
    //   if (!adjacent) {
    //         newRange = new Range(selRange.start.row, selRange.start.column, selRange.end.row, selRange.end.column);
    //         this.oldstart = this.aceEditSession.selection.getSelectionAnchor();
    //         this.oldRange = newRange;
    //         this.lastMarker = this.addMarker(newRange, 'ace_highlight ' + this.selectionColor);
    //         var markers = this.aceEditSession.getMarkers();
    //         this.addRangeItem(markers[this.lastMarker], this.lastMarker, this.selectionColor);
    //   } else {
    //         var clazz = null;
    //         for (var i = 0; i < toRemove.length; i++) {
    //              clazz = markers[toRemove[i]].clazz;
    //              this.aceEditSession.d(toRemove[i]);
    //         }
    //         var markerId1 = this.addMarker(newRange, clazz);
    //         this.addRangeItem(markers[markerId1], markerId1, this.selectionColor);
    //         this.oldstart = this.aceEditSession.selection.getSelectionAnchor();
    //         this.oldRange = newRange;
    //   }
    // }

    /**
    * Erases Markers
    * 
    */
    this.eraseChange = function(){
      var eraserRange = this.aceEditSession.selection.getRange() 
      , markers = this.getHighlightMarkers()
      , removed = []

      var self=this;

      $.each(markers, function(){
        var range = this.range;

        // can touch this!
        if (!range.intersects(eraserRange)) return;

        if(range.isEqual(eraserRange) || eraserRange.containsRange(range)){
          //remove range
          self.aceEditSession.removeMarker(range.id);
          removed.push(range) 
          return;
        }

        if(range.containsRange(eraserRange)){
          //create the ending marker
          console.log("2")
          var range2 = new Range(eraserRange.end.row, eraserRange.end.column , range.end.row , range.end.column);
          var newMarkerId2 = self.addMarker(range2, this.clazz)
          range2.id = newMarkerId2
          self.addRangeItem(self.aceEditSession.getMarkers()[newMarkerId2], newMarkerId2, self.selectionColor);

          //console.log(range, eraserRange, range2)

          range.end.row = eraserRange.start.row
          range.end.column = eraserRange.start.column
          self.aceEditSession.removeMarker(range.id);
          removed.push(range) 
          var newMarkerId = self.addMarker(range, this.clazz)
          range.id = newMarkerId;
          console.log("yeah")
          $('#' + self.rangeIdPrefix + this.id).remove();
          self.addRangeItem(self.aceEditSession.getMarkers()[newMarkerId], newMarkerId, self.selectionColor);

          //self.mergeByColor();
          return;
        }


        /*
       * * `-1`: (B) begins before (A) but ends inside of (A)<br/>
       * * `+1`: (B) begins inside of (A) but ends outside of (A)<br/>
       * * `42`: FTW state: (B) ends in (A) but starts outside of (A) */
        console.log("The comparison says" + range.compareRange(eraserRange))
        switch(range.compareRange(eraserRange)){
          case -1:
              console.log("3")
              range.start.row = eraserRange.end.row
              range.start.column = eraserRange.end.column
            break;
          case 1:
              console.log("4")
              range.end.row = eraserRange.start.row
              range.end.column = eraserRange.start.column
            break;
          case 42:
              console.log("5")
              range.end.row = eraserRange.end.row
              range.end.column = eraserRange.end.column
            break;
        }
        console.log("final")
        self.aceEditSession.removeMarker(range.id);
        $('#' + self.rangeIdPrefix + this.id).remove();
        removed.push(range) 
        var newMarkerId = self.addMarker(range, this.clazz)
        range.id = newMarkerId;
        self.addRangeItem(self.aceEditSession.getMarkers()[newMarkerId], newMarkerId, self.selectionColor);
        return;

      });

        self.mergeByColor();

      return removed;

    }

    /**
    * Erases Markers
    * 
    */
    this.eraseChange2 = function(){
      var selRange = this.aceEditSession.selection.getRange() 
        , markers = this.aceEditSession.getMarkers()
        , dehigh = null;

      for (var key in markers) {
        var marker = markers[key]
        , mRange = marker.range
        console.log('marker0: ' + marker)
        if (marker.clazz.indexOf("ace_highlight") != -1) {
          dehigh = selRange;
          var currentstart = this.aceEditSession.selection.getSelectionAnchor();
          if (currentstart.row == this.oldstart.row && currentstart.column == this.oldstart.column) {
           dehigh = this.rangeMinus(this.oldRange, dehigh);
          }
          var rangeIncludes = this.includes(mRange, dehigh);

          this.aceEditSession.d(key);
          $('#' + this.rangeIdPrefix+key).remove();

          switch (rangeIncludes){
            case 1:
              if (dehigh.end.row != mRange.end.row || dehigh.end.column != mRange.end.column) {
                var markRange1 = new Range(dehigh.end.row, dehigh.end.column, mRange.end.row, mRange.end.column);
                var markerId1 = this.addMarker(markRange1, marker.clazz);
                this.addRangeItem(markers[markerId1], markerId1);     
              }
              break;

            case 2:
              if (mRange.start.row!=dehigh.start.row || mRange.start.column != dehigh.start.column) {
                var markRange1 = new Range(mRange.start.row, mRange.start.column, dehigh.start.row, dehigh.start.column);
                var markerId1 = this.addMarker(markRange1, marker.clazz);
                this.addRangeItem(markers[markerId1], markerId1);
              }
              break;

            case 3:
              if (mRange.start.row!=dehigh.start.row || mRange.start.column != dehigh.start.column) {
                var markRange1 = new Range(mRange.start.row, mRange.start.column, dehigh.start.row, dehigh.start.column);
                var markerId1 = this.addMarker(markRange1, marker.clazz);
                this.addRangeItem(markers[markerId1], markerId1);
              }
              if (dehigh.end.row!=mRange.end.row || dehigh.end.column!= mRange.end.column) {
                var markRange2 = new Range(dehigh.end.row, dehigh.end.column, mRange.end.row, mRange.end.column);
                var markerId2 = this.addMarker(markRange2, marker.clazz);
                this.addRangeItem(markers[markerId2], markerId2);
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
    this.includes = function (range1, range2) {

      /* In order to avoid lots of 'ifs' we use the following method:
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

    this.consolidate = function (range1, range2) {
      //mark
    } 



    this.rangeMinus = function(range1, range2) {
      var resultstart, resultend;
      //MARGARITA: vars resultstart, resultend and result were globals because you had no
      // 'var' keyword before them. Also, and this is a common pattern, if you have common
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

    this.addRangeItem = function(marker, id, color) {
      var self = this
        , rangeString = marker.range.start.row + ':' + marker.range.start.column
          + ' - ' + marker.range.end.row + ':' + marker.range.end.column
        , text = this.aceEditSession.getTextRange(marker.range);

      var rangeItemObj = {
        id: this.rangeIdPrefix+id ,
        colorClass: color,
        summary: text.truncate(30,'right','…'),
        text: text,
        range: rangeString
      }
      
      dust.render('rangeListItem', rangeItemObj, function(err,out){
        if (err) console.log(err);
        self.$ranges.append(out)
      });
    }

  }).call(Highlight.prototype)
    
  return Highlight;
})();
