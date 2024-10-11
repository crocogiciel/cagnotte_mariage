let selectedProjectId = null;

// Function to render the project tiles
function renderProjects(projects) {
    const container = document.getElementById("projects-container");
    container.innerHTML = ""; // Clear the container before rendering



    projects.forEach((project) => {
        const projectTile = document.createElement("div");
        projectTile.classList.add("project-tile" + project.id);
        projectTile.innerHTML = `
            <div class="box">
                <div class=" elements">
                <img src=${project.image}>
                <h2 style="color:${project.color}">${project.title}</h2>
                <p style="color:${project.color}" class="desc">${project.description}</p>
                </div>
                <div class="card">
                </div>
            </div>
        `;
        projectTile.style.transform = "rotate(" + project.initialRotation + "deg)";

        // Click event to select a project
        projectTile.addEventListener("click", () => {
            selectProject(project.id);
        });

        projectTile.addEventListener("mouseover", function (event) {
            console.log("Mouse enter " + "(" + project.id + "): " + selectedProjectId + " != " + project.id + " -> " + (selectedProjectId != project.id));
            if (selectedProjectId != project.id) {
                const detail = projectTile.querySelector(".desc");
                detail.style.display = "block";
                const img = projectTile.querySelector("img");
                img.style.height = "200px";
                projectTile.style.transform = "rotate(0deg)";
                projectTile.style.zIndex = 10;
                setTimeout(() => {
                VanillaTilt.init(projectTile.querySelector(".box"), {
                    max: 10,
                    speed: 200,
                    reverse: true,
                    glare: true,
                    "max-glare": 0.1,
                    scale: 1.2
                });
                }, 50);
            }
        });

        projectTile.addEventListener("mouseleave", function (event) {
            console.log("Mouse leave " + "(" + project.id + "): " + selectedProjectId + " != " + project.id + " -> " + (selectedProjectId != project.id));
            if (selectedProjectId != project.id) {
                console.log(projectTile.querySelector(".box"));
                const detail = projectTile.querySelector(".desc");
                detail.style.display = "none";
                projectTile.style.transform = "rotate(" + project.initialRotation + "deg)";
                projectTile.style.zIndex = 0;
                const img = projectTile.querySelector("img");
                img.style.height = "300px";
            }
        });

        container.appendChild(projectTile);
    });
}

// Function to handle project selection
function selectProject(id) {
    //Select project and unselect other
    projects.forEach(project => {
        if(project.id == id && selectedProjectId != id) {
            applySelectStyle(project);
        } else {
            applyUnselectStyle(project);
        }
    });

    // Update selected project ID
    selectedProjectId = selectedProjectId != id ? id : null;
    if (selectedProjectId == null) {
        document.querySelector("#projectSelected").innerHTML = "Tu n'as pas sélectionné de projet pour le moment.";
        document.querySelector("#projectSelected").style.color = "#000";
    }
}

function applyUnselectStyle(project) {
    const projectTile = document.querySelector(".project-tile" + project.id);
    projectTile.style.transform = "rotate(" + project.initialRotation + "deg) scale(1)";
    projectTile.style.zIndex = "0";
    VanillaTilt.init(projectTile.querySelector(".box"), {
        max: 10,
        speed: 200,
        reverse: true,
        "reset-to-start": true,
        "max-glare": 0.1,
        scale: 1.2
    });
    projectTile.querySelector("h2").style.color = project.color;
    projectTile.querySelector(".desc").style.color = project.color;
    projectTile.querySelector(".card").style.background = "rgb(255,255,255)";
    projectTile.querySelector("img").style.height = "300px";
    projectTile.querySelector(".desc").style.display = "none";
}

function applySelectStyle(project) {
    const projectTile = document.querySelector(".project-tile" + project.id);
    projectTile.style.transform = "rotate(0deg) scale(1.2)";
    projectTile.querySelector(".box").vanillaTilt.destroy();
    projectTile.style.zIndex = "10";
    projectTile.querySelector("h2").style.color = "rgb(255,255,255)";
    projectTile.querySelector(".desc").style.color = "rgb(255,255,255)";
    projectTile.querySelector(".card").style.background = project.color;
    projectTile.querySelector("img").style.height = "200px";
    projectTile.querySelector(".desc").style.display = "block";

    console.log("acheter " + project.title);

    document.querySelector("#projectSelected").innerHTML = "Tu as sélectionné le projet d'achat d'" + project.title;
    document.querySelector("#projectSelected").style.color = project.color;
}

