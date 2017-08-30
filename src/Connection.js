
class Connection {
	constructor(inputNode, weight) {
		this.inputNode = inputNode;
		this.weight = weight;
	}

	calcValue() {
		return this.inputNode.calcValue() * this.weight;
	}
}

module.exports = Connection;