const question_type = new URLSearchParams(window.location.search).get('question_type');

// populate user select on load
window.onload = () => {
    fetch('/api/users').then(response => {
        if (response.status === 200) {
            response.json().then(data => {
                let user_select = document.getElementById('user_select');
                for (let i = 0; i < data.length; i++) {
                    user_select.appendChild(new Option(data[i], data[i]));
                }
            });
        } else {
            response.json().then(data => console.error(`Error: ${data['Error']}`));
        }
    });
}

// Listen and handle the enter key press
// On first enter key press, read the input value as the amount of questions to generate
// The following enter presses reads the input for answers to questions
// If correct, move to next question
let questions_amount = 0;
let questions = [];
let questions_index = 0;
let current_question = "";
let questions_start_time = 0;
let user_name = null;

document.getElementById('answer_box').addEventListener('keydown', async ({key}) => {
    if (key === "Enter") {
        let value = document.getElementById('answer_box').value;
        if (!questions_amount) {
            if ((/^\d+$/.test(value) === true) && parseInt(value) > 0 && parseInt(value) < 150) {
                questions_amount = parseInt(value);
                while (Object.keys(questions).length <= questions_amount) {
                    let [question, solution] = questions_gen_map[question_type]();
                    questions.push({[question]: solution});
                }
                current_question = Object.keys(questions[questions_index])[0];
                document.getElementById('prompt').innerHTML = current_question;

                // get user name from drop down
                user_name = document.getElementById('user_select').value;
                // hide the user select elements
                document.getElementById('user_select_prompt').hidden = true;
                document.getElementById('user_select').hidden = true;
                document.getElementById('add_user').hidden = true;
                document.getElementById('user_in').hidden = true;

                questions_start_time = performance.now();

                // change error prompt now that a valid question amount has been accepted
                document.getElementById('error_prompt').innerHTML = "Please enter a valid number."
            } else {
                await show_ele(1500, 'error_prompt');
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
                await show_ele(1500, 'error_prompt');
            }
            if (questions_index === questions_amount) {
                end();
                return
            }
        }
        document.getElementById('answer_box').value = '';
    }
});

async function show_ele(show_time, ele_name) {
    document.getElementById(`${ele_name}`).hidden = false;
    await new Promise(res => setTimeout(res, show_time));
    document.getElementById(`${ele_name}`).hidden = true;
}

function end() {
    let questions_end_time = performance.now();
    // compute the average time spent in seconds, then multiply by 100, round and divide by 100 to return result with 2 decimal places
    let average_time_per_question = Math.round((questions_end_time - questions_start_time)/(1000*questions_amount)*100)/100;
    document.getElementById('prompt').innerHTML = "Finished!";
    document.getElementById('answer_box').hidden = true;
    document.getElementById('submit_hint').innerHTML = `An average ${average_time_per_question} seconds was spent on each question on this attempt.`;
    document.getElementById('restart').hidden = false;
    if (!user_name || user_name === 'guest') {
        return;
    }

    fetch('/api/performance', {
        method: 'POST',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        body: `user_name=${user_name}&question_type=${question_type}&average_time=${average_time_per_question}`
    }).then(response => {
        if (response.status === 200) {
            response.json().then(data => {
                let previous_performance_text = document.getElementById('previous_performance_text');
                if (data.length === 0) {
                    previous_performance_text.hidden = false;
                } else {
                    previous_performance_text.innerHTML = `These are previous ${data.length} average times with these types of questions:`;
                    previous_performance_text.hidden = false;
                    let performance_list = document.getElementById('performance_list');
                    for (let i = 0; i < data.length; i++) {
                        let performance_item = document.createElement('li');
                        performance_item.className = 'performance_item';
                        performance_item.appendChild(document.createTextNode(`${data[i]} seconds per question.`));
                        performance_list.appendChild(performance_item);
                    }
                }
            });
        } else {
            response.json().then(data => console.error(`Error: ${data['Error']}`));
        }
    }).catch(error => {
        console.error(`Error: ${error}`);
    });
}

// On click of view stats button, make request and follow redirect to show the stats
function view_stats() {
    let selected_user = document.getElementById('user_select').value;
    if (selected_user !== 'guest') {
        window.location.href = `/stats?${new URLSearchParams({user: selected_user})}`;
    } else {
        document.getElementById('user_error_prompt').innerHTML = 'Guest is not a valid user.'
        show_ele(1000, 'user_error_prompt');
    }
}

// On click of the add user button, show input box with enter press listener to add new user
function show_user_input() {
    // hide add user button and show user input field
    document.getElementById('add_user').hidden = true;
    document.getElementById('user_in').hidden = false;
}

// add user event
document.getElementById('user_in').addEventListener('keydown', ({key}) => {
    if (key === "Enter") {
        fetch("api/users", {
            method: "POST",
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            },
            body: `user_name=${document.getElementById('user_in').value}`
        }).then(response => {
            console.log(response);
            if (response.status === 200) {
                show_ele(1000, 'user_success_prompt');
                location.reload();
            } else {
                document.getElementById('user_error_prompt').innerHTML = 'The user already exists.'
                show_ele(1000, 'user_error_prompt');
            }
        }).catch(error => {
            console.error(`Error: ${error}`);
        });
    }
});

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