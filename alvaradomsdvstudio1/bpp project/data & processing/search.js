const apiKey = "OZPU7VOAD8nw3oY7Xi2Uh2f13GxB6FEpeb5buZ4h";  
const searchBaseURL = "https://api.si.edu/openaccess/api/v1.0/search";

// Search query for Black Panther Party with specific object types and media types
const search = `Black Panthers AND Black Panther Party AND Black Panther AND object_type:(Photographs OR Portraits OR Posters OR Prints)`;

// Array to store results
let myArray = [];
let jsonString = '';

// Function to fetch search data
function fetchSearchData(searchTerm) {
    let url = `${searchBaseURL}?api_key=${apiKey}&q=${searchTerm}`;
    console.log(url);
    window
    .fetch(url)
    .then(res => res.json())
    .then(data => {
        console.log(data);
        
        let pageSize = 100;
        let numberOfQueries = Math.ceil(data.response.rowCount / pageSize);
        console.log(numberOfQueries);
        
        for(let i = 0; i < numberOfQueries; i++) {
            let searchAllURL;
            if (i === (numberOfQueries - 1)) {
                searchAllURL = `${url}&start=${i * pageSize}&rows=${data.response.rowCount - (i * pageSize)}`;
            } else {
                searchAllURL = `${url}&start=${i * pageSize}&rows=${pageSize}`;
            }
            console.log(searchAllURL);
            fetchAllData(searchAllURL);
        }
    })
    .catch(error => {
        console.log(error);
    });
}

// Function to fetch all paginated data
function fetchAllData(url) {
  window
  .fetch(url)
  .then(res => res.json())
  .then(data => {
    data.response.rows.forEach(function(n) {
      addObject(n);
    });
    console.log(myArray);
  })
  .catch(error => {
    console.log(error);
  });
}

// Function to add objects to the array
function addObject(objectData) {  
  let currentPlace = "";
  if (objectData.content.indexedStructured && objectData.content.indexedStructured.place) {
    currentPlace = objectData.content.indexedStructured.place[0];
  }

  let subjectNames = [];
  if (objectData.content.freetext && objectData.content.freetext.name) {
    subjectNames = objectData.content.freetext.name.map(nameEntry => nameEntry.content).filter(Boolean);
  }

  let descriptionNotes = "";
  if (objectData.content.freetext && objectData.content.freetext.notes) {
    descriptionNotes = objectData.content.freetext.notes[0]?.content || '';
  }

  let mediaType = "";
  if (objectData.content.indexedStructured && objectData.content.indexedStructured.object_type) {
    mediaType = objectData.content.indexedStructured.object_type[0];
  }

  myArray.push({
    id: objectData.id,
    title: objectData.title,
    museum: objectData.unitCode,
    link: objectData.content.descriptiveNonRepeating.record_link,
    place: currentPlace,
    subject: subjectNames.join(', '),
    description: descriptionNotes,
    objectType: mediaType
  });
}

// Function to download the JSON file
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Add a download button listener
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('download-btn').addEventListener('click', function () {
        if (myArray.length > 0) {
            let jsonString = JSON.stringify(myArray, null, 2); // Pretty print the JSON
            download("black_panther_party_results.json", jsonString);
        } else {
            console.error("No data available for download.");
            alert("No data available for download. Please try again.");
        }
    });

    // Trigger the search
    fetchSearchData(search);
});