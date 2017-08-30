
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

module.exports = Species;