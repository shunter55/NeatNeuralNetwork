Util = {
	/**
	 *	Returns a random Integer between min and max inclusive.
	 */
	randomInt: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min
	},

	/**
	 *	Return a random Float between min and max inclusive.
	 */
	randomFloat: function(min, max) {
		return Math.random() * (max - min) + min;
	}
}

NodeType = {
	input: "in",
	hidden: "hidden",
	output: "out",
}

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

class NodeGene {
	constructor(id, nodeType) {
		this.id = id;
		this.type = nodeType;
		// Only for input/output genes. The index in an organism's inputs/outputs that should be used.
		// idx must be valid for an output node.
		this.idx = null;

		if (nodeType == undefined)
			throw new Error("nodeType cannot be undefined");
	}

	copy() {
		var node = new NodeGene(this.id, this.type);
		node.idx = this.idx;
		return node;
	}
}

class Connection {
	constructor(inputNode, weight) {
		this.inputNode = inputNode;
		this.weight = weight;
	}

	calcValue() {
		return this.inputNode.calcValue() * this.weight;
	}
}

class ConnectionGene {
	constructor(inId, outId, innovNum) {
		this.inId = inId;
		this.outId = outId;
		this.weight = Math.random();
		this.enabled = true;
		this.innovNum = innovNum;
	}

	setWeight(weight) {
		if (weight > 1) {
			this.weight = 1;
		} else if (weight < 0) {
			this.weight = 0;
		} else {
			this.weight = weight;
		}
	}

	setEnabled(enabled) {
		this.enabled = enabled;
	}

	copy() {
		var conn = new ConnectionGene(this.inId, this.outId, this.innovNum);
		conn.weight = this.weight;
		conn.enabled = this.enabled;
		return conn;
	}
}

// Represents an Organism. Add genes to the organism, then generate its network.
class Genome {
	constructor() {
		// All Genes used to create the Organism initially.
		this.nodeGenes = [];
		this.connectionGenes = [];
		// All the innovation numbers of the Genes that appear in this Genome.
		this.innovNums = {};
	}

	// ADD GENES.
	addNodeGene(nodeGene) {
		if (nodeGene.id == undefined)
			throw new Error("not a node gene");

		if (this.innovNums[nodeGene.id] == undefined) {
			this.nodeGenes.push(nodeGene);
			this.innovNums[nodeGene.id] = true;
		}
	}
	addConnectionGene(connectionGene) {
		if (connectionGene.innovNum == undefined)
			throw new Error("not a connection gene");

		if (this.innovNums[connectionGene.innovNum] == undefined) {
			this.connectionGenes.push(connectionGene);
			this.innovNums[connectionGene.innovNum] = true;
		}
	}

	// Save to json.
	save() {
		return JSON.stringify(this);
	}

	// Load from json.
	load(jsonString) {
		// Load.
		var genome = JSON.parse(jsonString);

		genome.nodeGenes.forEach(function (nodeGene) {
			this.addNodeGene(nodeGene);
		});

		genome.connectionGenes.forEach(function (connectionGene) {
			this.addConnectionGene(connectionGene);
		});
	}

	// Returns a new copy of the genome.
	copy() {
		var newGenome = new Genome();
		this.nodeGenes.forEach(function (nodeGene) {
			newGenome.addNodeGene(nodeGene.copy());
		});
		this.connectionGenes.forEach(function (connGene) {
			newGenome.addConnectionGene(connGene.copy());
		});
		return newGenome;
	}
}

class Species {
	constructor(genome) {
		this.newRepresentative(genome);
	}

	newRepresentative(genome) {
		this.representative = genome;
		this.genomes = [];
	}

	addGenome(genome) {
		this.genomes.push(genome);
	}
}

var geneConstants = {
	node: {
		// Chance that an input gene will be created.
		input: 0.05,
		// Chance that an output gene will be created.
		output: 0.05
	},
	connection: {
		// Chance that a connection gene will be created.
		create: 0.05,
		// Chance that a connection will be split.
		splitConnection: 0.05,
		// Chance that a connection will be disabled.
		disable: 0.001
	},
	weight: {
		// Chance that a weight mutation will occur.
		chance: 0.3,
		// Lower bound of how much a weight mutation can be.
		changeLower: 0.001,
		// Upper bound of how much a weight mutation can be.
		changeUpper: 0.1
	},
	mate: {
		// Chance that genes will appear in offspring.
		crossover: 0.5
	},
	speciation: {
		compatibilityDistThreshold: 3,
		excessWeight: 1,
		disjointWeight: 1,
		weightWeight: 0.3,
		normalizingFactor: 1
	}
}

