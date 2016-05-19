//Pivot Data Controller
  pivotControl = function (data, fund){
    graph(graphData);
    var pivotIndex;
    var insertArray;
    var pivotData = [];
    if (fund == "revenues") {
      pivotIndex = 0;
      insertArray = revenues;
    }
    else if (fund == "expenditures"){
      insertArray = expenditures;
      pivotIndex = 1;
    }
    else {
      table(data, fund);
      return;
    }
    for (var i = 0; i < data.length; i++) {
      pivotData.push(data[i]);
    }
    pivotData.splice(pivotIndex, 1);
    if (pivotData.length > 3 ) {
      pivotData.splice(pivotIndex, insertArray.length-1);
    }
    for (var i = insertArray.length-1; i > -1; i--){
      pivotData.splice(pivotIndex, 0, insertArray[i])
    }
    table(pivotData, fund);
  }

//Table Drawing Function
  table = function (data, fund){
    //Set Fund-Based Variables
    var pivotIndex; //Determines where the expanded data begins
    var pivotButtons; //Determines which Button Array to append to table
    var insertArray; //Determines which Fund Array has been inserted.
    if (fund == "revenues") {
      pivotIndex = 0;
      pivotButtons = revenueButtons;
      insertArray = revenues;
      pivotLength = revenues.length;
    }
    else if (fund == "expenditures"){
      pivotIndex = 1;
      pivotButtons = expenditureButtons;
      insertArray = expenditures;
      pivotLength = expenditures.length;
    }
    d3.selectAll("svg.table").remove();
    //Adjust Data Based on Button Values
    if (fund != "total"){
      for(var i = pivotIndex; i < (pivotIndex+pivotLength)-1; i++){
        var columnKey = 2016;
        for(var k = 0; k < data[0].length; k++){
          if(k >= 3){
            data[i][k].amount = data[i][k-1].amount * (1+((pivotButtons[((i-pivotIndex)*10)+(k-3)].value)/100));
          }
        }
      }
    }
    //Column Headings
    var columnHeaders = [];
    var numberOfColumns = cutoff - 2013;
    var col = 0, colDomain = [];
    for(var i = 0; i < numberOfColumns; i++){
      col++;
      colDomain.push(col);
      columnHeaders.push({
        x: col,
        head: (data[0][i].fiscalYear)
      });
    }
    colDomain.unshift(0);
    columnHeaders.unshift({
      x: 0,
      head: " "});
    //Row Headings
    var rowDomain = [];
    for(var i = 0; i < data.length; i++){
      rowDomain.push(data[i][0].category);
    }
    var row = rowDomain.length;
    //Size the Drawing
    var tW = (columnHeaders.length + 1)*80,
        tH = (data.length)*45;
    var tB = {t: 25, b: 0, l: 225, r: 25};
    var svgW = tW + tB.l + tB.r,
        svgH = tH + tB.t + tB.b;
    //Define Scales
    var tableXScale = d3.scale.ordinal().rangeBands([0, tW], 0.05)
          .domain(colDomain),
        tableYScale = d3.scale.ordinal().rangeBands([0, tH], 0.05)
          .domain(rowDomain);
    //Format Numbers
    var moneyFormat = d3.format("$,f"),
        inputFormat = d3.format(".1%");
    //Append Table and Geometry Groups
    var tableSVG = d3.select("div.pivot").append("svg")
      .attr("class", "table")
      .attr("width", svgW)
      .attr("height", svgH);
    var tableG = tableSVG.append("g")
      .attr("class", "Output Group")
      .attr("transform", "translate(" +tB.l+ "," +tB.t+ ")");
    var tableGridH = tableG.append("g")
      .attr("class", "horizontalGridGroup");
    var tableGridV = tableG.append("g")
      .attr("class", "verticalGridGroup");
    var headingsG = tableSVG.append("g")
      .attr("class", "Heading")
      .attr("transform", "translate(" +tB.l+ "," +tB.t+ ")")
    var buttonG = tableSVG.append("g")
      .attr("class", "InputGroup")
      .attr("transform", "translate(" +tB.l+ "," +tB.t+ ")");
    var incrementG = buttonG.append("g")
      .attr("class", "incrementGroup");
    var decrementG = buttonG.append("g")
      .attr("class", "decrementGroup");
    //Create Cells, Grid Add Text
    var celW = tableXScale.rangeBand();
    var celH = tableYScale.rangeBand();
    var txt  = tableG.selectAll("text").data(data);
    //Insert Vertical Lines
    var vLin = tableGridV.selectAll("line").data(data);
    for(var i = 0; i < colDomain.length-1; i++){
      vLin.enter().append("line")
        .attr("class", "verticalGraphLine")
        .attr("x1", function(d){ return tableXScale(i) + celW + 3;})
        .attr("x2", function(d){ return tableXScale(i) + celW + 3;})
        .attr("y1", -5)
        .attr("y2", tH);
    }
    //Insert Horizontal Lines
    var hLin = tableGridH.selectAll("line").data(rowDomain);
        hLin.enter().append("line")
          .attr("class", "horizontalGraphLine")
          .attr("x1", celW/2)
          .attr("x2", tW)
          .attr("y1", function(d){ return tableYScale(d);})
          .attr("y2", function(d){ return tableYScale(d);});
    //Insert Cel Content
    for(var i = 0; i < data.length; i++){
      var textAlign = "end",
          textY = (celH/3);
      for(var p = 0; p < col+1; p++){
        if (p == 0){
          txt.enter().append("text")
            .attr("class", "Category")
            .attr("id", function(d){return data[i][p].identifier;})
            .attr("x", function(d){ return tableXScale(p) + celW;})
            .attr("y", function(d){ return tableYScale(data[i][p].category) + celH/2;})
            .style("text-anchor", textAlign)
            .text(function(d){ return data[i][p].category.capitalize(true);})
            .on("click", function(d){expandOrCollapse(this.id, data, fund)});
        } else {
          txt.enter().append("text")
          .attr("class", "numbers")
          .attr("id", function(d){ if (data[i][p-1].amount > 0){ return "positive";} else {return "negative";};})
          .attr("x", function(d){ return tableXScale(p) + celW;})
          .attr("y", function(d){ return tableYScale(data[i][p-1].category) + textY;})
          .style("text-anchor", textAlign)
          .text(function(d){ return moneyFormat(data[i][p-1].amount);});
        }
      }
    }
    //Insert Column Headings
    var headingTxt = headingsG.selectAll("text").data(columnHeaders)
      .enter().append("text")
        .attr("class", "ColumnHead")
        .attr("x", function(d){ return tableXScale(d.x) + celW/2 + 2;})
        .attr("y", -3)
        .attr("text-anchor", "middle")
        .text(function(d){ return d.head;});
    //Buttons
    if (fund != "total"){
      var pivotedFundNameG = tableG.append("g")
        .attr("class", "pivotedFundName");
      var pivotedFundName = pivotedFundNameG.selectAll("text").data(fund)
        .enter().append("text")
        .attr("class", "Category")
        .attr("id", fund)
        .attr("x", -1*(2.5+pivotIndex)*celH )
        .attr("y", -135)
        .attr("transform", "rotate(-90)")
          .style("text-anchor", "middle")
          .text(function(d){return fund.capitalize(true);})
          .on("click", function(d){expandOrCollapse(this.id, data, fund)});
      var valueG = buttonG.append("g")
        .attr("class", "ButtonValue");
      var incrementer = incrementG.selectAll("rect").data(pivotButtons)
        .enter().append("rect")
        .attr("class", "incrementer")
        .attr("x", function(d){ return tableXScale(d.xCoord);})
        .attr("y", function(d){ return tableYScale(d.y1) + (celH/2) + 2;})
        .attr("width",  function(d){ return (tableXScale.rangeBand())/4;})
        .attr("height", function(d){ return (tableYScale.rangeBand())/3;})
        .attr("rx", function(d){return (tableXScale.rangeBand())/8;})
        .attr("ry", function(d){return (tableYScale.rangeBand())/6;})
        .on("click", function(d){increment(d, data, pivotButtons, fund)});
      var incrementLabel = incrementG.selectAll("text").data(pivotButtons)
        .enter().append("text")
        .attr("class", "buttonLabel")
        .attr("x", function(d){ return tableXScale(d.xCoord) + (tableXScale.rangeBand())/8;})
        .attr("y", function(d){ return tableYScale(d.y1) + (celH/2)+ 1.5 + (tableYScale.rangeBand())/6;})
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("fill", "grey")
        .text("+")
        .on("click", function(d){increment(d, data, pivotButtons, fund)});
      var decrementer = decrementG.selectAll("rect").data(pivotButtons)
        .enter().append("rect")
        .attr("class", "decrementer")
        .attr("x", function(d){ return 2 + tableXScale(d.xCoord) + (tableXScale.rangeBand())/4;})
        .attr("y", function(d){ return tableYScale(d.y1) + (celH/2) + 2;})
        .attr("width",  function(d){ return (tableXScale.rangeBand())/4;})
        .attr("height", function(d){ return ((tableYScale.rangeBand())/3);})
        .attr("rx", function(d){return (tableXScale.rangeBand())/8;})
        .attr("ry", function(d){return (tableYScale.rangeBand())/6;})
        .on("click", function(d){decrement(d, data, pivotButtons, fund)});
      var decrementLabel = decrementG.selectAll("text").data(pivotButtons)
        .enter().append("text")
        .attr("class", "buttonLabel")
        .attr("x", function(d){ return 2 + tableXScale(d.xCoord) + (tableXScale.rangeBand())/4 + (tableXScale.rangeBand())/8;})
        .attr("y", function(d){ return tableYScale(d.y1) + (celH/2) + (tableYScale.rangeBand())/6;})
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("fill", "lightgrey")
        .text("-")
        .on("click", function(d){decrement(d, data, pivotButtons, fund)});
      var valueTxt = valueG.selectAll("text").data(pivotButtons)
        .enter().append("text")
        .attr("class", "ButtonValueText")
        .attr("x", function(d){ return tableXScale(d.xCoord) + celW;})
        .attr("y", function(d){ return tableYScale(d.y1) + (celH/5)*4;})
        .attr("text-anchor", "end")
        .style("fill", "lightblue")
        .text(function(d){ return inputFormat(d.value/100);});
    }
  }

