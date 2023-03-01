// handle processing and rednering data

const session_input = document.getElementById("input-session");
const submit_btn = document.getElementById("submit-session");
const port = chrome.runtime.connect({ name: "connection" });

var in_progress = [];
var submitted = [];
var overdue = [];

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
    // in_progress
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
    // submitted
    let submitted_names = html.querySelectorAll("#news-view-nofile2-tobegraded-in-progress tbody tr .instancename")
    let submitted_start_dates = html.querySelectorAll("#news-view-nofile2-tobegraded-in-progress tbody tr td:nth-child(2)")
    let submitted_due_dates = html.querySelectorAll("#news-view-nofile2-tobegraded-in-progress tbody tr td:nth-child(3)")
    let submitted_students_counts = html.querySelectorAll("#news-view-nofile2-tobegraded-in-progress tbody tr td:nth-child(4)")
    let submitted_links = html.querySelectorAll("#news-view-nofile2-tobegraded-in-progress tbody tr .aalink")
    for (let i = 0; i < submitted_names.length; i++) {
      submitted.push({
        "name": submitted_names[i].innerText,
        "start_date": submitted_start_dates[i].innerText,
        "due_date": submitted_due_dates[i].innerText,
        "students_count": submitted_students_counts[i].innerText,
        "link": submitted_links[i].innerText,
      });
    }
    // overdue
    let overdue_names = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr .instancename")
    let overdue_start_dates = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr td:nth-child(2)")
    let overdue_due_dates = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr td:nth-child(3)")
    let overdue_students_counts = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr td:nth-child(4)")
    let overdue_links = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr .aalink")
    for (let i = 0; i < overdue_names.length; i++) {
      overdue.push({
        "name": overdue_start_dates[i].innerText,
        "due_date": overdue_due_dates[i].innerText,
        "students_count": overdue_students_counts[i].innerText,
        "link": overdue_links[i].innerText,
      });
    }
  }
});

submit_btn.addEventListener('click', function (event) {
  in_progress = []
  chrome.cookies.get({ url: "https://e3.nycu.edu.tw/my/", name: "MoodleSession" }, function (d) {
    port.postMessage({"type": "main", "session": d.value});
  })
});

