/**
 * Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
"use strict";
define(['ojs/ojcore', 'jquery', 'hammerjs', 'ojs/ojeditablevalue',
        'ojs/ojinputtext', 'ojs/ojvalidation', 'ojs/ojpopup', 'ojs/ojbutton', 'ojs/ojanimation'],
       function(oj, $, Hammer, compCore, inputText, validation)
{

/**
 * Copyright (c) 2014, Oracle and/or its affiliates.
 * All rights reserved.
 */

/**
 * @preserve Copyright 2013 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

 /**
 * @private
 */
function _getNativePickerDate(converter, isoString) 
{
  isoString = converter.parse(isoString);
  
  var valueParams = oj.IntlConverterUtils._dateTime(isoString, ["date", "fullYear", "month", "hours", "minutes", "seconds"], true);
  var date = new Date();

  date.setFullYear(valueParams["fullYear"]);
  date.setDate(valueParams["date"]);
  date.setMonth(valueParams["month"]);
  date.setHours(valueParams["hours"]);
  date.setMinutes(valueParams["minutes"]);
  date.setSeconds(valueParams["seconds"]);
  date.setMilliseconds(0);

  return date;
}

/**
 * Placed here to avoid duplicate code for ojdatepicker + ojtimepicker
 *
 * Used for oj.EditableValueUtils.initializeOptionsFromDom
 *
 * @ignore
 */
function coerceIsoString(value)
{
  //reason for coersion is if one refreshes the page; then the input element's value might be the formatted string
  //thought about setting element's value to parsed value on destroy but goes against what destroy is suppose to do
  return this.options["converter"]["parse"](value);
}

/**
 * Placed here to avoid duplicate code for ojdatepicker + ojtimepicker
 *
 * @ignore
 */
function getImplicitDateTimeRangeValidator(options, converter)
{
  var dateTimeRangeTranslations = options['translations']['dateTimeRange'] || {},
          translations = [{'category': 'hint', 'entries': ['min', 'max', 'inRange']},
                          {'category': 'messageDetail', 'entries': ['rangeUnderflow', 'rangeOverflow']},
                          {'category': 'messageSummary', 'entries': ['rangeUnderflow', 'rangeOverflow']}],
          dateTimeRangeOptions = {'min': options['min'], 'max': options['max'], 'converter': converter};

  //note the translations are defined in ojtranslations.js, but it is possible to set it to null, so for sanity
  if(!$.isEmptyObject(dateTimeRangeTranslations))
  {
    for(var i=0, j=translations.length; i < j; i++)
    {
      var category = dateTimeRangeTranslations[translations[i]['category']];

      if(category)
      {
        var translatedContent = {},
            entries = translations[i]['entries'];

        for(var k=0, l=entries.length; k < l; k++)
        {
          translatedContent[entries[k]] = category[entries[k]];
        }

        dateTimeRangeOptions[translations[i]['category']] = translatedContent;
      }
    }
  }

  return oj.Validation.validatorFactory(oj.ValidatorFactory.VALIDATOR_TYPE_DATETIMERANGE).createValidator(dateTimeRangeOptions);
}

/**
 * Shared for ojInputDate + ojInputTime
 *
 * @ignore
 */
function disableEnableSpan(children, val)
{
  var filteredChildren = children.filter("span");
  if (val)
  {
    filteredChildren.addClass("oj-disabled").removeClass("oj-enabled oj-default");
  }
  else
  {
    filteredChildren.removeClass("oj-disabled").addClass("oj-enabled oj-default");
  }
}

/**
 * For dayMetaData
 *
 * @ignore
 */
function _getMetaData(dayMetaData, position, params) {
  if(!dayMetaData || position === params.length) {
    return dayMetaData;
  }

  var nextPos = position + 1;
  return _getMetaData(dayMetaData[params[position]], nextPos, params) || _getMetaData(dayMetaData["*"], nextPos, params);
}

/**
 * Bind hover events for datepicker elements.
 * Done via delegate so the binding only occurs once in the lifetime of the parent div.
 * Global instActive, set by _updateDatepicker allows the handlers to find their way back to the active picker.
 *
 * @ignore
 */
function bindHover(dpDiv)
{
  var selector = ".oj-datepicker-prev-icon, .oj-datepicker-prev-icon .oj-clickable-icon-nocontext.oj-component-icon, .oj-datepicker-next-icon, .oj-datepicker-next-icon .oj-clickable-icon-nocontext.oj-component-icon, .oj-datepicker-calendar td a";
  return dpDiv.delegate(selector, "mouseout", function ()
  {
    $(this).removeClass("oj-hover");
  }).delegate(selector, "mouseover", function ()
  {
    $(this).addClass("oj-hover");
  }).delegate(selector, "focus", function ()
  {
    $(this).addClass("oj-focus");
  }).delegate(selector, "blur", function ()
  {
    $(this).removeClass("oj-focus");
  });
}

/**
 * Binds active state listener that set appropriate style classes. Used in 
 * ojInputDate/ojInputDateTime/ojInputTime
 *
 * @ignore
 */
function bindActive(dateTime)
{
  var triggerRootContainer = $(dateTime.element[0]).parent().parent();
  
  // There are few issues in mobile using hover and active marker classes (iOS and Android, more 
  // evident on iOS). Some fix is needed in _activeable(), tracking .
  dateTime._AddActiveable(triggerRootContainer);
}

/**
 * returns if the native picker is supported - depends on renderMode set to 'native' and this
 * cordova plugin being configured... https://github.com/VitaliiBlagodir/cordova-plugin-datepicker
 * 
 * @ignore
 */
function isPickerNative(dateTime)
{
  // use bracket notation to avoid closure compiler renaming the variables
  return (dateTime.options['renderMode'] === "native" && window['cordova'] && window['datePicker']);
}

//to display the suffix for the year
var yearDisplay = oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME).createConverter(
{
  "year" : "numeric"
});

/*!
 * JET Input Date @VERSION
 * http://jqueryui.com
 *
 * Copyright 2013 jQuery Foundertion and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Depends:
 *  jquery.ui.widget.js
 */
/**
 * @ojcomponent oj.ojInputDate
 * @augments oj.inputBase
 * @since 0.6
 *
 * @classdesc
 * <h3 id="inputDateOverview-section">
 *   JET ojInputDate Component
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#inputDateOverview-section"></a>
 * </h3>
 *
 * <p>Description: ojInputDate provides basic support for datepicker selection.
 *
 * <h3 id="touch-section">
 *   Touch End User Information
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#touch-section"></a>
 * </h3>
 *
 * {@ojinclude "name":"touchDoc"}
 *
 * <h3 id="keyboard-section">
 *   Keyboard End User Information
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#keyboard-section"></a>
 * </h3>
 *
 * {@ojinclude "name":"keyboardDoc"}
 *
 * <h3 id="pseudos-section">
 *   Pseudo-selectors
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#pseudos-section"></a>
 * </h3>
 *
 * <pre class="prettyprint">
 * <code>$( ":oj-inputDate" )            // selects all JET input on the page
 * </code>
 * </pre>
 *
 * <h3 id="a11y-section">
 *   Accessibility
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#a11y-section"></a>
 * </h3>
 * <p>
 * It is up to the application developer to associate the label to the input component.
 * For inputDate, you should put an <code>id</code> on the input, and then set
 * the <code>for</code> attribute on the label to be the input's id.
 * </p>
 * <h3 id="label-section">
 *   Label and InputDate
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#label-section"></a>
 * </h3>
 * <p>
 * For accessibility, you should associate a label element with the input
 * by putting an <code>id</code> on the input, and then setting the
 * <code>for</code> attribute on the label to be the input's id.
 * </p>
 * <p>
 * The component will decorate its associated label with required and help
 * information, if the <code>required</code> and <code>help</code> options are set.
 * </p>
 * <h3 id="binding-section">
 *   Declarative Binding
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#binding-section"></a>
 * </h3>
 *
 * <pre class="prettyprint">
 * <code>
 *    &lt;input id="dateId" data-bind="ojComponent: {component: 'ojInputDate'}" /&gt;
 * </code>
 * </pre>
 *
 * @desc Creates or re-initializes a JET ojInputDate
 *
 * @param {Object=} options a map of option-value pairs to set on the component
 *
 * @example <caption>Initialize the input element with no options specified:</caption>
 * $( ".selector" ).ojInputDate();
 *
 * @example <caption>Initialize the input element with some options:</caption>
 * $( ".selector" ).ojInputDate( { "disabled": true } );
 *
 * @example <caption>Initialize the input element via the JET <code class="prettyprint">ojComponent</code> binding:</caption>
 * &lt;input id="dateId" data-bind="ojComponent: {component: 'ojInputDate'}" /&gt;
 */
