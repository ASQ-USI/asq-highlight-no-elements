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
      syntax: 'javascript',
    };

   this.settings = $.extend({}, this.defaultOptions, options)

    // editor
    this.MODE_HIGHLIGHT = 'modeHighlight';
    this.MODE_EDIT_TEXT = 'modeEditText';
    this.MODE_HEATMAP   = 'modeHeatmap';

    this.modes = Object.create(null);
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

    
    this.$ranges = null;
    this.$occurences = null
    this.aceEditor = null;
    this.aceEditSession=null;
    this.selectionColor = '';
    this.oldRange = null;
    this.oldstart = null;
    this.lastMarker = null;

    this.rangeIdPrefix = 'he-range-item-';

    //Let's get this started 
    this.init();
  }
  
  //prototype methods

  ;(function(){

    /**
    * Initialization function. Should be called when the DOM
    * is ready, or when the window is loaded. 
    * 
    */
    this.init = function(){
      this.modes[this.MODE_EDIT_TEXT] = this.setInEditTextMode.bind(this);
      this.modes[this.MODE_HEATMAP] = this.setInHeatmapMode.bind(this);
      this.modes[this.MODE_HIGHLIGHT] = this.setInHighlightMode.bind(this);

      this.clearSelectionBinded = this.clearSelection.bind(this);
      this.onChangeSelectionBinded = this.onChangeSelection.bind(this);
      
      ///setup ace editor
      this.aceEditor = ace.edit(this.settings.el);
      this.aceEditSession = this.aceEditor.getSession()
      this.aceEditSession.setMode('ace/mode/'+this.settings.syntax.toLowerCase());

      this.setMode(this.MODE_HEATMAP);
      this.initColorpicker();
      
      //syntax dropdoown
      var self=this;

      var syntaxModesObj = {
        syntaxModes:this.syntaxModes,
        currentMode:self.settings.syntax.toLowerCase()
      }

      dust.render('syntaxModes', syntaxModesObj, function(err,out){
        if(err) {console.log(err);}
        // console.log(out)
        $('.he-syntax-modes').html(out);

        $('#syntaxSelect')
        .selectpicker()
        .on('change.he.syntax', function(event){
          var syntaxMode = $(this).find(':selected').val();
          self.settings.syntax = syntaxMode;
          self.aceEditSession.setMode('ace/mode/'+syntaxMode);
          $(document).trigger('asq-hl-syntax-changed', [syntaxMode]);
        });  
        //initialize syntax
        $('#syntaxSelect').selectpicker('val', self.settings.syntax)
      });

      //eraser button
      $('.he-eraser').on('click.he.eraser', function(event){
        self.setHighlightMode(self.HIGHLIGHT_ERASE)
      })

      //mode buttons
      $('.he-mode').on('click.he.mode', 'label', function(){
        var newMode;
        if( $(this).hasClass('he-edit-label') ){
          newMode = self.MODE_EDIT_TEXT;
        }else if ($(this).hasClass('he-highlight-label')){
          newMode = self.MODE_HIGHLIGHT;
        }else{
          newMode = self.MODE_HEATMAP;
        }
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
    $('.he-ranges, .he-occurences')
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
      for (var color in this.colors){
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

    this.getMarkerColorName= function(marker){
      var s =marker.clazz
        , hclass="ace_highlight marker-";

      return s.substring((s.indexOf(hclass) + hclass.length),s.length);
    }

    this.getOccurences = function(){
      var markers = this.getHighlightMarkers()
        , occurences = {}
        ,self = this;

      for(var key in this.colors){
        occurences[this.colors[key]] = {};
      }

      $.each(markers, function(){
        var colorName = self.getMarkerColorName(this)
        , text = self.aceEditSession.getTextRange(this.range)
        , ocColor = occurences[colorName];
        
        if(! ocColor.hasOwnProperty(text)){
          ocColor[text] = 0;
        }
        ocColor[text]++;
      });
      return occurences;
    }

    /**
    * Set Mode
    * 
    */
    this.setMode = function (mode) {
      if(this.mode === mode) return;
      if(this.modes[mode]){
        this.modes[mode]();
      }else{
        throw new Error('Invalid mode: ' + mode);
      }
    };

    this.setInEditTextMode = function(){
      this.mode = this.MODE_EDIT_TEXT;
      this.removeAllMarkers();
      this.aceEditor.setReadOnly(false);
      this.aceEditSession
        .selection.off('changeSelection', this.onChangeSelectionBinded);
      $('#heatmap-ta').off('input');
      dust.render('editInspector', {}, function(err, out){
        if (err) {console.log(err);}
        $('.he-inspector').html(out);
        $('.he-inspector a:first').tab('show');
      });
    };

    this.setInHeatmapMode = function(){
      this.mode = this.MODE_HEATMAP;
      this.removeAllMarkers();
      this.aceEditor.setReadOnly(true);
      this.aceEditSession
        .selection.off('changeSelection', this.onChangeSelectionBinded);

      $(document).on('click', '#heatmap-labels .list-group-item', function(event){
        this.drawHeatmap(event.currentTarget.dataset.hue);
      }.bind(this))

      dust.render('heatmapInspector', {}, function(err, out){
        if (err) {console.log(err);}
        $('.he-inspector').html(out);
        $('.he-inspector a:first').tab('show');

        $('#heatmap-ta').on('input', function(event){
          this.updateHeatmapData(event.currentTarget.value);
        }.bind(this));

        this.$heatmapList = $('.he-heatmap-label-list');
      }.bind(this));
    };

    this.setInHighlightMode = function(){
      this.mode = this.MODE_HIGHLIGHT;
      this.removeAllMarkers();
      this.aceEditor.setReadOnly(true);
      this.aceEditSession
        .selection.on('changeSelection', this.onChangeSelectionBinded);
      $('#heatmap-ta').off('input');
      dust.render('highlightInspector', {}, function(err, out){
        if (err) {console.log(err);}
        $('.he-inspector').html(out);
        $('.he-inspector a:first').tab('show');

        //set elements for listing ranges and occurences
        this.$ranges = $('.he-ranges').eq(0);
        this.$occurences = $('.he-occurences').eq(0);
      }.bind(this));
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
    };

    this.getHighlightMarkers = function (){
       //console.log(this.aceEditSession.getMarkers());
       return $.map(this.aceEditSession.getMarkers(), function(v,k){
        return (v.clazz.indexOf("ace_highlight") != -1
          ? v 
          : null);
      });
    };

    this.getHighlightRanges = function (){
       var hMarkers = this.getHighlightMarkers()
        , hRanges = {}
        , self = this;

       $.each(hMarkers, function(i,v){
        var colorStr = self.getMarkerColorName(v)
          , hclass="ace_highlight";

        if(! hRanges.hasOwnProperty(colorStr) ){
          hRanges[colorStr] = [];
        }
        hRanges[colorStr].push(v.range)
        
      });
      return hRanges;
    };


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
    };

    this.highlightChange = function(){
      var selRange = this.aceEditSession.selection.getRange()
        , markers = this.aceEditSession.getMarkers();

      this.lastMarker = this.addMarker(selRange, 'ace_highlight marker-' + this.selectionColor);
      selRange.id = this.lastMarker;
      this.addRangeListItem(markers[this.lastMarker], this.lastMarker, this.selectionColor);
      this.mergeColor(this.selectionColor);
      this.drawOccurencesList();
    };

    /**
    * Remove all markers
    * 
    */
    this.removeAllMarkers = function(){
      var markers = this.aceEditSession.getMarkers();
      
      for (var id in markers){
        if(markers[id].clazz.indexOf('ace_highlight') != -1){
          this.aceEditSession.removeMarker(id);
        }
      }

      if(this.$ranges){
        this.$ranges.empty();
      }
      if(this.$occurences){
        this.$occurences.empty();
      }
      if(this.$heatmapList){
        this.$heatmapList.empty();
      }
    };


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
          self.addRangeListItem(self.aceEditSession.getMarkers()[newMarkerId2], newMarkerId2, self.selectionColor);

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
        self.addRangeListItem(self.aceEditSession.getMarkers()[newMarkerId], newMarkerId, self.selectionColor);
        return;

      });

      self.mergeByColor();
      return removed;
    };


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
    };

    this.drawOccurencesList =function(){
      var occurences = this.getOccurences();
      this.$occurences.empty();
      for (var color in occurences){
        for (var s in occurences[color]){
          this.addOccurenceItem(color, s, occurences[color][s]);
        }
      }
    };

    this.addOccurenceItem = function(color, text, count) {
      var self = this;

      var occurenceItemObj = {
        colorClass: 'marker-' + color,
        summary: text.truncate(30,'right','…'),
        text: text,
        occurences: count
      }
      
      dust.render('occurenceListItem', occurenceItemObj, function(err,out){
        if (err) console.log(err);
        self.$occurences.append(out)
      });
    };

    this.addRangeListItem = function(marker, id, color) {
      var self = this
        , rangeString = marker.range.start.row + ':' + marker.range.start.column
          + ' - ' + marker.range.end.row + ':' + marker.range.end.column
        , text = this.aceEditSession.getTextRange(marker.range);

      var rangeItemObj = {
        id: this.rangeIdPrefix+id ,
        colorClass: 'marker-' + color,
        summary: text.truncate(30,'right','…'),
        text: text,
        range: rangeString
      }
      
      dust.render('rangeListItem', rangeItemObj, function(err,out){
        if (err) console.log(err);
        self.$ranges.append(out)
      });
    };

    this.addHeatmapListItem = function(hue){
      var self = this;
      var heatmapItemObj = {
        hue: hue,
        colorClass: 'marker-' + hue,
        description: hue
      }
      dust.render('heatmapListItem', heatmapItemObj, function(err,out){
        if (err) console.log(err);
        self.$heatmapList.append(out);
      });
    }

    this.updateHeatmapData = function(ranges){
      this.removeAllMarkers();
      var hmap = new Heatmap({
        textLines: this.aceEditSession.getDocument().getAllLines()
      });

      try{
        ranges = JSON.parse(ranges);
        hmap.addHueRanges(ranges);
        this.heatmapData = hmap.hues;

        for(var hue in this.heatmapData){
          this.addHeatmapListItem(hue);
        }
        $('heatmap-labels a.list-group-item:first').trigger('click')
      }catch(err){
        console.log("Error parsing ranges", err)
      }
    };

    this.drawHeatmap = function(hue){
      if(! this.heatmapData[hue]){
        throw new Error('no heatmatData found for hue ' + hue);
      }
      var hueData = this.heatmapData[hue];

      for(var i = 0, lrow = hueData.weights.length; i < lrow; i++){
        for(var j = 0, lcol = hueData.weights[i].length; j < lcol; j++){
          var val = ~~(hueData.weights[i][j] * 10);
          if(val == 0) continue;
          var range = new Range(i, j, i, j+1);
          this.addMarker(range, 'ace_highlight marker-' + hue + '-' + val);
        }
      }
    }

  }).call(Highlight.prototype)
    
  return Highlight;
})();