class GeneGenerator {
	constructor() {
		this.innovNumber = 0;
		this.species = [];

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
	 *	Start a new Generation.
	 */
	newGeneration() {
		for (var i = 0; i < this.species.length; i++) {
			if (s.genomes.length > 0) {
				s.newRepresentative(s.genomes[Util.randomInt(0, s.genomes.length - 1)]);
			} else {
				s.species.splice(i--, 1);
			}
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
			if (connToSplit != undefined) {
				connToSplit.setEnabled(false);

				var newNode = createGene.hidden(this, connToSplit);

				var connA = createGene.connection(this, connToSplit.inId, newNode.id);
				connA.setWeight(1);
				var connB = createGene.connection(this, newNode.id, connToSplit.outId);
				connB.setWeight(connToSplit.weight);

				newGenome.addNodeGene(newNode);
				newGenome.addConnectionGene(connA);
				newGenome.addConnectionGene(connB);
			}
		}
		// If should create new connection.
		if (Math.random() < geneConstants.connection.create) {
			var nodeA = geneUtil.getRandomNode(genome);
			var nodeB = geneUtil.getRandomNode(genome);

			var newConnection = createGene.connection(this, nodeA.id, nodeB.id)
			newGenome.addConnectionGene(newConnection);
		}

		// If some connections should be disabled.
		newGenome.connectionGenes.forEach(function(connection) {
			if (Math.random() < geneConstants.connection.disable) {
				connection.setEnabled(!connection.enabled);
			}
		});

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
		genomeA.nodeGenes.forEach(function(node) {
			newGenome.addNodeGene(node);
		});
		genomeB.nodeGenes.forEach(function(node) {
			newGenome.addNodeGene(node);
		});

		if (fitnessA == fitnessB) {
			// Add all disjoint and excess genes.
			var connGenes = {};
			genomeA.connectionGenes.forEach(function(connection) {
				if (genomeB.innovNums[connection.innovNum] != undefined) {
					connGenes[connection.innovNum] = connection;
				} else if (Math.random() > geneConstants.mate.crossover) {
					connGenes[connection.innovNum] = connection;
				}
			});
			genomeB.connectionGenes.forEach(function(connection) {
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
			weakGenome.connectionGenes.forEach(function(connection) {
				connGenes[connection.innovNum] = connection;
			});
			strongGenome.connectionGenes.forEach(function(connection) {
				if (connGenes[connection.innovNum] != undefined) {
					newGenome.addConnectionGene(Math.random() > 0.5 ? connGenes[connection.innovNum] : connection);
				} else {
					newGenome.addConnectionGene(connection);
				}
			});
		}

		return newGenome;
	}

	/**
	 *	Place the genome into its proper species.
	 */
	//speciate(genome) {
	//
	//}

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

		var outputs = [];
		// Reset nodes so they will calculate their values again with the new inputs.
		this.resetNodes();

		// Set all the input node's values.
		for (var i = 0; i < this.inputNodes.length; i++) {
			this.inputNodes[i].setValue(i < inputs.length ? inputs[i] : 0);
		}

		// Calculate Organism's values using its NeruralNetwork.
		for (var i = 0; i < this.outputNodes.length; i++) {
			var outNode = this.outputNodes[i];

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

class Generation {
	constructor(organismList) {
		this.organisms = organismList;
		this.organisms.forEach(function(organism) {
			organism.output = [];
			organism.fitness = 0;
			organism.alive = true;
		});
	}
}

var speciation = {
	compatibilityThreshold: 3,
	excessWeight: 1,
	disjointWeight: 1,
	weightWeight: 0.4,
	normalizingFactor: 1
}

class GenerationManager {
	constructor() {
		// The fitness function to use. Takes an organism and idx.
		// Should return the most current fitness.
		this.fitnessFunction = null;
		// The number of organisms in each generation.
		this.numInGeneration = 10;
		// How many organisms to mate.
		this.matingNum = 4;
		// Num inputs
		this.startingNumInputs = 4;
		// Num outputs
		this.numOutputs = 4;
		// Number of the most fit of all time to keep.
		this.elitism = 1;

		// The current generation.
		this.generation = 0;
		// The previous generation.
		this.curGeneration = null;
		// The most elite organisms so far.
		this.elite = [];
		// Generator
		this.generator = new GeneGenerator();
	}

	setFitnessFunction(func) {
		this.fitnessFunction = func;
		return this;
	}

	setNumInGeneration(num) {
		this.numInGeneration = num;
		return this;
	}

	setMatingNum(num) {
		this.matingNum = num;
		return this;
	}

	setStartingNumInputs(num) {
		this.startingNumInputs = num;
		return this;
	}

	setNumOutputs(num) {
		this.numOutputs = num;
		return this;
	}

	setElitism(num) {
		this.elitism = num;
		return this;
	}

	// Creates the next generation.
	startNextGeneration() {
		var organisms = [];

		// If first generation.
		if (this.generation++ == 0) {
			for (var i = 0; i < this.numInGeneration; i++) {
				organisms.push(new Organism(this.generator.createGenome(this.startingNumInputs, this.numOutputs)));
				organisms[i].generateNetwork(this.numOutputs);
			}

			this.elite = [];
			while(this.elite.length < this.elitism) {
				this.elite.push(organisms[Util.randomInt(0, organisms.length - 1)]);
			}
		} 
		// If any other gernaration.
		else {
			var species = new Speciate();
			this.curGeneration.organisms.forEach(function(organism) {
				species.addSpecies(organism);
			});

			species.adjustFitness();

			this.curGeneration.organisms.sort(sortFunction);

			// Add elite organisms to generation.
			var i = 0;
			while (this.curGeneration.organisms[i].fitness > this.elite[this.elite.length - 1]) {
				this.elite.push(this.curGeneration.organisms[i++]);
				this.elite.sort(sortFunction);
				this.elite.splice(-1);
			}
			this.elite.forEach(function(organism) {
				organisms.push(organism);
			});

			// Mate offspring.
			var i = 0;
			var j = i + 1;
			while (organisms.length < this.numInGeneration) {
				var organismA = this.curGeneration.organisms[i];
				var organismB = this.curGeneration.organisms[j];

				var newGenome = this.generator.mateGenomes(organismA.genome, organismB.genome, organismA.fitness, organismB.fitness);
				var maxInputs = Math.max(organismA.maxInputCount, organismB.maxInputCount);
				newGenome = this.generator.mutateGenome(newGenome, maxInputs, this.numOutputs);
				var child = new Organism(newGenome);

				child.generateNetwork(this.numOutputs);
				organisms.push(child);

				if (++j >= this.matingNum) {
					i = (i + 1) % this.matingNum;
					j = i + 1 % this.matingNum;
				}
			}
		}

		this.curGeneration = new Generation(organisms);
	}

	/**
	 * Get the array of outputs for the current generation. Also tracks their fitness.
	 * @param inputs - Array of array of inputs for each organism in generation.
	 */
	getOutputs(inputs) {
		if (inputs.length != this.curGeneration.organisms.length) {
			throw new Error("Incorrect number of inputs for generation.");
		}

		var outputs = [];
		var fitnessFunction = this.fitnessFunction;

		this.curGeneration.organisms.forEach(function(organism, idx) {
			organism.output = organism.getOutputs(inputs[idx]);
			organism.inputs = inputs[idx];
			if (organism.alive)
				organism.fitness = fitnessFunction(organism, idx);
			outputs.push(organism.output);
		});
		return outputs;
	}

	/**
	 *	If an organism is killed its fitness will stop being updated.
	 */
	killOrganism(organismIdx) {
		this.curGeneration.organisms[organismIdx].alive = false;
	}

	/**
	 * Get an array of all the organisms outputs and fitnesses. Returns value of last getOutputs.
	 */
	 getData() {
	 	return this.curGeneration.organisms.map(function(organism) {
	 		return { "fitness": organism.fitness, "output": organism.output };
	 	});
	 }

}

// sort organisms by fitness.
var sortFunction = function(a, b) {
	if (a.fitness == b.fitness)
		return 0;
	if (a.fitness < b.fitness)
		return 1;
	if (a.fitness > b.fitness)
		return -1;
}

// Organisms should have their fitness.
class Speciate {
	constructor() {
		this.speciesList = [];
	}

	// Returns the species in speciesList that the organism should be added to. null if does not match any.
	getSpecies(organism) {
		for (var i = 0; i < this.speciesList.length; i++) {
			var species = this.speciesList[i];

			//console.log(this.compatibilityDist(species.representative.genome, organism.genome))
			if (this.compatibilityDist(species.representative.genome, organism.genome) < speciation.compatibilityThreshold)
				return species;
		}
		return null;
	}

	/**
	 *  Add the organism to species list.
	 *  Once all organisms are added, use getOrganismsToMate to get the best pairs from each species.
	 */
	addSpecies(organism) {
		var species = this.getSpecies(organism);
		if (species == null) {
			var newSpecies = {"representative": organism, "organisms": [organism]};
			this.speciesList.push(newSpecies);
		}
		else {
			species.organisms.push(organism);
		}
	}

	/**
	 *	Adjusts all organisms' fitness based on species population.
	 */
	adjustFitness() {
		this.speciesList.forEach(function(species) {
			species.organisms.forEach(function(organism) {
				organism.fitness /= species.organisms.length;
			});
		});
	}

	/**
	 *	Returns a list of organism pairs that should mate based on their fitness. Fitness should be included in organisms added.
	 *  @param numOfPairs - total number of pairs that should be returned.
	 *  @param matingNum - the top n number of each species that should be allowed to mate.
	 */
	getOrganismsToMate(numOfPairs, matingNum) {
		this.speciesList.forEach(function(species) {
			species.organisms.sort(sortFunction);
		});

		var matePairs = [];
		var speciesIdx = 0;
		var aIdx = 0;
		var bIdx = aIdx + 1;

		while (matePairs.length < numOfPairs) {
			var organismA = this.speciesList[speciesIdx].organisms[aIdx];
			var organismB = this.speciesList[speciesIdx].organisms[bIdx];

			if (organismA != undefined || organismB != undefined) {
				organismA = organismA != undefined ? organismA : organismB;
				organismB = organismB != undefined ? organismB : organismA;

				var pair = {"A": organismA, "B": organismB};
				matePairs.push(pair);
			}

			if (++speciesIdx >= this.speciesList.length) {
				speciesIdx = 0;
				var bounds = Math.min(matingNum, this.speciesList[speciesIdx].organisms.length);
				if (++bIdx >= bounds) {
					aIdx = (aIdx + 1) % bounds;
					bIdx = (aIdx + 1) % bounds;
				}
			}
		}

		return matePairs;
	}

	compatibilityDist(genomeA, genomeB) {
		var ed = this.getExcessAndDisjoint(genomeA, genomeB);
		var m = this.getMatching(genomeA, genomeB);
		var avgWeightDiff = 0;
		
		for (var i = 0; i < m.A.length; i++) {
			avgWeightDiff += Math.abs(m.A[i].weight - m.B[i].weight);
		}

		avgWeightDiff /= m.A.length > 0 ? m.A.length : 1;
		//console.log(speciation.excessWeight * ed.excess.length + " : " + ed.disjoint.length)

		return speciation.excessWeight * ed.excess.length / speciation.normalizingFactor +
			   speciation.disjointWeight * ed.disjoint.length / speciation.normalizingFactor +
			   speciation.weightWeight * avgWeightDiff;
	}

	getMatching(genomeA, genomeB) {
		var union = {"A": [], "B": []};

		genomeA.connectionGenes.forEach(function(connection) {
			if (genomeB.innovNums[connection.innovNum] != undefined) {
				union.A.push(connection);
			}
		});
		genomeB.connectionGenes.forEach(function(connection) {
			if (genomeA.innovNums[connection.innovNum] != undefined) {
				union.B.push(connection);
			}
		});
	
		return union;
	}

	getExcessAndDisjoint(genomeA, genomeB) {
		// Get intersection of connection Genes.
		var intersectionA = [];
		var intersectionB = [];
		var maxA = -1;
		var minA = Number.MAX_SAFE_INTEGER;
		var maxB = -1;
		var minB = Number.MAX_SAFE_INTEGER;
		genomeA.connectionGenes.forEach(function(connection) {
			if (genomeB.innovNums[connection.innovNum] == undefined) {
				intersectionA.push(connection);
			}
			maxA = connection.innovNum > maxA ? connection.innovNum : maxA;
			minA = connection.innovNum < minA ? connection.innovNum : minA;
		});
		genomeB.connectionGenes.forEach(function(connection) {
			if (genomeA.innovNums[connection.innovNum] == undefined) {
				intersectionB.push(connection);
			}
			maxB = connection.innovNum > maxB ? connection.innovNum : maxB;
			minB = connection.innovNum < minB ? connection.innovNum : minB;
		});

		// Get excess Connections and disjoint Connections.
		var excess = [];
		var disjoint = [];
		intersectionA.forEach(function(connection) {
			if (connection.innovNum > maxB || connection.innovNum < minB) {
				excess.push(connection);
			} else {
				disjoint.push(connection);
			}
		});
		intersectionB.forEach(function(connection) {
			if (connection.innovNum > maxA || connection.innovNum < minA) {
				excess.push(connection);
			} else {
				disjoint.push(connection);
			}
		});

		return {excess: excess, disjoint: disjoint};
	}
}

var gm = new GenerationManager();
var Neat = gm;