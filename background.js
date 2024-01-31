BASE_URL = "https://e3p.nycu.edu.tw";

// handle fetching data
var options;

chrome.runtime.onConnect.addListener(function(port) {
    if (port.name) {
        port.onMessage.addListener(function(response) {
            if (response["type"] == "main") {
                options = {
                    headers: {
                        Cookie: `MoodleSession=${response["session"]}`
                    }
                };
                fetch(BASE_URL, options)
                    .then(res => {
                        return res.text();
                    })
                    .then(html => {
                        port.postMessage({
                            "type": "main",
                            "data": html
                        });
                    })
            } else if (response["type"] == "course") {
                let url = `${BASE_URL}/local/courseextension/index.php?courseid=${response["id"]}&scope=assignment`
                fetch(url, options)
                    .then(res => {
                        return res.text();
                    })
                    .then(html => {
                        port.postMessage({
                            "type": "course",
                            "data": html
                        });
                    })
            }
        })
    }
})
