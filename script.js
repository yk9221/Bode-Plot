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
    xAxisScale: "logarithmic",
    yAxisScale: "linear"
});
calculator_phase.updateSettings({
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

const checkbox = document.querySelector(".angle");
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
    const check = [0.1, Math.pow(10, -0.5), 1, Math.pow(10, 0.5), 10];
    var values = [];
    var input_box = document.querySelectorAll(".input");
    for (var i = 0; i < input_box.length; i++) {
        if(i == 0 && input_box[i].value == "") {
            input_box[i].value = "1";
        }
        values.push(input_box[i].value);
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

    var magnitude_expression_approximation = "g_{approximation}(x) = " + Math.round(20 * Math.log10(Math.abs(K)), 2) + " + ";
    var phase_expression_approximation = "p_{approximation}(x) = " + (K > 0 ? "0" : "-\\pi") + " + ";

    var magnitude_expression_actual = "g_{actual}(x) = " + Math.round(20 * Math.log10(Math.abs(K)), 2) + " + ";
    var phase_expression_actual = "p_{actual}(x) = " + (K > 0 ? "0" : "-\\pi") + " + ";

    w_c_num.forEach(function(w_c) {
        if(w_c == 0) {
            magnitude_expression_approximation += "20\\log(x)" + " + ";
            phase_expression_approximation += "\\frac{\\pi}{2}" + " + ";

            magnitude_expression_actual += "20\\log(x)" + " + ";
            phase_expression_actual += "\\frac{\\pi}{2}" + " + ";
        }
        else {
            magnitude_expression_approximation += "\\left\\{x<" + Math.abs(w_c) + ":\\ 0,\\ x\\ge"+ Math.abs(w_c) +":\\ 20\\log\\left(\\frac{x}{" + Math.abs(w_c) + "}\\right)\\right\\}" + " + ";
            phase_expression_approximation += "\\left\\{x<" + Math.abs(w_c/10) + ":\\ 0," + Math.abs(w_c/10) + "\\le x<" + Math.abs(w_c*10) + ":\\ \\frac{"+ Math.sign(w_c) +"\\cdot \\pi}{4}\\left(\\log\\left(x\\right)-\\log" + Math.abs(w_c/10) + "\\right),\\ x\\ge" + Math.abs(w_c*10) + ":\\ \\frac{" + Math.sign(w_c) + "\\cdot \\pi}{2}\\right\\}" + " + ";

            magnitude_expression_actual += "10\\log\\left(\\left(x\\cdot" + (1/w_c) + "\\right)^{2}+1\\right)" + " + ";
            phase_expression_actual += "\\arctan\\left(\\frac{x}{" + w_c + "}\\right)";
        }
    });
    w_c_den.forEach(function(w_c) {
        if(w_c == 0) {
            magnitude_expression_approximation += "-20\\log(x)" + " + ";
            phase_expression_approximation += "\\frac{-\\pi}{2}" + " + ";

            magnitude_expression_actual += "-20\\log(x)" + " + ";
            phase_expression_actual += "\\frac{-\\pi}{2}" + " + ";
        }
        else {
            magnitude_expression_approximation += "\\left\\{x<" + Math.abs(w_c) + ":\\ 0,\\ x\\ge"+ Math.abs(w_c) +":\\ -20\\log\\left(\\frac{x}{" + Math.abs(w_c) + "}\\right)\\right\\}" + " + ";
            phase_expression_approximation += "\\left\\{x<" + Math.abs(w_c/10) + ":\\ 0," + Math.abs(w_c/10) + "\\le x<" + Math.abs(w_c*10) + ":\\ \\frac{"+ Math.sign(w_c) +"\\cdot -\\pi}{4}\\left(\\log\\left(x\\right)-\\log" + Math.abs(w_c/10) + "\\right),\\ x\\ge" + Math.abs(w_c*10) + ":\\ \\frac{"+ Math.sign(w_c) +"\\cdot -\\pi}{2}\\right\\}" + " + ";

            magnitude_expression_actual += "-10\\log\\left(\\left(x\\cdot" + (1/w_c) + "\\right)^{2}+1\\right)" + " + ";
            phase_expression_actual += "-\\arctan\\left(\\frac{x}{" + w_c + "}\\right)";
        }
    });
    
    magnitude_expression_approximation = magnitude_expression_approximation.substring(0, magnitude_expression_approximation.length - 3);
    phase_expression_approximation = phase_expression_approximation.substring(0, phase_expression_approximation.length - 3);

    magnitude_expression_actual = magnitude_expression_actual.substring(0, magnitude_expression_actual.length - 3);

    if(checkbox.checked) {
        phase_expression_approximation = phase_expression_approximation.slice(0, 23) + "(" + phase_expression_approximation.slice(23);
        phase_expression_approximation += ")\\cdot 180 / \\pi";

        phase_expression_actual = phase_expression_actual.slice(0, 16) + "(" + phase_expression_actual.slice(16);
        phase_expression_actual += ")\\cdot 180 / \\pi";
    }

    calculator_magnitude.setExpression({
        id: "magnitude_approximation",
        latex: magnitude_expression_approximation,
        lineStyle: Desmos.Styles.SOLID,
        lineOpacity: 1.0,
        color: Desmos.Colors.BLUE
    });
    calculator_phase.setExpression({
        id: "phase_approximation",
        latex: phase_expression_approximation,
        lineStyle: Desmos.Styles.SOLID,
        lineOpacity: 1.0,
        color: Desmos.Colors.BLUE
    });
    calculator_magnitude.setExpression({
        id: "magnitude_actual",
        latex: magnitude_expression_actual,
        lineStyle: Desmos.Styles.DASHED,
        lineOpacity: 0.5,
        color: Desmos.Colors.GREEN
    });
    calculator_phase.setExpression({
        id: "magnitude_actual",
        latex: phase_expression_actual,
        lineStyle: Desmos.Styles.DASHED,
        lineOpacity: 0.5,
        color: Desmos.Colors.GREEN
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

    function find_y_bound(val, accuracyStatus) {
        if(val == 0) {
            return [];
        }
        if(val < 0) {
            val *= -1;
        }
        var val_magnitude = calculator_magnitude.HelperExpression({ latex: "g_{" + accuracyStatus + "}(" + val + ")" });
        var val_phase = calculator_phase.HelperExpression({ latex: "p_{" + accuracyStatus + "}(" + val + ")" });
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

        for(var i = 0; i < check.length; i++) {
            var promise_val_approximation = find_y_bound(w_c * check[i], "approximation");
            var promise_val_actual = find_y_bound(w_c * check[i], "actual");

            if(promise_val_approximation.length != 0) {
                promises.push(promise_val_approximation[0]);
                promises.push(promise_val_approximation[1]);
            }
            if(promise_val_actual.length != 0) {
                promises.push(promise_val_actual[0]);
                promises.push(promise_val_actual[1]);
            }
        }
    });

    w_c_den.forEach(function(w_c) {
        find_x_bound(w_c);

        for(var i = 0; i < check.length; i++) {
            var promise_val_approximation = find_y_bound(w_c * check[i], "approximation");
            var promise_val_actual = find_y_bound(w_c * check[i], "actual");

            if(promise_val_approximation.length != 0) {
                promises.push(promise_val_approximation[0]);
                promises.push(promise_val_approximation[1]);
            }
            if(promise_val_actual.length != 0) {
                promises.push(promise_val_actual[0]);
                promises.push(promise_val_actual[1]);
            }
        }
    });

    var promise_val_left_approximation = find_y_bound(min_x/100, "approximation");
    promises.push(promise_val_left_approximation[0]);
    promises.push(promise_val_left_approximation[1]);

    var promise_val_left_actual = find_y_bound(min_x/100, "actual");
    promises.push(promise_val_left_actual[0]);
    promises.push(promise_val_left_actual[1]);

    var promise_val_right_approximation = find_y_bound(max_x*100, "approximation");
    promises.push(promise_val_right_approximation[0]);
    promises.push(promise_val_right_approximation[1]);

    var promise_val_right_actual = find_y_bound(max_x*100, "actual");
    promises.push(promise_val_right_actual[0]);
    promises.push(promise_val_right_actual[1]);

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
