//// text -- text utilities
/// Ben Weaver 2009/06/22
/// @version 0.1.0

(function($) {

     $.extend($, {
	 camelcase: function(name) {
	     return $.hyphenate(name).replace(/\-([a-z])/g, camel);
	 },

	 titlecase: function(name) {
	     return $.hyphenate(name).replace(/^([a-z])|\-([a-z])/g, title);
	 },

	 hyphenate: function(name) {
	     return name
		 .replace(/([a-z])([A-Z]\w*)/g, '\\1-\\2')
		 .replace(/[^\w+]/, '-')
		 .replace(/^[^\w+]|[^\w+]$/, '')
		 .toLowerCase();
	 }
     });

     function camel(match, first) {
	 return first.toUpperCase();
     }

     function title(match, start, first) {
	 return start ? start.toUpperCase() : (' ' + first.toUpperCase());
     }

})(jQuery);