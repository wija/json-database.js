#json-database.js

##Overview

Usage is documented in the wiki.

This is a browser-based in-memory database designed to allow highly interactive visualizations of large datasets. 

The library can be used in two ways. In the first, it can replace the use of `filter` or `for` loops to filter arrays of JavaScript objects ("JSON").  You provide an array of objects and specify which properties should be indexed for fast retrieval; it returns arrays of objects corresponding to queries. 

In the other way of using the library - with "query templates" - it provides additional performance gains for incrementally adjusted queries and makes it easier to build interactive visualizations in the browser.  You still provide an array of objects and specify indexes, but you pass new queries from event handlers and provide a callback to receive - and presumably render - the results. 

How does the library speed up data access? 
 
* Textual data is indexed with a trie.

* Categorical data is indexed with object properties, generally providing hashtable-like performance. When multiple categories are selected, it is necessary to merge the indices corresponding to each category; however, the most recent result is cached so as to make this more efficient when queries change incrementally.

* Continuous numerical data is indexed using binary search against a sorted array. The most recent result is cached to permit incremental updates when queries change incrementally. 

* When query templates are used, partial query results are cached, providing further performance gains.

New index types can be defined, including by sub-classing existing index types. Thus, for example, `DateIndex` is a trivial subclass of `NumberIndex`.

What are the downsides?

* This is a new library, presumably has bugs, and has not yet been made compatible with older browsers (although doing so should be straightforward).

* The database created is read only. It would be relatively straightforward to allow updates, additions, and deletions, but these operations would not necessarily be fast and, as it would be necessary to invalidate caches, the performance gains for reads would evaporate if reads and writes were interleaved. Put simply, this is not the intended use case.

* Indexing takes time.  Not much time, and it only happens once, of course, but it is doubtless an unacceptable amount for some applications.  That said, I have not yet made any attempt to optimize  indexing, and there is some very low hanging fruit.

* The performance gains are substantial - detailed benchmarks to come - when using a `QueryTemplate` to support incrementally adjusted queries. But, when using the library to make a series of ad hoc or otherwise unrelated queries, there is a great deal of variance in performance: In some cases, using the library will result in enormous improvements but, in others, overhead related to merging query results results in worse performance than that provided by a well-crafted `filter`.

##TODO

###Core performance 

* Go back to returning iterators instead of arrays. Even if the entire result set is always used, it looks like this can provide 5-10x speed ups on large data sets simply by reducing allocation and garbage collection.

* Calculate enter/exit/update (added/removed/same) within Collection.where rather than inside of web apps. This is necessary if returning iterators, and it will allow optimizing this there to take advantage of what is produced by the indexes.

* TextIndex should cache the last query result and diff strings to take advantage; massive performance improvement for little effort.

* The series of unions made in CategoryIndex.select/any results in lots of unnecessary allocations.

* Figure out whether it would make sense to do k-way merges instead of reducing over union all over the place. 

* Experiment with the trade off between doing set operations on unsorted arrays vs having to sometimes sort arrays before calling them.

###Miscellaneous features

* A query against DateIndex should be made in terms of JavaScript Date objects even if the underlying data has a different format.

* Think through the place of Codebook and whether that functionality would better be provided in way similar to converterToNumber.

* Add lessThan and greaterThan to NumberIndex.select.

* Add a difference operator to Collection and QueryTemplate.

* Refine TextIndex's autoCompleteSearch deals with the prefix/exact search distinction; probably, a space at the end of the string should mean an exact search, but think through how to make this work with tokenization.

* Fix or replace the stop words lists to get rid of encoding issue.

* Reconsider query chaining and whether indexes should return indexes.

###Clean up

* Make the use of require less messy.

* Update test suite so that it actually covers everything.  Package up the quickcheck-style test of NumberIndex.

* Package properly for use in node.

* Add more error messages, including when invalid keywords are used in where clauses.

* "use strict"

* Add shims and make compatible with older browsers.

* There are some arrays produced during indexing that are left around for no good reason; delete.

* More generally, clean up the indexing code and hit the low hanging performance problems.

* Finish documentation. Re making new indexes, show how to create a categorical index that spans multiple columns, a trivial spatial search (using multiple numerical indices), and wrapping an external library.

* Better comments

* Polish the benchmarks
