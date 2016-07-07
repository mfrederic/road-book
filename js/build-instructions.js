function constructInstructions(instructions) {
	var wrap = $('<table />');
	$('#route_instructions').html('');

	for(var i=0; i<instructions.length; i++) {
		console.log(instructions[i]);
		wrap.append(constructInstruction(instructions[i]));
	}
	$('#route_instructions').append(wrap);
}

function constructInstruction(instruction) {
	var info = returnCorrectInstInformations(instruction);

	var line = $('<tr />');
	var cell = $('<td />');

	var icon = $('<span class="leaflet-routing-icon '+info.cssClass+'" />');

	line.append(cell.clone().attr('width', '10%').append(icon));
	line.append(cell.clone().attr('width', '80%').append($('<p />').html(info.instruction)));
	line.append(cell.clone().attr('width', '10%').append($('<p />').text(info.distance)));

	if(instruction.type == 'WaypointReached' || instruction.type == 'StartAt' || instruction.type == 'DestinationReached')
		line.addClass('checkpoint');

	return line;
}

function returnDirection(type) {
	if(type.match(/right/gim) != null)
		return 'Prendre à droite';
	if(type.match(/left/gim) != null)
		return 'Prendre à gauche';
	if(type.match(/straight/gim) != null)
		return 'Continuer tout droit';
	return 'Continuer';
}

function returnInstruction(inst) {
	var distance = getBestDistanceUnit(inst.distance, 2);
	if(inst.type == 'DestinationReached')
		return 'Vous êtez arrivé(e).';

	if(inst.type == 'Roundabout') {
		if(inst.road == '')
			return 'Prendre la sortie n°<b>'+inst.exit+'</b>.';
		else
			return 'Prendre la sortie n°<b>'+inst.exit+'</b> vers : '+inst.road+'.';
	}

	if(inst.road == '') {
		return returnDirection(inst.type)+'.';
	} else {
		return returnDirection(inst.type)+' sur : '+inst.road+'.';
	}
}

function returnCorrectInstInformations(inst) {
	response = {};
	switch(inst.type) {
	    case 'Straight': response.cssClass = "leaflet-routing-icon-continue";
	    	break;
	    case 'SlightRight': response.cssClass = "leaflet-routing-icon-sharp-right";
	    	break;
	    case 'Right': response.cssClass = "leaflet-routing-icon-turn-right";
	    	break;
	    case 'SharpRight': response.cssClass = "leaflet-routing-icon-bear-right";
	    	break;
	    case 'TurnAround': response.cssClass = "leaflet-routing-icon-u-turn";
	    	break;
	    case 'SharpLeft': response.cssClass = "leaflet-routing-icon-bear-left";
	    	break;
	    case 'Left': response.cssClass = "leaflet-routing-icon-turn-left";
	    	break;
	    case 'SlightLeft': response.cssClass = "leaflet-routing-icon-sharp-left";
	    	break;
	    case 'WaypointReached': response.cssClass = "leaflet-routing-icon-via";
	    	break;
	    case 'Roundabout': response.cssClass = "leaflet-routing-icon-enter-roundabout";
	    	break;
	    case 'StartAt': response.cssClass = "leaflet-routing-icon-depart";
	    	break;
	    case 'DestinationReached': response.cssClass = "leaflet-routing-icon-arrive";
	    	break;
	    case 'EnterAgainstAllowedDirection': response.cssClass = "leaflet-routing-icon-continue";
	    	break;
	    case 'LeaveAgainstAllowedDirection': response.cssClass = "leaflet-routing-icon-continue";
	    	break;
	}
	response.instruction = returnInstruction(inst);
	response.distance = getBestDistanceUnit(inst.distance, 2);

	return response;
}