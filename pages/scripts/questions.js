// Question generation functions
const questions_gen_map = {
    "int_add_sub": () => {
        let num_1 = generate_num_by_max_limit(99); // use ceil to avoid x + 0 or x - 0 type questions
        let num_2 = generate_num_by_max_limit(99);
        return prepare_add_sub(num_1, num_2);
    },
    "sim_add_sub": () => {
        let num_1 = generate_num_by_max_limit(10);
        let num_2 = generate_num_by_max_limit(10);
        return prepare_add_sub(num_1, num_2);
    },
    "int_mul": () => {
        let num_1 = generate_num_by_max_limit(99); // limit multiplication to 12 for now
        let num_2 = generate_num_by_max_limit(99);
        return prepare_mul(num_1, num_2);
    },
    "sim_mul": () => {
        let num_1 = generate_num_by_max_limit(12); // limit multiplication to 12 for now
        let num_2 = generate_num_by_max_limit(12);
        return prepare_mul(num_1, num_2);
    },
    "int_div": () => {
        let num_1 = generate_num_by_max_limit(12); // ensure the divsor is single digit to avoid difficult divisions
        let num_2 = generate_num_by_max_limit(99);
        return prepare_div(num_1, num_2);
    },
    "sim_div": () => {
        let num_1 = generate_num_by_max_limit(12); // ensure the divsor is single digit to avoid difficult divisions
        let num_2 = generate_num_by_max_limit(12);
        return prepare_div(num_1, num_2);
    }
}

function generate_num_by_max_limit(max_num) {
    return Math.ceil(Math.random() * max_num)
}

function prepare_add_sub(num_1, num_2) {
    let addition = (Math.floor(Math.random() * 2) === 0);
    if (addition) {
        return [`${num_1} + ${num_2}`, (num_1 + num_2)];
    } else {
        // ensure the difference is positive
        let minuend = Math.max(num_1, num_2);
        let subtrahend = Math.min(num_1, num_2);
        return [`${minuend} - ${subtrahend}`, (minuend - subtrahend)];
    }
}

function prepare_mul(num_1, num_2) {
    return [`${num_1} x ${num_2}`, (num_1*num_2)];
}

function prepare_div(num_1, num_2) {
    let product = num_1*num_2;
    return [`${product} ÷ ${num_1}`, (product/num_1)];
}

const delay = (delay_time) => new Promise(res => setTimeout(res, delay_time));

// Listen and handle the enter key press
// On first enter key press, read the input value as the amount of questions to generate
// The following enter presses reads the input for answers to questions
// If correct, move to next question
let questions_amount = 0;
let questions = [];
let questions_index = 0;
let current_question = "";
let questions_start_time = 0;

document.getElementById('answer_box').addEventListener('keyup', async ({key}) => {
    if (key === "Enter") {
        let value = document.getElementById('answer_box').value;
        if (!questions_amount) {
            if ((/^\d+$/.test(value) === true) && parseInt(value) > 0 && parseInt(value) < 150) {
                questions_amount = parseInt(value);
                const question_type = localStorage.getItem("question_type");
                while (Object.keys(questions).length <= questions_amount) {
                    let [question, solution] = questions_gen_map[question_type]();
                    questions.push({[question]: solution});
                }
                current_question = Object.keys(questions[questions_index])[0];
                document.getElementById('prompt').innerHTML = current_question;
                questions_start_time = performance.now();
                // change error prompt now that a valid question number has been accepted
                document.getElementById('error_prompt').innerHTML = "Please enter a valid number."
            } else {
                document.getElementById('error_prompt').hidden = false;
                await delay(1500);
                document.getElementById('error_prompt').hidden = true;
            }
        } else {
            // Future reference: The regex to detect fractions separated by '/' is: /^\d+\/\d+$/
            if (/^\d+$/.test(value) === true) {
                let answer = parseInt(value);
                if (answer === questions[questions_index][current_question]) {
                    questions_index++;
                    current_question = Object.keys(questions[questions_index])[0];
                    document.getElementById('prompt').innerHTML = current_question;
                } else {
                    // use loop and changing background colour to achieve blinking effect when wrong
                    for (var i = 0; i < 3; i++) {
                        document.getElementById('answer_box').style.backgroundColor = '#FF1A1A';
                        await delay(100);
                        document.getElementById('answer_box').style.backgroundColor = '#FFFFFF';
                        await delay(100);
                    }
                }
            } else {
                document.getElementById('error_prompt').hidden = false;
                await delay(1500);
                document.getElementById('error_prompt').hidden = true;
            }
            if (questions_index === questions_amount) {
                end();
                return
            }
        }
        document.getElementById('answer_box').value = '';
    }
})

function end() {
    let questions_end_time = performance.now();
    // compute the average time spent in seconds, then multiply by 100, round and divide by 100 to return result with 2 decimal places
    let average_time_per_question = Math.round((questions_end_time - questions_start_time)/(1000*questions_amount)*100)/100;
    document.getElementById('prompt').innerHTML = "Finished!";
    document.getElementById('answer_box').hidden = true;
    document.getElementById('submit_hint').innerHTML = `An average ${average_time_per_question} seconds was spent on each question.`;
    document.getElementById('restart').hidden = false;
}