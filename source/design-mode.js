//// design-mode -- a jQuery UI widget for designMode
/// Ben Weaver 2009/06/22
/// @version 0.1.0

(function($) {
     var error = (window.console) ? console.error : function() {
	 var message = '';

	 for (var i = 0, limit = arguments.length; i < limit; i++) {
	     message += arguments[i];
	 }

	 alert('error: ' + message);
     };

     $.widget('ui.designMode', {
	 _init: function() {
	     var self = this, opt = this.options;
	     this._win = this.element.get(0).contentWindow;
	     opt.content && this._write(opt.content);
	     opt.autoOn && this.on();
	 },

	 // Get or set the "value" of the editable area.
	 val: function(value) {
	     return this._body().html(value);
	 },

	 // Return the current selection.
	 selection: function() {
	     return selection(this._doc);
	 },

	 // Call execCommand, optionally refocusing on the editable area.
	 command: function(name, option, refocus) {
	     this._refocusing = refocus;
	     try {
		 refocus && this._win.focus();
		 this._doc.execCommand(name, false, option);
		 refocus && this._win.focus();
	     }
	     catch(e) {
		 error('designMode.command', this, e, name, option);
	     }
	     this._refocusing = undefined;
	 },

	 // Enable designMode.
	 on: function() {
	     var self = this;

	     this._doc = undefined;

	     try {
		 var doc = this._document();
		 if (doc.designMode != null) {
		     doc.designMode = 'On';
		     this._doc = this._document(); // Don't use doc; IE needs it re-fetched.
		     this._on();
		 }
		 else {
		     var delay = this.options.enableTimeout;
		     (delay !== false) && setTimeout(function() { self.on(); }, delay);
		 }
	     }
	     catch(e) {
		 error('designMode.enable', this, e.description || e.message);
	     }
	 },

	 // Setup after designMode been enabled.
	 _on: function() {
	     var self = this;
	     function __retrigger(e) { return self._retrigger(e); }
	     $(this._doc).focus(__retrigger).blur(__retrigger);

	     if (!$.browser.msie) {
		 this.command('styleWithCss', this.options.styleWithCss);
	     }

	     this._trigger('on');
	 },

	 _document: function() {
	     var el = this.element.get(0);
	     return el.contentDocument || el.contentWindow.document;
	 },

	 _body: function() {
	     return $('body', this._doc);
	 },

	 // Re-dispatch events.
	 _retrigger: function(e) {
	     return this._refocusing ? undefined : this._trigger(e.type, e);
	 },

	 _write: function(content) {
	     try {
		 var doc = (this._doc || this._document());
		 doc.open(); doc.write(content); doc.close();
	     }
	     catch (e) {
		 error('designMode._write', this, e);
	     }
	 }

     });

     $.extend($.ui.designMode, {
	 getter: 'val selection',
	 defaults: {
	     content: '<html><head></head><body></body></html>',
	     autoOn: true,
	     enableTimeout: 500,
	     styleWithCss: true
	 }
     });

     // Return the current selection of document doc.
     function selection(doc) {
	 try {
	     if (doc.selection) { // IE
		 return doc.selection.createRange().parentElement();
	     } else { // Mozilla
		 return doc.getSelection().getRangeAt(0).commonAncestorContainer;
	     }
	 }
	 catch(e) {
	     error('selection', doc, e);
	     return false;
	 }
     }

})(jQuery);