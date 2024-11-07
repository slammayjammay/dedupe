import assert from 'assert';
import Dedupe from '../Dedupe.js';

describe('Dedupe', () => {
	it(`can do simple dedupes`, () => {
		const dedupe = new Dedupe();
		dedupe.set(1, 'a');
		dedupe.set(2, 'a');
		dedupe.set(3, 'a');
		dedupe.cleanup();

		assert.equal(dedupe.trees.size, 1);
		assert.equal(dedupe.trees.get('a').root.serial, 'a');
		assert.equal(dedupe.trees.get('a').children.size, 2);
		assert.equal(dedupe.trees.get('a').children.has(1), false);
	});

	it(`ignores ids if serial is unchanged`, () => {
		const dedupe = new Dedupe();
		dedupe.set(1, 'a');
		dedupe.set(1, 'a');
		dedupe.set(2, 'a');
		dedupe.set(2, 'a');
		dedupe.cleanup();

		assert.equal(dedupe.trees.size, 1);
		assert.equal(dedupe.trees.get('a').root.id, 1);
		assert.equal(dedupe.trees.get('a').children.size, 1);
		assert.equal(dedupe.trees.get('a').children.get(2).id, 2);
	});

	it(`can create new trees`, () => {
		const dedupe = new Dedupe();
		dedupe.set(1, 'a');
		dedupe.set(2, 'b');
		dedupe.cleanup();

		assert.equal(dedupe.trees.size, 2);
		assert.equal(dedupe.trees.get('a').root.id, 1);
		assert.equal(dedupe.trees.get('b').root.id, 2);
	});

	it(`can swap a child's serial to a new tree`, () => {
		const dedupe = new Dedupe();
		for (let i = 0; i < 5; i++) dedupe.set(i, 'a');
		dedupe.set(1, 'b');
		dedupe.cleanup();

		assert.equal(dedupe.trees.size, 2);
		assert.equal(dedupe.trees.get('a').root.id, 0);
		assert.equal(dedupe.trees.get('a').children.size, 3);
		assert.equal(dedupe.trees.get('b').children.size, 0);
		assert.equal(dedupe.trees.get('b').root.id, 1);
	});

	it(`can swap a child's serial to an existing tree`, () => {
		const dedupe = new Dedupe();
		dedupe.set(1, 'a');
		dedupe.set(2, 'a');
		dedupe.set(3, 'b');
		dedupe.set(2, 'b');
		dedupe.cleanup();

		assert.equal(dedupe.trees.size, 2);
		assert.equal(dedupe.trees.get('b').root.id, 3);
		assert.equal(dedupe.trees.get('b').children.size, 1);
		assert.equal(dedupe.trees.get('b').children.has(2), true);
	});

	it(`can swap a root's serial to a new tree`, () => {
		const dedupe = new Dedupe();
		dedupe.set(1, 'a');
		dedupe.set(2, 'a');
		dedupe.set(1, 'b');
		dedupe.cleanup();

		assert.equal(dedupe.trees.size, 2);
		assert.equal(dedupe.trees.get('a').root.id, 2);
		assert.equal(dedupe.trees.get('b').root.id, 1);
		assert.equal(dedupe.trees.get('a').children.size, 0);
		assert.equal(dedupe.trees.get('b').children.size, 0);
	});

	it(`can swap a root's serial to an existing tree`, () => {
		const dedupe = new Dedupe();
		dedupe.set(1, 'a');
		dedupe.set(2, 'a');
		dedupe.set(3, 'b');
		dedupe.set(1, 'b');
		dedupe.cleanup();

		assert.equal(dedupe.trees.size, 2);
		assert.equal(dedupe.trees.get('a').root.id, 2);
		assert.equal(dedupe.trees.get('b').root.id, 3);
		assert.equal(dedupe.trees.get('b').children.size, 1);
		assert.equal(dedupe.trees.get('b').children.has(1), true);
	});

	it(`can swap a root's serial to an existing tree`, () => {
		const dedupe = new Dedupe();
		dedupe.set(1, 'a');
		dedupe.set(2, 'a');
		dedupe.set(3, 'b');
		dedupe.set(1, 'b');
		dedupe.cleanup();

		assert.equal(dedupe.trees.size, 2);
		assert.equal(dedupe.trees.get('a').root.id, 2);
		assert.equal(dedupe.trees.get('b').root.id, 3);
		assert.equal(dedupe.trees.get('b').children.size, 1);
		assert.equal(dedupe.trees.get('b').children.has(1), true);
	});
});
