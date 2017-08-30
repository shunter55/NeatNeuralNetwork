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

		// Get their outputs.
		var inputs = [0, 1, 1, 0];
		organisms.forEach(function(organism) {
			var outputs = organism.getOutputs(inputs);
			console.log(outputs)
			var fitness = xorFitness(outputs);
			console.log(i + ": " + outputs + " fitness: " + fitness);
		});

	},

	testAll: function() {
		this.testGeneGenerator();
	}
}

Tests.testAll();
