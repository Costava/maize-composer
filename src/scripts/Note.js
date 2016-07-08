// A note is a string consisting of:
// 1. One letter A-G (capital)
// 2. followed by '#', 'b', or no accidental
// 3. followed by a number [0, 8]
//
// 1 and 2 together are the pitch of the note
// 3 is the octave of the note
//
// The range of acceptable notes is C0 to C8 (arbitrary to match Band.js)
//
// Note Reference: http://www.phy.mtu.edu/~suits/notefreqs.html

export default {
	pitch: function(note) {
		return /[A-G][#b]?/.exec(note)[0];
	},

	octave: function(note) {
		return parseInt(/[0-8]/.exec(note)[0]);
	},

	equivalence: {
		'Ab': 'G#',
		'A#': 'Bb',
		'Bb': 'A#',
		'B' : 'Cb',
		'B#': 'C' ,
		'Cb': 'B' ,
		'C' : 'B#',
		'C#': 'Db',
		'Db': 'C#',
		'D#': 'Eb',
		'Eb': 'D#',
		'E' : 'Fb',
		'E#': 'F' ,
		'Fb': 'E' ,
		'F' : 'E#',
		'F#': 'Gb',
		'Gb': 'F#',
		'G#': 'Ab'
	},

	equivalent: function(note1, note2) {
		var pitch1 = this.pitch(note1);
		var pitch2 = this.pitch(note2);

		var equivalentPitch = pitch1 === pitch2 || this.equivalence[pitch1] === pitch2;

		return equivalentPitch && this.octave(note1) === this.octave(note2);
	},

	sharp: function(note) {
		return note[1] === '#';
	},

	flat: function(note) {
		return note[1] === 'b';
	},

	accidental: function(note) {
		return this.sharp(note) || this.flat(note);
	},

	halfStepUp: {
		'Ab': 'A' ,
		'A' : 'A#',
		'A#': 'B' ,
		'Bb': 'B' ,
		'B' : 'C' ,
		'B#': 'C#',
		'Cb': 'C' ,
		'C' : 'C#',
		'C#': 'D' ,
		'Db': 'D' ,
		'D' : 'D#',
		'D#': 'E' ,
		'Eb': 'E' ,
		'E' : 'F' ,
		'E#': 'F#',
		'Fb': 'F' ,
		'F' : 'F#',
		'F#': 'G' ,
		'Gb': 'G' ,
		'G' : 'G#',
		'G#': 'A'
	},

	raiseHalfStep: function(note) {
		var pitch = this.pitch(note);
		var octave = this.octave(note);

		if ((pitch === 'B#' || pitch === 'C') && octave === 8) {
			throw {
				name: "Out of bounds error",
				message: "Note cannot be raised above C8/B#8."
			};
		}

		var newPitch = this.halfStepUp[pitch];
		var newOctave = (pitch === 'B' || pitch === 'B#') ? (octave + 1) : octave;

		return newPitch + newOctave;
	},

	halfStepDown: {
		'Ab': 'G' ,
		'A' : 'Ab',
		'A#': 'A' ,
		'Bb': 'A' ,
		'B' : 'Bb',
		'B#': 'B' ,
		'Cb': 'Bb',
		'C' : 'B' ,
		'C#': 'C' ,
		'Db': 'C' ,
		'D' : 'Db',
		'D#': 'D' ,
		'Eb': 'D' ,
		'E' : 'Eb',
		'E#': 'E' ,
		'Fb': 'Eb',
		'F' : 'E' ,
		'F#': 'F' ,
		'Gb': 'F' ,
		'G' : 'Gb',
		'G#': 'G'
	},

	lowerHalfStep: function(note) {
		var pitch = this.pitch(note);
		var octave = this.octave(note);

		if (pitch === 'C' && octave === 0) {
			throw {
				name: "Out of bounds error",
				message: "Note cannot be lowered below C0."
			};
		}

		var newPitch = this.halfStepDown[pitch];
		var newOctave = (pitch === 'C' || pitch === 'Cb') ? (octave - 1) : octave;

		return newPitch + newOctave;
	},

	order: [
		['Cb'],
		['C'],
		['C#', 'Db'],
		['D'],
		['D#', 'Eb'],
		['E', 'Fb'],
		['E#', 'F'],
		['F#', 'Gb'],
		['G'],
		['G#', 'Ab'],
		['A'],
		['A#', 'Bb'],
		['B'],
		['B#']
	],

	higher: function(note1, note2) {
		if (this.equivalent(note1, note2)) {
			return false;
		}

		var octave1 = this.octave(note1);
		var octave2 = this.octave(note2);

		if (octave1 > octave2) {
			return true;
		}

		if (octave2 > octave1) {
			return false;
		}

		var pitch1 = this.pitch(note1);
		var pitch2 = this.pitch(note2);

		var index1;
		var index2;

		for (var i = 0; i < this.order.length; ++i) {
			for (var j = 0; j < this.order[i].length; ++j) {
				var pitch = this.order[i][j];

				// The two pitches are not equivalent,
				//  so they will not share an i index,
				//  and the j index will not matter
				if (pitch1 === pitch) {
					index1 = i;
				}
				else if (pitch2 === pitch) {
					index2 = i;
				}
			}
		}

		if (index1 < index2) {
			return false;
		}

		return true;
	},

	lower: function(note1, note2) {
		return this.higher(note2, note1);
	}
}