oj.__registerWidget("oj.ojInputDate", $['oj']['inputBase'],
{
  version : "1.0.0",
  widgetEventPrefix : "oj",

  //-------------------------------------From base---------------------------------------------------//
  _CLASS_NAMES : "oj-inputdatetime-input",
  _WIDGET_CLASS_NAMES : "oj-inputdatetime-date-only oj-component oj-inputdatetime",
  _ELEMENT_TRIGGER_WRAPPER_CLASS_NAMES : "",
  _INPUT_HELPER_KEY: "inputHelp",
  _ATTR_CHECK : [{"attr": "type", "setMandatory": "text"}],
  _GET_INIT_OPTIONS_PROPS:  [{attribute: "disabled", validateOption: true},
                             {attribute: 'pattern'},
                             {attribute: "title"},
                             {attribute: "placeholder"},
                             {attribute: "value", coerceDomValue: coerceIsoString},
                             {attribute: "required",
                              coerceDomValue: true, validateOption: true},
                             {attribute: 'readonly', option: 'readOnly',
                             validateOption: true},
                             {attribute: "min", coerceDomValue: coerceIsoString},
                             {attribute: "max", coerceDomValue: coerceIsoString}],
  //-------------------------------------End from base-----------------------------------------------//

  _TRIGGER_CLASS : "oj-inputdatetime-input-trigger",
  _TRIGGER_CALENDAR_CLASS : "oj-inputdatetime-calendar-icon",

  _CURRENT_CLASS : "oj-datepicker-current-day",
  _DAYOVER_CLASS : "oj-datepicker-days-cell-over",
  _UNSELECTABLE_CLASS : "oj-datepicker-unselectable",

  _DATEPICKER_DESCRIPTION_ID : "oj-datepicker-desc",
  _CALENDAR_DESCRIPTION_ID : "oj-datepicker-calendar",
  _MAIN_DIV_ID : "oj-datepicker-div",

  _INLINE_CLASS : "oj-datepicker-inline",
  _INPUT_CONTAINER_CLASS : " oj-inputdatetime-input-container",
  _INLINE_WIDGET_CLASS: " oj-inputdatetime-inline",

  _ON_CLOSE_REASON_SELECTION: "selection",  // A selection was made
  _ON_CLOSE_REASON_CANCELLED: "cancelled",  // Selection not made
  _ON_CLOSE_REASON_TAB: "tab",              // Tab key
  _ON_CLOSE_REASON_CLOSE: "close",          // Disable or other closes

  _KEYBOARD_EDIT_OPTION_ENABLED: "enabled",
  _KEYBOARD_EDIT_OPTION_DISABLED: "disabled",

  options :
  {
    /**
     * <p>
     * Note that Jet framework prohibits setting subset of options which are object types.<br/><br/>
     * For example $(".selector").ojInputDate("option", "datePicker", {footerLayout: "today"}); is prohibited as it will
     * wipe out all other sub-options for "datePicker" object.<br/><br/> If one wishes to do this [by above syntax or knockout] one
     * will have to get the "datePicker" object, modify the necessary sub-option and pass it to above syntax.<br/><br/>
     * Note that all of the datePicker sub-options except showOn are not available when renderMode is 'native'.<br/><br/> 
     *
     * The properties supported on the datePicker option are:
     *
     * @property {string=} footerLayout Will dictate what content is shown within the footer of the calendar. <br/><br/>
     * The default value is <code class="prettyprint">{datePicker: {footerLayout: "today"}}</code> with possible values being
     * <ul>
     *   <li>"" - Do not show anything</li>
     *   <li>"today" - the today button</li>
     * </ul>
     * <br/>
     * Example <code class="prettyprint">$(".selector").ojInputDate("option", "datePicker.footerLayout", "today");</code>
     *
     * @property {string=} changeMonth Whether the month should be rendered as a button to allow selection instead of text.<br/><br/>
     * The default value is <code class="prettyprint">{datePicker: {changeMonth: "select"}}</code> with possible values being
     * <ul>
     *  <li>"select" - As a button</li>
     *  <li>"none" - As a text</li>
     * </ul>
     * <br/>
     * Example <code class="prettyprint">$(".selector").ojInputDate("option", "datePicker.changeMonth", "none");</code>
     *
     * @property {string=} changeYear Whether the year should be rendered as a button to allow selection instead of text. <br/><br/>
     * The default value is <code class="prettyprint">{datePicker: {changeYear: "select"}}</code> with possible values being
     * <ul>
     *  <li>"select" - As a button</li>
     *  <li>"none" - As a text</li>
     * </ul>
     * <br/>
     * Example <code class="prettyprint">$(".selector").ojInputDate("option", "datePicker.changeYear", "none");</code>
     *
     * @property {number=} currentMonthPos The position in multipe months at which to show the current month (starting at 0). <br/><br/>
     * The default value is <code class="prettyprint">{datePicker: {currentMonthPos: 0}}</code> <br/><br/>
     * Example <code class="prettyprint">$(".selector").ojInputDate("option", "datePicker.currentMonthPos", 1);</code>
     *
     * @property {string=} daysOutsideMonth Dictates the behavior of days outside the current viewing month. <br/><br/>
     * The default value is <code class="prettyprint">{datePicker: {daysOutsideMonth: "hidden"}}</code> with possible values being
     * <ul>
     *  <li>"hidden" - Days outside the current viewing month will be hidden</li>
     *  <li>"visible" - Days outside the current viewing month will be visible</li>
     *  <li>"selectable" - Days outside the current viewing month will be visible + selectable</li>
     * </ul>
     * <br/>
     * Example <code class="prettyprint">$(".selector").ojInputDate("option", "datePicker.daysOutsideMonth", "visible");</code>
     *
     * @property {number=} numberOfMonths The number of months to show at once. Note that if one is using a numberOfMonths > 4 then one should define a CSS rule
     * for the width of each of the months. For example if numberOfMonths is set to 6 then one should define a CSS rule .oj-datepicker-multi-6 .oj-datepicker-group
     * providing the width each month should take in percentage.  <br/><br/>
     * The default value is <code class="prettyprint">{datePicker: {numberOfMonths: 1}}</code> <br/><br/>
     * Example <code class="prettyprint">$(".selector").ojInputDate("option", "datePicker.numberOfMonths", 2);</code>
     *
     * @property {string=} showOn When the datepicker should be shown. <br/><br/>
     * Possible values are
     * <ul>
     *  <li>"focus" - when the element receives focus or when the trigger calendar image is clicked. When the picker is closed, the field regains focus and is editable.</li>
     *  <li>"image" - when the trigger calendar image is clicked</li>
     * </ul>
     * <br/>
     * Example to initialize the inputDate with showOn option specified 
     * <code class="prettyprint">$(".selector").ojInputDate("option", "datePicker.showOn", "focus");</code>
     * <br/>
     * 
     * @property {string|number=} stepMonths How the prev + next will step back/forward the months. <br/><br/>
     * The default value is <code class="prettyprint">{datePicker: {stepMonths: "numberOfMonths"}}</code>
     * <ul>
     *  <li>"numberOfMonths" - Will use numberOfMonths option value as value</li>
     *  <li>number - Number of months to step back/forward</li>
     * </ul>
     * <br/>
     * Example <code class="prettyprint">$(".selector").ojInputDate("option", "datePicker.stepMonths", 2);</code>
     *
     * @property {number=} stepBigMonths Number of months to step back/forward for the (Alt + Page up) + (Alt + Page down) key strokes.  <br/><br/>
     * The default value is <code class="prettyprint">{datePicker: {stepBigMonths: 12}}</code><br/><br/>
     * Example <code class="prettyprint">$(".selector").ojInputDate("option", "datePicker.stepBigMonths", 3);</code>
     *
     * @property {string=} weekDisplay Whether week of the year will be shown.<br/><br/>
     * The default value is <code class="prettyprint">{datePicker: {weekDisplay: "none"}}</code>
     * <ul>
     *  <li>"number" - Will show the week of the year as a number</li>
     *  <li>"none" - Nothing will be shown</li>
     * </ul>
     * <br/>
     * Example <code class="prettyprint">$(".selector").ojInputDate("option", "datePicker.weekDisplay", "number");</code>
     *
     * @property {string=} yearRange The range of years displayed in the year drop-down: either relative to today's year ("-nn:+nn"),
     * relative to the currently selected year ("c-nn:c+nn"), absolute ("nnnn:nnnn"), or combinations of these formats ("nnnn:-nn"). <br/><br/>
     * The default value is <code class="prettyprint">{datePicker: {yearRange: "c-10:c+10"}}</code><br/><br/>
     * Example <code class="prettyprint">$(".selector").ojInputDate("option", "datePicker.yearRange", "c-5:c+10");</code>
     * </p>
     *
     * @expose
     * @instance
     * @memberof! oj.ojInputDate
     * @type {Object}
     */
    datePicker:
    {
      /**
       * @expose
       */
      footerLayout : "",

      /**
       * @expose
       */
      changeMonth : "select",

      /**
       * @expose
       */
      changeYear : "select",

      /**
       * @expose
       */
      currentMonthPos : 0,

      /**
       * @expose
       */
      daysOutsideMonth : "hidden",

      /**
       * @expose
       */
      numberOfMonths : 1,

      /**
       * @expose
       */
      showOn : "focus",

      /**
       * @expose
       */
      stepMonths : "numberOfMonths",

      /**
       * @expose
       */
      stepBigMonths : 12,

      /**
       * @expose
       */
      weekDisplay : "none", // "number" to show week of the year, "none" to not show it

      /**
       * @expose
       */
      yearRange : "c-10:c+10" // Range of years to display in drop-down,
      // either relative to today's year (-nn:+nn), relative to currently displayed year
      // (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n)

    },

    /**
     * A datetime converter instance that duck types {@link oj.DateTimeConverter}. Or an object literal
     * containing the properties listed below.
     *
     * The converter used for ojInputDate. Page authors can set a custom converter by creating one using the datetime converter factory
     * and providing custom options -
     * oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME).createConverter(customOptions).
     *
     * <p>
     * When <code class="prettyprint">converter</code> option changes due to programmatic
     * intervention, the component performs various tasks based on the current state it is in. </br>
     *
     * <h4>Steps Performed Always</h4>
     * <ul>
     * <li>Any cached converter instance is cleared and new converter created. The converter hint is
     * pushed to messaging. E.g., notewindow displays the new hint(s).
     * </li>
     * </ul>
     *
     * <h4>Running Validation</h4>
     * <ul>
     * <li>if component is valid when <code class="prettyprint">converter</code> option changes, the
     * display value is refreshed.</li>
     * <li>if component is invalid and is showing messages -
     * <code class="prettyprint">messagesShown</code> option is non-empty, when
     * <code class="prettyprint">converter</code> option changes then all component messages are
     * cleared and full validation run using the current display value on the component.
     * <ul>
     *   <li>if there are validation errors, then <code class="prettyprint">value</code>
     *   option is not updated, and the error pushed to <code class="prettyprint">messagesShown</code>
     *   option. The display value is not refreshed in this case. </li>
     *   <li>if no errors result from the validation, the <code class="prettyprint">value</code>
     *   option is updated; page author can listen to the <code class="prettyprint">optionChange</code>
     *   event on the <code class="prettyprint">value</code> option to clear custom errors. The
     *   display value is refreshed with the formatted value provided by converter.</li>
     * </ul>
     * </li>
     * <li>if component is invalid and has deferred messages when converter option changes, the
     *   display value is again refreshed with the formatted value provided by converter.</li>
     * </ul>
     *
     * <h4>Clearing Messages</h4>
     * <ul>
     * <li>Only messages created by the component are cleared. This includes both
     * <code class="prettyprint">messagesHidden</code> and <code class="prettyprint">messagesShown</code>
     *  options.</li>
     * <li><code class="prettyprint">messagesCustom</code> option is not cleared.</li>
     * </ul>
     * </p>
     *
     * @property {string} type - the converter type registered with the oj.ConverterFactory.
     * Usually 'datetime'. See {@link oj.DateTimeConverterFactory} for details. <br/>
     * E.g., <code class="prettyprint">{converter: {type: 'datetime'}</code>
     * @property {Object=} options - optional Object literal of options that the converter expects.
     * See {@link oj.IntlDateTimeConverter} for options supported by the jet datetime converter.
     * E.g., <code class="prettyprint">{converter: {type: 'datetime', options: {formatType: 'date'}}</code>
     *
     *
     * @expose
     * @instance
     * @memberof! oj.ojInputDate
     * @default <code class="prettyprint">oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME).createConverter()</code>
     */
    converter : oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME).createConverter(
    {
      "day" : "2-digit", "month" : "2-digit", "year" : "2-digit"
    }),

    /**
     * Determines if keyboard entry of the text is allowed.
     * When disabled the picker must be used to select a date.
     *
     * @example <caption>Initialize the component with the <code class="prettyprint">keyboardEdit</code> option:</caption>
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojInputDate', keyboardEdit: 'disabled'}" /&gt;
     *
     * @expose
     * @instance
     * @memberof! oj.ojInputDate
     * @type {string}
     * @ojvalue {string} "enabled"  Allow keyboard entry of the date.
     * @ojvalue {string} "disabled" Changing the date can only be done with the picker.
     * @default Default value depends on the theme. In alta-android, alta-ios and alta-windows themes, the 
     * default is <code class="prettyprint">"disabled"</code>
     * and it's <code class="prettyprint">"enabled"</code> for alta desktop theme.
     */
    keyboardEdit : "enabled",

    /**
     * The maximum selectable date. When set to null, there is no maximum.
     *
     * <ul>
     *  <li> type string - ISOString
     *  <li> null - no limit
     * </ul>
     *
     * @example <caption>Initialize the component with the <code class="prettyprint">max</code> option:</caption>
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojInputDate', max: '2014-09-25'}" /&gt;
     *
     * @expose
     * @instance
     * @memberof! oj.ojInputDate
     * @default <code class="prettyprint">null</code>
     */
    max : undefined,

    /**
     * The minimum selectable date. When set to null, there is no minimum.
     *
     * <ul>
     *  <li> type string - ISOString
     *  <li> null - no limit
     * </ul>
     *
     * @example <caption>Initialize the component with the <code class="prettyprint">min</code> option:</caption>
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojInputDate', min: '2014-08-25'}" /&gt;
     *
     * @expose
     * @instance
     * @memberof! oj.ojInputDate
     * @default <code class="prettyprint">null</code>
     */
    min : undefined,

    /**
     * <p>Attributes specified here will be set on the picker DOM element when it's launched.
     * <p>The supported attributes are <code class="prettyprint">class</code> and <code class="prettyprint">style</code>, which are appended to the picker's class and style, if any.
     * Note: 1) pickerAttributes is not applied in the native theme.
     * 2) setting this option after component creation has no effect.
     *
     * @example <caption>Initialize the inputDate specifying a set of attributes to be set on the picker DOM element:</caption>
     * $( ".selector" ).ojInputDate({ "pickerAttributes": {
     *   "style": "color:blue;",
     *   "class": "my-class"
     * }});
     *
     * @example <caption>Get the <code class="prettyprint">pickerAttributes</code> option, after initialization:</caption>
     * // getter
     * var inputDate = $( ".selector" ).ojInputDate( "option", "pickerAttributes" );
     *
     * @expose
     * @memberof! oj.ojInputDate
     * @instance
     * @type {?Object}
     * @default <code class="prettyprint">null</code>
     */
    pickerAttributes: null,

    /**
     * The renderMode option allows applications to specify whether to render date picker in JET or 
     * as a native picker control.</br>
     * 
     * Valid values: jet, native
     *
     * <ul>
     *  <li> jet - Applications get full JET functionality.</li>
     *  <li> native - Applications get the functionality of the native picker. Native picker is
     *  not available when the picker is inline, defaults to jet instead.</li></br>
     *  Note that the native picker support is limited to Cordova plugin published 
     *  at 'https://github.com/VitaliiBlagodir/cordova-plugin-datepicker'.</br>
     *  With native renderMode, the functionality that is sacrificed compared to jet renderMode are:
     *    <ul>
     *      <li>Date picker cannot be themed</li>
     *      <li>Accessibility is limited to what the native picker supports</li>
     *      <li>pickerAttributes is not applied</li>
     *      <li>Sub-IDs are not available</li>
     *      <li>hide() function is no-op</li>
     *      <li>translations sub options pertaining to the picker is not available</li>
     *      <li>All of the 'datepicker' sub-options except 'showOn' are not available</li>
     *    </ul>
     * </ul>
     *
     * @expose 
     * @memberof! oj.ojInputDate
     * @instance
     * @type {string}
     * @default value depends on the theme. In alta-android, alta-ios and alta-windows themes, the 
     * default is "native" and it's "jet" for alta desktop theme.
     *
     * @example <caption>Get or set the <code class="prettyprint">renderMode</code> option for
     * an ojInputDate after initialization:</caption>
     * // getter
     * var renderMode = $( ".selector" ).ojInputDate( "option", "renderMode" );
     * // setter
     * $( ".selector" ).ojInputDate( "option", "renderMode", "native" );
     * // Example to set the default in the theme (SCSS)
     * $inputDateTimeRenderModeOptionDefault: native !default;
     */
    renderMode : "jet",

    /**
     * Additional info to be used when rendering the day
     *
     * This should be a JavaScript Function reference which accepts as its argument the following JSON format
     * {fullYear: Date.getFullYear(), month: Date.getMonth()+1, date: Date.getDate()}
     *
     * and returns null or all or partial JSON data of
     * {disabled: true|false, className: "additionalCSS", tooltip: 'Stuff to display'}
     *
     * @expose
     * @instance
     * @memberof! oj.ojInputDate
     * @type {Function}
     * @default <code class="prettyprint">null</code>
     */
    dayFormatter : null

    /**
     * Additional info to be used when rendering the day
     *
     * This should be in the following JSON format with the year, month, day based on Date.getFullYear(), Date.getMonth()+1, and Date.getDate():
     * {year: {month: {day: {disabled: true|false, className: "additionalCSS", tooltip: 'Stuff to display'}}}
     *
     * There also exists a special '*' character which represents ALL within that field [i.e. * within year, represents for ALL year].
     *
     * Note that this option will override the value of the dayFormatter option. Setting both dayFormatter and dayMetaData options is not supported.
     *
     * @expose
     * @name dayMetaData
     * @instance
     * @memberof! oj.ojInputDate
     * @default <code class="prettyprint">null</code>
     * @example <code class="prettyprint">{2013: {11: {25: {disabled: true, className: 'holiday', tooltip: 'Stuff to display'}, 5: {disabled: true}}}}}</code>
     */

    // DOCLETS
    /**
     * The placeholder text to set on the element. Though it is possible to set placeholder
     * attribute on the element itself, the component will only read the value when the component
     * is created. Subsequent changes to the element's placeholder attribute will not be picked up
     * and page authors should update the option directly.
     *
     * @example <caption>Initialize the component with the <code class="prettyprint">placeholder</code> option:</caption>
     * &lt;!-- Foo is InputDate, InputDateTime /&gt;
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojFoo', placeholder: 'Birth Date'}" /&gt;
     *
     * @example <caption>Initialize <code class="prettyprint">placeholder</code> option from html attribute:</caption>
     * &lt;!-- Foo is InputDate, InputDateTime /&gt;
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojFoo'}" placeholder="User Name" /&gt;
     *
     * @default when the option is not set, the element's placeholder attribute is used if it exists.
     * If the attribute is not set then the default can be the converter hint provided by the
     * datetime converter. See displayOptions for details.
     *
     * @access public
     * @instance
     * @expose
     * @name placeholder
     * @instance
     * @memberof! oj.ojInputDate
     */

    /**
     * List of validators used by component when performing validation. Each item is either an
     * instance that duck types {@link oj.Validator}, or is an Object literal containing the
     * properties listed below. Implicit validators created by a component when certain options
     * are present (e.g. <code class="prettyprint">required</code> option), are separate from
     * validators specified through this option. At runtime when the component runs validation, it
     * combines the implicit validators with the list specified through this option.
     * <p>
     * Hints exposed by validators are shown in the notewindow by default, or as determined by the
     * 'validatorHint' property set on the <code class="prettyprint">displayOptions</code>
     * option.
     * </p>
     *
     * <p>
     * When <code class="prettyprint">validators</code> option changes due to programmatic
     * intervention, the component may decide to clear messages and run validation, based on the
     * current state it is in. </br>
     *
     * <h4>Steps Performed Always</h4>
     * <ul>
     * <li>The cached list of validator instances are cleared and new validator hints is pushed to
     * messaging. E.g., notewindow displays the new hint(s).
     * </li>
     * </ul>
     *
     * <h4>Running Validation</h4>
     * <ul>
     * <li>if component is valid when validators changes, component does nothing other than the
     * steps it always performs.</li>
     * <li>if component is invalid and is showing messages -
     * <code class="prettyprint">messagesShown</code> option is non-empty, when
     * <code class="prettyprint">validators</code> changes then all component messages are cleared
     * and full validation run using the display value on the component.
     * <ul>
     *   <li>if there are validation errors, then <code class="prettyprint">value</code>
     *   option is not updated and the error pushed to <code class="prettyprint">messagesShown</code>
     *   option.
     *   </li>
     *   <li>if no errors result from the validation, the <code class="prettyprint">value</code>
     *   option is updated; page author can listen to the <code class="prettyprint">optionChange</code>
     *   event on the <code class="prettyprint">value</code> option to clear custom errors.</li>
     * </ul>
     * </li>
     * <li>if component is invalid and has deferred messages when validators changes, it does
     * nothing other than the steps it performs always.</li>
     * </ul>
     * </p>
     *
     * <h4>Clearing Messages</h4>
     * <ul>
     * <li>Only messages created by the component are cleared.  These include ones in
     * <code class="prettyprint">messagesHidden</code> and <code class="prettyprint">messagesShown</code>
     *  options.</li>
     * <li><code class="prettyprint">messagesCustom</code> option is not cleared.</li>
     * </ul>
     * </p>
     *
     * @property {string} type - the validator type that has a {@link oj.ValidatorFactory} that can
     * be retrieved using the {@link oj.Validation} module. For a list of supported validators refer
     * to {@link oj.ValidatorFactory}. <br/>
     * @property {Object=} options - optional Object literal of options that the validator expects.
     *
     * @example <caption>Initialize the component with validator object literal:</caption>
     * $(".selector").ojInputDate({
     *   validators: [{
     *     type: 'dateTimeRange',
     *     options : {
     *       max: '2014-09-10',
     *       min: '2014-09-01'
     *     }
     *   }],
     * });
     *
     * NOTE: oj.Validation.validatorFactory('dateTimeRange') returns the validator factory that is used
     * to instantiate a range validator for dateTime.
     *
     * @example <caption>Initialize the component with multiple validator instances:</caption>
     * var validator1 = new MyCustomValidator({'foo': 'A'});
     * var validator2 = new MyCustomValidator({'foo': 'B'});
     * // Foo is InputText, InputNumber, Select, etc.
     * $(".selector").ojFoo({
     *   value: 10,
     *   validators: [validator1, validator2]
     * });
     *
     * @expose
     * @name validators
     * @instance
     * @memberof oj.ojInputDate
     * @type {Array|undefined}
     */

    /**
     * The value of the ojInputDate component which should be an ISOString.
     *
     * @example <caption>Initialize the component with the <code class="prettyprint">value</code> option:</caption>
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojInputDate', value: '2014-09-10'}" /&gt;
     * @example <caption>Initialize the component with the <code class="prettyprint">value</code> option specified programmatically
     * using oj.IntlConverterUtils.dateToLocalIso :</caption>
     * $(".selector").ojInputDate({'value': oj.IntlConverterUtils.dateToLocalIso(new Date())});<br/>
     * @example <caption>Get or set the <code class="prettyprint">value</code> option, after initialization:</caption>
     * // Getter: returns Today's date in ISOString
     * $(".selector").ojInputDate("option", "value");
     * // Setter: sets it to a different date
     * $(".selector").ojInputDate("option", "value", "2013-12-01");
     *
     * @expose
     * @name value
     * @instance
     * @memberof! oj.ojInputDate
     * @default When the option is not set, the element's value property is used as its initial value
     * if it exists. This value must be an ISOString.
     */

  },

  /**
   * @ignore
   * @protected
   */
  _InitBase : function ()
  {
    this._triggerNode = null;
    this._inputContainer = null;
    this._redirectFocusToInputContainer = false;
    this._isMobile = false;
    
    //only case is when of showOn of focus and one hides the element [need to avoid showing]
    this._ignoreShow = false; 
    
    // need this flag to keep track of native picker opened, there is no callback on native API
    //  to find out otherwise.
    this._nativePickerShowing = false;
    this._maxRows = 4;

    this._currentDay = 0;
    this._drawMonth = this._currentMonth = 0;
    this._drawYear = this._currentYear = 0;

    this._datePickerDefaultValidators = {};
    this._nativePickerConverter = null;

    var nodeName = this.element[0].nodeName.toLowerCase();
    this._isInLine = (nodeName === "div" || nodeName === "span");

    this._dpDiv = bindHover($("<div id='" + this._GetSubId(this._MAIN_DIV_ID) + "' role='region' aria-describedby='" + this._GetSubId(this._DATEPICKER_DESCRIPTION_ID) + "' class='oj-datepicker-content'></div>"));
    $("body").append(this._dpDiv); //@HTMLUpdateOK

    if(this._isInLine)
    {
      //if inline then there is no input element, so reset _CLASS_NAMES
      // TODO:Jmw trying to understand what to do in the case of inline. If it is dateTime inline, then I don't wrap the date part.
      // But if it is just date inline, I should... but the use case is probably not frequent.
      this._WIDGET_CLASS_NAMES += this._INLINE_WIDGET_CLASS;
      this._CLASS_NAMES = "";
    }
    else
    {
      //append input container class to be applied to the root node as well, since not inline
      //[note the special case where input container class will NOT be on the widget node is when
      //ojInputDateTime is of inline and ojInputTime places container around the input element]
      // jmw. this is now different. It's no longer on the widget. I add a new wrapper dom.
      // Ji will need to help me with this probably.
      // One thing I know I'm not doing is wrapping the calendar if only date. hmm...
      this._ELEMENT_TRIGGER_WRAPPER_CLASS_NAMES += this._INPUT_CONTAINER_CLASS;
      var self = this;
      this._popUpDpDiv = this._dpDiv.ojPopup({"initialFocus": "none", 
                                              "modality": "modeless",
                                              "open": function () {
                                                  if (self.options["datePicker"]["showOn"] === "image")
                                                  {
                                                    self._dpDiv.find(".oj-datepicker-calendar").focus();
                                                  }
                                              },
                                              rootAttributes: {"class": "oj-datepicker-popup"}
                                            });

      var pickerAttrs = this.options.pickerAttributes;
      if (pickerAttrs)
        oj.EditableValueUtils.setPickerAttributes(this._popUpDpDiv.ojPopup("widget"), pickerAttrs);

    }
  },

  /**
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputDate
   */
  _ComponentCreate : function ()
  {
    this._InitBase();

    var retVal = this._super();

    if(this.options["dayMetaData"])
    {
      this.options["dayFormatter"] = (function(value)
      {
        return function(dateInfo) {
          return _getMetaData(value, 0, [dateInfo["fullYear"], dateInfo["month"], dateInfo["date"]]);
        };
      })(this.options["dayMetaData"]);
    }

    //if isoString has a different timezone then the one provided in the converter, need to perform 
    //conversion so pass it through the method
    if(this.options["value"])
    {
      var formatted = this._GetConverter()["format"](this.options["value"]);
      this._SetValue(formatted, {});
    }

    //Need to set the currentDay, currentMonth, currentYear to either the value or the default of today's Date
    //Note that these are days indicator for the datepicker, so it is correct in using today's date even if value 
    //hasn't been set
    this._setCurrentDate(this._getDateIso());
    
    // jmw. Add a wrapper around the element and the trigger. This is needed so that we can
    // add inline messages to the root dom node. We want the input+trigger to be one child and
    // the inline messages to be another child of the root dom node. This way the inline
    // messages can be stacked after the main component, and will grow or shrink in size the same
    // as the main component.
    // doing this in InputBase now. $(this.element).wrap( $("<div>").addClass(this._ELEMENT_TRIGGER_WRAPPER_CLASS_NAMES));

    if (this._isInLine)
    {
      this.element.append(this._dpDiv); //@HTMLUpdateOK
      this.element.addClass(this._INLINE_CLASS); //by applying the inline class it places margin bottom, to separate in case ojInputTime exists

      // Set display:block in place of inst._dpDiv.show() which won't work on disconnected elements
      // http://bugs.jqueryui.com/ticket/7552 - A Datepicker created on a detached div has zero height
      this._dpDiv.css("display", "block");
    }
    else
    {
      this._processReadOnlyKeyboardEdit();
      this._attachTrigger();
    }

    this._registerSwipeHandler();
    
    // attach active state change handlers
    bindActive(this);
    return retVal;
  },

  /**
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputDate
   */
  _AfterCreate : function ()
  {
    var ret = this._superApply(arguments);

    this._disableEnable(this.options["disabled"]);

    return ret;
  },

  /**
   * @ignore
   * @protected
   * @override
   */
  _setOption : function __setOption(key, value, flags)
  {

    var retVal = null;

    //When a null, undefined, or "" value is passed in set to null for consistency
    //note that if they pass in 0 it will also set it null
    if (key === "value")
    {
      if(!value)
      {
        value = null;
      }

      retVal = this._super(key, value, flags);
      this._setCurrentDate(value);
      
      if(this._datepickerShowing())
      {
        // _setOption is called after user picks a date from picker, we dont want to bring
        //  focus to input element if the picker is showing still for the non-inline case. For the
        //  case of inline date picker, if there is a time field and already focussed (brought in when
        //  the picker was hidden), we want to update the date picker, but not set focus on it.
        var focusOnCalendar = !(this._isInLine && this._timePicker && this._timePicker[0] === document.activeElement);
        this._updateDatepicker(focusOnCalendar);
      }
      
      return retVal;
    }

    if (key === "dayMetaData")
    {
      //need to invoke w/ dayFormatter and return for the case where user invoke $("selector").ojInputDate("option", "dayMetaData", {});
      //since that doesn't trigger ComponentBinding

      this._setOption("dayFormatter", function(dateInfo) {
          return _getMetaData(value, 0, [dateInfo["fullYear"], dateInfo["month"], dateInfo["date"]]);
      }, flags);
      return; //avoid setting in this.options and etc
    }

    retVal = this._super(key, value, flags);

    if (key === "disabled")
    {
      this._disableEnable(value);
    }
    else if (key === "max" || key === "min")
    {
      //since validators are immutable, they will contain min + max as local values. B/c of this will need to recreate
      this._datePickerDefaultValidators[oj.ValidatorFactory.VALIDATOR_TYPE_DATETIMERANGE] = this._getValidator("min");

      this._AfterSetOptionValidators();
    }
    else if(key === "readOnly")
    {
      this._processReadOnlyKeyboardEdit();

      if (value)
      {
        this._hide(this._ON_CLOSE_REASON_CLOSE);
      }
    }
    else if(key === "keyboardEdit")
    {
      this._processReadOnlyKeyboardEdit();
    }
    else if (key === "dayFormatter")
    {
      //since validators are immutable, they will contain dayFormatter as local values. B/c of this will need to recreate
      this._datePickerDefaultValidators[oj.ValidatorFactory.VALIDATOR_TYPE_DATERESTRICTION] = this._getValidator("dayFormatter");

      this._AfterSetOptionValidators();
    }
    else if(key === "converter") 
    {
      this._nativePickerConverter = null;
    }

    if (key === "datePicker" && flags["subkey"] === "currentMonthPos")
    {
      //need to reset up the drawMonth + drawYear
      this._setCurrentDate(this._getDateIso());
    }
    
    var updateDatePicker = {"max": true, "min": true, "dayFormatter": true, "datePicker": true, "translations": true};

    if(this._datepickerShowing() && key in updateDatePicker)
    {
      this._updateDatepicker();
    }

    return retVal;
  },

  /**
   * @ignore
   */
  _processReadOnlyKeyboardEdit: function()
  {
    var readonly = this.options["readOnly"] ||
            this._isKeyboardEditDisabled();
    this.element.prop("readOnly", !!readonly);
  },

  /**
   * @ignore
   * @return {boolean}
   */
  _isKeyboardEditDisabled: function()
  {
    return this.options["keyboardEdit"] === this._KEYBOARD_EDIT_OPTION_DISABLED;
  },

  /**
   * Need to override due to usage of display: inline-table [as otherwise for webkit the hidden content takes up
   * descent amount of space]
   *
   * @protected
   * @instance
   * @memberOf !oj.ojInputDate
   */
  _AppendInputHelperParent : function ()
  {
    return this._triggerNode;
  },

  /**
   * @ignore
   * @protected
   * @override
   */
  _destroy : function __destroy()
  {
    var retVal = this._super();

    var triggerRootContainer = $(this.element[0]).parent().parent();
    this._RemoveActiveable(triggerRootContainer);

    this.element.off("focus touchstart");
    this._wrapper.off("touchstart");

    if (this._triggerNode)
    {
      this._triggerNode.remove();
    }

    if(this._isInLine)
    {
      //need to remove disabled + readOnly b/c they are set by super classes and datepicker is special in that this.element
      //can be a div element for inline mode
      this.element.removeProp("disabled");
      this.element.removeProp("readonly");
    }

    this._dpDiv.remove();
    return retVal;
  },

  _datepickerShowing: function()
  {
    return this._isInLine || this._popUpDpDiv.ojPopup("isOpen") || this._nativePickerShowing;
  },

  /**
   * @protected
   * @override
   */
  _WrapElement: function()
  {
    this._inputContainer = this._superApply(arguments);
    this._inputContainer.attr({"role": "combobox", "aria-haspopup": "true", "tabindex": "-1"});
  },

  /**
   * When input element has focus
   * @private
   */
  _onElementFocus : function()
  {
    var showOn = this.options["datePicker"]["showOn"];
    
    if(this._redirectFocusToInputContainer) 
    {
      this._redirectFocusToInputContainer = false;
      this._inputContainer.focus();
    }
    else
    {
      if (showOn === "focus")
      {
        // pop-up date picker when focus placed on the input box
        this.show();
      }
      else 
      {
        if(this._datepickerShowing()) 
        {
          this._hide(this._ON_CLOSE_REASON_CLOSE);
        }
      }
    }
  },

  /**
   * When input element is touched
   * 
   * @ignore
   * @protected
   */
  _OnElementTouchStart : function()
  {
    var showOn = this.options["datePicker"]["showOn"];

    // If the focus is already on the text box and can't edit with keyboard
    // and show on is focus then reopen the picker.
    if(showOn === "focus")
    {
      if (this._datepickerShowing()) 
      {
        this._ignoreShow = true;
        this._hide(this._ON_CLOSE_REASON_CLOSE);
      }
      else
      {
        var inputActive = this.element[0] === document.activeElement;

        this.show();
        this._redirectFocusToInputContainer = true;

        if(inputActive) 
        {
          this._inputContainer.focus();
        }
      }
    }
  },

  /**
   * This function will create the necessary calendar trigger container [i.e. image to launch the calendar]
   * and perform any attachment to events
   *
   * @private
   */
  _attachTrigger : function()
  {
    var showOn = this.options["datePicker"]["showOn"];
    var triggerContainer = $("<span>").addClass(this._TRIGGER_CLASS);

    // pop-up date picker when button clicked
    var triggerCalendar = 
      $("<span title='" + this._getCalendarTitle() + "'/>").addClass(this._TRIGGER_CALENDAR_CLASS + " oj-clickable-icon-nocontext oj-component-icon");
    
    triggerContainer.append(triggerCalendar); //@HTMLUpdateOK

    this.element.on("focus", $.proxy(this._onElementFocus, this));
    this.element.on("touchstart", $.proxy(this._OnElementTouchStart, this));

    var self = this;

    this._wrapper.on("touchstart", function(e)
    {
      self._isMobile = true;
    });

    if (showOn === "image")
    {
      // we need to show the icon that we hid by display:none in the mobile themes
      triggerCalendar.css("display", "block");
      
      // In iOS theme, we defaulted to use border radius given that showOn=focus is default and
      //  we will not have trigger icon. For showOn=image case, we will show the icon, so
      //  we need to remove the border radius. iOS is the only case we use border radius, so this
      //  setting for all cases is fine.
      if (this._IsRTL())
      {
        this.element.css("border-top-left-radius", 0);
        this.element.css("border-bottom-left-radius", 0);
      }
      else
      {
        this.element.css("border-top-right-radius", 0);
        this.element.css("border-bottom-right-radius", 0);
      }
    }

    triggerCalendar.on("click", function ()
    {
      if (self._datepickerShowing())
      {
        self._hide(self._ON_CLOSE_REASON_CLOSE);
      }
      else
      {
        self.show();
        self._dpDiv.find(".oj-datepicker-calendar").focus();
      }
      return false;
    });

    this._AddHoverable(triggerCalendar);
    this._AddActiveable(triggerCalendar);

    this._triggerIcon = triggerCalendar;
    this._triggerNode = triggerContainer;
    this.element.after(triggerContainer); //@HTMLUpdateOK
  },

  //This handler is when an user keys down with the calendar having focus
  _doCalendarKeyDown : function (event)
  {
    var sel, handled = false,
        kc = $.ui.keyCode,
        isRTL = this._IsRTL();

    if (this._datepickerShowing())
    {
      switch (event.keyCode)
      {
        case 84: //t character
          if (event.altKey && event.ctrlKey)
          {
            this._dpDiv.find(".oj-datepicker-current").focus();
            handled = true;
          }
          break;
        case kc.TAB:
          // Tab key is used to navigate to different buttons/links in the
          // datepicker to make them accessible.  It shouldn't be used to hide
          // the datepicker.
          break;
        case kc.SPACE:
        case kc.ENTER:
          sel = $("td." + this._DAYOVER_CLASS, this._dpDiv);
          if (sel[0])
          {
            this._selectDay(this._currentMonth, this._currentYear, sel[0], event);
          }
          //need to return false so preventing default + stop propagation here
          event.preventDefault();
          event.stopPropagation();
          return false;
        case kc.ESCAPE:
          this._hide(this._ON_CLOSE_REASON_CANCELLED);
          handled = true;
          break;// hide on escape
        case kc.PAGE_UP:
          if(event.ctrlKey && event.altKey)
          {
            this._adjustDate(- this.options["datePicker"]["stepBigMonths"], "M", true);
          }
          else if (event.altKey)
          {
            this._adjustDate( - 1, "Y", true);
          }
          else
          {
            this._adjustDate(- this._getStepMonths(), "M", true);
          }
          handled = true;
          break;// previous month/year on page up/+ ctrl
        case kc.PAGE_DOWN:
          if(event.ctrlKey && event.altKey)
          {
            this._adjustDate(+ this.options["datePicker"]["stepBigMonths"], "M", true);
          }
          else if (event.altKey)
          {
            this._adjustDate(1, "Y", true);
          }
          else
          {
            this._adjustDate(+ this._getStepMonths(), "M", true);
          }
          handled = true;
          break;// next month/year on page down/+ ctrl
        case kc.END:
          this._currentDay = this._getDaysInMonth(this._currentYear, this._currentMonth);
          this._updateDatepicker(true);
          handled = true;
          break;
        case kc.HOME:
          this._currentDay = 1;
          this._updateDatepicker(true);
          handled = true;
          break;
        case kc.LEFT:
          this._adjustDate((isRTL ?  + 1 :  - 1), "D", true);
          // -1 day on ctrl or command +left
          if (event.originalEvent.altKey)
          {
            this._adjustDate((event.ctrlKey ?  - this.options["datePicker"]["stepBigMonths"] :  - this._getStepMonths()), "M", true);
          }
          // next month/year on alt +left on Mac
          handled = true;
          break;
        case kc.UP:
          this._adjustDate( - 7, "D", true);
          handled = true;
          break;// -1 week on ctrl or command +up
        case kc.RIGHT:
          this._adjustDate((isRTL ?  - 1 :  + 1), "D", true);
          // +1 day on ctrl or command +right
          if (event.originalEvent.altKey)
          {
            this._adjustDate((event.ctrlKey ?  + this.options["datePicker"]["stepBigMonths"] :  + this._getStepMonths()), "M", true);
          }
          // next month/year on alt +right
          handled = true;
          break;
        case kc.DOWN:
          this._adjustDate( + 7, "D", true);
          handled = true;
          break;// +1 week on ctrl or command +down
        default : ;
      }
    }
    else if (event.keyCode === kc.HOME && event.ctrlKey)
    {
      // display the date picker on ctrl+home
      this.show();
      handled = true;
    }

    if (handled)
    {
      event.preventDefault();
      event.stopPropagation();
    }

  },

  //This handler is when an user keys down with the Month View having focus
  _doMonthViewKeyDown : function(event)
  {
    var sel, handled = false,
        kc = $.ui.keyCode,
        isRTL = this._IsRTL();

    if (this._datepickerShowing())
    {
      switch (event.keyCode)
      {
        case 84: //t character
          if (event.altKey && event.ctrlKey)
          {
            this._dpDiv.find(".oj-datepicker-current").focus();
            handled = true;
          }
          break;
        case kc.SPACE:
        case kc.ENTER:
          sel = $("td." + this._DAYOVER_CLASS, this._dpDiv);
          if (sel[0])
          {
            this._selectMonthYear(sel[0], 'M');
          }
          //need to return false so preventing default + stop propagation here
          event.preventDefault();
          event.stopPropagation();
          return false;
        case kc.ESCAPE:
          this.hide();
          handled = true;
          break;// hide on escape
        case kc.PAGE_UP:
          if(event.ctrlKey && event.altKey)
          {
            this._adjustDate(- this.options["datePicker"]["stepBigMonths"], "M", true, 'month');
          }
          else if (event.altKey)
          {
            this._adjustDate( - 1, "Y", true, 'month');
          }
          else
          {
            this._adjustDate(- this._getStepMonths(), "M", true, 'month');
          }
          handled = true;
          break;// previous month/year on page up/+ ctrl
        case kc.PAGE_DOWN:
          if(event.ctrlKey && event.altKey)
          {
            this._adjustDate(+ this.options["datePicker"]["stepBigMonths"], "M", true, 'month');
          }
          else if (event.altKey)
          {
            this._adjustDate(1, "Y", true, 'month');
          }
          else
          {
            this._adjustDate(+ this._getStepMonths(), "M", true, 'month');
          }
          handled = true;
          break;// next month/year on page down/+ ctrl
        case kc.END:
          this._currentMonth = 11;
          this._updateDatepicker(true, 'month');
          handled = true;
          break;
        case kc.HOME:
          this._currentMonth = 0;
          this._updateDatepicker(true, 'month');
          handled = true;
          break;
        case kc.LEFT:
          this._adjustDate((isRTL ?  + 1 :  - 1), "M", true, 'month');
          handled = true;
          break;
        case kc.UP:
          this._adjustDate( - 3, "M", true, 'month');
          handled = true;
          break;// -1 week on ctrl or command +up
        case kc.RIGHT:
          this._adjustDate((isRTL ?  - 1 :  + 1), "M", true, 'month');
          handled = true;
          break;
        case kc.DOWN:
          this._adjustDate( + 3, "M", true, 'month');
          handled = true;
          break;// +1 week on ctrl or command +down
        default : ;
      }
    }
    else if (event.keyCode === kc.HOME && event.ctrlKey)
    {
      // display the date picker on ctrl+home
      this.show();
      handled = true;
    }

    if (handled)
    {
      event.preventDefault();
      event.stopPropagation();
    }

  },

  //This handler is when an user keys down with the Year View having focus
  _doYearViewKeyDown : function(event)
  {
    var sel, handled = false,
        kc = $.ui.keyCode,
        isRTL = this._IsRTL();

    if (this._datepickerShowing())
    {
      switch (event.keyCode)
      {
        case 84: //t character
          if (event.altKey && event.ctrlKey)
          {
            this._dpDiv.find(".oj-datepicker-current").focus();
            handled = true;
          }
          break;
        case kc.SPACE:
        case kc.ENTER:
          sel = $("td." + this._DAYOVER_CLASS, this._dpDiv);
          if (sel[0])
          {
            this._selectMonthYear(sel[0], 'Y');
          }
          //need to return false so preventing default + stop propagation here
          event.preventDefault();
          event.stopPropagation();
          return false;
        case kc.ESCAPE:
          this.hide();
          handled = true;
          break;// hide on escape
        case kc.PAGE_UP:
          if (event.altKey)
          {
            this._adjustDate( - 1, "Y", true, 'year');
          }
          handled = true;
          break;// previous month/year on page up/+ ctrl
        case kc.PAGE_DOWN:
          if (event.altKey)
          {
            this._adjustDate(1, "Y", true, 'year');
          }
          handled = true;
          break;// next month/year on page down/+ ctrl
        case kc.END:
          this._currentYear = Math.floor(this._currentYear / 10) * 10 + 9;
          this._updateDatepicker(true, 'year');
          handled = true;
          break;
        case kc.HOME:
          this._currentYear = Math.floor(this._currentYear / 10) * 10;
          this._updateDatepicker(true, 'year');
          handled = true;
          break;
        case kc.LEFT:
          this._adjustDate((isRTL ?  + 1 :  - 1), "Y", true, 'year');
          handled = true;
          break;
        case kc.UP:
          this._adjustDate( - 3, "Y", true, 'year');
          handled = true;
          break;// -1 week on ctrl or command +up
        case kc.RIGHT:
          this._adjustDate((isRTL ?  - 1 :  + 1), "Y", true, 'year');
          handled = true;
          break;
        case kc.DOWN:
          this._adjustDate( + 3, "Y", true, 'year');
          handled = true;
          break;// +1 week on ctrl or command +down
        default : ;
      }
    }
    else if (event.keyCode === kc.HOME && event.ctrlKey)
    {
      // display the date picker on ctrl+home
      this.show();
      handled = true;
    }

    if (handled)
    {
      event.preventDefault();
      event.stopPropagation();
    }

  },

  /**
   * Thie function will update the calendar display
   *
   * @private
   * @param {boolean=} focusOnCalendar - Whether to put focus in the calendar.
   * @param {string=} view - The view to update to. Default is 'day'. 
   * @param {string=} navigation - Type of navigation to animate.
   */
  _updateDatepicker : function (focusOnCalendar, view, navigation)
  {
    this._maxRows = 4;//Reset the max number of rows being displayed (see #7043)
    var generatedHtmlContent;

    if (view === 'year')
    {
      generatedHtmlContent = this._generateYearViewHTML();
    }
    else if (view === 'month')
    {
      generatedHtmlContent = this._generateMonthViewHTML();
    }
    else
    {
      generatedHtmlContent = this._generateDayViewHTML();
    }

    generatedHtmlContent.html = "<div class='oj-datepicker-wrapper'>" + generatedHtmlContent.html + "</div>";

    this._currentView = view;

    if (navigation)
    {
      var oldChild = this._dpDiv.children().first();
      oldChild.css({position: 'absolute', left: 0, top: 0});

      this._dpDiv.prepend(generatedHtmlContent.html);
      var newChild = this._dpDiv.children().first();
      var direction = (navigation == 'previous') ? 'end' : 'start';
      
      oj.AnimationUtils.startAnimation(newChild[0], 'open', {'effect':'slideIn', 'direction':direction});
      var promise = oj.AnimationUtils.startAnimation(oldChild[0], 'close', {'effect':'slideOut', 'direction':direction, 'persist':'all'});
      var self = this;
      promise.then(function() {
        if (oldChild)
        {
          oldChild.remove();
        }
        
        self._setupNewView(focusOnCalendar, view, generatedHtmlContent.dayOverId);
      });
    }
    else
    {
      this._dpDiv.empty().append(generatedHtmlContent.html); //@HTMLUpdateOK
      this._setupNewView(focusOnCalendar, view, generatedHtmlContent.dayOverId);
    }
  },

  _setupNewView : function(focusOnCalendar, view, dayOverId)
  {
    var buttons = $("button", this._dpDiv);

    if(buttons.length > 0)
    {
      if(buttons.length === 1)
      {
        //need to center it as requested by UX
        $(buttons[0]).addClass("oj-datepicker-single-button");
      }

      $.each(buttons, function (index, ele)
      {
        $(ele).ojButton();
      });

    }

    this._attachHandlers();

    if (dayOverId)
    {
      this._dpDiv.find(".oj-datepicker-calendar").attr("aria-activedescendant", dayOverId);
    }

    var numMonths = this._getNumberOfMonths(),
        cols = numMonths[1],
        width = 300;

    this._dpDiv.removeClass("oj-datepicker-multi-2 oj-datepicker-multi-3 oj-datepicker-multi-4").width("");
    if (view === 'year' || view === 'month')
    {
      this._dpDiv.removeClass("oj-datepicker-multi");
    }
    else
    {
      numMonths = this._getNumberOfMonths(),
          cols = numMonths[1];

      if (cols > 1)
      {
        this._dpDiv.addClass("oj-datepicker-multi-" + cols).css("width", (width * cols) + "px");
      }
      this._dpDiv[(numMonths[0] !== 1 || numMonths[1] !== 1 ? "add" : "remove") + "Class"]("oj-datepicker-multi");
    }

    // #6694 - don't focus the input if it's already focused
    // this breaks the change event in IE
    if (this._datepickerShowing() && this.element.is(":visible") && !this.element.is(":disabled"))
    {
      if (!focusOnCalendar)
      {
        if (!this._isInLine && this.element[0] !== document.activeElement)
        {
          this.element.focus();
        }
      }
      else
      {
        var calendar = this._dpDiv.find(".oj-datepicker-calendar");
        if (calendar[0] !== document.activeElement)
        {
          $(calendar[0]).focus();
        }
      }
    }

  },

  /**
   * Adjust one of the date sub-fields.
   *
   * @private
   * @param {number} offset
   * @param {string} period
   * @param {boolean=} focusOnCalendar - Whether to put focus in the calendar.
   * @param {string=} view - The view to update to. Default is 'day'. 
   * @param {string=} navigation - Type of navigation to animate.
   */
  _adjustDate : function (offset, period, focusOnCalendar, view, navigation)
  {
    if (this.options["disabled"])
    {
      return;
    }
    this._adjustInstDate(offset + (period === "M" ? this.options["datePicker"]["currentMonthPos"] : 0), // undo positioning
                          period);
    this._updateDatepicker(focusOnCalendar, view, navigation);
  },

  /**
   * Action for current link. Note that this is of today relative to client's locale so this is ok.
   * 
   * @private
   */
  _gotoToday : function ()
  {
    var date = new Date();

    this._currentDay = date.getDate();
    this._drawMonth = this._currentMonth = date.getMonth();
    this._drawYear = this._currentYear = date.getFullYear();

    this._adjustDate(null, null, true, 'day');
  },

  /**
   * Action for selecting a new month/year.
   *
   * @private
   * @param {Object} select
   * @param {string} period
   */
  _selectMonthYear : function (select, period)
  {
    var selected;
    var converterUtils = oj.IntlConverterUtils;
    var value = this._getDateIso();
    var yearAttr = select.getAttribute("data-year");

    if (yearAttr)
    {
      selected = parseInt(yearAttr, 10);
      this._currentYear = this._drawYear = selected;
    }

    if (period === "M")
    {
      selected = parseInt(select.getAttribute("data-month"), 10);
      this._currentMonth = this._drawMonth = selected;
      value = converterUtils._dateTime(value, {"fullYear": this._currentYear, "month": this._currentMonth});
    }
    else
    {
      value = converterUtils._dateTime(value, {"fullYear": this._currentYear});
    }

    //Take care of accessibility. Note that this is using an INTERNAL converter to display only the year portion [no timezone]
    //so is okay
    $("#" + this._GetSubId(this._CALENDAR_DESCRIPTION_ID)).html(this._EscapeXSS(this.options["monthWide"][this._drawMonth]) + " " + 
      yearDisplay.format(oj.IntlConverterUtils.dateToLocalIso(new Date(this._drawYear, this._drawMonth, 1)))); //@HTMLUpdateOK

    this._adjustDate(0, 0, true, period === "M" ? 'day' : this._toYearFromView);
  },

  //Action for selecting a day.
  _selectDay : function (month, year, td, event)
  {
    if ($(td).hasClass(this._UNSELECTABLE_CLASS) || this.options["disabled"])
    {
      return;
    }

    this._currentDay = $("a", td).html();
    this._currentMonth = month;
    this._currentYear = year;

    var converterUtils = oj.IntlConverterUtils,
        value = this.options['value'],
        tempDate = new Date(this._currentYear, this._currentMonth, this._currentDay);
    
    if (value)
    {
      
      //need to preserve the time portion when of ojInputDateTime, so update only year, month, and date
      value = converterUtils._dateTime(value, {"fullYear": tempDate.getFullYear(), "month": tempDate.getMonth(), 
                "date": tempDate.getDate()});
    }
    else 
    {
      //per discussion when date doesn't exist use local isostring
      value = converterUtils.dateToLocalIso(tempDate);
    }
    
    this._setDisplayAndValue(value, {});
    this._hide(this._ON_CLOSE_REASON_SELECTION);
  },

  _setDisplayAndValue: function(isoString, event)
  {
    var formatted = this._GetConverter()["format"](isoString);
    this._SetDisplayValue( formatted ); //need to set the display value, since _SetValue doesn't trigger it per discussion
                                        //need to use formatted value as otherwise it doesn't go through framework's cycle
                                        //in updates
    this._SetValue(formatted, event); //TEMP TILL FIXED PASS IN formatted
  },
  
  /**
   * Get the default isostring date
   * 
   * @ignore
   * @private
   */
  _getDefaultIsoDate: function() 
  {
    return oj.IntlConverterUtils.dateToLocalIso(this._getTodayDate());
  },
  
  /**
   * Updates the internal current + draw values
   * 
   * @private
   * @param {string} isoDate
   */
  _setCurrentDate : function (isoDate)
  {
    var newDate = oj.IntlConverterUtils._dateTime(isoDate || this._getDefaultIsoDate(), ["fullYear", "month", "date"], 
                                              true);

    this._currentDay = newDate["date"];
    this._drawMonth = this._currentMonth = newDate["month"];
    this._drawYear = this._currentYear = newDate["fullYear"];

    this._adjustInstDate();
  },

  _getStepMonths : function ()
  {
    var stepMonths = this.options["datePicker"]["stepMonths"];
    return $.isNumeric(stepMonths) ? stepMonths : this.options["datePicker"]["numberOfMonths"];
  },

  // Check if an event is a button activation event
  _isButtonActivated : function(evt)
  {
    // We are using <a role='button'> for the buttons.  They fire click event
    // on Enter keydown.  We just need to check for Space key here.
    return(!this.options["disabled"] &&
           ((evt.type === 'click') ||
            (evt.type === 'keydown' && evt.keyCode === 32)));
  },

  _gotoPrev : function(stepMonths)
  {
    if (this._currentView === 'year')
    {
      this._adjustDate(-10, "Y", true, 'year', 'previous');
    }
    else if (this._currentView === 'month')
    {
      this._adjustDate(-1, "Y", true, 'month', 'previous');
    }
    else
    {
      this._adjustDate( - stepMonths, "M", true, 'day', 'previous');
    }
  },

  _gotoNext: function(stepMonths)
  {
    if (this._currentView === 'year')
    {
      this._adjustDate(+10, "Y", true, 'year', 'next');
    }
    else if (this._currentView === 'month')
    {
      this._adjustDate(+1, "Y", true, 'month', 'next');
    }
    else
    {
      this._adjustDate( + stepMonths, "M", true, 'day', 'next');
    }
  },

  /**
   * Attach the onxxx handlers.  These are declared statically so
   * they work with static code transformers like Caja.
   *
   * @private
   */
  _attachHandlers : function ()
  {
    var stepMonths = this._getStepMonths(), self = this;
    this._dpDiv.find("[data-handler]").map(function ()
    {
      var handler =
      {
        /** @expose */
        prev : function (evt)
        {
          if (self._isButtonActivated(evt))
          {
            self._gotoPrev(stepMonths);
            return false;
          }
        },
        /** @expose */
        next : function (evt)
        {
          if (self._isButtonActivated(evt))
          {
            self._gotoNext(stepMonths);
            return false;
          }
        },
        /** @expose */
        today : function (evt)
        {
          if (self._isButtonActivated(evt))
          {
            self._gotoToday();
            return false;
          }
        },
        /** @expose */
        selectDay : function (evt)
        {
          self._selectDay( + this.getAttribute("data-month"),  + this.getAttribute("data-year"), this, evt);
          return false;
        },
        /** @expose */
        selectMonth : function ()
        {
          self._selectMonthYear(this, "M");
          return false;
        },
        /** @expose */
        selectYear : function ()
        {
          self._selectMonthYear(this, "Y");
          return false;
        },
        /** @expose */
        calendarKey : function (evt)
        {
          if (self._currentView === 'year')
          {
            self._doYearViewKeyDown(evt);
          }
          else if (self._currentView === 'month')
          {
            self._doMonthViewKeyDown(evt);
          }
          else
          {
            self._doCalendarKeyDown(evt);
          }
        },
        /** @expose */
        selectMonthHeader : function (evt)
        {
          if (self._isButtonActivated(evt))
          {
            if (self._currentView === 'month')
            {
              self._updateDatepicker(true, 'day');
            }
            else
            {
              self._updateDatepicker(true, 'month');
            }
            return false;
          }
        },
        /** @expose */
        selectYearHeader : function (evt)
        {
          if (self._isButtonActivated(evt))
          {
            if (self._currentView === 'year')
            {
              self._updateDatepicker(true, 'day');
            }
            else
            {
              // Remember where we are navigating to the Year view from
              self._toYearFromView = self._currentView;
              self._updateDatepicker(true, 'year');
            }
            return false;
          }
        }
      };
      $(this).bind(this.getAttribute("data-event"), handler[this.getAttribute("data-handler")]);
    });

    // Only show the day focus if the user starts using keyboard
    this._dpDiv.find(".oj-datepicker-calendar").map(function ()
    {
      oj.DomUtils.makeFocusable({
        'element': $(this),
        'applyHighlight': true
      });
    });

    // Avoid problem with hover/active state on header/footer not going away on touch devices
    var buttons = this._dpDiv.find(".oj-datepicker-header a, .oj-datepicker-buttonpane a");
    this._AddHoverable(buttons);
    this._AddActiveable(buttons);
  },
  
  _registerSwipeHandler : function()
  {
    if (oj.DomUtils.isTouchSupported())
    {
      var self = this;
      var stepMonths = this._getStepMonths();
      var rtl = this._IsRTL();
      var options = {
        'recognizers': [
          [Hammer.Swipe, {'direction': Hammer['DIRECTION_HORIZONTAL']}]
      ]};

      this._dpDiv.ojHammer(options).on(rtl ? 'swiperight' : 'swipeleft', function(evt)
      {
        self._gotoNext(stepMonths);
        return false;
      })
      .on(rtl ? 'swipeleft' : 'swiperight', function(evt) {
        self._gotoPrev(stepMonths);
        return false;
      });
    }
  },

  /**
   * Generate the HTML for the current state of the date picker.
   * 
   * @private
   */
  _getMinMaxDateIso : function(minOrMax)
  {
    var minMaxDateIso = this.options[minOrMax];
    if(minMaxDateIso) 
    {
      var dateIso = this._getDateIso();
      minMaxDateIso = oj.IntlConverterUtils._minMaxIsoString(minMaxDateIso, dateIso);
    }
    
    return minMaxDateIso;
  },
  
  /**
   * Generate the HTML for the header of the date picker.
   * 
   * @private
   */
  _generateHeader : function(drawMonth, drawYear, monthControl, enablePrev, enableNext)
  {
    var header;
    var prevText, prev, nextText, next;
    var isRTL = this._IsRTL();

    prevText = this._EscapeXSS(this.getTranslatedString("prevText"));

    prev = (enablePrev ? "<a role='button' href='#' class='oj-datepicker-prev-icon oj-enabled oj-default oj-component-icon oj-clickable-icon-nocontext' data-handler='prev' data-event='click keydown'" + " title='" + prevText + "'></a>" : "<a class='oj-datepicker-prev-icon oj-disabled oj-component-icon oj-clickable-icon-nocontext' title='" + prevText + "'></a>");

    nextText = this._EscapeXSS(this.getTranslatedString("nextText"));

    next = (enableNext ? "<a role='button' href='#' class='oj-datepicker-next-icon oj-enabled oj-default oj-component-icon oj-clickable-icon-nocontext' data-handler='next' data-event='click keydown'" + " title='" + nextText + "'></a>" : "<a class='oj-datepicker-next-icon oj-disabled oj-component-icon oj-clickable-icon-nocontext' title='" + nextText + "'></a>");
    
    header = "<div class='oj-datepicker-header" + (this.options["disabled"] ? " oj-disabled " : " oj-enabled oj-default ") + "'>";

    header += (/all|left/.test(monthControl) ? (isRTL ? next : prev) : "");
    header += (/all|right/.test(monthControl) ? (isRTL ? prev : next) : "");
    header += this._generateMonthYearHeader(drawMonth, drawYear);

    header += "</div>";

    return header;
  },

  /**
   * Generate the HTML for the footer of the date picker.
   * 
   * @private
   */
  _generateFooter : function(footerLayoutDisplay, gotoDate)
  {
    var footerLayout = "";
    var currentText = this._EscapeXSS(this.getTranslatedString("currentText"));
    var enabledClass = this.options["disabled"] ? "oj-disabled disabled" : "oj-enabled";
    var todayControl = "<a role='button' href='#' class='oj-datepicker-current oj-priority-secondary " + (this.options["disabled"] ? "oj-disabled' disabled" : "oj-enabled'") + " data-handler='today' data-event='click keydown'" + ">" + currentText + "</a>";

    if(footerLayoutDisplay.length > 1) //keep the code for future multiple buttons
    {
      var todayIndex = footerLayoutDisplay.indexOf("today"),
          loop = 0,
          footerLayoutButtons = [{index: todayIndex, content: (this._isInRange(gotoDate) ? todayControl : "")}];

      //rather than using several if + else statements, sort the content to add by index of the strings
      footerLayoutButtons.sort(function(a, b)
      {
        return a.index - b.index;
      });

      //continue to loop until the index > -1 [contains the string]
      while(loop < footerLayoutButtons.length && footerLayoutButtons[loop].index < 0) { loop++; }

      while(loop < footerLayoutButtons.length)
      {
        footerLayout += footerLayoutButtons[loop++].content;
      }

      if(footerLayout.length > 0)
      {
        footerLayout = "<div class='oj-datepicker-buttonpane'>" + footerLayout + "</div>";
      }
    }
    
    return footerLayout;
  },

  /**
   * Generate the HTML for the current state of the date picker.
   * 
   * @private
   */
  _generateDayViewHTML : function()
  {
    var maxDraw, enablePrev, enableNext, converterUtils = oj.IntlConverterUtils, 
        dateParams = ["date", "month", "fullYear"], converter = this._GetConverter(),
        footerLayout, weekDisplay, dayNames = this.options["dayWide"], dayNamesMin = this.options["dayNarrow"], 
        firstDay = this.options["firstDayOfWeek"], daysOutsideMonth, html, dow, row, group, col, selected, rowCellId, 
        dayOverClass, dayOverId = "", dayOverClassStr, calender, thead, day, daysInMonth, leadDays, curRows, numRows,
        printDate, dRow, tbody, daySettings, otherMonth, unselectable, tempDate = new Date(),
        today = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()), // clear time
        isRTL = this._IsRTL(), footerLayoutDisplay = this.options["datePicker"]["footerLayout"], numMonths = this._getNumberOfMonths(), 
        currentMonthPos = this.options["datePicker"]["currentMonthPos"], dayFormatter = this.options["dayFormatter"], 
        currMetaData = null, isMultiMonth = (numMonths[0] !== 1 || numMonths[1] !== 1), 
        minDateIso = this._getMinMaxDateIso("min"), minDateParams,
        maxDateIso = this._getMinMaxDateIso("max"), maxDateParams,
        drawMonth = this._drawMonth - currentMonthPos, drawYear = this._drawYear, 
        compareDate = new Date(this._currentYear, this._currentMonth, this._currentDay), valueDateIso = this._getDateIso(), 
        valueDateParams = converterUtils._dateTime(valueDateIso, dateParams, true), 
        selectedYear = valueDateParams["fullYear"], 
        selectedDay = valueDateParams["date"], selectedMonth = valueDateParams["month"],
        valueDate = new Date(selectedYear, selectedMonth, selectedDay),
        wDisabled = this.options["disabled"], calculatedWeek, weekText = this._EscapeXSS(this.getTranslatedString("weekText"));
    
    if(minDateIso) {
      //convert it to the correct timezone for comparison, since need to display the month, date, year as displayed in isoString
      minDateIso = converter.parse(minDateIso);
      minDateParams = converterUtils._dateTime(minDateIso, dateParams, true);
    }
    if(maxDateIso) {
      maxDateIso = converter.parse(maxDateIso);
      maxDateParams = converterUtils._dateTime(maxDateIso, dateParams, true);
    }

    valueDateIso = converterUtils._clearTime(valueDateIso);

    //So per discussion calendar will display the year, month, date based on how represented in the isoString
    //meaning 2013-12-01T20:00:00-08:00 and 2013-12-01T20:00:00-04:00 will both display the same content as no 
    //conversion will take place. In order to achieve this it will rip out the necessary info by string parsing 
    //and in regards to isoString date comparison (i.e. whether one is before the other, will need to use converter's 
    //compareISODates passing the MODIFIED printDate isoString)
    if (drawMonth < 0)
    {
      drawMonth += 12;
      drawYear--;
    }
    
    if(minDateParams) 
    {
      var minDraw = new Date(minDateParams["fullYear"], minDateParams["month"], minDateParams["date"]);
      
      //tech shouldn't this error out? [previous existing jquery logic so keep, maybe a reason]
      if(maxDateParams && converter.compareISODates(maxDateIso, minDateIso) < 0) 
      {
        minDraw = new Date(maxDateParams["fullYear"], maxDateParams["month"], maxDateParams["date"]);
      }
      while (new Date(drawYear, drawMonth, this._getDaysInMonth(drawYear, drawMonth)) < minDraw)
      {
        drawMonth++;
        if (drawMonth > 11)
        {
          drawMonth = 0;
          drawYear++;
        }
      }
    }
    
    if (maxDateParams)
    {
      maxDraw = new Date(maxDateParams["fullYear"], maxDateParams["month"] - (numMonths[0] * numMonths[1]) + 1, maxDateParams["date"]);
      
      //tech shouldn't this error out? [previous existing jquery logic so keep, maybe a reason]
      if(minDateParams && converter.compareISODates(maxDateIso, minDateIso) < 0) 
      {
        maxDraw = new Date(minDateParams["fullYear"], minDateParams["month"], minDateParams["date"]);
      }
      while (new Date(drawYear, drawMonth, 1) > maxDraw)
      {
        drawMonth--;
        if (drawMonth < 0)
        {
          drawMonth = 11;
          drawYear--;
        }
      }
    }
    this._drawMonth = drawMonth;
    this._drawYear = drawYear;

    enablePrev = this._canAdjustMonth( - 1, drawYear, drawMonth) && !wDisabled;
    enableNext = this._canAdjustMonth( + 1, drawYear, drawMonth) && !wDisabled;
    
    footerLayout = this._generateFooter(footerLayoutDisplay, today);

    weekDisplay = this.options["datePicker"]["weekDisplay"];

    daysOutsideMonth = this.options["datePicker"]["daysOutsideMonth"];
    html = "";

    var monthControl = "all";
    for (row = 0;row < numMonths[0];row++)
    {
      group = "";
      this._maxRows = 4;
      for (col = 0;col < numMonths[1];col++)
      {
        monthControl = row === 0 ? "all" : "";
        calender = "";
        if (isMultiMonth)
        {
          calender += "<div class='oj-datepicker-group";
          if (numMonths[1] > 1)
          {
            switch (col)
            {
              case 0:
                calender += " oj-datepicker-group-first";
                monthControl = row === 0 ? (isRTL ? "right" : "left") : "";
                break;
              case numMonths[1] - 1:
                calender += " oj-datepicker-group-last";
                monthControl = row === 0 ? (isRTL ? "left" : "right") : "";
                break;
              default :
                calender += " oj-datepicker-group-middle";
                monthControl = "";
                break;
            }
          }
          calender += "'>";
        }
        
        calender += this._generateHeader(drawMonth, drawYear, monthControl, enablePrev, enableNext);

        calender += "<table class='oj-datepicker-calendar" + (weekDisplay === "number" ? " oj-datepicker-weekdisplay" : "") + (wDisabled ? " oj-disabled " : " oj-enabled oj-default ") + "' tabindex=-1 data-handler='calendarKey' data-event='keydown' aria-readonly='true' role='grid' " + "aria-labelledby='" + this._GetSubId(this._CALENDAR_DESCRIPTION_ID) + "'><thead role='presentation'>" + "<tr role='row'>";
        thead = (weekDisplay === "number" ? "<th class='oj-datepicker-week-col'>" + this._EscapeXSS(this.getTranslatedString("weekHeader")) + "</th>" : "");
        for (dow = 0;dow < 7;dow++)
        {
          // days of the week
          day = (dow + parseInt(firstDay, 10)) % 7;
          thead += "<th role='columnheader' aria-label='" + dayNames[day] + "'" + ((dow + firstDay + 6) % 7 >= 5 ? " class='oj-datepicker-week-end'" : "") + ">" + "<span title='" + dayNames[day] + "'>" + dayNamesMin[day] + "</span></th>";
        }
        calender += thead + "</tr></thead><tbody role='presentation'>";
        daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
        if (drawYear === selectedYear && drawMonth === selectedMonth)
        {
          selectedDay = Math.min(selectedDay, daysInMonth);
        }
        leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
        curRows = Math.ceil((leadDays + daysInMonth) / 7);// calculate the number of rows to generate
        numRows = (isMultiMonth ? this._maxRows > curRows ? this._maxRows : curRows : curRows);//If multiple months, use the higher number of rows (see #7043)
        this._maxRows = numRows;
        printDate = new Date(drawYear, drawMonth, 1 - leadDays);
        for (dRow = 0;dRow < numRows;dRow++)
        {
          // create date picker rows
          calender += "<tr role='row'>";

          calculatedWeek = this._GetConverter().calculateWeek(converterUtils.dateToLocalIso(printDate));
          tbody = (weekDisplay === "none" ? "" : "<td class='oj-datepicker-week-col' role='rowheader' aria-label='" + weekText + " " + calculatedWeek + "'>" + calculatedWeek + "</td>");
          for (dow = 0;dow < 7;dow++)
          {
            // create date picker days
            otherMonth = (printDate.getMonth() !== drawMonth);
            selected = printDate.getTime() === valueDate.getTime();
            rowCellId = "oj-dp-" + this["uuid"] + "-" + dRow + "-" + dow + "-" + row + "-" + col;
            dayOverClass = (printDate.getTime() === compareDate.getTime() && drawMonth === this._currentMonth);
            if (dayOverClass)
            {
              dayOverId = rowCellId;
              dayOverClassStr = " " + this._DAYOVER_CLASS;
            }
            else
            {
              dayOverClassStr = "";
            }

            daySettings = [true, ""];
            var pYear = printDate.getFullYear(),
                pMonth = printDate.getMonth(),
                pDate = printDate.getDate();

            if (dayFormatter)
            {
              currMetaData = dayFormatter({"fullYear": pYear, "month": pMonth+1, "date": pDate}); //request to start from 1 rather than 0
              if (currMetaData)
              {
                //has content
                daySettings = [!currMetaData["disabled"], currMetaData["className"] || ""];
                if (currMetaData["tooltip"])
                {
                  daySettings.push(currMetaData["tooltip"]);
                }
              }
            }
            var selectedDate = printDate.getTime() === valueDate.getTime();

            unselectable = (otherMonth && daysOutsideMonth !== "selectable") || !daySettings[0] || this._outSideMinMaxRange(printDate, minDateParams, maxDateParams);
            tbody += "<td role='gridcell' aria-disabled='" + !!unselectable + "' aria-selected='" + selected + "' id='" + rowCellId + "' " + "class='" + ((dow + firstDay + 6) % 7 >= 5 ? " oj-datepicker-week-end" : "") + // highlight weekends
(otherMonth ? " oj-datepicker-other-month" : "") + // highlight days from other months
(dayOverClassStr) + // highlight selected day
(unselectable || wDisabled ? " " + this._UNSELECTABLE_CLASS + " oj-disabled" : " oj-enabled ") + // highlight unselectable days
(otherMonth && daysOutsideMonth === "hidden" ? "" : " " + daySettings[1] + // highlight custom dates
(selected ? " " + this._CURRENT_CLASS : "") + // highlight selected day
(printDate.getTime() === today.getTime() ? " oj-datepicker-today" : "")) + "'" + // highlight today (if different)
((!otherMonth || daysOutsideMonth !== "hidden") && daySettings[2] ? " title='" + daySettings[2].replace(/'/g, "&#39;") + "'" : "") + // cell title
(unselectable ? "" : " data-handler='selectDay' data-event='click' data-month='" + printDate.getMonth() + "' data-year='" + printDate.getFullYear() + "'") + ">" + // actions
(otherMonth && daysOutsideMonth === "hidden" ? "&#xa0;" : // display for other months
(unselectable || wDisabled ? "<span class='oj-disabled'>" + printDate.getDate() + "</span>" : "<a role='button' class='oj-enabled" + (selectedDate ? " oj-selected" : "") + // highlight selected day
(otherMonth ? " oj-priority-secondary" : "") + // distinguish dates from other months
"' " + (dayOverClass ? "" : "tabindex='-1' ") + " href='#'>" + printDate.getDate() + "</a>")) + "</td>";// display selectable date
            printDate.setDate(printDate.getDate() + 1);
          }
          calender += tbody + "</tr>";
        }
        drawMonth++;
        if (drawMonth > 11)
        {
          drawMonth = 0;
          drawYear++;
        }
        calender += "</tbody></table>" + (isMultiMonth ? "</div>" + ((numMonths[0] > 0 && col === numMonths[1] - 1) ? "<div class='oj-datepicker-row-break'></div>" : "") : "");
        group += calender;
      }
      html += group;
    }
    html += footerLayout;
    return {html : html, dayOverId : dayOverId};
  },
  
  /**
   * Generate the month and year header.
   * 
   * @private
   */
  _generateMonthYearHeader : function(drawMonth, drawYear)
  {
    var changeMonth = this.options["datePicker"]["changeMonth"], changeYear = this.options["datePicker"]["changeYear"], 
        positionOfMonthToYear = oj.LocaleData.isMonthPriorToYear() ? "before" : "after", 
        html = "<div class='oj-datepicker-title' role='header'>", monthHtml = "", converterUtils = oj.IntlConverterUtils,
        monthNames = this.options["monthWide"],
        wDisabled = this.options["disabled"];

    // month selection
    if (monthNames)
    {
      if (changeMonth === "none")
      {
        monthHtml += "<span class='oj-datepicker-month'>" + monthNames[drawMonth] + "</span>";
      }
      else 
      {
        monthHtml += "<a role='button' href='#' data-handler='selectMonthHeader' data-event='click keydown' class='oj-datepicker-month " + (wDisabled ? "oj-disabled' disabled" : "oj-enabled'") + ">";
        monthHtml += monthNames[drawMonth] + "</a>";
      }

      if (positionOfMonthToYear === "before")
      {
        html += monthHtml + (!((changeMonth === "select") && (changeYear === "select")) ? "&#xa0;" : "");
      }
    }

    // year selection
    if (!this.yearshtml)
    {
      this.yearshtml = "";
      if (changeYear === "none")
      {
        html += "<span class='oj-datepicker-year'>" + yearDisplay.format(converterUtils.dateToLocalIso(new Date(drawYear, drawMonth, 1))) + "</span>";
      }
      else
      {
        html += "<a role='button' href='#' data-handler='selectYearHeader' data-event='click keydown' class='oj-datepicker-year " + (wDisabled ? "oj-disabled' disabled" : "oj-enabled'") + ">";
        html += yearDisplay.format(converterUtils.dateToLocalIso(new Date(drawYear, drawMonth, 1))) + "</a>";
        this.yearshtml = null;
      }
    }

    if (monthNames)
    {
      if (positionOfMonthToYear === "after")
      {
        html += (!((changeMonth === "select") && (changeYear === "select")) ? "&#xa0;" : "") + monthHtml;
      }
    }

    html += "<span class='oj-helper-hidden-accessible' id='" + this._GetSubId(this._CALENDAR_DESCRIPTION_ID) + "'>";
    html += (monthNames ? (monthNames[drawMonth] + " ") : "") + yearDisplay.format(converterUtils.dateToLocalIso(new Date(drawYear, drawMonth, 1))) + "</span>";

    html += "<span class='oj-helper-hidden-accessible' id='" + this._GetSubId(this._DATEPICKER_DESCRIPTION_ID) + "'>" + this._EscapeXSS(this.getTranslatedString("datePicker")) + "</span>";

    html += "</div>";// Close datepicker_header
    return html;
  },

  /**
   * Adjust one of the date sub-fields.
   *
   * @private
   */
  _adjustInstDate : function (offset, period)
  {
    var year = this._drawYear + (period === "Y" ? offset : 0),
        month = this._drawMonth + (period === "M" ? offset : 0),
        day = Math.min(this._currentDay, this._getDaysInMonth(year, month)) + (period === "D" ? offset : 0),
        date = new Date(year, month, day);

    this._currentDay = date.getDate();
    this._drawMonth = this._currentMonth = date.getMonth();
    this._drawYear = this._currentYear = date.getFullYear();
  },

  /**
   * Generate the HTML for the month view of the date picker.
   * 
   * @private
   */
  _generateMonthViewHTML : function()
  {
    var maxDraw, enablePrev, enableNext, converterUtils = oj.IntlConverterUtils, 
        dateParams = ["date", "month", "fullYear"], converter = this._GetConverter(),
        footerLayout, 
        monthNames = this.options["monthWide"], monthNamesShort = this.options["monthAbbreviated"], 
        html, dow, selected, rowCellId, 
        dayOverClass, dayOverId = "", dayOverClassStr, calender, day, daysInMonth,
        printDate, dRow, tbody, daySettings, unselectable, tempDate = new Date(),
        today = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()), // clear time
        isRTL = this._IsRTL(), footerLayoutDisplay = this.options["datePicker"]["footerLayout"], 
        minDateIso = this._getMinMaxDateIso("min"), minDateParams,
        maxDateIso = this._getMinMaxDateIso("max"), maxDateParams,
        drawMonth = this._drawMonth, drawYear = this._drawYear, 
        valueDateIso = this._getDateIso(), 
        valueDateParams = converterUtils._dateTime(valueDateIso, dateParams, true), 
        selectedYear = valueDateParams["fullYear"], 
        selectedDay = valueDateParams["date"], selectedMonth = valueDateParams["month"],
        valueDate = new Date(selectedYear, selectedMonth, selectedDay),
        wDisabled = this.options["disabled"];
    
    if(minDateIso) {
      //convert it to the correct timezone for comparison, since need to display the month, date, year as displayed in isoString
      minDateIso = converter.parse(minDateIso);
      minDateParams = converterUtils._dateTime(minDateIso, dateParams, true);
    }
    if(maxDateIso) {
      maxDateIso = converter.parse(maxDateIso);
      maxDateParams = converterUtils._dateTime(maxDateIso, dateParams, true);
    }

    valueDateIso = converterUtils._clearTime(valueDateIso);

    //So per discussion calendar will display the year, month, date based on how represented in the isoString
    //meaning 2013-12-01T20:00:00-08:00 and 2013-12-01T20:00:00-04:00 will both display the same content as no 
    //conversion will take place. In order to achieve this it will rip out the necessary info by string parsing 
    //and in regards to isoString date comparison (i.e. whether one is before the other, will need to use converter's 
    //compareISODates passing the MODIFIED printDate isoString)
    if (drawMonth < 0)
    {
      drawMonth += 12;
      drawYear--;
    }
    
    if(minDateParams) 
    {
      var minDraw = new Date(minDateParams["fullYear"], minDateParams["month"], minDateParams["date"]);
      
      //tech shouldn't this error out? [previous existing jquery logic so keep, maybe a reason]
      if(maxDateParams && converter.compareISODates(maxDateIso, minDateIso) < 0) 
      {
        minDraw = new Date(maxDateParams["fullYear"], maxDateParams["month"], maxDateParams["date"]);
      }
      while (new Date(drawYear, drawMonth, this._getDaysInMonth(drawYear, drawMonth)) < minDraw)
      {
        drawMonth++;
        if (drawMonth > 11)
        {
          drawMonth = 0;
          drawYear++;
        }
      }
    }
    
    if (maxDateParams)
    {
      maxDraw = new Date(maxDateParams["fullYear"], maxDateParams["month"], maxDateParams["date"]);
      
      //tech shouldn't this error out? [previous existing jquery logic so keep, maybe a reason]
      if(minDateParams && converter.compareISODates(maxDateIso, minDateIso) < 0) 
      {
        maxDraw = new Date(minDateParams["fullYear"], minDateParams["month"], minDateParams["date"]);
      }
      while (new Date(drawYear, drawMonth, 1) > maxDraw)
      {
        drawMonth--;
        if (drawMonth < 0)
        {
          drawMonth = 11;
          drawYear--;
        }
      }
    }
    this._drawMonth = drawMonth;
    this._drawYear = drawYear;

    enablePrev = this._canAdjustYear( - 1, drawYear) && !wDisabled;
    enableNext = this._canAdjustYear( + 1, drawYear) && !wDisabled;

    footerLayout = this._generateFooter(footerLayoutDisplay, today);

    html = "";

    this._maxRows = 4;

    calender = "";

    calender += this._generateHeader(drawMonth, drawYear, "all", enablePrev, enableNext);

    calender += "<table class='oj-datepicker-calendar oj-datepicker-monthview" + (wDisabled ? " oj-disabled " : " oj-enabled oj-default ") + "' tabindex=-1 data-handler='calendarKey' data-event='keydown' aria-readonly='true' role='grid' " + "aria-labelledby='" + this._GetSubId(this._CALENDAR_DESCRIPTION_ID) + "'>";

    calender += "<tbody role='presentation'>";
    daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
    if (drawYear === selectedYear && drawMonth === selectedMonth)
    {
      selectedDay = Math.min(selectedDay, daysInMonth);
    }
    printDate = new Date(drawYear, 0, 1);
    for (dRow = 0;dRow < 4;dRow++)
    {
      // create date picker rows
      calender += "<tr role='row'>";

      tbody = "";
      for (dow = 0;dow < 3;dow++)
      {
        var month = dRow * 3 + dow;
        // create date picker days
        selected = printDate.getMonth() === valueDate.getMonth();
        rowCellId = "oj-dp-" + this["uuid"] + "-" + dRow + "-" + dow + "-" + 0 + "-" + 0;
        dayOverClass = (month === this._currentMonth);
        if (dayOverClass)
        {
          dayOverId = rowCellId;
          dayOverClassStr = " " + this._DAYOVER_CLASS;
        }
        else
        {
          dayOverClassStr = "";
        }

        var selectedDate = printDate.getMonth() === valueDate.getMonth();
        var inMinYear = (minDateParams && minDateParams["fullYear"] === drawYear);
        var inMaxYear = (maxDateParams && maxDateParams["fullYear"] === drawYear);

        unselectable = !((!inMinYear || month >= minDateParams["month"]) && (!inMaxYear || month <= maxDateParams["month"]));

        tbody += "<td role='gridcell' aria-disabled='" + !!unselectable + "' aria-selected='" + selected + "' id='" + rowCellId + "' " + "class='" +
(dayOverClassStr) + // highlight selected day
(unselectable || wDisabled ? " " + this._UNSELECTABLE_CLASS + " oj-disabled" : " oj-enabled ") + // highlight unselectable days
(selected ? " " + this._CURRENT_CLASS : "") + "'" + // highlight selected day
(unselectable ? "" : " data-handler='selectMonth' data-event='click' data-month='" + printDate.getMonth() + "' data-year='" + printDate.getFullYear() + "'") + ">" + // actions
((unselectable || wDisabled ? "<span class='oj-disabled'>" + monthNamesShort[month] + "</span>" : "<a role='button' class='oj-enabled" + (selectedDate ? " oj-selected" : "") + // highlight selected day
"' " + (dayOverClass ? "" : "tabindex='-1' ") + " href='#'>" + monthNamesShort[month] + "</a>")) + "</td>";// display selectable date
        printDate.setMonth(printDate.getMonth() + 1);
      }
      calender += tbody + "</tr>";
    }
    drawMonth++;
    if (drawMonth > 11)
    {
      drawMonth = 0;
      drawYear++;
    }
    calender += "</tbody></table>";

    html += calender;

    html += footerLayout;
    return {html : html, dayOverId : dayOverId};
  },
  
  /**
   * Generate the HTML for the current state of the date picker.
   * 
   * @private
   */
  _generateYearViewHTML : function()
  {
    var maxDraw, enablePrev, enableNext, converterUtils = oj.IntlConverterUtils, 
        dateParams = ["date", "month", "fullYear"], converter = this._GetConverter(),
        footerLayout, 
        html, dow, selected, rowCellId, 
        dayOverClass, dayOverId = "", dayOverClassStr, calender, day, daysInMonth,
        printDate, dRow, tbody, daySettings, unselectable, tempDate = new Date(),
        today = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()), // clear time
        isRTL = this._IsRTL(), footerLayoutDisplay = this.options["datePicker"]["footerLayout"], 
        minDateIso = this._getMinMaxDateIso("min"), minDateParams,
        maxDateIso = this._getMinMaxDateIso("max"), maxDateParams,
        drawMonth = this._drawMonth, drawYear = this._drawYear, 
        valueDateIso = this._getDateIso(), 
        valueDateParams = converterUtils._dateTime(valueDateIso, dateParams, true), 
        selectedYear = valueDateParams["fullYear"], 
        selectedDay = valueDateParams["date"], selectedMonth = valueDateParams["month"],
        valueDate = new Date(selectedYear, selectedMonth, selectedDay),
        wDisabled = this.options["disabled"];
    
    if(minDateIso) {
      //convert it to the correct timezone for comparison, since need to display the month, date, year as displayed in isoString
      minDateIso = converter.parse(minDateIso);
      minDateParams = converterUtils._dateTime(minDateIso, dateParams, true);
    }
    if(maxDateIso) {
      maxDateIso = converter.parse(maxDateIso);
      maxDateParams = converterUtils._dateTime(maxDateIso, dateParams, true);
    }

    valueDateIso = converterUtils._clearTime(valueDateIso);

    //So per discussion calendar will display the year, month, date based on how represented in the isoString
    //meaning 2013-12-01T20:00:00-08:00 and 2013-12-01T20:00:00-04:00 will both display the same content as no 
    //conversion will take place. In order to achieve this it will rip out the necessary info by string parsing 
    //and in regards to isoString date comparison (i.e. whether one is before the other, will need to use converter's 
    //compareISODates passing the MODIFIED printDate isoString)
    if (drawMonth < 0)
    {
      drawMonth += 12;
      drawYear--;
    }
    
    if(minDateParams) 
    {
      var minDraw = new Date(minDateParams["fullYear"], minDateParams["month"], minDateParams["date"]);
      
      //tech shouldn't this error out? [previous existing jquery logic so keep, maybe a reason]
      if(maxDateParams && converter.compareISODates(maxDateIso, minDateIso) < 0) 
      {
        minDraw = new Date(maxDateParams["fullYear"], maxDateParams["month"], maxDateParams["date"]);
      }
      while (new Date(drawYear, drawMonth, this._getDaysInMonth(drawYear, drawMonth)) < minDraw)
      {
        drawMonth++;
        if (drawMonth > 11)
        {
          drawMonth = 0;
          drawYear++;
        }
      }
    }
    
    if (maxDateParams)
    {
      maxDraw = new Date(maxDateParams["fullYear"], maxDateParams["month"], maxDateParams["date"]);
      
      //tech shouldn't this error out? [previous existing jquery logic so keep, maybe a reason]
      if(minDateParams && converter.compareISODates(maxDateIso, minDateIso) < 0) 
      {
        maxDraw = new Date(minDateParams["fullYear"], minDateParams["month"], minDateParams["date"]);
      }
      while (new Date(drawYear, drawMonth, 1) > maxDraw)
      {
        drawMonth--;
        if (drawMonth < 0)
        {
          drawMonth = 11;
          drawYear--;
        }
      }
    }
    this._drawMonth = drawMonth;
    this._drawYear = drawYear;

    enablePrev = this._canAdjustDecade( - 1, drawYear) && !wDisabled;
    enableNext = this._canAdjustDecade( + 1, drawYear) && !wDisabled;

    footerLayout = this._generateFooter(footerLayoutDisplay, today);

    html = "";

    this._maxRows = 4;

    calender = "";

    calender += this._generateHeader(drawMonth, drawYear, "all", enablePrev, enableNext);
    
    calender += "<table class='oj-datepicker-calendar oj-datepicker-yearview" + (wDisabled ? " oj-disabled " : " oj-enabled oj-default ") + "' tabindex=-1 data-handler='calendarKey' data-event='keydown' aria-readonly='true' role='grid' " + "aria-labelledby='" + this._GetSubId(this._CALENDAR_DESCRIPTION_ID) + "'>";

    calender += "<tbody role='presentation'>";
    daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
    if (drawYear === selectedYear && drawMonth === selectedMonth)
    {
      selectedDay = Math.min(selectedDay, daysInMonth);
    }
    var yearRange = this._getYearRange(drawYear, minDateParams, maxDateParams);
    var baseYear = (Math.floor(drawYear / 10) * 10);
    printDate = new Date(baseYear, drawMonth, 1);
    for (dRow = 0;dRow < 4;dRow++)
    {
      // create date picker rows
      calender += "<tr role='row'>";

      tbody = "";
      for (dow = 0;dow < 3;dow++)
      {
        if (dRow == 3 && dow == 1)
          break;
        
        var year = baseYear + (dRow * 3) + dow;
        // create date picker days
        selected = printDate.getFullYear() === valueDate.getFullYear();
        rowCellId = "oj-dp-" + this["uuid"] + "-" + dRow + "-" + dow + "-" + 0 + "-" + 0;
        dayOverClass = (year === this._currentYear);
        if (dayOverClass)
        {
          dayOverId = rowCellId;
          dayOverClassStr = " " + this._DAYOVER_CLASS;
        }
        else
        {
          dayOverClassStr = "";
        }

        var selectedDate = printDate.getFullYear() === valueDate.getFullYear();
        var yearText = yearDisplay.format(converterUtils.dateToLocalIso(new Date(year, drawMonth, 1)));

        unselectable = (year < yearRange['startYear'] || year > yearRange['endYear']);

        tbody += "<td role='gridcell' aria-disabled='" + !!unselectable + "' aria-selected='" + selected + "' id='" + rowCellId + "' " + "class='" +
(dayOverClassStr) + // highlight selected day
(unselectable || wDisabled ? " " + this._UNSELECTABLE_CLASS + " oj-disabled" : " oj-enabled ") + // highlight unselectable days
(selected ? " " + this._CURRENT_CLASS : "") + "'" + // highlight selected day
(unselectable ? "" : " data-handler='selectYear' data-event='click' data-month='" + printDate.getMonth() + "' data-year='" + printDate.getFullYear() + "'") + ">" + // actions
((unselectable || wDisabled ? "<span class='oj-disabled'>" + yearText + "</span>" : "<a role='button' class='oj-enabled" + (selectedDate ? " oj-selected" : "") + // highlight selected day
"' " + (dayOverClass ? "" : "tabindex='-1' ") + " href='#'>" + yearText + "</a>")) + "</td>";// display selectable date
        printDate.setFullYear(printDate.getFullYear() + 1);
      }
      calender += tbody + "</tr>";
    }
    drawMonth++;
    if (drawMonth > 11)
    {
      drawMonth = 0;
      drawYear++;
    }
    calender += "</tbody></table>";

    html += calender;

    html += footerLayout;
    return {html : html, dayOverId : dayOverId};
  },

  /**
   * Determine the selectable years.
   *
   * @private
   */
  _getYearRange : function(drawYear, minDateParams, maxDateParams)
  {
    var years, thisYear, determineYear, year, endYear;
    
    years = this.options["datePicker"]["yearRange"].split(":");
    thisYear = new Date().getFullYear();
    determineYear = function (value)
    {
      var year = (value.match(/c[+\-].*/) ? drawYear + parseInt(value.substring(1), 10) : (value.match(/[+\-].*/) ? thisYear + parseInt(value, 10) : parseInt(value, 10)));
      return (isNaN(year) ? thisYear : year);
    };
    year = determineYear(years[0]);
    endYear = Math.max(year, determineYear(years[1] || ""));
    year = (minDateParams ? Math.max(year, minDateParams["fullYear"]) : year);
    endYear = (maxDateParams ? Math.min(endYear, maxDateParams["fullYear"]) : endYear);
    
    return {'startYear': year, 'endYear': endYear};
  },

  /**
   * Determine the number of months to show.
   *
   * @private
   */
  _getNumberOfMonths : function ()
  {
    var numMonths = this.options["datePicker"]["numberOfMonths"];
    numMonths = typeof numMonths === "string" ? parseInt(numMonths, 10) : numMonths;
    return (numMonths == null ? [1, 1] : (typeof numMonths === "number" ? [1, numMonths] : numMonths));
  },

  /**
   * Find the number of days in a given month.
   * 
   * @private
   */
  _getDaysInMonth : function (year, month)
  {
    return 32 - new Date(year, month, 32).getDate();
  },

  /**
   * Find the day of the week of the first of a month.
   *
   * @private
   */
  _getFirstDayOfMonth : function (year, month)
  {
    return new Date(year, month, 1).getDay();
  },

  /**
   * Determines if we should allow a "next/prev" month display change.
   *
   * @private
   */
  _canAdjustMonth : function (offset, curYear, curMonth)
  {
    var numMonths = this._getNumberOfMonths(), date = new Date(curYear, curMonth + (offset < 0 ? offset : numMonths[0] * numMonths[1]), 1);

    if (offset < 0)
    {
      date.setDate(this._getDaysInMonth(date.getFullYear(), date.getMonth()));
    }
    return this._isInRange(date);
  },
  
  /**
   * Determines if we should allow a "next/prev" year display change.
   *
   * @private
   */
  _canAdjustYear : function(offset, curYear)
  {
    var date;
    
    if (offset < 0)
    {
      date = new Date(curYear + offset, 12, 1);
      date.setDate(this._getDaysInMonth(date.getFullYear(), date.getMonth()));
    }
    else
    {
      date = new Date(curYear + offset, 1, 1);
    }
    return this._isInRange(date);
  },
  
  /**
   * Determines if we should allow a "next/prev" decade display change.
   *
   * @private
   */
  _canAdjustDecade : function(offset, curYear)
  {
    var date;
    var baseYear = (Math.floor(curYear / 10) * 10);

    if (offset < 0)
    {
      date = new Date(baseYear + 9 + (offset * 10), 12, 1);
      date.setDate(this._getDaysInMonth(date.getFullYear(), date.getMonth()));
    }
    else
    {
      date = new Date(baseYear + (offset * 10), 1, 1);
    }
    return this._isInRange(date);
  },
  
  /**
   * Returns a boolean of whether the print date is outside the min + max range, ignoring time since if of 
   * ojInputDateTime should allow selection of date and restrict based on ojInputTime.
   * 
   * @private
   */
  _outSideMinMaxRange : function (printDate, minDateParams, maxDateParams) 
  {
    var minDate = minDateParams ? new Date(minDateParams["fullYear"], minDateParams["month"], minDateParams["date"]) : null;
    var maxDate = maxDateParams ? new Date(maxDateParams["fullYear"], maxDateParams["month"], maxDateParams["date"]) : null;
    
    return (minDate !== null && printDate < minDate) || (maxDate !== null && printDate > maxDate);
  },
  
  /**
   * Is the given date in the accepted range? 
   * 
   * @param {Object} date constructed using local; however need to compare with min + max using their timezone
   * @private
   */
  _isInRange : function (date)
  {
    var yearSplit, currentYear, converterUtils = oj.IntlConverterUtils,
        converter = this._GetConverter(),
        minDate, maxDate,
        minDateIso = this._getMinMaxDateIso("min"), minYear = null, 
        maxDateIso = this._getMinMaxDateIso("max"), maxYear = null, years = this.options["datePicker"]["yearRange"];
    
    if (years)
    {
      yearSplit = years.split(":");
      currentYear = new Date().getFullYear();
      minYear = parseInt(yearSplit[0], 10);
      maxYear = parseInt(yearSplit[1], 10);
      if (yearSplit[0].match(/[+\-].*/))
      {
        minYear += currentYear;
      }
      if (yearSplit[1].match(/[+\-].*/))
      {
        maxYear += currentYear;
      }
    }

    if(minDateIso)
    {
      //need to convert it to the same timezone as the value, since the calendar and etc 
      //all work by using string manipulation of the isoString
      minDateIso = converter.parse(minDateIso);
      var minDateParams = converterUtils._dateTime(minDateIso, ["fullYear", "month", "date"], true);
      minDate = new Date(minDateParams["fullYear"], minDateParams["month"], minDateParams["date"]);
    }
    if(maxDateIso)
    {
      maxDateIso = converter.parse(maxDateIso);
      var maxDateParams = converterUtils._dateTime(maxDateIso, ["fullYear", "month", "date"], true);
      maxDate = new Date(maxDateParams["fullYear"], maxDateParams["month"], maxDateParams["date"]);
    }

    return ((!minDate || date.getTime() >= minDate.getTime()) && (!maxDate || date.getTime() <= maxDate.getTime()) 
            && (!minYear || date.getFullYear() >= minYear) && (!maxYear || date.getFullYear() <= maxYear));
  },
  
  _getCalendarTitle : function () 
  {
    return this._EscapeXSS(this.getTranslatedString("tooltipCalendar" + (this.options["disabled"] ? "Disabled" : "")));
  },

  /**
   * To disable or enable the widget
   *
   * @private
   * @instance
   */
  _disableEnable : function (val)
  {
    if (this._triggerNode)
    {
      disableEnableSpan(this._triggerNode.children(), val);
      this._triggerNode.find("." + this._TRIGGER_CALENDAR_CLASS).attr("title", this._getCalendarTitle());
    }

    if(val)
    {
      this._hide(this._ON_CLOSE_REASON_CLOSE);
    }

    //need to update the look, note that if it is displaying the datepicker dropdown it would be hidden in _setOption function
    if(this._isInLine)
    {
      this._updateDatepicker();
    }
  },

  /**
   * Invoke super only if it is not inline
   *
   * @ignore
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputDate
   */
  _AppendInputHelper : function ()
  {
    if (!this._isInLine)
    {
      this._superApply(arguments);
    }
  },

  /**
   * This handler will set the value from the input text element.
   *
   * @ignore
   * @protected
   * @override
   * @param {Event} event
   * @instance
   * @memberof! oj.ojInputDate
   */
  _onBlurHandler : function (event)
  {
    if(this._isInLine)
    {
      return;
    }

    this._superApply(arguments);
  },

  /**
   * This handler will be invoked when keydown is triggered for this.element. When is of inline ignore the keydowns
   *
   * @ignore
   * @protected
   * @override
   * @param {Event} event
   * @instance
   * @memberof! oj.ojInputDate
   */
  _onKeyDownHandler : function (event)
  {
    if(this._isInLine)
    {
      return;
    }

    this._superApply(arguments);

    var kc = $.ui.keyCode,
        handled = false;

    if (this._datepickerShowing())
    {

      switch (event.keyCode)
      {
        case kc.TAB:
          this._hide(this._ON_CLOSE_REASON_TAB);
          break;
        case kc.ESCAPE:
          this._hide(this._ON_CLOSE_REASON_CANCELLED);
          handled = true;
          break;
        case kc.UP: ;
        case kc.DOWN:
          this._dpDiv.find(".oj-datepicker-calendar").focus();
          handled = true;
          break;
        default: ;
      }

    }
    else
    {

      switch (event.keyCode)
      {
        case kc.UP: ;
        case kc.DOWN:
          this._SetValue(this._GetDisplayValue(), event);
          this.show();
          handled = true;
          break;
        default: ;
      }

    }

    if (handled)
    {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  },

  /**
   * Ignore for when of inline, since then this.element would be of div and has a funky nature
   *
   * @param {String} displayValue of the new string to be displayed
   *
   * @memberof! oj.ojInputDate
   * @instance
   * @protected
   * @override
  */
  _SetDisplayValue : function (displayValue)
  {
    if(!this._isInLine)
    {
      this._superApply(arguments);
    }
    
    this._setCurrentDate(this._getDateIso());
    
    //so this is a change in behavior from original design. Previously it was decided that app developer 
    //would have to invoke refresh to render the calendar after setting the new value programatically; however now it is 
    //required to hook it in when _SetDisplayValue is invoked [can't use _SetValue b/c that function is not invoked
    //when developer invokes ("option", "value", oj.IntlConverterUtils.dateToLocalIso(new Date()))
    if(this._datepickerShowing())
    {
      // _SetDisplayValue is called after user picks a date from picker, we dont want to bring
      //  focus to input element if the picker is showing still for the non-inline case. For the
      //  case of inline date picker, if the time picker field already had focus (brought in when
      //  the picker was hidden), we want to update the date picker, but not set focus on it.
      var focusOnCalendar = !(this._isInLine && this._timePicker && this._timePicker[0] === document.activeElement);
      this._updateDatepicker(focusOnCalendar);
    }
  },

  /**
   * Need to override since apparently we allow users to set the converter to null, undefined, and etc and when
   * they do we use the default converter
   *
   * @return {Object} a converter instance or null
   *
   * @memberof! oj.ojInputDate
   * @instance
   * @protected
   * @override
   */
  _GetConverter : function ()
  {
    return this.options['converter'] ?
        this._superApply(arguments) :
        $["oj"]["ojInputDate"]["prototype"]["options"]["converter"];
  },

  /**
   * @ignore
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputDate
   */
  _GetElementValue : function ()
  {
    return this.options['value'] || "";
  },

  /**
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputDate
   * @return {string}
   */
  _GetDefaultStyleClass : function ()
  {
    return "oj-inputdate";
  },

  /**
   * Sets up the default dateTimeRange and dateRestriction validators.
   *
   * @ignore
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputDate
   */
  _GetImplicitValidators : function ()
  {
    var ret = this._superApply(arguments);

    if(this.options['min'] != null || this.options['max'] != null)
    {
      //need to alter how the default validators work as validators are now immutable
      this._datePickerDefaultValidators[oj.ValidatorFactory.VALIDATOR_TYPE_DATETIMERANGE] = this._getValidator("min");
    }

    if(this.options["dayFormatter"] != null)
    {
      this._datePickerDefaultValidators[oj.ValidatorFactory.VALIDATOR_TYPE_DATERESTRICTION] = this._getValidator("dayFormatter");
    }

    return $.extend(this._datePickerDefaultValidators, ret);
  },

  /**
   * Notifies the component that its subtree has been removed from the document programmatically after the component has
   * been created
   * @memberof! oj.ojInputDate
   * @instance
   * @protected
   */
  _NotifyDetached: function()
  {
    this._hide(this._ON_CLOSE_REASON_CLOSE);

    // hide sets focus to the input, so we want to call super after hide. If we didn't, then
    // the messaging popup will reopen and we don't want that.
    this._superApply(arguments);
  },

  /**
   * Notifies the component that its subtree has been made hidden programmatically after the component has
   * been created
   * @memberof! oj.ojInputDate
   * @instance
   * @protected
   */
  _NotifyHidden: function()
  {
    this._hide(this._ON_CLOSE_REASON_CLOSE);

    // hide sets focus to the input, so we want to call super after hide. If we didn't, then
    // the messaging popup will reopen and we don't want that.
    this._superApply(arguments);
  },

  _getValidator : function (key)
  {
    var validator = null;

    if(key === "min" || key === "max")
    {

      validator = getImplicitDateTimeRangeValidator(this.options, this._GetConverter());
    }
    else if(key === "dayFormatter")
    {
      var dateRestrictionOptions = {'dayFormatter': this.options["dayFormatter"],
                                    'converter': this._GetConverter() };

      $.extend(dateRestrictionOptions, this.options['translations']['dateRestriction'] || {});
      validator = oj.Validation.validatorFactory(oj.ValidatorFactory.VALIDATOR_TYPE_DATERESTRICTION).createValidator(dateRestrictionOptions);
    }

    return validator;
  },
  
  /**
   * Gets today's date w/o time
   * 
   * @private
   * @return {Object} date
   */
  _getTodayDate : function ()
  {
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  },

  /**
   * Retrieve the default date shown on opening.
   * 
   * @private
   */
  _getDateIso : function ()
  {
    return this.options['value'] || this._getDefaultIsoDate();
  },
  
  /**
   * Return the subcomponent node represented by the documented locator attribute values. <br/>
   * If the locator is null or no subId string is provided then this method returns the element that 
   * this component was initalized with. <br/>
   * If a subId was provided but a subcomponent node cannot be located this method returns null.
   *
   * <p>If the <code class="prettyprint">locator</code> or its <code class="prettyprint">subId</code> is
   * <code class="prettyprint">null</code>, then this method returns the element on which this component was initalized.
   *
   * <p>If a <code class="prettyprint">subId</code> was provided but no corresponding node
   * can be located, then this method returns <code class="prettyprint">null</code>.
   *
   * @expose
   * @override
   * @memberof oj.ojInputDate
   * @instance
   *
   * @param {Object} locator An Object containing, at minimum, a <code class="prettyprint">subId</code>
   * property. See the table for details on its fields.
   *
   * @property {string=} locator.subId - A string that identifies a particular DOM node in this component.
   *
   * <p>The supported sub-ID's are documented in the <a href="#subids-section">Sub-ID's</a> section of this document.
   *
   * @property {number=} locator.index - A zero-based index, used to locate a message content node
   * or a hint node within the popup.
   * @returns {Element|null} The DOM node located by the <code class="prettyprint">subId</code> string passed in
   * <code class="prettyprint">locator</code>, or <code class="prettyprint">null</code> if none is found.
   *
   * @example <caption>Get the node for a certain subId:</caption>
   * var node = $( ".selector" ).ojInputDate( "getNodeBySubId", {'subId': 'oj-some-sub-id'} );
   */
  getNodeBySubId: function(locator)
  {
    var node = null,
        subId = locator && locator['subId'],
        dpDiv = this._dpDiv;

    if(subId)
    {
      switch(subId)
      {
      case "oj-datepicker-content": node = dpDiv[0]; break;
      case "oj-inputdatetime-calendar-icon": node = $(".oj-inputdatetime-calendar-icon", this._triggerNode)[0]; break;
      case "oj-datepicker-prev-icon": node = $(".oj-datepicker-prev-icon", dpDiv)[0]; break;
      case "oj-datepicker-next-icon": node = $(".oj-datepicker-next-icon", dpDiv)[0]; break;
      case "oj-datepicker-month": node = $(".oj-datepicker-month", dpDiv)[0]; break;
      case "oj-datepicker-year": node = $(".oj-datepicker-year", dpDiv)[0]; break;
      case "oj-datepicker-current": node = $(".oj-datepicker-current", dpDiv)[0]; break;
      case "oj-inputdatetime-date-input": node = this._isInLine ? null : this.element[0]; break;
      default: node = null;
      }
    }

    // Non-null locators have to be handled by the component subclasses
    return node || this._superApply(arguments);
  },

  /**
   * Returns the subId string for the given child DOM node.  For more details, see
   * <a href="#getNodeBySubId">getNodeBySubId</a>.
   *
   * @expose
   * @override
   * @memberof oj.ojInputDate
   * @instance
   *
   * @param {!Element} node - child DOM node
   * @return {string|null} The subId for the DOM node, or <code class="prettyprint">null</code> when none is found.
   *
   * @example <caption>Get the subId for a certain DOM node:</caption>
   * // Foo is ojInputNumber, ojInputDate, etc.
   * var subId = $( ".selector" ).ojFoo( "getSubIdByNode", nodeInsideComponent );
   */
  getSubIdByNode: function(node)
  {
    var dpDiv = this._dpDiv,
        subId = null,
        checks = [{"selector": ".oj-inputdatetime-calendar-icon", "ele": this._triggerNode},
                  {"selector": ".oj-datepicker-prev-icon", "ele": dpDiv},
                  {"selector": ".oj-datepicker-next-icon", "ele": dpDiv},
                  {"selector": ".oj-datepicker-month", "ele": dpDiv},
                  {"selector": ".oj-datepicker-year", "ele": dpDiv},
                  {"selector": ".oj-datepicker-current", "ele": dpDiv}];

    if(node === dpDiv[0])
    {
      return "oj-datepicker-content";
    }
    if(!this._isInLine && node === this.element[0])
    {
      return "oj-inputdatetime-date-input";
    }

    for(var i=0, j=checks.length; i < j; i++)
    {
      var map = checks[i],
          entry = $(map["selector"], map["ele"]);

      if(entry.length === 1 && entry[0] === node)
      {
        subId = map["selector"].substr(1);
        break;
      }
    }

    return subId || this._superApply(arguments);
  },

  /**
   * Hides the datepicker. Note that this function is a no-op when renderMode is 'native'.
   *
   * @expose
   * @memberof! oj.ojInputDate
   * @instance
   */
  hide : function ()
  {
    return this._hide(this._ON_CLOSE_REASON_CLOSE);
  },

  /**
   * Hides the datepicker
   *
   * @param {string} reason - the reason that the popup is being hidden ("selection", "cancelled", "tab")
   *
   * @protected
   * @ignore
   */
  _hide : function (reason)
  {

    if (!isPickerNative(this) && this._datepickerShowing() && !this._isInLine)
    {
      this._popUpDpDiv.ojPopup("close");
      this._onClose(reason);
    }

    return this;
  },

  /**
   * Sets focus to the right place after the picker is closed
   *
   * @param {string} reason - the reason that the popup is being hidden ("selection", "cancelled", "tab")
   *
   * @protected
   * @ignore
   */
  _onClose : function (reason)
  {
    if(this._isMobile && this.options["datePicker"]["showOn"] === "focus") 
    {
      this._inputContainer.focus();
    }
    else 
    {
      if(this.options["datePicker"]["showOn"] === "focus") 
      {
        this._ignoreShow = true;
      }
      this.element.focus();
    }
  },

  /**
   * @expose
   * @memberof! oj.ojInputDate
   * @instance
   */
  refresh : function ()
  {
    if(this._triggerNode)
    {
      this._triggerNode.find("." + this._TRIGGER_CALENDAR_CLASS).attr("title", this._getCalendarTitle());
    }
    return this._superApply(arguments) || this;
  },

  /**
   * Shows the datepicker
   *
   * @expose
   * @memberof! oj.ojInputDate
   * @instance
   */
  show : function ()
  {
    if (this._datepickerShowing() || this.options["disabled"] || this.options["readOnly"])
    {
      return;
    }

    if (this._ignoreShow)
    {
      //set within hide or elsewhere and focus is placed back on this.element
      this._ignoreShow = false;
      return;
    }

    if (isPickerNative(this))
    {
      // our html picker is inside popup, which will take care of removing focus from input element, 
      //  for native case we do it explicitly
      this.element.blur();
      
      // picker expects the fields like 'date' and 'mode' to retain its names. Use bracket notation
      //  to avoid closure compiler from renaming them
      var pickerOptions = {};
      pickerOptions['date'] = _getNativePickerDate(this._getNativeDatePickerConverter(), this._getDateIso());
      pickerOptions['mode'] = "date";
      
      return this._ShowNativeDatePicker(pickerOptions);
    }
    else
    {
      return this._showHTMLDatePicker();
    }
  },

  /**
   * TODO: Technically i think should be used for the calendar, but later since late in release
   * @ignore
   */
  _getNativeDatePickerConverter: function () {
    if(this._nativePickerConverter === null) {
      var resolvedOptions = this._GetConverter().resolvedOptions();
      var options = {};
      $.extend(options, resolvedOptions, {"isoStrFormat": "offset"});

      this._nativePickerConverter = oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME).createConverter(options);
    }
    
    return this._nativePickerConverter;
  },

  /**
   * Shows the native datepicker
   *
   * @protected
   * @memberof! oj.ojInputDate
   * @instance
   */
  _ShowNativeDatePicker : function (pickerOptions)
  {
    var minDate = this._getMinMaxDateIso("min");
    var maxDate = this._getMinMaxDateIso("max");
    var conv = this._getNativeDatePickerConverter();
    
    if (minDate)
    {
      pickerOptions['minDate'] = _getNativePickerDate(conv, minDate).valueOf();
    }
    
    if (maxDate)
    {
      pickerOptions['maxDate'] = _getNativePickerDate(conv, minDate).valueOf();
    }
    
    var self = this;
    
    // onError is called only for Android for cases where picker is cancelled, or if there were
    //  to be any error at the native picker end
    function onError(error)
    {
      self._nativePickerShowing = false;
      
      // if user cancels the picker dialog, we just bring the focus back
      // closure compiler renames 'startsWith', using bracket notation hence
      if (error["startsWith"]('cancel'))
      {
        self._onClose(self._ON_CLOSE_REASON_CANCELLED);
      }
      else
      {
        oj.Logger.log('Error: native date or time picker failed: ' + error);
      }
    }
    
    self._nativePickerShowing = true;
    
    // datePicker is variable at the top level available when the cordova date picker plugin is
    //  included.
    window['datePicker'].show(pickerOptions, $.proxy(this._OnDatePicked, this), onError);
  },

  /**
   * callback upon picking date from native picker
   *
   * @protected
   * @memberof! oj.ojInputDate
   * @instance
   */
  _OnDatePicked : function (date)
  {
    this._nativePickerShowing = false;
    
    // for iOS and windows, from the current implementation of the native datepicker plugin,
    //  for case when the picker is cancelled, this callback gets called without the parameter
    if (date)
    {
      // Explicitly setting timezone is supported only in iOS, and we do not have a need to do
      //  so at this time, so not exposing this feature for now.
      // The native date picker will preserve the timezone set on the supplied date upon returning,
      // however the returned value has its time part reset to 00:00 when in 'date' mode
      //  - need to copy time over hence
      var isoString = oj.IntlConverterUtils._dateTime(this._getDateIso(), {"month": date.getMonth(), "date": date.getDate(), "fullYear": date.getFullYear()});
      var formattedTime = this._GetConverter().format(isoString);

      // _SetValue will inturn call _SetDisplayValue
      this._SetValue(formattedTime, {});
    }

    this._onClose(this._ON_CLOSE_REASON_SELECTION);
  },
  
  /**
   * Shows the HTML datepicker
   *
   * @private
   */
  _showHTMLDatePicker : function ()
  {
    var rtl = this._IsRTL();

    //to avoid flashes on Firefox
    this._dpDiv.empty();
    this._updateDatepicker();

    var position = oj.PositionUtils.normalizeHorizontalAlignment({"my" : "start top", "at" : "start bottom", "of" : this.element, "collision" : "flipfit flipfit"}, rtl);
    this._popUpDpDiv.ojPopup("open", this.element.parent(), position);
    
    return this;
  }
});

