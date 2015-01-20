describe('Formula', function () {
  var id = 'testContainer',
      data = [];

  function createBigData() {
    var rows = []
      , i
      , j;

    for (i = 0; i < 1000; i++) {
      var row = [];
      for (j = 0; j < 36; j++) {
        row.push(Handsontable.helper.spreadsheetColumnLabel(j) + (i + 1));
      }
      rows.push(row);
    }

    return rows;
  }

  beforeEach(function () {
    data = [
      ['=$B$2', "Maserati", "Mazda", "Mercedes", "Mini", "=A$1"],
      [2009, 0, 2941, '=E2', 354, 5814],
      [2010, '=ROUND(SUM(PI(), 2), 2)', 2905, 2867, '=SUM(A4,2,3)', '=$B1'],
      [2011, 4, 2517, 4822, 552, 6127],
      [2012, '=SUM(A2:A5)', '=SUM(B5,E3)', '=A2/B2', 12, 4151]
    ];

    this.$container = $('<div id="' + id + '"></div>').appendTo('body');
  });

  afterEach(function () {
    data = [];

    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  it('should parse formulas for formulas: true', function () {
    handsontable({
      data: data,
      colHeaders: true,
      rowHeaders: true,
      formulas: true
    });

    var htCore = getHtCore();

    expect(htCore.find('tbody tr:eq(0) td:eq(0)').text()).toEqual("0");
    expect(htCore.find('tbody tr:eq(4) td:eq(1)').text()).toEqual("8042");
  });

  it('should not parse formulas for formulas: false', function () {
    handsontable({
      data: data,
      colHeaders: true,
      rowHeaders: true,
      formulas: false
    });

    var htCore = getHtCore();

    expect(htCore.find('tbody tr:eq(0) td:eq(0)').text()).toEqual("=$B$2");
    expect(htCore.find('tbody tr:eq(4) td:eq(1)').text()).toEqual("=SUM(A2:A5)");
  });

  it('should insert formula into cell by passing \'=\' as the first character', function () {
    var hot = handsontable({
      data: createBigData(),
      colHeaders: true,
      rowHeaders: true,
      formulas: true
    });

    var htCore = getHtCore();
    var formula = '=C1';

    hot.setDataAtCell(0, 1, formula);

    var B1 = hot.getDataAtCell(0, 1);
    var C1 = hot.getDataAtCell(0, 2);

    expect(B1).toBe(formula);
    expect(htCore.find('tbody tr:eq(0) td:eq(1)').text()).toEqual(C1);

    formula = '=AA1';
    hot.setDataAtCell(0, 1, formula);
    var AA1 = hot.getDataAtCell(0, 26);

    expect(htCore.find('tbody tr:eq(0) td:eq(1)').text()).toEqual(AA1);

  });

  it('should show formula cell by pressing ENTER or F2', function () {
    var hot = handsontable({
      data: data,
      colHeaders: true,
      rowHeaders: true,
      formulas: true
    });

    var htCore = getHtCore();
    expect(htCore.find('tbody tr:eq(1) td:eq(3)').text()).toEqual("354");

    var D2 = hot.getDataAtCell(1, 3);

    selectCell(1, 3);
    keyDown(Handsontable.helper.keyCode.ENTER);
    expect($('.handsontableInput').val()).toEqual(D2);
    keyDown(Handsontable.helper.keyCode.ENTER);

    selectCell(1, 3);
    keyDown(Handsontable.helper.keyCode.F2);
    expect($('.handsontableInput').val()).toEqual(D2);
    keyDown(Handsontable.helper.keyCode.ENTER);

  });

  it('should get and set single cell value ex.: =A1', function () {
    var hot = handsontable({
      data: data,
      colHeaders: true,
      rowHeaders: true,
      formulas: true
    });

    var htCore = getHtCore();

    expect(htCore.find('tbody tr:eq(1) td:eq(3)').text()).toEqual(htCore.find('tbody tr:eq(1) td:eq(4)').text());

    hot.setDataAtCell(1, 5, '=E2');

    expect(htCore.find('tbody tr:eq(1) td:eq(5)').text()).toEqual(htCore.find('tbody tr:eq(1) td:eq(4)').text());
  });

  it('should get and set range cell ex.: =SUM(A2:A5)', function () {
    var hot = handsontable({
      data: data,
      colHeaders: true,
      rowHeaders: true,
      formulas: true
    });

    var htCore = getHtCore();

    expect(htCore.find('tbody tr:eq(4) td:eq(1)').text()).toEqual('8042');

    hot.setDataAtCell(1, 5, '=SUM(A4:A6)');

    expect(htCore.find('tbody tr:eq(1) td:eq(5)').text()).toEqual('4023');
  });

  it('should calculate nested functions', function () {
    handsontable({
      data: data,
      colHeaders: true,
      rowHeaders: true,
      formulas: true
    });

    var htCore = getHtCore();

    expect(htCore.find('tbody tr:eq(2) td:eq(1)').text()).toEqual("5.14");
  });

  it('should get absolute single cell value ex.: =$A1 or =A$1 or =$A$1', function () {
    var hot = handsontable({
      data: data,
      colHeaders: true,
      rowHeaders: true,
      formulas: true
    });

    var htCore = getHtCore();
    hot.setDataAtCell(0, 2, '=$B1');

    expect(htCore.find('tbody tr:eq(0) td:eq(2)').text()).toEqual(htCore.find('tbody tr:eq(0) td:eq(1)').text());

    hot.setDataAtCell(0, 2, '=B$1');
    expect(htCore.find('tbody tr:eq(0) td:eq(2)').text()).toEqual(htCore.find('tbody tr:eq(0) td:eq(1)').text());

    hot.setDataAtCell(0, 2, '=$B$1');
    expect(htCore.find('tbody tr:eq(0) td:eq(2)').text()).toEqual(htCore.find('tbody tr:eq(0) td:eq(1)').text());
  });

  it('should parse formulas when there are two instances ht and one has formulas enabled', function () {
    var hot = handsontable({
      data: data,
      colHeaders: true,
      rowHeaders: true,
      formulas: true
    });

    var htCore = getHtCore();
    hot.setDataAtCell(0, 2, '=$B1');

    expect(htCore.find('tbody tr:eq(0) td:eq(2)').text()).toEqual(htCore.find('tbody tr:eq(0) td:eq(1)').text());

    hot.setDataAtCell(0, 2, '=B$1');
    expect(htCore.find('tbody tr:eq(0) td:eq(2)').text()).toEqual(htCore.find('tbody tr:eq(0) td:eq(1)').text());

    hot.setDataAtCell(0, 2, '=$B$1');
    expect(htCore.find('tbody tr:eq(0) td:eq(2)').text()).toEqual(htCore.find('tbody tr:eq(0) td:eq(1)').text());

    this.$container2 = $('<div id="' + id + '-2"></div>').appendTo('body');
    this.$container2.handsontable({
      data: [
        ['=$B$2', "Maserati", "Mazda", "Mercedes", "Mini", "=A$1"],
        [2009, 0, 2941, '=E2', 354, 5814],
        [2010, '=ROUND(SUM(PI(), 2), 2)', 2905, 2867, '=SUM(A4,2,3)', '=$B1'],
        [2011, 4, 2517, 4822, 552, 6127],
        [2012, '=SUM(A2:A5)', '=SUM(B5,E3)', '=A2/B2', 12, 4151]
      ],
      formulas: false
    });
    var hot2 = this.$container2.handsontable('getInstance');

    expect(this.$container2.find('.htCore').find('tbody tr:eq(0) td:eq(2)').text()).toEqual('Mazda');

    this.$container2.handsontable('destroy');
    this.$container2.remove();
  });

  describe('Errors', function () {
    it('should output #DIV/0! error if divided by zero', function () {
      var hot = handsontable({
        data: data,
        colHeaders: true,
        rowHeaders: true,
        formulas: true
      });

      var htCore = getHtCore();
      hot.setDataAtCell(0, 0, '=1/0');
      expect(htCore.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('#DIV/0!');

      hot.setDataAtCell(1, 0, '0');
      hot.setDataAtCell(2, 0, '=1/A2');

      expect(htCore.find('tbody tr:eq(2) td:eq(0)').text()).toEqual('#DIV/0!');
    });

    it('should output #REF! error if cell formula contain address to the same cell', function () {
      var hot = handsontable({
        data: data,
        colHeaders: true,
        rowHeaders: true,
        formulas: true
      });

      var htCore = getHtCore();
      hot.setDataAtCell(0, 0, '=A1');
      hot.setDataAtCell(1, 1, '=B2');

      expect(htCore.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('#REF!');
      expect(htCore.find('tbody tr:eq(1) td:eq(1)').text()).toEqual('#REF!');
      expect(htCore.find('tbody tr:eq(4) td:eq(3)').text()).toEqual('#REF!');

      hot.setDataAtCell(0, 0, '=C1');
      hot.setDataAtCell(1, 1, '=D2');

      expect(htCore.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('Mazda');
      expect(htCore.find('tbody tr:eq(1) td:eq(1)').text()).toEqual('354');
      expect(htCore.find('tbody tr:eq(4) td:eq(3)').text()).not.toEqual('#REF!');

      hot.setDataAtCell(0, 0, '=B2');
      hot.setDataAtCell(1, 1, '=A1');

      expect(htCore.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('#REF!');
      expect(htCore.find('tbody tr:eq(1) td:eq(1)').text()).toEqual('#REF!');
    });

    it('should output #NAME error if function in formula doesn\'t exists', function () {
      var hot = handsontable({
        data: data,
        colHeaders: true,
        rowHeaders: true,
        formulas: true
      });

      var htCore = getHtCore();

      hot.setDataAtCell(0, 0, '=SU');
      expect(htCore.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('#NAME?');
    });

    it('should output #VALUE! error for not validated cell types', function () {
      var hot = handsontable({
        data: data,
        colHeaders: true,
        rowHeaders: true,
        formulas: true
      });

      var htCore = getHtCore();
      hot.setDataAtCell(1, 3, '=D1/C2');

      expect(htCore.find('tbody tr:eq(1) td:eq(3)').text()).toEqual('#VALUE!');
    });

    it('should output #N/A! error if cell is not in the range of dataset', function () {
      var hot = handsontable({
        data: data,
        colHeaders: true,
        rowHeaders: true,
        formulas: true
      });

      var htCore = getHtCore();
      hot.setDataAtCell(1, 3, '=Z1');

      expect(htCore.find('tbody tr:eq(1) td:eq(3)').text()).toEqual('#N/A!');
    });
  });

  describe('FillHandle', function () {
    it('should calculate delta and add values to next cells if selected 2 or more cells, shift+arrow_down', function () {
      var hot = handsontable({
        startRows: 5,
        startCols: 5,
        colHeaders: true,
        rowHeaders: true,
        formulas: true
      });

      var htCore = getHtCore();

      hot.setDataAtCell(0, 0, '1');
      hot.setDataAtCell(1, 0, '2');

      selectCell(0, 0);
      keyDown('shift+arrow_down');

      this.$container.find('.wtBorder.area.corner').simulate('mousedown');
      this.$container.find('tr:last-child td:eq(0)').simulate('mouseover');
      this.$container.find('.wtBorder.area.corner').simulate('mouseup');

      expect(htCore.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('1');
      expect(htCore.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('2');
      expect(htCore.find('tbody tr:eq(2) td:eq(0)').text()).toEqual('3');
      expect(htCore.find('tbody tr:eq(3) td:eq(0)').text()).toEqual('4');
      expect(htCore.find('tbody tr:eq(4) td:eq(0)').text()).toEqual('5');
    });

    it('should calculate delta and add values to prev cells if selected 2 or more cells, shift+arrow_up', function () {
      var hot = handsontable({
        startRows: 5,
        startCols: 5,
        colHeaders: true,
        rowHeaders: true,
        formulas: true
      });

      var htCore = getHtCore();

      hot.setDataAtCell(3, 0, '1');
      hot.setDataAtCell(4, 0, '2');

      selectCell(4, 0);
      keyDownUp('shift+arrow_up');

      this.$container.find('.wtBorder.area.corner').simulate('mousedown');
      this.$container.find('tr:first-child td:eq(0)').simulate('mouseover');
      this.$container.find('.wtBorder.area.corner').simulate('mouseup');

      expect(htCore.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('-2');
      expect(htCore.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('-1');
      expect(htCore.find('tbody tr:eq(2) td:eq(0)').text()).toEqual('0');
      expect(htCore.find('tbody tr:eq(3) td:eq(0)').text()).toEqual('1');
      expect(htCore.find('tbody tr:eq(4) td:eq(0)').text()).toEqual('2');
    });

    it('should calculate delta and add values to next cells if selected 2 or more cells, shift+arrow_right', function () {
      var hot = handsontable({
        startRows: 5,
        startCols: 5,
        colHeaders: true,
        rowHeaders: true,
        formulas: true
      });

      var htCore = getHtCore();

      hot.setDataAtCell(0, 0, '1');
      hot.setDataAtCell(0, 1, '2');

      selectCell(0, 0);
      keyDownUp('shift+arrow_right');

      this.$container.find('.wtBorder.area.corner').simulate('mousedown');
      this.$container.find('tr:eq(1) td:last-child').simulate('mouseover');
      this.$container.find('.wtBorder.area.corner').simulate('mouseup');

      expect(htCore.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('1');
      expect(htCore.find('tbody tr:eq(0) td:eq(1)').text()).toEqual('2');
      expect(htCore.find('tbody tr:eq(0) td:eq(2)').text()).toEqual('3');
      expect(htCore.find('tbody tr:eq(0) td:eq(3)').text()).toEqual('4');
      expect(htCore.find('tbody tr:eq(0) td:eq(4)').text()).toEqual('5');
    });

    it('should calculate delta and add values to prev cells if selected 2 or more cells, shift+arrow_left', function () {
      var hot = handsontable({
        startRows: 5,
        startCols: 5,
        colHeaders: true,
        rowHeaders: true,
        formulas: true
      });

      var htCore = getHtCore();

      hot.setDataAtCell(0, 3, '1');
      hot.setDataAtCell(0, 4, '2');

      selectCell(0, 4);
      keyDownUp('shift+arrow_left');

      this.$container.find('.wtBorder.area.corner').simulate('mousedown');
      this.$container.find('tr:eq(1) td:eq(0)').simulate('mouseover');
      this.$container.find('.wtBorder.area.corner').simulate('mouseup');

      expect(htCore.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('-2');
      expect(htCore.find('tbody tr:eq(0) td:eq(1)').text()).toEqual('-1');
      expect(htCore.find('tbody tr:eq(0) td:eq(2)').text()).toEqual('0');
      expect(htCore.find('tbody tr:eq(0) td:eq(3)').text()).toEqual('1');
      expect(htCore.find('tbody tr:eq(0) td:eq(4)').text()).toEqual('2');
    });

    it('should update formula, shift+arrow_down', function () {
      var hot = handsontable({
        startRows: 5,
        startCols: 5,
        colHeaders: true,
        rowHeaders: true,
        formulas: true,
        data: [
          [1, '=A1', 10, 100, '=SUM(A1:D1)'],
          [2, '', 20, 200, ''],
          [3, '', 30, 300, ''],
          [4, '', 40, 400, ''],
          [5, '', 50, 500, '']
        ]
      });

      var htCore = getHtCore();

      selectCell(0, 1);

      this.$container.find('.wtBorder.area.corner').simulate('mousedown');
      this.$container.find('tr:last-child td:eq(1)').simulate('mouseover');
      this.$container.find('.wtBorder.area.corner').simulate('mouseup');

      expect(htCore.find('tbody tr:eq(0) td:eq(1)').text()).toEqual('1');
      expect(htCore.find('tbody tr:eq(1) td:eq(1)').text()).toEqual('2');
      expect(htCore.find('tbody tr:eq(2) td:eq(1)').text()).toEqual('3');
      expect(htCore.find('tbody tr:eq(3) td:eq(1)').text()).toEqual('4');
      expect(htCore.find('tbody tr:eq(4) td:eq(1)').text()).toEqual('5');

      selectCell(0, 4);

      this.$container.find('.wtBorder.area.corner').simulate('mousedown');
      this.$container.find('tr:last-child td:eq(4)').simulate('mouseover');
      this.$container.find('.wtBorder.area.corner').simulate('mouseup');

      expect(htCore.find('tbody tr:eq(0) td:eq(4)').text()).toEqual('112');
      expect(htCore.find('tbody tr:eq(1) td:eq(4)').text()).toEqual('224');
      expect(htCore.find('tbody tr:eq(2) td:eq(4)').text()).toEqual('336');
      expect(htCore.find('tbody tr:eq(3) td:eq(4)').text()).toEqual('448');
      expect(htCore.find('tbody tr:eq(4) td:eq(4)').text()).toEqual('560');

      expect(getDataAtCell(0, 4)).toBe('=SUM(A1:D1)');
      expect(getDataAtCell(1, 4)).toBe('=SUM(A2:D2)');
      expect(getDataAtCell(2, 4)).toBe('=SUM(A3:D3)');
      expect(getDataAtCell(3, 4)).toBe('=SUM(A4:D4)');
      expect(getDataAtCell(4, 4)).toBe('=SUM(A5:D5)');
    });

    it('should update formula, shift+arrow_up', function () {
      var hot = handsontable({
        startRows: 5,
        startCols: 5,
        colHeaders: true,
        rowHeaders: true,
        formulas: true,
        data: [
          [1, '', 10, 100, ''],
          [2, '', 20, 200, ''],
          [3, '', 30, 300, ''],
          [4, '', 40, 400, ''],
          [5, '=A5', 50, 500, '=SUM(A5:D5)']
        ]
      });

      var htCore = getHtCore();

      selectCell(4, 1);

      this.$container.find('.wtBorder.area.corner').simulate('mousedown');
      this.$container.find('tr:first-child td:eq(1)').simulate('mouseover');
      this.$container.find('.wtBorder.area.corner').simulate('mouseup');

//      var ev = jQuery.Event('mousedown');
//      ev.target = this.$container.find('.wtBorder.corner')[0]; //fill handle
//
//      htCore.find('tbody tr:eq(4) td:eq(1)').trigger(ev);
//
//      htCore.find('tbody tr:eq(3) td:eq(1)').trigger('mouseenter');
//      htCore.find('tbody tr:eq(2) td:eq(1)').trigger('mouseenter');
//      htCore.find('tbody tr:eq(1) td:eq(1)').trigger('mouseenter');
//      htCore.find('tbody tr:eq(0) td:eq(1)').trigger('mouseenter');
//
//      ev = jQuery.Event('mouseup');
//      ev.target = this.$container.find('.wtBorder.corner')[0]; //fill handle
//      htCore.find('tbody tr:eq(0) td:eq(1)').trigger(ev);

      expect(htCore.find('tbody tr:eq(0) td:eq(1)').text()).toEqual('1');
      expect(htCore.find('tbody tr:eq(1) td:eq(1)').text()).toEqual('2');
      expect(htCore.find('tbody tr:eq(2) td:eq(1)').text()).toEqual('3');
      expect(htCore.find('tbody tr:eq(3) td:eq(1)').text()).toEqual('4');
      expect(htCore.find('tbody tr:eq(4) td:eq(1)').text()).toEqual('5');

      selectCell(4, 4);

      this.$container.find('.wtBorder.area.corner').simulate('mousedown');
      this.$container.find('tr:first-child td:eq(4)').simulate('mouseover');
      this.$container.find('.wtBorder.area.corner').simulate('mouseup');

      expect(htCore.find('tbody tr:eq(0) td:eq(4)').text()).toEqual('112');
      expect(htCore.find('tbody tr:eq(1) td:eq(4)').text()).toEqual('224');
      expect(htCore.find('tbody tr:eq(2) td:eq(4)').text()).toEqual('336');
      expect(htCore.find('tbody tr:eq(3) td:eq(4)').text()).toEqual('448');
      expect(htCore.find('tbody tr:eq(4) td:eq(4)').text()).toEqual('560');

      expect(getDataAtCell(0, 4)).toBe('=SUM(A1:D1)');
      expect(getDataAtCell(1, 4)).toBe('=SUM(A2:D2)');
      expect(getDataAtCell(2, 4)).toBe('=SUM(A3:D3)');
      expect(getDataAtCell(3, 4)).toBe('=SUM(A4:D4)');
      expect(getDataAtCell(4, 4)).toBe('=SUM(A5:D5)');
    });

    it('should update formula, shift+arrow_right', function () {
      var hot = handsontable({
        startRows: 5,
        startCols: 5,
        colHeaders: true,
        rowHeaders: true,
        formulas: true,
        data: [
          [1, 2, 3, 4, 5],
          ['=A1', '', '', '', ''],
          [10, 20, 30, 40, 50],
          [100, 200, 300, 400, 500],
          ['=SUM(A3,A4)', '', '', '', '']
        ]
      });

      var htCore = getHtCore();

      selectCell(1, 0);

      this.$container.find('.wtBorder.area.corner').simulate('mousedown');
      this.$container.find('tr:eq(2) td:eq(4)').simulate('mouseover');
      this.$container.find('.wtBorder.area.corner').simulate('mouseup');

      expect(htCore.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('1');
      expect(htCore.find('tbody tr:eq(1) td:eq(1)').text()).toEqual('2');
      expect(htCore.find('tbody tr:eq(1) td:eq(2)').text()).toEqual('3');
      expect(htCore.find('tbody tr:eq(1) td:eq(3)').text()).toEqual('4');
      expect(htCore.find('tbody tr:eq(1) td:eq(4)').text()).toEqual('5');

      selectCell(4, 0);

      this.$container.find('.wtBorder.area.corner').simulate('mousedown');
      this.$container.find('tr:eq(5) td:eq(4)').simulate('mouseover');
      this.$container.find('.wtBorder.area.corner').simulate('mouseup');

      expect(htCore.find('tbody tr:eq(4) td:eq(0)').text()).toEqual('110');
      expect(htCore.find('tbody tr:eq(4) td:eq(1)').text()).toEqual('220');
      expect(htCore.find('tbody tr:eq(4) td:eq(2)').text()).toEqual('330');
      expect(htCore.find('tbody tr:eq(4) td:eq(3)').text()).toEqual('440');
      expect(htCore.find('tbody tr:eq(4) td:eq(4)').text()).toEqual('550');

      expect(getDataAtCell(4, 0)).toBe('=SUM(A3,A4)');
      expect(getDataAtCell(4, 1)).toBe('=SUM(B3,B4)');
      expect(getDataAtCell(4, 2)).toBe('=SUM(C3,C4)');
      expect(getDataAtCell(4, 3)).toBe('=SUM(D3,D4)');
      expect(getDataAtCell(4, 4)).toBe('=SUM(E3,E4)');
    });

    it('should update formula, shift+arrow_left', function () {
      var hot = handsontable({
        startRows: 5,
        startCols: 5,
        colHeaders: true,
        rowHeaders: true,
        formulas: true,
        data: [
          [1, 2, 3, 4, 5],
          ['', '', '', '', '=E1'],
          [10, 20, 30, 40, 50],
          [100, 200, 300, 400, 500],
          ['', '', '', '', '=SUM(E3,E4)']
        ]
      });

      var htCore = getHtCore();

      selectCell(1, 4);

      this.$container.find('.wtBorder.area.corner').simulate('mousedown');
      this.$container.find('tr:eq(2) td:eq(0)').simulate('mouseover');
      this.$container.find('.wtBorder.area.corner').simulate('mouseup');

      expect(htCore.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('1');
      expect(htCore.find('tbody tr:eq(1) td:eq(1)').text()).toEqual('2');
      expect(htCore.find('tbody tr:eq(1) td:eq(2)').text()).toEqual('3');
      expect(htCore.find('tbody tr:eq(1) td:eq(3)').text()).toEqual('4');
      expect(htCore.find('tbody tr:eq(1) td:eq(4)').text()).toEqual('5');

      selectCell(4, 4);

      this.$container.find('.wtBorder.area.corner').simulate('mousedown');
      this.$container.find('tr:eq(5) td:eq(0)').simulate('mouseover');
      this.$container.find('.wtBorder.area.corner').simulate('mouseup');

      expect(htCore.find('tbody tr:eq(4) td:eq(0)').text()).toEqual('110');
      expect(htCore.find('tbody tr:eq(4) td:eq(1)').text()).toEqual('220');
      expect(htCore.find('tbody tr:eq(4) td:eq(2)').text()).toEqual('330');
      expect(htCore.find('tbody tr:eq(4) td:eq(3)').text()).toEqual('440');
      expect(htCore.find('tbody tr:eq(4) td:eq(4)').text()).toEqual('550');

      expect(getDataAtCell(4, 0)).toBe('=SUM(A3,A4)');
      expect(getDataAtCell(4, 1)).toBe('=SUM(B3,B4)');
      expect(getDataAtCell(4, 2)).toBe('=SUM(C3,C4)');
      expect(getDataAtCell(4, 3)).toBe('=SUM(D3,D4)');
      expect(getDataAtCell(4, 4)).toBe('=SUM(E3,E4)');
    });

    it('should override formula after auto fill', function () {
      var hot = handsontable({
        startRows: 5,
        startCols: 5,
        colHeaders: true,
        rowHeaders: true,
        formulas: true,
        data: [
          [1, 2, 3, 4, 5],
          ['', '=B2', '', '', '=E1'],
          [10, 20, 30, 40, 50],
          [100, 200, 300, 400, 500],
          ['', '', '', '', '=SUM(E3,E4)']
        ]
      });

      var htCore = getHtCore();

      expect(htCore.find('tbody tr:eq(1) td:eq(1)').text()).toEqual('#REF!');

      selectCell(0, 1);

      this.$container.find('.wtBorder.area.corner').simulate('mousedown');
      this.$container.find('tr:eq(2) td:eq(1)').simulate('mouseover');
      this.$container.find('.wtBorder.area.corner').simulate('mouseup');

      expect(getDataAtCell(1, 1)).toBe(2);
      expect(htCore.find('tbody tr:eq(1) td:eq(1)').text()).toEqual('2');

      selectCell(0, 4);

      this.$container.find('.wtBorder.area.corner').simulate('mousedown');
      this.$container.find('tr:eq(5) td:eq(4)').simulate('mouseover');
      this.$container.find('.wtBorder.area.corner').simulate('mouseup');

      expect(getDataAtCell(0, 4)).toBe(5);
      expect(getDataAtCell(4, 4)).toBe(5);
      expect(htCore.find('tbody tr:eq(0) td:eq(4)').text()).toEqual('5');
      expect(htCore.find('tbody tr:eq(4) td:eq(4)').text()).toEqual('5');
    });
  });

  describe('alter - dynamic update', function () {
    it('should update formulas after added column on the left', function () {
      var hot = handsontable({
        startRows: 5,
        startCols: 5,
        colHeaders: true,
        rowHeaders: true,
        formulas: true,
        data: [
          [1, 2, 3, 4, 5],
          ['', '', '', '', '=E1'],
          [10, 20, 30, 40, 50],
          [100, 200, 300, 400, 500],
          ['', '', '', '=SUM(A3:E3)', '']
        ],
        contextMenu: true
      });

      var htCore = getHtCore();

      expect(htCore.find('tbody tr:eq(1) td:eq(4)').text()).toEqual('5');
      expect(htCore.find('tbody tr:eq(4) td:eq(3)').text()).toEqual('150');

      hot.selectCell(0, 1);

      contextMenu();
      $('.htContextMenu .ht_master .htCore').find('tr td:eq("3")').simulate('mousedown'); //insert column left

      expect(hot.countCols()).toEqual(6);

      expect(getDataAtCell(1, 4)).toBe('');
      expect(getDataAtCell(1, 5)).toBe('=F1');
      expect(htCore.find('tbody tr:eq(1) td:eq(4)').text()).toEqual('');
      expect(htCore.find('tbody tr:eq(1) td:eq(5)').text()).toEqual('5');


      expect(getDataAtCell(4, 3)).toBe('');
      expect(getDataAtCell(4, 4)).toBe('=SUM(A3:F3)');
      expect(htCore.find('tbody tr:eq(4) td:eq(3)').text()).toEqual('');
      expect(htCore.find('tbody tr:eq(4) td:eq(4)').text()).toEqual('150');

      hot.selectCell(0, 0);

      contextMenu();
      $('.htContextMenu .ht_master .htCore').find('tr td:eq("3")').simulate('mousedown'); //insert column left
      expect(hot.countCols()).toEqual(7);

      expect(getDataAtCell(1, 5)).toBe('');
      expect(getDataAtCell(1, 6)).toBe('=G1');
      expect(htCore.find('tbody tr:eq(1) td:eq(5)').text()).toEqual('');
      expect(htCore.find('tbody tr:eq(1) td:eq(6)').text()).toEqual('5');

      expect(getDataAtCell(4, 4)).toBe('');
      expect(getDataAtCell(4, 5)).toBe('=SUM(B3:G3)');
      expect(htCore.find('tbody tr:eq(4) td:eq(4)').text()).toEqual('');
      expect(htCore.find('tbody tr:eq(4) td:eq(5)').text()).toEqual('150');
    });

    it('should update formulas after added column on the right', function () {
      var hot = handsontable({
        startRows: 5,
        startCols: 5,
        colHeaders: true,
        rowHeaders: true,
        formulas: true,
        data: [
          [1, 2, 3, 4, 5],
          ['', '', '', '', '=E1'],
          [10, 20, 30, 40, 50],
          [100, 200, 300, 400, 500],
          ['', '', '', '=SUM(A3:E3)', '']
        ],
        contextMenu: true
      });

      var htCore = getHtCore();

      expect(htCore.find('tbody tr:eq(1) td:eq(4)').text()).toEqual('5');
      expect(htCore.find('tbody tr:eq(4) td:eq(3)').text()).toEqual('150');

      hot.selectCell(0, 3);

      contextMenu();
      $('.htContextMenu .ht_master .htCore').find('tr td:eq("4")').simulate('mousedown'); //insert column left

      expect(hot.countCols()).toEqual(6);

      expect(getDataAtCell(1, 4)).toBe(null);
      expect(getDataAtCell(1, 5)).toBe('=F1');

      expect(getDataAtCell(4, 3)).toBe('=SUM(A3:F3)');
      expect(htCore.find('tbody tr:eq(4) td:eq(3)').text()).toEqual('150');

      hot.selectCell(0, 0);

      contextMenu();
      $('.htContextMenu .ht_master .htCore').find('tr td:eq("4")').simulate('mousedown'); //insert column left
      expect(hot.countCols()).toEqual(7);

      expect(getDataAtCell(1, 5)).toBe(null);
      expect(getDataAtCell(1, 6)).toBe('=G1');

      expect(getDataAtCell(4, 3)).toBe('');
      expect(getDataAtCell(4, 4)).toBe('=SUM(A3:G3)');

      expect(htCore.find('tbody tr:eq(4) td:eq(3)').text()).toEqual('');
      expect(htCore.find('tbody tr:eq(4) td:eq(4)').text()).toEqual('150');
    });

    it('should update formulas after added row above', function () {
      var hot = handsontable({
        startRows: 5,
        startCols: 5,
        colHeaders: true,
        rowHeaders: true,
        formulas: true,
        data: [
          [1, 2, 3, 4, 5],
          ['', '', '', '', '=E1'],
          [10, 20, 30, 40, 50],
          [100, 200, 300, 400, 500],
          ['', '', '', '=SUM(A3:E3)', '']
        ],
        contextMenu: true
      });

      var htCore = getHtCore();

      expect(htCore.find('tbody tr:eq(1) td:eq(4)').text()).toEqual('5');
      expect(htCore.find('tbody tr:eq(4) td:eq(3)').text()).toEqual('150');

      hot.selectCell(0, 1);

      contextMenu();
      $('.htContextMenu .ht_master .htCore').find('tr td:eq("0")').simulate('mousedown'); //insert row above

      expect(hot.countRows()).toEqual(6);

      expect(getDataAtCell(1, 4)).toBe(5);
      expect(getDataAtCell(2, 4)).toBe('=E2');

      expect(htCore.find('tbody tr:eq(1) td:eq(4)').text()).toEqual('5');
      expect(htCore.find('tbody tr:eq(2) td:eq(4)').text()).toEqual('5');


      expect(getDataAtCell(4, 3)).toBe(400);
      expect(getDataAtCell(5, 3)).toBe('=SUM(A4:E4)');
      expect(htCore.find('tbody tr:eq(4) td:eq(3)').text()).toEqual('400');
      expect(htCore.find('tbody tr:eq(5) td:eq(3)').text()).toEqual('150');

      hot.selectCell(3, 0);

      contextMenu();
      $('.htContextMenu .ht_master .htCore').find('tr td:eq("0")').simulate('mousedown'); //insert row above
      expect(hot.countRows()).toEqual(7);

      expect(getDataAtCell(1, 4)).toBe(5);
      expect(getDataAtCell(2, 4)).toBe('=E2');

      expect(htCore.find('tbody tr:eq(1) td:eq(4)').text()).toEqual('5');
      expect(htCore.find('tbody tr:eq(2) td:eq(4)').text()).toEqual('5');

      expect(getDataAtCell(5, 3)).toBe(400);
      expect(getDataAtCell(6, 3)).toBe('=SUM(A5:E5)');
      expect(htCore.find('tbody tr:eq(5) td:eq(3)').text()).toEqual('400');
      expect(htCore.find('tbody tr:eq(6) td:eq(3)').text()).toEqual('150');
    });

    it('should update formulas after added row below', function () {
      var hot = handsontable({
        startRows: 5,
        startCols: 5,
        colHeaders: true,
        rowHeaders: true,
        formulas: true,
        data: [
          [1, 2, 3, 4, 5],
          ['', '', '', '', '=E1'],
          [10, 20, 30, 40, 50],
          [100, 200, 300, 400, 500],
          ['', '', '', '=SUM(A3:E3)', '']
        ],
        contextMenu: true
      });

      var htCore = getHtCore();

      expect(htCore.find('tbody tr:eq(1) td:eq(4)').text()).toEqual('5');
      expect(htCore.find('tbody tr:eq(4) td:eq(3)').text()).toEqual('150');

      hot.selectCell(0, 1);

      contextMenu();
      $('.htContextMenu .ht_master .htCore').find('tr td:eq("1")').simulate('mousedown'); //insert row above

      expect(hot.countRows()).toEqual(6);

      expect(getDataAtCell(1, 4)).toBe(null);
      expect(getDataAtCell(2, 4)).toBe('=E1');

      expect(htCore.find('tbody tr:eq(1) td:eq(4)').text()).toEqual('');
      expect(htCore.find('tbody tr:eq(2) td:eq(4)').text()).toEqual('5');


      expect(getDataAtCell(4, 3)).toBe(400);
      expect(getDataAtCell(5, 3)).toBe('=SUM(A4:E4)');
      expect(htCore.find('tbody tr:eq(4) td:eq(3)').text()).toEqual('400');
      expect(htCore.find('tbody tr:eq(5) td:eq(3)').text()).toEqual('150');

      hot.selectCell(3, 0);

      contextMenu();
      $('.htContextMenu .ht_master .htCore').find('tr td:eq("0")').simulate('mousedown'); //insert row above
      expect(hot.countRows()).toEqual(7);

      expect(getDataAtCell(1, 4)).toBe(null);
      expect(getDataAtCell(2, 4)).toBe('=E1');

      expect(htCore.find('tbody tr:eq(1) td:eq(4)').text()).toEqual('');
      expect(htCore.find('tbody tr:eq(2) td:eq(4)').text()).toEqual('5');

      expect(getDataAtCell(5, 3)).toBe(400);
      expect(getDataAtCell(6, 3)).toBe('=SUM(A5:E5)');
      expect(htCore.find('tbody tr:eq(5) td:eq(3)').text()).toEqual('400');
      expect(htCore.find('tbody tr:eq(6) td:eq(3)').text()).toEqual('150');
    });
  });
});