//Graph Drawing Function
  graph = function (data, fund){
    var celW = 84.679715302491;
    //Remove Old Graph
    var remove = "svg.graph";
    var thisDiv = "div.graph";
    d3.selectAll(remove).remove();
    //Build the Column Headers Array
    var columnHeaders = [];
    var numberOfColumns = 2026 - 2013;
    var col = 0, colDomain = [];
    for(var i = 0; i < numberOfColumns; i++){
      col++;
      colDomain.push(col);
      columnHeaders.push({
        x: col,
        head: (data[0][i].fiscalYear).substring(2,6)
      });
    }
    colDomain.unshift(0);
    columnHeaders.unshift({
      x: 0,
      head: " "
    });
    //Create Array for Graphing
    var graphData2 = [];
    if(!data[1]){
      return;
    }
    else{
      for(var i = 0; i < numberOfColumns; i++){
        graphData2.push({
          year: 2014 + i,
          fiscalYear: data[0][i].fiscalYear,
          Revenues: data[0][i].amount,
          Expenditures: data[1][i].amount
        });
      }
      //Size the Drawing
      var grW = (columnHeaders.length + 1)*80,
          grH = 225;
      var grB = {t: 25, b: 5, l: 225+(20/19*celW), r: 25};
      var svgrW = grW + grB.l + grB.r,
          svgrH = grH + grB.t + grB.b;
      //Scale Graph
      var graphMax = d3.max(graphData2, function(d){ return Math.max(+d["Revenues"], +d["Expenditures"]);});
      var graphMin = d3.min(graphData2, function(d){ return Math.min(+d["Revenues"], +d["Expenditures"]);});
      var graphExtents = d3.extent(graphData2, function(d){ return d.year;});
          graphExtents[0]--;
      var x = d3.scale.linear().range([0, grW-celW])
            .domain(graphExtents);
      var y = d3.scale.linear().range([grH, 0])
            .domain([
              graphMin*0.975,
              // 0,
              graphMax*1.025
            ]);
      //Define The Lines
      var line = d3.svg.area()
          // .interpolate("monotone")
          .x(function(d) { return x(d.year); })
          .y(function(d) { return y(d.Revenues); });
      var line2 = d3.svg.area()
          // .interpolate("monotone")
          .x(function(d) { return x(d.year); })
          .y(function(d) { return y(d["Expenditures"]); });
      var area = d3.svg.area()
        // .interpolate("monotone")
        .x(function(d){ return x(d.year);})
        .y1(function(d){ return y(d.Revenues);});
      //Append SVG and Groups
      var graphSVG = d3.select(thisDiv).append("svg")
        .attr("class", "graph")
        .attr("width", svgrW - celW)
        .attr("height", svgrH)
        .append("g")
          .attr("class", "Output Group")
          .attr("transform", "translate(" +grB.l + "," +grB.t+ ")");
      //Define the Axes
      var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(0)
        .orient("bottom");
      var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(5)
        .orient("left");
      //Maybe this is Necessary
      graphData2.forEach(function(d) {
        d.date = d.date;
        d["Revenues"]= +d["Revenues"];
        d["Expenditures"] = +d["Expenditures"];
      });
      //Assign Group Datum
        graphSVG.datum(graphData2);
      //Append Paths
        graphSVG.append("clipPath")
            .attr("id", "clip-below")
          .append("path")
            .attr("d", area.y0(grH));

        graphSVG.append("clipPath")
            .attr("id", "clip-above")
          .append("path")
            .attr("d", area.y0(0));

        graphSVG.append("path")
            .attr("class", "area above")
            .attr("clip-path", "url(#clip-above)")
            .attr("d", area.y0(function(d) { return y(d["Expenditures"]); }));

        graphSVG.append("path")
            .attr("class", "area below")
            .attr("clip-path", "url(#clip-below)")
            .attr("d", area);

        graphSVG.append("path")
          .attr("class", "line")
          .attr("d", line);
        graphSVG.append("path")
          .attr("class", "line")
          .attr("d", line2);
      //Append Axes
        graphSVG.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + grH + ")")
          .call(xAxis);
        graphSVG.append("g")
          .attr("class", "y axis")
          .call(yAxis);
        d3.select("g.y.axis")
          .append("text")
          .attr("class", "yAxisLabel")
          .attr("transform", "rotate(-90)")
          .style("text-anchor", "end")
          .attr("y", 0);
        d3.select("text.yAxisLabel")
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "1.2em")
          .text("Fund Total");
        d3.select("text.yAxisLabel")
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "1.2em")
          .style("font-size", 11)
          .style("fill", "dimgrey")
          .text("$ in Millions");
    }
  }
