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
    // Add Collatz Conjecture benchmark
    hamstersBenchmark.testTypes['collatz_conjecture'] = {
      generateOptions: function() {
        var statusTextElement = document.querySelector(".status_text");
        statusTextElement.innerHTML = "Bribing hamsters with food..";
      
        statusTextElement.innerHTML = "Readying the exercise wheels..";
      
        var startSelectElement = document.querySelector(".start_select");
        var endSelectElement = document.querySelector(".end_select");
        var start = Number(startSelectElement.value);
        var end = Number(endSelectElement.value);
      
        hamstersBenchmark.testArray = this.generateArray(start, end);
      
        var taskOptions = {
          operator: function() {
            var steps = 0;
            var i = 0;
            var original, x;
            for (i = 0; i < params.array.length; i++) {
              x = params.array[i];
              steps = 0;
              original = x;
              while (x && x != 1) {
                if (x % 2 == 0) {
                  x = x / 2;
                } else {
                  x = x * 3 + 1;
                }
                steps++;
              }
              // We know it ran *in order* so just return the steps for max performance
              rtn.data.push(steps);
            }
          }
        };
      
        var testOptions;
        for (var i = 0; i < hamsters.maxThreads; i++) {
          testOptions = Object.create(taskOptions);
          testOptions.threads = i + 1;
          hamstersBenchmark.tests.push(testOptions);
        }
      
        this.getBaseline();
      },
      
  
      generateArray: function(start, end) {
        var array = [];
        for (var i = start; i <= end; i++) {
            array.push(i);
        }
        return array
      },
  
      runTask: function(options) {
        hamstersBenchmark.currentTest = 'Collatz Conjecture';
        document.getElementsByClassName("status_text")[0].innerHTML = (options.threads + " hamsters running!");
        var forName = options.threads + "_for";
        var forStart = forName += "_start";
        var forEnd = forName += "_end";
        options.array = new Int32Array(hamstersBenchmark.testArray);
        this.invokeLoop(options, forStart, forName, forEnd);
      },
  
      invokeLoop: function(options, forStart, forName, forEnd) {
        window.performance.mark(forStart);
        options.dataType = 'Int32';
        var self = this;
        hamsters.run(options, options.operator, function(result) {
          window.performance.mark(forEnd);
          window.performance.measure(forName, forStart, forEnd);
          // Run next step
          if(hamstersBenchmark.tests.length !== 0) {
            self.runTask(hamstersBenchmark.tests.shift());
          } else {
            hamstersBenchmark.complete();
          }
        });
      },
  
      getBaseline: function() {
          // window.performance.mark("sequential_for_start");
          // var testArray = new Array(hamstersBenchmark.shuffleArray(hamstersBenchmark.testArray));
          // var params = {
          //   array: testArray
          // }
          // var rtn = {
          //   data: []
          // };
          // var steps = 0;
          // var i = 0;
          // var original, x;
          // for (i = 0; i < params.array.length; i++) {
          //   x = params.array[i];
          //   steps = 0;
          //   original = x;
          //   while (x && x != 1) {
          //     if (x % 2 == 0) {
          //       x = (x / 2);
          //     } else {
          //       x = (x * 3 + 1);
          //     }
          //     steps++;
          //   }
          //   // We know it ran *in order* so just return the steps for max performance
          //   rtn.data.push(steps);
          // }
          // window.performance.mark("sequential_for_end");
          // window.performance.measure("sequential_for", "sequential_for_start", "sequential_for_end");
          this.runTask(hamstersBenchmark.tests.shift());
      },
  
      run: function() {
        hamstersBenchmark.clearResults();
        document.getElementsByClassName("results")[0].style.display = "none";
        document.getElementsByClassName("run-benchmark")[0].style.display = "none";
        document.getElementsByClassName("progress")[0].style.display = "flex";
        this.generateOptions();
      }
    };
  })();