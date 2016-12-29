/**
 * @repository https://jayelkaake.github.io/refereejs/
 * @author Jay El-Kaake <najibkaake@gmail.com>
 */
(function($) {
  /**
   * Main class file for the max/min indicators
   * @param {Object} opts Accepts initialization options. Requires opts.el to be set which is the input element.
   */
  var RefereeJs = RefereeJs = function(opts) {
    var self = this;
    var max, min;

    // Set Options
    opts.hideWhenEmpty = opts.hideWhenEmpty === undefined ? true : opts.hideWhenEmpty;
    opts.displayOnInit = opts.displayOnInit === undefined ? true : opts.displayOnInit;
    opts.displayPosition = opts.displayPosition === undefined ? 'topRight' : opts.displayPosition;
    opts.maxIndicatorTemplate = opts.maxIndicatorTemplate || "too many characters ({{currLength}}/{{max}})";
    opts.minIndicatorTemplate = opts.minIndicatorTemplate || "{{charRemain}} too few characters (min: {{min}})";
    opts.charsLeftTemplate = opts.charsLeftTemplate || "{{charRemain}} character{{s}} left";
    opts.alwaysShowCount = opts.alwaysShowCount || false;

  /**
   * Constructor to initalize the referee
   */
    var init = function() {
      bindElements();
      loadVariables();
      bindEvents();
      updateMsg();
    };

    /**
     * Finds, binds and generates indicator elements.
     */
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

    /**
     * Load variables and values specified from the input element itself (included data- attributes)
     * @return {[type]} [description]
     */
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
      opts.alwaysShowCount = self.$el.data('referee-always-show-count') ? self.$el.data('referee-always-show-count') != 'false' : opts.alwaysShowCount;
      opts.warningThreshold = self.$el.data('referee-warning-threshold') || opts.warningThreshold || (max ? max/4 : undefined);
    };

    /**
     * Update the indicator messaging based on the input values
     */
    var updateMsg = function() {
      var currentLen = currentFieldLength();

      if (currentLen == 0 && opts.hideWhenEmpty) {
        hideMsg();
      } else if (opts.alwaysShowCount) {
        showCharCount(currentLen);
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
    
    /**
     * Returns the current input element field length.
     * @return {Integer}
     */
    var currentFieldLength = function() {
      return self.$el.val().length;
    }

    /**
     * Shows the "input too short" message with the configured template.
     * @param  {Integer} currentLen Current input field length
     */
    var showTooShortMsg = function(currentLen) {
      var charRemain = min - currentLen;
      showMsg(processTemplate(opts.minIndicatorTemplate, charRemain));

      // Apply proper class and remove unneeded ones
      if (!self.$indicator.hasClass('too-short')) self.$indicator.addClass('too-short');
      if (self.$indicator.hasClass('too-long')) self.$indicator.removeClass('too-long');
      if (self.$indicator.hasClass('chars-left')) self.$indicator.removeClass('chars-left');
    };

    /**
     * Shows the "input too long" message with the configured template.
     * @param  {Integer} currentLen Current input field length
     */
    var showTooLongMsg = function(currentLen) {
      var charRemain = currentLen - max;
      showMsg(processTemplate(opts.maxIndicatorTemplate, charRemain));

      // Apply proper class and remove unneeded ones
      if (!self.$indicator.hasClass('too-long')) self.$indicator.addClass('too-long');
      if (self.$indicator.hasClass('too-short')) self.$indicator.removeClass('too-short');
      if (self.$indicator.hasClass('chars-left')) self.$indicator.removeClass('chars-left');
    };
    
    /**
     * Shows the "__ characters left" message with the configured template.
     * @param  {Integer} currentLen Current input field length
     */
    var showCharsLeft = function(currentLen) {
      var charRemain = max - currentLen;

      if (opts.charsLeftThreshold >= charRemain && charRemain >= 0) {
        showMsg(processTemplate(opts.charsLeftTemplate, charRemain));
        self.$indicator.removeClass('too-long too-short').addClass('chars-left warning-threshold');

        // Apply proper class and remove unneeded ones
        if (!self.$indicator.hasClass('chars-left')) self.$indicator.addClass('chars-left');
        if (!self.$indicator.hasClass('warning-threshold')) self.$indicator.addClass('warning-threshold');
        if (self.$indicator.hasClass('too-long')) self.$indicator.removeClass('too-long');
        if (self.$indicator.hasClass('too-short')) self.$indicator.removeClass('too-short');
      } else {
        hideMsg();
      }
    };

    /**
     * Show the permanent "x characters left" view.
     * @param  {Integer} currentLen Current input field length
     */
    var showCharCount = function(currentLen) {
      var charRemain = max - currentLen;

      showMsg(processTemplate(opts.charsLeftTemplate, charRemain));

      self.$indicator.removeClass('too-long too-short').addClass('chars-left');

      if (opts.warningThreshold && charRemain < opts.warningThreshold) {
        if (!self.$indicator.hasClass('warning-threshold')) {
          self.$indicator.addClass('warning-threshold');
        }
        if (charRemain < 0 && !self.$indicator.hasClass('too-long')) {
          self.$indicator.addClass('too-long');
        }
      } else {
        if (self.$indicator.hasClass('warning-threshold')) {
          self.$indicator.removeClass('warning-threshold');
        }
        if (self.$indicator.hasClass('too-long')) {
          self.$indicator.removeClass('too-long');
        }
      }
    };

    /**
     * Takes the template and injects in variable values where template variables exist.
     * @param  {String} template    Template to inject variables into
     * @param  {Integer} charRemain Number of characters remaining in the input before reaching the limit for the given template.
     * @return {String}             Template message with variables injected into it.
     */
    var processTemplate = function(template, charRemain) {
      var msg = template
                    .replace('{{min}}', min)
                    .replace('{{max}}', max)
                    .replace('{{currLength}}', currentFieldLength())
                    .replace('{{charRemain}}', charRemain)
                    .replace('{{charLeft}}', charRemain)
                    .replace('{{s}}', charRemain == 1 ? '': 's');

      return msg;
    };


    /**
     * Hide the indicator message and remove any state dependent classes.
     * @return {[type]} [description]
     */
    var hideMsg = function() {
      if (self.$indicator.hasClass('too-short')) self.$indicator.removeClass('too-short');
      if (self.$indicator.hasClass('too-long')) self.$indicator.removeClass('too-long');
      if (self.$indicator.hasClass('chars-left')) self.$indicator.removeClass('chars-left');
      self.$indicator.hide();
    };

    /**
     * Show an indicator message.
     * @param  {String} html Text or HTML to put in the indicator content element.
     */
    var showMsg = function(html) {
      // Update the message.
      self.$indicatorContent.html(html);

        // Now show it.
      if (!self.$indicator.is(':visible')) {
        self.$indicator.fadeIn();
      }

      repositionIndicator();
    };

    /**
     * Reposition the indicator to the input element based on configured settings and the current window.
     * Uses absolute positioning.
     * @return {[type]} [description]
     */
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

    /**
     * Bind to the input element change events and window resize events so that we can position the indicator properly.
     */
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
  // End RefereeJs Class //


  // Attach the $('input').referee() method:
  jQuery.fn.extend({
    /**
     * Initializes the referee JS to any matched inputs.
     * @param opts
     * @returns {jQuery}
     */
    referee: function(opts) {
      opts = opts || {};

      $(this).each(function() {
        var $this = $(this);

        if (!$this.is('input')) return; // Skip non-input elements.

        $this.refereeJs = new RefereeJs($.extend({ el: $this }, opts));
      });
      return this;
    }
  });

  // When the document is ready let's search for inputs and automatically attach to them.
  $(document).ready(function() {
    $('input[data-referee]').referee();
  })
})(jQuery);
