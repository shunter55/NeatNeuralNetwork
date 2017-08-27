
Util = {
	/**
	 *	Returns a random Integer between min and max inclusive.
	 */
	randomInt: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min
	},

	/**
	 *	Return a random Float between min and max inclusive.
	 */
	randomFloat: function(min, max) {
		return Math.random() * (max - min) + min;
	}
}

module.exports = Util;

