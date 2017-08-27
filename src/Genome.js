
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
		if (this.innovNums[nodeGene.id] == undefined) {
			this.nodeGenes.push(nodeGene);
			this.innovNums[nodeGene.id] = true;
		}
	}
	addConnectionGene(connectionGene) {
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

module.exports = Genome;


















