//Dependendencies: jquery, highlight
'use strict';

var HighlightEditor = (function(){

  /* Private vars and functions */
  function getSpectrumPalette(colors){
    var result = []
      , size = 4
      , bigAr=$.map(colors, function(v, k) {return [k];})

    for (var i=0; i<bigAr.length; i+=size) {
        result.push(bigAr.slice(i,i+size));
    }
    return result;
  }

  /**
   * Creates an instance of HighlightEditor.
   *
   * @constructor
   * @this {HighlightEditor}
   * @param {Object} options Options for the editor.
   */
  var Editor = function(options){
    this.colorPalette = {
      'd9534f' :'bootstrapred',
      '428bca' : 'blue',
      '5cb85c' : 'green',
      'f0ad4e' : 'orange',
      '8b0000' : 'darkred',
      'ffd700' : 'gold',
      'bdb76b' : 'darkkhaki',
      '000080' : 'navy',
      'ba55d3' : 'mediumorchid',
      '90ee90' : 'lightgreen',
      'ff00ff' : 'magenta',
      'ff0000' : 'red'
    }
    this.spectrumPalette = getSpectrumPalette(this.colorPalette);
    this.activePalette = {};
    this.defaultColor = 'f0ad4e'
    this.taskCounter = 0;
    window.highlight = this.highlight =  new Highlight(options.highlight);


    //DOM 
    this.rootId = options.hEditorId;
    this.$root=$('#' + this.rootId);
    this.$colorTasks=this.$root.find('.he-color-tasks').eq(0)

    this.question = {
      stemHtml : '',
      tasks     : [],
      ranges   : {},
      //solution: tupe
    };

    var $taskCreatorRoot = this.$root.find('.he-task-creator').eq(0)
    this.taskCreator={
      $root   : $taskCreatorRoot,
      $color  : $taskCreatorRoot.find('.he-task-color').eq(0),
      $desc   : $taskCreatorRoot.find('.he-task-description').eq(0),
      $addBtn : $taskCreatorRoot.find('.he-task-add-btn').eq(0),
      descEditable: null //will instantiate in init
    }
    //this.$addColorTask = this.$root.find('.he-task-creator')

    //tasks
    this.taskItems={};
  };

  //Prototype methods


  (function(){

    this.init = function(){

      this.highlight.init();

      //should be empty but it's a useful visual cue
      this.exportMicroformat()

      var self=this
        , tc=this.taskCreator;

      //initate htmlEditables
      var formEditable = new HtmlEditable($('.he-stem .form-control'));
      formEditable.$el.on('blur.he.stem', function(){
        self.question.stemHtml = formEditable.unescapedText;
        self.exportMicroformat()
      })
      
      tc.descEditable = new HtmlEditable(tc.$desc)

      //initiate new task creator
      this.addColorPicker(this.taskCreator.$color)
      this.taskCreator.$addBtn.click(this.addNewTask.bind(this))

      $('.he-export-ranges-btn').on('click.he.export', function(){
        var hRanges = self.highlight.getHighlightRanges();
        $('.he-ranges-output').html(JSON.stringify(hRanges, undefined, 2))
        self.exportMicroformat();
      });

      $('a[href="#ranges"]').tab('show')
    }

    this.addNewTask = function(){
      var newId = 'he-task-'+ (++this.taskCounter)
        , tc = this.taskCreator
        , task = {
          htmlId: newId,
          color: tc.$color.attr('data-color'),
          description: tc.$desc.html()
        }

      dust.render('colorTaskItem', task, function(err,out){
        if (err) console.log(err);

        tc.descEditable.escapedText='';
        tc.$desc
        .html('')
        .addClass('he-placeholder');

        tc.$color
        .attr('data-color', this.defaultColor)
        .css('background-color', '#' + this.defaultColor);            

        this.$colorTasks.append(out);

        var self=this
        this.taskItems[newId] = new HighlightTask({
          $el: $('#'+newId),
          spectrumPalette : this.spectrumPalette,
          onChange: function(){
            self.exportMicroformat();
          },
          onColorChanged :  function(prevColor , newColor){
            var ap = self.activePalette;
            //active palette housekeeping
            var othersWithPrev = $('.he-color-tasks .he-task-color[data-color='+prevColor+']').length >= 1;
            if(!othersWithPrev && ap.hasOwnProperty(prevColor)) delete ap[prevColor];
            if(!ap.hasOwnProperty(newColor)) ap[newColor] = self.colorPalette[newColor];
            self.highlight.setColorPalette(ap)
          },
          onRemoveClicked :  function(){
            self.taskItems[newId].destroy();
            delete self.taskItems[newId];
          }
        });
       
        this.exportMicroformat();
      }.bind(this))
    }

    this.exportMicroformat = function(){

      this.question.tasks = $.map(this.taskItems, function(v, k) {
        return [{color: v.color, description: v.htmlEditable.unescapedText}];
      });

      this.question.ranges = JSON.stringify(this.highlight.getHighlightRanges());

      dust.render('highlightMf', this.question, function(err,out){
        if (err) console.log(err);

        //hackery to escape html text
        var escapedText = $('<textarea/>').html(out).html()
        $('.he-microformat').html(escapedText);
        Prism.highlightElement($('.he-microformat')[0]);
        Prism.highlightElement($('.he-ranges-output')[0]);
      })
    }

    this.addColorPicker = function($el){
      var self=this;
      $el
        .css('background-color',  '#' + $el.attr('data-color'))
        .spectrum({
          showPaletteOnly: true,
          showPalette:true,
          palette: self.spectrumPalette,
          change: function(color) {
            $(this)
              .css('background-color', color.toHexString())
              .attr('data-color', color.toHex())
          }
        });
    }


  }).call(Editor.prototype)

  return Editor;
})();

$(function(){

  var hEditor = new HighlightEditor({
    hEditorId : 'he-editor-1',
    highlight: {
      el: 'editor',
      lang : 'java'
    }
  })

  hEditor.init();
})

