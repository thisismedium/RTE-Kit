(function($) {

     function example1() {
	 $('#example-1').rteKit({
	     toolbar: 'bold italic underline | insert-paragraph remove-format'
	 });
     }

     function example2() {
	 $('#example-2').rteKit({
	     toolbar: 'bold italic underline | insert-paragraph remove-format'
	 });
     }

     function with_prompt(label) {
	 return $.ui.rteKit.button(function(event, rte, cmd) {
	     var value = prompt(label);
	     (value != null) && (value != '') && rte.command(cmd, value);
	 });
     }

     function menu(label, options) {

	 return $.ui.rteKit.tool({
	     make: function(rte, name) {
		 var result = $('<select><option value="">'+ label + '</option></select>');

		 $.each(options, function() {
		     result.append('<option value="' + this + '">' + this + '</option>');
		 });

		 return result.attr({
		     className: name,
		     title: $.titlecase(name),
		     tabindex: -1
		 });
	     },

	     event: 'change',

	     exec: function(event, rte, cmd) {
		 var val = this.val();
		 if (val) {
		     rte.command(cmd, val);
		     this.val('');
		 }
	     }
	 });
     }

     function example3() {
	 $('#example-3').rteKit({
	     toolbar: (
		 'font-name font-size'
		 + ' | bold italic underline insert-paragraph'
		 + ' | create-link insert-image'
		 + ' | remove-format html'
	     ),

	     tools: {
		 'create-link': with_prompt('Enter Link:'),

		 'insert-image': with_prompt('Enter Image URL:'),

		 'font-size': menu('Size', [1, 2, 3, 4, 5, 6, 7]),

		 'font-name': menu('Font', ['Arial', 'Times', 'Verdana', 'Helvetica', 'Sans']),

		 'html': $.ui.rteKit.button(function(event, rte, cmd) {
		     rte.toggleFrame();
		 })
	     }
	 });
     }

     $(function() {
	   example1();
	   example2();
	   example3();
     });

})(jQuery);