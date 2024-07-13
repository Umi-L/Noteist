const fs = require('fs');
const path = require('path');

// Path to the index.html file
const filePath = path.join(__dirname, '../resources/index.html');

// The line to be inserted
const scriptLine = '<script crossorigin src="/js/neutralino.js"></script>\n';

// Read the file content
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        return console.log(err);
    }

    // Check if the line already exists
    if (data.includes(scriptLine)) {
        console.log('The script line already exists in the file.');
        return;
    }

    // Find the position to insert the line
    const index = data.indexOf('</head>');

    // If </head> is found
    if (index !== -1) {
        // Insert the script line before </head>
        const updatedData = data.slice(0, index) + scriptLine + data.slice(index);

        // Write the updated content back to the file
        fs.writeFile(filePath, updatedData, 'utf8', (err) => {
            if (err) return console.log(err);
            console.log('The script line has been added.');
        });
    } else {
        console.log('No </head> tag found in the file.');
    }
});
