//PreparedStatement.spec.js

var jsonDatabase = {};
jsonDatabase.PreparedStatement = require("../src/PreparedStatement").PreparedStatement;
jsonDatabase.Dataset = require("../src/Dataset").Dataset;
jsonDatabase.NumberIndex = require("../src/NumberIndex").NumberIndex;
jsonDatabase.DateIndex = require("../src/DateIndex").DateIndex;
jsonDatabase.TextIndex = require("../src/TextIndex").TextIndex;
jsonDatabase.CategoryIndex = require("../src/CategoryIndex").CategoryIndex;
jsonDatabase.csvToJsonArray = require("../src/csv-utils").csvToJsonArray;

function arrEq(arr1, arr2) {
	
	if(arr1.length !== arr2.length) return false;

	for(var i = 0, n = arr1.length; i < n; i++)
		if(arr1[i] !== arr2[i]) return false;

	return true;
}

/*
function arrToStr(arr) {
	return "[" + arr.join(", ") + "]";
}
*/

function displayOptions() {
	var selectIncidentTypeOptions = document.getElementById("selectIncidentType").options;
	for(var i = 0, n = selectIncidentTypeOptions.length; i < n; i++) {
		selectIncidentTypeOptions[i]
	}
}

function oras(arr, rowsArray) {
	return "[" + arr.map(function(v) { return rowsArray.indexOf(v); }).join(", ") + "]";
}


