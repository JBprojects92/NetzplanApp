//window.onload = function () {
//    const reader = new FileReader();

//    $("#drag_div").on("drop", function (event) {
//        event.preventDefault();

//        if (event.originalEvent.dataTransfer.items) {
//            [...event.originalEvent.dataTransfer.items].forEach((item, i) => {
//                if (item.kind === "file") {
//                    const file = item.getAsFile();

//                    if (file.name.endsWith(".csv")) {
//                        console.log(`… file[${i}].name = ${file.name}`);
//                    }
//                    else {
//                        console.log(`Not a Text File`);

//                        alert("You can only upload *.csv files");
//                    }
//                }
//            });
//        }
//        else {
//            [...event.originalEvent.dataTransfer.files].forEach((file, i) => {
//                console.log(`… file[${i}].name = ${file.name}`);

//                if (file[i].name.endsWith(".txt")) {
//                    file.text().then(data => {
//                        data = data.toLowerCase();

//                        let result = [...data.matchAll(/[a-z]/g)].reduce((acc, char) => {
//                            acc[char[0]] = (acc[char[0]] || 0) + 1;
//                            return acc;
//                        }, {});

//                        let resultSorted = Object.fromEntries(Object.entries(result).sort((a, b) => b[1] - a[1]));

//                        $("#result_div").prepend(`<h5>Character Count<br />( ${file.name} )</h5>`);

//                        for (const [char, count] of resultSorted) {
//                            console.log(`${char}: ${count}`);
//                            $("#resultlist").append(`<li>${char} : ${count}</li>`);
//                        }
//                    });
//                }
//                else {
//                    alert("You can only upload *.txt files");
//                }
//            });
//        }
//    });
//}

document.addEventListener("DOMContentLoaded", function () {
    let dropZone = document.body;
    let dragOverlay = document.getElementById("dragOverlay")
    let fileInput = document.getElementById("fileInput");
    let fileContent = document.getElementById("fileContent");

    function readFile(file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            fileContent.value = e.target.result;
        };
        reader.readAsText(file);
    }

    fileInput.addEventListener("change", function (event) {
        const files = event.target.files;
        console.log("change event triggered!")
        if (files.length > 0) {
            if (files.length < 2) {
                let fileExtension = files[0].name.split('.').pop().toLowerCase();
                if (fileExtension === "csv") {
                    readFile(fileInput.files[0]);
                }
                else {
                    alert("You can only upload .csv files!")
                }
            }
            else {
                alert("You can only upload one file at a time!");
            }
        }
    });

    document.addEventListener("dragenter", function (e) {
        e.preventDefault();
        dragOverlay.style.display = "flex";
    });

    document.addEventListener("dragleave", function (e) {
        if (e.relatedTarget === null || e.clientY === 0) {
            dragOverlay.style.display = "none";
        }
    });

    document.addEventListener("dragover", function (e) {
        e.preventDefault();
    });

    document.addEventListener("drop", function (e) {
        e.preventDefault();
        dragOverlay.style.display = "none"; // Hide overlay

        let files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            if (files.length < 2) {
                let fileExtension = files[0].name.split('.').pop().toLowerCase();
                if (fileExtension === "csv") {
                    readFile(fileInput.files[0]);
                }
                else {
                    alert("You can only upload .csv files!")
                }
            }
            else {
                alert("You can only upload one file at a time!");
            }
        }
    });
});