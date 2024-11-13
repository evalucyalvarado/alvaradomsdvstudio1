// Your API key here
const apiKey = "OZPU7VOAD8nw3oY7Xi2Uh2f13GxB6FEpeb5buZ4h";

// Base URL for accessing terms
const termsBaseURL = "https://api.si.edu/openaccess/api/v1.0/terms";

// Function to fetch terms by topic
function fetchTermsByCategory(topic) {
  const url = `${termsBaseURL}/${topic}?api_key=${apiKey}`;
  return window
    .fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        console.error("Error:", data.message);
      } else {
        return data.response.terms || [];
      }
    })
    .catch(error => {
      console.error("Fetch error:", error);
    });
}

// Fetch terms for 'object_type'
fetchTermsByCategory("topic").then(terms => {
  console.log("Available topics terms:", terms);
});
