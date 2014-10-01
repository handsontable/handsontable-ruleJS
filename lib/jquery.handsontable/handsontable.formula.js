/**
 * TODO: add tests
 */

(function (Handsontable) {
  'use strict';

  function HandsontableFormula() {

    var instance,
        plugin,
        pluginEnabled = false;

    var formulaRenderer = function (instance, TD, row, col, prop, value, cellProperties) {

      // translate coordinates into cellId
      var cellId = plugin.utils.translateCellCoords({row: row, col: col}),
          prevFormula = null,
          formula = null,
          needUpdate = false,
          error, result;

      if (!cellId) {
        return;
      }

      // get cell data
      var item = plugin.matrix.getItem(cellId);

      if (item && item.error) {
        prevFormula = item.formula;
        error = item.error;
        needUpdate = item.needUpdate;

        if (needUpdate) {
          error = null;
        }
      }

      // check if typed formula or cell value should be recalculated
      if ((value && value[0] === '=') || needUpdate) {

        formula = value.substr(1).toUpperCase();

        if (!error || formula !== prevFormula) {

          var currentItem = item;

          if (!currentItem) {

            // define item to rulesJS matrix if not exists
            item = {
              id: cellId,
              formula: formula
            };

            // add item to matrix
            currentItem = plugin.matrix.addItem(item);
          }

          // parse formula
          var newValue = plugin.parse(formula, {row: row, col: col, id: cellId});

          // update item value and error
          plugin.matrix.updateItem(currentItem, {formula: formula, value: newValue.result, error: newValue.error, needUpdate: false});

          error = newValue.error;
          result = newValue.result;

          // update cell value in hot
          value = error || result;
        }
      }

      if (error) {
        // clear cell value
        if (!value) {
        // reset error
          error = null;
        } else {
        // show error
          value = error;
        }
      }

      // change background color
      if (plugin.utils.isSet(error)) {
        TD.style.backgroundColor = 'red';
      } else if (plugin.utils.isSet(result)) {
        TD.style.backgroundColor = 'yellow';
      }

      // apply changes
      textCell.renderer.apply(this, [instance, TD, row, col, prop, value, cellProperties]);
    };

    var afterChange = function (changes, source) {
      if (source === 'edit' || source === 'undo') {

        var rerender = false;

        changes.forEach(function (item) {

          var row = item[0],
              col = item[1],
              prevValue = item[2],
              value = item[3];

          var cellId = plugin.utils.translateCellCoords({row: row, col: col});

          // if changed value, all references cells should be recalculated
          if (value[0] !== '=' || prevValue !== value) {
            plugin.matrix.removeItem(cellId);

            // get referenced cells
            var deps = plugin.matrix.getDependencies(cellId);

            // update cells
            deps.forEach(function (itemId) {
              plugin.matrix.updateItem(itemId, {needUpdate: true});
            });

            rerender = true;
          }
        });

        if (rerender) {
          instance.render();
        }
      }
    };

    var beforeAutofillInsidePopulate = function (index, direction, data, deltas, iterators, selected) {
      var r = index.row,
          c = index.col,
          value = data[r][c],
          delta = 0,
          rlength = data.length, // rows
          clength = data ? data[0].length : 0; //cols

      if (value[0] === '=') { // formula

        if (['down', 'up'].indexOf(direction) !== -1) {
          delta = rlength * iterators.row;
        } else if (['right', 'left'].indexOf(direction) !== -1) {
          delta = clength * iterators.col;
        }

        return {
          value: plugin.utils.updateFormula(value, direction, delta),
          iterators: iterators
        }

      } else { // other value

        // increment or decrement  values for more than 2 selected cells
        if (rlength >= 2 || clength >= 2) {

          var newValue = plugin.helper.number(value),
              ii,
              start;

          if (plugin.utils.isNumber(newValue)) {

            if (['down', 'up'].indexOf(direction) !== -1) {

              delta = deltas[0][c];

              if (direction === 'down') {
                newValue += (delta * rlength * iterators.row);
              } else {

                ii = (selected.row - r) % rlength;
                start = ii > 0 ? rlength - ii : 0;

                newValue = plugin.helper.number(data[start][c]);

                newValue += (delta * rlength * iterators.row);

                // last element in array -> decrement iterator
                // iterator cannot be less than 1
                if (iterators.row > 1 && (start + 1) === rlength) {
                  iterators.row--;
                }
              }

            } else if (['right', 'left'].indexOf(direction) !== -1) {
              delta = deltas[r][0];

              if (direction === 'right') {
                newValue += (delta * clength * iterators.col);
              } else {

                ii = (selected.col - c) % clength;
                start = ii > 0 ? clength - ii : 0;

                newValue = plugin.helper.number(data[r][start]);

                newValue += (delta * clength * (iterators.col || 1));

                // last element in array -> decrement iterator
                // iterator cannot be less than 1
                if (iterators.col > 1 && (start + 1) === clength) {
                  iterators.col--;
                }
              }
            }

            return {
              value: newValue,
              iterators: iterators
            }

          }
        }

      }

      return {
        value: value,
        iterators: iterators
      };
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
      pluginEnabled = !!this.getSettings().formulas;

      if (pluginEnabled) {

        instance = this;

        var custom = {
          cellValue: instance.getDataAtCell
        };

        plugin = new ruleJS();
        plugin.init();

        plugin.custom = custom;

        Handsontable.cellTypes['formula'] = formulaCell;
        Handsontable.TextCell.renderer = formulaRenderer;

        Handsontable.hooks.add('afterChange', afterChange);
        Handsontable.hooks.add('beforeAutofillInsidePopulate', beforeAutofillInsidePopulate);
      }
    };
  }

  var htFormula = new HandsontableFormula();

  Handsontable.hooks.add('beforeInit', htFormula.init);

})(Handsontable);
