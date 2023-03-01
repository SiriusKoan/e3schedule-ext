// handle processing and rednering data

const session_input = document.getElementById("input-session");
const submit_btn = document.getElementById("submit-session");
const port = chrome.runtime.connect({ name: "connection" });

var in_progress = [];

port.onMessage.addListener(function (response) {
  if (response["type"] == "main") {
    let html = document.createElement("div");
    html.setAttribute('style', 'display: none;');
    html.innerHTML = response["data"];
    let course_links = html.querySelectorAll("#layer2_right_current_course_stu .course-link");
    for (let i = 0; i < course_links.length; i++) {
      let id = course_links[i].href.split("id=")[1];
      port.postMessage({"type": "course", "id": id})
    }
  }
  else if (response["type"] == "course") {
   // homework in one class
    let html = document.createElement("div");
    html.setAttribute('style', 'display: none;');
    html.innerHTML = response["data"];
    let in_progress_names = html.querySelectorAll("#news-view-basic-in-progress tbody tr .instancename")
    let in_progress_start_dates = html.querySelectorAll("#news-view-basic-in-progress tbody tr td:nth-child(2)")
    let in_progress_due_dates = html.querySelectorAll("#news-view-basic-in-progress tbody tr td:nth-child(3)")
    let in_progress_students_counts = html.querySelectorAll("#news-view-basic-in-progress tbody tr td:nth-child(4)")
    let in_progress_links = html.querySelectorAll("#news-view-basic-in-progress tbody tr .aalink")
    for (let i = 0; i < in_progress_names.length; i++) {
      in_progress.push({
        "name": in_progress_names[i].innerText,
        "start_date": in_progress_start_dates[i].innerText,
        "due_date": in_progress_due_dates[i].innerText,
        "students_count": in_progress_students_counts[i].innerText,
        "link": in_progress_links[i].innerText,
      });
    }
    console.log(in_progress);
  }
});

submit_btn.addEventListener('click', function (event) {
  in_progress = []
  chrome.cookies.get({ url: "https://e3.nycu.edu.tw/my/", name: "MoodleSession" }, function (d) {
    port.postMessage({"type": "main", "session": d.value});
  })
});

