import { Rationals } from "./rationals";
import { get_performance_string } from "./common";

const question_type = new URLSearchParams(window.location.search).get(
  "question_type"
);

// populate user select on load
window.onload = () => {
  fetch("/api/users").then((response) => {
    if (response.status === 200) {
      response.json().then((data) => {
        let user_select = document.getElementById("user_select");
        for (let i = 0; i < data.length; i++) {
          user_select.appendChild(new Option(data[i], data[i]));
        }
      });
    } else {
      response.json().then((data) => console.error(`Error: ${data["Error"]}`));
    }
  });
};

// Listen and handle the enter key press
// On first enter key press, read the input value as the amount of questions to generate
// The following enter presses reads the input for answers to questions
// If correct, move to next question
let questions_amount = 0;
let questions_index = 0;
let questions_start_time = 0;
let user_name = null;

let question = "";
let solution = null;

document
  .getElementById("answer_box")
  .addEventListener("keydown", async ({ key }) => {
    if (key === "Enter") {
      await handle_input();
    }
  });

  document
  .getElementById("answer_box")
  .addEventListener("blur", blurFunc);

function blurFunc() {
  document.getElementById("submit_hint").innerHTML = "Blurred";
}

async function delay(time) {
  await new Promise((res) => setTimeout(res, time));
}

async function show_ele(show_time, ele_name) {
  document.getElementById(`${ele_name}`).hidden = false;
  await delay(show_time);
  document.getElementById(`${ele_name}`).hidden = true;
}

async function handle_input() {
  let value = document.getElementById("answer_box").value;
  if (!questions_amount) {
    if (
      /^\d+$/.test(value) === true &&
      parseInt(value) > 0 &&
      parseInt(value) < 150
    ) {
      questions_amount = parseInt(value);

      [question, solution] = questions_gen_map[question_type]();
      document.getElementById("prompt").innerHTML = question;

      // get user name from drop down
      user_name = document.getElementById("user_select").value;
      // hide the user elements
      document.getElementById("user_select_prompt").hidden = true;
      document.getElementById("user_select").hidden = true;
      document.getElementById("add_user").hidden = true;
      document.getElementById("view_stats").hidden = true;
      document.getElementById("user_in").hidden = true;

      questions_start_time = performance.now();

      const fractions_required_map = {
        // all integers will be represented as rational numbers to avoid having to make extra functions to handle cases
        int_add_sub: false,
        sim_add_sub: false,
        rational_add_sub: true,
        int_mul: false,
        sim_mul: false,
        rational_mul: true,
        int_div: false,
        sim_div: false,
        rational_div: true,
      };

      if (fractions_required_map[question_type]) {
        // fractional responses expected, update prompt
        document.getElementById("submit_hint").innerHTML =
          "Press Enter to submit answer<br><br>Enter fractions by separating the numbers with /<br><br>Fractions must be reduced to simplist form";
      }
      // change error prompt now that a valid question amount has been accepted
      document.getElementById("error_prompt").innerHTML =
        "Please enter a valid number.";
    } else {
      await show_ele(1500, "error_prompt");
    }
  } else {
    // The regex tests for either integers or '/' separated fractions
    if (/^-?\d+$|^-?\d+\/\d+$/.test(value)) {
      let answer = null;
      if (value.includes("/")) {
        answer = new Rationals(
          parseInt(value.split("/")[0]),
          parseInt(value.split("/")[1])
        );
      } else {
        answer = new Rationals(parseInt(value), 1);
      }
      if (answer.equals(solution) && answer.gcd === 1) {
        // ensure answer is in simplist form
        questions_index++;
        [question, solution] = questions_gen_map[question_type]();
        document.getElementById("prompt").innerHTML = question;
      } else {
        document.getElementById("answer_box").value = "";
        // use loop and changing background colour to achieve blinking effect when wrong
        for (let i = 0; i < 3; i++) {
          document.getElementById("answer_box").style.backgroundColor =
            "#FF1A1A";
          await delay(100);
          document.getElementById("answer_box").style.backgroundColor =
            "#FFFFFF";
          await delay(100);
        }
      }
    } else {
      document.getElementById("answer_box").value = "";
      await show_ele(1500, "error_prompt");
    }
    if (questions_index === questions_amount) {
      end();
      return;
    }
  }
  document.getElementById("answer_box").value = "";
}

