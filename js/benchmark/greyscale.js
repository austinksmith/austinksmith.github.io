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
  hamstersBenchmark.testTypes['greyscale'] = {
    generateOptions: function() {
      var self = this;
      document.getElementsByClassName("status_text")[0].innerHTML = ("Bribing " + hamsters.maxThreads + " hamsters with food..");
      setTimeout(function() {
        document.getElementsByClassName("status_text")[0].innerHTML = ("Readying the exercise wheels..");
        setTimeout(function() {
          hamstersBenchmark.newArray(function(testArray) {
            hamstersBenchmark.testArray = testArray;
            var taskOptions = {
              operator: function(i) {
                return Math.sqrt(arguments[0]);
              },
              dataType: "Int32"
            };
            var i = 0;
            var testOptions;
            for(i; i < hamsters.maxThreads; i += 1) {
              testOptions = Object.create(taskOptions);
              testOptions.threads = (i + 1);
              hamstersBenchmark.tests.push(testOptions);
            }
            self.getBaseline();
          });
        }, hamstersBenchmark.messageDelay);
      }, hamstersBenchmark.messageDelay); // Keep this message up a little longer
    },

    runTask: function(options) {
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
      hamsters.loop(options, function(result) {
          window.performance.mark(forEnd);
          window.performance.measure(forName, forStart, forEnd);
          console.log(result);
          // Ensure we garbage collect
          delete options.array;
          // Run next step
          if(hamstersBenchmark.tests.length !== 0) {
            setTimeout(function() {
              self.runTask(hamstersBenchmark.tests.shift());
            }, hamstersBenchmark.delay);
          } else {
            hamstersBenchmark.complete();
          }
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
      document.getElementById("center").style.display = "none";
      document.getElementsByClassName("progress")[0].style.display = "block";
      document.getElementsByClassName("progress-bar")[0].style.width = "100%";
      this.generateOptions();
    }
  };
})();