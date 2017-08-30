const Node = require('./Node');
const Connection = require('./Connection');

class Organism {
	constructor(genome) {
		// Organism's Genome.
		this.genome = genome;

		// Max number of inputs/outputs that were provided.
		this.maxInputCount = null;
		this.maxOutputCount = null;

		// All the Organism's nodes. Instantiated upon creation (generateNetwork).
		this.nodes = null;
		// All the Organism's output nodes. Length is fixed upon creation. Nonexistant nodes are set to null.
		this.outputNodes = null;
		// All the Organism's input nodes.
		this.inputNodes = null;
	}

	// BIRTH ORGANISM. (Creates organism from genes)
	// numOutputs - Number of outputs of an organism can make is expected to remain constant throughout its life. 
	generateNetwork(numOutputs) {
		this.maxOutputCount = numOutputs;

		// Organism's outputs are expected to remain constant for its entire life.
		this.outputNodes = [];
		for (var i = 0; i < numOutputs; i++) {
			this.outputNodes.push(null);
		}
		// All the nodes the organism has.
		this.nodes = {};

		this.inputNodes = [];
		// CREATE all the Nodes from Organism's NodeGenes.
		for (var i = 0; i < this.genome.nodeGenes.length; i++) {
			var nodeGene = this.genome.nodeGenes[i];
			var node = new Node(nodeGene.type);
			
			// IF input node.
			if (nodeGene.type == NodeType.input) {
				// Get all Organism's inputs.
				this.inputNodes.push(node);
			}
			// IF output node.
			if (nodeGene.type == NodeType.output) {
				// ASSOCIATE the output with Organism's outputs.
				this.outputNodes[nodeGene.idx] = node;
			}
			this.nodes[nodeGene.id] = node
		};

		// ADD connections to nodes from genes.
		for (var i = 0; i < this.genome.connectionGenes.length; i++) {
			var connectionGene = this.genome.connectionGenes[i];
			// IF the gene is enabled.
			if (connectionGene.enabled) {
				// ADD the connection to the node.
				var connection = new Connection(this.nodes[connectionGene.inId], connectionGene.weight);
				this.nodes[connectionGene.outId].addInput(connection);
			}
		};
	}

	// Have the Organism calculate its outputs.
	// inputs - array of numerical values of variable size that the organism will use to calculate its outputs.
	// returns an array of outputs. (fixed length)
	getOutputs(inputs) {
		if (inputs.length > this.maxInputCount) {
			this.maxInputCount = inputs.length;
		}

		// Set all the input node's values.
		console.log(this.inputNodes)
		for (var i = 0; i < this.inputNodes.length; i++) {
			this.inputNodes[i].value = i < inputs.length ? inputs[i] : 0;
			console.log(this.inputNodes[i])
		}

		var outputs = [];
		// Reset nodes so they will calculate their values again with the new inputs.
		this.resetNodes();

		// Calculate Organism's values using its NeruralNetwork.
		for (var i = 0; i < this.outputNodes.length; i++) {
			var outNode = this.outputNodes[i];

			if (outNode == null) {
				outputs[i] = 0;
			} else {
				console.log(outNode.connections)
				outputs[i] = outNode.calcValue();
			}
		}
		
		// Array of numbers between 0 and 1.
		return outputs;
	}

	// Reset nodes so they will calculate their values again for new inputs.
	resetNodes() {
		var keys = Object.keys(this.nodes);
		for (var i = 0; i < keys.length; i++) {
			this.nodes[keys[i]].reset();
		}
	}

	// Returns a copy of the organism.
	copy() {
		var newOrganism = new Organism(organism.genome.copy());
		newOrganism.maxInputCount = maxInputCount;
		newOrganism.maxOutputCount = maxOutputCount;
		newOrganism.nodes = nodes.slice();
		newOrganism.outputNodes = outputNodes.slice();
	}
}


module.exports = Organism;
