function end() {
  let questions_end_time = performance.now();
  // compute the average time spent in seconds, then multiply by 100, round and divide by 100 to return result with 2 decimal places
  let average_time_per_question =
    Math.round(
      ((questions_end_time - questions_start_time) /
        (1000 * questions_amount)) *
        100
    ) / 100;
  document.getElementById("prompt").innerHTML = "Finished!";
  document.getElementById("answer_box").hidden = true;
  document.getElementById(
    "submit_hint"
  ).innerHTML = `An average ${average_time_per_question} seconds was spent on each question on this attempt.`;
  document.getElementById("restart").hidden = false;
  // document.getElementById('prompt').style.fontFamily = "Helvetica, sans-serif";
  if (!user_name || user_name === "guest") {
    return;
  }

  // unhide view stats if user is selected
  document.getElementById("view_stats").hidden = false;
  fetch("/api/performance", {
    method: "POST",
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
    body: `user_name=${user_name}&question_type=${question_type}&average_time=${average_time_per_question}`,
  })
    .then((response) => {
      if (response.status === 200) {
        response.json().then((data) => {
          let previous_performance_text = document.getElementById(
            "previous_performance_text"
          );
          if (data.length === 0) {
            previous_performance_text.hidden = false;
          } else {
            previous_performance_text.innerHTML = `These are the average times for the previous ${data.length} attempts at this question type:`;
            previous_performance_text.hidden = false;
            let performance_list = document.getElementById("performance_list");
            data.forEach((performance) => {
              let performance_item = document.createElement("li");
              performance_item.className = "performance_item";
              performance_item.appendChild(
                document.createTextNode(get_performance_string(performance))
              );
              performance_list.appendChild(performance_item);
            });
          }
        });
      } else {
        response
          .json()
          .then((data) => console.error(`Error: ${data["Error"]}`));
      }
    })
    .catch((error) => {
      console.error(`Error: ${error}`);
    });
}

// Question generation functions
const questions_gen_map = {
  // all integers will be represented as rational numbers to avoid having to make extra functions to handle cases
  int_add_sub: () => {
    let num_1 = new Rationals(generate_num_by_max_limit(99), 1); // use ceil to avoid x + 0 or x - 0 type questions
    let num_2 = new Rationals(generate_num_by_max_limit(99), 1);
    return prepare_add_sub(num_1, num_2, true);
  },
  sim_add_sub: () => {
    let num_1 = new Rationals(generate_num_by_max_limit(10), 1);
    let num_2 = new Rationals(generate_num_by_max_limit(10), 1);
    return prepare_add_sub(num_1, num_2, false);
  },
  rational_add_sub: () => {
    let num_1 = generate_random_rational();
    let num_2 = generate_random_rational();
    return prepare_add_sub(num_1, num_2, true);
  },
  int_mul: () => {
    let num_1 = new Rationals(generate_num_by_max_limit(99), 1); // limit multiplication to 12 for now
    let num_2 = new Rationals(generate_num_by_max_limit(99), 1);
    return prepare_mul(num_1, num_2);
  },
  sim_mul: () => {
    let num_1 = new Rationals(generate_num_by_max_limit(12), 1); // limit multiplication to 12 for now
    let num_2 = new Rationals(generate_num_by_max_limit(12), 1);
    return prepare_mul(num_1, num_2);
  },
  rational_mul: () => {
    let num_1 = generate_random_rational();
    let num_2 = generate_random_rational();
    return prepare_mul(num_1, num_2);
  },
  int_div: () => {
    let num_1 = new Rationals(generate_num_by_max_limit(12), 1); // ensure the divsor is single digit to avoid difficult divisions
    let num_2 = new Rationals(generate_num_by_max_limit(99), 1);
    return prepare_div(num_1, num_2);
  },
  sim_div: () => {
    let num_1 = new Rationals(generate_num_by_max_limit(12), 1); // ensure the divsor is single digit to avoid difficult divisions
    let num_2 = new Rationals(generate_num_by_max_limit(12), 1);
    return prepare_div(num_1, num_2);
  },
  rational_div: () => {
    let num_1 = generate_random_rational();
    let num_2 = generate_random_rational();
    return prepare_div(num_1, num_2);
  },
};

function generate_num_by_max_limit(max_num) {
  return Math.ceil(Math.random() * max_num);
}

function generate_random_rational() {
  // cap numerator/denominators to 12 to avoid difficult questions
  return new Rationals(
    Math.ceil(Math.random() * 12),
    Math.ceil(Math.random() * 12)
  );
}

function prepare_add_sub(num_1, num_2, allow_negatives) {
  let addition = Math.floor(Math.random() * 2) === 0;
  if (addition) {
    return [`${num_1} + ${num_2}`, num_1.add(num_2)];
  } else {
    if (allow_negatives) {
      return [`${num_1} - ${num_2}`, num_1.sub(num_2)];
    } else {
      // ensure the difference is positive
      let minuend = Rationals.max(num_1, num_2);
      let subtrahend = Rationals.min(num_1, num_2);
      return [`${minuend} - ${subtrahend}`, minuend.sub(subtrahend)];
    }
  }
}

function prepare_mul(num_1, num_2) {
  return [`${num_1} x ${num_2}`, num_1.mul(num_2)];
}

function prepare_div(num_1, num_2) {
  let product = num_1.mul(num_2);
  return [`${product} ÷ ${num_1}`, num_2];
}
