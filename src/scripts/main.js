console.log('main');

import Note from './Note';

//////////

// http://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
function stringToHTMLElement(str) {
	var div = document.createElement('div');
	div.innerHTML = str;

	return div.firstChild;
}

function getChildIndex(element) {
	var parent = element.parentNode;

	var numChildren = parent.children.length;

	for (var i = 0; i < numChildren; ++i) {
		if (parent.children[i] == element) {
			return i;
		}
	}
}

//////////

// height of rows that are # or b notes
var moddedNoteHeight = 15;

var defaultVolume = 50;

var defaultNoteBufferLength = 20;

// The smallest range where staff is always tall enough
var minStaffNoteRange = 4;

// When a note spot is turned on
var onColor = 'rgb(255, 255, 0)';

// Colors for note toggler
var stateColors = [
	'',// normal note
	'rgb(0, 0, 255)',// tied note
	'rgb(0, 0, 0)'// rest
];

// Note rows padding
// Keep in sync with .notes li padding rule
var tiedPadding = '2px 0';
var untiedPadding = '2px';

var noteLengths = {
	whole: 192,
	dottedHalf: 144,
	half: 96,
	dottedQuarter: 72,
	tripletHalf: 64,
	quarter: 48,
	dottedEighth: 36,
	tripletQuarter: 32,
	eighth: 24,
	dottedSixteenth: 18,
	tripletEighth: 16,
	sixteenth: 12,
	tripletSixteenth: 8,
	thirtySecond: 6
};

//////////

var parts = {};

parts.staff = `<div class="staff"></div>`;

parts.staffKey = `<ul class="staff-key">
	<li class="top-adjuster">
		<div class="top-add"></div>
		<div class="top-rem"></div>
	</li>



	<li class="bot-adjuster">
		<div class="bot-rem"></div>
		<div class="bot-add"></div>
	</li>
</ul>`;

parts.staffKeyRowLabel = `<li class="row-label"></li>`;// A note should be put in the inner HTML

parts.noteColumn = `<div class="note-column">
	<div class="note-toolbar">
		<div class="handle"></div>
		<div class="note-toggler"></div>
		<div class="note-handler"></div>
		<div class="nc-rem"></div>
	</div>

	<ul class="notes">

	</ul>
</div>`;

parts.noteColumnNotesItem = `<li><div class="note-interior"></div></li>`;

parts.volChanger = `<div class="vol-changer">
	<div class="vol-note-handler"></div>
	<input type="number" min=0 max=100 step=1 value=50 class="vol-input">
	<div class="vol-rem"></div>
</div>`;

parts.instrumentInfo = `<li>
	<select class="js-pack">
		<option value="oscillators">oscillators</option>
		<option value="noises">noises</option>
	</select>
	<span class="js-instr-wrapper"></span>
</li>`;

//////////

var instrumentsHTML = {};

instrumentsHTML.oscillators = `<select class="js-instrument">
	<option value="sine">sine</option>
	<option value="square">square</option>
	<option value="sawtooth">sawtooth</option>
	<option value="triangle">triangle</option>
</select>`;

instrumentsHTML.noises = `<select class="js-instrument">
	<option value="white">white</option>
	<option value="pink">pink</option>
	<option value="brown">brown</option>
	<option value="brownian">brownian</option>
	<option value="red">red</option>
</select>`;

//////////

function getStaffForStaffKey(staffKey) {
	var index = getChildIndex(staffKey);

	var staffHolder = staffKey.parentNode.parentNode;
	var staffs = staffHolder.querySelector('.js-staffs');

	return staffs.children[index];
}

function topAdd() {
	var staffKey = this.parentNode.parentNode;
	var staff = getStaffForStaffKey(staffKey);

	var numChildren = staff.children.length;

	// Update staff key
	var firstLabelElement = staffKey.children[1];
	var firstLabel = firstLabelElement.innerHTML;

	var newFirstLabel = Note.raiseHalfStep(firstLabel);
	var newFirstLabelElement = stringToHTMLElement(parts.staffKeyRowLabel);
	newFirstLabelElement.innerHTML = newFirstLabel;

	if (Note.accidental(newFirstLabel)) {
		newFirstLabelElement.style.height = moddedNoteHeight + 'px';
	}
	else {
		newFirstLabelElement.style.height = '';
	}

	var topNote = Note.raiseHalfStep(newFirstLabel);
	var shortTop = Note.accidental(topNote);
	if (shortTop) {
		staffKey.children[0].style.height = moddedNoteHeight + 'px';
	}
	else {
		staffKey.children[0].style.height = '';
	}

	staffKey.insertBefore(newFirstLabelElement, firstLabelElement);

	// Update all note columns
	for (var i = 0; i < numChildren; ++i) {
		var notesHolder = staff.children[i].querySelector('.notes');

		if (notesHolder != undefined) {
			var newNote = stringToHTMLElement(parts.noteColumnNotesItem);
			newNote.addEventListener('click', toggleNote);

			if (shortTop) {
				newNote.style.height = moddedNoteHeight + 'px';
			}
			else {
				newNote.style.height = '';
			}

			notesHolder.insertBefore(newNote, notesHolder.children[0]);
		}
	}
}

