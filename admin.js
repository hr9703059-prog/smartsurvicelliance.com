
import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

import {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    IMAGE_BUCKET
} from "./config.js";

// SUPABASE CONNECTION

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// HTML ELEMENTS

const loginScreen = document.getElementById("loginScreen");
const adminApp = document.getElementById("adminApp");

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const loginButton = document.getElementById("loginButton");

const contentEditor = document.getElementById("contentEditor");
const pageSelect = document.getElementById("pageSelect");

// MESSAGE FUNCTION

function showMessage(id, text, success = true) {

    const element = document.getElementById(id);

    element.textContent = text;

    element.style.color = success
        ? "#55dba4"
        : "#ff7777";
}

// ADMIN VERIFICATION

async function checkAdmin() {

    const { data: { session }, error } =
        await supabase.auth.getSession();

    if (error || !session) {
        showLogin();
        return false;
    }

    const { data, error: userError } =
        await supabase.auth.getUser();

    if (userError || !data.user) {
        await supabase.auth.signOut();
        showLogin();
        return false;
    }

    const role = data.user.app_metadata?.role;

    if (role !== "admin") {

        await supabase.auth.signOut();

        showLogin();

        showMessage(
            "loginMessage",
            "Access denied. Admin role is missing.",
            false
        );

        return false;
    }

    showDashboard();

    return true;
}


// SCREEN CONTROL

function showLogin() {

    loginScreen.classList.remove("hidden");
    adminApp.classList.add("hidden");
}

function showDashboard() {

    loginScreen.classList.add("hidden");
    adminApp.classList.remove("hidden");
}


// LOGIN

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    loginButton.disabled = true;
    loginButton.textContent = "PLEASE WAIT...";

    showMessage("loginMessage", "Checking your account...");

    const email = document
        .getElementById("adminEmail")
        .value.trim();

    const password = document
        .getElementById("adminPassword")
        .value;

    try {

        const { error } = await supabase.auth
            .signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            showMessage(
                "loginMessage",
                error.message,
                false
            );
            return;
        }

        const allowed = await checkAdmin();

        if (allowed) {

            showMessage(
                "contentMessage",
                "Welcome to Smart Surveillance Admin!"
            );

            await loadContent();
        }

    } catch (error) {

        showMessage(
            "loginMessage",
            error.message,
            false
        );

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = "LOGIN TO DASHBOARD";
    }

});


// LOGOUT

document.getElementById("logoutButton")
.addEventListener("click", async () => {

    const { error } = await supabase.auth.signOut();

    if (error) {
        showMessage("contentMessage", error.message, false);
        return;
    }

    showLogin();

    showMessage(
        "loginMessage",
        "You have logged out successfully."
    );

});


// DASHBOARD NAVIGATION

const navigationButtons =
    document.querySelectorAll(".nav-btn");

const sections =
    document.querySelectorAll(".content-section");

function openSection(sectionId) {

    sections.forEach(section => {
        section.classList.add("hidden");
    });

    const target = document.getElementById(sectionId);

    if (target) {
        target.classList.remove("hidden");
    }

    navigationButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.section === sectionId
        );

    });

    const activeButton = document.querySelector(
        `.nav-btn[data-section="${sectionId}"]`
    );

    document.getElementById("sectionTitle").textContent =
        activeButton?.textContent.trim() || "Dashboard";

}

navigationButtons.forEach(button => {

    button.addEventListener("click", () => {
        openSection(button.dataset.section);
    });

});


// QUICK PAGE BUTTONS

document.querySelectorAll(".page-card").forEach(button => {

    button.addEventListener("click", () => {

        pageSelect.value = button.dataset.page;

        openSection("contentSection");

        loadContent();

    });

});


// LOAD PAGE CONTENT

async function loadContent() {

    if (!(await checkAdmin())) return;

    const page = pageSelect.value;

    showMessage(
        "contentMessage",
        "Loading page content..."
    );

    const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("page_key", page)
        .maybeSingle();

    if (error) {

        showMessage(
            "contentMessage",
            error.message,
            false
        );

        return;
    }

    contentEditor.value = JSON.stringify(
        data?.content || {},
        null,
        2
    );

    showMessage(
        "contentMessage",
        page + " content loaded."
    );

}

document.getElementById("loadContentButton")
.addEventListener("click", loadContent);


// SAVE PAGE CONTENT

document.getElementById("saveContentButton")
.addEventListener("click", async () => {

    if (!(await checkAdmin())) return;

    let content;

    try {

        content = JSON.parse(contentEditor.value);

    } catch {

        showMessage(
            "contentMessage",
            "Invalid JSON. Please correct your content.",
            false
        );

        return;
    }

    if (
        content === null ||
        typeof content !== "object" ||
        Array.isArray(content)
    ) {

        showMessage(
            "contentMessage",
            "Please enter a valid JSON object.",
            false
        );

        return;
    }

    const page = pageSelect.value;

    const { data: { user } } =
        await supabase.auth.getUser();

    const { error } = await supabase
        .from("site_content")
        .upsert({

            page_key: page,
            content: content,
            updated_at: new Date().toISOString(),
            updated_by: user.id

        }, {
            onConflict: "page_key"
        });

    if (error) {

        showMessage(
            "contentMessage",
            error.message,
            false
        );

        return;
    }

    showMessage(
        "contentMessage",
        "Website content saved successfully!"
    );

});