describe('PreparedStatement.js', function() {

	retVal = null;
	ps = null;
	doneFlag = null;


/*
			ps.evaluate("etype", ["Limited Strike"]);
			ps.evaluate("countryname", ["Algeria"]);
			ps.evaluate("startdate", ["1-Jan-90", "1-Jan-11"]);
			ps.evaluate("issuenote", ["d"]);			

*/
        
        runs(function () {
			jsonDatabase.csvToJsonArray(

				/*
				   eventid,countryname,startdate,enddate,etype,actor1,target1,ndeath,elocal,issuenote
				0: 6150001,Algeria,31-May-90,31-May-90,1,Socialist Forces Front,Government,0,Algiers,Political party calls for march demanding true democratic elections
				1: 6150207,Algeria,21-Sep-10,21-Sep-10,2,Christians,Government,0,Algiers,Christians protest at the trial of two Christians for breaking Ramadan fasting rules.
				2: 6150208,Algeria,4-Oct-10,6-Oct-10,6,ArcelorMittal steel workers,ArcelorMittel,0,Annaba,"Steel workers strike, demanding higher wages."
				3: -5400001,Angola,11-Nov-75,31-Dec-95,-9,UNITA,Government,-77,Nationwide,
				4: 5400002,Angola,11-Oct-90,11-Oct-90,6,Shipyard workers,Central government,0,Luanda,3000 shipyard workers strike for one morning to protest currency reforms.
				5: 5400064,Angola,19-Oct-90,19-Oct-90,9,Armed guerrillas,Chevron Corp.,0,Cabinda,Rebels abduct a mechanic contracted by Chevron.
				6: -5400003,Angola,1-Jun-91,31-Dec-91,-9,FLEC-FAC,Government,-77,Cabinda,
				7: 5400004,Angola,16-Jul-91,3-Aug-91,6,Oil workers,Cabinda Gulf Oil Company,0,Cabinda,2500 oil workers strike for higher pay and improved housing.

				[{"eventid":"6150001","countryname":"Algeria","startdate":"31-May-90","enddate":"31-May-90","etype":"Organized Demonstration","actor1":"Socialist Forces Front","target1":"Government","ndeath":"0","elocal":"Algiers","issuenote":"Political party calls for march demanding true democratic elections"},
				{"eventid":"6150207","countryname":"Algeria","startdate":"21-Sep-10","enddate":"21-Sep-10","etype":"Spontaneous Demonstration","actor1":"Christians","target1":"Government","ndeath":"0","elocal":"Algiers","issuenote":"Christians protest at the trial of two Christians for breaking Ramadan fasting rules."},
				{"eventid":"6150208","countryname":"Algeria","startdate":"4-Oct-10","enddate":"6-Oct-10","etype":"Limited Strike","actor1":"ArcelorMittal steel workers","target1":"ArcelorMittel","ndeath":"0","elocal":"Annaba","issuenote":"Steel workers strike, demanding higher wages."},
				{"eventid":"-5400001","countryname":"Angola","startdate":"11-Nov-75","enddate":"31-Dec-95","etype":false,"actor1":"UNITA","target1":"Government","ndeath":"-77","elocal":"Nationwide","issuenote":""},
				{"eventid":"5400002","countryname":"Angola","startdate":"11-Oct-90","enddate":"11-Oct-90","etype":"Limited Strike","actor1":"Shipyard workers","target1":"Central government","ndeath":"0","elocal":"Luanda","issuenote":"3000 shipyard workers strike for one morning to protest currency reforms."},
				{"eventid":"5400064","countryname":"Angola","startdate":"19-Oct-90","enddate":"19-Oct-90","etype":"Extra-government Violence","actor1":"Armed guerrillas","target1":"Chevron Corp.","ndeath":"0","elocal":"Cabinda","issuenote":"Rebels abduct a mechanic contracted by Chevron."},
				{"eventid":"-5400003","countryname":"Angola","startdate":"1-Jun-91","enddate":"31-Dec-91","etype":false,"actor1":"FLEC-FAC","target1":"Government","ndeath":"-77","elocal":"Cabinda","issuenote":""},
				{"eventid":"5400004","countryname":"Angola","startdate":"16-Jul-91","enddate":"3-Aug-91","etype":"Limited Strike","actor1":"Oil workers","target1":"Cabinda Gulf Oil Company","ndeath":"0","elocal":"Cabinda","issuenote":"2500 oil workers strike for higher pay and improved housing."}]

				*/

				"eventid,countryname,startdate,enddate,etype,actor1,target1,ndeath,elocal,issuenote\n6150001,Algeria,31-May-90,31-May-90,1,Socialist Forces Front,Government,0,Algiers,Political party calls for march demanding true democratic elections\n6150207,Algeria,21-Sep-10,21-Sep-10,2,Christians,Government,0,Algiers,Christians protest at the trial of two Christians for breaking Ramadan fasting rules.\n6150208,Algeria,4-Oct-10,6-Oct-10,6,ArcelorMittal steel workers,ArcelorMittel,0,Annaba,\"Steel workers strike, demanding higher wages.\"\n-5400001,Angola,11-Nov-75,31-Dec-95,-9,UNITA,Government,-77,Nationwide,\n5400002,Angola,11-Oct-90,11-Oct-90,6,Shipyard workers,Central government,0,Luanda,3000 shipyard workers strike for one morning to protest currency reforms.\n5400064,Angola,19-Oct-90,19-Oct-90,9,Armed guerrillas,Chevron Corp.,0,Cabinda,Rebels abduct a mechanic contracted by Chevron.\n-5400003,Angola,1-Jun-91,31-Dec-91,-9,FLEC-FAC,Government,-77,Cabinda,\n5400004,Angola,16-Jul-91,3-Aug-91,6,Oil workers,Cabinda Gulf Oil Company,0,Cabinda,2500 oil workers strike for higher pay and improved housing.\n",

				{ 
					"etype": {
		           				'1' : 'Organized Demonstration',
		                        '2' : 'Spontaneous Demonstration',
		                        '3' : 'Organized Violent Riot',
		                        '4' : 'Spontaneous Violent Riot',
		                        '5' : 'General Strike',
		                        '6' : 'Limited Strike',
		                        '7' : 'Pro-Government Violence (Repression)',
		                        '8' : 'Anti-Government Violence',
		                        '9' : 'Extra-government Violence',
		                        '10' : 'Intra-government Violence'
		            		}
				}, 

				function(jsonArray) {
		    		dataset = new jsonDatabase.Dataset(

					  jsonArray,

		              {
					      eventid: 	 { header: "eventid", 	  columnType: jsonDatabase.NumberIndex},
		           		  countryname:  { header: "countryname", columnType: jsonDatabase.CategoryIndex}, 
		           		  startdate:    { header: "startdate",   columnType: jsonDatabase.DateIndex}, 
		           		  enddate:      { header: "enddate",     columnType: jsonDatabase.DateIndex},
		           		  etype:        { header: "etype", 	  columnType: jsonDatabase.CategoryIndex},
		           		  issuenote:    { header: "issuenote",   columnType: jsonDatabase.TextIndex}
		          	  },

		              function(dataset) {	//not entirely comfortable with this being a passed value

							ps = new jsonDatabase.PreparedStatement.PreparedStatement(
									dataset, 
									jsonDatabase.PreparedStatement.psAnd(
										jsonDatabase.PreparedStatement.psWhere("etype","etype"), 
										jsonDatabase.PreparedStatement.psWhere("countryname","countryname"),
										jsonDatabase.PreparedStatement.psWhere("startdate","startdate"),
										jsonDatabase.PreparedStatement.psWhere("issuenote","issuenote")
										),
									//{"exit": exitFromTable.bind(this, "dataTable"),
									// "enter": enterToTable.bind(this, "dataTable")};
									function(resultObj) { 
										retVal = resultObj; 
									});
							doneFlag = true;

		              });
				});
		});

		waitsFor(function () { return doneFlag !== null; } , 'Timed out', 1000);

	//});

	describe('PreparedStatement.js', function() {

		beforeEach(function() {
			this.addMatchers({
			    toMatchByEventId: function(expected) {
			      return arrEq(this.actual.map(function(v) {return +v.eventid; }), expected);
			    }
			  });
		});
		//CONSIDER WHETHER IT SHOULD ACTUALLY NEED "PRIMED" LIKE THIS
		it('selection from each', function() {
			runs(function() {
				retVal = false;
				runs(function() {
					ps.evaluate("etype", ["Limited Strike"]);
					ps.evaluate("countryname", ["Algeria"]);
					ps.evaluate("startdate", ["1-Jan-90", "1-Jan-11"]);
					ps.evaluate("issuenote", ["steel"]);
				});
				waitsFor(function () { return retVal !== false; } , 'Timed out', 1000);
		    	runs(function() { expect(retVal).toMatchByEventId([6150208]) });
			});
		});

		it('reselection of same from categorical', function() {
			runs(function() {
				retVal = false;
				runs(function() { ps.evaluate("countryname", ["Algeria"]); });
				waitsFor(function () { return retVal !== false; } , 'Timed out', 1000);
		    	runs(function() { expect(retVal).toMatchByEventId([6150208])});
	    	});
		});

		it('selection of multiple from categorical but intersected out', function() {
			runs(function() {
				retVal = false;
				runs(function() { ps.evaluate("countryname", ["Algeria","Angola"]); });
				waitsFor(function () { return retVal !== false; } , 'Timed out', 1000);
		    	runs(function() { expect(retVal).toMatchByEventId([6150208])});
	    	});
		});

		it('selection of non-existent from categorical', function() {
			runs(function() {
				retVal = false;
				runs(function() { ps.evaluate("countryname", ["RandomCountryName"]); });
				waitsFor(function () { return retVal !== false; } , 'Timed out', 1000);
		    	runs(function() { expect(retVal).toMatchByEventId([])});
	    	});
		});

		it('selection of multiple from categorical but intersected out', function() {
			runs(function() {
				retVal = false;
				runs(function() { ps.evaluate("countryname", ["Algeria","Angola"]); });
				waitsFor(function () { return retVal !== false; } , 'Timed out', 1000);
		    	runs(function() { expect(retVal).toMatchByEventId([6150208])});
	    	});
		});

		it('new text expanding what intersects out', function() {
			runs(function() {
				retVal = false;
				runs(function() { ps.evaluate("issuenote", ["strike"]); });
				waitsFor(function () { return retVal !== false; } , 'Timed out', 1000);
		    	runs(function() { expect(retVal).toMatchByEventId([6150208,5400002,5400004])});
	    	});
		});

		//SHOULD THE INDEXEDTEXTCOLUMN REALLY INCLUDE SUCH A PARTICULAR INTERPRETATION OF A STRING WITH 
		//MULTIPLE WORDS
		it('additional text narrowing matches', function() {
			runs(function() {
				retVal = false;
				runs(function() { ps.evaluate("issuenote", ["strike morning"]); });
				waitsFor(function () { return retVal !== false; } , 'Timed out', 1000);
		    	runs(function() { expect(retVal).toMatchByEventId([5400002])});
	    	});
		});

		it('deleted text to expanded matches', function() {
			runs(function() {
				retVal = false;
				runs(function() { ps.evaluate("issuenote", ["p"]); });
				waitsFor(function () { return retVal !== false; } , 'Timed out', 1000);
		    	runs(function() { expect(retVal).toMatchByEventId([5400002,5400004])});
	    	});
		});

		it('additional categorical', function() {
			runs(function() {
				retVal = false;
				runs(function() { ps.evaluate("etype", ["Organized Demonstration", "Limited Strike"]); });
				waitsFor(function () { return retVal !== false; } , 'Timed out', 1000);
		    	runs(function() { expect(retVal).toMatchByEventId([6150001,5400002,5400004])});
	    	});
		});
		
	});
});

//THIS DOES NOT TEST, MOST NOTABLY, WHEN ITERATORS ARE ADVANCED

//KEEP IN MIND THAT PREPAREDSTATEMENT WILL SIMPLY RETURN A VALUE IF IT IS NOT PASSED A 
//CALLBACK.  WOULD BE EASIER WAY TO TEST.
