'use strict';

async function applyConstraint(event, input, table) {
	input ||= event.target;
	//        *     label      td         tr         tbody      table
	table ||= input.parentNode.parentNode.parentNode.parentNode.parentNode;
	const {kind, index, name} = parseConstraintName(input);
	if (!kind || !name || index >= ((table.mediaSourceTracks || {})[kind] || []).length)
		return;
	let {settings, track} = table.mediaSourceTracks[kind][index], value;
	if (input.type == 'checkbox')
		value = input.checked;
	else if (input.type == 'range' || typeof settings[name] == 'number')
		value = +input.value;
	else
		value = input.value
	if (value === '')
		return;
	const constraints = {
		[name]:		value,
		advanced:	[{[name]: value}]
	};
	console.log(`track.applyConstraints(${JSON.stringify(constraints, null, 2)})`);
	try {
		await track.applyConstraints(constraints);
	}
	catch (error) {
		console.log(error);
	}
	table.mediaSourceTracks[kind][index].settings = settings = track.getSettings();
	const setting = settings[name];
	switch (input.type) {
	case 'checkbox':
		input.checked = setting;
		break;
	case 'radio':
		input.checked = false;
		for (const input2 of input.parentNode.parentNode.querySelectorAll(`input[type="radio"][value="${setting}"]`))
			input2.checked = true;
		break;
	default:
		input.value = setting;
	}
}

function createElement(tagName, attributes, properties, contents, parent) {
	const element = document.createElement(tagName);
	for (const [name, value] of Object.entries(attributes || {})) {
		if (name == 'on' || name == 'once') {
			for (const [type, listener] of Object.entries(value))
				element.addEventListener(type, listener, {once: name == 'once'});
		}
		else if (value === true)
			element.setAttribute(name, name);
		else if (value !== undefined && value !== false)
			element.setAttribute(name, value);
	}
	for (const [name, value] of Object.entries(properties || {})) {
		if (value !== undefined)
			element[name] = value;
	}
	for (let content of contents || []) {
		if (!(content instanceof Element))
			content = document.createTextNode(content);
		element.appendChild(content);
	}
	if (parent)
		parent.appendChild(element);
	return element;
}

function parseConstraintName(input) {
	const parts = (
		(input.name || input.id)
		.match(/^([^-]+)(-(\d+))?(-([^-]+))?(-.*)?$/)
		) || [];
	const kind = parts[1];
	const indexText = parts[3];
	const index = +(indexText || 0);
	const name = parts[5];
	return {kind, indexText, index, name};
}

function updateConstraints(table, mediaSource) {
	const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
	const mediaSourceTracks = {};
	if (table && mediaSource) {
		for (const track of mediaSource.getTracks()) {
			const capabilities = track.getCapabilities ? track.getCapabilities() : {};
			const settings = track.getSettings();
			mediaSourceTracks[track.kind] ||= [];
			mediaSourceTracks[track.kind].push({capabilities, settings, track});
		}
		table.mediaSourceTracks = mediaSourceTracks;
	}
	for (const input of (table || document).querySelectorAll('input, select')) {
		if (!input.matches('table.constraints > tbody > tr > td > label > *'))
			continue;
		const {kind, index, indexText, name} = parseConstraintName(input);
		if (!kind || !name)
			continue;
		//         *     label      td         tr
		const tr = input.parentNode.parentNode.parentNode;
		if (!supportedConstraints[name]) {
			input.disabled = true;
			tr.title = 'No browser support';
		}
		else if (!indexText || !mediaSource)
			continue;
		else if (index >= (mediaSourceTracks[kind] || []).length) {
			input.disabled = true;
			tr.title = `No ${kind} track #${index + 1}`;
		}
		else if (!(name in mediaSourceTracks[kind][index].settings)) {
			input.disabled = true;
			tr.title = 'No device capability';
		}
		else {
			input.disabled = false;
			const capability = mediaSourceTracks[kind][index].capabilities[name];
			const setting = mediaSourceTracks[kind][index].settings[name];
			switch (input.type) {
			case 'checkbox':
				input.checked = setting;
				input.readonly = Array.isArray(capability) && capability.includes(false) != capability.includes(true);
				break;
			case 'range':
				if ('min' in capability && 'max' in capability) {
					input.max = capability.max;
					input.min = capability.min;
					input.readonly = capability.min >= capability.max;
					input.step = capability.step;
				}
				input.value = setting;
				break;
			case 'select-one':
				if (Array.isArray(capability)) {
					for (const option of input.options) {
						if (option.value)
							option.disabled = !capability.includes(option.value);
					}
				}
				// Fall through.
			case 'text':
				input.value = setting;
				break;
			default:
				console.log(input);
			}
		}
	}
}

async function updateDeviceLists() {
	const labels = {};
	for (const device of await navigator.mediaDevices.enumerateDevices()) {
		if (!device.label)
			continue;
		const parts = device.kind.match(/^([^-]+)input$/);
		if (!parts)
			continue;
		const kind = parts[1];
		labels[kind] ||= {};
		labels[kind][device.deviceId] = device.label;
	}
	for (const input of document.querySelectorAll('select[id$="-deviceId"], select[name$="-deviceId"]')) {
		//            *     label      td         tr         tbody      table
		const table = input.parentNode.parentNode.parentNode.parentNode.parentNode;
		const {kind, index, indexText, name} = parseConstraintName(input);
		if (!kind || !name || !(kind in labels))
			continue;
		const oldValue = input.value;
		while (input.options.length && input.options[input.options.length-1].value)
			input.removeChild(input.lastChild);
		for (const [value, label] of Object.entries(labels[kind]))
			input.appendChild(createElement('option', {label, value}));
		if (indexText && index < ((table.mediaSourceTracks || {})[kind] || []).length)
			input.value = table.mediaSourceTracks[kind][index].settings.deviceId;
		else
			input.value = oldValue;
	}
}

document.addEventListener('DOMContentLoaded', event => {
	updateConstraints();
	updateDeviceLists()
	.catch(error => alert(error));
}, {once: true});
