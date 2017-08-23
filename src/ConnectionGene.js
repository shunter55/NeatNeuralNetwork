
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

module.exports = ConnectionGene;