function topRemove() {
	var staffKey = this.parentNode.parentNode;
	var staff = getStaffForStaffKey(staffKey);

	var numChildren = staff.children.length;

	var topNote = staffKey.children[1].innerHTML;// The top note after the removal
	var shortTop = Note.accidental(topNote);
	if (shortTop) {
		staffKey.children[0].style.height = moddedNoteHeight + 'px';
	}
	else {
		staffKey.children[0].style.height = '';
	}

	// Update all note columns
	for (var i = 0; i < numChildren; ++i) {
		var notesHolder = staff.children[i].querySelector('.notes');

		if (notesHolder != undefined) {
			var firstNote = notesHolder.children[0];
			firstNote.removeEventListener('click', toggleNote);

			notesHolder.removeChild(firstNote);
		}
	}

	// Update staff key
	var firstLabelElement = staffKey.children[1];

	staffKey.removeChild(firstLabelElement);
}

function botAdd() {
	var staffKey = this.parentNode.parentNode;
	var staff = getStaffForStaffKey(staffKey);

	var numChildren = staff.children.length;

	// Update staff key
	var lastLabelElement = staffKey.children[staffKey.children.length - 2];
	var lastLabel = lastLabelElement.innerHTML;

	var newLastLabel = Note.lowerHalfStep(lastLabel);
	var newLastLabelElement = stringToHTMLElement(parts.staffKeyRowLabel);
	newLastLabelElement.innerHTML = newLastLabel;

	if (Note.accidental(newLastLabel)) {
		newLastLabelElement.style.height = moddedNoteHeight + 'px';
	}
	else {
		newLastLabelElement.style.height = '';
	}

	var botNote = Note.lowerHalfStep(newLastLabel);
	var shortBot = Note.accidental(botNote);
	if (shortBot) {
		staffKey.children[staffKey.children.length - 1].style.height = moddedNoteHeight + 'px';
	}
	else {
		staffKey.children[staffKey.children.length - 1].style.height = '';
	}

	// Update all note columns
	for (var i = 0; i < numChildren; ++i) {
		var notesHolder = staff.children[i].querySelector('.notes');

		if (notesHolder != undefined) {
			var newNote = stringToHTMLElement(parts.noteColumnNotesItem);
			newNote.addEventListener('click', toggleNote);

			if (shortBot) {
				newNote.style.height = moddedNoteHeight + 'px';
			}
			else {
				newNote.style.height = '';
			}

			notesHolder.appendChild(newNote);
		}
	}

	staffKey.insertBefore(newLastLabelElement, staffKey.children[staffKey.children.length - 1]);
}

function botRemove() {
	var staffKey = this.parentNode.parentNode;
	var staff = getStaffForStaffKey(staffKey);

	var numChildren = staff.children.length;

	var botNote = staffKey.children[staffKey.children.length - 2].innerHTML;
	var shortbot = Note.accidental(botNote);
	if (shortbot) {
		staffKey.children[staffKey.children.length - 1].style.height = moddedNoteHeight + 'px';
	}
	else {
		staffKey.children[staffKey.children.length - 1].style.height = '';
	}

	// Update all note columns
	for (var i = 0; i < numChildren; ++i) {
		var notesHolder = staff.children[i].querySelector('.notes');

		if (notesHolder != undefined) {
			var botNote = notesHolder.children[notesHolder.children.length - 1];
			botNote.removeEventListener('click', toggleNote);

			notesHolder.removeChild(botNote);
		}
	}

	// Update staff key
	var lastLabelElement = staffKey.children[staffKey.children.length - 2];

	staffKey.removeChild(lastLabelElement);
}

function getStaffKey(middleNote) {
	var newStaffKey = stringToHTMLElement(parts.staffKey);

	var notes = [
		Note.raiseHalfStep(Note.raiseHalfStep(middleNote)),
		Note.raiseHalfStep(middleNote),
		middleNote,
		Note.lowerHalfStep(middleNote),
		Note.lowerHalfStep(Note.lowerHalfStep(middleNote))
	];

	var lastChild = newStaffKey.children[newStaffKey.children.length - 1];

	// Assemble staff key
	for (var i = 0; i < notes.length; ++i) {
		var newRowLabel = stringToHTMLElement(parts.staffKeyRowLabel);
		newRowLabel.innerHTML = notes[i];

		// Shorten if note is modded
		if (Note.accidental(notes[i])) {
			newRowLabel.style.height = moddedNoteHeight + 'px';
		}

		newStaffKey.insertBefore(newRowLabel, lastChild);
	}

	// Check edges for shortening
	var topNote = Note.raiseHalfStep(notes[0]);
	if (Note.accidental(topNote)) {
		newStaffKey.children[0].style.height = moddedNoteHeight + 'px';
	}
	var botNote = Note.lowerHalfStep(notes[4]);
	if (Note.accidental(botNote)) {
		newStaffKey.children[6].style.height = moddedNoteHeight + 'px';
	}

	newStaffKey.querySelector('.top-add').addEventListener('click', topAdd);
	newStaffKey.querySelector('.top-rem').addEventListener('click', topRemove);
	newStaffKey.querySelector('.bot-add').addEventListener('click', botAdd);
	newStaffKey.querySelector('.bot-rem').addEventListener('click', botRemove);

	return newStaffKey;
}

