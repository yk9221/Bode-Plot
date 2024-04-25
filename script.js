const checkbox = document.querySelector(".angle");
var calculator_gain = Desmos.GraphingCalculator(document.querySelector(".calculator_gain"), {expressionsCollapsed: true});
var calculator_phase = Desmos.GraphingCalculator(document.querySelector(".calculator_phase"), {expressionsCollapsed: true});
calculator_gain.updateSettings({ xAxisLabel: "x", yAxisLabel: "y", xAxisScale: "logarithmic", yAxisScale: "linear" });
calculator_phase.updateSettings({ xAxisLabel: "x", yAxisLabel: "y", xAxisScale: "logarithmic", yAxisScale: "linear" });

calculator_gain.observe("graphpaperBounds", function () {
    calculator_phase.setMathBounds({
        left: calculator_gain.graphpaperBounds.mathCoordinates.left,
        right: calculator_gain.graphpaperBounds.mathCoordinates.right,
        bottom: calculator_phase.graphpaperBounds.mathCoordinates.bottom,
        top: calculator_phase.graphpaperBounds.mathCoordinates.top
    });
});

calculator_phase.observe("graphpaperBounds", function () {
    calculator_gain.setMathBounds({
        left: calculator_phase.graphpaperBounds.mathCoordinates.left,
        right: calculator_phase.graphpaperBounds.mathCoordinates.right,
        bottom: calculator_gain.graphpaperBounds.mathCoordinates.bottom,
        top: calculator_gain.graphpaperBounds.mathCoordinates.top
    });
});

checkbox.addEventListener("change", function() {
    const checkboxText = document.querySelector(".angleUnit");
    if(checkbox.checked) {
        checkboxText.textContent = "Currently in Degrees";
    }
    else {
        checkboxText.textContent = "Currently in Radians";
    }
});

document.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        print_bode_plot();
    }
});


