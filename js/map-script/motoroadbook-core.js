var MotoRoadMap = function(domElement) {
	this.uniqID 			= [];
	this.geocodeServ 		= null;
	this.map 				= null;
	this.routeLayer 		= null;
	this.routeInformations 	= {};
	this.tileLayer 			= null;
	this.markersLayer 		= null;
	this.markersList 		= [];
	this.inputSelector 		= '.point input';
	this.lastValue 			= null;

	for (var i=0; i<1000; i++) {
		this.uniqID.push({
			key: uniqid('input_'),
			used: false
		});
	};

	this.map = L.map(domElement).setView([46.343215, 2.608344], 7); // Center on France
	this.geocodeServ = new L.esri.Geocoding.Services.Geocoding();
	this.markersLayer = new L.FeatureGroup();
	this.routeLayer = new L.FeatureGroup();

	L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(this.map);

	this.definePosition($(this.inputSelector));
	this.defineUniqID($(this.inputSelector));

	return this;
};

MotoRoadMap.prototype.definePosition = function(jqSelector) {
	jqSelector.each(function(index, element) {
		$(element).attr('js-position', index);
	});
	return this;
}

MotoRoadMap.prototype.defineUniqID = function(jqSelector) {
	var context = this;
	jqSelector.each(function(index, element) {
		if($(element).attr('js-uniq-id') == undefined || $(element).attr('js-uniq-id') == '') {
			var find = false;
			for(var i=0; i<context.uniqID.length && !find; i++) {
				if(!context.uniqID[i].used) {
					$(element).attr('js-uniq-id', context.uniqID[i].key);
					context.uniqID[i].used = true;
					find = true;
				}
			}
		}
	});
	return this;
}

MotoRoadMap.prototype.findMarkerByUniqId = function(uniqId, returnIndex) {
	returnIndex = (returnIndex == undefined) ? false : true;
	var find = false;
	var markerResponse = null;
	for(var i=0; i<this.markersList.length && !find; i++) {
		var current = this.markersList[i];
		if(uniqId == current.id) {
			find = true;
			markerResponse = (returnIndex) ? i : current;
		}
	}
	return markerResponse;
}

MotoRoadMap.prototype.geocode = function(jqElement, callback) {
	var textAddress 		= jqElement.val();
	var uniqId 				= jqElement.attr('js-uniq-id');
	var markerExistsIndex 	= this.findMarkerByUniqId(uniqId, true);

	if(textAddress != '') {
		if(callback == undefined) {
			callback = function(context, error, result, response, jqElement) {
				if(result.results.length > 0) {
					jqElement.val(result.results[0].text).attr('class', 'success');
					var marker = {
							id: uniqId,
							position: jqElement.attr('js-position'),
							marker: new L.marker({
										lat: result.results[0].latlng.lat, lng: result.results[0].latlng.lng
									}, { title: result.results[0].text })
					};

					if(markerExistsIndex == null)
						context.markersList.push(marker);
					else
						context.replaceMarkerFromList(markerExistsIndex, marker);
					context.setUrlFromPoint();
				} else {
					jqElement.attr('class', 'error');
				}
			}
		}

		var context = this;
		this.geocodeServ.geocode().text(textAddress).run(function(error, result, response) {
			callback(context, error, result, response, jqElement);
			context.setMarkerLayer();
		});
	} else {
		jqElement.attr('class', '');
		this.removeMarkerFromList(markerExistsIndex);
		this.resetRouteLayer();
		this.setMarkerLayer();
		this.resortForm(uniqId).setUrlFromPoint();
	}
	return this;
}

MotoRoadMap.prototype.geocodeAll = function(jqSelector, callback) {
	var context = this;
	jqSelector.each(function(index, element) {
		if(callback == undefined)
			context.geocode($(element));
		else
			context.geocode($(element), callback);
	});
	return this;
}

MotoRoadMap.prototype.reDefinePosition = function() {
	this.definePosition($(this.inputSelector));
	return this;
}

MotoRoadMap.prototype.releaseUniqID = function(uniqId) {
	var find = false;
	for(var i=0; i<this.uniqID.length && !find; i++) {
		if(this.uniqID[i].key == uniqId) {
			this.uniqID[i].used = false;
			find = true;
		}
	}
	return this;
}

MotoRoadMap.prototype.removeMarkerFromList = function(index) {
	if(index == null || index == undefined)
		return false;
	return this.markersList.splice(index, 1);
}

MotoRoadMap.prototype.replaceMarkerFromList = function(index, marker) {
	if(index == null || index == undefined)
		return false;
	this.markersList[index] = marker;
	return this;
}

MotoRoadMap.prototype.resetAll = function() {
	this.resetMap();

	this.routeLayer 		= new L.FeatureGroup();
	this.markersLayer 		= new L.FeatureGroup();
	this.routeInformations 	= {};
	this.markersList 		= [];

	return this;
}

MotoRoadMap.prototype.resetMap = function() {
	this.resetRouteLayer();
	this.resetMarkersLayer();
	return this;
}

MotoRoadMap.prototype.resetMarkersLayer = function() {
	if(this.map.hasLayer(this.markersLayer))
		this.map.removeLayer(this.markersLayer);
	this.markersLayer = new L.FeatureGroup();
}

