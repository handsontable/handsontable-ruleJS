handsontable-RuleJS
===================

Plugin for handsontable using RuleJS library (formulas parser).

## Usage

__Important:__ Few things have been modified in external libraries, so please use all library files only from this repo.


First, include the dependencies (all files you can find in `lib\` directory):


*  Handsontable (js + css) (ver. 0.12.3). 

```html
<script src="lib/handsontable/handsontable.full.js"></script>
<link rel="stylesheet" media="screen" href="lib/handsontable/handsontable.full.css">
```


*  External libraries 

```html
<script src="lib/RuleJS/lib/lodash/lodash.js"></script>
<script src="lib/RuleJS/lib/underscore.string/underscore.string.js"></script>
<script src="lib/RuleJS/lib/moment/moment.js"></script>
<script src="lib/RuleJS/lib/numeral/numeral.js"></script>
<script src="lib/RuleJS/lib/numericjs/numeric.js"></script>
<script src="lib/RuleJS/lib/js-md5/md5.js"></script>
<script src="lib/RuleJS/lib/jstat/jstat.js"></script>
<script src="lib/RuleJS/lib/formulajs/formula.js"></script>
```


*  RuleJS library + plugin for handsontable

```html
<script src="lib/RuleJS/js/parser.js"></script>
<script src="lib/RuleJS/js/ruleJS.js"></script>
<script src="lib/handsontable/handsontable.formula.js"></script>
<link rel="stylesheet" media="screen" href="lib/handsontable/handsontable.formula.css">
```

Then, run `handsontable()` constructor on an empty div and use `formulas:true` in settings.

```html
<div id="example1"></div>
<script>
 var data = [
    ['=$B$2', "Maserati", "Mazda", "Mercedes", "Mini", "=A$1"],
    [2009, 0, 2941, 4303, 354, 5814],
    [2010, 5, 2905, 2867, '=SUM(A4,2,3)', '=$B1'],
    [2011, 4, 2517, 4822, 552, 6127],
    [2012, '=SUM(A2:A5)', '=SUM(B5,E3)', '=A2/B2', 12, 4151]
  ];
  
  $('#example1').handsontable({
    data: data,
    colHeaders: true,
    rowHeaders: true,
    formulas: true
  });
</script>
```


## Features


* math functions: `+` `-` `*` `/` `^`
* logical functions: `=` `>` `<` `>=` `<=` `<>` `NOT`
* error handling: `#DIV/0!` `#ERROR` `#VALUE!` `#REF!` `#NAME?` `#N/A`
* parser excel formulas ([list of supported formulas with links to documentation](http://handsontable.github.io/ruleJS/))
* absolute cell references: `$A$1` `$A1` `A$1`
* nested functions 
* simple auto-fill 
* dynamic updates - alter table
* auto fill (simple)


## Demo

[link](http://handsontable.github.io/handsontable-ruleJS/)
