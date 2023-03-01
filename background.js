chrome.runtime.onConnect.addListener(function (port) {
  if (port.name) {
    port.onMessage.addListener(function (response) {
      console.log(response);
      fetch("https://e3.nycu.edu.tw", {headers: {Cookie: `MoodleSession=${response}`}})
      .then(res => {
        return res.text();
      })
      .then(html) => {
        console.log(html);
      })
    })
  }
})
