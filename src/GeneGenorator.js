const Assert = require('assert')

const Util = require('./Util');
const NodeType = require('./NodeType');
const NodeGene = require('./NodeGene');
const ConnectionGene = require('./ConnectionGene');
const Organism = require('./Organism');
const Genome = require('./Genome');

var geneConstants = {
	node: {
		// Chance that an input gene will be created.
		input: 0.3,
		// Chance that an output gene will be created.
		output: 0.3
	},
	connection: {
		// Chance that a connection gene will be created.
		create: 0.1,
		// Chance that a connection will be split.
		splitConnection: 0.3
	},
	weight: {
		// Chance that a weight mutation will occur.
		chance: 0.3,
		// Lower bound of how much a weight mutation can be.
		changeLower: 0.05,
		// Upper bound of how much a weight mutation can be.
		changeUpper: 0.25
	},
	mate: {
		// Chance that genes will appear in offspring.
		crossover: 0.5
	}
}

class GeneGenorator {
	constructor() {
		this.innovNumber = 0;

		// All the genes that have been created so far.
		this.allGenes = {
			// idx -> id
			input: {},
			// idx -> id
			output: {},
			// {in, out} -> id
			connection: {},
			// {in, out} -> id
			splitConnection: {}
		}
	}

	/**
	 *	Creates a new Genome.
	 *  @return A new Genome with one input, connection, and output Gene.
	 */
	createGenome(maxInputs, maxOutputs) {
		var newGenome = new Genome();

		var inputGene = createGene.input(this, maxInputs);
		var outputGene = createGene.output(this, maxOutputs);
		var connectionGene = createGene.connection(this, inputGene.id, outputGene.id);
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
			var inputGene = createGene.input(this, maxInputs);
			var outputGene = geneUtil.getRandomNode(genome);
			var connectionGene = createGene.connection(this, inputGene.id, outputGene.id);
			newGenome.addNodeGene(inputGene);
			newGenome.addConnectionGene(connectionGene);
		}
		// If should create an output gene.
		if (Math.random() < geneConstants.node.output) {
			var outputGene = createGene.output(this, maxOutputs);
			var inGene = geneUtil.getRandomNode(genome);
			var connectionGene = createGene.connection(this, inGene.id, outputGene.id);
			newGenome.addNodeGene(outputGene);
			newGenome.addConnectionGene(connectionGene);
		}
		// If should split connection.
		if (Math.random() < geneConstants.connection.splitConnection) {
			var connToSplit = geneUtil.getRandomConnection(genome);
			connToSplit.setEnabled(false);

			var newNode = createGene.hidden(this);

			var connA = createGene.connection(this, connToSplit.inId, newNode.id);
			connA.setWeight(1);
			var connB = createGene.connection(this, newNode.id, connToSplit.outId);
			connB.setWeight(connToSplit.weight);

			newGenome.addNodeGene(newNode);
			newGenome.addNodeGene(connA);
			newGenome.addNodeGene(connB);
		}
		// If should create new connection.
		if (Math.random() < geneConstants.connection.create) {
			var nodeA = geneUtil.getRandomNode(genome);
			var nodeB = geneUtil.getRandomNode(genome);

			while(geneUtil.connectionExists(genome, nodeA.id, nodeB.id)) {
				nodeA = geneUtil.getRandomNode(genome);
				nodeB = geneUtil.getRandomNode(genome);
			}

			var newConnection = geneUtil.connection(innovNumber++, nodeA.id, nodeB.id);
			newGenome.addNodeGene(newConnection);
		}

		// Mutate weights.
		newGenome.connectionGenes.forEach(function(connection) {
			// If should mutate weight.
			if (Math.random() < geneConstants.weight.chance) {
				var dir = Math.random() < 0.5 ? 1 : -1;
				var weightChange = Util.randomFloat(geneConstants.weight.changeLower, geneConstants.weight.changeUpper) * dir;
				connection.setWeight(connection.weight + weightChange);
			}
		});

