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

		// VARIABLE changes with each call of getOutputs. Used to calculate the outputs.
		// Array of numerical values.
		this.organismInputs = null;
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

		// CREATE all the Nodes from Organism's NodeGenes.
		nodeGenes.forEach(function (nodeGene) {
			var node = new Node(nodeGene.type);
			
			// IF input node.
			if (nodeGene.type == NodeType.input) {
				// GET the value from the Organism's inputs.
				node.calcValue = function() {
					if (nodeGene.idx < organismInputs.length && nodeGene.inputIdx >= 0)
						return organismInputs[nodeGene.inputIdx];
					return 0;
				}
			}
			// IF output node.
			if (nodeGene.type == NodeType.output) {
				// ASSOCIATE the output with Organism's outputs.
				outputNodes[nodeGene.idx] = node;
			}

			nodes[nodeGene.id] = node
		});

		// ADD connections to nodes from genes.
		connectionGenes.forEach(function (connectionGene) {
			// IF the gene is enabled.
			if (connectionGene.enabled) {
				// ADD the connection to the node.
				var connection = new Connection(nodes[connectionGene.inId], connectionGene.weight);
				nodes[connectionGene.outId].addInput(connection);
			}
		});
	}

	// Have the Organism calculate its outputs.
	// inputs - array of numerical values of variable size that the organism will use to calculate its outputs.
	// returns an array of outputs. (fixed length)
	getOutputs(inputs) {
		if (inputs.length > maxInputCount) {
			maxInputCount = inputs.length;
		}

		var outputs = [];
		// Reset nodes so they will calculate their values again with the new inputs.
		resetNodes();

		// Calculate Organism's values using its NeruralNetwork.
		this.organismInputs = inputs;
		for (var i = 0; i < outputNodes; i++) {
			var outNode = outputNodes[i];
			if (outNode == null) {
				outputs[i] = 0;
			} else {
				outputs[i] = outNode.calcValue();
			}
		}
		
		// Array of numbers between 0 and 1.
		return outputs;
	}

	// Reset nodes so they will calculate their values again for new inputs.
	resetNodes() {
		this.nodes.map(function (node) {
			node.reset();
		});
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
















