console.log("script.js initializing")

async function getSongs() {
    let a = await fetch("http://127.0.0.1:5000/songs/");
    let response = await a.text();
    console.log(response)
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    console.log(as);
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1])
        }
    }

    return songs;
}

async function main() {
    // Get the list of all the songs
    let songs = await getSongs();
    console.log(songs);

    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    for (const song of songs) {
        songUL.innerHTML += `<li>
        <img class="invert" src="music.svg" alt="music">
        <div class="info">
            <div>${song.replaceAll("%20", " ").split("-")[0].replace(".mp3", "")}</div>
            <div>${song.replaceAll("%20", " ").split("-")[1].replace(".mp3", "")}</div>
        </div>
        <div class="playnow flex justify-center item-center">
            <span>Play Now</span>
            <img class="invert" src="play.svg" alt="play">
        </div>
    </li>`;
    }

    // Play the first song
    var audio = new Audio(songs[0]);
    // audio.play();

    audio.addEventListener("loadeddata", () => {
        let duration = audio.duration; // duration in seconds
        console.log(duration, audio.currentSrc, audio.currentTime);
    });
}

main()
