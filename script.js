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

calculator_magnitude.observe("graphpaperBounds", function() {
    calculator_phase.setMathBounds({
        left: calculator_magnitude.graphpaperBounds.mathCoordinates.left,
        right: calculator_magnitude.graphpaperBounds.mathCoordinates.right,
        bottom: calculator_phase.graphpaperBounds.mathCoordinates.bottom,
        top: calculator_phase.graphpaperBounds.mathCoordinates.top
    });
});

calculator_phase.observe("graphpaperBounds", function() {
    calculator_magnitude.setMathBounds({
        left: calculator_phase.graphpaperBounds.mathCoordinates.left,
        right: calculator_phase.graphpaperBounds.mathCoordinates.right,
        bottom: calculator_magnitude.graphpaperBounds.mathCoordinates.bottom,
        top: calculator_magnitude.graphpaperBounds.mathCoordinates.top
    });
});

const checkbox_angle = document.querySelector(".angle");
const checkbox_exact = document.querySelector(".exact");

checkbox_angle.addEventListener("change", function() {
    print_bode_plot();

    const checkbox_angle_text = document.querySelector(".angleUnit");
    if(checkbox_angle.checked) {
        checkbox_angle_text.textContent = "Currently in Degrees";
    }
    else {
        checkbox_angle_text.textContent = "Currently in Radians";
    }
});
checkbox_exact.addEventListener("change", function() {
    print_bode_plot();

    const checkbox_exact_text = document.querySelector(".exactLabel");
    if(checkbox_exact.checked) {
        checkbox_exact_text.textContent = "Exact and Approximate";
    }
    else {
        checkbox_exact_text.textContent = "Approximate";
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
    var w_c_num = values[1].trim() ? values[1].match(/(?:\[.*?\]|[^,\s]+)/g) : [];
    var w_c_den = values[2].trim() ? values[2].match(/(?:\[.*?\]|[^,\s]+)/g) : [];

    var magnitude_expression_approximation = "g_{approximation}(x) = " + Math.round(20 * Math.log10(Math.abs(K)), 2) + " + ";
    var phase_expression_approximation = "p_{approximation}(x) = " + (K > 0 ? "0" : "-\\pi") + " + ";

    var magnitude_expression_exact = "g_{exact}(x) = " + Math.round(20 * Math.log10(Math.abs(K)), 2) + " + ";
    var phase_expression_exact = "p_{exact}(x) = " + (K > 0 ? "0" : "-\\pi") + " + ";

    w_c_num.forEach(function(w_c) {
        if(w_c[0] == "[" && w_c[w_c.length - 1] == "]") {
            w_c = w_c.substring(1, w_c.length - 1);
            w_c = w_c.trim();
            w_c_second_order = w_c.trim() ? w_c.split(/[,\s]+/) : [];

            var w_n = Math.sqrt(w_c_second_order[2]);
            var zeta = w_c_second_order[1] / (2 * w_n);

            magnitude_expression_approximation += "\\left\\{x<" + Math.abs(w_n) + ":\\ 0,\\ x\\ge" + Math.abs(w_n) + ":\\ 40\\log\\left(\\frac{x}{" + Math.abs(w_n) + "}\\right)\\right\\}" + " + ";
            phase_expression_approximation += "\\left\\{x<" + Math.abs(w_n/10) + ":\\ 0," + Math.abs(w_n/10) + "\\le x<" + Math.abs(w_n*10) + ":\\ \\frac{" + Math.sign(w_n) + "\\cdot \\pi}{2}\\left(\\log\\left(x\\right)-\\log" + Math.abs(w_n/10) + "\\right),\\ x\\ge" + Math.abs(w_n*10) + ": " + Math.sign(w_n) + "\\cdot \\pi\\right\\}" + " + ";

            magnitude_expression_exact += "10\\log\\left(\\left(1-\\frac{x^{2}}{\\left(" + w_n + "\\right)^{2}}\\right)^{2}+\\frac{4\\left(" + zeta + "\\right)^{2}x^{2}}{\\left(" + w_n + "\\right)^{2}}\\right)" + " + ";
            phase_expression_exact += "\\left\\{0\\le x \\le" + w_n + "\\ :\\ \\arctan\\left(\\frac{\\frac{2x \\cdot" + zeta + "}{" + w_n + "}}{1-\\frac{x^{2}}{" + (w_n) + "^{2}}}\\right),\\ x>" + w_n + "\\ :\\ \\left(\\arctan\\left(\\frac{\\frac{2x \\cdot" + zeta + "}{" + w_n + "}}{1-\\frac{x^{2}}{" + w_n + "^{2}}}\\right)+\\pi\\right)\\right\\}" + " + ";
        }
        else if(w_c == 0) {
            magnitude_expression_approximation += "20\\log(x)" + " + ";
            phase_expression_approximation += "\\frac{\\pi}{2}" + " + ";

            magnitude_expression_exact += "20\\log(x)" + " + ";
            phase_expression_exact += "\\frac{\\pi}{2}" + " + ";
        }
        else {
            magnitude_expression_approximation += "\\left\\{x<" + Math.abs(w_c) + ":\\ 0,\\ x\\ge"+ Math.abs(w_c) +":\\ 20\\log\\left(\\frac{x}{" + Math.abs(w_c) + "}\\right)\\right\\}" + " + ";
            phase_expression_approximation += "\\left\\{x<" + Math.abs(w_c/10) + ":\\ 0," + Math.abs(w_c/10) + "\\le x<" + Math.abs(w_c*10) + ":\\ \\frac{"+ Math.sign(w_c) +"\\cdot \\pi}{4}\\left(\\log\\left(x\\right)-\\log" + Math.abs(w_c/10) + "\\right),\\ x\\ge" + Math.abs(w_c*10) + ":\\ \\frac{" + Math.sign(w_c) + "\\cdot \\pi}{2}\\right\\}" + " + ";

            magnitude_expression_exact += "10\\log\\left(\\left(x\\cdot" + (1/w_c) + "\\right)^{2}+1\\right)" + " + ";
            phase_expression_exact += "\\arctan\\left(\\frac{x}{" + w_c + "}\\right)" + " + ";
        }
    });
    w_c_den.forEach(function(w_c) {
        if(w_c[0] == "[" && w_c[w_c.length - 1] == "]") {
            w_c = w_c.substring(1, w_c.length - 1);
            w_c = w_c.trim();
            w_c_second_order = w_c.trim() ? w_c.split(/[,\s]+/) : [];

            var w_n = Math.sqrt(w_c_second_order[2]);
            var zeta = w_c_second_order[1] / (2 * w_n);

            magnitude_expression_approximation += "\\left\\{x<" + Math.abs(w_n) + ":\\ 0,\\ x\\ge" + Math.abs(w_n) + ":\\ -40\\log\\left(\\frac{x}{" + Math.abs(w_n) + "}\\right)\\right\\}" + " + ";
            phase_expression_approximation += "\\left\\{x<" + Math.abs(w_n/10) + ":\\ 0," + Math.abs(w_n/10) + "\\le x<" + Math.abs(w_n*10) + ":\\ \\frac{" + Math.sign(w_n) + "\\cdot -\\pi}{2}\\left(\\log\\left(x\\right)-\\log" + Math.abs(w_n/10) + "\\right),\\ x\\ge" + Math.abs(w_n*10) + ": " + Math.sign(w_n) + "\\cdot -\\pi\\right\\}" + " + ";
            
            magnitude_expression_exact += "-10\\log\\left(\\left(1-\\frac{x^{2}}{\\left(" + w_n + "\\right)^{2}}\\right)^{2}+\\frac{4\\left(" + zeta + "\\right)^{2}x^{2}}{\\left(" + w_n + "\\right)^{2}}\\right)" + " + ";
            phase_expression_exact += "\\left\\{0\\le x\\le" + w_n + "\\ :\\ -\\arctan\\left(\\frac{\\frac{2x \\cdot" + zeta + "}{" + w_n + "}}{1-\\frac{x^{2}}{" + (w_n) + "^{2}}}\\right),\\ x>" + w_n + "\\ :\\ -\\left(\\arctan\\left(\\frac{\\frac{2x \\cdot" + zeta + "}{" + w_n + "}}{1-\\frac{x^{2}}{" + w_n + "^{2}}}\\right)+\\pi\\right)\\right\\}" + " + ";
            console.log(phase_expression_exact)
        }
        else if(w_c == 0) {
            magnitude_expression_approximation += "-20\\log(x)" + " + ";
            phase_expression_approximation += "\\frac{-\\pi}{2}" + " + ";

            magnitude_expression_exact += "-20\\log(x)" + " + ";
            phase_expression_exact += "\\frac{-\\pi}{2}" + " + ";
        }
        else {
            magnitude_expression_approximation += "\\left\\{x<" + Math.abs(w_c) + ":\\ 0,\\ x\\ge"+ Math.abs(w_c) +":\\ -20\\log\\left(\\frac{x}{" + Math.abs(w_c) + "}\\right)\\right\\}" + " + ";
            phase_expression_approximation += "\\left\\{x<" + Math.abs(w_c/10) + ":\\ 0," + Math.abs(w_c/10) + "\\le x<" + Math.abs(w_c*10) + ":\\ \\frac{"+ Math.sign(w_c) +"\\cdot -\\pi}{4}\\left(\\log\\left(x\\right)-\\log" + Math.abs(w_c/10) + "\\right),\\ x\\ge" + Math.abs(w_c*10) + ":\\ \\frac{"+ Math.sign(w_c) +"\\cdot -\\pi}{2}\\right\\}" + " + ";

            magnitude_expression_exact += "-10\\log\\left(\\left(x\\cdot" + (1/w_c) + "\\right)^{2}+1\\right)" + " + ";
            phase_expression_exact += "-\\arctan\\left(\\frac{x}{" + w_c + "}\\right)" + " + ";
        }
    });
    
    magnitude_expression_approximation = magnitude_expression_approximation.substring(0, magnitude_expression_approximation.length - 3);
    phase_expression_approximation = phase_expression_approximation.substring(0, phase_expression_approximation.length - 3);

    magnitude_expression_exact = magnitude_expression_exact.substring(0, magnitude_expression_exact.length - 3);
    phase_expression_exact = phase_expression_exact.substring(0, phase_expression_exact.length - 3);

    if(checkbox_angle.checked) {
        var equal_index = phase_expression_approximation.indexOf("=");
        phase_expression_approximation = phase_expression_approximation.slice(0, equal_index + 2) + "(" + phase_expression_approximation.slice(equal_index + 2);
        phase_expression_approximation += ")\\cdot 180 / \\pi";

        equal_index = phase_expression_exact.indexOf("=");
        phase_expression_exact = phase_expression_exact.slice(0, equal_index + 2) + "(" + phase_expression_exact.slice(equal_index + 2);
        phase_expression_exact += ")\\cdot 180 / \\pi";
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
    if(checkbox_exact.checked) {
        calculator_magnitude.setExpression({
            id: "magnitude_exact",
            latex: magnitude_expression_exact,
            lineStyle: Desmos.Styles.DASHED,
            lineOpacity: 0.5,
            color: Desmos.Colors.GREEN
        });
        calculator_phase.setExpression({
            id: "phase_exact",
            latex: phase_expression_exact,
            lineStyle: Desmos.Styles.DASHED,
            lineOpacity: 0.5,
            color: Desmos.Colors.GREEN
        });
    }
    else {
        calculator_magnitude.removeExpression({
            id: "magnitude_exact"
        });
        calculator_phase.removeExpression({
            id: "phase_exact"
        });
    }

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
            val_magnitude.observe("numericValue", function() {
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
            val_phase.observe("numericValue", function() {
                console.log(val, val_phase.numericValue);
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
        if(w_c[0] == "[" && w_c[w_c.length - 1] == "]") {
            w_c = w_c.substring(1, w_c.length - 1);
            w_c_second_order = w_c.trim() ? w_c.split(/[,\s]+/) : [];
            w_c = Math.sqrt(w_c_second_order[2]);
        }

        find_x_bound(w_c);

        for(var i = 0; i < check.length; i++) {
            var promise_val_approximation = find_y_bound(w_c * check[i], "approximation");
            var promise_val_exact = find_y_bound(w_c * check[i], "exact");

            if(promise_val_approximation.length != 0) {
                promises.push(promise_val_approximation[0]);
                promises.push(promise_val_approximation[1]);
            }
            if(promise_val_exact.length != 0) {
                promises.push(promise_val_exact[0]);
                promises.push(promise_val_exact[1]);
            }
        }
    });

    w_c_den.forEach(function(w_c) {
        if(w_c[0] == "[" && w_c[w_c.length - 1] == "]") {
            w_c = w_c.substring(1, w_c.length - 1);
            w_c_second_order = w_c.trim() ? w_c.split(/[,\s]+/) : [];
            w_c = Math.sqrt(w_c_second_order[2]);
        }

        find_x_bound(w_c);

        for(var i = 0; i < check.length; i++) {
            var promise_val_approximation = find_y_bound(w_c * check[i], "approximation");
            var promise_val_exact = find_y_bound(w_c * check[i], "exact");

            if(promise_val_approximation.length != 0) {
                promises.push(promise_val_approximation[0]);
                promises.push(promise_val_approximation[1]);
            }
            if(promise_val_exact.length != 0) {
                promises.push(promise_val_exact[0]);
                promises.push(promise_val_exact[1]);
            }
        }
    });

    var promise_val_left_approximation = find_y_bound(min_x/100, "approximation");
    promises.push(promise_val_left_approximation[0]);
    promises.push(promise_val_left_approximation[1]);

    var promise_val_left_exact = find_y_bound(min_x/100, "exact");
    promises.push(promise_val_left_exact[0]);
    promises.push(promise_val_left_exact[1]);

    var promise_val_right_approximation = find_y_bound(max_x*100, "approximation");
    promises.push(promise_val_right_approximation[0]);
    promises.push(promise_val_right_approximation[1]);

    var promise_val_right_exact = find_y_bound(max_x*100, "exact");
    promises.push(promise_val_right_exact[0]);
    promises.push(promise_val_right_exact[1]);

    Promise.all(promises).then(() => {
        console.log(min_y_phase, max_y_phase)
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
