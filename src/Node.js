const NodeType = require('./NodeType');

class Node {
	constructor(nodeType) {
		this.type = nodeType;
		this.connections = [];
		this.value = null;
	}

	calcValue() {
		switch (this.type) {
			case NodeType.input:
				if (this.value == null)
					throw new Error("value cannot be null for input node.");
				return this.value;
			default:
				if (this.value == null) {
					this.value = 1;
					var total = 0;
					this.connections.forEach(function (connection) {
						total += connection.calcValue();
					});

					this.value = squashingFunction(total);
				}
				return this.value;
		}
	}

	setValue(value) {
		this.value = value;
	}

	reset() {
		this.value = null;
	}

	addInput(connection) {
		this.connections.push(connection);
	}

}

var squashingFunction = function(value) {
	return 2 * Math.pow((1 + Math.exp(-value)), -1) - 1;
}

module.exports = Node;