// Download data as JSON file
function download(filename, text) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  document.body.removeChild(element);
}

// Click the download button to initiate download
document.getElementById("dwn-btn").addEventListener("click", function() {
  if (jsonString) {
      const filename = "data.json";
      download(filename, jsonString);
  } else {
      console.error("No data to download");
  }
}, false);
