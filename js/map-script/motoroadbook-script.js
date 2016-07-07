jQuery(document).ready(function($) {

	mrMap = new MotoRoadMap('map-canvas');
	mrMap.geocodeAll($('.point input'));

	$('.point input').each(function(index, element) {
		setAllEvents($(element));
	});

	$('.add').on('click', function() {
		var nbCheckPoint = $('.point.checkpoint').length;
		$('.point.checkpoint:eq('+(nbCheckPoint-2)+')').after(createField());
		mrMap.defineUniqID($('.point input')).definePosition($('.point input')).resortForm();
		
		if($('.points div.point').length >= 2)
			$('div.remove').sortable('option', 'disabled', false);
	});

	$('#calculate_route').click(function() {
		mrMap.routing();
	});

	$('div.points').sortable({
		connectWith: 'div.remove',
		scroll: false,
		opacity: 0.5,
		create: function( event, ui ) {
			mrMap.defineUniqID($('.point input')).definePosition($('.point input'));
		},
		update: function(event, ui) {
			mrMap.resetRouteLayer();
			mrMap.setMarkerLayer();
			mrMap.defineUniqID($('.point input')).definePosition($('.point input')).resortForm();
		},
		over: function(event, ui) {
			$(this).addClass('sort-active');
		},
		out: function(event, ui) {
			$(this).removeClass('sort-active');
		}
	});

	$('div.remove').sortable({
		connectWith: 'div.points',
		disabled: ($('.points input').length <= 1) ? true : false,
		update: function(event, ui) {
			var element = $(ui.item[0]);
			var uniqId = element.find('input').attr('js-uniq-id');
			var markerId = mrMap.findMarkerByUniqId(uniqId, true);
			mrMap.removeMarkerFromList(markerId);
			mrMap.resetRouteLayer();
			mrMap.setMarkerLayer();
			mrMap.resortForm(uniqId).releaseUniqID(uniqId).setUrlFromPoint();
			mrMap.resetRouteLayer();
			mrMap.setMarkerLayer();
			mrMap.defineUniqID($('.point input')).definePosition($('.point input')).resortForm();
			element.remove();
		},
		over: function(event, ui) {
			if(($('.points div.point').length-1) < 2)
				$('div.remove').sortable('option', 'disabled', true);
			$('div.remove').addClass('sort-active');
		},
		out: function(event, ui) {
			$('div.remove').removeClass('sort-active');
		}
	});
	
});	