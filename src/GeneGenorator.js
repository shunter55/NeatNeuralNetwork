const Util = require('./Util');
const NodeType = require('./NodeType');
const NodeGene = require('./NodeGene');
const ConnectionGene = require('./ConnectionGene');
const Organism = require('./Organism');
const Genome = require('./Genome');

geneConstants = {
	node = {
		input: 0.3,
		output: 0.3,
		splitConnection: 0.3
	},
	connection = {
		create: 0.1
	},
	gene = {
		maxInputCount = 5,
		maxOutputCount = 5
	}
}

class GeneGenorator {
	constructor() {
		this.innovNumber = 0;

		this.nodeGenes = [];
		this.connectionGenes = [];
	}

	/**
	 *	Creates a new Genome.
	 *  @return A new Genome with one input, connection, and output Gene.
	 */
	createGenome(maxInputs, maxOutputs) {
		var newGenome = new Genome();

		var inputGene = createGene.input(this.innovNumber++, maxInputs);
		var outputGene = createGene.output(this.innovNumber++, maxOutputs);
		var connectionGene = createGene.connection(this.innovNumber++, inputGene, outputGene);
		newGenome.addNodeGene(inputGene);
		newGenome.addNodeGene(outputGene);
		newGenome.addConnectionGene(connectionGene);

		return newGenome;
	}

	/**
	 *	Create a new genome by mutating the given genome.
	 *  Mutation may add new:
	 *		InputNode, OutputNode, Connection
	 *  Mutation may change:
	 *		Connection weights
	 *  @return a new genome mutated from the given genome.
	 */
	mutateGenome(genome, maxInputs, maxOutputs) {
		var newGenome = genome.copy();

		// If should create an input gene.
		if (Math.random() < geneConstants.node.input) {
			var inputGene = createGene.input(this.innovNumber++, maxInputs);
			var outGene = geneUtil.getRandomNode(genome);
			var connectionGene = createGene.connection(this.innovNumber++, inputGene, outputGene);
			newGenome.addNodeGene(inputGene);
			newGenome.addConnectionGene(connectionGene);
		}
		// If should create an output gene.
		if (Math.random() < geneConstants.node.output) {
			var outputGene = createGene.output(this.innovNumber++, maxOutputs);
			var inGene = geneUtil.getRandomNode(genome);
			var connectionGene = createGene.connection(this.innovNumber++, inGene, outputGene);
			newGenome.addNodeGene(outputGene);
			newGenome.addConnectionGene(connectionGene);
		}
		// If should split connection.
		if (Math.random() < geneConstants.node.splitConnection) {
			var connToSplit = geneUtil.getRandomConnection(genome);
			connToSplit.setEnabled(false);

			var newNode = createGene.hidden(this.innovNumber++);

			var connA = createGene.connection(this.innovNumber++, connToSplit.inId, newNode.id);
			connA.weight = 1;
			var connB = createGene.connection(this.innovNumber++, newNode.id, connToSplit.outId);
			connB.weight = connToSplit.weight;

			newGenome.addNodeGene(newNode);
			newGenome.addNodeGene(connA);
			newGenome.addNodeGene(connB);
		}
		// If should create new connection.
		if (Math.random() < geneConstants.connection.create) {
			
		}

	}












	// Add a random node gene.
	mutateNodeGene(organism) {
		if (Math.random() < newInputNodeGenePercent) {
			this.mutateNewInputNodeGene(organism);
		} else if (Math.random() < newOutputNodeGenePercent) {
			this.mutateNewOutputNodeGene(organism);
		} else {

		}
	}

	// Adds a InputNodeGene to the orgamism's genome.
	mutateInputGene(genome, numInputs, numOutputs) {
		// Get output node id.
		var outId = this.getRandomNodeId(organism.genome);

		// If no node genes exist yet, create the initial one.
		if (outId == null) {
			var inNodeGene = this.createInputNodeGene(organism.maxInputCount);
			var outNodeGene = this.createOutputNodeGene(organism.maxOutputCount);
			var connectionGene = new ConnectionGene(inNodeGene.id, outNodeGene.id, this.innovNumber++);

			organism.genome.addNodeGene(inNodeGene);
			organism.genome.addNodeGene(outNodeGene);
			organism.genome.addConnectionGene(connectionGene);
		} else {
			var inNodeGene = this.createInputNodeGene(organism.maxInputCount);
			var connectionGene = new ConnectionGene(inNodeGene.id, outId, innovNumber++);

			organism.genome.addNodeGene(inNodeGene);
			organism.genome.addConnectionGene(connectionGene);
		}
	}

	mutateNewOutputNodeGene(organism) {
		// Get input node id.
		var inId = this.getRandomNodeId(organism.genome);

		var outNodeGene = this.createOutputNodeGene(organism.maxOutputCount);
		var connectionGene = new ConnectionGene(inId, outNodeGene.id, innovNumber++);

		organism.genome.addNodeGene(outNodeGene);
		organism.genome.addConnectionGene(connectionGene);
	}

	mutateNewHiddenNodeGene(organism) {
		
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


	// Returns a random node id, or null if none exist.
	getRandomNodeId (genome) {
		var ids = Object.keys(genome.nodeGenes);
		if (ids.length == 0) {
			return null;
		}

		return ids[Util.random(0, ids.length)];
	}
}

var createGene = {
	input = function(innovNumber, maxInputCount) {
		var nodeGene = new NodeGene(innovNumber, NodeType.input);
		nodeGene.idx = Util.random(0, maxInputCount - 1);
		return nodeGene;
	},

	output = function(innovNumber, maxOutputCount) {
		var nodeGene = new NodeGene(innovNumber, NodeType.output);
		nodeGene.idx = Util.random(0, maxOutputCount - 1);

		return nodeGene;
	},

	hidden = function(innovNumber) {
		return new NodeGene(innovNumber, NodeType.hidden);
	},

	connection = function(innovNumber, inGene, outGene) {
		return new ConnectionGene(inGene.id, outGene.id, innovNumber);
	}
}

var geneUtil = {
	getRandomNode = function(genome) {
		var idx = Util.random(0, genome.nodeGenes.length - 1);
		return genome.nodeGenes[idx];
	},

	getRandomConnection = function(genome) {
		var idx = Util.random(0, genome.connectionGenes.length - 1);
		return genome.connectionGenes[idx];
	}
}

/*
var genomeUtils = {};

genomeUtils.createInputNodeGene = function (maxInputCount) {
	if (maxInputCount == null) {
		maxInputCount = geneConstants.startMaxInputCount;
	}

	var nodeGene = new NodeGene(nextInnovNumber++, NodeType.input);
	nodeGene.idx = Util.random(0, maxInputCount);
	return nodeGene;
}

genomeUtils.createOutputNodeGene = function (maxOutputCount) {
	if (maxOutputCount == null) {
		maxOutputCount = geneConstants.startMaxOutputCount;
	}

	var nodeGene = new NodeGene(nextInnovNumber++, NodeType.output);
	nodeGene.idx = Util.random(0, maxOutputCount);
	return nodeGene;
}

// Returns a random node id, or null if none exist.
genomeUtils.getRandomNodeId = function (genome) {
	var ids = Object.keys(genome.nodeGenes);
	if (ids.length == 0) {
		return null;
	}

	return ids[Util.random(0, ids.length)];
}
*/


module.exports = GeneGenorator;




var generator = new GeneGenorator();

var o = new Organism(new Genome());
generator.mutateNewInputNodeGene(o);

console.log(o);