// Add custom getters for properties
oj.Components.setDefaultOptions(
{
  'ojInputDate':
  {
    'firstDayOfWeek': oj.Components.createDynamicPropertyGetter(
      function()
      {
         return oj.LocaleData.getFirstDayOfWeek();
      }),

    'dayWide': oj.Components.createDynamicPropertyGetter(
      function()
      {
         return oj.LocaleData.getDayNames("wide");
      }),

    'dayNarrow': oj.Components.createDynamicPropertyGetter(
      function()
      {
          return oj.LocaleData.getDayNames("narrow");
      }),

    'monthWide': oj.Components.createDynamicPropertyGetter(
      function()
      {
         return oj.LocaleData.getMonthNames("wide");
      }),

    'monthAbbreviated': oj.Components.createDynamicPropertyGetter(
      function()
      {
         return oj.LocaleData.getMonthNames("abbreviated");
      }),

    'datePicker': oj.Components.createDynamicPropertyGetter(
      function()
      {
        return (oj.ThemeUtils.parseJSONFromFontFamily('oj-inputdatetime-option-defaults') || {})["datePicker"];
      }),

    'renderMode': oj.Components.createDynamicPropertyGetter(
      function()
      {
        return (oj.ThemeUtils.parseJSONFromFontFamily('oj-inputdatetime-option-defaults') || {})["renderMode"];
      }),

    'keyboardEdit': oj.Components.createDynamicPropertyGetter(
      function()
      {
        return (oj.ThemeUtils.parseJSONFromFontFamily('oj-inputdatetime-option-defaults') || {})["keyboardEdit"];
      })
    }
  }
);

