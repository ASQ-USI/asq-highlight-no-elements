'use strict'

var HtmlEditable = (function(){

  var HtmlEditable = function($el){
    this.$el = $el;
    this.escapedText = this.$el.html();
    this.unescapedText = $.trim($('<div/>').html(this.escapedText).text())

    this.init(); 
  }

  ;(function(){

    this.init = function(){
            //events
      this.$el
        .on('focus.he.htmleditable', this.onFocus.bind(this))
        .on('blur.he.htemleditable', this.onBlur.bind(this))
        .on('input.he.htemleditable', this.onInput.bind(this));
    };

    this.onInput = function(event){
      if (this.$el.text().length > 0) {
        this.$el.removeClass('he-placeholder');
      } else {
        this.$el.addClass('he-placeholder');
      }
    };

    this.onFocus = function(event){
      this.$el.html(this.escapedText);
    };

    this.onBlur = function(event){
      this.escapedText = $.trim(this.$el.html());
      this.unescapedText = $.trim($('<div/>').html(this.escapedText).text())
      this.$el.html(this.unescapedText);
    };

    this.destroy = function(){
      this.$el
        .off('focus.he.htmleditable')
        .off('blur.he.htemleditable');
    };

  }).call(HtmlEditable.prototype);

  return HtmlEditable;
})();


/*  ***************** Task ********************  */

var HighlightTask = (function(){

  var Task = function(options){
    this.options = options;
    this.$el = options.$el;
    this.spectrumPalette = options.spectrumPalette;
    this.htmlEditable = new HtmlEditable(this.$el.find('.form-control'));
    this.$colorStripe = this.$el.find('.he-task-color');
    this.color = null;
    this.$desc = this.$el.find('.he-task-description').eq(0);

    this.init();
  };

  ;(function(){

    this.init = function(){
      this.addColorPicker(this.$colorStripe);

      this.setColor(this.$colorStripe.attr('data-color'), true)

      this.htmlEditable.$el.on('blur.he.task', this.onChange.bind(this))

      this.$el.find('.he-task-remove-btn')
        .on('click.he.remove.btn', this.onRemoveClicked.bind(this));
    };

    this.onRemoveClicked = function(event){
      if('function' == typeof this.options.onRemoveClicked){
        this.options.onRemoveClicked.call(this)
      }
    };

    this.setColor = function(hexColor){
      var prevColor = this.color || hexColor;
      this.color = hexColor;
      this.$colorStripe
        .css('background-color', '#' + hexColor)
        .attr('data-color', hexColor);

      if('function' == typeof this.options.onColorChanged){
        this.options.onColorChanged.call(this, prevColor,  this.color)
      }

      this.onChange()
    };

    this.onChange = function(){
      if('function' == typeof this.options.onChange){
        this.options.onChange.call(this)
      }
    }

    this.addColorPicker = function($el){
      var self=this;
      $el
        .css('background-color',  $el.attr('data-color'))
        .spectrum({
          showPaletteOnly: true,
          showPalette:true,
          palette: self.spectrumPalette,
          change: function(color) {
            self.setColor(color.toHex());
          }
        });
    };

    this.destroy = function(){
      this.htmlEditable.destroy();
      this.$el.find('.he-task-remove-btn').off('click.he.remove.btn')
      this.$el.remove()
    }

  }).call(Task.prototype);

  return Task;
})();

