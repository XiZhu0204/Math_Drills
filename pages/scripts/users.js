// On click of view stats button, make request and follow redirect to show the stats
function view_stats() {
  let selected_user = document.getElementById("user_select").value;
  if (selected_user !== "guest") {
    window.location.href = `/stats?${new URLSearchParams({
      user: selected_user,
    })}`;
  } else {
    document.getElementById("user_error_prompt").innerHTML =
      "Guest is not a valid user.";
    show_ele(1000, "user_error_prompt");
  }
}

// On click of the add user button, show input box with enter press listener to add new user
function show_user_input() {
  // hide add user button and show user input field
  document.getElementById("add_user").hidden = true;
  document.getElementById("user_in").hidden = false;
}

// add user event
document.getElementById("user_in").addEventListener("keydown", ({ key }) => {
  if (key === "Enter") {
    fetch("api/users", {
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: `user_name=${document.getElementById("user_in").value}`,
    })
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          show_ele(1000, "user_success_prompt");
          location.reload();
        } else {
          document.getElementById("user_error_prompt").innerHTML =
            "The user already exists.";
          show_ele(1000, "user_error_prompt");
        }
      })
      .catch((error) => {
        console.error(`Error: ${error}`);
      });
  }
});

async function delay(time) {
  await new Promise((res) => setTimeout(res, time));
}

async function show_ele(show_time, ele_name) {
  document.getElementById(`${ele_name}`).hidden = false;
  await delay(show_time);
  document.getElementById(`${ele_name}`).hidden = true;
}
