// Your API key
const apiKey = "OZPU7VOAD8nw3oY7Xi2Uh2f13GxB6FEpeb5buZ4h";

// Search base URL
const searchBaseURL = "https://api.si.edu/openaccess/api/v1.0/search";

// Constructing the initial search query
const search = `unit_code:"NMNHPALEO" AND object_type:"Holotypes"`;

// Array to store data
let myArray = [];

// String to hold JSON data
let jsonString = '';

// Fetch data from the API with retry mechanism
async function fetchSearchData(searchTerm) {
    let url = `${searchBaseURL}?api_key=${apiKey}&q=${encodeURIComponent(searchTerm)}&limit=100`;
    console.log(url);

    try {
        const data = await fetchDataWithRetry(url);
        console.log(data);

        const pageSize = 100;
        const numberOfQueries = Math.ceil(data.response.rowCount / pageSize);
        console.log(`Number of queries: ${numberOfQueries}`);

        for (let i = 0; i < numberOfQueries; i++) {
            const start = i * pageSize;
            const rows = i === numberOfQueries - 1 ? data.response.rowCount - start : pageSize;
            const searchAllURL = `${url}&start=${start}&rows=${rows}`;
            console.log(`Fetching all data from: ${searchAllURL}`);
            await fetchAllData(searchAllURL);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

// Fetch all data for the search with retry mechanism
async function fetchAllData(url) {
    try {
        const data = await fetchDataWithRetry(url);
        console.log(data);

        data.response.rows.forEach(n => {
            addObject(n);
        });

        // Update jsonString with all accumulated data
        jsonString = JSON.stringify(myArray, null, 2);
        console.log("Updated myArray:", myArray);
        console.log("JSON String:", jsonString);

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

// Retry mechanism for fetch requests
async function fetchDataWithRetry(url, retries = 5, delay = 1000) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(url);

            if (response.status === 429) {
                console.error("Rate limit exceeded. Retrying...");
                throw new Error("Rate limit exceeded");
            }

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return await response.json(); // Return data if successful

        } catch (error) {
            console.error("Fetch attempt failed:", error);

            if (attempt < retries - 1) {
                await new Promise(res => setTimeout(res, delay)); // Wait before retrying
                delay *= 2; // Exponential backoff
            } else {
                throw error; // Rethrow error if final attempt fails
            }
        }
    }
}


// Execute search
fetchSearchData(search);
