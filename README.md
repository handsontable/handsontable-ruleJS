handsontable-RuleJS
===================

Plugin for handsontable using RuleJS library (formulas parser)

 
([demo](http://handsontable.github.io/handsontable-RuleJS/))


## Usage

First, include the dependencies (all files you can find in `lib\` directory):

1. Handsontable (js + css) (ver. 0.11.2). Few things have been modified in core handsontable, so please use version ht from this repo. 

```html
<script src="lib/jquery.handsontable/jquery.handsontable.full.js"></script>
<link rel="stylesheet" media="screen" href="lib/jquery.handsontable/jquery.handsontable.full.css">
```


2. External libraries 

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


3. RuleJS library + plugin for handsontable

```html
<script src="lib/RuleJS/js/parser.js"></script>
<script src="lib/RuleJS/js/ruleJS.js"></script>
<script src="lib/jquery.handsontable/handsontable.formula.js"></script>
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
