let homeFolder = '';

document.addEventListener('DOMContentLoaded', function() {
    updateProjectList();
});

document.getElementById('setHomeFolderBtn').addEventListener('click', function() {
    const folderName = document.getElementById('homeFolderName').value.trim();
    if (folderName) {
        homeFolder = folderName;
        document.getElementById('editorControls').style.display = 'block';
        document.getElementById('setHomeFolder').style.display = 'none';
        document.getElementById('fileTreeView').style.display = 'block';
        document.getElementById('existingProjects').style.display = 'none';
        updateFileList();
    } else {
        alert('Please enter a project name.');
    }
});

document.getElementById('startEditorBtn').addEventListener('click', function() {
    document.getElementById('createFileBtn').style.display = 'inline-block';
    document.getElementById('deleteFileBtn').style.display = 'inline-block';
    this.style.display = 'none';
});

document.getElementById('createFileBtn').addEventListener('click', function() {
    let fileName = prompt("Enter file name (must end with .c):");
    while (fileName && !fileName.endsWith(".c")) {
        alert("File name must end with '.c'. Please enter a valid file name.");
        fileName = prompt("Enter file name (must end with .c):");
    }
    if (fileName) {
        document.getElementById('editor').style.display = 'block';
        document.getElementById('fileEditor').value = ''; // Clear editor
        document.getElementById('fileEditor').setAttribute("data-filename", fileName); // Store file name in an attribute
    }
    document.getElementById('downloadBtn').style.display = 'block';
});


document.getElementById('saveBtn').addEventListener('click', function() {
    const content = document.getElementById('fileEditor').value;
    const fileName = document.getElementById('fileEditor').getAttribute("data-filename");
    if (fileName) {
        localStorage.setItem(`${homeFolder}_${fileName}`, content);
        alert('File saved in project: ' + homeFolder);
        updateFileList(); // Refresh the file list
    } else {
        alert('No file name specified.');
    }
});

document.getElementById('deleteFileBtn').addEventListener('click', function() {
    const fileName = prompt("Enter file name to delete:");
    if (fileName && localStorage.getItem(`${homeFolder}_${fileName}`)) {
        localStorage.removeItem(`${homeFolder}_${fileName}`);
        alert('File deleted from project: ' + homeFolder);
        updateFileList(); // Refresh the file list
    } else {
        alert('File not found.');
    }
});

// function updateFileList() {
//     const fileList = document.getElementById('fileList');
//     fileList.innerHTML = '';

//     for (let i = 0; i < localStorage.length; i++) {
//         const key = localStorage.key(i);
//         if (key.startsWith(homeFolder + "_")) {
//             const fileName = key.split('_')[1];
//             const li = document.createElement('li');
//             li.textContent = fileName;
//             fileList.appendChild(li);
//         }
//     }
// }

document.addEventListener('DOMContentLoaded', function() {
    var backgroundVideo = document.getElementById('backgroundVideo');
    function playVideo() {
        backgroundVideo.play().catch(error => console.error("Video play failed:", error));
    }
    playVideo();
    document.body.addEventListener('click', playVideo);
});


document.getElementById('downloadZipBtn').addEventListener('click', function() {
    const zip = new JSZip();
    // Iterate over localStorage to find and add files to the zip
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(homeFolder + "_")) {
            const content = localStorage.getItem(key);
            const fileName = key.substring(homeFolder.length + 1);
            zip.file(fileName, content); // Add file to zip
        }
    }

    zip.generateAsync({type:"blob"}).then(function(content) {
        saveAs(content, homeFolder + ".zip");
    });
});

function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = ''; // Clear the current list

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(homeFolder + "_")) {
            const fileName = key.split('_')[1];
            const li = document.createElement('li');
            li.textContent = fileName;
            li.setAttribute("data-filename", fileName); // Store file name in an attribute for later retrieval
            li.addEventListener('click', function() {
                const fileContent = localStorage.getItem(`${homeFolder}_${this.getAttribute("data-filename")}`);
                document.getElementById('fileEditor').value = fileContent;
                document.getElementById('fileEditor').setAttribute("data-filename", this.getAttribute("data-filename")); // Set file name in editor
                document.getElementById('editor').style.display = 'block'; // Show editor
            });
            fileList.appendChild(li);
        }
    }
}

function updateProjectList() {
    const projectList = document.getElementById('projectList');
    const projects = new Set();
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const projectName = key.split('_')[0];
        projects.add(projectName);
    }

    projects.forEach(project => {
        const li = document.createElement('li');
        li.textContent = project;
        li.addEventListener('click', function() {
            setHomeFolder(project);
        });
        projectList.appendChild(li);
    });

    if (projects.size > 0) {
        document.getElementById('existingProjects').style.display = 'block';
    }
}

document.getElementById('clearProjectsBtn').addEventListener('click', function() {
    const confirmClear = confirm("Are you sure you want to clear all projects? This action cannot be undone.");
    if (confirmClear) {
        localStorage.clear();
        alert("All projects have been cleared.");
        // After clearing, you might want to refresh the list of projects and files
        updateFileList();
        updateProjectList();
        // Hide the editor and reset the UI as needed
        document.getElementById('editor').style.display = 'none';
        document.getElementById('editorControls').style.display = 'none';
        document.getElementById('fileTreeView').style.display = 'none';
        document.getElementById('existingProjects').style.display = 'none';
        document.getElementById('setHomeFolder').style.display = 'block';
    }
});

function setHomeFolder(folderName) {
    homeFolder = folderName;
    document.getElementById('editorControls').style.display = 'block';
    document.getElementById('setHomeFolder').style.display = 'none';
    document.getElementById('fileTreeView').style.display = 'block';
    document.getElementById('existingProjects').style.display = 'none';
    updateFileList();

    // Load the first file of the project into the editor
    loadFirstProjectFile();
}

function loadFirstProjectFile() {
    // Find the first file of the selected project
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(homeFolder + "_")) {
            const fileName = key.split('_')[1];
            const fileContent = localStorage.getItem(key);
            document.getElementById('fileEditor').setAttribute("data-filename", fileName); // Set file name in editor
            document.getElementById('fileEditor').value = fileContent; // Load content into editor
            document.getElementById('editor').style.display = 'block'; // Show editor
            break; // Exit after loading the first file
        }
    }
}