//Data Incrementing and Decrementing
  function decrement(d, data, buttonz, fundType){
    if(d3.event.shiftKey){
      d.value -= 0.1;
    } else {
    d.value--;}
    updateLevel2Arrays(fundType, data);
  }
  function increment(d, data, buttonz, fundType){
    if(d3.event.shiftKey){
      d.value += 0.1;
    } else {
    d.value++;}
    updateLevel2Arrays(fundType, data);
  }

//Keep Track of Pivoted Data
  function expandOrCollapse (id, data, fundType){
    if (id == fundType){
      pivotControl(graphData, "total");
    }
    else if (id == "Balance") {

    }
    else {
      pivotControl(graphData, id);
    }
  }

//Scenario Button Unpress
  function scenarioUnPress(d, object, data){
    d3.select(object)
      .attr("fill", "ghostwhite")
      .on("mouseover", function(d){this.style.filter = "url(#hover-shadow)";})
      .on("mouseleave", function(d){this.style.filter = "url(#drop-shadow)";})
      .on("click", function(d){scenarioPress(d, this, data);});
    addScenario(d.buttonCode, d.effcetedFund, "off", data);
  }
//Scenario Button Press
  function scenarioPress(d, object, data){
    d3.select(object)
      .attr("fill", "whitesmoke")
      .on("mouseover", function(_){ this.style.filter = null;})
      .on("mouseleave", function(_){ this.style.filter = null;})
      .on("click", function(_){ scenarioUnPress(d, this, data);})
    addScenario(d.buttonCode, d.effcetedFund, "on", data);
  }
