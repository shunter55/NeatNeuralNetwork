
Util = {
	/**
	 *	Returns a random number between start and end inclusive.
	 */
	random: function(start, end) {
		return Math.floor(Math.random() * (end - start + 1)) + start
	},

	/**
	 *	Return a random number between decimals start and end inclusive.
	 */
	randomFloat: function(start, end) {
		return Math.random() * (end - start) + start;
	}
}

module.exports = Util;


