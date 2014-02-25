$(document).ready(function() {

  // Place JavaScript code here...

	$("#timeForm div").click(function(e){
		e.preventDefault();
		var time = $(this).text();
		$("#time").val(time);
		$("#timeForm").submit();
	});
	
	$(".datetime-radio").click(function(e){
		e.preventDefault();
		$("#selected").attr("id","");
		$(this).attr("id", "selected");
	})
	
	$("#timeSelect .submit").click(function(e){
		e.preventDefault();
		var selected = $("#selected .hiddenTime").val();
		$('#timeSelect .selected').val(selected);
		$('#timeSelect').submit();
	});
	
});
