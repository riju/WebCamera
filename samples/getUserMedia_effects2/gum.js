'use strict';

function startUserMedia(event, button, table) {
	button ||= event.target;
	//        button td         tr         tbody      table
	table ||= button.parentNode.parentNode.parentNode.parentNode;
	for (const button of document.querySelectorAll('table button.stopUserMedia'))
		button.click();
	const constraints = {};
	for (const input of table.querySelectorAll('input, select')) {
		if (input.disabled)
			continue;
		const {kind, indexText, name} = parseConstraintName(input);
		if (!kind || indexText)
			continue;
		if (!name) {
			if (!input.checked)
				constraints[kind] = false;
			continue;
		}
		if (constraints[kind] === false)
			continue;
		if (!constraints[kind])
			constraints[kind] = {};
		switch (input.type) {
		case 'checkbox':
			constraints[kind][name] = input.checked;
			break;
		case 'radio':
			if (input.checked && input.value)
				constraints[kind][name] = input.value;
			break;
		case 'range':
			constraints[kind][name] = +input.value;
			break;
		case 'select-one':
		case 'text':
			if (input.value)
				constraints[kind][name] = input.value;
			break;
		default:
			console.log(input);
		}
	}
	startUserMediaWithConstraints(event, button, table, constraints)
	.catch(error => alert(error));
	return false;
}

async function startUserMediaWithConstraints(event, button, table, constraints) {
	button ||= event.target;
	//        button td         tr         tbody      table
	table ||= button.parentNode.parentNode.parentNode.parentNode;
	console.log(`navigator.mediaDevices.getUserMedia(${JSON.stringify(constraints, null, 2)})`);
	const mediaSource = await navigator.mediaDevices.getUserMedia(constraints);
	await updateDeviceLists();
	stopUserMedia(event, button, table);
	table.mediaSource = mediaSource;
	const video =
		table.parentNode.querySelector('video') ||
		document.querySelector('video');
	video.onloadedmetadata = event => video.play();
	video.srcObject = mediaSource;
	updateConstraints(table, mediaSource);
	table.onchange = async event => {
		const {kind, indexText} = parseConstraintName(event.target);
		if (kind) {
			if (indexText) {
				await applyConstraint(event);
				table.dispatchEvent(new Event('appliedConstraint', {bubbles: true}));
			}
			else {
				stopUserMedia(event, undefined, table);
				setTimeout(function () {
					startUserMedia(event, undefined, table);
				}, 500);
			}
		}
	};
	table.dispatchEvent(new Event('startedUserMedia', {bubbles: true}));
}

function stopUserMedia(event, button, table) {
	button ||= event.target;
	//        button td         tr         tbody      table
	table ||= button.parentNode.parentNode.parentNode.parentNode;
	if (table.mediaSource)
		table.mediaSource.getTracks().forEach(track => track.stop());
	delete table.mediaSource;
	delete table.mediaSourceTracks;
	table.dispatchEvent(new Event('stoppedUserMedia', {bubbles: true}));
	return false;
}
