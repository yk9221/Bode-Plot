import math

K = 10
n_num = 0
n_den = 1
w_c_num = [1]
w_c_den = [10, 10]


gain_expression = ""
phase_expression = ""


# ----- Case 1 (K) -----
if K != 1:
    gain_equation = round(20 * math.log(abs(K), 10), 2)
    gain_expression += str(gain_equation) + " + "

    phase_equation = "" if K > 0 else "-\pi"
    phase_expression += phase_equation + " + "


# ----- Case 2a (s) -----
if n_num != 0:
    gain_equation = rf"{str(n_num)} \cdot 20\log(x)"
    gain_expression += gain_equation + " + "

    phase_equation = rf"{n_num} \cdot\frac{{\pi}}{{2}}"
    phase_expression += phase_equation + " + "


# ----- Case 2b (1/s) -----
if n_den != 0:
    gain_equation = rf"{str(n_den)} \cdot -20\log(x)"
    gain_expression += gain_equation + " + "

    phase_equation = rf"-{n_den} \cdot\frac{{\pi}}{{2}}"
    phase_expression += phase_equation + " + "


# ----- Case 3a (1+s/wc) -----
for w_c in w_c_num:
    gain_equation = rf"\left\{{x<{w_c}:\ 0,\ x\ge{w_c}:\ 20\log\left(\frac{{x}}{{{w_c}}}\right)\right\}}"
    gain_expression += gain_equation + " + "

    phase_equation = rf"\left\{{x<{w_c/10}:\ 0,\ {w_c/10}\le x<{w_c*10}:\ \frac{{\pi}}{{4}}\left(\log\left(x\right)-\log{w_c/10}\right),\ x\ge{w_c*10}:\ \frac{{\pi}}{{2}}\right\}}"
    phase_expression += phase_equation + " + "


# ----- Case 3b (1/(1+s/wc)) -----
for w_c in w_c_den:
    gain_equation = rf"\left\{{x<{w_c}:\ 0,\ x\ge{w_c}:\ -20\log\left(\frac{{x}}{{{w_c}}}\right)\right\}}"
    gain_expression += gain_equation + " + "

    phase_equation = rf"\left\{{x<{w_c/10}:\ 0,\ {w_c/10}\le x<{w_c*10}:\ -\frac{{\pi}}{{4}}\left(\log\left(x\right)-\log{w_c/10}\right),\ x\ge{w_c*10}:\ -\frac{{\pi}}{{2}}\right\}}"
    phase_expression += phase_equation + " + "


# ----- Print Expression -----
print("GAIN")
print(gain_expression[:-3])

print("PHASE")
print(phase_expression[:-3])