//Draw Your Buttons
  buttons = function(data, classSelect){
    //First Selection and Removal
    var remove = "svg." + classSelect + "Buttons";
    var thisDiv = "div." + classSelect;
    d3.selectAll(remove).remove();
    //Drawing-Wide Variables
    var numberOfButtons = data.length,
        numberOfButtonsPerRow = 2,
        numberOfRows = 1;
    if (classSelect == "scenarios"){
        numberOfButtonsPerRow = 8;
    }
    var rowDomain = [],
        colDomain = [];
    if (numberOfButtons > numberOfButtonsPerRow){
      var lastRow = 0;
      if ((numberOfButtons/numberOfButtonsPerRow)%1 != 0){
        lastRow = 1;
      }
      numberOfRows = (numberOfButtons/numberOfButtonsPerRow)
                   - ((numberOfButtons/numberOfButtonsPerRow)%1)
                   + lastRow;
    }
    for (var i = 1; i < numberOfRows+1; i++){ rowDomain.push(i); }
    for (var i = 1; i < numberOfButtonsPerRow + 1; i ++){ colDomain.push(i); }
    //Set Switch Positions
    var switchPositions = [];
    for (var i = 0; i < numberOfButtons; i ++){
      switchPositions.push(0);
    }
    //Set Dimensions
    var numberOfColumns = initialValue - 2013;
    var bW = 225,
        bH = numberOfRows*50,
        bB = {t: 25, b: 25, l: 25, r:25 };
    if (classSelect == "scenarios"){
      bB.l = 225 + 89.6797153024911;
      bW = (d3.select("svg.table").property("scrollWidth")) - bB.l - bB.r;
    }
    var svgBW = bW + bB.l + bB.r,
        svgBH = bH + bB.b + bB.t;
    //Set Scales and Button Dimensions
    var buttonXScale = d3.scale.ordinal().rangeBands([0, bW], 0.1, 0)
          .domain(colDomain),
        buttonYScale = d3.scale.ordinal().rangeBands([0, bH], 0.1, 0)
          .domain(rowDomain);
    var buttonW = buttonXScale.rangeBand(),
        buttonH = buttonYScale.rangeBand();
    //Define SVG and Groups
    var canvas = d3.select(thisDiv).append("svg")
      .attr("class", classSelect + "Buttons")
      .attr("width", svgBW)
      .attr("height", svgBH);
    var formG = canvas.append("g")
      .attr("class", "InputGroup")
      .attr("transform", "translate(" +bB.l+ "," +bB.t+ ")");
    //Create Shadow Definitions
    var defs = canvas.append("defs");
    var shadow = defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");
    shadow.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur");
    shadow.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 3)
      .attr("result", "offsetBlur");
    var shadowHover = defs.append("filter")
      .attr("id", "hover-shadow")
      .attr("height", "175%");
    shadowHover.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 5)
      .attr("result", "blur");
    shadowHover.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 5)
      .attr("result", "offsetBlur");
    var hoverMerge = shadowHover.append("feMerge")
    hoverMerge.append("feMergeNode")
      .attr("in", "offsetBlur")
    hoverMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
    var sourceMerge = shadow.append("feMerge");
    sourceMerge.append("feMergeNode")
      .attr("in", "offsetBlur")
    sourceMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
      var shadowtext = defs.append("filter")
        .attr("id", "text-shadow")
        .attr("height", "175%");
      shadowtext.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 2)
        .attr("result", "blur");
      shadowtext.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 1)
        .attr("dy", 1)
        .attr("result", "offsetBlur");
      var textMerge = shadowtext.append("feMerge")
      textMerge.append("feMergeNode")
        .attr("in", "offsetBlur")
      textMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");
    //Add Buttons
    var buttonG = formG.selectAll("g").data(data)
      .enter().append("g")
      .attr("transform", function(d){
        var index = d.buttonCode;

        var x, y;
        for (var i = 0; i < numberOfRows; i++){
          x = index - (numberOfButtonsPerRow * i);
          y = i+1;
          if (x <= numberOfButtonsPerRow){
            return "translate(" + buttonXScale(x) + ", " + buttonYScale(y) + ")"
          }
        }
      });
    var press = buttonG.append("rect")
      .attr("class", "scenarioButton")
      .attr("width", buttonW)
      .attr("height", buttonH)
      .attr("rx", buttonW/48)
      .attr("ry", buttonW/48)
      .attr({"fill": "ghostwhite",
             "stroke": "black",
             "stroke-width": "1"})
      .style("filter", "url(#drop-shadow)")
      .on("mouseover", function(d){this.style.filter = "url(#hover-shadow)";})
      .on("mouseleave", function(d){this.style.filter = "url(#drop-shadow)";})
      .on("click", function(d){scenarioPress(d, this, data);});
    buttonG.append("text")
      .attr("y", buttonH/2)
      .attr("dy", 1.1)
      .attr("font-weight", "bolder")
      .attr("pointer-events", "none")
      .style("fill", function(d){ if (d.effcetedFund == "revenues"){return "darkgreen";} else {return "navy";}})
      .style("stroke", function(d){ if (d.effcetedFund == "revenues"){return "darkgreen";} else {return "navy";}})
      .style("stroke-width", .5)
      // .style("filter", "url(#text-shadow)")
      .attr("alignment-baseline", "middle")
      .text(function(d){ return d.title.capitalize(true);});
    buttonG.selectAll("text")
      .call(wrap, buttonW-5)
  }

  function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", (width/2)+2.5).attr("y", y).attr("dy", dy + "em").attr("text-anchor", "middle");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          y = y - (++lineNumber*lineHeight);
          tspan = text.append("tspan").attr("x", (width/2)+2.5).attr("y", y).attr("dy", +lineNumber * lineHeight + dy + "em").attr("text-anchor", "middle").text(word);
        }
      }
        text.attr("transform", "translate(0, " + (lineNumber+1.5)*(-6) + ")");
    });
  }
