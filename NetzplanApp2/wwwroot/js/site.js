//document.addEventListener("DOMContentLoaded", function (event) {
//    const doc = document.documentElement;
//    const body = document.body;
//    const formcontainer = document.getElementById('formcontainer');
//    const themetoggle = document.getElementById('theme-toggle');
//    const textarea = document.getElementById('fileContent');
//    const dropzone = document.getElementById('dropZone');
//    const getStoredTheme = () => localStorage.getItem('theme') ?? 'dark';
//    const setStoredTheme = (theme) => localStorage.setItem('theme', theme);

//    const applyTheme = (newTheme) => {
//        doc.setAttribute('data-bs-theme', newTheme);
//        body.classList.toggle('body-light', newTheme === 'light');
//        body.classList.toggle('body-dark', newTheme === 'dark');

//        if (formcontainer) {
//            formcontainer.classList.toggle('form-container-light', newTheme === 'light');
//            formcontainer.classList.toggle('form-container', newTheme === 'dark');
//        }

//        if (textarea) {
//            textarea.classList.toggle('fileContent-light', newTheme === 'light');
//            textarea.classList.toggle('fileContent', newTheme === 'dark');
//        }

//        if (dropzone) {
//            textarea.classList.toggle('dropZone-light', newTheme === 'light');
//            textarea.classList.toggle('dropZone', newTheme === 'dark');
//        }

//        themetoggle.classList.toggle('bx-sun', newTheme === 'light');
//        themetoggle.classList.toggle('bx-moon', newTheme === 'dark');
//    }

//    applyTheme(getStoredTheme());

//    if (themetoggle) {
//        themetoggle.addEventListener('click', () => {
//            let newTheme = getStoredTheme() === "dark" ? "light" : "dark";
//            applyTheme(newTheme);
//            setStoredTheme(newTheme);
//        })
//    }
//});