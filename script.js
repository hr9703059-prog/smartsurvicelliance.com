
"use strict";

/* =========================================
   SMART SURVEILLANCE
   MAIN JAVASCRIPT
========================================= */


/* =========================================
   1. CURRENT YEAR
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

});


/* =========================================
   2. MOBILE NAVIGATION
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  const menuToggle = document.getElementById("menuToggle");
  const navigation = document.querySelector(".navigation");

  if (menuToggle && navigation) {

    menuToggle.addEventListener("click", function () {

      navigation.classList.toggle("show");

      const isOpen = navigation.classList.contains("show");

      menuToggle.textContent = isOpen ? "✕" : "☰";

      menuToggle.setAttribute("aria-expanded", String(isOpen));

    });


    // Close menu after clicking a link

    navigation.querySelectorAll("a").forEach(function (link) {

      link.addEventListener("click", function () {

        navigation.classList.remove("show");

        menuToggle.textContent = "☰";

        menuToggle.setAttribute("aria-expanded", "false");

      });

    });


    // Close menu with Escape

    document.addEventListener("keydown", function (event) {

      if (event.key === "Escape") {

        navigation.classList.remove("show");

        menuToggle.textContent = "☰";

        menuToggle.setAttribute("aria-expanded", "false");

      }

    });

  }

});


/* =========================================
   3. WHATSAPP CONFIGURATION
========================================= */

// Business WhatsApp number
// International format without + or spaces.

const BUSINESS_WHATSAPP = "923477112091";


/* =========================================
   4. WHATSAPP MESSAGE FUNCTION
========================================= */

function sendWhatsAppMessage(message) {

  if (!message || !message.trim()) {

    alert("Please enter your message.");

    return;

  }

  const whatsappURL =
    "https://wa.me/" +
    BUSINESS_WHATSAPP +
    "?text=" +
    encodeURIComponent(message);

  window.open(whatsappURL, "_blank", "noopener,noreferrer");

}


/* =========================================
   5. CONTACT FORM
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  const contactForm = document.getElementById("contactForm");

  if (!contactForm) return;

  contactForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const nameElement = document.getElementById("name");

    const phoneElement = document.getElementById("phone");

    const serviceElement = document.getElementById("service");

    const messageElement = document.getElementById("message");


    if (
      !nameElement ||
      !phoneElement ||
      !serviceElement ||
      !messageElement
    ) {

      alert("Contact form fields are missing.");

      return;

    }


    const name = nameElement.value.trim();

    const phone = phoneElement.value.trim();

    const service = serviceElement.value;

    const message = messageElement.value.trim();


    if (!name || !phone || !service || !message) {

      alert("Please complete all fields.");

      return;

    }


    if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {

      alert("Please enter a valid phone number.");

      return;

    }


    const whatsappMessage =

      "Assalam o Alaikum Smart Surveillance!\n\n" +

      "NEW CUSTOMER ENQUIRY\n\n" +

      "Customer Name: " + name + "\n" +

      "Phone Number: " + phone + "\n" +

      "Required Service: " + service + "\n" +

      "Details: " + message + "\n\n" +

      "Website: Smart Surveillance\n" +

      "Location: Lahore, Pakistan";


    sendWhatsAppMessage(whatsappMessage);

  });

});


/* =========================================
   6. PRODUCT ORDER BUTTONS
========================================= */

document.addEventListener("click", function (event) {

  const orderButton = event.target.closest("[data-order]");

  if (!orderButton) return;

  const productName = orderButton.dataset.order;

  if (!productName) return;


  const message =

    "Assalam o Alaikum Smart Surveillance!\n\n" +

    "I want to order / enquire about:\n" +

    productName + "\n\n" +

    "Please share product details and price.\n\n" +

    "Thank you!";


  sendWhatsAppMessage(message);

});


/* =========================================
   7. SERVICE ENQUIRY BUTTONS
========================================= */

document.addEventListener("click", function (event) {

  const serviceButton = event.target.closest("[data-service]");

  if (!serviceButton) return;

  const serviceName = serviceButton.dataset.service;

  if (!serviceName) return;


  const message =

    "Assalam o Alaikum Smart Surveillance!\n\n" +

    "I need information about:\n" +

    serviceName + "\n\n" +

    "Please contact me with details.";


  sendWhatsAppMessage(message);

});


/* =========================================
   8. ACTIVE NAVIGATION
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  const currentPage =

    window.location.pathname.split("/").pop() || "index.html";


  document.querySelectorAll(".navigation a").forEach(function (link) {

    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {

      link.classList.add("active");

    } else {

      link.classList.remove("active");

    }

  });

});


/* =========================================
   9. SMOOTH SCROLL
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {

    link.addEventListener("click", function (event) {

      const targetID = link.getAttribute("href");

      if (!targetID || targetID === "#") return;

      const target = document.querySelector(targetID);

      if (target) {

        event.preventDefault();

        target.scrollIntoView({

          behavior: "smooth",

          block: "start"

        });

      }

    });

  });

});


/* =========================================
   10. IMAGE ERROR HANDLING
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll("img").forEach(function (image) {

    image.addEventListener("error", function () {

      image.style.background = "#14263b";

      image.style.minHeight = "150px";

      image.alt = "Image currently unavailable";

    });

  });

});


/* =========================================
   11. BACK TO TOP SUPPORT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  const backToTop = document.getElementById("backToTop");

  if (!backToTop) return;

  backToTop.addEventListener("click", function () {

    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  });

});


/* =========================================
   12. CONSOLE BRANDING
========================================= */

console.log(
  "%cSMART SURVEILLANCE",
  "color:#16d6a0;font-size:22px;font-weight:900;"
);

console.log(
  "%cProfessional Security & Electronics Solutions",
  "color:#8191a5;font-size:12px;"
);
