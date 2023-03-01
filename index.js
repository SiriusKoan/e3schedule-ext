// chrome.cookies.get({ url: "https://e3.nycu.edu.tw/my", name: "MoodleSession" }, function (d) {
//   document.getElementById("cookie").innerText = d.value;
//   // let course_container = document.getElementById("layer2_right_current_course_stu");
//   // console.log(course_container);
//   // let course_links = course_container.getElementsByClassName("course_link");
//   // console.log(course_links);
// });

const session_input = document.getElementById("input-session");
const submit_btn = document.getElementById("submit-session");
const port = chrome.runtime.connect({ name: "connection" });

port.onMessage.addListener(function (response) {
  console.log("response", response);
});

submit_btn.addEventListener('click', function (event) {
  chrome.cookies.get({ url: "https://e3.nycu.edu.tw/my", name: "MoodleSession" }, function (d) {
    port.postMessage(d.value);
  })
});

