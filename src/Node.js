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

					this.value = 2 * Math.pow((1 + Math.exp(-total)), -1) - 1;
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

module.exports = Node;