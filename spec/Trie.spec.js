//Trie.spec.js

var db = {};
db.Trie = require("../src/Trie").Trie;

describe('Trie.js', function() {

	var t = null;

	beforeEach(function() {
		t = new db.Trie();
		t.addWord("hello", 1);
		t.addWord("hi", 2);
		t.addWord("him", 3);
		t.addWord("history", 4);
		t.addWord("him", 5);

		function arrEq(arr1, arr2) {
			
			if(arr1.length !== arr2.length) return false;

			for(var i = 0, n = arr1.length; i < n; i++)
				if(arr1[i] !== arr2[i]) return false;

			return true;
		}

		this.addMatchers({

		    toContainSameElements: function(expected) {
		      return arrEq(this.actual.sort(), expected.sort());
		    }

		  });
	});

	describe('after additions', function() {

		it('should be [2] - exact search for word that exists once', function() {
			expect(t.findWord("hi", true)).toContainSameElements([2]);
		});

		it('should be [2,3,4,5] - search for present prefix', function() {
			expect(t.findWord("hi", false)).toContainSameElements([2,3,4,5]);
		});

		it('should be [3,5] - exact search for word that is present twice', function() {
			expect(t.findWord("him", false)).toContainSameElements([3,5]);
		});

		it('should be [] - exact search for word that is not present', function() {
			expect(t.findWord("his", true)).toContainSameElements([]);
		});

		it('should be [] - search for prefix that is not present', function() {
			expect(t.findWord("ha", false)).toContainSameElements([]);
		});
	});

	describe('after deletions', function() {
		
		it('should be [] - exact search for deleted word', function() {
			t.deleteWord("hi", 2);
			expect(t.findWord("hi", true)).toContainSameElements([]);
		});

		it('should be [] - exact search for word with same prefix as deleted word', function() {
			t.deleteWord("hi", 2);
			expect(t.findWord("him", true)).toContainSameElements([3,5]);
		});

		it('should be [] - exact search for word with same prefix as deleted word', function() {
			t.deleteWord("hi", 2);
			expect(t.findWord("him", true)).toContainSameElements([3,5]);
		});

		it('should be [5] - exact search for word after deleting its twin', function() {
			t.deleteWord("him", 3);
			expect(t.findWord("him", true)).toContainSameElements([5]);
		});

		it('should be [] - exact search for word after deleting both versions', function() {
			t.deleteWord("him", 3);
			t.deleteWord("him", 5);
			expect(t.findWord("him", true)).toContainSameElements([]);
		});

		it('should be [] - exact search for word after (trying to) delete but with wrong obj num', function() {
			t.deleteWord("hi", 88);
			expect(t.findWord("hi", true)).toContainSameElements([2]);
		});

		it('should be [] - exact search for word in emptied trie', function() {
			t.deleteWord("hello", 1);
			t.deleteWord("hi", 2);
			t.deleteWord("him", 3);
			t.deleteWord("history", 4);
			t.deleteWord("him", 5);
			expect(t.findWord("hi", true)).toContainSameElements([]);
		});
	});
});
