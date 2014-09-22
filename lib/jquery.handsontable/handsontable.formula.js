(function (Handsontable) {
  'use strict';

  function HandsontableFormula() {

    var instance,
        pluginEnabled = false;

    var formulaRenderer = function (instance, TD, row, col, prop, value, cellProperties) {

      // translate coordinates into cellId
      var cellId = instance.ruleJS.utils.translateCellCoords({row: row, col: col + 1}),
          formula = null;

      // clear item in matrix
      instance.ruleJS.matrix.removeItem(cellId);

      // check if typed formula
      if (value && value[0] === '=') {
        formula = value.substr(1);

        // define item to rulesJS matrix
        var item = {
          id: cellId,
          formula: formula
        };

        // add item to matrix
        var addedItem = instance.ruleJS.matrix.addItem(item);

        // parse formula
        var newValue = instance.ruleJS.parse(formula, {row: row, col: col});

        // update item value and error
        instance.ruleJS.matrix.updateItem(addedItem, {value: newValue.result, error: newValue.error});

        // update cell value in hot
        value = newValue.result || newValue.error;

        TD.style.backgroundColor = 'yellow';
      }

      // set formula meta for cell
      instance.setCellMetaObject(row, col, {formula: formula});

      // apply changes
      textCell.renderer.apply(this, [instance, TD, row, col, prop, value, cellProperties]);
    };

    var beforeAutofill = function (start, end, data, selRange) {
      //console.debug(start);
      //console.debug(end);
      //console.debug(data);
      //data[0] = ['=SUM(1,2)'];
      //console.debug(selRange)
      var diffRow = selRange.row - selRange.row,
          diffCol = selRange.col - selRange.col;

      var autofill = null;

      if (diffRow) {
        autofill = 'row'
      } else if (diffCol) {
        autofill = 'col';
      }

      for (var row = start.row; row <= end.row; row++) {
        for (var col = start.col; col <= end.col; col++) {
          //console.debug('row:', row, ' col:', col);
          if (instance.getCellMeta(row, col).formula) {
            debugger;
            //console.debug('dd')
          }
        }
      }

      if (autofill) {
        //instance.setCellMetaObject(1, 1, {'formula-increment-type': autofill});
      }
    };

    var formulaCell = {
      renderer: formulaRenderer,
      editor: Handsontable.editors.TextEditor,
      dataType: 'formula'
    };

    var textCell = {
      renderer: Handsontable.renderers.TextRenderer,
      editor: Handsontable.editors.TextEditor
    };

    this.init = function () {
      instance = this;
      pluginEnabled = !!instance.getSettings().formulas;

      if (pluginEnabled) {

        var custom = {
          cellValue: instance.getDataAtCell,
          getCellMeta: instance.getCellMeta
//          setCellMetaObject: instance.setCellMetaObject
        };

        instance.ruleJS = new ruleJS();
        instance.ruleJS.init();

        instance.ruleJS.custom = custom;

        Handsontable.cellTypes['formula'] = formulaCell;
        Handsontable.TextCell.renderer = formulaRenderer;

        Handsontable.hooks.add('beforeAutofill', beforeAutofill);
      }
    };
  }

  var htFormula = new HandsontableFormula();

  Handsontable.hooks.add('beforeInit', htFormula.init);

})(Handsontable);
