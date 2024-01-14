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
        let courseLinks = html.querySelectorAll("#layer2_right_current_course_stu .course-link");
        if (courseLinks.length == 0) {
            console.log("no courses");
            let notificationElement = document.getElementById("notification");
            notificationElement.innerText = "No courses found, maybe you haven't loged in.";
            notificationElement.style.display = "block";
            return;
        }

        for (let i = 0; i < courseLinks.length; i++) {
            let id = courseLinks[i].href.split("id=")[1];
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
        let inProgress = [];
        let inProgressNames = html.querySelectorAll("#news-view-basic-in-progress tbody tr .instancename")
        let inProgressStartDates = html.querySelectorAll("#news-view-basic-in-progress tbody tr td:nth-child(2)")
        let inProgressDueDates = html.querySelectorAll("#news-view-basic-in-progress tbody tr td:nth-child(3)")
        let inProgressStudentsCounts = html.querySelectorAll("#news-view-basic-in-progress tbody tr td:nth-child(4)")
        let inProgressLinks = html.querySelectorAll("#news-view-basic-in-progress tbody tr .aalink")
        for (let i = 0; i < inProgressNames.length; i++) {
            inProgress.push({
                "name": inProgressNames[i].innerText,
                "course_name": course_name,
                "start_date": inProgressStartDates[i].innerText,
                "due_date": inProgressDueDates[i].innerText,
                "students_count": inProgressStudentsCounts[i].innerText.match(students_count_regex).join("/"),
                "link": inProgressLinks[i].href,
            });
        }
        // save in_progress to local storage
        saveCache(inProgress, "in-progress");
        renderTable("in-progress", inProgress);
        // submitted
        let submitted = [];
        let submittedNames = html.querySelectorAll("#news-view-nofile2-tobegraded-in-progress tbody tr .instancename")
        let submittedStartDates = html.querySelectorAll("#news-view-nofile2-tobegraded-in-progress tbody tr td:nth-child(2)")
        let submittedDueDates = html.querySelectorAll("#news-view-nofile2-tobegraded-in-progress tbody tr td:nth-child(3)")
        let submittedStudentsCounts = html.querySelectorAll("#news-view-nofile2-tobegraded-in-progress tbody tr td:nth-child(4)")
        let submittedLinks = html.querySelectorAll("#news-view-nofile2-tobegraded-in-progress tbody tr .aalink")
        for (let i = 0; i < submittedNames.length; i++) {
            submitted.push({
                "name": submittedNames[i].innerText,
                "course_name": course_name,
                "start_date": submittedStartDates[i].innerText,
                "due_date": submittedDueDates[i].innerText,
                "students_count": submittedStudentsCounts[i].innerText.match(students_count_regex).join("/"),
                "link": submittedLinks[i].href,
            });
        }
        // save submitted to local storage
        saveCache(submitted, "submitted");
        renderTable("submitted", submitted);
        // overdue
        let overdue = [];
        let overdueNames = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr .instancename")
        let overdueStartDates = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr td:nth-child(2)")
        let overdueDueDates = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr td:nth-child(3)")
        let overdueStudentsCounts = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr td:nth-child(4)")
        let overdueLinks = html.querySelectorAll("#news-view-nofile2-notsubmitted-in-progress tbody tr .aalink")
        for (let i = 0; i < overdueNames.length; i++) {
            overdue.push({
                "name": overdueNames[i].innerText,
                "course_name": course_name,
                "start_date": overdueStartDates[i].innerText,
                "due_date": overdueDueDates[i].innerText,
                "students_count": overdueStudentsCounts[i].innerText.match(students_count_regex).join("/"),
                "link": overdueLinks[i].href,
            });
        }
        // save overdue to local storage
        saveCache(overdue, "overdue");
        renderTable("overdue", overdue);
        // save update time
        chrome.storage.local.set({
            "update_time": new Date().getTime()
        }, function() {
            console.log("update_time saved");
        });
    }
});

function saveCache(data, key) {
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

function flushCache() {
    chrome.storage.local.remove(["in-progress", "submitted", "overdue"], function() {
        console.log("cache flushed");
    });
}

function flushTable() {
    // flush all rows in in-progress-container
    let inProgressContainer = document.getElementById("in-progress-container");
    while (inProgressContainer.children.length > 1) {
        inProgressContainer.removeChild(inProgressContainer.lastChild);
    }
    // flush all rows in submitted-container
    let submittedContainer = document.getElementById("submitted-container");
    while (submittedContainer.children.length > 1) {
        submittedContainer.removeChild(submittedContainer.lastChild);
    }
    // flush all rows in overdue-container
    let overdueContainer = document.getElementById("overdue-container");
    while (overdueContainer.children.length > 1) {
        overdueContainer.removeChild(overdueContainer.lastChild);
    }
}

function fetchCourseData() {
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

function renderTable(type, data) {
    let container = document.getElementById(`${type}-container`);
    for (let i = 0; i < data.length; i++) {
        let row = `
        <td><a href="${data[i]["link"]}" target="_blank" title="${data[i]["name"]}(${data[i]["course_name"]})">${data[i]["name"]}</a></td>
        <td>${data[i]["start_date"]}</td>
        <td>${data[i]["due_date"]}</td>
        <td>${data[i]["students_count"]}</td>
        `
        let rowElement = document.createElement("tr");
        rowElement.innerHTML = row;
        container.appendChild(rowElement);
    }
}

window.onload = function() {
    // get cache data from local storage
    chrome.storage.local.get(["in_progress", "submitted", "overdue", "update_time"], function(data) {
        const timeDiff = (new Date() - new Date(data["update_time"])) / 1000;
        if (data["in-progress"] && data["submitted"] && data["overdue"] && timeDiff < 60 * 60 * 1) {
            renderTable("in-progress", data["in-progress"]);
            renderTable("submitted", data["submitted"]);
            renderTable("overdue", data["overdue"]);
        }
        else {
            flushCache();
            flushTable();
            fetchCourseData();
        }
    });
}

document.getElementById("refresh-btn").addEventListener("click", function() {
    flushCache();
    flushTable();
    fetchCourseData();
});