		return newGenome;
	}

	/**
	 *	Create a new genome by mating two genomes.
	 *  @return new genome that results from mating the two genomes.
	 */
	mateGenomes(genomeA, genomeB, fitnessA, fitnessB) {
		var newGenome = new Genome();
		genomeA.nodeGenes.map(function(node) {
			newGenome.addNodeGene(node);
		});
		genomeB.nodeGenes.map(function(node) {
			newGenome.addNodeGene(node);
		});

		if (fitnessA == fitnessB) {
			// Add all disjoint and excess genes.
			var connGenes = {};
			genomeA.connectionGenes.map(function(connection) {
				if (genomeB.innovNums[connection.innovNum] != undefined) {
					connGenes[connection.innovNum] = connection;
				} else if (Math.random() > geneConstants.mate.crossover) {
					connGenes[connection.innovNum] = connection;
				}
			});
			genomeB.connectionGenes.map(function(connection) {
				if (connGenes[connection.innovNum] != undefined) {
					if (Math.random() > geneConstants.mate.crossover) {
						connGenes[connection.innovNum] = connection;
					}
				}
				else if (Math.random() > geneConstants.mate.crossover) {
					connGenes[connection.innovNum] = connection;
				}
			});
			Object.keys(connGenes).forEach(function(innovNum) {
				newGenome.addConnectionGene(connGenes[innovNum]);
			});
		} else {
			// Add disjoint and excess genes from fitter genome only.
			var strongGenome = fitnessA > fitnessB ? genomeA : genomeB;
			var weakGenome = fitnessA < fitnessB ? genomeA : genomeB;
			var connGenes = {};
			weakGenome.connectionGenes.map(function(connection) {
				connGenes[connection.innovNum] = connection;
			});
			strongGenome.connectionGenes.map(function(connection) {
				if (connGenes[connection.innovNum] != undefined) {
					newGenome.addConnectionGene(Math.random() > 0.5 ? connGenes[connection.innovNum] : connection);
				} else {
					newGenome.addConnectionGene(connection);
				}
			});
		}

		return newGenome;
	}

}

var createGene = {
	input: function(geneGenorator, maxInputCount) {
		var idx = Util.randomInt(0, maxInputCount - 1);
		var nodeGene;
		if (geneGenorator.allGenes.input[idx] == undefined) {
			nodeGene = new NodeGene(geneGenorator.innovNumber++, NodeType.input);
			geneGenorator.allGenes.input[idx] = nodeGene.id;
		} else {
			nodeGene = new NodeGene(geneGenorator.allGenes.input[idx], NodeType.input);
		}
		nodeGene.idx = idx;

		return nodeGene;
	},

	output: function(geneGenorator, maxOutputCount) {
		var idx = Util.randomInt(0, maxOutputCount - 1);
		var nodeGene;
		if (geneGenorator.allGenes.output[idx] == undefined) {
			nodeGene = new NodeGene(geneGenorator.innovNumber++, NodeType.output);
			geneGenorator.allGenes.output[idx] = nodeGene.id;
		} else {
			nodeGene = new NodeGene(geneGenorator.allGenes.output[idx], NodeType.output);
		}
		nodeGene.idx = idx;

		return nodeGene;
	},

	hidden: function(geneGenorator, connToSplit) {
		var splitConn = JSON.stringify({in: connToSplit.in, out: connToSplit.out});
		var nodeGene;
		if (geneGenorator.allGenes.splitConnection[splitConn] == undefined) {
			nodeGene = new NodeGene(geneGenorator.innovNumber++, NodeType.hidden);
			geneGenorator.allGenes.splitConnection[splitConn] = nodeGene.id;
		} else {
			nodeGene = new NodeGene(geneGenorator.allGenes.splitConnection[splitConn], NodeType.hidden);
		}
		return nodeGene;
	},

	connection: function(geneGenorator, inId, outId) {
		var conn = JSON.stringify({in: inId, out: outId});
		var connGene;
		if (geneGenorator.allGenes.connection[conn] == undefined) {
			connGene = new ConnectionGene(inId, outId, geneGenorator.innovNumber++);
			geneGenorator.allGenes.connection[conn] = connGene.innovNum;
		} else {
			connGene = new ConnectionGene(inId, outId, geneGenorator.allGenes.connection[conn]);
		}

		return connGene;
	}
}