function destroyStaffKey(SK) {
	SK.querySelector('.top-add').removeEventListener('click', topAdd);
	SK.querySelector('.top-rem').removeEventListener('click', topRemove);
	SK.querySelector('.bot-add').removeEventListener('click', botAdd);
	SK.querySelector('.bot-rem').removeEventListener('click', botRemove);

	SK.parentNode.removeChild(SK);
}

function volChangerRemove() {
	var VC = this.parentNode;
	var staff = VC.parentNode;

	VC.querySelector('.vol-rem').removeEventListener('click', volChangerRemove);
	VC.querySelector('.vol-note-handler').removeEventListener('click', volChangerInsert);

	staff.removeChild(VC);
}

function volChangerInsert() {
	var VC = this.parentNode;
	var staff = VC.parentNode;
	var staffHolder = staff.parentNode.parentNode;
	var aStaffKey = staffHolder.querySelector('.js-staff-keys').children[0];

	var numNotes = aStaffKey.children.length;
	var where = pullInsertLocation();
	var insertObjectName = pullInsertObjectName();

	var newObject;
	if (insertObjectName === "noteColumn") {
		newObject = getNoteColumn(numNotes, aStaffKey);
	}
	else {
		newObject = getVolChanger(defaultVolume);
	}

	if (where === "Before") {
		staff.insertBefore(newObject, VC);
	}
	else {
		staff.insertBefore(newObject, VC.nextSibling);
	}
}

function getVolChanger(vol) {
	var newVC = stringToHTMLElement(parts.volChanger);

	newVC.querySelector('.vol-rem').addEventListener('click', volChangerRemove);

	newVC.querySelector('input').value = vol;

	newVC.querySelector('.vol-note-handler').addEventListener('click', volChangerInsert);

	return newVC;
}

function destroyVolChanger(VC) {
	VC.querySelector('.vol-rem').removeEventListener('click', volChangerRemove);
	VC.querySelector('.vol-note-handler').removeEventListener('click', volChangerInsert);

	VC.parentNode.removeChild(VC);
}

function toggleNote() {
	var child = this.children[0];

	if (child.style.backgroundColor != onColor) {
		child.style.backgroundColor = onColor;
	}
	else {
		child.style.backgroundColor = "";
	}
}

function toggleNoteState() {
	var currentBG = this.style.backgroundColor;

	var index;
	if (currentBG == undefined) {
		index = 0;
	}
	else {
		index = stateColors.indexOf(currentBG);
	}

	if (index === 2) {
		index = 0;
	}
	else {
		index += 1;
	}

	// Remove side padding on notes if tied
	var padding;
	if (index === 1) {
		padding = tiedPadding;
	}
	else {
		padding = untiedPadding;
	}

	var noteColumn = this.parentNode.parentNode;
	var notes = noteColumn.querySelector('.notes');

	var numNotes = notes.children.length;

	for (var i = 0; i < numNotes; ++i) {
		notes.children[i].style.padding = padding;
	}

	this.style.backgroundColor = stateColors[index];
}

function noteColumnRemove() {
	var noteColumn = this.parentNode.parentNode;
	var staff = noteColumn.parentNode;

	var noteToggler = noteColumn.querySelector('.note-toggler');
	var noteHandler = noteColumn.querySelector('.note-handler');
	var removeButton = noteColumn.querySelector('.nc-rem');

	noteToggler.removeEventListener('click', toggleNoteState);
	noteHandler.removeEventListener('click', noteColumnInsert);
	removeButton.removeEventListener('click', noteColumnRemove);

	var notes = noteColumn.querySelector('.notes');
	var numNotes = notes.children.length;

	for (var i = 0; i < numNotes; ++i) {
		notes.children[i].removeEventListener('click', toggleNote);
	}

	staff.removeChild(noteColumn);
}

function destroyNoteColumn(noteColumn) {
	var noteToggler = noteColumn.querySelector('.note-toggler');
	var noteHandler = noteColumn.querySelector('.note-handler');
	var removeButton = noteColumn.querySelector('.nc-rem');

	noteToggler.removeEventListener('click', toggleNoteState);
	noteHandler.removeEventListener('click', noteColumnInsert);
	removeButton.removeEventListener('click', noteColumnRemove);

	var notes = noteColumn.querySelector('.notes');
	var numNotes = notes.children.length;

	for (var i = 0; i < numNotes; ++i) {
		notes.children[i].removeEventListener('click', toggleNote);
	}

	noteColumn.parentNode.removeChild(noteColumn);
}

