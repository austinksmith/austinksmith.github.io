/* jshint esversion: 6, curly: true, eqeqeq: true, forin: true */

/*
 * Title: Hamsters.js
 * Description: 100% Vanilla Javascript Multithreading & Parallel Execution Library
 * Author: Austin K. Smith
 * Contact: austin@asmithdev.com
 * Copyright: 2015 Austin K. Smith - austin@asmithdev.com
 * License: Artistic License 2.0
 */

(function() {
  'use strict';
  // Add square root benchmark
  hamstersBenchmark.testTypes['square_root'] = {
    generateOptions: function () {
      var statusTextElement = document.querySelector(".status_text");
      statusTextElement.innerHTML = "Bribing " + hamsters.maxThreads + " hamsters with food..";
      statusTextElement.innerHTML = "Readying the exercise wheels..";
    
      hamstersBenchmark.newArray(function (testArray) {
        hamstersBenchmark.testArray = testArray;
    
        var testOptionsArray = [];
        for (var i = 0; i < hamsters.maxThreads; i++) {
          var testOptions = {
            dataType: 'Int32',
            debug: true,
            threads: i + 1,
          };
          testOptionsArray.push(testOptions);
        }
    
        hamstersBenchmark.tests = testOptionsArray;
    
        this.getBaseline();
      }.bind(this));
    },
    
    runTask: function(options) {
      hamstersBenchmark.currentTest = 'Square Root';
      document.getElementsByClassName("status_text")[0].innerHTML = (options.threads + " hamsters running!");
      var forName = options.threads + "_for";
      var forStart = forName += "_start";
      var forEnd = forName += "_end";
      options.array = new Int32Array(hamstersBenchmark.testArray);
      this.invokeLoop(options, forStart, forName, forEnd);
    },

    invokeLoop: function(options, forStart, forName, forEnd) {
      var self = this;
      window.performance.mark(forStart);
      hamsters.run(options, function() {
        for (var i = 0; i < params.array.length; i++) {
          rtn.data.push(Math.sqrt(params.array[i]));
        }
      }, function(results) {
        window.performance.mark(forEnd);
        window.performance.measure(forName, forStart, forEnd);
        // Run next step
        if(hamstersBenchmark.tests.length !== 0) {
          setTimeout(function() {
            self.runTask(hamstersBenchmark.tests.shift());
          }, hamstersBenchmark.delay);
        } else {
          hamstersBenchmark.complete();
        }
      }, function(error) {
        console.error(error);
      });
    },

    getBaseline: function() {
        // var testArray = new Int32Array(hamstersBenchmark.testArray);
        // window.performance.mark("sequential_for_start");
        // var rtn = {
        //   data: []
        // };
        // var i = 0;
        // for(i; i < testArray.length; i += 1) {
        //   rtn.data.push(Math.sqrt(testArray[i]));
        // }
        // window.performance.mark("sequential_for_end");
        // window.performance.measure("sequential_for", "sequential_for_start", "sequential_for_end");
        this.runTask(hamstersBenchmark.tests.shift());
    },

    run: function() {
      hamstersBenchmark.clearResults();
      document.getElementsByClassName("results")[0].style.display = "none";
      //document.getElementById("center").style.display = "none";
      document.getElementsByClassName("progress")[0].style.display = "flex";
      this.generateOptions();
    }
  };
})();