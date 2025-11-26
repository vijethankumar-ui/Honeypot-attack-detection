const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Draw world map background
let img = new Image();
img.src = "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.png";
img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

async function fetchAttacks() {
    let res = await fetch("http://YOUR-SERVER-IP:3000/attacks");
    let data = await res.json();

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    data.forEach(a => {
        let x = (a.lon + 180) * (canvas.width / 360);
        let y = (90 - a.lat) * (canvas.height / 180);

        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

setInterval(fetchAttacks, 2000);
