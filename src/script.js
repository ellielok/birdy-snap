'use strict';

const navToggleBtn = document.querySelector("[data-nav-toggle-btn]");
const header = document.querySelector("[data-header]");

const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", function () {
    window.scrollY >= 500 ? goTopBtn.classList.add("active")
       : goTopBtn.classList.remove("active");
 });