function noteColumnInsert() {
	var noteColumn = this.parentNode.parentNode;
	var staff = noteColumn.parentNode;
	var staffIndex = getChildIndex(staff);
	var staffHolder = staff.parentNode.parentNode;
	var aStaffKey = staffHolder.querySelector('.js-staff-keys').children[staffIndex];

	var numNotes = noteColumn.querySelector('.notes').children.length;
	var where = pullInsertLocation();
	var insertObjectName = pullInsertObjectName();

	var newObject;
	if (insertObjectName === "noteColumn") {
		newObject = getNoteColumn(numNotes, aStaffKey);

		newObject.style.width = noteColumn.offsetWidth + 'px';
	}
	else {
		newObject = getVolChanger(defaultVolume);
	}

	if (where === "Before") {
		staff.insertBefore(newObject, noteColumn);
	}
	else {
		staff.insertBefore(newObject, noteColumn.nextSibling);
	}
}

var targetHandle;
var startPos = {};
var endPos = {};
var originalWidth;

function handleReport(e) {
	targetHandle = this;
	startPos.x = e.clientX;
	startPos.y = e.clientY;

	var noteColumn = targetHandle.parentNode.parentNode;
	var notes = noteColumn.querySelector('.notes');

	originalWidth = notes.offsetWidth;
}

function handleMouseUp(e) {
	if (targetHandle != undefined) {
		endPos.x = e.clientX;
		endPos.y = e.clientY;

		// console.log(startPos, endPos);

		var noteColumn = targetHandle.parentNode.parentNode;

		var xAddition = endPos.x - startPos.x;
		var proposedWidth = originalWidth + xAddition;

		var smallestDiff = Number.MAX_SAFE_INTEGER;
		var closestNote;
		for (var prop in noteLengths) {
			var diff = Math.abs(noteLengths[prop] - proposedWidth);

			if (diff < smallestDiff) {
				closestNote = prop;
				smallestDiff = diff;
			}
		}

		noteColumn.style.width = noteLengths[closestNote] + 'px';

		document.querySelector('.js-note-display').value = closestNote;
	}

	targetHandle = undefined;
	originalWidth = undefined;// Not necessary
}
document.addEventListener('mouseup', handleMouseUp);

function handleMouseMove(e) {
	if (targetHandle != undefined) {
		endPos.x = e.clientX;
		endPos.y = e.clientY;

		// console.log(startPos, endPos);

		var noteColumn = targetHandle.parentNode.parentNode;

		var xAddition = endPos.x - startPos.x;
		var proposedWidth = originalWidth + xAddition;

		var smallestDiff = Number.MAX_SAFE_INTEGER;
		var closestNote;
		for (var prop in noteLengths) {
			var diff = Math.abs(noteLengths[prop] - proposedWidth);

			if (diff < smallestDiff) {
				closestNote = prop;
				smallestDiff = diff;
			}
		}

		noteColumn.style.width = noteLengths[closestNote] + 'px';

		document.querySelector('.js-note-display').value = closestNote;
	}
}
document.addEventListener('mousemove', handleMouseMove);

function getNoteColumn(numNotes, staffKey) {
	var newNC = stringToHTMLElement(parts.noteColumn);
	var notes = newNC.querySelector('.notes');
	var handle = newNC.querySelector('.handle');
	var noteToggler = newNC.querySelector('.note-toggler');
	var noteHandler = newNC.querySelector('.note-handler');
	var removeButton = newNC.querySelector('.nc-rem');

	handle.addEventListener('mousedown', handleReport);
	noteToggler.addEventListener('click', toggleNoteState);
	noteHandler.addEventListener('click', noteColumnInsert);
	removeButton.addEventListener('click', noteColumnRemove);

	for (var i = 0; i < numNotes; ++i) {
		var newItem = stringToHTMLElement(parts.noteColumnNotesItem);
		newItem.addEventListener('click', toggleNote);

		notes.appendChild(newItem);
	}

	newNC.style.width = noteLengths.quarter + 'px';

	// Shorten height of modded note rows
	var firstNoteLabel = Note.raiseHalfStep(staffKey.children[1].innerHTML);
	if (Note.accidental(firstNoteLabel)) {
		notes.children[0].style.height = moddedNoteHeight + 'px';
	}

	for (var i = 1; i <= numNotes - 2; ++i) {
		var noteLabel = staffKey.children[i].innerHTML;
		if (Note.accidental(noteLabel)) {
			notes.children[i].style.height = moddedNoteHeight + 'px';
		}
	}

	var lastNoteLabel = Note.lowerHalfStep(staffKey.children[staffKey.children.length - 2].innerHTML);
	if (Note.accidental(lastNoteLabel)) {
		notes.children[numNotes - 1].style.height = moddedNoteHeight + 'px';
	}

	return newNC;
}

