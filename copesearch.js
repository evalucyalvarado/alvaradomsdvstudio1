// Your API key here
const apiKey = "";  

// Search base URL
const searchBaseURL = "https://api.si.edu/openaccess/api/v1.0/search";

// Initial search query
export const search = `Cope AND unit_code:"NMNHPALEO" AND object_type:"Holotypes"`;

// Array to hold the data
export let myArray = [];

// String to hold the stringified JSON data
export let jsonString = '';

// Function to fetch search data
export async function fetchSearchData(searchTerm) {
    const url = `${searchBaseURL}?api_key=${apiKey}&q=${encodeURIComponent(searchTerm)}`;
    console.log('Fetching data from URL:', url);

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Initial data:', data);

        const pageSize = 1000;
        const numberOfQueries = Math.ceil(data.response.rowCount / pageSize);
        console.log('Number of queries needed:', numberOfQueries);

        const fetchPromises = [];
        for (let i = 0; i < numberOfQueries; i++) {
            const start = i * pageSize;
            const rows = (i === (numberOfQueries - 1)) ? (data.response.rowCount - start) : pageSize;
            const searchAllURL = `${url}&start=${start}&rows=${rows}`;
            console.log('Fetching additional data from:', searchAllURL);
            fetchPromises.push(fetchAllData(searchAllURL));
        }

        await Promise.all(fetchPromises); // Wait for all fetches to complete

        // Set jsonString to the complete data after all fetches
        jsonString = JSON.stringify(myArray, null, 2); // Make JSON readable
        console.log('Complete data:', myArray);

        // Note: Do NOT initiate download here automatically.
        // The download should be controlled manually in the main file.
    } catch (error) {
        console.log('Error in fetchSearchData:', error);
    }
}

// Function to fetch all data
async function fetchAllData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Fetched additional data:', data);

        data.response.rows.forEach(n => addObject(n));
    } catch (error) {
        console.log('Error in fetchAllData:', error);
    }
}

// Function to add data to the array
function addObject(objectData) {
    let currentPlace = "";
    if (objectData.content.indexedStructured.place) {
        currentPlace = objectData.content.indexedStructured.place[2] || ""; // Default to empty string if undefined
    }

    let collectorName = "";
    if (objectData.content?.freetext?.name?.length > 0) {
        collectorName = objectData.content.freetext.name[0].content;
    }

    let collectionDate = "";
    if (objectData.content?.freetext?.date?.length > 0) {
        collectionDate = objectData.content.freetext.date[0].content;
    }

    myArray.push({
        id: objectData.id,
        title: objectData.title,
        place: currentPlace,
        name: collectorName,
        date: collectionDate,
    });
}

// Remove the `fetchSearchData(search)` call from the end of the file.
// This should be triggered manually in the main code when needed.
