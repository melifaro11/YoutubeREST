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

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const targetURL = e.target.url.value;

  progress.style.display = "block";

  let response = await fetch("/streams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(targetURL),
  })
    .then((response) => response.json())
    .then((data) => {
      if ("error" in data) {
        console.log("ERROR: " + data["error"]);
        progress.style.display = "none";
        showError();
      } else {
        data["streams"] = data["streams"].filter(({ progressive }) => progressive);
        createControls(data);
      }
    });

  e.target.url.value = "";
});

function showError() {
  const errorMessage = document.createElement("p");
  errorMessage.classList.add("error");
  errorMessage.innerHTML = "Something went wrong";
  main.append(errorMessage)
}

function createControls(data) {
  progress.style.display = "none";
  cardWrapper.style.display = "grid";

  const title = document.createElement("p");
  const dwnlBtn = document.createElement("button");
  const select = document.createElement("select");
  const thumbnail = document.createElement("img");
  const wrapper = document.createElement("div");
  const btnImg = document.createElement("img");

  const streams = data["streams"];

  for (let i = 0; i < streams.length; i++) {
    const option = document.createElement("option");
    option.value = streams[i]["itag"];

    const optionText = [byteToStr(streams[i]["file_size"]), streams[i]["res"]];
    option.innerText = optionText.join("/");

    select.append(option);
  }

  title.innerHTML = data["title"];
  thumbnail.src = data["thumbnail"];
  btnImg.src = "/images/icon-download.png";

  dwnlBtn.classList.add("downloadBtn");
  title.classList.add("title");
  select.classList.add("select");

  dwnlBtn.addEventListener("click", () => {
    const itag = select.value;
    const link = document.createElement("a");
    link.href = `/download/${itag}`;
    link.click();
    rerender();
  });

  dwnlBtn.append(btnImg);
  wrapper.append(select, dwnlBtn);
  cardWrapper.append(thumbnail, title, wrapper);
}

function rerender() {
  cardWrapper.innerText = "";
  cardWrapper.style.display = "none";
}
