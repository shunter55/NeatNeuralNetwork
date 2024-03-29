// equal, deepEqual, notEqual
const Assert = require('assert')

const Util = require('./Util');
const NodeType = require('./NodeType');
const NodeGene = require('./NodeGene');
const ConnectionGene = require('./ConnectionGene');
const Organism = require('./Organism');
const Genome = require('./Genome');
const Species = require('./Species');
const GeneGeneratior = require('./GeneGenorator');
const Neat = require('./Neat');

var xorFitness = function(outputs) {
	var scaler = 100;
	return (scaler * (-outputs[0])) + (-scaler * (1 - outputs[1])) + (-scaler * (1 - outputs[2])) + (scaler * (-outputs[3]));
}

var Tests = {
	testGeneGenerator: function() {
		var generator = new GeneGeneratior();

		// Create 25 Organisms.
		var organisms = [];
		for (var i = 0; i < 10; i++) {
			organisms.push(new Organism(generator.createGenome(4, 4)));
			organisms[i].generateNetwork(4);
		}

		for (var generation = 0; generation < 30; generation++) {
			// Get their outputs.
			var inputs = [0, 1, 1, 0];
			organisms.forEach(function(organism, i) {
				var outputs = organism.getOutputs(inputs);
				var fitness = xorFitness(outputs);
				organism.fitness = fitness;
				//console.log("fitness: " + fitness + " : " + outputs);
			});

			// sort organisms by fitness.
			var sortFunction = function(a, b) {
				if (a.fitness == b.fitness)
					return 0;
				if (a.fitness < b.fitness)
					return 1;
				if (a.fitness > b.fitness)
					return -1;
			}

			organisms.sort(sortFunction);

			var children = [];
			for (var i = 0; i < 5; i++) {
				for (var j = i + 1; j < 5; j++) {
					var newGenome = generator.mateGenomes(organisms[i].genome, organisms[j].genome, organisms[i].fitness, organisms[j].fitness);
					newGenome = generator.mutateGenome(newGenome, 4, 4);
					var child = new Organism(newGenome);

					child.generateNetwork(4);
					children.push(child);
				}
			}
			organisms = children;
		}

		organisms.forEach(function(organism, i) {
			var outputs = organism.getOutputs(inputs);
			var fitness = xorFitness(outputs);
			organism.fitness = fitness;
			console.log("fitness: " + fitness + " : " + outputs);
		});
	},

	testNeat: function() {
		var numInGeneration = 10;
		var numGenerations = 30;

		Neat.setFitnessFunction(xorFitness)
			.setNumInGeneration(numInGeneration)
			.setMatingNum(3)
			.setStartingNumInputs(4)
			.setNumOutputs(4);

		var inputs = [0, 1, 1, 0];
		var generationInputs = [];
		for (var i = 0; i < numInGeneration; i++) {
			generationInputs.push(inputs);
		}

		for (var i = 0; i < numGenerations; i++) {
			Neat.startNextGeneration();
			var outputs = Neat.getOutputs(generationInputs);
		}

		Neat.startNextGeneration();
		var outputs = Neat.getOutputs(generationInputs);
		var data = Neat.getData();
		data.forEach(function (data) {
			console.log(data);
		});
	},

	testAll: function() {
		//this.testGeneGenerator();
		this.testNeat();
	}
}



Tests.testAll();
