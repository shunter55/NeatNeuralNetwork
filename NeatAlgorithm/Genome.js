const Util = require('./Util');
const NodeType = require('./NodeType');
const Node = require('./Node');
const Connection = require('./Connection');

// Represents an Organism. Add genes to the organism, then generate its network.
class Genome {
	constructor() {
		// All Genes used to create the Organism initially.
		this.nodeGenes = [];
		this.connectionGenes = [];

		// All the Organism's nodes. Instantiated upon creation (generateNetwork).
		this.nodes = null;
		// All the Organism's output nodes. Length is fixed upon creation. Nonexistant nodes are set to null.
		this.outputNodes = null;

		// VARIABLE changes with each call of getOutputs. Used to calculate the outputs.
		// Array of numerical values.
		this.organismInputs = null;
	}

	// ADD GENES.
	addNodeGene(nodeGene) {
		this.nodeGenes.push(nodeGene);
	}
	addConnectionGene(connectionGene) {
		this.connectionGenes.push(connectionGenes);
	}

	// BIRTH ORGANISM. (Creates organism from genes)
	// numOutputs - Number of outputs of an organism can make is expected to remain constant throughout its life. 
	generateNetwork(numOutputs) {
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
	getOutputs(inputs) {
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

	// Save to json.
	save() {
		var genome = {"nodeGenes": nodeGenes, "connectionGenes": connectionGenes};
		return JSON.stringify(genome);
	}

	// Load from json.
	load(json) {
		// Reinitiallize.
		this.nodeGenes = [];
		this.connectionGenes = [];
		this.nodes = null;
		this.outputNodes = null;
		this.organismInputs = null;

		// Load.
		var genome = JSON.parse(json);

		genome.nodeGenes.forEach(function (nodeGene) {
			this.addNodeGene(nodeGene);
		});

		genome.connectionGenes.forEach(function (connectionGene) {
			this.addConnectionGene(connectionGene);
		});
	}
}




module.exports = Genome;


















