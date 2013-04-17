//TextIndex.spec.js

var db = {};
db.TextIndex = require("../src/TextIndex").TextIndex;

describe('TextIndex.js', function() {

	var ss = ["Boring sentences are just as useful as interesting ones.",
			  "Boredom is not, of course, what this is really about.",
			  "Though, I do think that writing tests is rather boring"];
	var itc = new db.TextIndex(ss, "itc");

	describe('select', function() {

		it('should be [1] - same case, appears once', function() {
			expect(itc.select("Boredom")).toEqual([1]);
		});

		it('should be [1] - different case, appears once', function() {
			expect(itc.select("boredom")).toEqual([1]);
		});

		it('should be [0, 2] - diffent case, appears multiple times', function() {
			expect(itc.select("boring")).toEqual([0, 2]);
		});

		it('should be [] - non-existent word', function() {
			expect(itc.select("hello")).toEqual([]);
		});

		//Is the treatment of prefixes clearly right?
		it('should be [2] - non-existent word that is prefix of existent word', function() {
			expect(itc.select("writ")).toEqual([2]);
		});

		it('should be [0, 1, 2] - non-existent word that is prefix of multiple existent words', function() {
			expect(itc.select("bor")).toEqual([0, 1, 2]);
		});
	});

/* should test for the "rather bori" vs "bori rather" difference */
/* this should also test the various optional arguments */

});
