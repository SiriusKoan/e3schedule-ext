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
                fetch("https://e3.nycu.edu.tw", options)
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
                let url = `https://e3.nycu.edu.tw/local/courseextension/index.php?courseid=${response["id"]}&scope=assignment`
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
