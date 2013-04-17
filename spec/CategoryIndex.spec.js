//CategoryIndex.spec.js

var db = {};
db.CategoryIndex = require("../src/CategoryIndex").CategoryIndex;

describe('CategoryIndex.js', function() {

	var arr = ["a","b","c","a","a","b","c","c"];
	//INDICES:  0   1   2   3   4   5   6   7
	var icc = new db.CategoryIndex(arr);

	describe('select', function() {

		it('should be [0,3,4] - category appears once, no pastResult', function() {
			expect(icc.select({any: ["a"]})).toEqual([0,3,4]);
		});

		it('should be [0,1,3,4,5] - add category to pastResult', function() {
			expect(icc.select({any: ["a","b"]})).toEqual([0,1,3,4,5]);
		});

		it('should be [1,5] - remove category from pastResult', function() {
			expect(icc.select({any: ["b"]})).toEqual([1,5]);
		});

		it('should be [] - remove final category from pastResult', function() {
			expect(icc.select({any: []})).toEqual([]);
		});

		it('should be [0,1,2,3,4,5,6,7] - add three categories', function() {
			expect(icc.select({any: ["a","b","c"]})).toEqual([0,1,2,3,4,5,6,7]);
		});

		it('should be [2,6,7] - go down to one category', function() {
			expect(icc.select({any: ["c"]})).toEqual([2,6,7]);
		});
	});

	it('should be ["a","b","c"] - getValues', function() {
		expect(icc.getValues()).toEqual(["a","b","c"]);
	});
});
