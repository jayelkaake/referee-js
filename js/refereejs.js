(function($) {
  var cfg = {};

  jQuery.fn.extend({
    /**
     * Turns on scrollability indicator that showas "scroll down for more" indicator.
     * @param opts
     * @returns {jQuery}
     */
    referee: function(opts) {
      opts = opts || {};

      $(this).each(function() {
        var $this = $(this);

        $this.maxMinIndicator = new MaxMinIndicator($.extend({ el: $this }, opts));
      });
      return this;
    }
  });

  var MaxMinIndicator = MaxMinIndicator = function(opts) {
    var self = this;
    var max, min;

    // Set Options
    opts.hideWhenEmpty = opts.hideWhenEmpty === undefined ? true : opts.hideWhenEmpty;
    opts.displayOnInit = opts.displayOnInit === undefined ? true : opts.displayOnInit;
    opts.displayPosition = opts.displayPosition === undefined ? 'topRight' : opts.displayPosition;
    opts.maxIndicatorTemplate = opts.maxIndicatorTemplate || "too many characters ({{currLength}}/{{max}})";
    opts.minIndicatorTemplate = opts.minIndicatorTemplate || "{{charRemain}} too few characters (min: {{min}})";
    opts.charsLeftTemplate = opts.charsLeftTemplate || "{{charRemain}} characters left";

    var init = function() {
      bindElements();
      loadVariables();
      bindEvents();
      updateMsg();
    };

    var bindElements = function() {
      // Create the template and save it locally.
      self.$indicator = $('<span class="input-referee"><div class="indicator-content"></div></span>');
      self.$el = opts.el;
      self.$el.parent().append(self.$indicator);
      self.$indicatorContent = self.$indicator.find('.indicator-content');

      if (self.$el.attr('type') == 'number') {
        self.$indicatorContent.addClass('pad-number');
      }
    };

    var loadVariables = function() {
      // Load minimum
      var attrMin = self.$el.attr('ng-minLength') || self.$el.data('min-length') || self.$el.data('referee-min-length');
      if (attrMin) {
        min = parseInt(attrMin);
      }

      // Load the maximum
      var attrMax = self.$el.attr('ng-maxLength') || self.$el.data('max-length') || self.$el.data('referee-max-length');
      if (attrMax) {
        max = parseInt(attrMax);
      }
      
      // Set Options
      opts.hideWhenEmpty = self.$el.data('referee-hide-when-empty') ? self.$el.data('referee-hide-when-empty') != 'false' : opts.hideWhenEmpty;
      opts.displayOnInit = self.$el.data('referee-display-on-init') ? self.$el.data('referee-display-on-init') != 'false' : opts.displayOnInit;
      opts.displayPosition = self.$el.data('referee-position') ? 'topRight' : opts.displayPosition;
      opts.maxIndicatorTemplate = self.$el.data('referee-max-template') || opts.maxIndicatorTemplate;
      opts.minIndicatorTemplate = self.$el.data('referee-min-template') || opts.minIndicatorTemplate;
      opts.charsLeftTemplate = self.$el.data('referee-chars-left-template') || opts.charsLeftTemplate;
      opts.charsLeftThreshold = self.$el.data('referee-chars-left-threshold') || opts.charsLeftThreshold;
    };

    var updateMsg = function() {
      var currentLen = currentFieldLength();

      if (currentLen == 0 && opts.hideWhenEmpty) {
        hideMsg();
      } else if (min != undefined && currentLen < min) {
        showTooShortMsg(currentLen);
      } else if (max != undefined && currentLen > max) {
        showTooLongMsg(currentLen);
      } else if (opts.charsLeftThreshold) {
        showCharsLeft(currentLen);
      } else {
        hideMsg();
      }
    };
    
    var currentFieldLength = function() {
      return self.$el.val().length;
    }

    var showTooShortMsg = function(currentLen) {
      var charRemain = min - currentLen;
      showTemplateMsg(opts.minIndicatorTemplate, charRemain);
      self.$indicator.removeClass('too-long').removeClass('chars-left').addClass('too-short');
    };

    var showTooLongMsg = function(currentLen) {
      var charRemain = currentLen - max;
      showTemplateMsg(opts.maxIndicatorTemplate, charRemain);
      self.$indicator.removeClass('too-short').removeClass('chars-left').addClass('too-long');
    };
    
    var showCharsLeft = function(currentLen) {
      var charRemain = max - currentLen;
      if (opts.charsLeftThreshold >= charRemain && charRemain >= 0) {
        showTemplateMsg(opts.charsLeftTemplate, charRemain);
        self.$indicator.removeClass('too-long').removeClass('too-short').addClass('chars-left');
      } else {
        hideMsg();
      }
    };

    var showTemplateMsg = function(template, charRemain) {
      var msg = template
                    .replace('{{min}}', min)
                    .replace('{{max}}', max)
                    .replace('{{currLength}}', currentFieldLength())
                    .replace('{{charRemain}}', charRemain)
                    .replace('{{charLeft}}', charRemain)
                    .replace('{{s}}', charRemain == 1 ? '': 's');
      showMsg(msg);
    };

    var hideMsg = function() {
      self.$indicator.removeClass('too-short').removeClass('chars-left').removeClass('too-long');
      self.$indicator.hide();
    };

    var showMsg = function(html) {
      // Update the message.
      self.$indicatorContent.html(html);

      // Now show it.
      self.$indicator.show();

      repositionIndicator();
    };

    var repositionIndicator = function() {
      // Read in values from the field and indicator
      var fieldWidth = self.$el.outerWidth();
      var fieldLeft = self.$el.position().left;
      var fieldRight = fieldWidth + fieldLeft;
      var fieldHeight = self.$el.outerHeight();
      var indicatorHeight = self.$indicatorContent.outerHeight();
      var fieldTop = self.$el.position().top;

      // First position the left:
      var indicatorLeft = fieldRight - self.$indicatorContent.outerWidth();
      self.$indicator.css('left', indicatorLeft + 'px');

      // Now position the top:
      if (opts.displayPosition == 'centerRight') {
        var indicatorTop = fieldTop + (fieldHeight / 2) - (indicatorHeight / 2);
      } else {
        var indicatorTop = fieldTop;
      }
      self.$indicator.css('top', indicatorTop + 'px');

    };

    var bindEvents = function() {
      self.$el.on('change keyup unfocus', function() {
        updateMsg();
      });

      $(window).resize('resize', function() {
        repositionIndicator();
      });
    };

    init();
  };


  $(document).ready(function() {
    $('input[data-referee]').referee();
  })
})(jQuery);