// Fragments:

/**
 * <table class="keyboard-table">
 *   <thead>
 *     <tr>
 *       <th>Target</th>
 *       <th>Gesture</th>
 *       <th>Action</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td>Input element and calendar trigger icon</td>
 *       <td><kbd>Tap</kbd></td>
 *       <td>When not inline, shows the grid and moves the focus into the expanded date grid</td>
 *     </tr>
 *     <tr>
 *       <td>Input element with picker open</td>
 *       <td><kbd>Tap</kbd></td>
 *       <td>Set focus to the input. If hints, title or messages exist in a notewindow, 
 *        pop up the notewindow.</td>
 *     </tr>
 *     {@ojinclude "name":"labelTouchDoc"}
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Swipe Left</kbd></td>
 *       <td>Switch to next month (or previous month on RTL page).</td>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Swipe Right</kbd></td>
 *       <td>Switch to previous month (or next month on RTL page).</td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 * @ojfragment touchDoc - Used in touch gesture section of classdesc, and standalone gesture doc
 * @memberof oj.ojInputDate
 */

/**
 * <table class="keyboard-table">
 *   <thead>
 *     <tr>
 *       <th>Target</th>
 *       <th>Key</th>
 *       <th>Action</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td>Input element</td>
 *       <td><kbd>DownArrow or UpArrow</kbd></td>
 *       <td>Shows the calender grid and moves the focus into the expanded grid</td>
 *     </tr>
 *     <tr>
 *       <td>Input element</td>
 *       <td><kbd>Esc</kbd></td>
 *       <td>Close the grid.</tr>
 *     </tr>
 *     <tr>
 *       <td>Input element</td>
 *       <td><kbd>Tab In</kbd></td>
 *       <td>Set focus to the input. If hints, title or messages exist in a notewindow, 
 *        pop up the notewindow.</td>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Enter</kbd></td>
 *       <td>Select the currently focused day</td>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>UpArrow</kbd></td>
 *       <td>Move up in the grid.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>DownArrow</kbd></td>
 *       <td>Move down in the grid.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>RightArrow</kbd></td>
 *       <td>Move right in the grid.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>LeftArrow</kbd></td>
 *       <td>Move left in the grid.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Esc</kbd></td>
 *       <td>Close the grid.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Home</kbd></td>
 *       <td>Move focus to first day of the month.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>End</kbd></td>
 *       <td>Move focus to last day of the month.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>PageUp</kbd></td>
 *       <td>Switch to previous month.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>PageDown</kbd></td>
 *       <td>Switch to next month.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Alt + PageUp</kbd></td>
 *       <td>Switch to previous year.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Alt + PageDown</kbd></td>
 *       <td>Switch to next year.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Ctrl + Alt + PageUp</kbd></td>
 *       <td>Switch to previous by stepBigMonths.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Ctrl + Alt + PageDown</kbd></td>
 *       <td>Switch to next by stepBigMonths.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Ctrl + Alt + T</kbd></td>
 *       <td>Places focus on Today button if it exists.</tr>
 *     </tr>
 *     {@ojinclude "name":"labelKeyboardDoc"} 
 *   </tbody>
 * </table>
 *
 * @ojfragment keyboardDoc - Used in keyboard section of classdesc, and standalone gesture doc
 * @memberof oj.ojInputDate
 */


