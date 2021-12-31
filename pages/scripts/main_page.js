function get_question_type() {
    let selected_value = document.getElementById("questions_type").value;
    if (selected_value !== 'none') {
        window.location.href = `/questions?${new URLSearchParams({question_type: selected_value})}`;
    }
}