// IMAGE UPLOAD

document.getElementById("uploadImageButton")
.addEventListener("click", async () => {

    if (!(await checkAdmin())) return;

    const input = document.getElementById("imageInput");

    const file = input.files[0];

    if (!file) {

        showMessage(
            "imageMessage",
            "Please select an image.",
            false
        );

        return;
    }

    const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowed.includes(file.type)) {

        showMessage(
            "imageMessage",
            "Only JPG, PNG and WEBP images allowed.",
            false
        );

        return;
    }

    if (file.size > 5 * 1024 * 1024) {

        showMessage(
            "imageMessage",
            "Image size must be below 5 MB.",
            false
        );

        return;
    }

    const extension = file.name
        .split(".")
        .pop()
        .toLowerCase();

    const fileName =
        crypto.randomUUID() + "." + extension;

    showMessage(
        "imageMessage",
        "Uploading image..."
    );

    const { error } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(fileName, file, {
            contentType: file.type,
            upsert: false
        });

    if (error) {

        showMessage(
            "imageMessage",
            error.message,
            false
        );

        return;
    }

    input.value = "";

    showMessage(
        "imageMessage",
        "Image uploaded successfully!"
    );

    await loadImages();

});


// LOAD IMAGES

async function loadImages() {

    if (!(await checkAdmin())) return;

    const grid = document.getElementById("mediaGrid");

    grid.replaceChildren();

    const { data, error } = await supabase.storage
        .from(IMAGE_BUCKET)
        .list("", {
            limit: 100,
            sortBy: {
                column: "created_at",
                order: "desc"
            }
        });

    if (error) {

        showMessage(
            "imageMessage",
            error.message,
            false
        );

        return;
    }

    data.forEach(file => {

        if (!file.name || file.name.startsWith(".")) return;

        const url = supabase.storage
            .from(IMAGE_BUCKET)
            .getPublicUrl(file.name)
            .data.publicUrl;

        const item = document.createElement("div");
        item.className = "media-item";

        const image = document.createElement("img");

        image.src = url;
        image.alt = file.name;
        image.loading = "lazy";

        const name = document.createElement("p");

        name.textContent = file.name;

        const copyButton = document.createElement("button");

        copyButton.textContent = "COPY IMAGE URL";
        copyButton.className = "secondary-button";

        copyButton.addEventListener("click", async () => {

            try {
                await navigator.clipboard.writeText(url);

                showMessage(
                    "imageMessage",
                    "Image URL copied!"
                );

            } catch {
                showMessage(
                    "imageMessage",
                    "Copy failed. Open image URL manually.",
                    false
                );
            }

        });

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "DELETE IMAGE";
        deleteButton.className = "delete-image";

        deleteButton.addEventListener("click", async () => {

            if (!confirm("Are you sure you want to delete this image?")) {
                return;
            }

            const { error } = await supabase.storage
                .from(IMAGE_BUCKET)
                .remove([file.name]);

            if (error) {

                showMessage(
                    "imageMessage",
                    error.message,
                    false
                );

                return;
            }

            showMessage(
                "imageMessage",
                "Image deleted successfully."
            );

            await loadImages();

        });

        item.append(
            image,
            name,
            copyButton,
            deleteButton
        );

        grid.appendChild(item);

    });

    showMessage(
        "imageMessage",
        data.length + " storage items loaded."
    );

}

document.getElementById("refreshImagesButton")
.addEventListener("click", loadImages);


// CONTACT SETTINGS

async function loadContact() {

    if (!(await checkAdmin())) return;

    const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("page_key", "contact")
        .maybeSingle();

    if (error) {

        showMessage(
            "contactMessage",
            error.message,
            false
        );

        return;
    }

    const content = data?.content || {};

    document.getElementById("whatsappNumber").value =
        content.whatsapp || "";

    document.getElementById("businessEmail").value =
        content.email || "";

    document.getElementById("businessAddress").value =
        content.address || "";

}


// SAVE CONTACT SETTINGS

document.getElementById("saveContactButton")
.addEventListener("click", async () => {

    if (!(await checkAdmin())) return;

    const { data: existing, error: readError } = await supabase
        .from("site_content")
        .select("content")
        .eq("page_key", "contact")
        .maybeSingle();

    if (readError) {

        showMessage(
            "contactMessage",
            readError.message,
            false
        );

        return;
    }

    const oldContent = existing?.content || {};

    const newContent = {
        ...oldContent,

        whatsapp: document
            .getElementById("whatsappNumber")
            .value.trim(),

        email: document
            .getElementById("businessEmail")
            .value.trim(),

        address: document
            .getElementById("businessAddress")
            .value.trim()
    };

    const { data: { user } } =
        await supabase.auth.getUser();

    const { error } = await supabase
        .from("site_content")
        .upsert({

            page_key: "contact",
            content: newContent,
            updated_at: new Date().toISOString(),
            updated_by: user.id

        }, {
            onConflict: "page_key"
        });

    if (error) {

        showMessage(
            "contactMessage",
            error.message,
            false
        );

        return;
    }

    showMessage(
        "contactMessage",
        "Contact details saved successfully!"
    );

});


// CONTACT TAB

document.querySelector(
    '[data-section="contactSection"]'
).addEventListener("click", loadContact);


// SESSION CHECK

const allowed = await checkAdmin();

if (allowed) {
    await loadContent();
}