MotoRoadMap.prototype.resetRouteLayer = function() {
	if(this.map.hasLayer(this.routeLayer))
		this.map.removeLayer(this.routeLayer);
	this.routeLayer = new L.FeatureGroup();
}

MotoRoadMap.prototype.resortForm = function(id_to_delete) {
	var markersTemporary = [];
	for (var i=0; i<this.markersList.length; i++) {
		var current_id = this.markersList[i].id;
		if(current_id != id_to_delete || id_to_delete == undefined) {
			var find = false;
			for(var j=0; j<$('.point input').length && !find; j++) {
				var current_elt = $('.point input:eq(' + j + ')');
				if(current_elt.attr('js-uniq-id') == current_id) {
					this.markersList[i].position = current_elt.attr('js-position');
					find = true;
					markersTemporary[markersTemporary.length] = this.markersList[i];
				}
			}
		}
	};
	this.markersList = markersTemporary;
	return this;
}

MotoRoadMap.prototype.routing = function() {
	var context = this;
	context.resetMap().resortForm();

	var latLngsTemp = [];
	for(var i=0; i<context.markersList.length; i++) {
		if(context.markersList[i] != undefined && context.markersList[i] != null) {
			var current = context.markersList[i];
			latLngsTemp[current.position] = current.marker.getLatLng();
		}
	}

	var latLngs = [];
	for(var i=0; i<latLngsTemp.length; i++) {
		if(latLngsTemp[i] != undefined)
			latLngs[latLngs.length] = latLngsTemp[i];
	}

	this.routeLayer.addLayer(
		new L.Routing.control({
		    waypoints: latLngs,
		    lineOptions: {
		    	addWaypoints: false
		    },
		    routeWhileDragging: false,
			draggableWaypoints: false,
	        show: false,
	        addWaypoints: false,
		    routeLine: function(route) {
		        var line = L.Routing.line(route, {
	                addWaypoints: false,
	                extendToWaypoints: false,
	                routeWhileDragging: false,
	                autoRoute: true,
	                useZoomParameter: false,
	                draggableWaypoints: false,
	                addWaypoints: false
	            });

		    	context.setRouteInformations(route);
		        return line;
		    },
		    routingerror: function(error) {
		    	console.log(error);
		    }
		})
	);

	context.map.addLayer(context.routeLayer);
}

MotoRoadMap.prototype.setMarkerLayer = function() {
	this.markersLayer.clearLayers();
	for(var i=0; i<this.markersList.length; i++)
		this.markersLayer.addLayer(this.markersList[i].marker);
	this.map.addLayer(this.markersLayer);
	return this;
}

MotoRoadMap.prototype.setRouteInformations = function(route) {
	this.routeInformations = {
		name: route.name,
		distance: route.summary.totalDistance,
		duration: route.summary.totalTime,
		instructions: route.instructions,

		getHumanizeDistance: function() {
			return getBestDistanceUnit(this.distance, 2);
		},
		getHumanizeDuration: function() {
			var durationObj = secondsToTime(this.duration);
			return durationObj.hour +'h '+ durationObj.minute +'m';
		}
	};

	$('#route_informations .duration span').text(this.routeInformations.getHumanizeDuration());
	$('#route_informations .distance span').text(this.routeInformations.getHumanizeDistance());
	$('#route_informations').stop().fadeIn(200);

	this.showRouteInstructions();
};

MotoRoadMap.prototype.setUrlFromPoint = function() {
	var currentState = History.getState();
	var waypointsName = [];
	var waypointsPos = [];

	for(var i=0; i<this.markersList.length; i++) {
		var current = this.markersList[i];
		waypointsName[current.position] = current.marker.options.title;
		waypointsPos[current.position] = current.marker.getLatLng().lat + ',' + current.marker.getLatLng().lng;
	}

	var params = '?w=' + waypointsName.join('!') + '&m=' + waypointsPos.join('!');

	History.pushState({w: waypointsName, m:waypointsPos},
		$(document).find("title").text(),
		params);
}

MotoRoadMap.prototype.showRouteInstructions = function() {
	constructInstructions(this.routeInformations.instructions);
	$('#route_instructions').stop().fadeIn(200);
}


MotoRoadMap.prototype.suggest = function(jqElement, callback) {
	if(callback == undefined) {
		callback = function(context, error, response, jqElement) {
			if(response == null || error != null || context.lastValue == jqElement.val())
				return false;

			this.lastValue = jqElement.val();

			if(response.suggestions.length > 0 && jqElement.val().length > 3) {
				$('.suggestions').attr('id', jqElement.attr('list')).html('');

				$option = $('<option />');

				var addresses = [];
				for(var i=0; i<response.suggestions.length; i++) {
					var current = response.suggestions[i];
					var address = current.text.replace(/\s(\([A-Z0-9\s]+\))$/gi, '');

					var find = _.findIndex(addresses, function(chr) { return chr == address; });
					if(find == -1) {
						addresses[addresses.length] = address;

						var sugg = $option.clone();
						sugg.val(address).attr('magic-key', current.magicKey);
						$('.suggestions').append(sugg);
					}
				}

				if($('.suggestions').is(':hidden'))
					$('.suggestions').show();
			}
		}
	}

	var context = this;
	this.geocodeServ.suggest().text(jqElement.val()).within(this.map.getBounds()).run(function(error, response) {
		callback(context, error, response, jqElement);
	});
	return this;
}