//////////////////     SUB-IDS     //////////////////

/**
 * <p>Sub-ID for the ojInputDate and ojInputDateTime component's input element. Note that if component is inline for
 * ojInputDate it would return null whereas ojInputDateTime would return the input element of the internally created
 * ojInputTime component.
 *
 * @ojsubid oj-inputdatetime-date-input
 * @memberof oj.ojInputDate
 *
 * @example <caption>Get the node for the input element:</caption>
 * var node = $( ".selector" ).ojInputDate( "getNodeBySubId", {'subId': 'oj-inputdatetime-date-input'} );
 */

/**
 * <p>Sub-ID for the calendar drop down node.
 *
 * @ojsubid oj-datepicker-content
 * @memberof oj.ojInputDate
 *
 * @example <caption>Get the calendar drop down node:</caption>
 * // Foo is ojInputDate or ojInputDateTime.
 * var node = $( ".selector" ).ojFoo( "getNodeBySubId", {'subId': 'oj-datepicker-content'} );
 */

/**
 * <p>Sub-ID for the calendar icon that triggers the calendar drop down.
 *
 * @ojsubid oj-inputdatetime-calendar-icon
 * @memberof oj.ojInputDate
 *
 * @example <caption>Get the calendar icon that triggers the calendar drop down:</caption>
 * // Foo is ojInputDate or ojInputDateTime.
 * var node = $( ".selector" ).ojFoo( "getNodeBySubId", {'subId': 'oj-inputdatetime-calendar-icon'} );
 */

/**
 * <p>Sub-ID for the previous month icon.
 *
 * @ojsubid oj-datepicker-prev-icon
 * @memberof oj.ojInputDate
 *
 * @example <caption>Get the previous month icon:</caption>
 * // Foo is ojInputDate or ojInputDateTime.
 * var node = $( ".selector" ).ojFoo( "getNodeBySubId", {'subId': 'oj-datepicker-prev-icon'} );
 */

/**
 * <p>Sub-ID for the next month icon.
 *
 * @ojsubid oj-datepicker-next-icon
 * @memberof oj.ojInputDate
 *
 * @example <caption>Get the next month icon:</caption>
 * // Foo is ojInputDate or ojInputDateTime.
 * var node = $( ".selector" ).ojFoo( "getNodeBySubId", {'subId': 'oj-datepicker-next-icon'} );
 */

/**
 * <p>Sub-ID for the month span or select element.
 *
 * @ojsubid oj-datepicker-month
 * @memberof oj.ojInputDate
 *
 * @example <caption>Get the month span or select element:</caption>
 * // Foo is ojInputDate or ojInputDateTime.
 * var node = $( ".selector" ).ojFoo( "getNodeBySubId", {'subId': 'oj-datepicker-month'} );
 */

/**
 * <p>Sub-ID for the year span or select element.
 *
 * @ojsubid oj-datepicker-year
 * @memberof oj.ojInputDate
 *
 * @example <caption>Get the year span or select element:</caption>
 * // Foo is ojInputDate or ojInputDateTime.
 * var node = $( ".selector" ).ojFoo( "getNodeBySubId", {'subId': 'oj-datepicker-year'} );
 */

/**
 * <p>Sub-ID for the current/today button for button bar.
 *
 * @ojsubid oj-datepicker-current
 * @memberof oj.ojInputDate
 *
 * @example <caption>Get the current/today button for button bar:</caption>
 * // Foo is ojInputDate or ojInputDateTime.
 * var node = $( ".selector" ).ojFoo( "getNodeBySubId", {'subId': 'oj-datepicker-current'} );
 */

/**
 * Copyright (c) 2014, Oracle and/or its affiliates.
 * All rights reserved.
 */

/** 
 * Helper function to split the timeIncrement into its constituents and returns the split object.
 * Used in ojInputTime and ojInputDateTime
 * 
 * @ignore
 */
function splitTimeIncrement(timeIncrement)
{
  var splitIncrement = timeIncrement.split(":");

  if (splitIncrement.length !== 4)
  {
    throw new Error("timeIncrement value should be in the format of hh:mm:ss:SSS");
  }

  var increments = 
  {
    hourIncr : parseInt(splitIncrement[0].substring(0), 10),
    minuteIncr : parseInt(splitIncrement[1], 10),
    secondIncr : parseInt(splitIncrement[2], 10),
    millisecondIncr : parseInt(splitIncrement[3], 10)
  };

  var sum = 0;
  for(var key in increments) {
    sum += increments[key];
  }

  if(sum === 0) {
    throw new Error("timeIncrement must have a non 00:00:00:000 value");
  }

  return increments;
}

/** 
 * Helper function to create a timepicker converter
 * 
 * @ignore
 * @param {Object} converter
 * @param {Object=} addOpts
 * @return {Object}
 */
function _getTimePickerConverter(converter, addOpts) {
  var resolvedOptions = converter.resolvedOptions();
  var options = { };
  var params = ["hour", "hour12", "minute", "second", "millisecond", "timeFormat",
      "timeZone", "timeZoneName", "isoStrFormat", "dst"], i, j;

  for (i = 0, j = params.length;i < j;i++)
  {
    if (params[i] in resolvedOptions)
    {
      if(params[i] === "timeFormat") {
        //special case for timeFormat, formatType of time must be added
        options["formatType"] = "time";
      }
      options[params[i]] = resolvedOptions[params[i]];
    }
  }

  if ($.isEmptyObject(options))
  {
    throw new Error("Empty object for creating a time picker converter");
  }

  $.extend(options, addOpts || {});
  return oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME).createConverter(options);;
}

/**
 * @ojcomponent oj.ojInputTime
 * @augments oj.inputBase
 * @since 0.6
 *
 * @classdesc
 * <h3 id="inputTimeOverview-section">
 *   JET ojInputTime Component
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#inputTimeOverview-section"></a>
 * </h3>
 *
 * <p>Description: ojInputTime provides a simple time selection drop down.
 *
 * <h3 id="touch-section">
 *   Touch End User Information
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#touch-section"></a>
 * </h3>
 *
 * {@ojinclude "name":"touchDoc"}
 *
 * <h3 id="keyboard-section">
 *   Keyboard End User Information
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#keyboard-section"></a>
 * </h3>
 *
 * {@ojinclude "name":"keyboardDoc"}
 *
 * <h3 id="pseudos-section">
 *   Pseudo-selectors
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#pseudos-section"></a>
 * </h3>
 *
 * <pre class="prettyprint">
 * <code>$( ":oj-inputTime" )            // selects all JET input on the page
 * </code>
 * </pre>
 *
 * <h3 id="binding-section">
 *   Declarative Binding
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#binding-section"></a>
 * </h3>
 *
 * <pre class="prettyprint">
 * <code>
 *    &lt;input id="timeId" data-bind="ojComponent: {component: 'ojInputTime'}" /&gt;
 * </code>
 * </pre>
 *
 * @desc Creates or re-initializes a JET ojInputTime
 *
 * @param {Object=} options a map of option-value pairs to set on the component
 *
 * @example <caption>Initialize the input element with no options specified:</caption>
 * $( ".selector" ).ojInputTime();
 *
 * * @example <caption>Initialize the input element with some options:</caption>
 * $( ".selector" ).ojInputTime( { "disabled": true } );
 *
 * @example <caption>Initialize the input element via the JET <code class="prettyprint">ojComponent</code> binding:</caption>
 * &lt;input id="timeId" data-bind="ojComponent: {component: 'ojInputTime'}" /&gt;
 */
