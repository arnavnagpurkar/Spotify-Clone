let currentSong = new Audio();
let songs;
let currentFolder;

async function getSongs(folder) {
    currentFolder = folder;
    let response = await fetch(`/assets/songs/${folder}/`);
    let text = await response.text();
    let div = document.createElement('div');
    div.innerHTML = text;
    let as = div.getElementsByTagName('a');
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/songs/${folder}/`)[1]);
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let songName = decodeURI(song).split("-");
        songUL.innerHTML += `<li>
            <img class="invert" src="assets/images/music.svg" alt="music">
            <div class="info">
                <div>${songName[0].replace(".mp3", "")}</div>
                <div>${songName[1].replace(".mp3", "")}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="assets/images/play.svg" alt="play">
            </div>
        </li>`;
    }
}

function featureInProgress() {
    let elements = document.getElementsByClassName("inprogress");
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        element.addEventListener("click", () => {
            alert("Feature coming soon, developer is currently working on it !!");
        });
    }
}

async function playMusic(track, pause = false) {
    currentSong.src = `assets/songs/${currentFolder}/${track}`;
    await currentSong.load();

    // Update song information even if paused
    document.querySelector(".songinfo").innerHTML = decodeURI(track).replace(".mp3", "");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    // Only play if not paused
    if (!pause) {
        currentSong.play();
        play.src = "assets/images/pause.svg";
    }
    else {
        // Ensure the play button icon is set to play if paused
        play.src = "assets/images/play.svg";
    }
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

function setupSongClickListeners() {
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let songInfo = e.querySelector(".info");
            let track = `${songInfo.firstElementChild.innerHTML}-${songInfo.children[1].innerHTML}.mp3`;
            playMusic(track);
        });
    });
}

async function displayAlbums() {
    let response = await fetch(`/assets/songs/`);
    let text = await response.text();
    let div = document.createElement('div');
    div.innerHTML = text;
    let anchors = div.getElementsByTagName("a");

    for (let index = 0; index < anchors.length; index++) {
        const e = anchors[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[0];
            // Get the metadata of the folder
            let a = await fetch(`/assets/songs/${folder}/info.json/`);
            let response = await a.json();
            let cardContainer = document.querySelector(".card-container");
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#000" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="assets/songs/${folder}/cover.jpg" alt="playlist img">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`;
        }
    }

    // Dynamic playlists
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(item.currentTarget.dataset.folder);
            playMusic(songs[0]);

            // Set up click event listeners for songs after loading a new playlist
            setupSongClickListeners();
        });
    });

    

    // Last card's margin for responsiveness
    let cards = document.querySelectorAll(".card");
    cards[cards.length - 1].id = "lastcard";
}

async function main() {
    // For features in progress
    featureInProgress();

    // Get the list of all the songs
    await getSongs("trending");
    playMusic(songs[0], true);

    // Display all the albums on the page
    await displayAlbums();

    // Attach an event listener to each song
    setupSongClickListeners();

    // Attach an event listener to play, next, and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "assets/images/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "assets/images/play.svg";
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = ((e.offsetX / e.target.getBoundingClientRect().width) * 100);
        document.querySelector(".circle").style.left = `${percent}%`;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add an event listener for closing hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-140%";
    });

    // Add an event listener to the previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index === 0) {
            alert("Can't play previous, this is the first song in the playlist !!");
            throw new Error("Can't play previous");
        }
        playMusic(songs[index - 1]);
    });

    // Add an event listener to the next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index === songs.length - 1) {
            alert("Can't play next, this is the last song in the playlist !!");
            throw new Error("Can't play next");
        }
        playMusic(songs[index + 1]);
    });

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
        currentSong.volume = e.target.value / 100;
        if (currentSong.volume === 0) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "assets/images/volume-mute.svg";
        } else if (currentSong.volume > 0 && currentSong.volume <= 0.5) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "assets/images/volume-low.svg";
        } else if (currentSong.volume > 0.5) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "assets/images/volume-high.svg";
        }
    });

    // Add an event listener to directly mute and unmute
    document.querySelector(".volume img").addEventListener("click", () => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "assets/images/volume-mute.svg";
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            currentSong.volume = 1;
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "assets/images/volume-high.svg";
            document.querySelector(".range").getElementsByTagName("input")[0].value = 100;
        }
    });
}

main();
