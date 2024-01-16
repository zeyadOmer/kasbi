(function($) {
  "use strict";
  Drupal.behaviors.simple_recaptcha_v3 = {
    attach: function(context, drupalSettings) {
      // Grab form IDs from settings and loop through them.
       for( let formId in drupalSettings.simple_recaptcha_v3.forms) {
        const $form = $('form[data-recaptcha-id="'+formId+'"]');
          let formSettings = drupalSettings.simple_recaptcha_v3.forms[formId];
          $form.once("simple-recaptcha").each(function() {
          $form.find('input[name="simple_recaptcha_score"]').val(formSettings.score);

          // Disable submit buttons on form.
          const $submit = $form.find('[type="submit"]');
          $submit.attr("data-disabled", "true");
          const $captcha = $(this).closest("form").find(".recaptcha-wrapper");
          const captchas = [];

          // AJAX forms - add submit handler to form.beforeSend.
          // Update Drupal.Ajax.prototype.beforeSend only once.
          if (typeof Drupal.Ajax !== 'undefined' && typeof Drupal.Ajax.prototype.beforeSubmitSimpleRecaptchaOriginal === 'undefined') {
            Drupal.Ajax.prototype.beforeSubmitSimpleRecaptchaOriginal = Drupal.Ajax.prototype.beforeSubmit;
            Drupal.Ajax.prototype.beforeSubmit = function (form_values, element_settings, options) {
              let $element = $(this.element);
              let isFormActions = $element
                .closest('.form-actions').length;
              let $token = $form.find('input[name="simple_recaptcha_token"]').val();
              if (isFormActions && ($token === 'undefined' || $token === '')) {
                this.ajaxing = false;
                return false;
              }
              return this.beforeSubmitSimpleRecaptchaOriginal();
            }
          }

          $submit.on("click", function(e) {
            if ($(this).attr("data-disabled") === "true") {
              // Get HTML IDs for further processing.
              const formHtmlId = $form.attr("id");
              const submitHtmlId = $(this).attr("id");

              // Find captcha wrapper.
              const $captcha = $(this).prev(".recaptcha-v3-wrapper");

              if ( typeof captchas[formHtmlId] === "undefined" ) {
                e.preventDefault();
                $captcha.hide();
                grecaptcha.ready(function() {
                  captchas[formHtmlId] = grecaptcha.execute(drupalSettings.simple_recaptcha_v3.sitekey, {action: formSettings.action}).then(function(token){
                    const $currentSubmit = $('#' + submitHtmlId);
                    $form.find('input[name="simple_recaptcha_token"]').val(token);
                    $form.find('input[name="simple_recaptcha_message"]').val(formSettings.error_message);
                    $currentSubmit.removeAttr("data-disabled");
                    // Click goes for regular forms, mousedown for AJAX forms.
                    $currentSubmit.click();
                    $currentSubmit.mousedown();
                  });
                });
              }
              e.preventDefault();
            }
          });
        });
      }
    }
  };
})(jQuery);
;
/**
 * @file
 * JavaScript behaviors for message element integration.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Behavior for handler message close.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformMessageClose = {
    attach: function (context) {
      $(context).find('.js-webform-message--close').once('webform-message--close').each(function () {
        var $element = $(this);

        var id = $element.attr('data-message-id');
        var storage = $element.attr('data-message-storage');
        var effect = $element.attr('data-message-close-effect') || 'hide';
        switch (effect) {
          case 'slide': effect = 'slideUp'; break;

          case 'fade': effect = 'fadeOut'; break;
        }

        // Check storage status.
        if (isClosed($element, storage, id)) {
          return;
        }

        // Only show element if it's style is not set to 'display: none'.
        if ($element.attr('style') !== 'display: none;') {
          $element.show();
        }

        $element.find('.js-webform-message__link').on('click', function (event) {
          $element[effect]();
          setClosed($element, storage, id);
          $element.trigger('close');
          event.preventDefault();
        });
      });
    }
  };

  function isClosed($element, storage, id) {
    if (!id || !storage) {
      return false;
    }

    switch (storage) {
      case 'local':
        if (window.localStorage) {
          return localStorage.getItem('Drupal.webform.message.' + id) || false;
        }
        return false;

      case 'session':
        if (window.sessionStorage) {
          return sessionStorage.getItem('Drupal.webform.message.' + id) || false;
        }
        return false;

      default:
        return false;
    }
  }

  function setClosed($element, storage, id) {
    if (!id || !storage) {
      return;
    }

    switch (storage) {
      case 'local':
        if (window.localStorage) {
          localStorage.setItem('Drupal.webform.message.' + id, true);
        }
        break;

      case 'session':
        if (window.sessionStorage) {
          sessionStorage.setItem('Drupal.webform.message.' + id, true);
        }
        break;

      case 'user':
      case 'state':
      case 'custom':
        $.get($element.find('.js-webform-message__link').attr('href'));
        return true;
    }
  }

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for radio buttons.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Adds HTML5 validation to required radios buttons.
   *
   * @type {Drupal~behavior}
   *
   * @see Issue #2856795: If radio buttons are required but not filled form is nevertheless submitted.
   */
  Drupal.behaviors.webformRadiosRequired = {
    attach: function (context) {
      $('.js-webform-type-radios.required, .js-webform-type-webform-radios-other.required', context).each(function () {
        var $element = $(this);
        var $radios = $element.find('input[type="radio"]');
        $radios.attr({'required': 'required', 'aria-required': 'true'});

        // Copy clientside_validation.module's message to the radio buttons.
        if ($element.attr('data-msg-required')) {
          $radios.attr({'data-msg-required': $element.attr('data-msg-required')});
        }
      });
    }
  };

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for options elements.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Attach handlers to options buttons element.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformOptionsButtons = {
    attach: function (context) {
      // Place <input> inside of <label> before the label.
      $(context).find('label.webform-options-display-buttons-label > input[type="checkbox"], label.webform-options-display-buttons-label > input[type="radio"]').each(function () {
        var $input = $(this);
        var $label = $input.parent();
        $input.detach().insertBefore($label);
      });
    }
  };


})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for checkboxes.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Adds HTML5 validation to required checkboxes.
   *
   * @type {Drupal~behavior}
   *
   * @see https://www.drupal.org/project/webform/issues/3068998
   */
  Drupal.behaviors.webformCheckboxesRadiosRequired = {
    attach: function (context) {
      $('.js-webform-type-checkboxes.required, .js-webform-type-webform-radios-other.checkboxes', context)
        .once('webform-checkboxes-required')
        .each(function () {
          var $element = $(this);
          var $firstCheckbox = $element
            .find('input[type="checkbox"]')
            .first();

          // Copy clientside_validation.module's message to the checkboxes.
          if ($element.attr('data-msg-required')) {
            $firstCheckbox.attr('data-msg-required', $element.attr('data-msg-required'));
          }

          $element.find('input[type="checkbox"]').on('click', required);
          required();

          function required() {
            var isChecked = $element.find('input[type="checkbox"]:checked');
            if (isChecked.length) {
              $firstCheckbox
                .removeAttr('required')
                .removeAttr('aria-required');
            }
            else {
              $firstCheckbox.attr({
                'required': 'required',
                'aria-required': 'true'
              });
            }
          }
        });
    }
  };

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for select menu.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Disable select menu options using JavaScript.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformSelectOptionsDisabled = {
    attach: function (context) {
      $('select[data-webform-select-options-disabled]', context).once('webform-select-options-disabled').each(function () {
        var $select = $(this);
        var disabled = $select.attr('data-webform-select-options-disabled').split(/\s*,\s*/);
        $select.find('option').filter(function isDisabled() {
          return ($.inArray(this.value, disabled) !== -1);
        }).attr('disabled', 'disabled');
      });
    }
  };


})(jQuery, Drupal);
;
