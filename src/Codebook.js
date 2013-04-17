//Codebook.js

;(function(exports) {

    function Codebook(codebook) {

        this.codebook = codebook;

        this.reverseCodebook = {};
        
        for(var h in this.codebook) {
        	if(this.codebook.hasOwnProperty(h)) {
    			this.reverseCodebook[h] = {};
    	    	for(var c in this.codebook[h]) {
    	    		this.reverseCodebook[h][this.codebook[h][c]] = c; 
    			}
        	}
    	}

    	return this;
    }

    Codebook.prototype.getKeys = function() {
        return Object.keys(this.codebook);
    }

    Codebook.prototype.lookupCode = function(header, code) {
        if(typeof this.codebook[header] === "undefined" || typeof this.codebook[header][code] === "undefined") return false;
        return this.codebook[header][code];
    }

    Codebook.prototype.lookupKey = function(header, key) {
        if(typeof this.reverseCodebook[header] === "undefined" || typeof this.reverseCodebook[header][key] === "undefined") return false;
        return this.reverseCodebook[header][key];
    }

    exports.Codebook = Codebook;

})(typeof exports === 'undefined' ? this.db : exports);

