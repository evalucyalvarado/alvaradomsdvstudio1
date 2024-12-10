// API key and base URL for object access
const apiKey = "OZPU7VOAD8nw3oY7Xi2Uh2f13GxB6FEpeb5buZ4h";  
const objectBaseURL = "https://api.si.edu/openaccess/api/v1.0/content/";

// Function to fetch content based on object ID
function fetchContentDataById(id) {
  let url = `${objectBaseURL}${id}?api_key=${apiKey}`;
  window
    .fetch(url)
    .then(res => res.json())
    .then(data => {
      const objectData = data.response;
      
      // Display the retrieved data in the console
      console.log("Here's the content data of the specified object:", objectData);

      // Extract and display the image URL if available
      const images = objectData.content.descriptiveNonRepeating.online_media.media;
      if (images && images.length > 0) {
        // Assuming the first media item is the image
        const imageUrl = images[0].content;
        console.log("Image URL:", imageUrl);

        // Display the image on the page
        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.alt = objectData.content.title;
        imgElement.style.maxWidth = "100%";
        document.body.appendChild(imgElement);
      } else {
        console.log("No image found for this object.");
      }
    })
    .catch(error => {
      console.log("Error fetching data:", error);
    });
}

// Use the object ID found on the Smithsonian site
fetchContentDataById("nmaahc_2012.149.6");