var geneUtil = {
	getRandomNode: function(genome) {
		var idx = Util.randomInt(0, genome.nodeGenes.length - 1);
		return genome.nodeGenes[idx];
	},

	getRandomConnection: function(genome) {
		var idx = Util.randomInt(0, genome.connectionGenes.length - 1);
		return genome.connectionGenes[idx];
	},

	connectionExists: function(genome, inputId, outputId) {
		genome.connectionGenes.forEach(function(connection) {
			if (connection.inId == inputId && connection.outId == outputId) {
				return true;
			}
			return false;
		});
	}
}

module.exports = GeneGenorator;


// Tests ---------------------------------------------------------------------------------------
var Tests = {
	createGeneTests: function() {
		var generator = new GeneGenorator();

		var inputNodeGene = new NodeGene(0, NodeType.input);
		inputNodeGene.idx = 0;
		for (var i = 0; i < 3; i++) {
			Assert.deepEqual(inputNodeGene, createGene.input(generator, 1));
		}

		generator = new GeneGenorator();
		var outputNodeGene = new NodeGene(0, NodeType.output);
		outputNodeGene.idx = 0;
		for (var i = 0; i < 3; i++) {
			Assert.deepEqual(outputNodeGene, createGene.output(generator, 1));
		}

		generator = new GeneGenorator();
		var hiddenNodeGene = new NodeGene(0, NodeType.hidden);
		for (var i = 0; i < 3; i++) {
			Assert.deepEqual(hiddenNodeGene, createGene.hidden(generator, new ConnectionGene(1, 2, 5)));
		}

		generator = new GeneGenorator();
		var connGene = new ConnectionGene(0, 3, 0);
		for (var i = 0; i < 3; i++) {
			var createdGene = createGene.connection(generator, 0, 3);
			Assert.equal(connGene.inId, createdGene.inId);
			Assert.equal(connGene.outId, createdGene.outId);
			Assert.equal(connGene.innovNum, createdGene.innovNum);
		}
	},

	createGenomeTest: function() {
		// CreateGene
		var generator = new GeneGenorator();
		var genome = generator.createGenome(5, 5);
		console.log(genome);
	},

	mutateGenomeTest: function() {
		var generator = new GeneGenorator();
		var genomeA = generator.createGenome(5, 5);
		var genomeB = generator.mutateGenome(genomeA, 5, 5);
		console.log(genomeA);
		console.log(genomeB);
	},

	mateGenomesStrongerTest: function() {
		var generator = new GeneGenorator();
		var genomeA = generator.createGenome(5, 5);
		var genomeB = generator.createGenome(5, 5);
		var genomeC = generator.mateGenomes(genomeA, genomeB, 1, 2);
		console.log(genomeA);
		console.log(genomeB);
		console.log(genomeC);
	},

	mateGenomesEqualTest: function() {
		var generator = new GeneGenorator();
		var genomeA = generator.createGenome(5, 5);
		var genomeB = generator.createGenome(5, 5);
		var genomeC = generator.mateGenomes(genomeA, genomeB, 2, 2);
		console.log(genomeA);
		console.log(genomeB);
		console.log(genomeC);
	},

	runAll: function() {
		this.createGeneTests();
		//this.createGenomeTest();
		//this.mutateGenomeTest();
		//this.mateGenomesEqualTest();
	}
}


Tests.runAll();










