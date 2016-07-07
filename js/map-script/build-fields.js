function createField() {
	var point = $('.point:first').clone();
	var nbCheckPoint = $('.point.checkpoint').length;

	point.find('label').attr('for', 'checkpoint_' + (nbCheckPoint+1));
	point.find('input').val('').attr('id', 'checkpoint_' + (nbCheckPoint+1)).attr('placeholder', 'par').attr('js-uniq-id', '').attr('class', '');
	setAllEvents(point.find('input'));

	return point;
}

function setAllEvents(jqElement) {
	jqElement.on('change', function() {
		var timeout = window.setTimeout(function() {
			if($('.suggestions').is(':visible'))
				$('.suggestions').stop().fadeOut(200).html('');
			mrMap.resetRouteLayer();
			mrMap.geocode($(jqElement));
		}, 500);
	}).on('keydown', function(event) {
		var keyCode = event.keyCode;
		if((keyCode < 37 || keyCode > 40) && keyCode != 13)
			mrMap.suggest($(jqElement));
	});
}