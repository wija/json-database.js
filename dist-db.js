;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
//db.js

;(function(exports) {

  var db;
  if(typeof module !== 'undefined' && module.exports) { // node

    db = {};
    //db.csvToJsonArray = require('./csv-utils.js').csvToJsonArray;
    db.Collection = require('./Collection').Collection;
    db.intersection = require('./operators').intersection;
    db.union = require('./operators').union;
    db.QueryTemplate = require('./QueryTemplate').QueryTemplate;
    db.qtField = require('./QueryTemplate').qtField;
    db.qtIntersect = require('./QueryTemplate').qtIntersect;
    db.qtUnion = require('./QueryTemplate').qtUnion;
    //db.Codebook = require('./Codebook').Codebook;
    db.sets = require('./sets').sets;
    db.Trie = require('./Trie').Trie;
    db.NumberIndex = require('./NumberIndex').NumberIndex;
    db.DateIndex = require('./DateIndex').DateIndex;
    db.TextIndex = require('./TextIndex').TextIndex;
    db.stopWords = require('./stopwords').stopWords;
    db.CategoryIndex = require('./CategoryIndex').CategoryIndex;
    db.search = require('./search').search;

  } else { // browser
    db = {};
  }

  exports.db = db;
  
})(typeof window === 'undefined' ? exports : window);

},{"./Collection":2,"./operators":3,"./QueryTemplate":4,"./sets":5,"./Trie":6,"./NumberIndex":7,"./DateIndex":8,"./TextIndex":9,"./stopwords":10,"./CategoryIndex":11,"./search":12}],5:[function(require,module,exports){
//sets.js

;(function(exports) {

	//the arrays passed must be sorted in ascending order
	function intersection(sArr1, sArr2) {
		
		var i1 = 0,
			i2 = 0, 
			len1 = sArr1.length, 
			len2 = sArr2.length, 
			result = [];
		
		while(i1 < len1 && i2 < len2) {
			if(sArr1[i1] === sArr2[i2]) {
				result.push(sArr1[i1]);
				i1++; 
				i2++;
			} else if(sArr1[i1] < sArr2[i2]) {
				i1++;
			} else {
				i2++;
			}
		}

		return result; 
	}

	//must be passed arrays sorted in ascending order
	function union(sArr1, sArr2) {
		
		var i1 = 0,
			i2 = 0, 
			len1 = sArr1.length, 
			len2 = sArr2.length, 
			result = [];
		
		while(i1 < len1 && i2 < len2) {
			if(sArr1[i1] === sArr2[i2]) {
				result.push(sArr1[i1]);
				i1++; 
				i2++;
			} else if(sArr1[i1] < sArr2[i2]) {
				result.push(sArr1[i1]);
				i1++;
			} else { // sArr1[i1] > sArr2[i2]
				result.push(sArr2[i2]);
				i2++;
			}
		}

		if(i2 < len2) { 
			for(; i2 < len2; i2++) { 
				result.push(sArr2[i2]); 
			}
		} else if (i1 < len1) {
			for(; i1 < len1; i1++) { 
				result.push(sArr1[i1]); 
			}
		}

		return result; 
	}

	//returns elements in sArr2 that are not in sArr1
	function complement(sArr1, sArr2) {

		var i1 = 0,
			i2 = 0, 
			len1 = sArr1.length, 
			len2 = sArr2.length, 
			result = [];
		
		while(i1 < len1 && i2 < len2) {
			if(sArr1[i1] === sArr2[i2]) {
				i1++; 
				i2++;
			} else if(sArr1[i1] < sArr2[i2]) {
				i1++;
			} else {  //sArr1[i1] > sArr2[i2]
				result.push(sArr2[i2]);
				i2++;
			}
		}

		for( ;i2 < len2; i2++) {
			result.push(sArr2[i2]);
		}

		return result; 

	}

	//returns [elements in sArr2 not in sArr1, elements in sArr1 not in sArr2]
	function complements(sArr1, sArr2) {

		var i1 = 0,
			i2 = 0, 
			len1 = sArr1.length, 
			len2 = sArr2.length, 
			result1 = [],
			result2 = [];
		
		while(i1 < len1 && i2 < len2) {
			if(sArr1[i1] === sArr2[i2]) {
				i1++; 
				i2++;
			} else if(sArr1[i1] < sArr2[i2]) {
				result2.push(sArr1[i1]);
				i1++;
			} else {  //sArr1[i1] > sArr2[i2]
				result1.push(sArr2[i2]);
				i2++;
			}
		}

		for( ;i2 < len2; i2++) {
			result1.push(sArr2[i2]);
		}

		for( ;i1 < len1; i1++) {
			result2.push(sArr1[i1]);
		}
		
		return [result1, result2]; 

	}

	exports.sets = {};
	exports.sets.intersection = intersection;
	exports.sets.union = union;
	exports.sets.complement = complement;
	exports.sets.complements = complements;

})(typeof exports === 'undefined' ? this.db : exports);


},{}],2:[function(require,module,exports){
//Collection.js

;(function (exports) {

    function Collection(resultIndices, datasetObj) {
        this.resultIndices = resultIndices || [];
        this.indexRegistry = datasetObj ? datasetObj.indexRegistry : {};
        this.completeDataArray = datasetObj ? datasetObj.completeDataArray : [];
    }

    Collection.prototype.loadData = function(completeDataArray, indexMap, completionCallback) {
        this.indexRegistry = {};
        this.completeDataArray = completeDataArray;
        this.resultIndices = "just loaded";

        for(var field in indexMap) {
            if(indexMap.hasOwnProperty(field)) {
                var opts = typeof indexMap[field].opts === "undefined" ? {} : indexMap[field].opts;
                if(typeof opts.keyExtractor === "undefined") {
                    opts.keyExtractor = function(o) { return o[field]; }
                }
                this.indexRegistry[field] = new indexMap[field].index(completeDataArray, opts);
            }
        }

        return this;
    }

    Collection.prototype.where = function(fieldName, queryObject) {
        
        var indexObj = this.indexRegistry[fieldName];
        
        if(indexObj && !queryObject.selectAll && !queryObject.predicate) {

            return new Collection(indexObj.select(queryObject), this);
        
        } else if(queryObject.predicate) {

            //how to properly deal with keyExtractor here?
            var keyExtractor = function(o) { return o[fieldName]; };
            var result = [];
            for(var i = 0, n = this.completeDataArray.length; i < n; i++) {
                if(queryObject.predicate(keyExtractor(this.completeDataArray[i]))) {
                    result.push(i);
                } 
            }
            return new Collection(result, this);

        } else if(queryObject.selectAll) {

            //this is a touch absurd
            var result = [];
            for(var i = 0, n = this.completeDataArray.length; i < n; i++) {
                result.push(i); 
            }
            return new Collection(result, this);
        }
    }

    Collection.prototype.get = function() {
        if(this.resultIndices === "just loaded") {
            return this.completeDataArray;
        } else {
            var result = [];
            for(var i = 0, n = this.resultIndices.length; i < n; i++) {
                result.push(this.completeDataArray[this.resultIndices[i]]);
            }
            return result;
        }
    }

    exports.Collection = Collection;

})(typeof exports === 'undefined' ? this.db : exports);


},{}],6:[function(require,module,exports){
//trie.js

/*

	Stores strings and associated data, permitting efficient retrieval by word or prefix.

	To construct a new trie:

	var t = new Trie()

	To add a word and the object/number/string with which it is associated:
	
	s1 = "hello world"
	s2 = "bye bye world"
	t.addWord("hello", s1);
	t.addWord("world", s1);
	t.addWord("bye", s2);
	t.addWord("world", s2);
	
	addWord returns the trie object on which it was called (here, t).  (Note, however, that it also
	mutates that object.)

	To retrieve (all of) the data associated with a word:

	t.findWord("bye", true)		//["bye bye world"]
	t.findWord("world", true)	//["hello world", "bye bye world"]
	t.findWord("hell", true)	//[]
	t.findWord("hell", false)	//["hello world"]

	The second argument to findWord determines whether only exact matches (true) or prefix
	matches (false) are returned.

	To delete a particular word (as associated with a particular datum): 

	t.deleteWord("hello", "hello world")	//true
	t.findWord("hello", true)				//[]
	t.findWord("world", true)				//["hello world", "bye bye world"]
	t.deleteWord("wor", "hello world")		//false
	t.deleteWord("world", "hello world")	//true
	t.findWord("world", true)				//["bye bye world"]
	
	Note that deletion is only provided for exact matches, not for prefix matches.

*/

;(function(exports) {

	function Trie() {
		this.t = {};
		return this;
	}

	Trie.prototype.addWord = function(w, o) {
		function aw(t, w, o) {
			if(w === "") {
				if(t["objRefs"]) { 
					t["objRefs"].push(o); 
				} else { 
					t["objRefs"] = [o]; 
				}
			} else if(t[w[0]]) {
				aw(t[w[0]], w.slice(1), o);
			} else {
				t[w[0]] = aw({}, w.slice(1), o);
			}
			return t;
		}
		aw(this.t, w, o);
		return this;
	}

	Trie.prototype.deleteWord = function(w, o) {

		function tdw(t, w, parentTrieStack) {
			if(w === "") {
				if(t["objRefs"] && t["objRefs"].indexOf(o) !== -1) {

					t["objRefs"].splice(t["objRefs"].indexOf(o), 1);
					
					//fully deletes by working back up the tree using the stack built on the way down 
					if(t["objRefs"].length === 0) {
						delete t["objRefs"];
						parentTrieStack.push(t);
						for(var i = parentTrieStack.length; i > 0; i--) {  // i > 0 to avoid trying to delete the top
							var count = 0; for(var p in parentTrieStack[i]) { count++; if(count !== 0) break; }
							if(count === 0) { delete parentTrieStack[i - 1][fullWord[i - 1]]; } 
						}
					}
					return true; 
				} else {
					return false;
				}
			} else if (t[w[0]]) {
				parentTrieStack.push(t);
				return tdw(t[w[0]], w.slice(1), parentTrieStack);
			} else {
				return false;
			}
		}
		var fullWord = w;
		return tdw(this.t, w, []);
	}

	Trie.prototype.findWord = function(w, exactp) {

		function fw(t, w, exactp) {
			if(!w) {
				return exactp 
						? t["objRefs"] 
							? t["objRefs"] 
							: []
						: __getObjRefsBeneath(t);
			} else if(t[w[0]]) {
				return fw(t[w[0]], w.slice(1), exactp);
			} else {
				return [];
			}
		}

		function __getObjRefsBeneath(t) {
			var acc = t["objRefs"] ? t["objRefs"]  : [];
			for(var c in t) {
				if(t.hasOwnProperty(c) && c.length === 1) {
					acc = acc.concat(__getObjRefsBeneath(t[c]));
				}
			}
			return acc;
		}

		function removeDups(sArr) {
			var result = [],
				last = undefined;
			for(var i = 0, n = sArr.length; i < n; i++) {
				if(!(sArr[i] === last)) result.push(sArr[i]);
				last = sArr[i];
			}
			return result;
		}

		//The assumption here that the associated data are numbers is problematic.
		//And it's not clear that removeDups should remain here.
		return removeDups(fw(this.t, w, exactp).sort(function(a,b) { return a - b; }));
	}

	exports.Trie = Trie;
 
})(typeof exports === 'undefined' ? this.db : exports);

},{}],10:[function(require,module,exports){
/*
	stopwords.js

	These lists are taken directly from the stopwords-filter ruby gem (https://github.com/brenes/stopwords-filter)

	Copyright (c) 2012 David J. Brenes

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

// **** NOTE THAT THEIR IS AN ENCODING PROBLEM. NEED TO FIX OR REPLACE

;(function(exports) {

	var stopWords = {"bg": "а,автентичен,аз,ако,ала,бе,без,беше,би,бивш,бивша,бившо,бил,била,били,било,благодаря,близо,бъдат,бъде,бяха,в,вас,ваш,ваша,вероятно,вече,взема,ви,вие,винаги,внимава,време,все,всеки,всички,всичко,всяка,във,въпреки,върху,г,ги,главен,главна,главно,глас,го,година,години,годишен,д,да,дали,два,двама,двамата,две,двете,ден,днес,дни,до,добра,добре,добро,добър,докато,докога,дори,досега,доста,друг,друга,други,е,евтин,едва,един,една,еднаква,еднакви,еднакъв,едно,екип,ето,живот,за,забавям,зад,заедно,заради,засега,заспал,затова,защо,защото,и,из,или,им,има,имат,иска,й,каза,как,каква,какво,както,какъв,като,кога,когато,което,които,кой,който,колко,която,къде,където,към,лесен,лесно,ли,лош,м,май,малко,ме,между,мек,мен,месец,ми,много,мнозина,мога,могат,може,мокър,моля,момента,му,н,на,над,назад,най,направи,напред,например,нас,не,него,нещо,нея,ни,ние,никой,нито,нищо,но,нов,нова,нови,новина,някои,някой,няколко,няма,обаче,около,освен,особено,от,отгоре,отново,още,пак,по,повече,повечето,под,поне,поради,после,почти,прави,пред,преди,през,при,пък,първата,първи,първо,пъти,равен,равна,с,са,сам,само,се,сега,си,син,скоро,след,следващ,сме,смях,според,сред,срещу,сте,съм,със,също,т,тази,така,такива,такъв,там,твой,те,тези,ти,т.н.,то,това,тогава,този,той,толкова,точно,три,трябва,тук,тъй,тя,тях,у,утре,харесва,хиляди,ч,часа,че,често,чрез,ще,щом,юмрук,я,як",
		"da": "og,i,jeg,det,at,en,den,til,er,som,på,de,med,han,af,for,ikke,der,var,mig,sig,men,et,har,om,vi,min,havde,ham,hun,nu,over,da,fra,du,ud,sin,dem,os,op,man,hans,hvor,eller,hvad,skal,selv,her,alle,vil,blev,kunne,ind,når,være,dog,noget,ville,jo,deres,efter,ned,skulle,denne,end,dette,mit,også,under,have,dig,anden,hende,mine,alt,meget,sit,sine,vor,mod,disse,hvis,din,nogle,hos,blive,mange,ad,bliver,hendes,været,thi,jer,sådan",
		"de": "aber,alle,allem,allen,aller,alles,als,also,am,an,ander,andere,anderem,anderen,anderer,anderes,anderm,andern,anderr,anders,auch,auf,aus,bei,bin,bis,bist,da,damit,dann,der,den,des,dem,die,das,daß,derselbe,derselben,denselben,desselben,demselben,dieselbe,dieselben,dasselbe,dazu,dein,deine,deinem,deinen,deiner,deines,denn,derer,dessen,dich,dir,du,dies,diese,diesem,diesen,dieser,dieses,doch,dort,durch,ein,eine,einem,einen,einer,eines,einig,einige,einigem,einigen,einiger,einiges,einmal,er,ihn,ihm,es,etwas,euer,eure,eurem,euren,eurer,eures,für,gegen,gewesen,hab,habe,haben,hat,hatte,hatten,hier,hin,hinter,ich,mich,mir,ihr,ihre,ihrem,ihren,ihrer,ihres,euch,im,in,indem,ins,ist,jede,jedem,jeden,jeder,jedes,jene,jenem,jenen,jener,jenes,jetzt,kann,kein,keine,keinem,keinen,keiner,keines,können,könnte,machen,man,manche,manchem,manchen,mancher,manches,mein,meine,meinem,meinen,meiner,meines,mit,muss,musste,nach,nicht,nichts,noch,nun,nur,ob,oder,ohne,sehr,sein,seine,seinem,seinen,seiner,seines,selbst,sich,sie,ihnen,sind,so,solche,solchem,solchen,solcher,solches,soll,sollte,sondern,sonst,über,um,und,uns,unse,unsem,unsen,unser,unses,unter,viel,vom,von,vor,während,war,waren,warst,was,weg,weil,weiter,welche,welchem,welchen,welcher,welches,wenn,werde,werden,wie,wieder,will,wir,wird,wirst,wo,wollen,wollte,würde,würden,zu,zum,zur,zwar,zwischen",
		"en": "i,me,my,myself,we,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,would,should,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very",
		"es": "de,la,que,el,en,y,a,los,del,se,las,por,un,para,con,no,una,su,al,lo,como,más,pero,sus,le,ya,o,este,sí,porque,esta,entre,cuando,muy,sin,sobre,también,me,hasta,hay,donde,quien,desde,todo,nos,durante,todos,uno,les,ni,contra,otros,ese,eso,ante,ellos,e,esto,mí,antes,algunos,qué,unos,yo,otro,otras,otra,él,tanto,esa,estos,mucho,quienes,nada,muchos,cual,poco,ella,estar,estas,algunas,algo,nosotros,mi,mis,tú,te,ti,tu,tus,ellas,nosotras,vosotros,vosotras,os,mío,mía,míos,mías,tuyo,tuya,tuyos,tuyas,suyo,suya,suyos,suyas,nuestro,nuestra,nuestros,nuestras,vuestro,vuestra,vuestros,vuestras,esos,esas,estoy,estás,está,estamos,estáis,están,esté,estés,estemos,estéis,estén,estaré,estarás,estará,estaremos,estaréis,estarán,estaría,estarías,estaríamos,estaríais,estarían,estaba,estabas,estábamos,estabais,estaban,estuve,estuviste,estuvo,estuvimos,estuvisteis,estuvieron,estuviera,estuvieras,estuviéramos,estuvierais,estuvieran,estuviese,estuvieses,estuviésemos,estuvieseis,estuviesen,estando,estado,estada,estados,estadas,estad,he,has,ha,hemos,habéis,han,haya,hayas,hayamos,hayáis,hayan,habré,habrás,habrá,habremos,habréis,habrán,habría,habrías,habríamos,habríais,habrían,había,habías,habíamos,habíais,habían,hube,hubiste,hubo,hubimos,hubisteis,hubieron,hubiera,hubieras,hubiéramos,hubierais,hubieran,hubiese,hubieses,hubiésemos,hubieseis,hubiesen,habiendo,habido,habida,habidos,habidas,soy,eres,es,somos,sois,son,sea,seas,seamos,seáis,sean,seré,serás,será,seremos,seréis,serán,sería,serías,seríamos,seríais,serían,era,eras,éramos,erais,eran,fui,fuiste,fue,fuimos,fuisteis,fueron,fuera,fueras,fuéramos,fuerais,fueran,fuese,fueses,fuésemos,fueseis,fuesen,siendo,sido,tengo,tienes,tiene,tenemos,tenéis,tienen,tenga,tengas,tengamos,tengáis,tengan,tendré,tendrás,tendrá,tendremos,tendréis,tendrán,tendría,tendrías,tendríamos,tendríais,tendrían,tenía,tenías,teníamos,teníais,tenían,tuve,tuviste,tuvo,tuvimos,tuvisteis,tuvieron,tuviera,tuvieras,tuviéramos,tuvierais,tuvieran,tuviese,tuvieses,tuviésemos,tuvieseis,tuviesen,teniendo,tenido,tenida,tenidos,tenidas,tened",
		"fi": "olla,olen,olet,on,olemme,olette,ovat,ole,oli,olisi,olisit,olisin,olisimme,olisitte,olisivat,olit,olin,olimme,olitte,olivat,ollut,olleet,en,et,ei,emme,ette,eivät,minä,minun,minut,minua,minussa,minusta,minuun,minulla,minulta,minulle,sinä,sinun,sinut,sinua,sinussa,sinusta,sinuun,sinulla,sinulta,sinulle,hän,hänen,hänet,häntä,hänessä,hänestä,häneen,hänellä,häneltä,hänelle,me,meidän,meidät,meitä,meissä,meistä,meihin,meillä,meiltä,meille,te,teidän,teidät,teitä,teissä,teistä,teihin,teillä,teiltä,teille,he,heidän,heidät,heitä,heissä,heistä,heihin,heillä,heiltä,heille,tämä,tämän,tätä,tässä,tästä,tähän,tällä,tältä,tälle,tänä,täksi,tuo,tuon,tuota,tuossa,tuosta,tuohon,tuolla,tuolta,tuolle,tuona,tuoksi,se,sen,sitä,siinä,siitä,siihen,sillä,siltä,sille,sinä,siksi,nämä,näiden,näitä,näissä,näistä,näihin,näillä,näiltä,näille,näinä,näiksi,nuo,noiden,noita,noissa,noista,noihin,noilla,noilta,noille,noina,noiksi,ne,niiden,niitä,niissä,niistä,niihin,niillä,niiltä,niille,niinä,niiksi,kuka,kenen,kenet,ketä,kenessä,kenestä,keneen,kenellä,keneltä,kenelle,kenenä,keneksi,ketkä,keiden,ketkä,keitä,keissä,keistä,keihin,keillä,keiltä,keille,keinä,keiksi,mikä,minkä,minkä,mitä,missä,mistä,mihin,millä,miltä,mille,minä,miksi,mitkä,joka,jonka,jota,jossa,josta,johon,jolla,jolta,jolle,jona,joksi,jotka,joiden,joita,joissa,joista,joihin,joilla,joilta,joille,joina,joiksi,että,ja,jos,koska,kuin,mutta,niin,sekä,sillä,tai,vaan,vai,vaikka,kanssa,mukaan,noin,poikki,yli,kun,niin,nyt,itse",
		"fr": "au,aux,avec,ce,ces,dans,de,des,du,elle,en,et,eux,il,je,la,le,leur,lui,ma,mais,me,même,mes,moi,mon,ne,nos,notre,nous,on,ou,par,pas,pour,qu,que,qui,sa,se,ses,son,sur,ta,te,tes,toi,ton,tu,un,une,vos,votre,vous,c,d,j,l,à,m,n,s,t,y,été,étée,étées,étés,étant,suis,es,est,sommes,êtes,sont,serai,seras,sera,serons,serez,seront,serais,serait,serions,seriez,seraient,étais,était,étions,étiez,étaient,fus,fut,fûmes,fûtes,furent,sois,soit,soyons,soyez,soient,fusse,fusses,fût,fussions,fussiez,fussent,ayant,eu,eue,eues,eus,ai,as,avons,avez,ont,aurai,auras,aura,aurons,aurez,auront,aurais,aurait,aurions,auriez,auraient,avais,avait,avions,aviez,avaient,eut,eûmes,eûtes,eurent,aie,aies,ait,ayons,ayez,aient,eusse,eusses,eût,eussions,eussiez,eussent,ceci,celà,cet,cette,ici,ils,les,leurs,quel,quels,quelle,quelles,sans,soi",
		"hu": "a,ahogy,ahol,aki,akik,akkor,alatt,által,általában,amely,amelyek,amelyekben,amelyeket,amelyet,amelynek,ami,amit,amolyan,amíg,amikor,át,abban,ahhoz,annak,arra,arról,az,azok,azon,azt,azzal,azért,aztán,azután,azonban,bár,be,belül,benne,cikk,cikkek,cikkeket,csak,de,e,eddig,egész,egy,egyes,egyetlen,egyéb,egyik,egyre,ekkor,el,elég,ellen,elõ,elõször,elõtt,elsõ,én,éppen,ebben,ehhez,emilyen,ennek,erre,ez,ezt,ezek,ezen,ezzel,ezért,és,fel,felé,hanem,hiszen,hogy,hogyan,igen,így,illetve,ill.,ill,ilyen,ilyenkor,ison,ismét,itt,jó,jól,jobban,kell,kellett,keresztül,keressünk,ki,kívül,között,közül,legalább,lehet,lehetett,legyen,lenne,lenni,lesz,lett,maga,magát,majd,majd,már,más,másik,meg,még,mellett,mert,mely,melyek,mi,mit,míg,miért,milyen,mikor,minden,mindent,mindenki,mindig,mint,mintha,mivel,most,nagy,nagyobb,nagyon,ne,néha,nekem,neki,nem,néhány,nélkül,nincs,olyan,ott,össze,õ,õk,õket,pedig,persze,rá,s,saját,sem,semmi,sok,sokat,sokkal,számára,szemben,szerint,szinte,talán,tehát,teljes,tovább,továbbá,több,úgy,ugyanis,új,újabb,újra,után,utána,utolsó,vagy,vagyis,valaki,valami,valamint,való,vagyok,van,vannak,volt,voltam,voltak,voltunk,vissza,vele,viszont,volna",
		"it": "ad,al,allo,ai,agli,all,agl,alla,alle,con,col,coi,da,dal,dallo,dai,dagli,dall,dagl,dalla,dalle,di,del,dello,dei,degli,dell,degl,della,delle,in,nel,nello,nei,negli,nell,negl,nella,nelle,su,sul,sullo,sui,sugli,sull,sugl,sulla,sulle,per,tra,contro,io,tu,lui,lei,noi,voi,loro,mio,mia,miei,mie,tuo,tua,tuoi,tue,suo,sua,suoi,sue,nostro,nostra,nostri,nostre,vostro,vostra,vostri,vostre,mi,ti,ci,vi,lo,la,li,le,gli,ne,il,un,uno,una,ma,ed,se,perché,anche,come,dov,dove,che,chi,cui,non,più,quale,quanto,quanti,quanta,quante,quello,quelli,quella,quelle,questo,questi,questa,queste,si,tutto,tutti,a,c,e,i,l,o,ho,hai,ha,abbiamo,avete,hanno,abbia,abbiate,abbiano,avrò,avrai,avrà,avremo,avrete,avranno,avrei,avresti,avrebbe,avremmo,avreste,avrebbero,avevo,avevi,aveva,avevamo,avevate,avevano,ebbi,avesti,ebbe,avemmo,aveste,ebbero,avessi,avesse,avessimo,avessero,avendo,avuto,avuta,avuti,avute,sono,sei,è,siamo,siete,sia,siate,siano,sarò,sarai,sarà,saremo,sarete,saranno,sarei,saresti,sarebbe,saremmo,sareste,sarebbero,ero,eri,era,eravamo,eravate,erano,fui,fosti,fu,fummo,foste,furono,fossi,fosse,fossimo,fossero,essendo,faccio,fai,facciamo,fanno,faccia,facciate,facciano,farò,farai,farà,faremo,farete,faranno,farei,faresti,farebbe,faremmo,fareste,farebbero,facevo,facevi,faceva,facevamo,facevate,facevano,feci,facesti,fece,facemmo,faceste,fecero,facessi,facesse,facessimo,facessero,facendo,sto,stai,sta,stiamo,stanno,stia,stiate,stiano,starò,starai,starà,staremo,starete,staranno,starei,staresti,starebbe,staremmo,stareste,starebbero,stavo,stavi,stava,stavamo,stavate,stavano,stetti,stesti,stette,stemmo,steste,stettero,stessi,stesse,stessimo,stessero,stando",
		"nl": "de,en,van,ik,te,dat,die,in,een,hij,het,niet,zijn,is,was,op,aan,met,als,voor,had,er,maar,om,hem,dan,zou,of,wat,mijn,men,dit,zo,door,over,ze,zich,bij,ook,tot,je,mij,uit,der,daar,haar,naar,heb,hoe,heeft,hebben,deze,u,want,nog,zal,me,zij,nu,ge,geen,omdat,iets,worden,toch,al,waren,veel,meer,doen,toen,moet,ben,zonder,kan,hun,dus,alles,onder,ja,eens,hier,wie,werd,altijd,doch,wordt,wezen,kunnen,ons,zelf,tegen,na,reeds,wil,kon,niets,uw,iemand,geweest,andere",
		"pt": "de,a,o,que,e,do,da,em,um,para,com,não,uma,os,no,se,na,por,mais,as,dos,como,mas,ao,ele,das,à,seu,sua,ou,quando,muito,nos,já,eu,também,só,pelo,pela,até,isso,ela,entre,depois,sem,mesmo,aos,seus,quem,nas,me,esse,eles,você,essa,num,nem,suas,meu,às,minha,numa,pelos,elas,qual,nós,lhe,deles,essas,esses,pelas,este,dele,tu,te,vocês,vos,lhes,meus,minhas,teu,tua,teus,tuas,nosso,nossa,nossos,nossas,dela,delas,esta,estes,estas,aquele,aquela,aqueles,aquelas,isto,aquilo,estou,está,estamos,estão,estive,esteve,estivemos,estiveram,estava,estávamos,estavam,estivera,estivéramos,esteja,estejamos,estejam,estivesse,estivéssemos,estivessem,estiver,estivermos,estiverem,hei,há,havemos,hão,houve,houvemos,houveram,houvera,houvéramos,haja,hajamos,hajam,houvesse,houvéssemos,houvessem,houver,houvermos,houverem,houverei,houverá,houveremos,houverão,houveria,houveríamos,houveriam,sou,somos,são,era,éramos,eram,fui,foi,fomos,foram,fora,fôramos,seja,sejamos,sejam,fosse,fôssemos,fossem,for,formos,forem,serei,será,seremos,serão,seria,seríamos,seriam,tenho,tem,temos,tém,tinha,tínhamos,tinham,tive,teve,tivemos,tiveram,tivera,tivéramos,tenha,tenhamos,tenham,tivesse,tivéssemos,tivessem,tiver,tivermos,tiverem,terei,terá,teremos,terão,teria,teríamos,teriam"
	};

	function getStopWords(lang) {
		if(typeof stopWords[lang] === "undefined") return false;
		
		var a = stopWords[lang].split(",");
		var o = {};
		for(var i = 0, n = a.length; i < n; i++) {
			o[a[i]] = true;
		}
		return o;
	}

	//scope.getStopWords = getStopWords;

	exports.stopWords = {};
	exports.stopWords.getStopWords = getStopWords;

})(typeof exports === 'undefined' ? this.db : exports);

},{}],12:[function(require,module,exports){
//search.js

;(function(exports) {

	function linearSearch(arr, val) {
		for(var i = 0, n = arr.length; i < n; i++) {
			if(arr[i] === val) return i;
		}
		return -1;
	}

	/*
		binarySearch(sArr, val, lower, upper)

		sArr: array sorted in ascending order [2,5,8,8,10,11,11,13,45]
		val: a value to be found (perhaps 8)

		Returns an object with a found property (true or false) and lower,
		midpoint, and upper properties that contain the values of these 
		internal variables when the search completed. These are used by 
		findIndexRangeForVal and findIndexRangeForValRange to speed up
		searches that are variations on past searches.

		This closely tracks Bentley's implementation.

		The arguments to bitwise operators are treated as signed 32 bit
		integers in big-endian order; the below implementation will,
		thus, break if the length of the array exceeds 2147483648.  
		However, that is also the maximum length of an Array in the
		ECMAScript standard.

	*/

	function binarySearch(sArr, val, lower, upper) {
		
		var lower = lower || 0, 
			upper = upper || sArr.length - 1, 
			midpoint = 0;

		while (lower <= upper) {
			midpoint = lower + ((upper - lower) >> 1);
			if (sArr[midpoint] < val) {
				lower = midpoint + 1;
			} else if (sArr[midpoint] === val) {
				return {"found": true, "lower": lower, "midpoint": midpoint, "upper": upper};
			} else {
				upper = midpoint - 1;
			}
		}
		return {"found": false, "lower": lower, "midpoint": midpoint, "upper": upper};
	}

	/*

		findIndexRangeForVal(sArr, val, lower, upper) 

		FIX: This is out of date, because it now assume that values are not
		repeated in sArr.

		Required arguments:

		sArr: array sorted in ascending order [2,5,8,8,10,11,11,13,45]
		val: a value to be found (perhaps 8)
		
		There are five possible returns. This is not ideal, but the key point
		is that what is returned by findIndexRangeForVal remain consistent with
		findIndexRangeForValRange's expectations.

		(1) If val exists multiple times in sArr, object literal returned contains:

		found: true
		firstIndex: the first index in sArr where the element appears (2) 
		lastIndex: the last index in sArr where the element appears (3)

		(2) If val exists only once, as above, but firstIndex = lastIndex.

		(3) If val is smaller than any element in sArr, the object literal contains:

		found: false
		firstIndex: -1
		lastIndex: 0

		(4) If val is larger than any element in sArr, the object literal contains:

		found: false
		firstIndex: sArr.length - 1
		lastIndex: sArr.length

		(5) If val is between elements in sArr, the object literal contains:

		found: false
		firstIndex: index of closest smaller
		lastIndex: index of closest larger

	*/

	function findIndexRangeForVal(sArr, val, lower, upper) {

		var searchResult = binarySearch(sArr, val, lower || 0, upper || sArr.length - 1);

		if(searchResult.found === false) 
			return {"found": false, "firstIndex": searchResult.lower - 1, "lastIndex": searchResult.upper + 1};

		return {"found": true, "firstIndex": searchResult.midpoint, "lastIndex": searchResult.midpoint};

	}

	/*
		findIndexRangeForValRange(sArr, val1, val2, lower, upper)

		FIX: This is out of date, because it now assume that values are not
		repeated in sArr.

		Required arguments:

		sArr: array sorted in ascending order [2,5,8,8,10,11,11,13,45]
		val1: the first value (perhaps 7)
		val2: the second value - must >= val1 (perhaps 11)

		Called with these, the function returns an object literal with two
		properties:

		firstIndex: the index of the first element of sArr that is >= val1 (2)
		lastIndex: the index of the last element of sArr that is <= val2 (6)
		
		If there is no element that is both >= val1 and <= val2, "false" is
		returned.

		Optional arguments:

		lower: the first index at which either val could possibly appear
		upper: the last index at which either val could possibly appear

		These make sense mainly in the context of IndexedNumericalColumn,
		which uses the result of this function to inform future calls to this
		function.  
	*/


	function findIndexRangeForValRange(sArr, val1, val2) {

		var lowerRange = findIndexRangeForVal(sArr, val1),
			higherRange = findIndexRangeForVal(sArr, val2);		

		var lower = lowerRange.lastIndex, //lowerRange.found === true ? lowerRange.firstIndex : lowerRange.lastIndex;
			higher = higherRange.firstIndex; //higherRange.found === true ? higherRange.lastIndex : higherRange.firstIndex;

		//this happens iff the val1 to val2 range lies completely before or completely after the range of values in sArr
		if(higher < lower) {
			return false;
		} else {
			return {"firstIndex": lower, "lastIndex": higher};
		}
	}

	function getValsForValRange(sArr, val1, val2, opts) {

		var lowerRange = findIndexRangeForVal(sArr, val1),
			higherRange = findIndexRangeForVal(sArr, val2);		

		var lower = lowerRange.lastIndex, //lowerRange.found === true ? lowerRange.firstIndex : lowerRange.lastIndex;
			higher = higherRange.firstIndex; //higherRange.found === true ? higherRange.lastIndex : higherRange.firstIndex;

		
		if(higher < lower) { 

			//above true iff val1 to val2 range is completely before or after the
			//range of values in sArr

			return [];

		} else {

			var result = [];

			for(var i = lower, n = higher + 1; i < n; i++) {
				result.push(sArr[i]);
			}

			if((opts && opts.excludeVal1) && (result[0] === val1)) {
				result.splice(0,1);
			}

			if((opts && opts.excludeVal2) && (result[-1]) && (result.length !== 0)) {
				result.splice(-1,1);
			}

			return result;
		}
	}

	exports.search = {};
	exports.search.linearSearch = linearSearch;
	exports.search.binarySearch = binarySearch;
	exports.search.findIndexRangeForVal = findIndexRangeForVal;
	exports.search.findIndexRangeForValRange = findIndexRangeForValRange;
	exports.search.getValsForValRange = getValsForValRange;

})(typeof exports === 'undefined' ? this.db : exports);



},{}],3:[function(require,module,exports){
//operators.js

;(function (exports) {

    var db;
    if(typeof module !== 'undefined' && module.exports) { // node
        db = {};
        db.sets = require('./sets').sets;
        db.Collection = require('./Collection').Collection;
    } else { // browser
        db = window.db;
    }

    function intersection() {
        var whereObjs = [].slice.call(arguments);
        var whereArrs = whereObjs.map(function(o) { return o.resultIndices; });
        if(whereObjs.length === 0) {
            throw "intersection called without any arguments";
        } else if(!allSameDataSource(whereObjs)) {
            throw "intersection called with datasets referring to a different underlying data array";
        } else {
            return new db.Collection(whereArrs.sort(function(a,b) { return a.length - b.length; })
                                        .reduce(db.sets.intersection),
                               arguments[0]);
        }
    }

    function union() {
        var whereObjs = [].slice.call(arguments);
        var whereArrs = whereObjs.map(function(o) { return o.resultIndices; });
        if(whereObjs.length === 0) {
            throw "union called without any arguments";
        } else if(!allSameDataSource(whereObjs)) {
            throw "union called with datasets referring to a different underlying data array";
        } else {
            return new db.Collection(whereArrs.reduce(db.sets.union), arguments[0]);
        }
    }

    function allSameDataSource(datasetArr) {
        return datasetArr.map(function(o) { return o.completeDataArray; })
                         .reduce(function(a,b) {return a === b ? a : false; });
    }

    exports.intersection = intersection;
    exports.union = union;

})(typeof exports === 'undefined' ? this.db : exports);



},{"./sets":5,"./Collection":2}],9:[function(require,module,exports){
//TextIndex.js

;(function (exports) {

	var db;
	if(typeof module !== 'undefined' && module.exports) { // node
		db = {};
		db.sets = require('./sets').sets;
		db.Trie = require('./trie').Trie;
		db.stopWords = require('./stopwords').stopWords;
	} else { // browser
		db = window.db;
	}
	
	//opts = extractKeyFn, tokenizer, wordNormalizer, stopWords
	function TextIndex(arr, opts) {		

		this.completeDataArray = arr;

		var opts = opts || {};

		this.keyExtractor = opts.keyExtractor || function(o) { return o; };

		this.wordNormalizer = opts.wordNormalizer || function(s) { return s.toLowerCase(); };

		this.tokenizer = opts.tokenizer || 
				function(s) {
			  		return s.split(/\b\s+/)
			  				.map(function(w) { return w.replace(/^[,.;:]*/,"").replace(/[,.;:]*$/,"").replace(/\|/g," "); });
				};

		this.stopWords = opts.stopWords || db.stopWords.getStopWords("en");

		this.t = new db.Trie();

		for(var i = 0, n = arr.length; i < n; i++) {
			var words = this.tokenizer(this.keyExtractor(arr[i]));
			for(var j = 0, m = words.length; j < m; j++) {
				var nw = this.wordNormalizer(words[j]);
				if(this.stopWords[nw] !== true) {
					this.t.addWord(nw, i);
				}
			}
		}

		return this;
	}

	TextIndex.prototype.select = function(queryObject) {

		if(queryObject.autoCompleteSearch) {

			var str = queryObject.autoCompleteSearch;
			var words = this.tokenizer(str).map(this.wordNormalizer);
			for(var result = [], i = 0, n = words.length; i < n; i++) {
				if(this.stopWords[words[i]] !== true) {
					result.push(this.t.findWord(words[i], i !== n - 1).sort(function(a,b) { return a - b}));
				}
			}
			result.sort(function(a,b) { return a.length - b.length; });
			if(result.length === 0) {
				return [];
			} else {
				return result.reduce(db.sets.intersection);
			}
		}
	}

	exports.TextIndex = TextIndex;

})(typeof exports === 'undefined' ? this.db : exports);



},{"./sets":5,"./trie":13,"./stopwords":10}],4:[function(require,module,exports){
//QueryTemplate.js

;(function (exports) {

    var db;
    if(typeof module !== 'undefined' && module.exports) { // node
        db = {};
        db.sets = require('./sets').sets;
        db.Collection = require('./Collection').Collection;
        db.union = require('./operators').union;
        db.intersection = require('./operators').intersection;
    } else { // browser
        db = window.db;
    }

	function QueryTemplate(dataset, stmt, callback) {

		this.dataset = dataset;
		this.callback = callback;

		this.flattenedStmt = [].concat.apply([],stmt);
		
		this.cache = [];
		this.paramNameToCacheMap = {};
		this.paramNameToColumnNameMap = {};

		for(var i = 0, n = this.flattenedStmt.length; i < n; i++) {
			this.cache[i] = new db.Collection([], this.dataset);
			if(this.flattenedStmt[i].type === "whereClause") {
				this.paramNameToCacheMap[this.flattenedStmt[i].name] = i; 
				this.paramNameToColumnNameMap[this.flattenedStmt[i].name] = this.flattenedStmt[i].name;
			}
		}
	}

	function __psify(fn, name) { return function() { return [].slice.call(arguments).concat(arguments.length).concat({"type": "operator", "name": name, "def": fn}); }; }
	var qtIntersect = __psify(db.intersection, "intersection");
	var qtUnion = __psify(db.union, "union");
	function qtField(name)  { return {"type": "whereClause", "name": name };  }

	QueryTemplate.prototype.evaluate = function(name, argArr) {

		var iWhereClause = this.paramNameToCacheMap[name],
			stack = [];

		for(var i = 0, n = this.flattenedStmt.length; i < n; i++) {

			var e = this.flattenedStmt[i];

			if(this.debug) {
				console.log("Code:  ", this.flattenedStmt.slice(0,i), ",**", this.flattenedStmt[i].type === "operator" ? this.flattenedStmt[i].name : this.flattenedStmt[i], "**,", this.flattenedStmt.slice(i+1));
				console.log("Stack: ", stack.slice(0,stack.length-1), ",**", stack[stack.length-1]);
				console.log("Cache: ", this.cache[i]);
				console.log("\n");
			}

			switch(e.type) {

				case "whereClause":
					if(i === iWhereClause) {
						var whereClauseVal = this.dataset.where(name, argArr);  
						stack.push({"value": whereClauseVal, "new": true });  //whereClauseVal.result ==> whereClauseVal
						this.cache[i] = whereClauseVal;  //note that whereClauseVal can be false
					} else {
						stack.push({"value": this.cache[i], "new": false })
					}
					break;

				case "argCount":    //Not actually used - see __psify - should actually wrap argCount into the operator objects
					stack.push(e);
					break;
			
				case "operator":
					for(var args = [], allCached = true, ai = 0, an = stack.pop(); ai < an; ai++) {
						var v = stack.pop();
						if(v.new) allCached = false;
						args.push(v.value);
					}

					if(allCached) {
						if(this.debug || this.debugRecalcs) console.log(this.flattenedStmt[i].name, " took value from cache.");
						stack.push({"value": this.cache[i], "new": false});
					} else {
						if(this.debug || this.debugRecalcs) console.log(this.flattenedStmt[i].name, " recalculated value.");
						this.cache[i] = e.def.apply(null, args); //this.cache[i] = e.def.call(this, args);
						stack.push({"value": this.cache[i], "new":true });
					}
					break;
			
				default:  //see case "argCount": - once made operational, should restore throwing errors here

					stack.push(e);	//this should be an argument count 
			}
		}

		var n = stack.pop().value.get();
		//console.log(n);

		//this.cachedRetVal = db.lazyRowConstruction.getCombinedRowIterator({"result": n}, this.dataset);
		
		if(typeof this.callback === "undefined") {
			return n;
		} else {
			this.callback(n);
		}
	}

	exports.QueryTemplate = QueryTemplate;
	exports.qtField = qtField;
	exports.qtIntersect = qtIntersect;
	exports.qtUnion = qtUnion;

})(typeof exports === 'undefined' ? this.db : exports);


},{"./sets":5,"./Collection":2,"./operators":3}],7:[function(require,module,exports){
//NumberIndex.js

;(function (exports) {

	var db;
	if(typeof module !== 'undefined' && module.exports) { // node
		db = {};
		db.sets = require('./sets').sets;
		db.search = require('./search').search; 
	} else { // browser
		db = window.db;
	}

	function NumberIndex(arr, opts) {

		var opts = opts || {};
		this.keyExtractor = opts.keyExtractor || function(o) { return o; };
		this.converterToNumber = opts.converterToNumber || function(d) { return +d; };

		this.arr2 = arr.slice(0); 		
		this.sArr = []; 				//values sorted in ascending order
		this.valToRowIndex = {};
		
		this.cachedResult = [];

		//This was always kludgy and inefficient, but does it even make sense after
		//the changes?
		for(var i = 0, n = this.arr2.length; i < n; i++)
			this.arr2[i] = this.converterToNumber(this.keyExtractor(this.arr2[i]));
		addArrayIndicesToElements(this.arr2);  //mutates passed in arr but not this.arr
		this.arr2.sort(function(ia1, ia2) { return ia1[1] - ia2[1]; });
		
		var lastV = undefined;
		for(var i = 0, n = this.arr2.length; i < n; i++) {
			var val = this.arr2[i][1],
				rowIndex = this.arr2[i][0];
			if(val !== lastV) {
				this.sArr.push(val);
				this.valToRowIndex[val] = [rowIndex];
			} else {
				insertInOrder(this.valToRowIndex[val], rowIndex);
			}
			lastV = this.arr2[i][1];
		}

		function insertInOrder(arr, v) {
			for(var i = 0, n = arr.length; i < n; i++) {
				if(v < arr[i]) {
					arr.splice(i,0,v);
					break;
				}
			}
			if(i === n) { arr.push(v); }
		}

		this.cachedValRange = false;

		return this;

	}

	//This assumes that val2 >= val1
	//What is done with the higher and lower halves is symmetric; can try to make this half as long
	NumberIndex.prototype.select = function(queryObject) {

		"use strict";

		if(queryObject.inRange) {

			return selectRange.call(this, this.converterToNumber(queryObject.inRange[0]),
							   			  this.converterToNumber(queryObject.inRange[1]));

		} else if(queryObject.equal) {

			return selectRange.call(this, this.converterToNumber(queryObject.equal),
										  this.converterToNumber(queryObject.equal));

		} else if(queryObject.min) {

			return this.valToRowIndex[this.sArr[0]];
		
		} else if(queryObject.max) {

			return this.valToRowIndex[this.sArr[this.sArr.length - 1]];

		} else if(queryObject.greaterThanOrEqual) {

			return selectRange.call(this, this.converterToNumber(queryObject.greaterThan), this.sArr[this.sArr.length - 1]);

		} else if(queryObject.lessThanOrEqual) {

			return selectRange.call(this, this.sArr[0], this.converterToNumber(queryObject.lessThan));
		
		}

	}

	function selectRange(v1, v2) {

		if(v1 > v2) {
			throw new Error("NumberIndex: first number must be less than or equal to second number"); 
		}
		
		var enterIndices = [],
			exitIndices = [];

		if(this.cachedValRange) {  //CAN'T I GET RID OF THIS SPECIAL CASE

			if(v1 < this.cachedValRange.v1) {
				
				enterIndices = getIndicesForValRange(this.sArr, this.valToRowIndex, v1, this.cachedValRange.v1, {excludeVal2: true});

			} else if(v1 > this.cachedValRange.v1) {

				exitIndices = getIndicesForValRange(this.sArr, this.valToRowIndex, this.cachedValRange.v1, v1, {excludeVal2: true});

			}

			if(v2 < this.cachedValRange.v2) {

				var moreExitIndices = getIndicesForValRange(this.sArr, this.valToRowIndex, v2, this.cachedValRange.v2, {excludeVal1: true});

				exitIndices = exitIndices.length === 0
					? moreExitIndices
					: db.sets.union(exitIndices, moreExitIndices);

			} else if(v2 > this.cachedValRange.v2) {

				var moreEnterIndices = getIndicesForValRange(this.sArr, this.valToRowIndex, this.cachedValRange.v2, v2, {excludeVal1: true});
				
				enterIndices = enterIndices.length === 0
					? moreEnterIndices
					: db.sets.union(enterIndices, moreEnterIndices);
			}

			if(enterIndices.length !== 0) {
				this.cachedResult = db.sets.union(this.cachedResult, enterIndices);
			}

			if(exitIndices.length !== 0) {
				this.cachedResult = db.sets.complement(exitIndices, this.cachedResult);
			}

		} else {

			this.cachedResult = getIndicesForValRange(this.sArr, this.valToRowIndex, v1, v2);

		}
		
		this.cachedValRange = {v1: v1, v2: v2};	
		
		return this.cachedResult;

	}

	//generalize and move to search.js?
	function getIndicesForValRange(sArr, valToRowIndex, val1, val2, opts) {

		var lowerRange = db.search.findIndexRangeForVal(sArr, val1),
			higherRange = db.search.findIndexRangeForVal(sArr, val2);		

		var lower = lowerRange.lastIndex, //lowerRange.found === true ? lowerRange.firstIndex : lowerRange.lastIndex;
			higher = higherRange.firstIndex; //higherRange.found === true ? higherRange.lastIndex : higherRange.firstIndex;

		
		if(higher < lower) { 

			//above true iff val1 to val2 range is completely before or after the
			//range of values in sArr

			return [];

		} else {

			var result = [];

			for(var i = lower, n = higher + 1; i < n; i++) {
				result.push(valToRowIndex[sArr[i]]);
			}

			if((opts && opts.excludeVal1) && (sArr[lower] === val1)) {
				result.splice(0,1);
			}

			if((opts && opts.excludeVal2) && (sArr[higher] === val2) && (result.length !== 0)) {
				result.splice(-1,1);
			}

			return result.length === 0 ? [] : result.reduce(db.sets.union);
		}
	}


	//destructive
	function addArrayIndicesToElements(arr) {
		for(var i = 0, n = arr.length; i < n; i++) {
			arr[i] = [i, arr[i]];
		}
	}

	function splitArrayIndicesAndElements(arr, arrIndices, arrValues) {
		for(var i = 0, n = arr.length; i < n; i++) {
			arrIndices.push(arr[i][0]); //arrIndices.push(arr[i].index);
			arrValues.push(arr[i][1]);  //arrValues.push(arr[i].value);
		}
	}

	exports.NumberIndex = NumberIndex;

})(typeof exports === 'undefined' ? this.db : exports);




},{"./sets":5,"./search":12}],8:[function(require,module,exports){
//DateIndex.js

;(function (exports) {

	var db;
	if(typeof module !== 'undefined' && module.exports) { // node
		db = {};
		db.NumberIndex = require('./NumberIndex').NumberIndex;
		//d3 = require('d3');
	} else { // browser
		db = window.db;
	}

	function DateIndex(arr, opts) {   		//this should also take a date string format

		//var f = d3.time.format("%d-%b-%y");   //MAKE THIS AN ARGUMENT
		//function(rawDatum) { return f.parse(rawDatum).getTime();};
		var opts = opts || {};
		opts.converterToNumber = opts.converterToNumber || function(rawDatum) { return new Date(rawDatum).getTime();}; 
		db.NumberIndex.call(this, arr, opts);

		return this;

	}

	DateIndex.prototype = Object.create(db.NumberIndex.prototype);  //ES5

	exports.DateIndex = DateIndex;

})(typeof exports === 'undefined' ? this.db : exports);

},{"./NumberIndex":7}],11:[function(require,module,exports){
//CategoryIndex.js

;(function(exports) {

	var db;
	if(typeof module !== 'undefined' && module.exports) { // node
		db = {};
		db.sets = require('./sets').sets;
	} else { // browser
		db = window.db;
	}

	//add a converter fn (a la codebooks)
	function CategoryIndex(arr, opts) {
		
		this.completeDataArray = arr;

		var opts = opts || {};
		this.keyExtractor = opts.keyExtractor || function(o) { return o; };

		this.dict = {};
		this.pastResult = {"result": [], "valArr": []};

		for(var i = 0, n  = arr.length; i < n; i++) {
			var key = this.keyExtractor(arr[i]);
			if(this.dict[key]) { 
				this.dict[key].push(i);
			} else {
				this.dict[key] = [i];
			}
		}

		return this;
	}

	CategoryIndex.prototype.select = function(queryObject) {

		if(queryObject.any) {

			var valArr = queryObject.any.sort();   //note that valArr, valsRemoved, valsAdded concern *arguments*

			var cs = db.sets.complements(valArr, this.pastResult.valArr);
			var valsRemoved = cs[0], valsAdded = cs[1];

			//these can be folds

			var exit = [];
			for(var i = 0, n = valsRemoved.length; i < n; i++)
				if(this.dict[valsRemoved[i]])
					exit = db.sets.union(this.dict[valsRemoved[i]], exit);
			
			var enter = [];
			for(var i = 0, n = valsAdded.length; i < n; i++)
				if(this.dict[valsAdded[i]])
					enter = db.sets.union(this.dict[valsAdded[i]], enter);

			var result = db.sets.union(enter, db.sets.complement(exit, this.pastResult.result));

		} else if(queryObject.equal) {

			var result = this.dict[queryObject.equal];

		}

		this.pastResult = {"result": result, "valArr": valArr ? valArr : []};

		return result;
	}

	CategoryIndex.prototype.getValues = function() {
		return Object.keys(this.dict);
	}

	exports.CategoryIndex = CategoryIndex;

})(typeof exports === 'undefined' ? this.db : exports);


},{"./sets":5}],13:[function(require,module,exports){
//trie.js

/*

	Stores strings and associated data, permitting efficient retrieval by word or prefix.

	To construct a new trie:

	var t = new Trie()

	To add a word and the object/number/string with which it is associated:
	
	s1 = "hello world"
	s2 = "bye bye world"
	t.addWord("hello", s1);
	t.addWord("world", s1);
	t.addWord("bye", s2);
	t.addWord("world", s2);
	
	addWord returns the trie object on which it was called (here, t).  (Note, however, that it also
	mutates that object.)

	To retrieve (all of) the data associated with a word:

	t.findWord("bye", true)		//["bye bye world"]
	t.findWord("world", true)	//["hello world", "bye bye world"]
	t.findWord("hell", true)	//[]
	t.findWord("hell", false)	//["hello world"]

	The second argument to findWord determines whether only exact matches (true) or prefix
	matches (false) are returned.

	To delete a particular word (as associated with a particular datum): 

	t.deleteWord("hello", "hello world")	//true
	t.findWord("hello", true)				//[]
	t.findWord("world", true)				//["hello world", "bye bye world"]
	t.deleteWord("wor", "hello world")		//false
	t.deleteWord("world", "hello world")	//true
	t.findWord("world", true)				//["bye bye world"]
	
	Note that deletion is only provided for exact matches, not for prefix matches.

*/

;(function(exports) {

	function Trie() {
		this.t = {};
		return this;
	}

	Trie.prototype.addWord = function(w, o) {
		function aw(t, w, o) {
			if(w === "") {
				if(t["objRefs"]) { 
					t["objRefs"].push(o); 
				} else { 
					t["objRefs"] = [o]; 
				}
			} else if(t[w[0]]) {
				aw(t[w[0]], w.slice(1), o);
			} else {
				t[w[0]] = aw({}, w.slice(1), o);
			}
			return t;
		}
		aw(this.t, w, o);
		return this;
	}

	Trie.prototype.deleteWord = function(w, o) {

		function tdw(t, w, parentTrieStack) {
			if(w === "") {
				if(t["objRefs"] && t["objRefs"].indexOf(o) !== -1) {

					t["objRefs"].splice(t["objRefs"].indexOf(o), 1);
					
					//fully deletes by working back up the tree using the stack built on the way down 
					if(t["objRefs"].length === 0) {
						delete t["objRefs"];
						parentTrieStack.push(t);
						for(var i = parentTrieStack.length; i > 0; i--) {  // i > 0 to avoid trying to delete the top
							var count = 0; for(var p in parentTrieStack[i]) { count++; if(count !== 0) break; }
							if(count === 0) { delete parentTrieStack[i - 1][fullWord[i - 1]]; } 
						}
					}
					return true; 
				} else {
					return false;
				}
			} else if (t[w[0]]) {
				parentTrieStack.push(t);
				return tdw(t[w[0]], w.slice(1), parentTrieStack);
			} else {
				return false;
			}
		}
		var fullWord = w;
		return tdw(this.t, w, []);
	}

	Trie.prototype.findWord = function(w, exactp) {

		function fw(t, w, exactp) {
			if(!w) {
				return exactp 
						? t["objRefs"] 
							? t["objRefs"] 
							: []
						: __getObjRefsBeneath(t);
			} else if(t[w[0]]) {
				return fw(t[w[0]], w.slice(1), exactp);
			} else {
				return [];
			}
		}

		function __getObjRefsBeneath(t) {
			var acc = t["objRefs"] ? t["objRefs"]  : [];
			for(var c in t) {
				if(t.hasOwnProperty(c) && c.length === 1) {
					acc = acc.concat(__getObjRefsBeneath(t[c]));
				}
			}
			return acc;
		}

		function removeDups(sArr) {
			var result = [],
				last = undefined;
			for(var i = 0, n = sArr.length; i < n; i++) {
				if(!(sArr[i] === last)) result.push(sArr[i]);
				last = sArr[i];
			}
			return result;
		}

		//The assumption here that the associated data are numbers is problematic.
		//And it's not clear that removeDups should remain here.
		return removeDups(fw(this.t, w, exactp).sort(function(a,b) { return a - b; }));
	}

	exports.Trie = Trie;
 
})(typeof exports === 'undefined' ? this.db : exports);

},{}]},{},[1])
;