// radial_network.js

// Global variables
let currentSelectedNode = null;
let currentImageIndex = 0;
let currentImages = [];

// Function to initialize the radial network and image gallery
function initRadialNetwork() {
    const nodes = window.networkData.nodes;
    const links = window.networkData.links;
    const nameToNode = window.networkData.nameToNode;

    // Initially select the first key member or default to a specific node
    const initialNodeName = nodes[0].name; // Change to your preferred initial node
    currentSelectedNode = nameToNode[initialNodeName];

    // Create the radial network and the image gallery
    createRadialNetwork(currentSelectedNode);
    updateImageGallery(currentSelectedNode);

    // Set up navigation buttons after DOM elements are available
    setupNavigationButtons();
}

// Function to set up navigation buttons
function setupNavigationButtons() {
    // Ensure that the DOM elements exist
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');

    if (prevButton && nextButton) {
        prevButton.addEventListener('click', function () {
            if (currentImages.length > 0) {
                currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
                displayCurrentImage();
            }
        });

        nextButton.addEventListener('click', function () {
            if (currentImages.length > 0) {
                currentImageIndex = (currentImageIndex + 1) % currentImages.length;
                displayCurrentImage();
            }
        });
    } else {
        console.error('Navigation buttons not found in the DOM.');
    }
}

// Wait for both the DOM and data to be loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    if (window.networkData) {
        initRadialNetwork();
    } else {
        document.addEventListener('dataLoaded', initRadialNetwork);
    }
});

// Function to create the radial network
function createRadialNetwork(selectedNode) {
    currentSelectedNode = selectedNode;

    // Clear any existing visualization
    d3.select('#radial-network').selectAll('*').remove();

    // Use deep copies to prevent modifying original data
    const nodesCopy = JSON.parse(JSON.stringify(window.networkData.nodes));
    const linksCopy = JSON.parse(JSON.stringify(window.networkData.links));

    // Find associated nodes
    const associatedNodes = findAssociatedNodes(selectedNode, nodesCopy, linksCopy);

    // Prepare data for visualization
    const visualizationData = {
        nodes: [selectedNode, ...associatedNodes],
        links: linksCopy.filter(link => {
            return (link.source === selectedNode.id || link.target === selectedNode.id) &&
                (associatedNodes.some(n => n.id === link.source || n.id === link.target));
        })
    };

    // Convert link source and target to node objects
    visualizationData.links.forEach(link => {
        link.source = visualizationData.nodes.find(n => n.id === link.source);
        link.target = visualizationData.nodes.find(n => n.id === link.target);
    });

    renderRadialNetwork(visualizationData, selectedNode);
}

function findAssociatedNodes(selectedNode, nodes, links) {
    const associatedIds = new Set();

    links.forEach(link => {
        if (link.source === selectedNode.id) {
            associatedIds.add(link.target);
        } else if (link.target === selectedNode.id) {
            associatedIds.add(link.source);
        }
    });

    const associatedNodes = nodes.filter(node => associatedIds.has(node.id));
    return associatedNodes;
}

function renderRadialNetwork(data, selectedNode) {
    const width = 600;
    const height = 600;

    const svg = d3.select('#radial-network')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const mainGroup = svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Scale for node sizes based on weight
    const nodeSizeScale = d3.scaleLinear()
        .domain(d3.extent(data.nodes, d => d.totalWeight))
        .range([20, 40]);

    // Scale for link widths based on weight (assuming weight is available)
    const linkWidthScale = d3.scaleLinear()
        .domain(d3.extent(data.links, d => d.weight || 1))
        .range([1, 5]);

    // Create simulation
    const simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.links).distance(150))
        .force('charge', d3.forceManyBody().strength(-500))
        .force('center', d3.forceCenter(0, 0))
        .on('tick', ticked);

    // Add links
    const link = mainGroup.selectAll('.link')
        .data(data.links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke', '#ff0000') // Red links
        .attr('stroke-width', d => linkWidthScale(d.weight || 1));

    // Add nodes
    const node = mainGroup.selectAll('.node')
        .data(data.nodes)
        .enter()
        .append('g')
        .attr('class', 'node');

    // Add circles to nodes (No images)
    node.append('circle')
        .attr('r', d => nodeSizeScale(d.totalWeight))
        .attr('fill', d => d.id === selectedNode.id ? '#ff0000' : '#000000') // Red for selected, Black otherwise
        .attr('stroke', '#ffffff') // White border for contrast
        .attr('stroke-width', 2);

    // Add labels
    node.append('text')
        .attr('dy', d => nodeSizeScale(d.totalWeight) + 15)
        .attr('text-anchor', 'middle')
        .text(d => d.name)
        .style('font-size', '12px')
        .style('fill', '#f0f0f0') // Light text color
        .style('font-family', 'Special Elite, cursive'); // Typewriter font

    // Node interactions (Tooltips remain if needed)
    node.on('click', function (event, d) {
        if (d.id !== selectedNode.id) {
            // Update the radial network and gallery with the clicked node
            createRadialNetwork(d);
            updateImageGallery(d);
        }
    })
    .on('mouseover', function (event, d) {
        // Show tooltip
        const tooltip = d3.select('#tooltip');
        if (tooltip.empty()) {
            d3.select('body').append('div').attr('id', 'tooltip').attr('class', 'tooltip');
        }
        const imageData = d.images[0] || {};
        d3.select('#tooltip')
            .html(() => {
                return `<h4>${imageData.title || d.name}</h4>
                        <p>${imageData.description || 'No description available.'}</p>`;
            })
            .style('visibility', 'visible')
            .style('top', (event.pageY - 20) + 'px')
            .style('left', (event.pageX + 20) + 'px');
    })
    .on('mousemove', function (event) {
        // Update tooltip position
        d3.select('#tooltip')
            .style('top', (event.pageY - 20) + 'px')
            .style('left', (event.pageX + 20) + 'px');
    })
    .on('mouseout', function () {
        // Hide tooltip
        d3.select('#tooltip').style('visibility', 'hidden');
    });

    function ticked() {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node
            .attr('transform', d => `translate(${d.x}, ${d.y})`);
    }
}

// Function to update the image gallery with images associated with the selected node
function updateImageGallery(selectedNode) {
    const images = selectedNode.images;

    // If no images are available, show a placeholder
    if (images.length === 0) {
        currentImages = [{
            filename: 'placeholder-image.jpg',
            title: 'No images available',
            description: ''
        }];
    } else {
        currentImages = images;
    }

    currentImageIndex = 0;
    displayCurrentImage();
}

// Function to display the current image in the polaroid container
function displayCurrentImage() {
    const imageData = currentImages[currentImageIndex];

    const galleryImage = document.getElementById('gallery-image');
    const imageCaption = document.getElementById('image-caption');

    if (galleryImage && imageCaption) {
        galleryImage.src = './images/' + imageData.filename;
        galleryImage.alt = imageData.title || 'Image';

        imageCaption.innerHTML = `<h4>${imageData.title || 'Untitled'}</h4><p>${imageData.description || ''}</p>`;
    } else {
        console.error('Gallery image or caption element not found.');
    }
}