function destroyStaff(staff) {
	var children = [].slice.call(staff.children);

	children.forEach(function(child) {
		var notes = child.querySelector('.notes');

		if (notes != undefined) {
			destroyNoteColumn(child);

			return;
		}

		var volInput = child.querySelector('.vol-input');

		if (volInput != undefined) {
			destroyVolChanger(child);

			return;
		}

		var topAdjuster = child.querySelector('.top-adjuster');

		if (topAdjuster != undefined) {
			destroyStaffKey(child);

			return;
		}

		console.log("Unknown child of staff:", staff);
	});

	staff.parentNode.removeChild(staff);
}

//////////

function clearStaffs() {
	var staffs = document.querySelector('.js-staffs');

	var children = [].slice.call(staffs.children);

	children.forEach(function(staff) {
		destroyStaff(staff);
	});
}

function clearStaffKeys() {
	var staffKeys = document.querySelector('.js-staff-keys');

	var children = [].slice.call(staffKeys.children);

	children.forEach(function(staffKey) {
		destroyStaffKey(staffKey);
	});
}

function clearInstruments() {
	var instrumentList = document.querySelector('.js-instruments');

	var numInstruments = instrumentList.children.length;

	for (var i = 0; i < numInstruments; ++i) {
		var packDropdown = instrumentList.children[i].querySelector('.js-pack');

		packDropdown.removeEventListener('change', onPackChange);
	}

	instrumentList.innerHTML = '';
}

//////////

function pullInsertLocation() {
	return document.querySelector('input[name=where]:checked').value;
}

function pullInsertObjectName() {
	return document.querySelector('.js-insert-object').value;
}

function pullMiddleNote() {
	var letter = document.querySelector('.js-mid-note-letter').value;
	var mod = document.querySelector('.js-mid-note-mod').value;
	var num = document.querySelector('.js-mid-note-num').value;

	return letter + mod + num;
}

function pullTimeSignature() {
	var timeSig = [
		parseInt(document.querySelector('.js-time-sig-top').value),
		parseInt(document.querySelector('.js-time-sig-bot').value)
	];

	return timeSig;
}

function pullTempo() {
	return parseInt(document.querySelector('.js-tempo').value);
}

function pullNoteBufferLength() {
	return parseInt(document.querySelector('.js-buffer-length').value);
}

//////////

// Returns constructed song data
function constructSongData() {
	var data = {};

	var staffHolder = document.querySelector('.js-staff-holder');
	var staffKeys = staffHolder.querySelector('.js-staff-keys');
	var staffs = staffHolder.querySelector('.js-staffs');
	var instrumentList = document.querySelector('.js-instruments');

	var numStaffs = staffs.children.length;
	var numInstruments = instrumentList.children.length;

	// Get time signature
	data.timeSignature = pullTimeSignature();

	// Get tempo
	data.tempo = pullTempo();

	data.noteBufferLength = pullNoteBufferLength();

	// Get instruments info
	data.instruments = {};

	for (var i = 0; i < numInstruments; ++i) {
		data.instruments[i] = {};
		data.instruments[i].name = instrumentList.children[i].querySelector('.js-instrument').value;
		data.instruments[i].pack = instrumentList.children[i].querySelector('.js-pack').value;
	}

	data.notes = {};

	// Get notes from each staff
	for (var i = 0; i < numStaffs; ++i) {
		var staff = staffs.children[i];
		var staffKey = staffKeys.children[i];

		// Get note labels
		var numNoteLabels = staffKey.children.length;

		var noteLabels = [];
		noteLabels[0] = Note.raiseHalfStep(staffKey.children[1].innerHTML);

		for (var j = 1; j < numNoteLabels - 1; ++j) {
			noteLabels[j] = staffKey.children[j].innerHTML;
		}

		noteLabels[numNoteLabels - 1] = Note.lowerHalfStep(staffKey.children[numNoteLabels - 2].innerHTML);

		// Scrape info from all staff children
		var numStaffChildren = staff.children.length;

		data.notes[i] = [];

		for (var j = 0; j < numStaffChildren; ++j) {
			var child = staff.children[j];
			var note = {};

			var volInput = child.querySelector('.vol-input');

			if (volInput != undefined) {
				note.type = "volume";
				note.volume = parseInt(volInput.value);
			}
			else {// is note or rest
				var noteToggler = child.querySelector('.note-toggler');
				var noteTogglerBGColor = noteToggler.style.backgroundColor;
				var notesHolder = child.querySelector('.notes');

				if (noteTogglerBGColor == stateColors[2]) {
					note.type = 'rest'
				}
				else {
					note.type = 'note';

					if (noteTogglerBGColor == stateColors[1]) {
						note.tie = true;
					}
					else {
						note.tie = false;
					}
				}

				// Get pitches
				var pitchList = [];

				var numNoteOptions = notesHolder.children.length;
				for (var k = 0; k < numNoteOptions; ++k) {
					var noteBGColor = notesHolder.children[k].children[0].style.backgroundColor;
					// ^ .children[0] to grab the interior div

					if (noteBGColor == onColor) {
						pitchList.push(noteLabels[k]);
					}
				}

				// Make the note a rest if no notes are marked
				if (pitchList.length === 0) {
					note.type = 'rest';
				}
				else {
					note.pitches = pitchList;
				}

				// Get rhythm
				var noteWidth = notesHolder.offsetWidth;

				for (var prop in noteLengths) {
					if (noteLengths[prop] == noteWidth) {
						note.rhythm = prop;
						break;
					}
				}
			}

			data.notes[i].push(note);
		}
	}

	// console.log(data);
	// console.log(JSON.stringify(data));

	return data;
}

