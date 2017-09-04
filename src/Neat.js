const Util = require('./Util');
const NodeType = require('./NodeType');
const NodeGene = require('./NodeGene');
const ConnectionGene = require('./ConnectionGene');
const Organism = require('./Organism');
const Genome = require('./Genome');
const Species = require('./Species');
const GeneGenerator = require('./GeneGenorator');
const Generation = require('./Generation');

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
		this.elite = null;
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
		console.log(this.speciesList.length)
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


module.exports = Neat;












