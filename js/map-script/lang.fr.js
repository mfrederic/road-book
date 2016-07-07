var lang = {
	routeDirection: {
	    Straight: 'Continuer',
	    SlightRight: 'Prendre à droite',
	    Right: 'Prendre à droite',
	    SharpRight: 'Prendre à droite',
	    TurnAround: 'Faire demi-tour',
	    SharpLeft: 'Prendre à gauche',
	    Left: 'Prendre à gauche',
	    SlightLeft: 'Prendre à gauche',
	    WaypointReached: 'Continuer',
	    Roundabout: function(wayout) { return 'Prendre la sortie ' + wayout; },
	    StartAt: 'Continuer',
	    DestinationReached: 'Vous êtes arrivé(e).',
	    EnterAgainstAllowedDirection: 'Entrer malgré l\'interdiction',
	    LeaveAgainstAllowedDirection: 'Sortir malgré l\'interdiction'
	},
	routeClass: {
		Straight: 'leaflet-routing-icon-continue',
	    SlightRight: 'leaflet-routing-icon-bear-right',
	    Right: 'leaflet-routing-icon-turn-right',
	    SharpRight: 'leaflet-routing-icon-sharp-right',
	    TurnAround: 'leaflet-routing-icon-u-turn',
	    SharpLeft: 'leaflet-routing-icon-sharp-left',
	    Left: 'leaflet-routing-icon-turn-left',
	    SlightLeft: 'leaflet-routing-icon-bear-left',
	    WaypointReached: 'leaflet-routing-icon-via',
	    Roundabout: function(wayout) { return 'leaflet-routing-icon-enter-roundabout exit-' + wayout; },
	    StartAt: 'leaflet-routing-icon-depart',
	    DestinationReached: 'leaflet-routing-icon-arrive',
	    EnterAgainstAllowedDirection: 'leaflet-routing-icon-continue',
	    LeaveAgainstAllowedDirection: 'leaflet-routing-icon-continue'
	}
};