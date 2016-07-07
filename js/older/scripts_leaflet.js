jQuery(document).ready(function($) {

	var DEBUG = true;

	var motoRoadMap = {
		uniqID: [],
		geocodeServ: null,
		map: null,
		routeLayer: null,
		routeInformations: null,
		tileLayer: null,
		markers: null,
		markersTemp: [],

		initialize: function() {
			if(DEBUG)
				console.log('initialize');

			for (var i=0; i<1000; i++) {
				this.uniqID.push({
					key: uniqid('input_'),
					used: false
				});
			};

			this.map = L.map('map-canvas').setView([46.343215, 2.608344], 7);
			this.geocodeServ = new L.esri.Geocoding.Services.Geocoding();
			this.markers = new L.FeatureGroup();
			this.routeLayer = new L.FeatureGroup();
			this.routeInformations = {};

			L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}).addTo(this.map);

			this.geocodeAll();
		},

		removeMarkersFromMap: function() {
			if(DEBUG)
				console.log('removeMarkersFromMap');

			if(this.map.addLayer(this.markers))
				this.map.removeLayer(this.markers);
		},

		removeMarkers: function() {
			if(DEBUG)
				console.log('removeMarkers');

			this.removeRouteFromMap();
			this.markers.clearLayers();
			this.markers = new L.FeatureGroup();
			this.markersTemp = [];
		},

		removeRouteFromMap: function() {
			if(DEBUG)
				console.log('removeRouteFromMap');

			if(this.map.hasLayer(this.routeLayer))
				this.map.removeLayer(this.routeLayer);
			this.routeLayer = new L.FeatureGroup();
		},

		addMarkersOnLayer: function() {
			if(DEBUG)
				console.log('addMarkersOnLayer');

			this.markers.clearLayers();
			this.resortFrom();
			this.markers = new L.FeatureGroup();
			for (var i=0; i<this.markersTemp.length; i++)
				this.markers.addLayer(this.markersTemp[i].marker);
		},

		showMarkersOnMap: function() {
			if(DEBUG)
				console.log('showMarkersOnMap');

			$('#route_instructions').html('').stop().fadeOut(200);
			$('#route_informations').stop().fadeOut(200);
			this.removeRouteFromMap();
			this.addMarkersOnLayer();
			this.map.addLayer(this.markers);
		},

		suggest: function(jqElement) {
			if(DEBUG)
				console.log('suggest');

			this.geocodeServ.suggest().text(jqElement.val()).within(this.map.getBounds()).run(function(error, response) {
				if(response == null || error != null)
					return false;

				if(response.suggestions.length > 0 && jqElement.val().length > 3) {
					$link = $('<a />');
					$('.suggestions').html('').show().css({
						top: (jqElement.position().top + jqElement.outerHeight()),
						left: jqElement.position().left
					});

					for(var i=0; i<response.suggestions.length; i++) {
						var current = response.suggestions[i];
						var address = current.text.replace(/\s(\([A-Z0-9\s]+\))$/gi, '');

						var sugg = $link.clone();
						sugg.addClass('animated').text(address).attr('suggestion', address).on('click', function() {
								jqElement.val($(this).attr('suggestion'));
								$('.suggestions').html('').hide(0);
							});
						$('.suggestions').append(sugg);
					}
				}
			});
		},

		resortFrom: function(id_to_delete) {
			if(DEBUG)
				console.log('resortFrom');

			var markersTemporary = [];
			for (var i=0; i<this.markersTemp.length; i++) {
				var current_id = this.markersTemp[i].id;
				if(current_id != id_to_delete || id_to_delete == undefined) {
					var find = false;
					for(var j=0; j<$('.point input').length && !find; j++) {
						var current_elt = $('.point input:eq(' + j + ')');
						if(current_elt.attr('js-uniq-id') == current_id) {
							this.markersTemp[i].position = current_elt.attr('js-position');
							find = true;
							markersTemporary[markersTemporary.length] = this.markersTemp[i];
						}
					}
				}
			};
			this.markersTemp = markersTemporary;
		},

		findMarkerByUniqId: function(uniqId, remove) {
			if(DEBUG)
				console.log('findMarkerByUniqId');

			for (var i=0; i<this.markersTemp.length; i++) {
				var current_id = this.markersTemp[i].id;
				var find = false;

				for(var j=0; j<$('.point input').length && !find; j++) {
					var current_elt = $('.point input:eq(' + j + ')');

					if(current_elt.attr('js-uniq-id') == current_id) {
						var current = this.markersTemp[i];
						if(remove == true)
							this.markersTemp.slice(i, 1);
						return current;
					}
				}
			};

			return null;
		},

		geocodeAll: function() {
			if(DEBUG)
				console.log('geocodeAll');

			$('.point').each(function(index, element) {
				motoRoadMap.geocode($(this).find('input'), index);
			});

			this.showMarkersOnMap();
		},

		geocode: function(jqElement) {
			if(DEBUG)
				console.log('geocode');

			var textAddress = jqElement.val();
			if(textAddress != '') {
				motoRoadMap.geocodeServ.geocode().text(textAddress).run(function(error, result, response) {
					if(result.results.length > 0) {
						jqElement.val(result.results[0].text).attr('class', 'success');
						var marker = new L.marker({
								lat: result.results[0].latlng.lat, lng: result.results[0].latlng.lng
							}, { title: result.results[0].text });
						motoRoadMap.findMarkerByUniqId(jqElement.attr('js-uniq-id'), true)
						motoRoadMap.markersTemp.push({
							id: jqElement.attr('js-uniq-id'),
							position: jqElement.attr('js-position'),
							marker: marker
						});
					} else {
						jqElement.attr('class', 'error');
					}
				});
			}
		},

		routing: function() {
			if(DEBUG)
				console.log('routing');

			this.removeRouteFromMap();

			var latLngs = [];
			for(var i=0; i<this.markersTemp.length; i++) {
				if(this.markersTemp[i] != undefined) {
					var current = this.markersTemp[i];
					latLngs[current.position] = current.marker.getLatLng();
				}
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

				    	motoRoadMap.setRouteInformations(route);
				        return line;
				    }
				})
			);

			this.removeMarkersFromMap();
			this.map.addLayer(this.routeLayer);
		},

		setRouteInformations: function(route) {
			if(DEBUG)
				console.log('setRouteInformations');

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
		},

		showRouteInstructions: function() {
			if(DEBUG)
				console.log('showRouteInstructions');

			constructInstructions(this.routeInformations.instructions);
			$('#route_instructions').stop().fadeIn(200);
		}
	};

	/**
	 *	Initialization du système
	 */
	motoRoadMap.initialize();

	function defineUniqID() {
		$('.point input').each(function(index, element) {
			if($(element).attr('js-uniq-id') == undefined || $(element).attr('js-uniq-id') == '') {
				var find = false;
				for(var i=0; i<motoRoadMap.uniqID.length && !find; i++) {
					if(!motoRoadMap.uniqID[i].used) {
						$(element).attr('js-uniq-id', motoRoadMap.uniqID[i].key);
						motoRoadMap.uniqID[i].used = true;
						find = true;
					}
				}
			}
		});
	}

	/**
	 *	Definie la position de tous les inputs (waypoints)
	 */
	function defineAllInputPosition() {
		$('.point input').each(function(index, element) {
			defineInputPosition($(element), index);
		});
	}

	/**
	 *	Definie la position d'un input (waypoint)
	 */
	function defineInputPosition(element, position) {
		element.attr('js-position', position);
	}

	/**
	 *	Méthode d'attache d'évenements au input de positions
	 */
	function setEventOnInput(element) {
		element.on('change', function() {
			var timeout = window.setTimeout(function() {
				if($('.suggestions').is(':visible'))
					$('.suggestions').stop().fadeOut(200).html('');
				motoRoadMap.geocode($(element), $(element).attr('js-position'));
				motoRoadMap.showMarkersOnMap();
			}, 500);
		}).on('keydown', function() {
			motoRoadMap.suggest($(element));
		}).on('focusout', function() {
			setTimeout(function() {
				if($('.suggestions').is(':visible'))
					$('.suggestions').stop().fadeOut(200).html('');
			}, 500);
		});
	}



	$('.point input').each(function(index, element) {
		setEventOnInput($(element));
	});

	$('.add').on('click', function() {
		var point = $('.point:first').clone();
		var nbCheckPoint = $('.point.checkpoint').length;

		var remover = $('<button title="supprimer ce noeud" class="remove">x</button>');
		remover.on('click', function() {
			$(this).parent('div.point').remove();
			defineAllInputPosition();
			motoRoadMap.resortFrom($(this).parent('div.point').find('input').attr('js-uniq-id'));
			motoRoadMap.showMarkersOnMap();
		});

		point.find('label').attr('for', 'checkpoint_' + (nbCheckPoint+1)).after(remover);
		point.find('input').val('').attr('id', 'checkpoint_' + (nbCheckPoint+1)).attr('placeholder', 'par').attr('js-uniq-id', '');
		setEventOnInput(point.find('input'));

		$('.point.checkpoint:eq('+(nbCheckPoint-2)+')').after(point);
		defineAllInputPosition();
		motoRoadMap.resortFrom();
		defineUniqID();
	});

	$('#calculate_route').click(function() {
		motoRoadMap.routing();
	});

	/**
	 *	On définie la liste de waypoints comme triable (sortable)
	 */
	$('.points').sortable({
		create: function( event, ui ) {
			defineAllInputPosition();
			defineUniqID();
		},
		update: function(event, ui) {
			defineAllInputPosition();
			motoRoadMap.showMarkersOnMap();
		}
	});

	$('#options').remove();
});