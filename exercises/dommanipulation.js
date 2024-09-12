// Select the elements from the DOM
const viz = document.body.querySelector(".viz");
const button = document.body.querySelector("#button");

// Log the viz element and its children to the console
console.log(viz, viz.children);

// Function to add a new rectangle to the viz container
const addChildToViz = () => {
  const newChild = document.createElement("div");
  newChild.className = "rectangle";
  
  // You can customize the size, color, or other styles here
  const len = viz.children.length; // Example: based on the number of existing children
  newChild.style.height = len * 10 + 50 + "px"; // Increment height with each new element
  newChild.style.backgroundColor = len % 2 === 0 ? 'pink' : 'lightblue'; // Alternating colors
  
  viz.appendChild(newChild);
};

// Add an event listener to the button to add a new rectangle when clicked
button.addEventListener("click", addChildToViz);

// Function to fetch and log the Iris dataset (for the visualization task)
function drawIrisData() {
  window
    .fetch("./iris_json.json")
    .then(response => response.json())
    .then(data => {
      console.log(data); // Log the data for debugging

      // Example visualization: Create rectangles based on sepalLength
      data.forEach(item => {
        const newChild = document.createElement("div");
        newChild.className = "rectangle";
        newChild.style.height = item.petallength * 10 + "px";
        newChild.style.width = item.sepalWidth * 10 + "px";
        newChild.style.backgroundColor = "blue"; // Example color
        newChild.style.margin = "5px";

        viz.appendChild(newChild);
      });
    });
}

// Call the function to fetch and visualize the Iris dataset
drawIrisData();
