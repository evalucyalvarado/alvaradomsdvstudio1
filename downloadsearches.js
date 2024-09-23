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

// Function to fetch data and download the file
async function fetchAndDownload() {
  try {
    console.log('Fetching Cope data...');
    await fetchSearchData(); // Fetch data from Cope
    console.log('Fetch from Cope completed.');
    console.log('Cope data after fetch:', myArray); // Debugging

    console.log('Fetching Marsh data...');
    await fetchSearchData2(); // Fetch data from Marsh
    console.log('Fetch from Marsh completed.');
    console.log('Marsh data after fetch:', myArray2); // Debugging

    // Regardless of whether arrays have data, initiate the download
    console.log('Combining data and initiating download...');
    initiateDownload();
  } catch (error) {
    console.log('Error in fetchAndDownload:', error);
  }
}
