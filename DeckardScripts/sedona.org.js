// ==UserScript==
// @name         Extract Property Address in Sedona
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Extracts the property address from the JSON-LD and displays it on the page
// @author       Your Name
// @match        https://sedona.org/rentals/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("✅ Tampermonkey Script Loaded, waiting for the address to appear...");

    // Function to create the floating window
    function showFloatingWindow(message) {
        let window = document.createElement("div");
        window.style.position = "fixed";
        window.style.bottom = "350px";
        window.style.right = "10px";
        window.style.background = "rgba(0, 0, 0, 0.8)";
        window.style.color = "white";
        window.style.padding = "15px";
        window.style.borderRadius = "10px";
        window.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
        window.style.fontSize = "16px";
        window.style.zIndex = "9999";
        window.style.maxWidth = "300px";
        window.innerHTML = message;

        document.body.appendChild(window);

        // Function to copy to the clipboard
        window.addEventListener("click", () => {
            // Create a temporary text element to copy
            let tempTextArea = document.createElement("textarea");
            tempTextArea.value = message.replace(/<br>/g, "\n").replace(/<[^>]+>/g, ""); // Remove HTML and convert <br> to line breaks
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand("copy");
            document.body.removeChild(tempTextArea);

            // Notify the user
            alert("📋 Address copied to clipboard!");
        });
    }

    // Function to search for the JSON-LD block and extract the address
    function findAddress() {
        // Find all <script> elements with type 'application/ld+json'
        let scripts = document.querySelectorAll('script[type="application/ld+json"]');

        // Loop through all <script> elements to find the one containing the address
        for (let script of scripts) {
            try {
                let jsonData = JSON.parse(script.textContent);

                if (jsonData.address && jsonData.address.streetAddress) {
                    let address = jsonData.address.streetAddress; // Extracted address
                    console.log("📍 Property address found:", address);

                    // Show the floating window with the address
                    let message = `
                        📍 <b>Property Address:</b><br>
                        ${address}
                    `;
                    showFloatingWindow(message);

                    return true; // Found, stop searching
                }
            } catch (error) {
                console.error("❌ Error processing JSON-LD:", error);
            }
        }

        console.log("⏳ Address not found in JSON-LD blocks.");
        return false; // Not found yet
    }

    // Try every second up to 30 attempts (max 30 seconds)
    let attempts = 0;
    let interval = setInterval(() => {
        if (findAddress() || attempts > 30) {
            clearInterval(interval); // Stop searching if found or time runs out
            if (attempts > 30) console.warn("⏳ Timeout reached while searching for address.");
        }
        attempts++;
    }, 1000); // Try every 1 second

})();
