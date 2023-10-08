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
        let course_name = html.querySelector("#page-header .page-context-header h1").innerText;
        course_name = /【[0-9]{3}.】[0-9]+(.*)/.exec(course_name.split(" ")[0])[1];
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
                "course_name": course_name,
                "start_date": in_progress_start_dates[i].innerText,
                "due_date": in_progress_due_dates[i].innerText,
                "students_count": in_progress_students_counts[i].innerText.match(students_count_regex).join("/"),
                "link": in_progress_links[i].href,
            });
        }
        // save in_progress to local storage
        save_cache(in_progress, "in_progress");
        render_table("in-progress", in_progress);
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
                "course_name": course_name,
                "start_date": submitted_start_dates[i].innerText,
                "due_date": submitted_due_dates[i].innerText,
                "students_count": submitted_students_counts[i].innerText.match(students_count_regex).join("/"),
                "link": submitted_links[i].href,
            });
        }
        // save submitted to local storage
        save_cache(submitted, "submitted");
        render_table("submitted", submitted);
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
                "course_name": course_name,
                "start_date": overdue_start_dates[i].innerText,
                "due_date": overdue_due_dates[i].innerText,
                "students_count": overdue_students_counts[i].innerText.match(students_count_regex).join("/"),
                "link": overdue_links[i].href,
            });
        }
        // save overdue to local storage
        save_cache(overdue, "overdue");
        render_table("overdue", overdue);
        // save update time
        chrome.storage.local.set({
            "update_time": new Date().getTime()
        }, function() {
            console.log("update_time saved");
        });
    }
});

function save_cache(data, key) {
    chrome.storage.local.get([key], function(result) {
        tmp = result[key] || [];
        for (let i = 0; i < data.length; i++) {
            tmp.push(data[i]);
        }
        chrome.storage.local.set({
            [key]: tmp
        }, function() {
            console.log(key + " saved");
        });
    });
}

function flush_cache() {
    chrome.storage.local.remove(["in_progress", "submitted", "overdue"], function() {
        console.log("cache flushed");
    });
}

function flush_table() {
    // flush all rows in in-progress-container
    let in_progress_container = document.getElementById("in-progress-container");
    while (in_progress_container.children.length > 1) {
        in_progress_container.removeChild(in_progress_container.lastChild);
    }
    // flush all rows in submitted-container
    let submitted_container = document.getElementById("submitted-container");
    while (submitted_container.children.length > 1) {
        submitted_container.removeChild(submitted_container.lastChild);
    }
    // flush all rows in overdue-container
    let overdue_container = document.getElementById("overdue-container");
    while (overdue_container.children.length > 1) {
        overdue_container.removeChild(overdue_container.lastChild);
    }
}

function fetch_course_data() {
    chrome.cookies.get({
        url: "https://e3.nycu.edu.tw/my/",
        name: "MoodleSession"
    }, function(d) {
        // fetch data
        port.postMessage({
            "type": "main",
            "session": d.value
        });
    })
}

function render_table(type, data) {
    let container = document.getElementById(`${type}-container`);
    for (let i = 0; i < data.length; i++) {
        let row = `
        <td><a href="${data[i]["link"]}" target="_blank">${data[i]["name"]}</a><br><span>(${data[i]["course_name"]})</span></td>
        <td>${data[i]["start_date"]}</td>
        <td>${data[i]["due_date"]}</td>
        <td>${data[i]["students_count"]}</td>
        `
        let row_ele = document.createElement("tr");
        row_ele.innerHTML = row;
        container.appendChild(row_ele);
    }
}

window.onload = function() {
    // get cache data from local storage
    chrome.storage.local.get(["in_progress", "submitted", "overdue", "update_time"], function(data) {
        time_diff = (new Date() - new Date(data["update_time"])) / 1000;
        if (data["in_progress"] && data["submitted"] && data["overdue"] && time_diff < 60 * 60 * 1) {
            render_table("in-progress", data["in_progress"]);
            render_table("submitted", data["submitted"]);
            render_table("overdue", data["overdue"]);
        }
        else {
            flush_cache();
            flush_table();
            fetch_course_data();
        }
    });
}

document.getElementById("refresh-btn").addEventListener("click", function() {
    flush_cache();
    flush_table();
    fetch_course_data();
});
