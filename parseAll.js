//A Collection of Single Instance Parsing Functions

//Text to Numbers
  type = function(d){
    for(var property in d){
      if(d.hasOwnProperty(property)){
        if(property != "Category"){
          d[property] = +d[property];
        }
      }
    }
    return d;
  }
  typeTwo = function(d){
    for(var property in d){
      if(d.hasOwnProperty(property)){
        if(property != "Category"){
          if(property != "fund"){
            d[property] = +d[property];
          }
        }
      }
    }
    return d;
  }
  typeThree = function(d){
    for(var property in d){
      if(d.hasOwnProperty(property)){
        if(property != "title" && property != "effcetedFund"){
          d[property] = +d[property];
        }
      }
    }
    return d;
  }
//Two Fund Button Data Parsing
  twoStepParse = function(data, fund, b, c){
    d3.csv(data, typeTwo, function(d){
      var projection = d.filter(function(row){
        if (row.fund == fund){return row;}
      });
      var x = 3;
      for(var i = 0; i < projection.length; i++){
        var j = 0;
        var xCoord = 4;
        var row = [];
        for(property in projection[i]){
          if(projection[i].hasOwnProperty(property)){
            if(j > 1){
              b.push({
                index: x,
                xCoord: xCoord,
                yCoord: i,
                y1: projection[i].Category,
                x1: property,
                value: projection[i][property]
              });
              xCoord++;
              j++;
            }
            else {
              j++;
            }
          }
        }
      }
      var csvFile;
      var arrayOut;
      if(fund == "revenues"){
        csvFile = "CA_GeneralFund_Revenues.csv";
        arrayOut = revenues;
      }
      else {
        csvFile = "CA_GeneralFund_Expenditures.csv"
        arrayOut = expenditures;
      }
      parseItemsCSV(csvFile, arrayOut, fund, b, c);
    });
  }
//Single Fund Items Parsing
  parseItemsCSV = function(dataIn, dataOut, fund, buttons, cutoff){
    d3.csv(dataIn, type, function(d){
      var numberOfAddedColumns = 10;
      var x = 0;
      for(var i = 0; i < d.length; i++){
        var j = 0;
        var xCoord, yCoord;
        var row = [];
        for(property in d[i]){
          if (d[i].hasOwnProperty(property)){
            if(j > 0){
              xCoord = j;
              yCoord = i;
              x = i*(3+numberOfAddedColumns) + j-1;
              row.push({
                category: d[i].Category,
                identifier: fund,
                fiscalYear: property,
                amount: d[i][property],
                index: x,
                xCoord: xCoord,
                yCoord: yCoord
              });
              j++;
            } else {
              j++;
            }
          }
        }
        var columnKey = 2016;
        for(var k = 0; k < numberOfAddedColumns; k++){
          x++;
          xCoord++;
          columnKey++;
          var key =columnKey.toString() + "-" + (columnKey+1).toString().substring(2);
          row.push({
            category: d[i].Category,
            identifier: fund,
            fiscalYear: key,
            amount: row[row.length-1].amount * (1+((buttons[(i*10)+k].value)/100)),
            index: x,
            xCoord: xCoord,
            yCoord: i
          });
        }
        dataOut.push(row);
      }
      makeLevel2Arrays(dataOut, buttons, fund, cutoff);
    });
  }
//Parse Through Scenario Data and Output Selected
  parseScenarios = function(input, label){
    d3.csv(input, typeThree, function(data){
      updateScenarios(data, label);
    });
  }
