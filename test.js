// equal, deepEqual, notEqual
const Assert = require('assert')

const NodeType = require('./NodeType');
const Node = require('./NodeGene');
const Connection = require('./ConnectionGene');
const Genome = require('./Genome');

// Test add.
var g = new Genome();
var n = new Node(1, NodeType.sensor);

g.addNode(n);

Assert.equal(g.nodeCount, 1);

