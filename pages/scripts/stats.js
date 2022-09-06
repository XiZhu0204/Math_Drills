import { get_performance_string } from "./common";

const user_name = new URLSearchParams(window.location.search).get("user");

const question_type_map = {
  int_add_sub: "Addition/Subtraction of Integers",
  sim_add_sub: "Simple Addition/Subtraction",
  rational_add_sub: "Addition/Subtraction of Rationals",
  int_mul: "Multiplication of Integers",
  sim_mul: "Simple Multiplication",
  int_div: "Division of Integers",
  sim_div: "Simple Division",
  rational_mul: "Multiplication of Rationals",
  rational_div: "Division of Rationals",
};

const present_stats = () => {
  document.title = `${user_name}'s Stats`;
  document.getElementById("user_name_display").innerHTML = user_name;
  fetch(`/api/performance/${user_name}`).then((response) => {
    if (response.status === 200) {
      response.json().then((data) => {
        let stats_container = document.getElementById("stats_container");
        Object.keys(data).forEach((question_type) => {
          let average_times = data[question_type];
          let stat_div = document.createElement("div");
          let stat_intro = document.createElement("p");
          if (average_times.length !== 0) {
            stat_intro.innerHTML = `The most recent ${average_times.length} attempts at ${question_type_map[question_type]} had average times of:`;
          } else {
            stat_intro.innerHTML = `There have been no attempts at ${question_type_map[question_type]}`;
          }
          let times_list = document.createElement("ul");
          times_list.id = "stats_list";
          average_times.forEach((time) => {
            let item = document.createElement("li");
            item.className = "stats_item";
            item.appendChild(
              document.createTextNode(
                get_performance_string(time)
              )
            );
            times_list.appendChild(item);
          });
          stat_div.appendChild(stat_intro);
          stat_div.appendChild(times_list);
          stats_container.appendChild(stat_div);
        });
      });
    } else {
      response.json().then((data) => console.error(`Error: ${data["Error"]}`));
    }
  });
}

window.onload = () => {
    present_stats()
};