
Util = {
	/**
	 *	Returns a random number between start and end.
	 */
	random: function(start, end) {
		return Math.floor(Math.random() * (end - start + 1)) + start
	}
}

module.exports = Util;

