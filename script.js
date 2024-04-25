const checkbox = document.querySelector(".angle");
var calculator_magnitude = Desmos.GraphingCalculator(document.querySelector(".calculator_magnitude"), {
    expressionsCollapsed: true,
    expressions: false,
    settingsMenu: false,
    zoomButtons: false
});
var calculator_phase = Desmos.GraphingCalculator(document.querySelector(".calculator_phase"), {
    expressionsCollapsed: true,
    expressions: false,
    settingsMenu: false,
    zoomButtons: false
});
calculator_magnitude.updateSettings({
    xAxisLabel: "log(w)",
    yAxisLabel: "|L(iw)|dB",
    xAxisScale: "logarithmic",
    yAxisScale: "linear"
});
calculator_phase.updateSettings({
    xAxisLabel: "log(w)",
    yAxisLabel: "arg(L(iw))",
    xAxisScale: "logarithmic",
    yAxisScale: "linear"
});

calculator_magnitude.observe("graphpaperBounds", function () {
    calculator_phase.setMathBounds({
        left: calculator_magnitude.graphpaperBounds.mathCoordinates.left,
        right: calculator_magnitude.graphpaperBounds.mathCoordinates.right,
        bottom: calculator_phase.graphpaperBounds.mathCoordinates.bottom,
        top: calculator_phase.graphpaperBounds.mathCoordinates.top
    });
});

