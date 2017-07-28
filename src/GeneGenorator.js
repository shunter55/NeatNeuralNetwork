
class GeneGenorator {
	constructor() {
		this.nodeGenes = [];
		this.connectionGenes = [];
	}

	createRandomNode() {

	}

	createRandomConnection() {
		// GET in and out. Out cannot be the same as in.
		var inIdx = Util.random(0, this.nodeCount);
		var outIdx = Util.random(0, this.nodeCount);
		while (outIdx == inIdx) {
			outIdx = Util.random(0, this.nodeCount);
		}
		// ADD the new connection.
		var connection = new Connection(this.nodes[inIdx], this.nodes[outIdx], innovNumber);
		this.connections.push(connections);
	}
}