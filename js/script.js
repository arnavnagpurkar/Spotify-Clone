let currentSong = new Audio();

async function getSongs() {
    let a = await fetch("http://127.0.0.1:5000/assets/songs/");
    let response = await a.text();
    // console.log(response)
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    // console.log(as);
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1])
        }
    }

    return songs;
};

function featureInProgress() {
    let elements = document.getElementsByClassName("inprogress");
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        element.addEventListener("click", () => {
            alert("Feature coming soon, developer is currently working on it !!");
        });
    };
};

async function playMusic(track, pause = false) {
    currentSong.src = `assets/songs/${track}`;
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
};

async function main() {
    // For features in progress
    featureInProgress();

    // Get the list of all the songs
    let songs = await getSongs();
    playMusic(songs[0], true)

    // Show all the songs in the playlist
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    for (const song of songs) {
        let songName = decodeURI(song).split("-");
        if (songName.length >= 2) {
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

    // Attach an event listner to each song
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(item => {
        item.addEventListener("click", element => {
            let track = (item.querySelector(".info").firstElementChild.innerHTML) + "-" + (item.querySelector(".info").children[1].innerHTML) + ".mp3";
            playMusic(track);
        })
    })

    // Attach an event listner to play, next and previous
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
    })

}


main();
