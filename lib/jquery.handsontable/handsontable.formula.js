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

      var from = selRange.from,
          to = selRange.to;

      var type,
          direction;
//
//      data[0] = ['dupa1'];
//      data[1] = ['dupa2'];
//      data[2] = ['dupa3'];

      console.debug(data);

      if (from.row !== start.row) {
        type = 'row';

        if (start.row > from.row) {
          direction = 'down';
        } else {
          direction = 'up';
        }

      } else if (from.col !== start.col) {
        type = 'col';

        if (start.col > from.col) {
          direction = 'right';
        } else {
          direction = 'left';
        }

      }


      console.debug(start, end);
      console.debug(newData);

      //if (selRange.from.row)

      //console.debug(data);

//      var autofill = null;
//
//      if (diffRow) {
//        autofill = 'row'
//      } else if (diffCol) {
//        autofill = 'col';
//      }
//      console.debug(selRange);
//      console.debug('start:', start, ' end:' , end);
//      for (var row = start.row; row <= end.row; row++) {
//        for (var col = start.col; col <= end.col; col++) {
//          //console.debug('row:', row, ' col:', col);
//          if (instance.getCellMeta(row, col).formula) {
//            debugger;
//            //console.debug('dd')
//          }
//        }
//      }
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
          cellValue: instance.getDataAtCell
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
