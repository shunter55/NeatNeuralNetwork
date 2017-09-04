
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

module.exports = Generation;