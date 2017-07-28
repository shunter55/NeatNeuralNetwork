
class NodeGene {
	constructor(id, nodeType) {
		this.id = id;
		this.type = nodeType;
		// Only for input/output genes. The index in an organism's inputs/outputs that should be used.
		// idx must be valid for an output node.
		this.idx = null;
	}
}

module.exports = NodeGene;