function print_bode_plot() {
    const promises = [];
    var values = [];
    for (var i = 1; i <= 3; i++) {
        var value = document.querySelector(".input" + i).value;
        if(i == 1 && value == "") {
            value = "1";
        }
        values.push(value);
    }
    max_x = -Infinity;
    min_x = Infinity;
    max_y_gain = -Infinity;
    min_y_gain = Infinity;
    max_y_phase = -Infinity;
    min_y_phase = Infinity;

    var K = values[0];
    var w_c_num = values[1].trim() ? values[1].split(/[,\s]+/) : [];
    var w_c_den = values[2].trim() ? values[2].split(/[,\s]+/) : [];

    var gain_expression = "g(x) = " + Math.round(20 * Math.log10(Math.abs(K)), 2) + " + "
    var phase_expression = "p(x) = " + (K > 0 ? "0" : "-\\pi") + " + ";

    w_c_num.forEach(function(w_c) {
        if(w_c == 0) {
            gain_expression += "20\\log(x)" + " + ";
            phase_expression += "\\frac{\\pi}{2}" + " + ";
        }
        else {
            gain_expression += "\\left\\{x<" + w_c + ":\\ 0,\\ x\\ge"+ w_c +":\\ 20\\log\\left(\\frac{x}{" + w_c + "}\\right)\\right\\}" + " + "
            phase_expression += "\\left\\{x<" + (w_c/10) + ":\\ 0," + (w_c/10) + "\\le x<" + (w_c*10) + ":\\ \\frac{\\pi}{4}\\left(\\log\\left(x\\right)-\\log" + (w_c/10) + "\\right),\\ x\\ge" + (w_c*10) + ":\\ \\frac{\\pi}{2}\\right\\}" + " + "
        }
    });
    w_c_den.forEach(function(w_c) {
        if(w_c == 0) {
            gain_expression += "-20\\log(x)" + " + ";
            phase_expression += "\\frac{-\\pi}{2}" + " + ";
        }
        else {
            gain_expression += "\\left\\{x<" + w_c + ":\\ 0,\\ x\\ge"+ w_c +":\\ -20\\log\\left(\\frac{x}{" + w_c + "}\\right)\\right\\}" + " + "
            phase_expression += "\\left\\{x<" + (w_c/10) + ":\\ 0," + (w_c/10) + "\\le x<" + (w_c*10) + ":\\ \\frac{-\\pi}{4}\\left(\\log\\left(x\\right)-\\log" + (w_c/10) + "\\right),\\ x\\ge" + (w_c*10) + ":\\ \\frac{-\\pi}{2}\\right\\}" + " + "
        }
    });
    
    gain_expression = gain_expression.substring(0, gain_expression.length - 3);
    phase_expression = phase_expression.substring(0, phase_expression.length - 3);

    if(checkbox.checked) {
        phase_expression = phase_expression.slice(0, 7) + "(" + phase_expression.slice(7);
        phase_expression += ")\\cdot 180 / \\pi";
    }

    calculator_gain.setExpression({ id: "gain", latex: gain_expression });
    calculator_phase.setExpression({ id: "phase", latex: phase_expression });

    function find_x_bound(val) {
        if(val == 0) {
            return;
        }
        if(val > max_x) {
            max_x = val;
        }
        if(val < min_x) {
            min_x = val;
        }
    }

    function find_y_bound(val) {
        if(val == 0) {
            return [];
        }
        var val_gain = calculator_gain.HelperExpression({ latex: "g(" + val + ")" });
        var val_phase = calculator_phase.HelperExpression({ latex: "p(" + val + ")" });
        const promise_gain = new Promise(resolve => {
            val_gain.observe("numericValue", function () {
                if(val_gain.numericValue > max_y_gain) {
                    max_y_gain = val_gain.numericValue;
                }
                if(val_gain.numericValue < min_y_gain) {
                    min_y_gain = val_gain.numericValue;
                }
                resolve();
            });
        });
        const promise_phase = new Promise(resolve => {
            val_phase.observe("numericValue", function () {
                if(val_phase.numericValue > max_y_phase) {
                    max_y_phase = val_phase.numericValue;
                }
                if(val_phase.numericValue < min_y_phase) {
                    min_y_phase = val_phase.numericValue;
                }
                resolve();
            });
        });
        return [promise_gain, promise_phase];
    }

    w_c_num.forEach(function(w_c) {
        find_x_bound(w_c);

        var promise_val = find_y_bound(w_c);
        if(promise_val.length != 0) {
            promises.push(promise_val[0]);
            promises.push(promise_val[1]);
        }
    });

    w_c_den.forEach(function(w_c) {
        find_x_bound(w_c);

        var promise_val = find_y_bound(w_c);
        if(promise_val.length != 0) {
            promises.push(promise_val[0]);
            promises.push(promise_val[1]);
        }
    });

    var promise_val_left = find_y_bound(min_x/100);
    promises.push(promise_val_left[0]);
    promises.push(promise_val_left[1]);

    var promise_val_right = find_y_bound(max_x*100);
    promises.push(promise_val_right[0]);
    promises.push(promise_val_right[1]);

    Promise.all(promises).then(() => {
        var margin = 0.1;
        if(min_x === Infinity) {
            min_x = calculator_gain.graphpaperBounds.mathCoordinates.left*100;
        }
        if(max_x === -Infinity) {
            max_x = calculator_gain.graphpaperBounds.mathCoordinates.right/100;
        }
        if(min_y_gain == max_y_gain) {
            min_y_gain = calculator_gain.graphpaperBounds.mathCoordinates.bottom;
            max_y_gain = calculator_gain.graphpaperBounds.mathCoordinates.top;
            margin = 0;
        }
        if(min_y_phase == max_y_phase) {
            min_y_phase = calculator_phase.graphpaperBounds.mathCoordinates.bottom;
            max_y_phase = calculator_phase.graphpaperBounds.mathCoordinates.top;
            margin = 0;
        }

        calculator_gain.setMathBounds({
            left: min_x/100,
            right: max_x*100,
            bottom: min_y_gain - (max_y_gain - min_y_gain) * margin,
            top: max_y_gain + (max_y_gain - min_y_gain) * margin
        });
        calculator_phase.setMathBounds({
            left: min_x/100,
            right: max_x*100,
            bottom: min_y_phase - (max_y_phase - min_y_phase) * margin,
            top: max_y_phase + (max_y_phase - min_y_phase) * margin
        });
    });
}
