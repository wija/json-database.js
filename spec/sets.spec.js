//sets.spec.js

var db = {};
db.sets = require("../src/sets.js").sets;

describe('sets.js', function() {

	describe('intersection', function () {

		it('should be [95,99,1000] - identical/full', function() {
			expect(db.sets.intersection([95,99,1000],[95,99,1000])).toEqual([95,99,1000]);
		});

		it('should be [99,145] - central/overlap', function() {
			expect(db.sets.intersection([95,99,145,1000],[99,145])).toEqual([99,145]);
		});

		it('should be [95,99,145] - identical on left', function() {
			expect(db.sets.intersection([95,99,145,1000],[95,99,145])).toEqual([95,99,145]);
		});

		it('should be [99,145,1000] - identical on right', function() {
			expect(db.sets.intersection([95,99,145,1000],[99,145,1000])).toEqual([99,145,1000]);
		});

		it('should be [] - full/no overlap', function() {
			expect(db.sets.intersection([95,99,145,1000],[1,45,1030])).toEqual([]);
		});

		it('should be [] - second empty', function() {
			expect(db.sets.intersection([95,99,145,1000],[])).toEqual([]);
		});

		it('should be [] - first empty', function() {
			expect(db.sets.intersection([],[95,99,145,1000])).toEqual([]);
		});

		it('should be [] - both empty', function() {
			expect(db.sets.intersection([],[])).toEqual([]);
		});
	});

	describe('union', function () {

		it('should be [95,99,1000] - identical/full', function() {
			expect(db.sets.union([95,99,1000],[95,99,1000])).toEqual([95,99,1000]);
		});

		it('should be [95,99,145,1000] - second part of first', function() {
			expect(db.sets.union([95,99,145,1000],[99,145])).toEqual([95,99,145,1000]);
		});
		
		it('should be [95,99,145,1000] - first part of second', function() {
			expect(db.sets.union([99,145],[95,99,145,1000])).toEqual([95,99,145,1000]);
		});

		it('should be [1,45,95,99,145,1000,1030] - full/no overlap', function() {
			expect(db.sets.union([95,99,145,1000],[1,45,1030])).toEqual([1,45,95,99,145,1000,1030]);
		});

		it('should be [95,99,145,1000] - second empty', function() {
			expect(db.sets.union([95,99,145,1000],[])).toEqual([95,99,145,1000]);
		});

		it('should be [95,99,145,1000] - first empty', function() {
			expect(db.sets.union([],[95,99,145,1000])).toEqual([95,99,145,1000]);
		});

		it('should be [] - both empty', function() {
			expect(db.sets.union([],[])).toEqual([]);
		});
	});

	describe('complement', function () {

		it('should be [] - identical/full', function() {
			expect(db.sets.complement([95,99,1000],[95,99,1000])).toEqual([]);
		});

		it('should be [] - second part of first', function() {
			expect(db.sets.complement([95,99,145,1000],[99,145])).toEqual([]);
		});
		
		it('should be [95,1000] - first part of second', function() {
			expect(db.sets.complement([99,145],[95,99,145,1000])).toEqual([95,1000]);
		});

		it('should be [1,45,1030] - full/no overlap', function() {
			expect(db.sets.complement([95,99,145,1000],[1,45,1030])).toEqual([1,45,1030]);
		});

		it('should be [] - second empty', function() {
			expect(db.sets.complement([95,99,145,1000],[])).toEqual([]);
		});

		it('should be [95,99,145,1000] - first empty', function() {
			expect(db.sets.complement([],[95,99,145,1000])).toEqual([95,99,145,1000]);
		});

		it('should be [] - both empty', function() {
			expect(db.sets.complement([],[])).toEqual([]);
		});
	});

	//returns [elements in sArr2 not in sArr1, elements in sArr1 not in sArr2]

	describe('complements', function () {

		it('should be [[],[]] - identical/full', function() {
			expect(db.sets.complements([95,99,1000],[95,99,1000])).toEqual([[],[]]);
		});

		it('should be [[],[95,1000]] - second part of first', function() {
			expect(db.sets.complements([95,99,145,1000],[99,145])).toEqual([[],[95,1000]]);
		});
		
		it('should be [[95,1000],[]] - first part of second', function() {
			expect(db.sets.complements([99,145],[95,99,145,1000])).toEqual([[95,1000],[]]);
		});

		it('should be [[1,45,1030],[95,99,145,1000]] - full/no overlap', function() {
			expect(db.sets.complements([95,99,145,1000],[1,45,1030])).toEqual([[1,45,1030],[95,99,145,1000]]);
		});

		it('should be [[],[95,99,145,1000]] - second empty', function() {
			expect(db.sets.complements([95,99,145,1000],[])).toEqual([[],[95,99,145,1000]]);
		});

		it('should be [[95,99,145,1000],[]] - first empty', function() {
			expect(db.sets.complements([],[95,99,145,1000])).toEqual([[95,99,145,1000],[]]);
		});

		it('should be [[],[]] - both empty', function() {
			expect(db.sets.complements([],[])).toEqual([[],[]]);
		});
	});

});

