
// Represents an Organism. Add genes to the organism, then generate its network.
class Genome {
	constructor() {
		// All Genes used to create the Organism initially.
		this.nodeGenes = [];
		this.connectionGenes = [];
	}

	// ADD GENES.
	addNodeGene(nodeGene) {
		this.nodeGenes.push(nodeGene);
	}
	addConnectionGene(connectionGene) {
		this.connectionGenes.push(this.connectionGenes);
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
		nodeGenes.forEach(function (nodeGene) {
			newGenome.addNodeGene(nodeGene.copy());
		});
		connectionGenes.forEach(function (connGene) {
			newGenome.addConnectionGene(connGene.copy());
		});
		return newGenome;
	}
}




module.exports = Genome;


















