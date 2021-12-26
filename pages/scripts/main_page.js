const question_select = document.getElementById("questions_type");

question_select.addEventListener("change", () => {
    let selected_value = document.getElementById("questions_type").value;
    switch (selected_value) {
        case "Addition/Subtraction of Integers":
            localStorage.setItem("question_type", "int_add_sub");
            break
        case "Simple Addition/Subtraction":
            localStorage.setItem("question_type", "sim_add_sub");
            break
        case "Addition/Subtraction of Rationals":
            localStorage.setItem("question_type", "rational_add_sub");
            break
        case "Multiplication of Integers":
            localStorage.setItem("question_type", "int_mul");
            break
        case "Simple Multiplication":
            localStorage.setItem("question_type", "sim_mul");
            break
        case "Division of Integers":
            localStorage.setItem("question_type", "int_div");
            break
        case "Simple Division":
            localStorage.setItem("question_type", "sim_div");
            break
        case "Multiplication of Rationals":
            localStorage.setItem("question_type", "rational_mul");
            break
        case "Division of Rationals":
            localStorage.setItem("question_type", "rational_div");
            break
    }
})