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
      if (source === 'edit') {
        changes.forEach(function (item) {
          //console.debug(item);
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

            deps.forEach(function (itemId) {
              plugin.matrix.updateItem(itemId, {needUpdate: true});
            });

            instance.render();
          }

        });
      }
    };

    var beforeAutofillInsidePopulate = function (r, c, direction, data) {
      var value = data[r][c],
          delta = 0,
          rlength = data.length, // rows
          clength = data ? data[0].length : 0, //cols
          prev, next;

      if (value[0] === '=') {

        delta = rlength;
        return plugin.utils.updateFormula(value, direction, delta);

      } else {

        // min 2 selected cells
        if (rlength >= 2 || clength >= 2) {
          var newValue = plugin.helper.number(value);

          if (plugin.utils.isNumber(newValue)) {

            if (['down', 'up'].indexOf(direction) !== -1) {

              prev = data[r - 1] ? plugin.helper.number(data[r - 1][c]) : null;
              next = data[r + 1] ? plugin.helper.number(data[r + 1][c]) : null;

              if (newValue === prev || newValue === next) {
                return newValue;
              }

              if (direction === 'up') {

                if (plugin.utils.isSet(prev)) {
                  if (Math.abs(newValue - prev) !== 1) {
                    delta = 1;
                  }
                } else {
                  if (Math.abs(next - newValue) !== 1) {
                    delta = 1;
                  } else {
                    delta = rlength;
                  }

                }

              } else if (direction === 'down') {

                if (next) {
                  if (Math.abs(next - newValue) !== 1) {
                    delta = 1;
                  }
                } else {
                  if (Math.abs(newValue - prev) !== 1) {
                    delta = 1;
                  } else {
                    delta = rlength;
                  }

                }
              }

              if (!delta) {
                delta = rlength;
              }

            } else if (['left', 'right'].indexOf(direction) !== -1) {

              prev = plugin.helper.number(data[r][c - 1]);
              next = plugin.helper.number(data[r][c + 1]);

              if (newValue === prev || newValue === next) {
                return newValue;
              }

              if (direction === 'left') {

                if (plugin.utils.isSet(prev)) {
                  if (Math.abs(prev - newValue) !== 1) {
                    delta = 1;
                  }
                } else {
                  //if (Math.abs(newValue - next) !== 1) {
                    delta = 1;
                  //} else {
                  //  delta = clength;
                  //}
                }

              } else if (direction === 'right') {

                if (plugin.utils.isSet(next)) {

                  if (Math.abs(next - newValue) !== 1) {
                    delta = 1;
                  }
                } else {
                  if (Math.abs(newValue - prev) !== 1) {
                    delta = 1;
                  } else {
                    delta = clength;
                  }
                }

              }

              if (!delta) {
                delta = clength;
              }
            }

            if (newValue < 0) {
              delta *= (-1);
            }

            return plugin.utils.updateValue(newValue, direction, delta);
          }
        }

      }

      return value;
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

        plugin = new ruleJS();
        plugin.init();

        plugin.custom = custom;

        Handsontable.cellTypes['formula'] = formulaCell;
        Handsontable.TextCell.renderer = formulaRenderer;


        Handsontable.hooks.add('beforeAutofillInsidePopulate', beforeAutofillInsidePopulate);
        Handsontable.hooks.add('afterChange', afterChange);
      }
    };
  }

  var htFormula = new HandsontableFormula();

  Handsontable.hooks.add('beforeInit', htFormula.init);

})(Handsontable);
