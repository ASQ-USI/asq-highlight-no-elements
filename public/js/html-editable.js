var HtmlEditable = (function(){

  var HtmlEditable = function($el){
    this.$el = $el;
    this.placeholder =this.$el.attr("data-placeholder") || ""
    this.escapedText = $.trim(this.$el.html());
    this.unescapedText = $.trim($("<div/>").html(this.escapedText).text())

    this.init();
  }

  ;(function(){
    this.init = function(){
          //events
      this.$el
        .on("focus.he.htmleditable", this.onFocus.bind(this))
        .on("blur.he.htemleditable", this.onBlur.bind(this))
        .on("input.he.htemleditable", this.onInput.bind(this));
    }

    this.onInput = function(event){
      if (this.$el.text().length > 0) {
        this.$el.removeClass('he-placeholder');
      } else {
        this.$el.addClass('he-placeholder');
      }
    }

    this.onFocus = function(event){
      this.$el.html(this.escapedText);
    }

    this.onBlur = function(event){
      this.escapedText = $.trim(this.$el.html());
      this.unescapedText = $.trim($("<div/>").html(this.escapedText).text())
      this.$el.html(this.unescapedText);
    }

    this.destroy = function(){
      this.$el
        .off("focus.he.htmleditable")
        .off("blur.he.htemleditable");
    }

  }).call(HtmlEditable.prototype);

  return HtmlEditable;
})()
