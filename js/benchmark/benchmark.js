var hamstersBenchmark = {
  delay: 300,
  messageDelay: 300,
  tests: [],
  testTypes: {},
  currentTest: null,
  testArray: null,
};

(function () {
  "use strict";

  function init() {
    if (typeof window.performance === "undefined" || typeof window.performance.mark === "undefined") {
      alert("Your browser does not properly support the JavaScript performance API. Please use a different browser.");
      return;
    }

    var progressElement = document.querySelector(".progress");
    var resultsElement = document.querySelector(".results");
    progressElement.style.display = "none";
    resultsElement.style.display = "none";

    navigator.guessWho = function() {
      var ua= navigator.userAgent, tem,
      M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
      if(/trident/i.test(M[1])) {
          tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
          return 'IE '+(tem[1] || '');
      }
      if(M[1]=== 'Chrome') {
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) {
          return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
      }
      M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
      if((tem= ua.match(/version\/(\d+)/i))!= null) {
        M.splice(1, 1, tem[1]); 
        return M.join(' ');
      }
      return M.join(' ');
    };
    hamstersBenchmark.clientInfo();
  }

  function shuffleArray(a) {
    // Shuffle an array
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }

  function clearResults() {
    hamstersBenchmark.testArray = undefined;
    window.performance.clearMarks();
    window.performance.clearMeasures();
  }

  function prepareGraphColumn(i, result, type, baseline) {
    var tempColumn = {};
    var columnName = result.name.slice(0, 1);

    if (result.name.indexOf('sequential') !== -1) {
      columnName = 'Main Thread';
    }

    tempColumn["category"] = columnName;

    if (type === 'scaling') {
      tempColumn['column-1'] = (((result.duration - baseline) / result.duration) * -100);
    }

    if (type === 'time') {
      tempColumn['column-1'] = result.duration.toFixed(4);
    }

    tempColumn['color'] = '#0063f8';
    return tempColumn;
  }

  function renderScalingChart(results) {
      var scalingAxis = [{
        "id": "ValueAxis-2",
        "title": "% Improvement"
      }];
      var scalingGraphs = [{
        "balloonText": "[[value]] Percent Faster",
        "fillAlphas": 0.8,
        "id": "scaling-improvement",
        "title": "graph 1",
        "type": "column",
        "valueField": "column-1"
      }];
      var scalingData = [];
      for (var i = 0; i < results.length; i++) {
        scalingData.push(hamstersBenchmark.prepareGraphColumn(i, results[i], 'scaling', results[0].duration));
      }
      var scalingChartOptions = {
        "type": "serial",
        "categoryField": "category",
        "rotate": false,
        "autoMarginOffset": 40,
        "marginRight": 70,
        "marginTop": 70,
        "startDuration": 4,
        "fontSize": 13,
        "graphs": scalingGraphs,
        "theme": "light",
        "categoryAxis": {
          "gridPosition": "start"
        },
        "trendLines": [],
        "guides": [],
        "valueAxes": scalingAxis,
        "allLabels": [{
          "text": "Thread Count",
          "bold": true,
          "x": 40,
          "y": 350
        }],
        "balloon": {},
        "titles": [],
        "dataProvider": scalingData
      };
      AmCharts.makeChart("scaling", scalingChartOptions);
  }

  function renderExecutionTimeChart(results) {
    var axis = [{
      "id": "ValueAxis-1",
      "title": "Execution Time (ms)"
    }];
    var graphs = [{
      "balloonText": "[[category]] Threads: [[value]] milliseconds",
      "fillAlphas": 0.8,
      "id": "execution-time",
      "title": "graph 1",
      "type": "column",
      "valueField": "column-1"
    }];
    var data =  [];
    for (var i = 0; i < results.length; i++) {
      data.push(hamstersBenchmark.prepareGraphColumn(i, results[i], 'time', results[0].duration));
    }
    var chartOptions = {
      "type": "serial",
      "categoryField": "category",
      "rotate": true,
      "autoMarginOffset": 40,
      "marginRight": 70,
      "marginTop": 70,
      "startDuration": 4,
      "fontSize": 13,
      "theme": "light",
      "categoryAxis": {
        "gridPosition": "start"
      },
      "trendLines": [],
      "graphs": graphs,
      "guides": [],
      "valueAxes": axis,
      "allLabels": [{
        "text": "Thread Count",
        "bold": true,
        "x": 20,
        "y": 40
      }],
      "balloon": {},
      "titles": [],
      "dataProvider": data
    };
    AmCharts.makeChart("executionTime", chartOptions);
  }

  function complete() {
    var progressElement = document.querySelector(".progress");
    var statusTextElement = document.querySelector(".status_text");
    var resultsElement = document.querySelector(".results");
    var runBenchmarkElement = document.querySelector(".run-benchmark");

    progressElement.style.display = "none";
    statusTextElement.innerHTML = "";
    resultsElement.style.display = "block";
    runBenchmarkElement.style.display = "block";

    var results = hamstersBenchmark.fetchResults();
    hamstersBenchmark.renderExecutionTimeChart(results);
    hamstersBenchmark.renderScalingChart(results);
    hamstersBenchmark.saveResults(results);
  }

  function randomArray(count) {
    // Generate a random array
    var array = [];
    while (count > 0) {
      array[array.length] = Math.round(Math.random() * (100 - 1) + 1);
      count -= 1;
    }
    return array;
  }

  function newArray(callback) {
    var testSize = Number(document.querySelector(".test_size_select").value);
    callback(hamstersBenchmark.randomArray(testSize * 1000 * 1000));
  }

  function fetchResults() {
    return window.performance.getEntriesByType("measure");
  }

  function saveResults(results) {
    var benchmarkRun = {
      browser: (navigator.guessWho ? navigator.guessWho() : 'Not Detected'),
      version: hamsters.version,
      threads: hamsters.maxThreads,
      legacy: hamsters.habitat.legacy,
      transferable: hamsters.habitat.transferable,
      atomic: hamsters.habitat.atomics,
      benchmark: hamstersBenchmark.currentTest || '',
      result: JSON.stringify(results),
      time: Date.now()
    };
    if(hamstersBenchmark.currentTest === 'Square Root') {
      benchmarkRun.size = Number(document.getElementsByClassName("test_size_select")[0].value);
    }
    if(hamstersBenchmark.currentTest === 'Collatz Conjecture') {
      benchmarkRun.startValue = Number(document.getElementsByClassName("start_select")[0].value);
      benchmarkRun.endValue = Number(document.getElementsByClassName("end_select")[0].value);
    }
    $.post('/benchmarks', benchmarkRun);
  }

  function clientInfo() {
    document.getElementsByClassName('version')[0].innerHTML = hamsters.version;
    document.getElementsByClassName('maxThreads')[0].innerHTML = hamsters.maxThreads;
    document.getElementsByClassName('legacy')[0].innerHTML = hamsters.habitat.legacy;
    document.getElementsByClassName('transferable')[0].innerHTML = hamsters.habitat.transferable;
    document.getElementsByClassName('atomic')[0].innerHTML = hamsters.habitat.atomics;
    document.getElementsByClassName('testBrowser')[0].innerHTML = (navigator.guessWho ? navigator.guessWho() : 'Not Detected');
  }

  hamstersBenchmark.init = init;
  hamstersBenchmark.shuffleArray = shuffleArray;
  hamstersBenchmark.clearResults = clearResults;
  hamstersBenchmark.prepareGraphColumn = prepareGraphColumn;
  hamstersBenchmark.renderScalingChart = renderScalingChart;
  hamstersBenchmark.renderExecutionTimeChart = renderExecutionTimeChart;
  hamstersBenchmark.complete = complete;
  hamstersBenchmark.randomArray = randomArray;
  hamstersBenchmark.newArray = newArray;
  hamstersBenchmark.fetchResults = fetchResults;
  hamstersBenchmark.saveResults = saveResults;
  hamstersBenchmark.clientInfo = clientInfo;

  hamstersBenchmark.init();
})();