function setUpSongData(conductor, data) {
	conductor.setTimeSignature(data.timeSignature[0], data.timeSignature[1]);

	conductor.setTempo(data.tempo);

	// console.log("noteBufferLength:", data.noteBufferLength);

	// the typeof NaN is 'number'
	if (!isNaN(data.noteBufferLength)) {
		conductor.setNoteBufferLength(data.noteBufferLength);
	}
	else {
		conductor.setNoteBufferLength(defaultNoteBufferLength);
	}

	for (var instr in data.instruments) {
		var instrument = conductor.createInstrument(data.instruments[instr].name, data.instruments[instr].pack);

		var numNotes = data.notes[instr].length;

		for (var i = 0; i < numNotes; ++i) {
			var note = data.notes[instr][i];

			if (note.type === 'volume') {
				instrument.setVolume(note.volume);
			}
			else if (note.type === 'rest') {
				instrument.rest(note.rhythm);
			}
			else {// type === 'note'
				var numPitches = note.pitches.length;
				var pitch = note.pitches[0];

				for (var j = 1; j < numPitches; ++j) {
					pitch += ', ' + note.pitches[j];
				}

				instrument.note(note.rhythm, pitch, note.tie);
			}
		}
	}
}

function loadText(text) {
	var data = JSON.parse(text);

	loadSongData(data);
}

function loadSongData(data) {
	// console.log(data);

	// Put instruments in list
	var instruments = Object.keys(data.instruments);

	// console.log(instruments);

	for (var prop in instruments) {
		addInstrument(data.instruments[prop].name, data.instruments[prop].pack);
	}

	// Update time sig and tempo
	document.querySelector('.js-time-sig-top').value = data.timeSignature[0];
	document.querySelector('.js-time-sig-bot').value = data.timeSignature[1];

	document.querySelector('.js-tempo').value = data.tempo;

	// Add staffs to DOM
	var staffHolder = document.querySelector('.js-staff-holder');
	var staffKeys = staffHolder.querySelector('.js-staff-keys');
	var staffs = staffHolder.querySelector('.js-staffs');
	var noteArrayNames = Object.keys(data.notes);

	for (var name in noteArrayNames) {
		var noteArray = data.notes[name];
		var staff = stringToHTMLElement(parts.staff);

		var numNotes = noteArray.length;
		// Get highest note and lowest note
		var highestNote = 'C0';
		var lowestNote = 'C8';

		for (var i = 0; i < numNotes; ++i) {
			if (noteArray[i].pitches != undefined) {
				var numPitches = noteArray[i].pitches.length;

				for (var j = 0; j < numPitches; ++j) {
					var currentPitch = noteArray[i].pitches[j];

					if (Note.higher(currentPitch, highestNote)) {
						highestNote = currentPitch;
					}

					if (Note.lower(currentPitch, lowestNote)) {
						lowestNote = currentPitch;
					}
				}
			}
		}
		// Highest and lowest notes now found

		// console.log("highestNote:", highestNote, "lowestNote:", lowestNote);

		// Number of half steps to move to reach highest note from lowest or vice versa
		var noteRange = 0;
		var aNote = lowestNote;
		while (!Note.equivalent(aNote, highestNote)) {
			aNote = Note.raiseHalfStep(aNote);

			noteRange += 1;
		}

		// console.log("noteRange:", noteRange);

		noteRange = Math.max(noteRange, minStaffNoteRange);

		// console.log("noteRange after max():", noteRange);

		// Add staff key
		var staffKey = stringToHTMLElement(parts.staffKey);

		staffKey.querySelector('.top-add').addEventListener('click', topAdd);
		staffKey.querySelector('.top-rem').addEventListener('click', topRemove);
		staffKey.querySelector('.bot-add').addEventListener('click', botAdd);
		staffKey.querySelector('.bot-rem').addEventListener('click', botRemove);

		var topAdjusterNote = highestNote;

		var botAdjusterNote = highestNote;
		// Bring botAdjusterNote down enough
		// botAdjusterNote is not simply the lowest note because staff must be tall enough if has only one pitch
		for (var b = 0; b < noteRange; ++b) {
			botAdjusterNote = Note.lowerHalfStep(botAdjusterNote);
		}

		// console.log("topAdjusterNote:", topAdjusterNote, "botAdjusterNote:", botAdjusterNote);

		if (Note.accidental(topAdjusterNote)) {
			staffKey.querySelector('.top-adjuster').style.height = moddedNoteHeight + 'px';
		}

		if (Note.accidental(botAdjusterNote)) {
			staffKey.querySelector('.bot-adjuster').style.height = moddedNoteHeight + 'px';
		}

		var nextNote = Note.lowerHalfStep(highestNote);
		var staffKeyLastChild = staffKey.children[staffKey.children.length - 1];

		// noteRange is one less than number of rows
		// 2 rows already exist (adjusters)
		for (var i = 0; i < noteRange + 1 - 2; ++i) {
			// console.log(nextNote);

			var rowLabel = stringToHTMLElement(parts.staffKeyRowLabel);

			if (Note.accidental(nextNote)) {
				rowLabel.style.height = moddedNoteHeight + 'px';
			}

			rowLabel.innerHTML = nextNote;

			staffKey.insertBefore(rowLabel, staffKeyLastChild);

			nextNote = Note.lowerHalfStep(nextNote);
		}

		staffKeys.appendChild(staffKey);

		var numRows = staffKey.children.length;

		// Handle all notes
		for (var n = 0; n < numNotes; ++n) {
			var note = noteArray[n];

			if (note.type === 'volume') {
				var volChanger = getVolChanger(note.volume);

				staff.appendChild(volChanger);
			}
			else {
				var noteColumn = getNoteColumn(numRows, staffKey);
				var noteToggler = noteColumn.querySelector('.note-toggler');

				if (note.type === 'rest') {
					noteToggler.style.backgroundColor = stateColors[2];
				}
				else if (note.tie) {
					noteToggler.style.backgroundColor = stateColors[1];
				}

				var padding;
				if (note.tie) {
					padding = tiedPadding;
				}
				else {
					padding = untiedPadding;
				}

				var notes = noteColumn.querySelector('.notes');

				for (var i = 0; i < notes.children.length; ++i) {
					notes.children[i].style.padding = padding;
				}

				noteColumn.style.width = noteLengths[note.rhythm] + 'px';

				// Fill in appropriate note rows
				// If there are pitches
				if (note.pitches != undefined) {
					// Go through each pitch
					for (var i = 0; i < note.pitches.length; ++i) {
						var currentPitch = note.pitches[i];

						// console.log("currentPitch:", currentPitch);

						var index = -1;
						if (Note.equivalent(currentPitch, topAdjusterNote)) {
							index = 0;
						}
						else if (Note.equivalent(currentPitch, botAdjusterNote)) {
							index = notes.children.length - 1;
						}
						else {
							// (Do not check adjusters)
							for (var j = 1; j < staffKey.children.length - 1; ++j) {
								var child = staffKey.children[j];

								if (Note.equivalent(child.innerHTML, currentPitch)) {
									index = j;

									break;
								}
							}
						}

						// console.log("notes:", notes);
						// console.log("notes.children:", notes.children);
						// console.log("num children:", notes.children.length);
						// console.log("index:", index);

						// .children[0] to grab the padded interior div
						notes.children[index].children[0].style.backgroundColor = onColor;
					}
				}

				staff.appendChild(noteColumn);
			}
		}

		staffs.appendChild(staff);
	}
}

