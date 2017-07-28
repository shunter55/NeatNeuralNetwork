const Util = require('./Util');

NodeType = {
	sensor: 0,
	hidden: 1,
	output: 2,
	random: function() {
		Util.random(0, 2);
	}
}

module.exports = NodeType;