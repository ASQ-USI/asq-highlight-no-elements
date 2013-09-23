//Dependendencies: jquery, highlight
"use strict";

var HighlightEditor = (function(){

  /* Private vars and functions */
  function getSpectrumPalette(colors){
    var result = []
      , size = 4
      , bigAr=$.map(colors, function(k, v) {return [v];})

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
  var HighlightEditor = function(options){
    this.colorPalette = {
      "d9534f" :"bootstrapred",
      "428bca" : "blue",
      "5cb85c" : "green",
      "f0ad4e" : "orange",
      "8b0000" : "darkred",
      "ffd700" : "gold",
      "bdb76b" : "darkkhaki",
      "000080" : "navy",
      "ba55d3" : "mediumorchid",
      "90ee90" : "lightgreen",
      "ff00ff" : "magenta",
      "ff0000" : "red"
    }
    this.spectrumPallete = getSpectrumPalette(this.colorPalette);
    this.taskCounter = 0;

    //DOM 
    this.rootId = options.hEditorId;
    this.$root=$("#" + this.rootId);
    this.$colorTasks=this.$root.find(".he-color-tasks").eq(0)

    var $taskCreatorRoot = this.$root.find(".he-task-creator").eq(0)
    this.taskCreator={
      $root   : $taskCreatorRoot,
      $color  : $taskCreatorRoot.find(".he-task-color").eq(0),
      $desc   : $taskCreatorRoot.find(".he-task-description").eq(0),
      $addBtn : $taskCreatorRoot.find(".he-task-add-btn").eq(0),
      descEditable: null //will instantiate in init
    }
    //this.$addColorTask = this.$root.find(".he-task-creator")
  };

  //Prototype methods


  (function(){

    this.init = function(){

      var self=this
        , tc=this.taskCreator;

      //initate htmlEditables

        var formEditable = new HtmlEditable($(".he-stem .form-control"));
        
        tc.descEditable = new HtmlEditable(tc.$desc)

      //initiate new task creator
      this.addColorPicker(this.taskCreator.$color)
      this.taskCreator.$addBtn.click(function(){

        var newId = "he-task-"+ (++self.taskCounter)
          , task={
              htmlId: newId,
              color: tc.$color.attr("data-color"),
              description: tc.$desc.html()
            }

        dust.render("colorTaskItem", task, function(err,out){
          if (err) console.log(err);

          tc.descEditable.escapedText="";
          tc.$desc
            .html("")
            .addClass("he-placeholder");
          self.$colorTasks.append(out);
          self.addColorPicker($("#"+newId + " .he-task-color"));
        })
      })
    }

    this.addColorPicker = function($el){
      var self=this;
      $el
        .css("background-color",  $el.attr('data-color'))
        .spectrum({
          showPaletteOnly: true,
          showPalette:true,
          palette: self.spectrumPallete,
          change: function(color) {
            var hexColor = color.toHexString();
            $(this)
              .css("background-color", hexColor)
              .attr("data-color", hexColor)
          }
        });
    }


  }).call(HighlightEditor.prototype)

  return HighlightEditor;
})();

$(function(){
  var myHighlight =  new Highlight({
  text: "editor",
  lang: "java",
  });
  myHighlight.init();

  var hEditor = new HighlightEditor({
    hEditorId : "he-editor-1"
  })

  hEditor.init();
})

