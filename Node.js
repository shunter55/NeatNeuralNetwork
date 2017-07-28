
class Node {
	constructor(nodeType) {
		this.type = nodeType;
		this.connections = [];
		this.value = null;
	}

	calcValue() {
		if (this.value == null) {
			var total = 0;
			connections.forEach(function (connection) {
				total += connection.calcValue();
			});

			this.value = Math.pow((1 + Math.exp(-total)), -1);
		}

		return this.value;
	}

	reset() {
		value = null;
	}

	addInput(connection) {
		connections.push(connection);
	}

}