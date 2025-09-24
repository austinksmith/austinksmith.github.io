(function() {
    'use strict';

    // Ensure hamsters.maxThreads is defined
    var maxThreads = hamsters.maxThreads || 4;

    // Generate a comma-separated list of numbers from 1 to maxThreads
    var numbers = [];
    for (var i = 1; i <= maxThreads; i++) {
        numbers.push(i);
    }
    var numbersString = numbers.join(", ");

    // Update the value of inputNumbersElement with the generated list of numbers
    var inputNumbersElement = document.getElementById("input_value_numbers");
    if (inputNumbersElement) {
        inputNumbersElement.value = numbersString;
    } else {
        console.error('Element with id "input_value_numbers" not found.');
    }

    // Add Fibonacci sequence benchmark
    hamstersBenchmark.testTypes['fibonacci_sequence'] = {
        generateOptions: function() {
            var statusTextElement = document.querySelector(".status_text");
            if (statusTextElement) {
                statusTextElement.innerHTML = "Bribing " + hamsters.maxThreads + " hamsters with food..";
                statusTextElement.innerHTML = "Readying the exercise wheels..";
            }

            var inputNumbersValue = inputNumbersElement.value;
            hamstersBenchmark.testArray = inputNumbersValue.split(",").map(Number);

            var testOptionsArray = [];
            for (var i = 0; i < hamsters.maxThreads; i++) {
                var testOptions = {
                    aggregate: false,
                    mixedOutput: true,
                    threads: i + 1
                };
                testOptionsArray.push(testOptions);
            }

            hamstersBenchmark.tests = testOptionsArray;

            this.getBaseline();
        },

        runTask: function(options) {
            hamstersBenchmark.currentTest = 'Fibonacci Sequence';
            var statusText = document.getElementsByClassName("status_text")[0];
            if (statusText) {
                statusText.innerHTML = options.threads + " hamsters running!";
            }
            var forName = options.threads + "_for";
            var forStart = forName + "_start";
            var forEnd = forName + "_end";
            options.array = hamstersBenchmark.testArray;
            this.invokeLoop(options, forStart, forName, forEnd);
        },

        invokeLoop: function(options, forStart, forName, forEnd) {
            var self = this;
            window.performance.mark(forStart);
            hamsters.run(options, function() {
                function fibonacci(n) {
                    if (n <= 1) return n;
                    return fibonacci(n - 1) + fibonacci(n - 2);
                }
                var results = [];
                for (var i = 0; i < params.array.length; i++) {
                    const fibSeq = [];
                    for (var j = 0; j <= params.array[i]; j++) {
                        fibSeq.push(fibonacci(j));
                    }
                    results.push(fibSeq);
                }
                rtn.data.push(results);
            }, function(results) {
                window.performance.mark(forEnd);
                window.performance.measure(forName, forStart, forEnd);
                // Run next step
                if (hamstersBenchmark.tests.length !== 0) {
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
            this.runTask(hamstersBenchmark.tests.shift());
        },

        run: function() {
            hamstersBenchmark.clearResults();
            var resultsElement = document.getElementsByClassName("results")[0];
            if (resultsElement) {
                resultsElement.style.display = "none";
            }
            var progressElement = document.getElementsByClassName("progress")[0];
            if (progressElement) {
                progressElement.style.display = "flex";
            }
            this.generateOptions();
        }
    };
})();
