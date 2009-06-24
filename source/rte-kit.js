//// rte-kit -- designMode in a textarea/iframe with a toolbar.
/// Ben Weaver 6/18/2008
/// @version 0.1.0

(function($) {
     var error = (window.console) ? console.error : function() {
	 alert('error: ' + arguments.toString());
     };

     $.widget('ui.rteKit', {
	 _init: function() {
	     this.widgetBaseClass = this.widgetBaseClass.toLowerCase();

	     // These classes are frequently used.
	     this._frameClass = this._class('frame');
	     this._inputClass = this._class('input');
 	     this._toolClass = this._class('tool');
	     this._toolSeparatorClass = this._class('tool-sep');

	     create_markup(this);
	     initialize_widget(this);
	 },

	 // Call execCommand.
	 command: function(name, option) {
	     this._frame.designMode('command', name, option, true);
	 },

	 // Return the current selection.
	 selection: function() {
	     return this._frame.designMode('selection');
	 },

	 // Write the value of the textarea and into the iframe.
	 writeToFrame: function() {
	     this._frame.designMode('val', this._input.val());
	 },

	 // Read the value of the iframe into the textarea.
	 readFromFrame: function() {
	     this._input.val(this._frame.designMode('val'));
	 },

	 // Return true if the iframe is active; false if the textarea is active.
	 frameActive: function() {
	     return this._container.hasClass(this._frameClass);
	 },

	 // Activate the textarea; deactivate the iframe.
	 showInput: function() {
	     this.readFromFrame();
	     this._container.addClass(this._inputClass).removeClass(this._frameClass);
	     this._trigger('showInput');
	 },

	 // Activate the iframe; deactivate the textarea.
	 showFrame: function() {
	     this.writeToFrame();
	     this._container.addClass(this._frameClass).removeClass(this._inputClass);
	     this._trigger('showFrame');
	 },

	 // Toggle between showInput and showFrame.
	 toggleFrame: function() {
	     this[this.frameActive() ? 'showInput' : 'showFrame']();
	 },

	 _focus: function(e) {
	     // Careful here; focus is triggered twice for some reason.
	     this._container.addClass('ui-state-focus');
	 },

	 _blur: function(e) {
	     this._container.removeClass('ui-state-focus');
	 },

	 _submit: function(e) {
	     this.frameActive() && this.readFromFrame();
	 },

	 _class: function(name) {
	     return name ? this.widgetBaseClass + '-' + name : this.widgetBaseClass;
	 },

	 // Find a prototype for tool `name'.
	 _toolPrototype: function(name) {
	     return this._tools[name] || this._tools['__default__'] || this.__default__;
	 },

	 // The default tool prototype.
	 __default__: {
	     make: function(rte, name, cmd, exec) {
		 return $('<a href="#"/>')
		     .attr({
			 className: name,
			 title: $.titlecase(name),
			 tabindex: -1
		     }).html('<span class="icon">' + name + '</span>');
	     },

	     event: 'click',

	     exec: function(event, rte, cmd) {
		 rte.command(cmd);
	     }
	 }

     });

     $.extend($.ui.rteKit, {
	 getter: 'selection frameActive',

	 defaults: {
	     link: null,
	     style: 'html, body { margin: 0; padding: 0; }',
	     styleWithCss: false,
	     toolbar: '',
	     tools: {}
	 },

	 /// Class Methods

	 button: function(exec) {
	     return this.tool({ exec: exec });
	 },

	 tool: function(proto) {
	     return $.extend({}, this.prototype.__default__, proto);
	 }

     });

     /// Implementation Details

     function create_markup(rte) {
	 var el = rte.element,
	     opt = rte.options,
	     cls = rte._class(),
	     frame, container, toolbar,
	     toolbar_cls = rte._class('toolbar');

	 container = rte._container = el.parents('.' + cls);
	 if (container.length == 0) {
	     container = el
		 .wrap('<div><div class="ui-widget-content"/></div>')
		 .parent().parent()
		 .addClass(cls);
	 }
	 container.addClass('ui-input').addClass(rte._frameClass);

	 rte._input = el;
	 rte._form = el.parents('form:first');

	 rte._tools = rte.options.tools;
	 toolbar = rte._toolbar = rte._container.find('.' + toolbar_cls);
	 if (toolbar.length == 0) {
	     toolbar = rte._toolbar = $('<div/>')
		 .addClass(toolbar_cls)
		 .prependTo(container);
	 }
	 make_toolbars(rte, toolbar, opt.toolbar);

	 rte._frame = frame = container.find('iframe');
	 if (frame.length == 0) {
	     rte._frame = $('<iframe border="0" frameborder="0" margin="0" padding="0" />')
		 .insertBefore(el);
	 }

	 // Make the height of the textarea match the height of the
	 // frame.  Using "height: 100%;" in css is preferable, but IE
	 // won't process "height: 100%" in strict mode.
	 el.css('height', rte._frame.height());
     }

     function initialize_widget(rte) {
	 function __submit(e) { return rte._submit(e); }
	 function __focus(e) { return rte._focus(e); }
	 function __blur(e) { return rte._blur(e); }

	 rte._frame.designMode({
	     focus: __focus,
	     blur: __blur,
	     content: make_frame_content(rte),
	     styleWithCss: rte.options.styleWithCss
	 });

	 rte._form.submit(__submit)
	     .find('button,input[type=submit]').click(__submit);
     };

     // Create initial iframe content.
     function make_frame_content(rte) {
	 var opt = rte.options,
	     hd,
	     bd = rte._input.val();

	 if (opt.link) {
	     hd = ('<link type="text/css" rel="stylesheet" href="'+ opt.link + '" />');
	 }
	 else if (opt.style) {
	     hd = ('<style type="text/css">' + opt.style + '</style>');
	 }

	 bd = $.trim(bd) || '';
	 return ('<html><head>' + hd + '</head><body class="frame">' + bd + '</body></html>');
     }

     // Create the toolbars.
     function make_toolbars(rte, container, bars) {

	 // an array indicates multiple bars
	 if ($.isArray(bars)) {
	     $.each(bars, function() {
		 container.append(toolbar(rte, this));
	     });
	 }
	 else {
	     container.html(toolbar(rte, bars));
	 }

     }

     // Make a single toolbar; tools is a space-separated string
     // of command names.  A pipe indicates a separator.  For
     // example: 'bold italic underline | undo redo'
     function toolbar(rte, tools) {
	 var result = $('<ul/>').addClass(rte.widgetBaseClass + '-tools');

	 tools && $.each(tools.split(/\s+/), function() {
	     this && result.append(tool(rte, this));
	 });

	 return result;
     }

     // Make a single tool for command `name'.  The tool is
     // described by a prototype.  See `__tool' below.
     function tool(rte, name) {
	 if (name == '|') return $('<li />').addClass(rte._toolSeparatorClass);

	 var proto = rte._toolPrototype(name),
	     result = $('<li />').addClass(rte._toolClass),
	     cmd = $.camelcase(name),
	     tool;

	 function exec(event) {
	     try {
		 proto.exec.call(tool, event, rte, cmd);
	     }
	     catch(e) {
		 error('tool', name, e, tool, self);
	     }
	     return false;
	 }

	 tool = proto.make(rte, name, cmd, exec);
	 proto.event && tool[proto.event](exec);
	 return result.html(tool);
     }

})(jQuery);
