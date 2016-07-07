function constructInstructions(instructions) {
	var wrap = $('<table />');
	$('#route_instructions').html('');

	instructions = cleanListInstructions(instructions);

	for(var i=0; i<instructions.length; i++) 
		wrap.append(constructInstruction(instructions[i]));
	$('#route_instructions').append(wrap);
}

function cleanListInstructions(instructions) {
	var listeInstructions = [];
	for(var i=0; i<instructions.length; i++) {
		var currentI = instructions[i];
		var stillStraight = true;

		if(currentI.road != '') {
			for(var j=i+1; j<instructions.length && stillStraight; j++) {
				var currentJ = instructions[j];

				if(currentJ.type == 'Straight' && currentJ.road == '') 
					currentI.distance += currentJ.distance;
				else
					stillStraight = false;
			}
			listeInstructions[listeInstructions.length] = currentI;
		}
	}

	return listeInstructions;
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

function returnInstruction(inst) {
	var distance = getBestDistanceUnit(inst.distance, 2);

	if(inst.road == '') {
		if(inst.type == 'Roundabout')
			return lang.routeDirection.Roundabout(inst.exit) + '.';
		return lang.routeDirection[inst.type] + '.';
	} else {
		if(inst.type == 'Roundabout')
			return lang.routeDirection.Roundabout(inst.exit) + ' sur : ' + inst.road + '.';
		return lang.routeDirection[inst.type] + ' sur : ' + inst.road + '.';
	}
}

function returnCorrectInstInformations(inst) {
	response = {};
	response.cssClass = (inst.type == 'Roundabout') ?
						lang.routeClass.Roundabout(inst.exit) :
						lang.routeClass[inst.type];
	response.instruction = returnInstruction(inst);
	response.distance = getBestDistanceUnit(inst.distance, 2);
	return response;
}