calculator_phase.observe("graphpaperBounds", function () {
    calculator_magnitude.setMathBounds({
        left: calculator_phase.graphpaperBounds.mathCoordinates.left,
        right: calculator_phase.graphpaperBounds.mathCoordinates.right,
        bottom: calculator_magnitude.graphpaperBounds.mathCoordinates.bottom,
        top: calculator_magnitude.graphpaperBounds.mathCoordinates.top
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
    max_y_magnitude = -Infinity;
    min_y_magnitude = Infinity;
    max_y_phase = -Infinity;
    min_y_phase = Infinity;

    var K = values[0];
    values[1] = values[1].trim();
    values[2] = values[2].trim();
    var w_c_num = values[1].trim() ? values[1].split(/[,\s]+/) : [];
    var w_c_den = values[2].trim() ? values[2].split(/[,\s]+/) : [];

    var magnitude_expression = "g(x) = " + Math.round(20 * Math.log10(Math.abs(K)), 2) + " + ";
    var phase_expression = "p(x) = " + (K > 0 ? "0" : "-\\pi") + " + ";

    w_c_num.forEach(function(w_c) {
        if(w_c == 0) {
            magnitude_expression += "20\\log(x)" + " + ";
            phase_expression += "\\frac{\\pi}{2}" + " + ";
        }
        else {
            magnitude_expression += "\\left\\{x<" + Math.abs(w_c) + ":\\ 0,\\ x\\ge"+ Math.abs(w_c) +":\\ 20\\log\\left(\\frac{x}{" + Math.abs(w_c) + "}\\right)\\right\\}" + " + ";
            phase_expression += "\\left\\{x<" + Math.abs(w_c/10) + ":\\ 0," + Math.abs(w_c/10) + "\\le x<" + Math.abs(w_c*10) + ":\\ \\frac{"+ Math.sign(w_c) +"\\cdot \\pi}{4}\\left(\\log\\left(x\\right)-\\log" + Math.abs(w_c/10) + "\\right),\\ x\\ge" + Math.abs(w_c*10) + ":\\ \\frac{" + Math.sign(w_c) + "\\cdot \\pi}{2}\\right\\}" + " + ";
        }
    });
    w_c_den.forEach(function(w_c) {
        if(w_c == 0) {
            magnitude_expression += "-20\\log(x)" + " + ";
            phase_expression += "\\frac{-\\pi}{2}" + " + ";
        }
        else {
            magnitude_expression += "\\left\\{x<" + Math.abs(w_c) + ":\\ 0,\\ x\\ge"+ Math.abs(w_c) +":\\ -20\\log\\left(\\frac{x}{" + Math.abs(w_c) + "}\\right)\\right\\}" + " + ";
            phase_expression += "\\left\\{x<" + Math.abs(w_c/10) + ":\\ 0," + Math.abs(w_c/10) + "\\le x<" + Math.abs(w_c*10) + ":\\ \\frac{"+ Math.sign(w_c) +"\\cdot -\\pi}{4}\\left(\\log\\left(x\\right)-\\log" + Math.abs(w_c/10) + "\\right),\\ x\\ge" + Math.abs(w_c*10) + ":\\ \\frac{"+ Math.sign(w_c) +"\\cdot -\\pi}{2}\\right\\}" + " + ";
        }
    });
    
    magnitude_expression = magnitude_expression.substring(0, magnitude_expression.length - 3);
    phase_expression = phase_expression.substring(0, phase_expression.length - 3);

    if(checkbox.checked) {
        phase_expression = phase_expression.slice(0, 7) + "(" + phase_expression.slice(7);
        phase_expression += ")\\cdot 180 / \\pi";
    }

    calculator_magnitude.setExpression({
        id: "magnitude",
        latex: magnitude_expression
    });
    calculator_phase.setExpression({
        id: "phase",
        latex: phase_expression
    });

    function find_x_bound(val) {
        if(val == 0) {
            return;
        }
        if(val < 0) {
            val *= -1;
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
        if(val < 0) {
            val *= -1;
        }
        var val_magnitude = calculator_magnitude.HelperExpression({ latex: "g(" + val + ")" });
        var val_phase = calculator_phase.HelperExpression({ latex: "p(" + val + ")" });
        const promise_magnitude = new Promise(resolve => {
            val_magnitude.observe("numericValue", function () {
                if(val_magnitude.numericValue > max_y_magnitude) {
                    max_y_magnitude = val_magnitude.numericValue;
                }
                if(val_magnitude.numericValue < min_y_magnitude) {
                    min_y_magnitude = val_magnitude.numericValue;
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
        return [promise_magnitude, promise_phase];
    }

    w_c_num.forEach(function(w_c) {
        find_x_bound(w_c);

        var check = [0.1, 1, 10];
        for(var i = 0; i < 3; i++) {
            var promise_val = find_y_bound(w_c * check[i]);
            if(promise_val.length != 0) {
                promises.push(promise_val[0]);
                promises.push(promise_val[1]);
            }
        }
    });

    w_c_den.forEach(function(w_c) {
        find_x_bound(w_c);

        var check = [0.1, 1, 10];
        for(var i = 0; i < 3; i++) {
            var promise_val = find_y_bound(w_c * check[i]);
            if(promise_val.length != 0) {
                promises.push(promise_val[0]);
                promises.push(promise_val[1]);
            }
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
            min_x = calculator_magnitude.graphpaperBounds.mathCoordinates.left*100;
        }
        if(max_x === -Infinity) {
            max_x = calculator_magnitude.graphpaperBounds.mathCoordinates.right/100;
        }
        if(min_y_magnitude == max_y_magnitude) {
            min_y_magnitude = calculator_magnitude.graphpaperBounds.mathCoordinates.bottom;
            max_y_magnitude = calculator_magnitude.graphpaperBounds.mathCoordinates.top;
            margin = 0;
        }
        if(min_y_phase == max_y_phase) {
            min_y_phase = calculator_phase.graphpaperBounds.mathCoordinates.bottom;
            max_y_phase = calculator_phase.graphpaperBounds.mathCoordinates.top;
            margin = 0;
        }

        calculator_magnitude.setMathBounds({
            left: min_x/100,
            right: max_x*100,
            bottom: min_y_magnitude - (max_y_magnitude - min_y_magnitude) * margin,
            top: max_y_magnitude + (max_y_magnitude - min_y_magnitude) * margin
        });
        calculator_phase.setMathBounds({
            left: min_x/100,
            right: max_x*100,
            bottom: min_y_phase - (max_y_phase - min_y_phase) * margin,
            top: max_y_phase + (max_y_phase - min_y_phase) * margin
        });
    });
}
