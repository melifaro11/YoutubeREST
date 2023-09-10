const form = document.querySelector(".form");
const cardWrapper = document.querySelector(".card");
const progress = document.querySelector(".progress");
const main = document.querySelector("main");

// Converts bytes to a human-readable string with appropriate units (bytes, KB, MB).
function byteToStr(bytes) {
  if (bytes < 1024) {
    return bytes + " bytes";
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + " KB";
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }
}

// Attach a submit event listener to the form
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent the default form submission behavior

  // Get the target URL from the form input field
  const targetURL = e.target.url.value;

  // Display a progress element
  progress.style.display = "block";

  // Send a POST request to the server to fetch data
  let response = await fetch("/streams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(targetURL), // Send the target URL as JSON data
  })
    .then((response) => response.json()) // Parse the response as JSON
    .then((data) => {
      if ("error" in data) { // Check if the response contains an error
        console.log("ERROR: " + data["error"]); // Log the error message
        progress.style.display = "none"; // Hide the progress element
        showError(); // Call a function to show an error message
      } else {
        // Filter the streams to keep only progressive ones
        data["streams"] = data["streams"].filter(({ progressive }) => progressive);

        // Call a function to create controls for the filtered streams
        createControls(data);
      }
    });

  e.target.url.value = ""; // Clear the input field after processing
});


function showError() {
  const errorMessage = document.createElement("p");
  errorMessage.classList.add("error");
  errorMessage.innerHTML = "Something went wrong";
  main.append(errorMessage)
}

// This function creates control elements based on the provided data and adds them to the DOM.
function createControls(data) {
  // Hide the progress element and display the card wrapper
  progress.style.display = "none";
  cardWrapper.style.display = "grid";

  // Create HTML elements for various controls
  const title = document.createElement("p");
  const dwnlBtn = document.createElement("button");
  const select = document.createElement("select");
  const thumbnail = document.createElement("img");
  const wrapper = document.createElement("div");
  const btnImg = document.createElement("img");

  // Extract the list of streams from the provided data
  const streams = data["streams"];

  // Iterate through the streams to create select options
  for (let i = 0; i < streams.length; i++) {
    const option = document.createElement("option");
    option.value = streams[i]["itag"];

    // Create text for the option by combining file size and resolution
    const optionText = [byteToStr(streams[i]["file_size"]), streams[i]["res"]];
    option.innerText = optionText.join("/");

    // Append the option to the select element
    select.append(option);
  }

  // Set the title and image sources based on the provided data
  title.innerHTML = data["title"];
  thumbnail.src = data["thumbnail"];
  btnImg.src = "/images/icon-download.png";

  // Add CSS classes to certain elements for styling
  dwnlBtn.classList.add("downloadBtn");
  title.classList.add("title");
  select.classList.add("select");

  // Add a click event listener to the download button
  dwnlBtn.addEventListener("click", () => {
    // Get the selected stream's itag value
    const itag = select.value;

    // Create an anchor element to trigger the download link
    const link = document.createElement("a");
    link.href = `/download/${itag}`;
    link.click();

    // Call rerender function (assuming it exists)
    rerender();
  });

  // Append child elements to their respective containers
  dwnlBtn.append(btnImg);
  wrapper.append(select, dwnlBtn);
  cardWrapper.append(thumbnail, title, wrapper);
}


function rerender() {
  cardWrapper.innerText = "";
  cardWrapper.style.display = "none";
}