//////////

function addInstrument(name, pack) {
	var newInfo = stringToHTMLElement(parts.instrumentInfo);

	var packDropdown = newInfo.querySelector('.js-pack');
	packDropdown.value = pack;

	packDropdown.addEventListener('change', onPackChange);

	var instrumentDropdownContainer = newInfo.querySelector('.js-instr-wrapper');
	instrumentDropdownContainer.appendChild(stringToHTMLElement(instrumentsHTML[pack]));

	var instrumentDropdown = newInfo.querySelector('.js-instrument');
	instrumentDropdown.value = name;

	document.querySelector('.js-instruments').appendChild(newInfo);
}

function raiseStaff(staffNum, numHalfSteps) {
	var staffKeys = document.querySelector('.js-staff-keys');
	var staffKey = staffKeys.children[staffNum];

	for (var i = 0; i < numHalfSteps; ++i) {
		for (var i = 1; i < staffKey.children.length - 1; ++i) {
			var child = staffKey.children[i];

			var newPitch = Note.raiseHalfStep(child.innerHTML);

			child.innerHTML = newPitch;

			if (Note.accidental(newPitch)) {
				child.style.height = moddedNoteHeight;
			}
			else {
				child.style.height = '';
			}
		}
	}

	// Update first and last
	var firstPitch = Note.raiseHalfStep(staffKey.children[1].innerHTML);

	if (Note.accidental(firstPitch)) {
		staffKey.children[0].style.height = moddedNoteHeight;
	}
	else {
		staffKey.children[0].style.height = '';
	}

	var lastPitch = Note.lowerHalfStep(staffKey.children[staffKey.children.length - 2].innerHTML);

	if (Note.accidental(lastPitch)) {
		staffKey.children[staffKey.children.length - 1].style.height = moddedNoteHeight;
	}
	else {
		staffKey.children[staffKey.children.length - 1].style.height = '';
	}
}

