const Util = require('./Util');
const NodeType = require('./NodeType');
const NodeGene = require('./NodeGene');
const ConnectionGene = require('./ConnectionGene');
const Organism = require('./Organism');
const Genome = require('./Genome');

var geneConstants = {
	node = {
		// Chance that an input gene will be created.
		input: 0.3,
		// Chance that an output gene will be created.
		output: 0.3
	},
	connection = {
		// Chance that a connection gene will be created.
		create: 0.1,
		// Chance that a connection will be split.
		splitConnection: 0.3
	},
	weight = {
		// Chance that a weight mutation will occur.
		chance = 0.3,
		// Lower bound of how much a weight mutation can be.
		changeLower = 0.1,
		// Upper bound of how much a weight mutation can be.
		changeUpper = 0.25
	}
}

class GeneGenorator {
	constructor() {
		this.innovNumber = 0;
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
	 *  Mutation may:
	 *		add InputNode, add OutputNode, split Connection, add Connection
	 *      change Connection weights 
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
		if (Math.random() < geneConstants.connection.splitConnection) {
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
			var nodeA = geneUtil.getRandomNode(genome);
			var nodeB = geneUtil.getRandomNode(genome);

			while(connectionExists(genome, nodeA.id, nodeB.id)) {
				nodeA = geneUtil.getRandomNode(genome);
				nodeB = geneUtil.getRandomNode(genome);
			}

			var newConnection = geneUtil.connection(innovNumber++, nodeA.id, nodeB.id);
			newGenome.addNodeGene(newConnection);
		}

		// Mutate weights.
		newGenome.connections.forEach(function(connection) {
			// If should mutate weight.
			if (Math.random() < geneConstants.weight.chance) {
				connection.weight = Util.randomFloat(geneConstants.weight.changeLower, geneConstants.weight.changeUpper);
			}
		});

		return newGenome;
	}

}

var createGene = {
	input = function(innovNumber, maxInputCount) {
		var nodeGene = new NodeGene(innovNumber, NodeType.input);
		nodeGene.idx = Util.randomInt(0, maxInputCount - 1);
		return nodeGene;
	},

	output = function(innovNumber, maxOutputCount) {
		var nodeGene = new NodeGene(innovNumber, NodeType.output);
		nodeGene.idx = Util.randomInt(0, maxOutputCount - 1);

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
		var idx = Util.randomInt(0, genome.nodeGenes.length - 1);
		return genome.nodeGenes[idx];
	},

	getRandomConnection = function(genome) {
		var idx = Util.randomInt(0, genome.connectionGenes.length - 1);
		return genome.connectionGenes[idx];
	},

	connectionExists = function(genome, inputId, outputId) {
		genome.connections.forEach(function(connection) {
			if (connection.inId == inputId && connection.outId == outputId) {
				return true;
			}
			return false;
		});
	}
}

module.exports = GeneGenorator;


