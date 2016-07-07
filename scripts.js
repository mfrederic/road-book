jQuery(document).ready(function($) {

	var motoRoadMap = {

		geocoder: null,
		directionsDisplay: null,
		directionsService: new google.maps.DirectionsService(),
		map: {
			map: null,
			options: {
				center: { lat: 46.343215, lng: 2.608344},
				zoom: 7
			},
			route: null
		},
		points: [],
		avoidHighways: false,

		initialize: function() {
			this.geocoder = new google.maps.Geocoder();
			this.map.map = new google.maps.Map(document.getElementById('map-canvas'), this.map.options);		
			this.directionsDisplay = new google.maps.DirectionsRenderer();
			this.directionsDisplay.setMap(this.map.map);

			/*if(navigator.geolocation) {
				motoRoadMap.findPosition();
			}*/
			return this;
		},

		findPosition: function() {
			navigator.geolocation.getCurrentPosition(function(position) {
				motoRoadMap.map.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
			});
			return this;
		},

		geocodePosition: function(address, jqElement) {
			this.geocoder.geocode( { 'address': address }, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					motoRoadMap.map.map.setCenter(results[0].geometry.location);
					var marker = new google.maps.Marker({
						map: motoRoadMap.map.map,
						position: results[0].geometry.location
					});
					console.log(marker);

					jqElement.find('input').val(results[0].formatted_address).attr('class', 'success');
					motoRoadMap.points[motoRoadMap.points.length] = {address: results[0].formatted_address, marker: marker};
				} else {
					jqElement.find('input').attr('class', 'error');
					console.log(status);
				}
			});
			return this;
		},

		reverseGeocodePosition: function(position) {
			var input = document.getElementById('latlng').value;
			var latlngStr = input.split(',', 2);
			var lat = parseFloat(latlngStr[0]);
			var lng = parseFloat(latlngStr[1]);
			var latlng = new google.maps.LatLng(lat, lng);
			this.geocoder.geocode({'latLng': latlng}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					if (results[1]) {
						motoRoadMap.map.map.setZoom(11);
						marker = new google.maps.Marker({
							position: latlng,
							map: motoRoadMap.map.map
						});

						motoRoadMap.points[motoRoadMap.points.length] = {address: position, marker: marker};
					} else {
						// Position introuvable
					}
				} else {
					// Position introuvable
				}
			});
			return this;
		},

		generateListPoints: function() {
			this.removeListPoints();
			$('.points .point').each(function() {
				if($(this).find('input').val() != '')
					motoRoadMap.geocodePosition($(this).find('input').val(), $(this));
			});
			return this;
		},

		removeListPoints: function() {
			for(var i=0; i<this.points.length; i++)
				this.points[i].marker.setMap(null);
			this.points = [];
			return this;
		},

		calculateRoute: function() {
			var start 	= motoRoadMap.points[0].marker.getPosition();
			var end 	= motoRoadMap.points[this.points.length-1].marker.getPosition();
			var waypts 	= [];

			for(var i=1; i<this.points.length-1; i++) {
				waypts.push({
					location: this.points[i].marker.getPosition(),
          			stopover: true
          		});
			}

			var request = {
				origin: start,
				destination: end,
				avoidHighways: this.avoidHighways,
				optimizeWaypoints: true,
				waypoints: waypts,
				travelMode: google.maps.TravelMode.DRIVING
			};

			this.directionsService.route(request, function(response, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					motoRoadMap.directionsDisplay.setDirections(response);

					console.log(response);
					var legs = response.routes[0].legs;
					var duration = 0;
					for(var i=0; i<legs.length; i++)
						duration += parseInt(legs[i].duration.value);

					motoRoadMap.map.route = {
						direction: response,
						duration: duration
					};
				}
			});
			return this;
		}
	};

	google.maps.event.addDomListener(window, 'load', motoRoadMap.initialize());

	$('.points .point input').on('change', function() {
		motoRoadMap.generateListPoints();
	});

	$('.add').on('click', function() {
		var point = $('.point.begin').clone();
		var nbCheckPoint = $('.point.checkpoint').length;

		var remover = $('<button title="supprimer ce noeud" class="remove">x</button>');
		remover.on('click', function() {
			$(this).parent('div.point').remove();
			motoRoadMap.generateListPoints();
		});

		point.removeClass('begin').addClass('checkpoint').attr('id', 'checkpoint_' + (nbCheckPoint+1)).find('input').val('').attr('class', '').attr('placeholder', 'par');
		point.find('label').text('Par :').attr('for', 'checkpoint_' + (nbCheckPoint+1)).after(remover);
		point.on('change', function() {
			motoRoadMap.generateListPoints();
		});
		if(nbCheckPoint == 0)
			$('.point.begin').after(point);
		else
			$('.point.checkpoint:last').after(point);
	});

	$('#calculate_route').click(function() {
		motoRoadMap.calculateRoute();
	});

	$('#avoid_highways').click(function() {
		motoRoadMap.avoidHighways = $(this).is(':checked');
	});


	// Animation et autres
	$('.animated-checkbox').click(function() {
		var aim = $(this).data('aim');
		if($(this).is(':checked')) {
			$(this).parents(aim).addClass('checked').find('span.icon').attr('class', 'icon icon-check-1');
		} else {
			$(this).parents(aim).removeClass('checked').find('span.icon').attr('class', 'icon icon-check-empty');
		}
	})

});