oj.__registerWidget("oj.ojInputTime", $['oj']['inputBase'],
{
  version : "1.0.0",
  widgetEventPrefix : "oj",

  //-------------------------------------From base---------------------------------------------------//
  _CLASS_NAMES : "oj-inputdatetime-input",
  _WIDGET_CLASS_NAMES : "oj-inputdatetime-time-only oj-component oj-inputdatetime",
  _INPUT_CONTAINER_CLASS : "oj-inputdatetime-input-container",
  _ELEMENT_TRIGGER_WRAPPER_CLASS_NAMES : "",
  _INPUT_HELPER_KEY: "inputHelp",
  _ATTR_CHECK : [{"attr": "type", "setMandatory": "text"}],
  _GET_INIT_OPTIONS_PROPS:  [{attribute: "disabled", validateOption: true},
                             {attribute: 'pattern'},
                             {attribute: "title"},
                             {attribute: "placeholder"},
                             {attribute: "value", coerceDomValue: coerceIsoString},
                             {attribute: "required",
                              coerceDomValue: true, validateOption: true},
                             {attribute: 'readonly', option: 'readOnly',
                             validateOption: true},
                             {attribute: "min", coerceDomValue: coerceIsoString},
                             {attribute: "max", coerceDomValue: coerceIsoString}],
  //-------------------------------------End from base-----------------------------------------------//

  _TIME_PICKER_ID : "ojInputTime",
  _TRIGGER_CLASS : "oj-inputdatetime-input-trigger",
  _TRIGGER_TIME_CLASS : "oj-inputdatetime-time-icon",

  _ON_CLOSE_REASON_SELECTION: "selection",  // A selection was made
  _ON_CLOSE_REASON_CANCELLED: "cancelled",  // Selection not made
  _ON_CLOSE_REASON_TAB: "tab",              // Tab key
  _ON_CLOSE_REASON_CLOSE: "close",          // Disable or other closes

  _KEYBOARD_EDIT_OPTION_ENABLED: "enabled",
  _KEYBOARD_EDIT_OPTION_DISABLED: "disabled",

  options :
  {
    /**
     * Default converter for ojInputTime
     *
     * If one wishes to provide a custom converter for the ojInputTime override the factory returned for
     * oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME)
     *
     * @expose
     * @memberof! oj.ojInputTime
     * @instance
     * @default <code class="prettyprint">oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME).createConverter({"hour": "2-digit", "hour12": true, "minute": "2-digit"})</code>
     */
    converter : oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME).createConverter(
    {
      "hour" : "2-digit", "hour12" : true, "minute" : "2-digit"
    }),

    /**
     * Determines if keyboard entry of the text is allowed.
     * When disabled the picker must be used to select a time.
     *
     * @example <caption>Initialize the component with the <code class="prettyprint">keyboardEdit</code> option:</caption>
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojInputTime', keyboardEdit: 'disabled'}" /&gt;
     *
     * @expose
     * @instance
     * @memberof! oj.ojInputTime
     * @type {string}
     * @ojvalue {string} "enabled"  Allow keyboard entry of the time.
     * @ojvalue {string} "disabled" Changing the time can only be done with the picker.
     * @default Default value depends on the theme. In alta-android, alta-ios and alta-windows themes, the 
     * default is <code class="prettyprint">"disabled"</code> and
     * it's <code class="prettyprint">"enabled"</code> for alta desktop theme.
     */
    keyboardEdit : "enabled",

    /**
     * The maximum selectable date. When set to null, there is no maximum.
     *
     * <ul>
     *  <li> type string - ISOString
     *  <li> null - no limit
     * </ul>
     *
     * @example <caption>Initialize the component with the <code class="prettyprint">max</code> option:</caption>
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojInputTime', max: 'T13:30:00.000-08:00'}" /&gt;
     *
     * @expose
     * @instance
     * @memberof! oj.ojInputTime
     * @default <code class="prettyprint">null</code>
     */
    max : undefined,

    /**
     * The minimum selectable date. When set to null, there is no minimum.
     *
     * <ul>
     *  <li> type string - ISOString
     *  <li> null - no limit
     * </ul>
     *
     * @example <caption>Initialize the component with the <code class="prettyprint">min</code> option:</caption>
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojInputTime', min: 'T08:00:00.000-08:00'}" /&gt;
     *
     * @expose
     * @instance
     * @memberof! oj.ojInputTime
     * @default <code class="prettyprint">null</code>
     */
    min : undefined,

    /**
     * JSON data passed when the widget is of ojInputDateTime
     *
     * {
     *  widget : dateTimePickerInstance,
     *  inline: true|false
     * }
     *
     * @expose
     * @memberof! oj.ojInputTime
     * @instance
     * @private
     */
    datePickerComp : null,

    /**
     * <p>Attributes specified here will be set on the picker DOM element when it's launched.
     * <p>The supported attributes are <code class="prettyprint">class</code> and <code class="prettyprint">style</code>, which are appended to the picker's class and style, if any.
     * Note: 1) pickerAttributes is not applied in the native theme.
     * 2) setting this option after component creation has no effect.
     *
     * @example <caption>Initialize the inputTime specifying a set of attributes to be set on the picker DOM element:</caption>
     * $( ".selector" ).ojInputTime({ "pickerAttributes": {
     *   "style": "color:blue;",
     *   "class": "my-class"
     * }});
     *
     * @example <caption>Get the <code class="prettyprint">pickerAttributes</code> option, after initialization:</caption>
     * // getter
     * var inputTime = $( ".selector" ).ojInputTime( "option", "pickerAttributes" );
     *
     * @expose
     * @memberof! oj.ojInputTime
     * @instance
     * @type {?Object}
     * @default <code class="prettyprint">null</code>
     */
    pickerAttributes: null,

    /**
     * The renderMode option allows applications to specify whether to render time picker in JET or 
     * as a native picker control.</br>
     * 
     * Valid values: jet, native
     *
     * <ul>
     *  <li> jet - Applications get full JET functionality.</li>
     *  <li> native - Applications get the functionality of the native picker.</li></br>
     *  Note that the native picker support is limited to Cordova plugin published 
     *  at 'https://github.com/VitaliiBlagodir/cordova-plugin-datepicker'.</br>
     *  With native renderMode, the functionality that is sacrificed compared to jet renderMode are:
     *    <ul>
     *      <li>Time picker cannot be themed</li>
     *      <li>Accessibility is limited to what the native picker supports</li>
     *      <li>pickerAttributes is not applied</li>
     *      <li>Sub-IDs are not available</li>
     *      <li>hide() function is no-op</li>
     *      <li>translations sub options pertaining to the picker is not available</li>
     *      <li>'timePicker.timeIncrement' option is limited to iOS and will only take a precision of minutes</li>
     *    </ul>
     * </ul>
     *
     * @expose 
     * @memberof! oj.ojInputTime
     * @instance
     * @type {string}
     * @default value depends on the theme. In alta-android, alta-ios and alta-windows themes, the 
     * default is "native" and it's "jet" for alta desktop theme.
     *
     * @example <caption>Get or set the <code class="prettyprint">renderMode</code> option for
     * an ojInputTime after initialization:</caption>
     * // getter
     * var renderMode = $( ".selector" ).ojInputTime( "option", "renderMode" );
     * // setter
     * $( ".selector" ).ojInputTime( "option", "renderMode", "native" );
     * // Example to set the default in the theme (SCSS)
     * $inputDateTimeRenderModeOptionDefault: native !default;
     */
    renderMode : "jet",

    /**
     * <p>
     * Note that Jet framework prohibits setting subset of options which are object types.<br/><br/>
     * For example $(".selector").ojInputTime("option", "timePicker", {timeIncrement': "00:30:00:00"}); is prohibited as it will
     * wipe out all other sub-options for "timePicker" object.<br/><br/> If one wishes to do this [by above syntax or knockout] one
     * will have to get the "timePicker" object, modify the necessary sub-option and pass it to above syntax.<br/><br/>
     *
     * The properties supported on the timePicker option are:
     *
     * @property {string=} timeIncrement Time increment to be used for ojInputTime, the format is hh:mm:ss:SS. <br/><br/>
     * Note that when renderMode is 'native', timeIncrement option is limited to iOS and will only take a precision of minutes.<br/><br/> 
     *
     * The default value is <code class="prettyprint">{timePicker: {timeIncrement': "00:30:00:00"}}</code>. <br/><br/>
     * Example <code class="prettyprint">$(".selector").ojInputTime("option", "timePicker.timeIncrement", "00:10:00:00");</code>
     *
     * @property {string=} showOn When the timepicker should be shown. <br/><br/>
     * Possible values are
     * <ul>
     *  <li>"focus" - when the element receives focus or when the trigger clock image is clicked. When the picker is closed, the field regains focus and is editable.</li>
     *  <li>"image" - when the trigger clock image is clicked</li>
     * </ul>
     * <br/>
     * Example to initialize the inputTime with showOn option specified 
     * <code class="prettyprint">$(".selector").ojInputTime("option", "timePicker.showOn", "focus");</code>
     * </p>
     *
     * @expose
     * @instance
     * @memberof! oj.ojInputTime
     * @type {Object}
     */
    timePicker:
    {
      /**
       * @expose
       */
      timeIncrement : "00:30:00:00",

      /**
       * @expose
       */
      showOn : "focus"
    }

    // DOCLETS

    /**
     * The placeholder text to set on the element. Though it is possible to set placeholder
     * attribute on the element itself, the component will only read the value when the component
     * is created. Subsequent changes to the element's placeholder attribute will not be picked up
     * and page authors should update the option directly.
     *
     * @example <caption>Initialize the component with the <code class="prettyprint">placeholder</code> option:</caption>
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojInputTime', placeholder: 'Birth Date'}" /&gt;
     *
     * @example <caption>Initialize <code class="prettyprint">placeholder</code> option from html attribute:</caption>
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojInputTime'}" placeholder="User Name" /&gt;
     *
     * @default when the option is not set, the element's placeholder attribute is used if it exists.
     * If the attribute is not set then the default can be the converter hint provided by the
     * datetime converter. See displayOptions for details.
     *
     * @access public
     * @instance
     * @expose
     * @name placeholder
     * @instance
     * @memberof! oj.ojInputTime
     */

    /**
     * List of validators used by component when performing validation. Each item is either an
     * instance that duck types {@link oj.Validator}, or is an Object literal containing the
     * properties listed below. Implicit validators created by a component when certain options
     * are present (e.g. <code class="prettyprint">required</code> option), are separate from
     * validators specified through this option. At runtime when the component runs validation, it
     * combines the implicit validators with the list specified through this option.
     * <p>
     * Hints exposed by validators are shown in the notewindow by default, or as determined by the
     * 'validatorHint' property set on the <code class="prettyprint">displayOptions</code>
     * option.
     * </p>
     *
     * <p>
     * When <code class="prettyprint">validators</code> option changes due to programmatic
     * intervention, the component may decide to clear messages and run validation, based on the
     * current state it is in. </br>
     *
     * <h4>Steps Performed Always</h4>
     * <ul>
     * <li>The cached list of validator instances are cleared and new validator hints is pushed to
     * messaging. E.g., notewindow displays the new hint(s).
     * </li>
     * </ul>
     *
     * <h4>Running Validation</h4>
     * <ul>
     * <li>if component is valid when validators changes, component does nothing other than the
     * steps it always performs.</li>
     * <li>if component is invalid and is showing messages -
     * <code class="prettyprint">messagesShown</code> option is non-empty, when
     * <code class="prettyprint">validators</code> changes then all component messages are cleared
     * and full validation run using the display value on the component.
     * <ul>
     *   <li>if there are validation errors, then <code class="prettyprint">value</code>
     *   option is not updated and the error pushed to <code class="prettyprint">messagesShown</code>
     *   option.
     *   </li>
     *   <li>if no errors result from the validation, the <code class="prettyprint">value</code>
     *   option is updated; page author can listen to the <code class="prettyprint">optionChange</code>
     *   event on the <code class="prettyprint">value</code> option to clear custom errors.</li>
     * </ul>
     * </li>
     * <li>if component is invalid and has deferred messages when validators changes, it does
     * nothing other than the steps it performs always.</li>
     * </ul>
     * </p>
     *
     * <h4>Clearing Messages</h4>
     * <ul>
     * <li>Only messages created by the component are cleared.  These include ones in
     * <code class="prettyprint">messagesHidden</code> and <code class="prettyprint">messagesShown</code>
     *  options.</li>
     * <li><code class="prettyprint">messagesCustom</code> option is not cleared.</li>
     * </ul>
     * </p>
     *
     * @property {string} type - the validator type that has a {@link oj.ValidatorFactory} that can
     * be retrieved using the {@link oj.Validation} module. For a list of supported validators refer
     * to {@link oj.ValidatorFactory}. <br/>
     * @property {Object=} options - optional Object literal of options that the validator expects.
     *
     * @example <caption>Initialize the component with validator object literal:</caption>
     * $(".selector").ojInputTime({
     *   validators: [{
     *     type: 'dateTimeRange',
     *     options : {
     *       max: 'T14:30:00',
     *       min: 'T02:30:00'
     *     }
     *   }],
     * });
     *
     * NOTE: oj.Validation.validatorFactory('dateTimeRange') returns the validator factory that is used
     * to instantiate a range validator for dateTime.
     *
     * @example <caption>Initialize the component with multiple validator instances:</caption>
     * var validator1 = new MyCustomValidator({'foo': 'A'});
     * var validator2 = new MyCustomValidator({'foo': 'B'});
     * // Foo is InputText, InputNumber, Select, etc.
     * $(".selector").ojFoo({
     *   value: 10,
     *   validators: [validator1, validator2]
     * });
     *
     * @expose
     * @name validators
     * @instance
     * @memberof oj.ojInputTime
     * @type {Array|undefined}
     */

    /**
     * The value of the ojInputTime component which should be an ISOString.
     *
     * @example <caption>Initialize the component with the <code class="prettyprint">value</code> option:</caption>
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojInputTime', value: 'T10:30:00.000'}" /&gt;
     * @example <caption>Initialize the component with the <code class="prettyprint">value</code> option specified programmatically
     * using oj.IntlConverterUtils.dateToLocalIso :</caption>
     * $(".selector").ojInputTime({'value': oj.IntlConverterUtils.dateToLocalIso(new Date())});<br/>
     * @example <caption>Get or set the <code class="prettyprint">value</code> option, after initialization:</caption>
     * // Getter: returns Today's date in ISOString
     * $(".selector").ojInputTime("option", "value");
     * // Setter: sets it to a different date
     * $(".selector").ojInputTime("option", "value", "T20:00:00-08:00");
     *
     * @expose
     * @name value
     * @instance
     * @memberof! oj.ojInputTime
     * @default When the option is not set, the element's value property is used as its initial value
     * if it exists. This value must be an ISOString.
     */
  },

  /**
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputTime
   */
  _InitOptions: function(originalDefaults, constructorOptions)
  {
    this._super(originalDefaults, constructorOptions);
    //when it is of ojInputDateTime component, do not initialize values from dom node since it's an empty input node if inline or
    //if not inline the values should be taken care of by ojInputDateTime. Note that option values would have been passed by
    //ojInputDateTime
    if(this.options["datePickerComp"] === null)
    {
      oj.EditableValueUtils.initializeOptionsFromDom(this._GET_INIT_OPTIONS_PROPS, constructorOptions, this);
    }
  },

  /**
   * @ignore
   */
  _InitBase : function()
  {
    this._timePickerDefaultValidators = {};
    this._datePickerComp = this.options["datePickerComp"];
    this._inputContainer = null;
    this._redirectFocusToInputContainer = false;
    this._isMobile = false;
    
    //only case is when of showOn of focus and one hides the element [need to avoid showing]
    this._ignoreShow = false;
    
    // need this flag to keep track of native picker opened, there is no callback on native API
    //  to find out otherwise.
    this._nativePickerShowing = false;

    this._timeSourceConverter = null;

    this._timePickerDisplay = $("<div id='" + this._GetSubId(this._TIME_PICKER_ID) + "' class='oj-listbox-drop' style='display:none'></div>");
    $("body").append(this._timePickerDisplay); //@HTMLUpdateOK

    var self = this;

    this._popUpTimePickerDisplay = this._timePickerDisplay.ojPopup(
    {
      "initialFocus": "none",
      "rootAttributes": {"class": "datetimepicker-dropdown"},
      "chrome": "none",
      "modality": "modeless",
      "open": function ()
      {

        var selected = $("[aria-selected]", self._timePickerDisplay);
        if (selected.length === 1)
        {
          self._checkScrollTop(selected.parent(), true);
        }

        if (self.options["timePicker"]["showOn"] === "image" ||
            !self._isIndependentInput()) 
        {
          $("ul", self._timePickerDisplay).focus();
        }
      },
      "beforeClose": function ()
      {
         self._timeListBoxScrollTop = $("ul", self._timePickerDisplay).scrollTop();
      }
    });

    var pickerAttrs = this.options.pickerAttributes;
    if (pickerAttrs)
      oj.EditableValueUtils.setPickerAttributes(this._popUpTimePickerDisplay.ojPopup("widget"), pickerAttrs);

    // I want to wrap the inputTime if it is all by itself, or if it is
    // part of the inline inputDateTime component which is the inline date stacked on top of an
    // inputTime. The inline error messages will go under the inputTime part. TODO: how?
    // right now the destroy fails because I am whacking away something.. the dom.
    if (this._isIndependentInput())
      this._ELEMENT_TRIGGER_WRAPPER_CLASS_NAMES += this._INPUT_CONTAINER_CLASS;
  },

  _timepickerShowing: function ()
  {
    return this._popUpTimePickerDisplay.ojPopup("isOpen") || this._nativePickerShowing;
  },

  /**
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputTime
   */
  _ComponentCreate : function()
  {
    this._InitBase();

    var ret = this._superApply(arguments);

    if (this._isContainedInDateTimePicker() && !this._isDatePickerInline())
    {
      //set to nothing since then of not inline and don't want to place two component classes to
      //the same input element
      this._CLASS_NAMES = "";
    }
    else
    {

      //if isoString has a different timezone then the one provided in the converter, need to perform 
      //conversion so pass it through the method
      if(this.options["value"])
      {
        var formatted = this._GetConverter()["format"](this.options["value"]);
        this._SetValue(formatted, {});
      }

      // active state handler, only in case time picker is independent
      bindActive(this);
    }

    this._processReadOnlyKeyboardEdit();
    this._attachTrigger();

    return ret;
  },

  /**
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputTime
   */
  _AfterCreate : function ()
  {
    var ret = this._superApply(arguments);

    disableEnableSpan(this._triggerNode.children(), this.options["disabled"]);

    return ret;
  },

  /**
   * @ignore
   * @protected
   * @override
   */
  _setOption : function (key, value, flags)
  {
    var retVal = null;

    //When a null, undefined, or "" value is passed in set to null for consistency
    //note that if they pass in 0 it will also set it null
    if (key === "value")
    {
      if(!value)
      {
        value = null;
      }

      retVal = this._super(key, value, flags);
      this._generateTime();
      return retVal;
    }

    retVal = this._superApply(arguments);

    if(key === "disabled")
    {
      if(value)
      {
        this._hide(this._ON_CLOSE_REASON_CLOSE);
      }
      this._triggerNode.find("." + this._TRIGGER_TIME_CLASS).attr("title", this._getTimeTitle());
      disableEnableSpan(this._triggerNode.children(), value);
    }
    else if ((key === "max" || key === "min") && !this._isContainedInDateTimePicker())
    {
      //since validators are immutable, they will contain min + max as local values. B/c of this will need to recreate

      this._timePickerDefaultValidators[oj.ValidatorFactory.VALIDATOR_TYPE_DATETIMERANGE] = getImplicitDateTimeRangeValidator(this.options, this._GetConverter());
      this._AfterSetOptionValidators();
    }
    else if(key === "readOnly")
    {
      this._processReadOnlyKeyboardEdit();

      if (value)
      {
        this._hide(this._ON_CLOSE_REASON_CLOSE);
      }
    }
    else if(key === "keyboardEdit")
    {
      this._processReadOnlyKeyboardEdit();
    }
    else if(key === "converter") 
    {
      this._timeSourceConverter = null;
    }

    var redrawTimePicker = {"max": true, "min": true, "converter": true, "timePicker": true};
    if(key in redrawTimePicker)
    {
      //changing back to original code of invoking _generateTime per discussion
      this._generateTime();
    }

    return retVal;
  },

  /**
   * @ignore
   * @protected
   * @override
   */
  _destroy : function ()
  {
    var retVal = this._super();

    if (this._isIndependentInput())
    {
      this.element.off("focus touchstart");
      this._wrapper.off("touchstart");
    }

    if (this._triggerNode)
    {
      this._triggerNode.remove();
    }

    this._timePickerDisplay.remove();

    return retVal;
  },

  /**
   * @ignore
   */
  _processReadOnlyKeyboardEdit: function()
  {
    var readonly = this.options["readOnly"] ||
            this._isKeyboardEditDisabled();
    this.element.prop("readOnly", !!readonly);
  },

  /**
   * @ignore
   * @return {boolean}
   */
  _isKeyboardEditDisabled: function()
  {
    return this.options["keyboardEdit"] === this._KEYBOARD_EDIT_OPTION_DISABLED;
  },

  /**
   * Invoke super only if it is standlone or if it is part of ojInputDateTime and ojInputDateTime is inline
   *
   * @ignore
   * @protected
   * @override
   */
  _AppendInputHelper : function ()
  {
    if (this._isIndependentInput())
    {
      this._superApply(arguments);
    }
  },

  /**
   * Only time to have ojInputTime handle the display of timepicker by keyDown is when datePickerComp reference is null or
   * when it is not null and is inline
   *
   * @ignore
   * @protected
   * @override
   * @param {Event} event
   */
  _onKeyDownHandler : function (event)
  {
    if(this._isIndependentInput())
    {
      this._superApply(arguments);

      var kc = $.ui.keyCode,
        handled = false;

      if (this._timepickerShowing())
      {
        switch (event.keyCode)
        {
          case kc.TAB: ;
            this._hide(this._ON_CLOSE_REASON_TAB);
            break;
          case kc.ESCAPE:
            this._hide(this._ON_CLOSE_REASON_CANCELLED);
            handled = true;
            break;
          case kc.UP: ;
          case kc.DOWN:
            $("ul", this._timePickerDisplay).focus();
            handled = true;
            break;
          default:;
        }
      }
      else 
      {
        switch (event.keyCode)
        {
          case kc.UP: ;
          case kc.DOWN:
            this._SetValue(this._GetDisplayValue(), event);
            this.show();
            handled = true;
            break;
          default:;
        }
      }
  
      if (handled || event.keyCode === kc.ENTER)
      {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }
  },

  _getTimeTitle: function ()
  {
    return this._EscapeXSS(this.getTranslatedString("tooltipTime" + (this.options["disabled"] ? "Disabled" : "")));
  },

  /**
   * @protected
   * @override
   */
  _WrapElement: function()
  {
    this._inputContainer = this._superApply(arguments);
    this._inputContainer.attr({"role": "combobox", "aria-haspopup": "true", "tabindex": "-1"});
  },

  /**
   * When input element has focus
   * @private
   */
  _onElementFocus : function()
  {
    var showOn = this.options["timePicker"]["showOn"];
    
    if(this._redirectFocusToInputContainer) 
    {
      this._redirectFocusToInputContainer = false;
      this._inputContainer.focus();
    }
    else
    {
      if (showOn === "focus")
      {
        // pop-up date picker when focus placed on the input box
        this.show();
      }
      else 
      {
        if(this._timepickerShowing()) 
        {
          this._hide(this._ON_CLOSE_REASON_CLOSE);
        }
      }
    }
  },

  /**
   * When input element is touched
   *
   * @ignore
   * @protected
   */
  _OnElementTouchStart : function()
  {
    var showOn = this.options["timePicker"]["showOn"];

    // If the focus is already on the text box and can't edit with keyboard
    // and show on is focus then reopen the picker.
    if(showOn === "focus")
    {
      if (this._timepickerShowing()) 
      {
        this._ignoreShow = true;
        this._hide(this._ON_CLOSE_REASON_CLOSE);
      }
      else
      {
        var inputActive = this.element[0] === document.activeElement;

        this.show();
        this._redirectFocusToInputContainer = true;

        if(inputActive) 
        {
          this._inputContainer.focus();
        }
      }
    }
  },

  /**
   * This function will create the necessary time trigger container [i.e. image to launch the time drop down]
   * and perform any attachment to events
   *
   * @private
   */
  _attachTrigger : function ()
  {
    var showOn = this.options["timePicker"]["showOn"];
    var isIndependentInput = this._isIndependentInput();
    var triggerContainer = isIndependentInput ? $("<span>").addClass(this._TRIGGER_CLASS) : $("+ span", this.element);
    var triggerTime = $("<span title='" + this._getTimeTitle() + "'/>").addClass(this._TRIGGER_TIME_CLASS + " oj-clickable-icon-nocontext oj-component-icon");

    var self = this;

    if (isIndependentInput)
    {
      this.element.on("focus", $.proxy(this._onElementFocus, this));
      this.element.on("touchstart", $.proxy(this._OnElementTouchStart, this));
    }

    var wrapper = this._isIndependentInput() ? this._wrapper : this._datePickerComp["widget"]._wrapper;
    wrapper.on("touchstart", function(e)
    {
      self._isMobile = true;
    });

    if (showOn === "image")
    {
      // we need to show the icon that we hid by display:none in the mobile themes
      triggerTime.css("display", "block");
      
      // In iOS theme, we defaulted to use border radius given that showOn=focus is default and
      //  we will not have trigger icon. For showOn=image case, we will show the icon, so
      //  we need to remove the border radius. iOS is the only case we use border radius, so this
      //  setting for all cases is fine.
      if (this._IsRTL())
      {
        this.element.css("border-top-left-radius", 0);
        this.element.css("border-bottom-left-radius", 0);
      }
      else
      {
        this.element.css("border-top-right-radius", 0);
        this.element.css("border-bottom-right-radius", 0);
      }
    }
    
    // do not attach time picker icon if not independent input mode and native picker is in use 
    //  - this is because the native pickers let pick both date and time, showing one icon is 
    //  sufficient and less clutter hence
    if (isIndependentInput || !isPickerNative(this))
    {
      triggerContainer.append(triggerTime); //@HTMLUpdateOK
      
      triggerTime.on("click", function ()
      {
        if (self._timepickerShowing())
        {
          self._hide(self._ON_CLOSE_REASON_CLOSE);
        }
        else
        {
          self.show();
          $("ul", self._timePickerDisplay).focus();
        }
      });
      
      this._AddHoverable(triggerTime);
      this._AddActiveable(triggerTime);
      
      this._triggerIcon = triggerTime;
    }
    
    this._triggerNode = triggerContainer;
    
    // we need to add container only if we are in independent mode, else inputDate already would 
    //  have attached it
    if (isIndependentInput)
    {
      this.element.after(triggerContainer); //@HTMLUpdateOK
    }
  },

  /**
   * Returns a boolean of whether the date is in the min + max range
   * 
   * @private
   */
  _notInMinMaxRange : function (dateIso, minDateIso, maxDateIso) 
  {
    var converter = this._GetConverter();
    
    return ((minDateIso && converter.compareISODates(dateIso, minDateIso) < 0) 
          || (maxDateIso && converter.compareISODates(dateIso, maxDateIso) > 0));
  },
  
  _getValue : function () 
  {
    //need to use ojInputDateTime's value when created internally [i.e. for min + max and etc].
    return this._isContainedInDateTimePicker() ? this._datePickerComp["widget"].getValueForInputTime() : this.options["value"];
  },

  /**
   * This function will generate the time drop down
   *
   * @private
   */
  _generateTime : function ()
  {
    var processDateIso = this._getValue(), today,
        converter = this._GetConverter(),
        timeNode = $("<ul class='oj-listbox-results' tabindex='-1' role='listbox'></ul>"),
        selectedDateFormat = (processDateIso ? converter.format(processDateIso) : ""), 
        source = [], i, j;

    //if note provided use local time per discussion
    if(!processDateIso) 
    {
      today = new Date();
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      today.setMilliseconds(0);
      processDateIso = oj.IntlConverterUtils.dateToLocalIso(today);
    } else {
        //means that it is of value; however need to clean it up to include only the time portion for ojInputTime
        if(!this._isContainedInDateTimePicker()) {
            processDateIso = converter.parse(selectedDateFormat);
        }
    }

    source = this._getTimeSource(processDateIso);
    selectedDateFormat = selectedDateFormat || source[0].value; //either choose the selected date or if it doesn't exist the first value

    this._timePickerDisplay.empty();

    for (i = 0, j = source.length;i < j;i++)
    {
      var value = source[i].value,
          minMaxRange = source[i]["minMaxRange"],
          liNode = $("<li class='oj-listbox-result " + (minMaxRange ? "oj-disabled" : "") + "' role='presentation'>"),
          nodeId = this["uuid"] + "_sel" + i,
          node = $("<div class='oj-listbox-result-label' " + (minMaxRange ? "aria-disabled " : "") + "data-value='" + value + "' role='option' id='" +
                    nodeId + "'>" + source[i].label + "</li>");

      if (selectedDateFormat === value)
      {
        node.attr("aria-selected", "true");
        liNode.addClass("oj-hover"); //TODO When combo box changes it's CSS to Jet specific [i.e. oj-selected or something else] make the same change
        timeNode.attr("aria-activedescendant", nodeId);
      }

      liNode.append(node); //@HTMLUpdateOK
      timeNode.append(liNode); //@HTMLUpdateOK
    }

    this._timePickerDisplay.append(timeNode); //@HTMLUpdateOK

    $(".oj-listbox-result", timeNode).on("mousemove", function ()
    {
      var ref = $(this);

      if(ref.hasClass("oj-disabled"))
      {
        //ignore disabled entries
        return;
      }

      $(".oj-hover", timeNode).removeClass("oj-hover"); //remove previously selected entry TODO modify when combo box changes

      ref.addClass("oj-hover"); //TODO modify when combo box changes its CSS selection identifier

      timeNode.attr("aria-activedescendant", ref.children()[0].id);
    });

    var self = this;
    timeNode.on("click", function (event)
    {
      var target = $(event.target);

      if(target.hasClass("oj-disabled") || target.attr("aria-disabled") !== undefined)
      {
        //disabled
        return;
      }

      self._processTimeSelection(event);
    }).on("keydown", function (event)
    {
      self._timeNodeKeyDown(event);
    });
    
    $("ul", this._timePickerDisplay).one("focus", function() {
      var selected = $("[aria-selected]", self._timePickerDisplay);
      if (selected.length === 1)
      {
        self._checkScrollTop($(selected));
      }
    });
  },

  /**
   * So the request is to always show from 12AM - 11:xxPM in the time drop down.
   * Due to difference in timezone of the converter's timeZone + isoStrFormat, there can be conversion and 
   * for that need to clean up the isoString for format.
   *
   * @private
   * @return {Object} converter
   */
  _getTimeSourceConverter: function() 
  {
    if(this._timeSourceConverter === null) {
        this._timeSourceConverter = _getTimePickerConverter(this._GetConverter(), {"isoStrFormat": "offset"});
    }
    
    return this._timeSourceConverter;
  },
  
  /**
   * This function will return an array of JSON objects of label + value for the
   * time drop down
   *
   * @private
   * @param {string} dateIso to get timeSource of
   * @return {Array} source
   */
  _getTimeSource : function (dateIso)
  {
    var source = [], converter = this._GetConverter(), timeIncrement = this.options["timePicker"]["timeIncrement"], 
        converterUtils = oj.IntlConverterUtils, formatted = "",
        containedInDateTimePicker = this._isContainedInDateTimePicker(), tempDate = new Date(),
        minDateIso = containedInDateTimePicker ? this._datePickerComp["widget"].options["min"] : this.options["min"], 
        maxDateIso = containedInDateTimePicker ? this._datePickerComp["widget"].options["max"] : this.options["max"];

    var splitIncrements = splitTimeIncrement(timeIncrement);

    minDateIso = minDateIso ? converterUtils._minMaxIsoString(minDateIso, this._getValue()) : minDateIso;
    maxDateIso = maxDateIso ? converterUtils._minMaxIsoString(maxDateIso, this._getValue()) : maxDateIso;

    tempDate.setDate(1);
    tempDate.setHours(0);
    tempDate.setMinutes(0);
    tempDate.setSeconds(0);
    tempDate.setMilliseconds(0);

    var nextDate = new Date(tempDate);

    nextDate.setDate(2);

    var timeSourceConverter = this._getTimeSourceConverter();
    dateIso = timeSourceConverter.parse(dateIso);
    dateIso = converterUtils._clearTime(dateIso);

    do
    {
      formatted = this._EscapeXSS(converter.format(dateIso));
      source.push(
      {
        label : formatted, value : formatted, "minMaxRange" : this._notInMinMaxRange(dateIso, minDateIso, maxDateIso)
      });

      tempDate.setHours(tempDate.getHours() + splitIncrements.hourIncr);
      tempDate.setMinutes(tempDate.getMinutes() + splitIncrements.minuteIncr);
      tempDate.setSeconds(tempDate.getSeconds() + splitIncrements.secondIncr);
      tempDate.setMilliseconds(tempDate.getMilliseconds() + splitIncrements.millisecondIncr);

      dateIso = converterUtils._dateTime(dateIso, {"hours": tempDate.getHours(), "minutes": tempDate.getMinutes(), 
                                      "seconds": tempDate.getSeconds(), "milliseconds": tempDate.getMilliseconds()});
    }
    while (tempDate.getDate() !== nextDate.getDate());

    return source;
  },

  //This handler is when an user keys down with the drop down has focus
  _timeNodeKeyDown : function (event)
  {

    if (this._timepickerShowing())
    {

      var kc = $.ui.keyCode,
          handled = false;

      switch (event.keyCode)
      {
        case kc.TAB: ;
          this._hide(this._ON_CLOSE_REASON_TAB);
          break;
        case kc.ESCAPE:
          this._hide(this._ON_CLOSE_REASON_CANCELLED);
          handled = true;
          break;
        case kc.UP:
          this._processNextPrevSibling(event, "prev");
          handled = true;
          break;
        case kc.DOWN:
          this._processNextPrevSibling(event, "next");
          handled = true;
          break;
        case kc.ENTER:
          this._processTimeSelection(event);
          handled = true;
          break;
      }

      if (handled)
      {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }
  },

  /**
   * This function will set the oj-hover to the next or previous sibling due to key down or key up stroke
   *
   * @private
   * @param {Event} event
   * @param {string} prevOrNext
   */
  _processNextPrevSibling : function (event, prevOrNext)
  {
    var prevActive = $(".oj-hover", this._timePickerDisplay), //TODO update when combobox updates their selector CSS
        ulElement = $("ul", this._timePickerDisplay),
        node = null;

    if (prevActive.length === 1)
    {
      node = prevActive[prevOrNext]();
      if (node.length === 1)
      {
        prevActive.removeClass("oj-hover"); //TODO update when combobox updates their selector CSS
      }
    }
    else
    {
      //if empty node [meaning value of the component can be not in interval, i.e. 12:33PM when interval is 30min
      //select the first node
      node = $(ulElement.children()[0]);
    }

    if(node && node.length === 1)
    {
      node.addClass("oj-hover");
      ulElement.attr("aria-activedescendant", node.children()[0].id);
      this._checkScrollTop(node);
    }
  },

  /**
   * This handler is when an user selects a time entry
   *
   * @private
   * @param {Event} event
   */
  _processTimeSelection : function (event)
  {

    var timePickerDisplay = this._timePickerDisplay,
        prevSelected = $("[aria-selected]", timePickerDisplay),
        ulElement = $("ul", timePickerDisplay),
        selected = $(".oj-hover div", timePickerDisplay); //TODO update when combobox updates their selector CSS

    if (selected.length !== 1)
    {
      return;
    }

    if(prevSelected.length === 1)
    {
      //previous selection can be 0 so remove only when of size 1
      prevSelected.removeAttr("aria-selected");
      prevSelected.parent().removeClass("oj-hover");  //TODO update when combobox updates their selector CSS
    }

    selected.attr("aria-selected", "true");
    selected.parent().addClass("oj-hover"); //TODO update when combobox updates their selector CSS

    this._hide(this._ON_CLOSE_REASON_SELECTION);

    this._SetDisplayValue(selected.attr("data-value")); //requirement to invoke _SetDisplayValue since _SetValue doesn't invoke it
    this._SetValue(selected.attr("data-value"), event);

    ulElement.attr("aria-activedescendant", selected[0].id);

    if (this._isContainedInDateTimePicker())
    {
      //when focus is placed on the input, since datePickerComp w/ showOn of focus can display it
      this._datePickerComp["widget"]._hide(this._ON_CLOSE_REASON_SELECTION);
    }
  },

  /**
   * Invoked when blur is triggered of the this.element
   *
   * @ignore
   * @protected
   * @param {Event} event
   */
  _onBlurHandler : function (event)
  {
    if(this._isIndependentInput())
    {
      this._superApply(arguments);
    }
  },

  /**
   * Shows the timepicker
   *
   * @expose
   * @instance
   * @memberof! oj.ojInputTime
   */
  show : function ()
  {
    if (this._timepickerShowing() || this.options["disabled"] || this.options["readOnly"])
    {
      return;
    }

    if (this._ignoreShow)
    {
      //set within hide or elsewhere and focus is placed back on this.element
      this._ignoreShow = false;
      return;
    }

    if (isPickerNative(this))
    {
      // our html picker is inside popup, which will take care of removing focus from input element, 
      //  for native case we do it explicitly
      this.element.blur();
      return this._showNativeTimePicker();
    }
    else
    {
      return this._showHTMLTimePicker();
    }
  },

  /**
   * Shows the native time picker
   *
   * @private
   */
  _showNativeTimePicker : function ()
  {
    // picker expects the fields like 'date' and 'mode' to retain its names. Use bracket notation
    //  to avoid closure compiler from renaming them
    var pickerOptions = {};
    var converter = this._getTimeSourceConverter();
    var date = _getNativePickerDate(converter, this._getValue());
    
    pickerOptions['date'] = date;
    pickerOptions['mode'] = 'time';
    
    var splitIncrements = splitTimeIncrement(this.options["timePicker"]["timeIncrement"]);
    
    // native picker supports only minute interval and only on iOS, we consider
    //  minute interval only when hours is not specified
    pickerOptions['minuteInterval'] = (splitIncrements.hourIncr === 0) ? splitIncrements.minuteIncr : 1;
    
    // if part of datetime, then get the min/max from the date component
    var minDate = this._isContainedInDateTimePicker() ? 
      this._datePickerComp["widget"].options["min"] : this.options["min"];
    var maxDate = this._isContainedInDateTimePicker() ? 
      this._datePickerComp["widget"].options["max"] : this.options["max"];
    
    if (minDate)
    {
      // get a correctly formatted ISO date string
      var minDateProcessed = _getNativePickerDate(converter, oj.IntlConverterUtils._minMaxIsoString(minDate, this._getValue()));
      pickerOptions['minDate'] = minDateProcessed.valueOf();
    }
    
    if (maxDate)
    {
    // get a correctly formatted ISO date string
      var maxDateProcessed = _getNativePickerDate(converter, oj.IntlConverterUtils._minMaxIsoString(maxDate, this._getValue()));
      pickerOptions['maxDate'] = maxDateProcessed.valueOf();
    }
    
    var self = this;
    
    function onTimePicked(date) 
    {
      self._nativePickerShowing = false;
      
      // for iOS and windows, from the current implementation of the native datepicker plugin,
      //  for case when the picker is cancelled, this callback gets called without the parameter
      if (date)
      {
        // The time picker displays the time portion as is supplied, regardless of device timezone.
        //  Explicitly setting timezone is supported only in iOS, and we do not have a need to do
        //  so at this time, so not exposing this feature for now.
        //  The value returned after pick will have the supplied timezone preserved, however, the
        //  date portion will be reset to current date when in 'time' mode. This will not impact us 
        //  because we extract only the time portion to be set on the component.
        var isoString = oj.IntlConverterUtils._dateTime(self._getValue(), {"hours": date.getHours(), "minutes": date.getMinutes(), "seconds": date.getSeconds()});
        var formattedTime = self._GetConverter().format(isoString);
        
        // _SetValue will inturn call _SetDisplayValue
        self._SetValue(formattedTime, {});
      }
      
      self._onClose(self._ON_CLOSE_REASON_SELECTION);
    }
    
    // onError is called only for Android for cases where picker is cancelled, or if there were
    //  to be any error at the native picker end
    function onError(error)
    {
      self._nativePickerShowing = false;
      
      // if user cancels the picker dialog, we just bring the focus back
      // closure compiler renames 'startsWith', using bracket notation hence
      if (error["startsWith"]('cancel'))
      {
        self._onClose(self._ON_CLOSE_REASON_CANCELLED);
      }
      else
      {
        oj.Logger.log('Error: native time picker failed: ' + error);
      }
    }
    
    this._nativePickerShowing = true;
    
    // datePicker is variable at the top level available when the cordova date picker plugin is
    //  included
    window['datePicker'].show(pickerOptions, onTimePicked, onError);
  },
  
  /**
   * Shows the HTML timepicker
   *
   * @private
   */
  _showHTMLTimePicker : function ()
  {
    if (this._isContainedInDateTimePicker())
    {
      //need to hide the datePickerComp prior to showing timepicker
      this._datePickerComp["widget"]._hide(this._ON_CLOSE_REASON_CLOSE);
    }

    this._generateTime();

    var timePickerDisplay = this._timePickerDisplay,
        popUpTimePickerDisplay = this._popUpTimePickerDisplay;

    //Need to set the width to align with what combobox does
    timePickerDisplay.width(this.element.parent().width());

    //TODO REMOVE LATER WHEN THE CSS HAS BEEN MODIFIED for oj-listbox-drop, causes the popup to think it's not visible
    //due to offsetwidth + offsetheight being 0
    timePickerDisplay.css({"position": "relative"});

    var rtl = this._IsRTL();
    var position = oj.PositionUtils.normalizeHorizontalAlignment({"my" : "start top", "at" : "start bottom", "of" : this.element, "collision" : "flipfit flipfit"}, rtl);

    popUpTimePickerDisplay.ojPopup("open", this.element.parent(), position);

    // Opening the popup wipes out the oj-hover class during _NotifyDetached()
    // Restore the hover the same as _generatedTime set them
    timePickerDisplay.find("[aria-selected]").parent().addClass("oj-hover");
  },

  /**
   * Hides the timepicker. Note that this function is a no-op when renderMode is 'native'.
   *
   * @expose
   * @instance
   * @memberof! oj.ojInputTime
   */
  hide : function ()
  {
    return this._hide(this._ON_CLOSE_REASON_CLOSE);
  },

  /**
   * Hides the timepicker
   *
   * @param {string} reason - the reason that the popup is being hidden ("selection", "cancelled", "tab")
   *
   * @expose
   * @memberof! oj.ojInputTime
   * @instance
   */
  _hide : function (reason)
  {
    if (!isPickerNative(this) && this._timepickerShowing())
    {
      this._popUpTimePickerDisplay.ojPopup("close");
      this._onClose(reason);
    }

    return this;
  },

  /**
   * Sets focus to the right place after the picker is closed
   *
   * @param {string} reason - the reason that the popup is being hidden ("selection", "cancelled", "tab", "close")
   * @ignore
   */
  _onClose : function (reason)
  {
    if(this._isMobile && this.options["timePicker"]["showOn"] === "focus") 
    {
      var inputContainer = this._isIndependentInput() ? this._inputContainer : this._datePickerComp["widget"]._inputContainer;
      inputContainer.focus();
    }
    else 
    {
      
      if(this.options["timePicker"]["showOn"] === "focus") 
      {
        if (!this._isIndependentInput())
        {
          this._datePickerComp["widget"]._ignoreShow = true;
        }
        else
        {
          this._ignoreShow = true;
        }
      }
      this.element.focus();
    }
  },

  /**
   * @expose
   * @instance
   * @memberof! oj.ojInputTime
   */
  refresh : function ()
  {
    if(this._triggerNode) {
      this._triggerNode.find("." + this._TRIGGER_TIME_CLASS).attr("title", this._getTimeTitle());
    }
    return this._superApply(arguments) || this;
  },

  /**
   * @ignore
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputTime
   */
  _SetDisplayValue : function (displayValue)
  {
    //When not part of datePickerComp or of inline should update input element
    if (this._isIndependentInput())
    {
      this._superApply(arguments);
    }

    //so this is a change in behavior from original design. Previously it was decided that app developer
    //would have to invoke refresh to render the calendar after setting the new value programatically; however now it is
    //required to hook it in when _SetDisplayValue is invoked [can't use _SetValue b/c that function is not invoked
    //when developer invokes ("option", "value", "..")
    if(this._timepickerShowing())
    {
      this._generateTime();
    }
  },

  /**
   * @ignore
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputTime
   */
  _SetValue : function (newValue, event, options)
  {
    if(this._isContainedInDateTimePicker())
    {
      //never update the model if part of ojInputDateTime. Have ojInputDateTime update the model's value [otherwise 2 updates]
      //this is mainly for check of whether the format is correct [i.e when ojInputDateTime is inline], since the value
      //is always picked from the ojInputDateTime component
      this._super(newValue, null, options);

      try{
        //since parsing can cause a conversion error [would have been taken care of in the above call]

        var converter = this._GetConverter(),
            parsedNewValue = converter["parse"](newValue),
            converterUtils = oj.IntlConverterUtils,
            datePickerCompWidget = this._datePickerComp["widget"],
            dateTimeValue = datePickerCompWidget.getValueForInputTime() || converterUtils.dateToLocalIso(new Date());

        if(parsedNewValue && converter.compareISODates(dateTimeValue, parsedNewValue) === 0)
        {
          //need to kick out if _SetValue happened due to Blur w/o changing of value
          return;
        }

        var isoString = converterUtils._copyTimeOver(parsedNewValue || converterUtils.dateToLocalIso(new Date()), 
            dateTimeValue);

        datePickerCompWidget.timeSelected(isoString, event);
      }catch(e)
      {

      }
    }
    else
    {
      this._superApply(arguments);
    }
  },

  /**
   * Whether the this.element should be wrapped. Function so that additional conditions can be placed
   *
   * @ignore
   * @protected
   * @override
   * @return {boolean}
   */
  _DoWrapElement : function ()
  {
    return this._isIndependentInput();
  },

  /**
   * Whether the input element of ojInputTime is shared or not [i.e. not part of ojInputDateTime or if it has
   * been created by ojInputDateTime that is inline
   *
   * @ignore
   * @return {boolean}
   */
  _isIndependentInput : function ()
  {
    return !this._isContainedInDateTimePicker() || this._isDatePickerInline();
  },

  /**
   * @protected
   * @override
   * @return {string}
   * @instance
   * @memberof! oj.ojInputTime
   */
  _GetDefaultStyleClass : function ()
  {
    return "oj-inputtime";
  },

  /**
   * @ignore
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputTime
   */
  _GetElementValue : function ()
  {
    return this.options['value'] || "";
  },

  /**
   * Sets up the default dateTimeRange and dateRestriction validators.
   *
   * @ignore
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputDate
   */
  _GetImplicitValidators : function ()
  {
    var ret = this._superApply(arguments);

    if((this.options['min'] != null || this.options['max'] != null) && !this._isContainedInDateTimePicker())
    {
      //need to alter how the default validators work as validators are now immutable and to create the implicit validator only
      //if independent input [i.e. otherwise have ojInputDateTime take care of it]
      this._timePickerDefaultValidators[oj.ValidatorFactory.VALIDATOR_TYPE_DATETIMERANGE] = getImplicitDateTimeRangeValidator(this.options, this._GetConverter());
    }

    return $.extend(this._timePickerDefaultValidators, ret);
  },

  /**
   * Need to override since apparently we allow users to set the converter to null, undefined, and etc and when
   * they do we use the default converter
   *
   * @return {Object} a converter instance or null
   *
   * @memberof! oj.ojInputTime
   * @instance
   * @protected
   * @override
   */
  _GetConverter : function ()
  {
    return this.options['converter'] ?
            this._superApply(arguments) :
            $["oj"]["ojInputTime"]["prototype"]["options"]["converter"];
  },

  /**
   * This helper function will check if the currently selected time entry is within the view and if not will scroll to it
   *
   * @private
   * @param {Object} node
   * @param {boolean} opening
   */
  _checkScrollTop : function (node, opening)
  {
    var container = node.parent();

    // If the popup is closed and the reopened restore the scroll position
    if (opening && this._timeListBoxScrollTop)
    {
      $(container).scrollTop(this._timeListBoxScrollTop);
    }

    var containerTop = $(container).scrollTop();
    var containerBottom = containerTop + $(container).height();
    var nodeTop = node[0].offsetTop;
    var nodeBottom = nodeTop + $(node).height();
    if (nodeTop < containerTop)
    {
      $(container).scrollTop(nodeTop);
    }
    else if (nodeBottom > containerBottom)
    {
      $(container).scrollTop(nodeBottom - $(container).height());
    }
  },

  /**
   * Whether ojInputTime has been created by ojInputDateTime
   *
   * @private
   */
  _isContainedInDateTimePicker : function ()
  {
    return this._datePickerComp !== null;
  },

  /**
   * Helper function to determine whether the provided datePickerComp is inline or not
   *
   * @private
   */
  _isDatePickerInline : function ()
  {
    return this._datePickerComp["inline"];
  },

  /**
   * Notifies the component that its subtree has been removed from the document programmatically after the component has
   * been created
   * @memberof! oj.ojInputTime
   * @instance
   * @protected
   */
  _NotifyDetached: function()
  {
    this._hide(this._ON_CLOSE_REASON_CLOSE);
    // hide sets focus to the input, so we want to call super after hide. If we didn't, then
    // the messaging popup will reopen and we don't want that.
    this._superApply(arguments);
  },


  /**
   * Notifies the component that its subtree has been made hidden programmatically after the component has
   * been created
   * @memberof! oj.ojInputTime
   * @instance
   * @protected
   */
  _NotifyHidden: function()
  {
    this._hide(this._ON_CLOSE_REASON_CLOSE);
    // hide sets focus to the input, so we want to call super after hide. If we didn't, then
    // the messaging popup will reopen and we don't want that.
    this._superApply(arguments);
  },

  /**
   * Return the subcomponent node represented by the documented locator attribute values. <br/>
   * If the locator is null or no subId string is provided then this method returns the element that
   * this component was initalized with. <br/>
   * If a subId was provided but a subcomponent node cannot be located this method returns null.
   *
   * <p>If the <code class="prettyprint">locator</code> or its <code class="prettyprint">subId</code> is
   * <code class="prettyprint">null</code>, then this method returns the element on which this component was initalized.
   *
   * <p>If a <code class="prettyprint">subId</code> was provided but no corresponding node
   * can be located, then this method returns <code class="prettyprint">null</code>.
   *
   * @expose
   * @override
   * @memberof oj.ojInputTime
   * @instance
   *
   * @param {Object} locator An Object containing, at minimum, a <code class="prettyprint">subId</code>
   * property. See the table for details on its fields.
   *
   * @property {string=} locator.subId - A string that identifies a particular DOM node in this component.
   *
   * <p>The supported sub-ID's are documented in the <a href="#subids-section">Sub-ID's</a> section of this document.
   *
   * @property {number=} locator.index - A zero-based index, used to locate a message content node
   * or a hint node within the popup.
   * @returns {Element|null} The DOM node located by the <code class="prettyprint">subId</code> string passed in
   * <code class="prettyprint">locator</code>, or <code class="prettyprint">null</code> if none is found.
   *
   * @example <caption>Get the node for a certain subId:</caption>
   * var node = $( ".selector" ).ojInputTime( "getNodeBySubId", {'subId': 'oj-some-sub-id'} );
   */
  getNodeBySubId: function(locator)
  {
    var node = null,
        subId = locator && locator['subId'];

    if(subId) {
      switch(subId)
      {
      case "oj-listbox-drop": node = this._timePickerDisplay[0]; break;
      case "oj-inputdatetime-time-icon": node = $(".oj-inputdatetime-time-icon", this._triggerNode)[0]; break;
      case "oj-inputdatetime-time-input": node = this.element[0]; break;
      default: node = null;
      }
    }

    return node || this._superApply(arguments);
  },

  /**
   * Returns the subId string for the given child DOM node.  For more details, see
   * <a href="#getNodeBySubId">getNodeBySubId</a>.
   *
   * @expose
   * @override
   * @memberof oj.ojInputTime
   * @instance
   *
   * @param {!Element} node - child DOM node
   * @return {string|null} The subId for the DOM node, or <code class="prettyprint">null</code> when none is found.
   *
   * @example <caption>Get the subId for a certain DOM node:</caption>
   * // Foo is ojInputNumber, ojInputTime, etc.
   * var subId = $( ".selector" ).ojFoo( "getSubIdByNode", nodeInsideComponent );
   */
  getSubIdByNode: function(node)
  {
    var timeIcon = $(".oj-inputdatetime-time-icon", this._triggerNode),
        subId = null;

    if(node === this._timePickerDisplay[0])
    {
      subId = "oj-listbox-drop";
    }
    else if(node === timeIcon[0])
    {
      subId = "oj-inputdatetime-time-icon";
    }
    else if(node === this.element[0])
    {
      subId = "oj-inputdatetime-time-input";
    }

    return subId || this._superApply(arguments);
  },

  /**
   * Returns the root node
   *
   * @expose
   * @instance
   * @memberof! oj.ojInputTime
   */
  widget : function ()
  {
    return this._isIndependentInput() ? this._super() : this._datePickerComp["widget"].widget();
  }

});

// Add custom getters for properties
oj.Components.setDefaultOptions(
{
  'ojInputTime':
  {
    'renderMode': oj.Components.createDynamicPropertyGetter(
      function()
      {
        return (oj.ThemeUtils.parseJSONFromFontFamily('oj-inputdatetime-option-defaults') || {})["renderMode"];
      }),

    'keyboardEdit': oj.Components.createDynamicPropertyGetter(
      function()
      {
        return (oj.ThemeUtils.parseJSONFromFontFamily('oj-inputdatetime-option-defaults') || {})["keyboardEdit"];
      })
    }
  }
);

// Fragments:

/**
 * <table class="keyboard-table">
 *   <thead>
 *     <tr>
 *       <th>Target</th>
 *       <th>Gesture</th>
 *       <th>Action</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td>Input element and time trigger icon</td>
 *       <td><kbd>Tap</kbd></td>
 *       <td>Shows the time picker and moves the focus into the expanded time picker</td>
 *     </tr>
 *     <tr>
 *       <td>Input element with picker open</td>
 *       <td><kbd>Tap</kbd></td>
 *       <td>Set focus to the input. If hints, title or messages exist in a notewindow, 
 *        pop up the notewindow.</td>
 *     </tr>
 *     {@ojinclude "name":"labelTouchDoc"}
 *   </tbody>
 * </table>
 *
 * @ojfragment touchDoc - Used in touch gesture section of classdesc, and standalone gesture doc
 * @memberof oj.ojInputTime
 */

/**
 * <table class="keyboard-table">
 *   <thead>
 *     <tr>
 *       <th>Target</th>
 *       <th>Key</th>
 *       <th>Action</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td>Input element</td>
 *       <td><kbd>DownArrow or UpArrow</kbd></td>
 *       <td>Shows the time picker and moves the focus into the expanded time picker</td>
 *     </tr>
 *     <tr>
 *       <td>Input element</td>
 *       <td><kbd>Tab In</kbd></td>
 *       <td>Set focus to the input. If hints, title or messages exist in a notewindow, 
 *        pop up the notewindow.</td>
 *     </tr> 
 *     {@ojinclude "name":"labelKeyboardDoc"} 
 *   </tbody>
 * </table>
 *
 * @ojfragment keyboardDoc - Used in keyboard section of classdesc, and standalone gesture doc
 * @memberof oj.ojInputTime
 */

//////////////////     SUB-IDS     //////////////////

/**
 * <p>Sub-ID for the ojInputTime component's input element.</p>
 *
 * @ojsubid oj-inputdatetime-time-input
 * @memberof oj.ojInputTime
 * @instance
 *
 * @example <caption>Get the node for the input element:</caption>
 * var node = $( ".selector" ).ojInputTime( "getNodeBySubId", {'subId': 'oj-inputdatetime-time-input'} );
 */

/**
 * <p>Sub-ID for the time icon that triggers the time drop down display.</p>
 *
 * @ojsubid oj-inputdatetime-time-icon
 * @memberof oj.ojInputTime
 * @instance
 *
 * @example <caption>Get the time icon that triggers the time drop down display:</caption>
 * // Foo is ojInputTime or ojInputDateTime.
 * var node = $( ".selector" ).ojFoo( "getNodeBySubId", {'subId': 'oj-inputdatetime-time-icon'} );
 */

/**
 * <p>Sub-ID for the time drop down div container.</p>
 *
 * @ojsubid oj-listbox-drop
 * @memberof oj.ojInputTime
 * @instance
 *
 * @example <caption>Get the time drop down div container:</caption>
 * // Foo is ojInputTime, ojInputDateTime, etc.
 * var node = $( ".selector" ).ojFoo( "getNodeBySubId", {'subId': 'oj-listbox-drop'} );
 */

/**
 * Copyright (c) 2014, Oracle and/or its affiliates.
 * All rights reserved.
 */

/**
 * @ojcomponent oj.ojInputDateTime
 * @augments oj.ojInputDate
 * @since 0.6
 * 
 * @classdesc
 * <h3 id="inputDateTimeOverview-section">
 *   JET ojInputDateTime Component
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#inputDateTimeOverview-section"></a>
 * </h3>
 * 
 * <p>Description: ojInputDateTime extends from ojInputDate providing additionally time selection drop down.</p>
 * 
 * <h3 id="touch-section">
 *   Touch End User Information
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#touch-section"></a>
 * </h3>
 *
 * {@ojinclude "name":"touchDoc"}
 *
 * <h3 id="keyboard-section">
 *   Keyboard End User Information
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#keyboard-section"></a>
 * </h3>
 *
 * {@ojinclude "name":"keyboardDoc"}
 * 
 * <h3 id="pseudos-section">
 *   Pseudo-selectors
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#pseudos-section"></a>
 * </h3>
 * 
 * <pre class="prettyprint">
 * <code>$( ":oj-inputDateTime" )            // selects all JET input on the page
 * </code>
 * </pre>
 * 
  * <h3 id="a11y-section">
 *   Accessibility
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#a11y-section"></a>
 * </h3>
 * <p>
 * It is up to the application developer to associate the label to the input component.
 * For inputDateTime, you should put an <code>id</code> on the input, and then set 
 * the <code>for</code> attribute on the label to be the input's id.
 * </p>
 * <h3 id="label-section">
 *   Label and InputDateTime
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#label-section"></a>
 * </h3>
 * <p>
 * For accessibility, you should associate a label element with the input
 * by putting an <code>id</code> on the input, and then setting the 
 * <code>for</code> attribute on the label to be the input's id.
 * </p>
 * <p>
 * The component will decorate its associated label with required and help 
 * information, if the <code>required</code> and <code>help</code> options are set. 
 * </p> 
 * <h3 id="binding-section">
 *   Declarative Binding
 *   <a class="bookmarkable-link" title="Bookmarkable Link" href="#binding-section"></a>
 * </h3>
 * 
 * <pre class="prettyprint">
 * <code>
 *    &lt;input id="dateTimeId" data-bind="ojComponent: {component: 'ojInputDateTime'}" /&gt;
 * </code>
 * </pre>
 * 
 * @desc Creates or re-initializes a JET ojInputDateTime
 * 
 * @param {Object=} options a map of option-value pairs to set on the component
 * 
 * @example <caption>Initialize the input element with no options specified:</caption>
 * $( ".selector" ).ojInputDateTime();
 * 
 * * @example <caption>Initialize the input element with some options:</caption>
 * $( ".selector" ).ojInputDateTime( { "disabled": true } );
 * 
 * @example <caption>Initialize the input element via the JET <code class="prettyprint">ojComponent</code> binding:</caption>
 * &lt;input id="dateTimeId" data-bind="ojComponent: {component: 'ojInputDateTime'}" /&gt;
 */
oj.__registerWidget("oj.ojInputDateTime", $['oj']['ojInputDate'], 
{
  version : "1.0.0", 
  widgetEventPrefix : "oj",
  
  //-------------------------------------From base---------------------------------------------------//
  _WIDGET_CLASS_NAMES : "oj-inputdatetime-date-time oj-component oj-inputdatetime",
  _INPUT_HELPER_KEY: "inputHelpBoth",
  //-------------------------------------End from base-----------------------------------------------//
  
  options : 
  {
    /**
     * Default converter for ojInputDateTime
     *
     * If one wishes to provide a custom converter for the ojInputDateTime override the factory returned for
     * oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME)
     *
     * @expose
     * @instance
     * @memberof! oj.ojInputDateTime
     * @default <code class="prettyprint">oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME).createConverter({"day": "2-digit", "month": "2-digit", "year": "2-digit", "hour": "2-digit", "hour12": true, "minute": "2-digit"})</code>
     */
    converter : oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME).createConverter(
    {
      "day" : "2-digit", "month" : "2-digit", "year" : "2-digit", "hour" : "2-digit", "hour12" : true, "minute" : "2-digit"
    }),

    /**
     * The renderMode option allows applications to specify whether to render date and time pickers 
     * in JET or as a native picker control.</br>
     * 
     * Valid values: jet, native
     *
     * <ul>
     *  <li> jet - Applications get full JET functionality.</li>
     *  <li> native - Applications get the functionality of the native picker.</li></br>
     *  Note that the native picker support is limited to Cordova plugin published 
     *  at 'https://github.com/VitaliiBlagodir/cordova-plugin-datepicker'.</br>
     *  With native renderMode, the functionality that is sacrificed compared to jet renderMode are:
     *    <ul>
     *      <li>Date and time pickers cannot be themed</li>
     *      <li>Accessibility is limited to what the native picker supports</li>
     *      <li>pickerAttributes is not applied</li>
     *      <li>Sub-IDs are not available</li>
     *      <li>hide() and hideTimePicker() functions are no-op</li>
     *      <li>translations sub options pertaining to the picker is not available</li>
     *      <li>All of the 'datepicker' sub-options except 'showOn' are not available</li>
     *      <li>'timePicker.timeIncrement' option is limited to iOS and will only take a precision of minutes</li>
     *    </ul>
     * </ul>
     *
     * @expose 
     * @memberof! oj.ojInputDateTime
     * @instance
     * @type {string}
     * @default value depends on the theme. In alta-android, alta-ios and alta-windows themes, the 
     * default is "native" and it's "jet" for alta desktop theme.
     *
     * @example <caption>Get or set the <code class="prettyprint">renderMode</code> option for
     * an ojInputDateTime after initialization:</caption>
     * // getter
     * var renderMode = $( ".selector" ).ojInputDateTime( "option", "renderMode" );
     * // setter
     * $( ".selector" ).ojInputDateTime( "option", "renderMode", "native" );
     * // Example to set the default in the theme (SCSS)
     * $inputDateTimeRenderModeOptionDefault: native !default;
     */
    renderMode : "jet",
    
    /**
     * <p>
     * Note that Jet framework prohibits setting subset of options which are object types.<br/><br/>
     * For example $(".selector").ojInputDateTime("option", "timePicker", {timeIncrement': "00:30:00:00"}); is prohibited as it will
     * wipe out all other sub-options for "timePicker" object.<br/><br/> If one wishes to do this [by above syntax or knockout] one
     * will have to get the "timePicker" object, modify the necessary sub-option and pass it to above syntax.<br/><br/>
     *
     * The properties supported on the timePicker option are:
     *
     * @property {string=} timeIncrement Time increment to be used for ojInputDateTime, the format is hh:mm:ss:SS. <br/><br/>
     * Note that when renderMode is 'native', timeIncrement option is limited to iOS and will only take a precision of minutes.<br/><br/> 
     *
     * The default value is <code class="prettyprint">{timePicker: {timeIncrement': "00:30:00:00"}}</code>. <br/><br/>
     * Example <code class="prettyprint">$(".selector").ojInputDateTime("option", "timePicker.timeIncrement", "00:10:00:00");</code>
     *
     * @property {string=} showOn When the timepicker should be shown. <br/><br/>
     * Possible values are
     * <ul>
     *  <li>"focus" - when the element receives focus or when the trigger clock image is clicked. When the picker is closed, the field regains focus and is editable.</li>
     *  <li>"image" - when the trigger clock image is clicked</li>
     * </ul>
     * <br/>
     * Example to initialize the inputTime with showOn option specified 
     * <code class="prettyprint">$(".selector").ojInputDateTime("option", "timePicker.showOn", "focus");</code>
     * </p>
     *
     * @expose
     * @instance
     * @memberof! oj.ojInputDateTime
     * @type {Object}
     */
    timePicker:
    {
      /**
       * @expose
       */
      timeIncrement : "00:30:00:00",

      /**
       * @expose
       */
      showOn : "focus"
    }
    
    /**
     * The maximum selectable datetime. When set to null, there is no maximum.
     *
     * <ul>
     *  <li> type string - ISOString
     *  <li> null - no limit
     * </ul>
     * 
     * @example <caption>Initialize the component with the <code class="prettyprint">max</code> option:</caption>
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojInputDateTime', max: '2014-09-25T13:30:00.000-08:00'}" /&gt;
     * 
     * @expose
     * @name max
     * @instance
     * @memberof! oj.ojInputDateTime
     * @default <code class="prettyprint">null</code>
     */
    
    /**
     * The minimum selectable date. When set to null, there is no minimum.
     *
     * <ul>
     *  <li> type string - ISOString
     *  <li> null - no limit
     * </ul>
     * 
     * @example <caption>Initialize the component with the <code class="prettyprint">min</code> option:</caption>
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojInputDateTime', min: '2014-08-25T08:00:00.000-08:00'}" /&gt;
     * 
     * @expose
     * @name min
     * @instance
     * @memberof! oj.ojInputDateTime
     * @default <code class="prettyprint">null</code>
     */
    
    /** 
     * List of validators used by component when performing validation. Each item is either an 
     * instance that duck types {@link oj.Validator}, or is an Object literal containing the 
     * properties listed below. Implicit validators created by a component when certain options 
     * are present (e.g. <code class="prettyprint">required</code> option), are separate from 
     * validators specified through this option. At runtime when the component runs validation, it 
     * combines the implicit validators with the list specified through this option. 
     * <p>
     * Hints exposed by validators are shown in the notewindow by default, or as determined by the 
     * 'validatorHint' property set on the <code class="prettyprint">displayOptions</code> 
     * option. 
     * </p>
     * 
     * <p>
     * When <code class="prettyprint">validators</code> option changes due to programmatic 
     * intervention, the component may decide to clear messages and run validation, based on the 
     * current state it is in. </br>
     * 
     * <h4>Steps Performed Always</h4>
     * <ul>
     * <li>The cached list of validator instances are cleared and new validator hints is pushed to 
     * messaging. E.g., notewindow displays the new hint(s).
     * </li>
     * </ul>
     *  
     * <h4>Running Validation</h4>
     * <ul>
     * <li>if component is valid when validators changes, component does nothing other than the 
     * steps it always performs.</li>
     * <li>if component is invalid and is showing messages -
     * <code class="prettyprint">messagesShown</code> option is non-empty, when 
     * <code class="prettyprint">validators</code> changes then all component messages are cleared 
     * and full validation run using the display value on the component. 
     * <ul>
     *   <li>if there are validation errors, then <code class="prettyprint">value</code> 
     *   option is not updated and the error pushed to <code class="prettyprint">messagesShown</code>
     *   option. 
     *   </li>
     *   <li>if no errors result from the validation, the <code class="prettyprint">value</code> 
     *   option is updated; page author can listen to the <code class="prettyprint">optionChange</code> 
     *   event on the <code class="prettyprint">value</code> option to clear custom errors.</li>
     * </ul>
     * </li>
     * <li>if component is invalid and has deferred messages when validators changes, it does 
     * nothing other than the steps it performs always.</li>
     * </ul>
     * </p>
     * 
     * <h4>Clearing Messages</h4>
     * <ul>
     * <li>Only messages created by the component are cleared.  These include ones in 
     * <code class="prettyprint">messagesHidden</code> and <code class="prettyprint">messagesShown</code>
     *  options.</li>
     * <li><code class="prettyprint">messagesCustom</code> option is not cleared.</li>
     * </ul>
     * </p>
     * 
     * @property {string} type - the validator type that has a {@link oj.ValidatorFactory} that can 
     * be retrieved using the {@link oj.Validation} module. For a list of supported validators refer 
     * to {@link oj.ValidatorFactory}. <br/>
     * @property {Object=} options - optional Object literal of options that the validator expects. 
     * 
     * @example <caption>Initialize the component with validator object literal:</caption>
     * $(".selector").ojInputDateTime({
     *   validators: [{
     *     type: 'dateTimeRange', 
     *     options : {
     *       max: '2014-09-10T13:30:00.000',
     *       min: '2014-09-01T00:00:00.000'
     *     }
     *   }],
     * });
     * 
     * NOTE: oj.Validation.validatorFactory('dateTimeRange') returns the validator factory that is used 
     * to instantiate a range validator for dateTime.
     * 
     * @example <caption>Initialize the component with multiple validator instances:</caption>
     * var validator1 = new MyCustomValidator({'foo': 'A'}); 
     * var validator2 = new MyCustomValidator({'foo': 'B'});
     * // Foo is InputText, InputNumber, Select, etc.
     * $(".selector").ojFoo({
     *   value: 10, 
     *   validators: [validator1, validator2]
     * });
     * 
     * @expose 
     * @name validators
     * @instance
     * @memberof oj.ojInputDateTime
     * @type {Array|undefined}
     */
    
    /** 
     * The value of the ojInputDateTime component which should be an ISOString
     * 
     * @example <caption>Initialize the component with the <code class="prettyprint">value</code> option:</caption>
     * &lt;input id="date" data-bind="ojComponent: {component: 'ojInputDateTime', value: '2014-09-10T13:30:00.000'}" /&gt;
     * @example <caption>Initialize the component with the <code class="prettyprint">value</code> option specified programmatically 
     * using oj.IntlConverterUtils.dateToLocalIso :</caption>
     * $(".selector").ojInputDateTime({'value': oj.IntlConverterUtils.dateToLocalIso(new Date())});<br/>
     * @example <caption>Get or set the <code class="prettyprint">value</code> option, after initialization:</caption>
     * // Getter: returns Today's date in ISOString
     * $(".selector").ojInputDateTime("option", "value");
     * // Setter: sets it to a different date time
     * $(".selector").ojInputDateTime("option", "value", "2013-12-01T20:00:00-08:00");
     * 
     * @expose 
     * @name value
     * @instance
     * @memberof! oj.ojInputDateTime
     * @default When the option is not set, the element's value property is used as its initial value 
     * if it exists. This value must be an ISOString.
     */
  },
  
  /**
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputDateTime
   */
  _InitBase : function () 
  {
    this._super();
    
    this._timePickerElement = this.element; //if the ojInputDateTime is inline, then this ref will change to a NEW input element
    this._timePicker = null;
    this._timeConverter = null;
    
    //need to remember the last _SetValue for the case of timepicker [i.e. select a date that is not in range due to 
    //time; however since we don't push invalid values to this.options["value"] the timepicker would pick up the wrong 
    //selected date
    this._previousValue = null;
  },
  
  /**
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputDateTime
   */
  _ComponentCreate : function ()
  {
    var ret = this._super(), 
        timeConverter = this._getTimePickerConverter(this._GetConverter());
    
    if (timeConverter === null)
    {
      throw new Error("Please use ojInputDate if you do not have time portion");
    }
    
    if (this._isInLine)
    {
      //Since DatePicker never intended to have timepicker associated to it
      //need to have an input element that is tied to the time selector
      
      var input = $("<input type='text'>");
      input.insertAfter(this.element); //@HTMLUpdateOK
      
      //Now need to reset this._timePickerElement to the newly created input element
      this._timePickerElement = input;
    }
    
    var passOptions = ["title", "placeholder", "disabled", "required", "readOnly", 
      "keyboardEdit", "pickerAttributes"];
    var passObject = {};
        
    for(var i=0, j=passOptions.length; i < j; i++) 
    {
      passObject[passOptions[i]] = this.options[passOptions[i]];
    }
    
    var messagesDisplayOption = this.options['displayOptions']['messages'];
    
    //create time instance for the time portion
    // jmw Seems to be a bug where messages are always in notewindow. So I think I should
    // carry the displayOptions over to the timePicker.
    this._timePicker = this._timePickerElement.ojInputTime(
    $.extend(passObject, {
      "converter" : timeConverter,
      "displayOptions" : {"converterHint": "none", "title": "none", "messages": messagesDisplayOption},
      //need to pass the value down as otherwise if the value is null then it might pickup this.element.val() from 
      //our frameworks generic if options.value is not defined then pick up from element; however that would be a formatted 
      //value from ojInputDateTime
      "value": this.options["value"], 
      "timePicker" : this.options["timePicker"], 
      "datePickerComp" : {"widget": this, "inline": this._isInLine} 
    }));
    
    return ret;
  },
  
  _setOption : function (key, value, flags)
  {
    var retVal = this._superApply(arguments);
    
    if (key === "value") 
    {
      //if goes through model does it needs to update or should be only used by selection + keydown
      this._previousValue = this.options["value"]; //get from this.options["value"] as would be cleaned up by editablevalue
    }
    
    if(this._timePicker) 
    {
      //note that min + max are not passed through since it should be taken care of by ojInputDateTime and not ojInputTime
      //as it needs to use the fulle datetime
      var timeInvoker = {"disabled": true, "readOnly": true, "keyboardEdit": true};
      
      if (key in timeInvoker)
      {
        this._timePicker.ojInputTime("option", key, value);
      }
      else if(key === "timePicker")
      {
        this._timePicker.ojInputTime("option", "timePicker.timeIncrement", value["timeIncrement"]);
      }
      else if (key === "converter")
      {
        this._timeConverter = null;
        this._timePicker.ojInputTime("option", key, this._getTimePickerConverter(this._GetConverter())); //need to invoke _GetConverter for the case when null and etc sent in
      }
    }
    
    return retVal;
  },
  
  /**
   * @ignore
   * @protected
   * @override
   */
  _destroy : function ()
  {
    var ret = this._super();

    this._timePicker.ojInputTime("destroy");

    if (this._isInLine)
    {
      //note that this.element below would be of the TimePicker's input element
      this._timePickerElement.remove();
    }
    
    return ret;
  },

  /**
   * When input element is touched
   * 
   * @ignore
   * @protected
   */
  _OnElementTouchStart : function()
  {
    var showOn = this.options["datePicker"]["showOn"];

    // special condition for when timepicker is open
    // if open need to close timepicker and put focus back on the element
    if(showOn === "focus")
    {
      var tListbox = $(this._timePicker.ojInputTime("getNodeBySubId", {'subId': "oj-listbox-drop"}));
      if (tListbox.is(":visible")) 
      {
        this._timePicker.ojInputTime("hide");
        this._ignoreShow = true;
        this.element.focus();
        return;
      }
    }

    this._super();
  },
  
  /*
   * Will provide the timePicker converter based on the actual converter
   */
  _getTimePickerConverter : function (converter) 
  {
    if(this._timeConverter !== null) 
    {
      return this._timeConverter;
    }

    this._timeConverter = _getTimePickerConverter(converter);
    return this._timeConverter;
  },
  
  /**
   * Handler for when the time is selected. Should be invoked ONLY by the ojInputTime component
   * 
   * @ignore
   * @param {string} newValue
   * @param {Event} event
   */
  timeSelected : function (newValue, event)
  {
    //TEMP TILL FIXED pass in formatted for _SetValue (should be newValue)
    var formatted = this._GetConverter()["format"](newValue);
    this._SetDisplayValue( formatted );
    this._SetValue(formatted, event);
  },
  
  /**
   * Provides the current displayed selected value for ojInputTime component [i.e. when is invalid return this._previousValue]
   * The complication occurs b/c we do not push invalid values to the model and b/c of that reason this.options["value"] 
   * might contain outdated isoString for ojInputTime. For instance let's say the min date is 02/01/14 2PM then 
   * when an user selects 02/01/14 the component would be invalid [as 12AM] and the value would not be pushed. However one needs 
   * to give opportunity for ojInputTime to allow user in selecting the valid datetime in full so the _previousValue 
   * must be passed through.
   * 
   * @ignore
   */
  getValueForInputTime : function ()
  {
    if(this.isValid()) 
    {
      return this.options["value"];
    }
    else 
    {
      if(this._previousValue) 
      {
        try 
        {
          //might have been that the user typed in an incorrect format, so try to parse it
          return this._GetConverter()["parse"](this._previousValue);
        }
        catch(e) 
        {
          return this.options["value"];
        }
      }
      else 
      {
        return null;
      }
    }
  },
  
  /**
   * @ignore
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputDateTime
   */
  _SetValue : function (newValue, event, options)
  {
    this._superApply(arguments);
    
    this._previousValue = newValue;
  },
  
  /**
   * Just for the case of launching timepicker with Shift + Up or Shift + Down
   * 
   * @ignore
   * @protected
   * @override
   * @param {Event} event
   * @instance
   * @memberof! oj.ojInputDateTime
   */
  _onKeyDownHandler : function (event) 
  {
    var kc = $.ui.keyCode, 
        handled = false;
    
    switch (event.keyCode)
    {
      case kc.UP: ;
      case kc.DOWN:
        if(event.shiftKey)
        {
          this._SetValue(this._GetDisplayValue(), event);
          this._timePicker.ojInputTime("show");
          handled = true;
        }
        break;
      default: ;
    }

    if (handled)
    {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    
    return this._superApply(arguments);
  },
  
  /**
   * @ignore
   * @expose
   * @instance
   * @memberof! oj.ojInputDateTime
   */
  show : function ()
  {
    // possible that time picker is open when in non-native mode, hide it
    if (!isPickerNative(this))
    {
      this._timePicker.ojInputTime("hide");
    }

    return this._super();
  },

  /**
   * Shows the native datepicker
   *
   * @protected
   * @override
   * @memberof! oj.ojInputDateTime
   * @instance
   */
  _ShowNativeDatePicker : function (pickerOptions)
  {
    // override the mode set by base class
    pickerOptions['mode'] = "datetime";
    
    var splitIncrements = splitTimeIncrement(this.options["timePicker"]["timeIncrement"]);
    
    // native picker supports only minute interval and only on iOS, we consider minute interval 
    //  only when hours is not specified
    pickerOptions.minuteInterval = (splitIncrements.hourIncr === 0) ? splitIncrements.minuteIncr : 1;
    
    return this._super(pickerOptions);
  },

  /**
   * callback upon picking date from native picker
   *
   * @protected
   * @override
   * @memberof! oj.ojInputDateTime
   * @instance
   */
  _OnDatePicked : function (date)
  {
    this._nativePickerShowing = false;
    
    // for iOS and windows, from the current implementation of the native datepicker plugin,
    //  for case when the picker is cancelled, this callback gets called without the parameter
    if (date)
    {
      var isoString = oj.IntlConverterUtils._dateTime(this._getDateIso(), {"month": date.getMonth(), "date": date.getDate(), "fullYear": date.getFullYear(), 
                                            "hours": date.getHours(), "minutes": date.getMinutes(), "seconds": date.getSeconds()});
      var formattedTime = this._GetConverter().format(isoString);

      // _SetValue will inturn call _SetDisplayValue
      this._SetValue(formattedTime, {});
    }
    
    this._onClose(this._ON_CLOSE_REASON_SELECTION);
  },
  
  /**
   * Method to show the internally created ojInputTime
   * 
   * @expose
   * @memberof! oj.ojInputDateTime
   * @instance
   */
  showTimePicker : function ()
  {
    this.hide();
    return this._timePicker.ojInputTime("show");
  },
  
  /**
   * Method to hide the internally created ojInputTime.
   * Note that this function is a no-op when renderMode is 'native'.
   * 
   * @expose
   * @memberof! oj.ojInputDateTime
   * @instance
   */
  hideTimePicker : function ()
  {
    return this._timePicker.ojInputTime("hide");
  },
  
  /** 
   * @ignore
   * @override
   * @instance
   * @memberof! oj.ojInputDateTime
   */
  refresh : function ()
  {
    var retVal = this._superApply(arguments) || this;
    
    this._timePicker.ojInputTime("refresh");
    
    return retVal;
  },
  
  /**
   * Return the subcomponent node represented by the documented locator attribute values. <br/>
   * If the locator is null or no subId string is provided then this method returns the element that 
   * this component was initalized with. <br/>
   * If a subId was provided but a subcomponent node cannot be located this method returns null.
   * 
   * <p>If the <code class="prettyprint">locator</code> or its <code class="prettyprint">subId</code> is 
   * <code class="prettyprint">null</code>, then this method returns the element on which this component was initalized.
   * 
   * <p>If a <code class="prettyprint">subId</code> was provided but no corresponding node 
   * can be located, then this method returns <code class="prettyprint">null</code>.
   * 
   * @expose
   * @override
   * @memberof oj.ojInputDateTime
   * @instance
   * 
   * @param {Object} locator An Object containing, at minimum, a <code class="prettyprint">subId</code> 
   * property. See the table for details on its fields.
   * 
   * @property {string=} locator.subId - A string that identifies a particular DOM node in this component.
   * 
   * <p>The supported sub-ID's are documented in the <a href="#subids-section">Sub-ID's</a> section of this document.
   * 
   * @property {number=} locator.index - A zero-based index, used to locate a message content node 
   * or a hint node within the popup. 
   * @returns {Element|null} The DOM node located by the <code class="prettyprint">subId</code> string passed in 
   * <code class="prettyprint">locator</code>, or <code class="prettyprint">null</code> if none is found.
   * 
   * @example <caption>Get the node for a certain subId:</caption>
   * var node = $( ".selector" ).ojInputDateTime( "getNodeBySubId", {'subId': 'oj-some-sub-id'} );
   */
  getNodeBySubId: function(locator)
  {
    var subId = locator && locator['subId'],
        node = null;
    
    if(subId) 
    {
      if(subId === "oj-listbox-drop" || subId === "oj-inputdatetime-time-icon") 
      {
        node = this._timePicker.ojInputTime("getNodeBySubId", locator);
      }
      else if(subId === "oj-inputdatetime-date-input") 
      {
        node = this._isInLine ? this._timePickerElement[0] : this.element[0];
      }
    }
    
    return node || this._superApply(arguments);
  },
  
  /**
   * Returns the subId string for the given child DOM node.  For more details, see 
   * <a href="#getNodeBySubId">getNodeBySubId</a>.
   * 
   * @expose
   * @override
   * @memberof oj.ojInputDateTime
   * @instance
   * 
   * @param {!Element} node - child DOM node
   * @return {string|null} The subId for the DOM node, or <code class="prettyprint">null</code> when none is found.
   * 
   * @example <caption>Get the subId for a certain DOM node:</caption>
   * // Foo is ojInputNumber, ojInputDate, etc.
   * var subId = $( ".selector" ).ojFoo( "getSubIdByNode", nodeInsideComponent );
   */
  getSubIdByNode: function(node)
  {
    var dateTimeSpecific = null;
    
    if(this._isInLine) 
    {
      if(node === this._timePickerElement[0]) 
      {
        dateTimeSpecific = "oj-inputdatetime-date-input";
      }
    }
    else 
    {
      if(node === this.element[0]) 
      {
        dateTimeSpecific = "oj-inputdatetime-date-input";
      }
    }
    
    return dateTimeSpecific || this._timePicker.ojInputTime("getSubIdByNode", node) || this._superApply(arguments);
  },
  
  /**
   * Need to override since apparently we allow users to set the converter to null, undefined, and etc and when 
   * they do we use the default converter
   * 
   * @return {Object} a converter instance or null
   * 
   * @memberof! oj.ojInputDateTime
   * @instance
   * @protected
   * @override
   */
  _GetConverter : function () 
  {
    return this.options['converter'] ? 
            this._superApply(arguments) :
            $["oj"]["ojInputDateTime"]["prototype"]["options"]["converter"];
  },
  
  /**
   * Notifies the component that its subtree has been removed from the document programmatically after the component has
   * been created
   * @memberof! oj.ojInputDateTime
   * @instance
   * @protected 
   */
  _NotifyDetached: function()
  {
    if(this._timePicker) 
    {
      this.hideTimePicker();
    }

    // hide sets focus to the input, so we want to call super after hide. If we didn't, then
    // the messaging popup will reopen and we don't want that.
    this._superApply(arguments);
  },

  /**
   * Notifies the component that its subtree has been made hidden programmatically after the component has
   * been created
   * @memberof! oj.ojInputDateTime
   * @instance
   * @protected 
   */
  _NotifyHidden: function()
  {
    if(this._timePicker) 
    {
      this.hideTimePicker();
    }

    // hide sets focus to the input, so we want to call super after hide. If we didn't, then
    // the messaging popup will reopen and we don't want that.
    this._superApply(arguments);
  },
  
  /**
   * 
   * @return {Object} jquery object 
   * 
   * 
   * @expose
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputDateTime
   */
  _GetMessagingLauncherElement : function ()
  {
    return !this._isInLine ? this._super() : this._timePickerElement;
  },
  
  /**
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputDateTime
   * @return {string}
   */
  _GetDefaultStyleClass : function ()
  {
    return "oj-inputdatetime";
  },
  
  /**
   * @protected
   * @override
   * @instance
   * @memberof! oj.ojInputDateTime
   */
  _GetTranslationsSectionName: function()
  {
    return "oj-ojInputDate"; 
  }
});
  
// Fragments:

/**
 * <table class="keyboard-table">
 *   <thead>
 *     <tr>
 *       <th>Target</th>
 *       <th>Gesture</th>
 *       <th>Action</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td>Input element and calendar trigger icon</td>
 *       <td><kbd>Tap</kbd></td>
 *       <td>When not inline, shows the grid and moves the focus into the expanded date grid.</td>
 *     </tr>
 *     <tr>
 *       <td>Time trigger icon</td>
 *       <td><kbd>Tap</kbd></td>
 *       <td>Shows the time picker and moves the focus into the expanded time picker</td>
 *     </tr>
 *     <tr>
 *       <td>Input element with picker open</td>
 *       <td><kbd>Tap</kbd></td>
 *       <td>Set focus to the input. If hints, title or messages exist in a notewindow, 
 *        pop up the notewindow.</td>
 *     </tr>
 *     {@ojinclude "name":"labelTouchDoc"}
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Swipe Left</kbd></td>
 *       <td>Switch to next month (or previous month on RTL page).</td>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Swipe Right</kbd></td>
 *       <td>Switch to previous month (or next month on RTL page).</td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 * @ojfragment touchDoc - Used in touch gesture section of classdesc, and standalone gesture doc
 * @memberof oj.ojInputDateTime
 */

/**
 * <table class="keyboard-table">
 *   <thead>
 *     <tr>
 *       <th>Target</th>
 *       <th>Key</th>
 *       <th>Action</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td>Input element</td>
 *       <td><kbd>DownArrow or UpArrow</kbd></td>
 *       <td>When not in inline mode, shows the calendar grid and moves the focus into the 
 *       expanded grid. When in inline mode, shows the time picker and moves the focus into the 
 *       expanded time picker</td>
 *     </tr>
 *     <tr>
 *       <td>Input element</td>
 *       <td><kbd>Shift + DownArrow or UpArrow</kbd></td>
 *       <td>Shows the time picker and moves the focus into the expanded time picker</td>
 *     </tr>
 *     <tr>
 *       <td>Input element</td>
 *       <td><kbd>Esc</kbd></td>
 *       <td>Close the grid.</tr>
 *     </tr>
 *     <tr>
 *       <td>Input Element</td>
 *       <td><kbd>Tab In</kbd></td>
 *       <td>Set focus to the input. If hints, title or messages exist in a notewindow, 
 *        pop up the notewindow.</td>
 *     </tr> 
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Enter</kbd></td>
 *       <td>Select the currently focused day</td>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>UpArrow</kbd></td>
 *       <td>Move up in the grid.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>DownArrow</kbd></td>
 *       <td>Move down in the grid.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>RightArrow</kbd></td>
 *       <td>Move right in the grid.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>LeftArrow</kbd></td>
 *       <td>Move left in the grid.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Esc</kbd></td>
 *       <td>Close the grid.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Home</kbd></td>
 *       <td>Move focus to first day of the month.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>End</kbd></td>
 *       <td>Move focus to last day of the month.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>PageUp</kbd></td>
 *       <td>Switch to previous month.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>PageDown</kbd></td>
 *       <td>Switch to next month.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Alt + PageUp</kbd></td>
 *       <td>Switch to previous year.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Alt + PageDown</kbd></td>
 *       <td>Switch to next year.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Ctrl + Alt + PageUp</kbd></td>
 *       <td>Switch to previous by stepBigMonths.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Ctrl + Alt + PageDown</kbd></td>
 *       <td>Switch to next by stepBigMonths.</tr>
 *     </tr>
 *     <tr>
 *       <td>Picker</td>
 *       <td><kbd>Ctrl + Alt + T</kbd></td>
 *       <td>Places focus on Today button if it exists.</tr>
 *     </tr>   
 *      {@ojinclude "name":"labelKeyboardDoc"} 
 *   </tbody>
 * </table>
 * 
 * @ojfragment keyboardDoc - Used in keyboard section of classdesc, and standalone gesture doc
 * @memberof oj.ojInputDateTime
 */

(function() {
var ojInputTimeMeta = {
  "properties": {
    "converter": {},
    "keyboardEdit": {
      "type": "string"
    },
    "max": {},
    "min": {},
    "pickerAttributes": {
      "type": "Object"
    },
    "placeholder": {},
    "renderMode": {
      "type": "string"
    },
    "timePicker": {
      "type": "Object"
    },
    "validators": {
      "type": "Array"
    },
    "value": {
      "type": "string",
      "writeback": true
    }
  },
  "methods": {
    "getNodeBySubId": {},
    "getSubIdByNode": {},
    "hide": {},
    "refresh": {},
    "show": {},
    "widget": {}
  },
  "extension": {
    "_hasWrapper": true,
    "_innerElement": 'input',
    "_widgetName": "ojInputTime"
  }
};
oj.Components.registerMetadata('ojInputTime', 'inputBase', ojInputTimeMeta);
oj.Components.register('oj-input-time', oj.Components.getMetadata('ojInputTime'));
})();

(function() {
var ojInputDateMeta = {
  "properties": {
    "converter": {},
    "datePicker": {
      "type": "Object"
    },
    "dayFormatter": {},
    "dayMetaData": {},
    "keyboardEdit": {
      "type": "string"
    },
    "max": {},
    "min": {},
    "pickerAttributes": {
      "type": "Object"
    },
    "placeholder": {},
    "renderMode": {
      "type": "string"
    },
    "validators": {
      "type": "Array"
    },
    "value": {
      "type": "string",
      "writeback": true
    }
  },
  "methods": {
    "getNodeBySubId": {},
    "getSubIdByNode": {},
    "hide": {},
    "refresh": {},
    "show": {}
  },
  "extension": {
    "_hasWrapper": true,
    "_innerElement": 'input',
    "_widgetName": "ojInputDate"
  }
};
oj.Components.registerMetadata('ojInputDate', 'inputBase', ojInputDateMeta);
oj.Components.register('oj-input-date', oj.Components.getMetadata('ojInputDate'));

var ojDatePickerMeta = oj.CollectionUtils.copyInto({}, oj.Components.getMetadata('ojInputDate'), undefined, true);
ojDatePickerMeta['extension']['_innerElement'] = 'div';
oj.Components.register('oj-date-picker', ojDatePickerMeta);
})();

(function() {
var ojInputDateTimeMeta = {
  "properties": {
    "converter": {},
    "max": {},
    "min": {},
    "renderMode": {
      "type": "string"
    },
    "timePicker": {
      "type": "Object"
    },
    "validators": {
      "type": "Array"
    },
    "value": {
      "type": "string",
      "writeback": true
    }
  },
  "methods": {
    "getNodeBySubId": {},
    "getSubIdByNode": {},
    "hideTimePicker": {},
    "show": {},
    "showTimePicker": {}
  },
  "extension": {
    "_hasWrapper": true,
    "_innerElement": 'input',
    "_widgetName": "ojInputDateTime"
  }
};
oj.Components.registerMetadata('ojInputDateTime', 'ojInputDate', ojInputDateTimeMeta);
oj.Components.register('oj-input-date-time', oj.Components.getMetadata('ojInputDateTime'));

var ojDateTimePickerMeta = oj.CollectionUtils.copyInto({}, oj.Components.getMetadata('ojInputDateTime'), undefined, true);
ojDateTimePickerMeta['extension']['_innerElement'] = 'div';
oj.Components.register('oj-date-time-picker', ojDateTimePickerMeta);
})();
});
