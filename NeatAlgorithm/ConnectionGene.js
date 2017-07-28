
class ConnectionGene {
	constructor(inId, outId, innovNum) {
		this.inId = inId;
		this.outId = outId;
		this.weight = Math.random();
		this.enabled = true;
		this.innovNum = innovNum;
	}

	setWeight(weight) {
		this.weight = weight;
	}

	setEnabled(enabled) {
		this.enabled = enabled;
	}
}

module.exports = ConnectionGene;