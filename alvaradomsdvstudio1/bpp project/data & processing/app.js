// app.js

// Load the data
Promise.all([
    d3.json('d3_data.json'),
    d3.json('processed_data.json')
]).then(function ([d3Data, processedData]) {
    const nodes = d3Data.nodes;
    const links = d3Data.links;

    // Create mappings
    const nameToNode = {};
    nodes.forEach(node => {
        nameToNode[node.name] = node;
    });

    const nameToImages = {};
    processedData.forEach(entry => {
        if (entry.processedNames && entry.processedNames.length > 0) {
            entry.processedNames.forEach(name => {
                if (!nameToImages[name]) {
                    nameToImages[name] = [];
                }
                nameToImages[name].push({
                    filename: entry.filename,
                    date: entry.date,
                    title: entry.title,
                    description: entry.description || '',
                });
            });
        }
    });

    // Attach image data to nodes
    nodes.forEach(node => {
        node.images = nameToImages[node.name] || [];
    });

    // Filter key members (totalWeight > 11 or name contains 'Unidentified')
    const keyMembers = nodes.filter(node => node.totalWeight > 11 || node.name.includes('Unidentified'));

    // Display key members in the main gallery
    displayGallery(keyMembers, '#key-members-gallery');

    // Function to display a gallery of members
    function displayGallery(members, gallerySelector) {
        const gallery = d3.select(gallerySelector);
        gallery.selectAll('*').remove(); // Clear existing items

        const items = gallery.selectAll('.gallery-item')
            .data(members)
            .enter()
            .append('div')
            .attr('class', 'gallery-item')
            .attr('data-name', d => d.name)
            .attr('data-id', d => d.id)
            .style('transform', d => `scale(${scaleValue(d.totalWeight)})`); // Scale based on weight

        // Create the card structure
        items.each(function (d) {
            const item = d3.select(this);

            // If the member has images, display the first one
            const imageData = d.images[0] || {};

            item.append('div')
                .attr('class', 'image')
                .append('img')
                .attr('src', imageData.filename ? './images/' + imageData.filename : 'placeholder-image.jpg')
                .attr('alt', d.name);

            // Title
            item.append('h3')
                .text(d.name);

            // Removed Tooltip from Gallery
            // Previously, there was a tooltip div here
        });

        // Removed Tooltips from Gallery Interactions
        // Previously, there were mouseenter and mouseleave events for tooltips

        // Set up click events to update radial network and gallery
        items.on('click', function (event, d) {
            const selectedNodeName = d.name;
            const selectedNode = nameToNode[selectedNodeName];

            if (selectedNode) {
                createRadialNetwork(selectedNode);
                updateImageGallery(selectedNode);
            }
        });
    }

    // Scale function for gallery item size
    function scaleValue(weight) {
        const minScale = 0.8;
        const maxScale = 1.2;
        const minWeight = d3.min(keyMembers, d => d.totalWeight);
        const maxWeight = d3.max(keyMembers, d => d.totalWeight);
        return ((weight - minWeight) / (maxWeight - minWeight)) * (maxScale - minScale) + minScale;
    }

    // Expose data to global scope
    window.networkData = {
        nodes: nodes,
        links: links,
        nameToNode: nameToNode,
        nameToImages: nameToImages,
        processedData: processedData
    };

    // Dispatch an event indicating that data is loaded
    document.dispatchEvent(new Event('dataLoaded'));
});