// Form submission handling
document.getElementById("donation-form").addEventListener("submit", function (e) {
    e.preventDefault();

    if (!selectedProjectId) {
        document.querySelector(".alert").style.display = "block";
        return;
    }
    
    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const message = document.querySelector("#message").value;
    const amount = document.querySelector("#participation").value;
    const payment_type = document.querySelector("#payment-type").value;


    fetch('http://127.0.0.1:4000/api/participate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name,
            email: email,
            message: message,
            participation: amount,
            projectId: selectedProjectId,
            payment_type: payment_type,
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);

            // Reset form
            document.getElementById("donation-form").reset();
            selectedProjectId = null;
            const projectTiles = document.querySelectorAll(".project-tile");
            projectTiles.forEach(tile => tile.classList.remove("selected"));
        })
        .catch(error => console.error('Error:', error));
});

// Initialize the app by rendering the projects
fetch('http://127.0.0.1:4000/api/projects')
.then(response => response.json())
.then(data => {
    renderProjects(data.projects);
})
.catch(error => {
    console.error('Error:', error);
});

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", () => {
            if (input.validity.valid) {
                input.setCustomValidity("");
                input.reportValidity();
                input.classList.remove("invalid");
            } else if (input.validity.valueMissing) {
                input.setCustomValidity("Ce champ est requis.");
                input.classList.remove("invalid");
            } else {
                if (input.type == "email") {
                    //input.setCustomValidity("L'adresse mail n'est pas au bon format.");
                }
                input.classList.add("invalid");
            }
          });
    }); 
});

// Logic for creating fake Select Boxes
document.querySelectorAll('.sel').forEach(function(sel) {
    const select = sel.querySelector('select');
    select.style.display = 'none'; // Hide the original select

    // Create a placeholder element
    const placeholder = document.createElement('span');
    placeholder.className = sel.className.replace(/sel/g, 'sel__placeholder');
    placeholder.textContent = select.options[0].text; // Set the placeholder text
    placeholder.setAttribute('data-placeholder', select.options[0].text); // Set data-placeholder
    sel.prepend(placeholder); // Prepend the placeholder

    // Create a div for the custom select box
    const box = document.createElement('div');
    box.className = sel.className.replace(/sel/g, 'sel__box');
    sel.prepend(box); // Prepend the box

    // Populate the options
    Array.from(select.options).forEach(function(option, i) {
        if (i === 0) return; // Skip the first option

        const optionSpan = document.createElement('span');
        optionSpan.className = sel.className.replace(/sel/g, 'sel__box__options');
        optionSpan.textContent = option.text;
        box.appendChild(optionSpan); // Append the option span to the box
    });
});

// Toggling the `.active` state on the `.sel`.
document.querySelectorAll('.sel').forEach(function(sel) {
    sel.addEventListener('click', function() {
        sel.classList.toggle('active'); // Toggle active class
    });
});

// Toggling the `.selected` state on the options.
document.querySelectorAll('.sel__box__options').forEach(function(option) {
    option.addEventListener('click', function() {
        const txt = this.textContent; // Get the clicked option's text
        const index = Array.from(this.parentNode.children).indexOf(this); // Get the index of the clicked option

        // Remove selected class from siblings
        this.parentNode.querySelectorAll('.sel__box__options').forEach(function(sibling) {
            sibling.classList.remove('selected');
        });
        this.classList.add('selected'); // Add selected class to the clicked option

        // Update placeholder and original select
        const currentSel = this.closest('.sel');
        currentSel.querySelector('.sel__placeholder').textContent = txt; // Update placeholder text
        currentSel.querySelector('select').selectedIndex = index + 1; // Set selected index on the original select
    });
});
