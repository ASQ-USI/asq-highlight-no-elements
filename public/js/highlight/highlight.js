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
    * Erases Markers
    * 
    */
    this.eraseChange = function(){
      var eraserRange = this.aceEditSession.selection.getRange() 
        , markers = this.getHighlightMarkers()
        , removed = []
        , self=this;

      //keep in mind that 'return' statements inside
      // $.each callbacks work as 'continue' statements
      $.each(markers, function(){
        var range = this.range;

        // can touch this (...range since they do not intersect)!
        if (!range.intersects(eraserRange)) return;

        if(range.isEqual(eraserRange) || eraserRange.containsRange(range)){
          //remove range
          self.aceEditSession.removeMarker(range.id);
          $('#' + self.rangeIdPrefix + this.id).remove();
          removed.push(range) 
          return;
        }

        if(range.containsRange(eraserRange)){
          //create the ending marker
          var range2 = new Range(eraserRange.end.row, eraserRange.end.column , range.end.row , range.end.column);
          var newMarkerId2 = self.addMarker(range2, this.clazz);
          range2.id = newMarkerId2;
          self.addRangeItem(self.aceEditSession.getMarkers()[newMarkerId2], newMarkerId2, self.selectionColor);

          range.end.row = eraserRange.start.row;
          range.end.column = eraserRange.start.column;
        }else{
          /*
         * * `-1`: (B) begins before (A) but ends inside of (A)<br/>
         * * `+1`: (B) begins inside of (A) but ends outside of (A)<br/>
         * * `42`: FTW state: (B) ends in (A) but starts outside of (A) */
          console.log("The comparison says" + range.compareRange(eraserRange))
          switch(range.compareRange(eraserRange)){
            case -1:
                range.start.row = eraserRange.end.row;
                range.start.column = eraserRange.end.column;
              break;
            case 1:
                range.end.row = eraserRange.start.row;
                range.end.column = eraserRange.start.column;
              break;
            case 42:
                range.end.row = eraserRange.end.row;
                range.end.column = eraserRange.end.column;
              break;
          }
        }

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
