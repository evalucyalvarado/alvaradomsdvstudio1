// Import the fetchSearchData function and data variables
import { fetchSearchData, myArray, search } from './copesearch.js';
import { fetchSearchData2, myArray2, search2 } from './marshsearch.js';

// Function to download data as JSON file
function download(filename, text) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  document.body.removeChild(element);
}

// Function to initiate the download
function initiateDownload() {
  // Debugging: Log the arrays to see if they're populated
  console.log('Cope data:', myArray);
  console.log('Marsh data:', myArray2);

  // Combine arrays and stringify the result
  const combinedArray = [...myArray, ...myArray2];
  const text = JSON.stringify(combinedArray, null, 2); // Indent with 2 spaces for readability
  const filename = "fossildata.json"; // Name of the file

  // Trigger the download
  download(filename, text);
}

// Add event listener to download button
document.getElementById("dwn-btn").addEventListener("click", fetchAndDownload, false);

async function fetchAndDownload() {
  try {
    console.log('Fetching Cope data...');
    await fetchSearchData();
    console.log('Fetch from Cope completed.');

    // Log the data right after the fetch
    console.log('Cope data after fetch:', myArray);

    console.log('Fetching Marsh data...');
    await fetchSearchData2();
    console.log('Fetch from Marsh completed.');

    // Log the data right after the fetch
    console.log('Marsh data after fetch:', myArray2);

    // Debugging: Ensure arrays have data before downloading
    if (myArray.length === 0 || myArray2.length === 0) {
      console.error("Error: One of the arrays is empty. Check API response or data processing.");
      return;
    }

    console.log('Combining data and initiating download...');
    initiateDownload();
  } catch (error) {
    console.log('Error in fetchAndDownload:', error);
  }
}