function lowerStaff(staffNum, numHalfSteps) {
	var staffKeys = document.querySelector('.js-staff-keys');
	var staffKey = staffKeys.children[staffNum];

	for (var i = 0; i < numHalfSteps; ++i) {
		for (var i = 1; i < staffKey.children.length - 1; ++i) {
			var child = staffKey.children[i];

			var newPitch = Note.lowerHalfStep(child.innerHTML);

			child.innerHTML = newPitch;

			if (Note.accidental(newPitch)) {
				child.style.height = moddedNoteHeight;
			}
			else {
				child.style.height = '';
			}
		}
	}

	// Update first and last
	var firstPitch = Note.raiseHalfStep(staffKey.children[1].innerHTML);

	if (Note.accidental(firstPitch)) {
		staffKey.children[0].style.height = moddedNoteHeight;
	}
	else {
		staffKey.children[0].style.height = '';
	}

	var lastPitch = Note.lowerHalfStep(staffKey.children[staffKey.children.length - 2].innerHTML);

	if (Note.accidental(lastPitch)) {
		staffKey.children[staffKey.children.length - 1].style.height = moddedNoteHeight;
	}
	else {
		staffKey.children[staffKey.children.length - 1].style.height = '';
	}
}

// Update heights of note rows
// Staff key row heights should be correct before calling
function updateNoteColumns(staffNum) {
	// console.log("updateNoteColumns");

	var staffKeys = document.querySelector('.js-staff-keys');
	var staffs = document.querySelector('.js-staffs');

	var staffKey = staffKeys.children[staffNum];
	var staff = staffs.children[staffNum];

	for (var i = 0; i < staff.children.length; ++i) {
		var notes = staff.children[i].querySelector('.notes');

		if (notes != undefined) {
			for (var j = 0; j < notes.children.length; ++j) {
				notes.children[j].style.height = staffKey.children[j].style.height;
			}
		}
	}
}

function raiseClick() {
	// Subtract 1 because 1 means the first staff
	var staffNum = parseInt(document.querySelector('.staff-number').value) - 1;

	raiseStaff(staffNum, 1);

	updateNoteColumns(staffNum);
}
document.querySelector('.js-raise').addEventListener('click', raiseClick);

function lowerClick() {
	// Subtract 1 because 1 means the first staff
	var staffNum = parseInt(document.querySelector('.staff-number').value) - 1;

	lowerStaff(staffNum, 1);

	updateNoteColumns(staffNum);

}
document.querySelector('.js-lower').addEventListener('click', lowerClick);

function addStaff() {
	var newStaff = stringToHTMLElement(parts.staff);

	var middleNote = pullMiddleNote();
	var staffKey = getStaffKey(middleNote);

	document.querySelector('.js-staff-keys').appendChild(staffKey);

	newStaff.appendChild(getVolChanger(defaultVolume));
	newStaff.appendChild(getNoteColumn(7, staffKey));
	document.querySelector('.js-staffs').appendChild(newStaff);

	// Update instrument list
	var name = document.querySelector('.js-instrument').value;
	var pack = document.querySelector('.js-pack').value;

	addInstrument(name, pack);
}
document.querySelector('.js-add-staff').addEventListener('click', addStaff);

function onPackChange() {
	var parent = this.parentNode;
	var pack = this.value;

	var instrumentDropdownContainer = parent.querySelector('.js-instr-wrapper');
	instrumentDropdownContainer.innerHTML = '';
	instrumentDropdownContainer.appendChild(stringToHTMLElement(instrumentsHTML[pack]));
}
document.querySelector('.js-pack-choice').addEventListener('change', onPackChange);
// Update the Add Staff instrument choices
(function() {
	var packDropdown = document.querySelector('.js-pack-choice');
	var pack = packDropdown.value;

	var parent = packDropdown.parentNode;

	parent.querySelector('.js-instr-wrapper').appendChild(stringToHTMLElement(instrumentsHTML[pack]));
})();

document.querySelector('.js-play').addEventListener('click', function() {
	player.play();
});

document.querySelector('.js-pause').addEventListener('click', function() {
	player.pause();
});

document.querySelector('.js-stop').addEventListener('click', function() {
	player.stop();
});

document.querySelector('.js-play-from-time').addEventListener('click', function() {
	var time = parseInt(document.querySelector('.js-start-time').value);

	player.setTime(time);
	player.play();
});

document.querySelector('.js-construct').addEventListener('click', function() {
	var data = constructSongData();

	// console.log(data);

	var json = JSON.stringify(data, null, 2);

	json = json.replace(/{[.\n\r\s]*"type":[^}]*}/g, function(match) {
		return match.replace(/[\n\r\s]+/g, ' ');
	});

	document.querySelector('.js-dump').value = json;

	conductor.destroy();
	setUpSongData(conductor, data);
	player = conductor.finish();
});

document.querySelector('.js-load').addEventListener('click', function() {
	clearStaffs();
	clearStaffKeys();
	clearInstruments();

	var text = document.querySelector('.js-dump').value;
	var data = JSON.parse(text);

	// console.log(data);

	loadSongData(data);

	conductor.destroy();
	setUpSongData(conductor, data);
	player = conductor.finish();
});

//////////

var conductor = new BandJS();
var player;
