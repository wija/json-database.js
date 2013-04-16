//NumberIndex.spec.js


var jsonDatabase = {};
jsonDatabase.NumberIndex = require("../src/NumberIndex").NumberIndex;

describe('NumberIndex.js', function() {

	var inc = new jsonDatabase.NumberIndex([9,3,7,8,0,5,1,2,"4",4,8,6]); //note double 8, double 4

	describe('select', function() {

		//[9, 3, 7, 8, 0, 5, 1, 2, 4, 4, 8, 6]
		//[0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11] (indices)

		it('should be {"all": [1,7], "enter": [1, 7], "exit": []} - central, non-duplicates, no pastResult ', function() {
			expect(inc.select(2,3)).toEqual([1,7]);
		});

		//PR NOW EQUALS {"all": [1,7], "enter": [1, 7], "exit": []}

		it('should be {"all": [1,7], "enter": [], "exit": []} - central, non-duplicates, identical pastResult ', function() {
			expect(inc.select(2,3)).toEqual([1,7]);
		});

		it('should be {"all": [1,7], "enter": [], "exit": []} - extend pastResult to right, including duplicates', function() {
			expect(inc.select(2,4)).toEqual([1,7,8,9]);
		});

		it('should be {"all": [1,6,7], "enter": [6], "exit": []} - extend pastResult to left', function() {
			expect(inc.select(1,3)).toEqual([1,6,7]);
		});

		it('should be {"all": [1,6,7,8,9], "enter": [6,8,9], "exit": []} - extend pastResult to left and right', function() {
			expect(inc.select(1,4)).toEqual([1,6,7,8,9]);
		});

		//NOTE THAT PR CHANGES HERE; IS NOW {"all": [1,6,7,8,9], "enter": [6,8,9], "exit": []}

		it('should be {"all": [1,8,9], "enter": [], "exit": [6,7]} - restrict pastResult from left', function() {
			expect(inc.select(3,4)).toEqual([1,8,9]);
		});

		it('should be {"all": [1,6,7], "enter": [], "exit": [8,9]} - restrict pastResult from right', function() {
			expect(inc.select(1,3)).toEqual([1,6,7]);
		});

		it('should be {"all": [1,7], "enter": [], "exit": [6,8,9]} - restrict pastResult from left and right', function() {
			expect(inc.select(2,3)).toEqual([1,7]);
		});

		//PR CHANGES HERE: {"all": [1,7], "enter": [], "exit": [6,8,9]}

		it('should be {"all": [1,5,8,9], "enter": [5,8,9], "exit": [7]} - extend pastResult (with exit) from right, restrict from left', function() {
			expect(inc.select(3,5)).toEqual([1,5,8,9]);
		});

		//PR CHANGES HERE: {"all": [1,5,8,9], "enter": [5,8,9], "exit": [7]}

		it('should be {"all": [8,9], "enter": [], "exit": [1,5]} - restrict pastResult (with exit and enter) from both sides', function() {
			expect(inc.select(4,4)).toEqual([8,9]);
		});

		it('should be {"all": [], "enter": [], "exit": [1,5,8,9]} - range falling between values to restrict pastResult (with exit and enter)', function() {
			expect(inc.select(5.5,5.7)).toEqual([]);
		});

		it('should be {"all": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11], "enter": [0, 2, 3, 4, 6, 7, 10, 11], "exit": []} - extend pastResult (with exit) from right, restrict from left', function() {
			expect(inc.select(-50,100)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,11]);
		});

		//PR NOW: {"all": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11], "enter": [0, 2, 3, 4, 6, 7, 10, 11], "exit": []}
		it('should be {"all": [0, 2, 3, 10], "enter": [], "exit": [1, 4, 5, 6, 7, 8, 9, 11]} - restrict from left (with non-present value), keep right beyond range, ', function() {
			expect(inc.select(6.5, 200)).toEqual([0, 2, 3, 10]);
		});

		//PR NOW: {"all": [0, 2, 3, 10], "enter": [], "exit": [1, 4, 5, 6, 7, 8, 9, 11]}
		it('should be {"all": [2, 3, 10, 11], "enter": [11], "exit": [0]} - restrict from both sides (with non-present values)', function() {
			expect(inc.select(5.5, 8.5)).toEqual([2, 3, 10, 11]);
		});

		//PR NOW: {"all": [2, 3, 10, 11], "enter": [11], "exit": [0]}
		it('should be {"all": [2, 3, 10, 11], "enter": [], "exit": []} - change values but without changing what should return', function() {
			expect(inc.select(5.6, 8.3)).toEqual([2, 3, 10, 11]);
		});

		it('should be {"all": [2, 3, 10, 11], "enter": [], "exit": []} - change values but without changing what should return', function() {
			expect(inc.select(5.4, 8.2)).toEqual([2, 3, 10, 11]);
		});

		it('should be {"all": [], "enter": [], "exit": [2, 3, 10, 11]} - both below range', function() {
			expect(inc.select(-5, -1)).toEqual([]);
		});

		it('should be {"all": [], "enter": [], "exit": [2, 3, 10, 11]} - both above range', function() {
			expect(inc.select(15, 20)).toEqual([]);
		});

		//PR NOW: {"all": [], "enter": [], "exit": [2, 3, 10, 11]}
		it('should be {"all": [5, 8, 9], "enter": [], "exit": []} - move from both above range to both in range', function() {
			expect(inc.select(4, 5)).toEqual([5, 8, 9]);
		});

		it('should be {"all": [], "enter": [], "exit": []} - move from both above range to both below range', function() {
			expect(inc.select(-1, -1)).toEqual([]);
		});

		it('should be {"all": [], "enter": [], "exit": []} - move from both above range to both below range', function() {
			expect(inc.select(-10, -5)).toEqual([]);
		});

		//PR NOW: {"all": [], "enter": [], "exit": []}
		it('should be {"all": [5, 8, 9], "enter": [], "exit": []} - move from both below range to both in range', function() {
			expect(inc.select(4, 5)).toEqual([5, 8, 9]);
		});

		it('should be {"all": [], "enter": [], "exit": []} - move from both below range to both above range', function() {
			expect(inc.select(10, 10)).toEqual([]);
		});

	});
});

