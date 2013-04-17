//search.spec.js

var db = {};
db.search = require("../src/search.js").search;

describe('search.js', function() {

	//does not test the returned internals; any problem would trickle into findIndexRangeForVal 
	describe('binarySearch', function () {

		it('should be true - no lower/upper, first element', function() {
			expect(db.search.binarySearch([-50,0,45,90,100],-50).found).toBe(true);
		});

		it('should be true - no lower/upper, last element', function() {
			expect(db.search.binarySearch([-50,0,45,90,100],100).found).toBe(true);
		});

		it('should be true - no lower/upper, mid element', function() {
			expect(db.search.binarySearch([-50,0,45,90,100],90).found).toBe(true);
		});

		it('should be false - no lower/upper, after range', function() {
			expect(db.search.binarySearch([-50,0,45,90,100],101).found).toBe(false);
		});

		it('should be false - no lower/upper, before range', function() {
			expect(db.search.binarySearch([-50,0,45,90,100],-55).found).toBe(false);
		});

		it('should be false - no lower/upper, within range', function() {
			expect(db.search.binarySearch([-50,0,45,90,100],49).found).toBe(false);
		});
	
	});

	//does not test the returned internals; any problem would trickle into findIndexRangeForValRange
	//or into IndexedNumericalColumn 
	describe('findIndexRangeForVal', function () {

		it('should be {"found": true, "firstIndex": 0, "lastIndex": 0} - first element, singular, no pastResult', function() {
			expect(db.search.findIndexRangeForVal([-50,0,45,90,100],-50))
				.toEqual({"found": true, "firstIndex": 0, "lastIndex": 0});
		});

		it('should be {"found": true, "firstIndex": 0, "lastIndex": 1} - first element, multiple, no pastResult', function() {
			expect(db.search.findIndexRangeForVal([-50,-50,0,45,90,100],-50))
				.toEqual({"found": true, "firstIndex": 0, "lastIndex": 1});
		});

		it('should be {"found": true, "firstIndex": 5, "lastIndex": 5} - last element, singular, no pastResult', function() {
			expect(db.search.findIndexRangeForVal([-50,-50,0,45,90,100],100))
				.toEqual({"found": true, "firstIndex": 5, "lastIndex": 5});
		});

		it('should be {"found": true, "firstIndex": 5, "lastIndex": 6} - last element, multiple, no pastResult', function() {
			expect(db.search.findIndexRangeForVal([-50,-50,0,45,90,100,100],100))
				.toEqual({"found": true, "firstIndex": 5, "lastIndex": 6});
		});

		it('should be {"found": true, "firstIndex": 3, "lastIndex": 3} - central element, singular, no pastResult', function() {
			expect(db.search.findIndexRangeForVal([-50,-50,0,45,90,100],45))
				.toEqual({"found": true, "firstIndex": 3, "lastIndex": 3});
		});

		it('should be {"found": true, "firstIndex": 3, "lastIndex": 4} - central element, multiple, no pastResult', function() {
			expect(db.search.findIndexRangeForVal([-50,-50,0,45,45,90,100],45))
				.toEqual({"found": true, "firstIndex": 3, "lastIndex": 4});
		});

		it('should be {"found": false, "firstIndex": -1, "lastIndex": 0} - below range, no pastResult', function() {
			expect(db.search.findIndexRangeForVal([-50,-50,0,45,45,90,100],-55))
				.toEqual({"found": false, "firstIndex": -1, "lastIndex": 0});
		});

		it('should be {"found": false, "firstIndex": 6, "lastIndex": 7} - above range, no pastResult', function() {
			expect(db.search.findIndexRangeForVal([-50,-50,0,45,45,90,100],155))
				.toEqual({"found": false, "firstIndex": 6, "lastIndex": 7});
		});

		it('should be {found: false, firstIndex: 4, lastIndex: 5} - within range but not present, no pastResult', function() {
			expect(db.search.findIndexRangeForVal([-50,-50,0,45,45,90,100],45.5))
				.toEqual({found: false, firstIndex: 4, lastIndex: 5});
		});

	});

	describe('findIndexRangeForValRange', function () {

		var pr = null;
		it('should be {"firstIndex": 0, "lastIndex": 4} - full span, singular on both sides, no pastResult', function() {
			expect(pr = db.search.findIndexRangeForValRange([-50,0,45,90,100],-50,100))
				.toEqual({"firstIndex": 0, "lastIndex": 4});
		});

		it('should be {"firstIndex": 0, "lastIndex": 4} - full span, singular on both sides, pastResult of no change', function() {
			expect(db.search.findIndexRangeForValRange([-50,0,45,90,100],-50,100,pr.firstIndex,pr.lastIndex))
				.toEqual({"firstIndex": 0, "lastIndex": 4});
		});

		it('should be {"firstIndex": 0, "lastIndex": 3} - same start, smaller end, singular on both sides, with pastResult', function() {
			expect(db.search.findIndexRangeForValRange([-50,0,45,90,100],-50,90,pr.firstIndex,pr.lastIndex))
				.toEqual({"firstIndex": 0, "lastIndex": 3});
		});

		it('should be {"firstIndex": 1, "lastIndex": 3} - larger start, smaller end, singular on both sides, with pastResult', function() {
			expect(db.search.findIndexRangeForValRange([-50,0,45,90,100],0,90,pr.firstIndex,pr.lastIndex))
				.toEqual({"firstIndex": 1, "lastIndex": 3});
		});

		it('should be {"firstIndex": 2, "lastIndex": 2} - not present but within range, with pastResult', function() {
			expect(db.search.findIndexRangeForValRange([-50,0,45,90,100],5,47,pr.firstIndex,pr.lastIndex))
				.toEqual({"firstIndex": 2, "lastIndex": 2});
		});

		it('should be false - not present, both below range, no pastResult', function() {
			expect(db.search.findIndexRangeForValRange([-50,0,45,90,100],-100,-55))
				.toBe(false);
		});

		it('should be false - not present, both above range, no pastResult', function() {
			expect(db.search.findIndexRangeForValRange([-50,0,45,90,100],110,155))
				.toBe(false);
		});

		it('should be {"firstIndex": 0, "lastIndex": 4} - not present, start below range, end above range, no pastResult', function() {
			expect(db.search.findIndexRangeForValRange([-50,0,45,90,100],-55,155))
				.toEqual({"firstIndex": 0, "lastIndex": 4});
		});

		it('should be {"firstIndex": 0, "lastIndex": 3} - not present, start below range, end within range, no pastResult', function() {
			expect(db.search.findIndexRangeForValRange([-50,0,45,90,100],-55,95))
				.toEqual({"firstIndex": 0, "lastIndex": 3});
		});

		it('should be {"firstIndex": 0, "lastIndex": 4} - not present, start within range, end above range, no pastResult', function() {
			expect(db.search.findIndexRangeForValRange([-50,0,45,90,100],-50,110))
				.toEqual({"firstIndex": 0, "lastIndex": 4});
		});

	});

});

