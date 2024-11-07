// Simple example: you need to render a video (expensive operation), the same
// video, in a list showcasing different video dimensions, small medium large
// etc. If your list involves many videos at the same dimensions, it's better
// to render 1 video and reuse it rather than rendering X number of videos.
// Let's also say some sort of state changes and now you have the same number
// of videos to render, but each video unexpectedly changes to an unknown
// dimension. This class can be used to render the fewest videos for each state
// change.
//
// Solution for simple example: assign a unique id and a "serial" to each list
// item, where identical serials between items means the expensive operation
// can be shared between all items of the same serial. In the video example
// above, the serial can be the dimensions "400x500". Provide this class an
// id+serial pair for each item and it will do the rest of the deduping.
//
// Call `set()` to add a new id+serial pair or denote a change to an existing
// one.
//
// Call `delete()` to remove an id.
//
// `set()` and `delete()` will not immediately change internal state only
// records changes as todo. Call `cleanup()` to implement the changes.
//
// Call `recalculate()` to throw away pending changes and calculate internal
// state from scratch.
export default class Dedupe {
	constructor() {
		this.map = new Map(); // id -> Node
		this.trees = new Map(); // serial -> Tree
		this.changes = []; // { change: 'add|delete', id, serial }
	}

	createTree(serial) {
		return { serial, root: null, children: new Map() };
	}

	createNode(id, serial) {
		return { id, serial };
	}

	isRoot(id) {
		const node = this.map.get(id);
		return node && this.trees.get(node.serial)?.root === node;
	}

	set(id, serial) {
		this.changes.push({ change: 'add', id, serial });
	}

	delete(id) {
		this.changes.push({ change: 'delete', id });
	}

	cleanup() {
		while (this.changes.length) {
			const { change, id, serial } = this.changes.shift();

			if (change === 'add') {
				this.addNode(id, serial);
			} else if (change === 'delete') {
				this.deleteNode(id);
			}
		}
	}

	addNode(id, serial) {
		const exists = this.map.has(id);
		const node = exists ? this.map.get(id) : this.createNode(id, serial);

		// when a serial changes for an id, delete it and add it back in
		exists && serial !== node.serial && this.changes.unshift(
			{ change: 'delete', ...node },
			{ change: 'add', id: node.id, serial }
		);

		if (exists) return;

		this.map.set(id, node);

		const treeExists = this.trees.has(node.serial);
		!treeExists && this.trees.set(node.serial, this.createTree(serial));

		const tree = this.trees.get(node.serial);
		!treeExists ? (tree.root = node) : tree.children.set(node.id, node);
	}

	deleteNode(id) {
		if (!this.map.has(id)) return false;

		const node = this.map.get(id);

		if (this.isRoot(node.id)) {
			Array.from(this.trees.get(node.serial).children.values()).forEach(node => {
				this.map.delete(node.id);
				this.changes.unshift({ change: 'add', ...node });
			});
			this.trees.delete(node.serial);
		} else {
			this.trees.get(node.serial).children.delete(node.id);
		}

		this.map.delete(id);
	}

	recalculate() {
		const nodes = Array.from(this.map.values());
		this.map.clear();
		this.trees.clear();
		this.changes.splice(0, this.changes.length, nodes.map(n => ({ change: 'add', ...n })));
		this.cleanup();
	}

	destroy() {
		this.map = this.trees = this.changes = null;
	}
}
