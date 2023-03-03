// handle processing and rednering data
const port = chrome.runtime.connect({
    name: "connection"
});

const students_count_regex = /[0-9]+/g

port.onMessage.addListener(function(response) {
    if (response["type"] == "main") {
        let html = document.createElement("div");
        html.setAttribute('style', 'display: none;');
        html.innerHTML = response["data"];
        let course_links = html.querySelectorAll("#layer2_right_current_course_stu .course-link");
        console.log(course_links)
        if (course_links.length == 0) {
            console.log("no courses");
            let notification_ele = document.getElementById("notification");
            notification_ele.innerText = "No courses found, maybe you haven't loged in.";
            notification_ele.style.display = "block";
            return;
        }
        
        for (let i = 0; i < course_links.length; i++) {
            let id = course_links[i].href.split("id=")[1];
            port.postMessage({
                "type": "course",
                "id": id
            })
        }
    } else if (response["type"] == "course") {
        // homework in one class
        let html = document.createElement("div");
        html.setAttribute('style', 'display: none;');
        html.innerHTML = response["data"];
        // in_progress
        let in_progress = [];
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
                "students_count": in_progress_students_counts[i].innerText.match(students_count_regex).join("/"),
                "link": in_progress_links[i].href,
            });
        }
        // submitted
        let submitted = [];
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
                "students_count": submitted_students_counts[i].innerText.match(students_count_regex).join("/"),
                "link": submitted_links[i].href,
            });
        }
        // overdue
        let overdue = [];
        let overdue_names = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr .instancename")
        let overdue_start_dates = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr td:nth-child(2)")
        let overdue_due_dates = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr td:nth-child(3)")
        let overdue_students_counts = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr td:nth-child(4)")
        let overdue_links = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr .aalink")
        for (let i = 0; i < overdue_names.length; i++) {
            overdue.push({
                "name": overdue_names[i].innerText,
                "start_date": overdue_start_dates[i].innerText,
                "due_date": overdue_due_dates[i].innerText,
                "students_count": overdue_students_counts[i].innerText.match(students_count_regex).join("/"),
                "link": overdue_links[i].href,
            });
        }
        // render
        let in_progress_container = document.getElementById("in-progress-container");
        for (let i = 0; i < in_progress.length; i++) {
            let row = `
            <td><a href="${in_progress[i]["link"]}">${in_progress[i]["name"]}</a></td>
            <td>${in_progress[i]["start_date"]}</td>
            <td>${in_progress[i]["due_date"]}</td>
            <td>${in_progress[i]["students_count"]}</td>
            `
            let row_ele = document.createElement("tr");
            row_ele.innerHTML = row;
            in_progress_container.appendChild(row_ele);
        }
        let submitted_container = document.getElementById("submitted-container");
        for (let i = 0; i < submitted.length; i++) {
            let row = `
            <td><a href="${submitted[i]["link"]}">${submitted[i]["name"]}</a></td>
            <td>${submitted[i]["start_date"]}</td>
            <td>${submitted[i]["due_date"]}</td>
            <td>${submitted[i]["students_count"]}</td>
            `
            let row_ele = document.createElement("tr");
            row_ele.innerHTML = row;
            submitted_container.appendChild(row_ele);
        }
        let overdue_container = document.getElementById("overdue-container");
        for (let i = 0; i < overdue.length; i++) {
            let row = `
            <td><a href="${overdue[i]["link"]}">${overdue[i]["name"]}</a></td>
            <td>${overdue[i]["start_date"]}</td>
            <td>${overdue[i]["due_date"]}</td>
            <td>${overdue[i]["students_count"]}</td>
            `
            let row_ele = document.createElement("tr");
            row_ele.innerHTML = row;
            overdue_container.appendChild(row_ele);
        }
    }
});


chrome.cookies.get({
    url: "https://e3.nycu.edu.tw/my/",
    name: "MoodleSession"
}, function(d) {
    port.postMessage({
        "type": "main",
        "session": d.value
    });
})
