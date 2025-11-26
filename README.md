# Cowrie SSH Honeypot with Real-Time GeoIP Attack Map

This project sets up a **Cowrie SSH/Telnet Honeypot** on Ubuntu and visualizes attacker locations on a **real-time world map** using GeoLite2 and a custom LogWatcher script.

The honeypot logs every unauthorized SSH/Telnet attempt, extracts the attacker's IP address, converts it to geographical coordinates, and displays the attacks live on a web-based map.

---

## 🚀 Features

- ✔️ Fully configured **Cowrie SSH/Telnet honeypot**
- ✔️ Real-time attack detection  
- ✔️ GeoIP lookup using **MaxMind GeoLite2 City** database
- ✔️ Python script that detects attacks and outputs them as JSON  
- ✔️ Real-time **web attack map** (HTML + JavaScript + Leaflet.js)
- ✔️ Runs automatically in the background

---

## 📁 Project Structure

```
/
├── cowrie/                     # Cowrie installation directory
│   ├── log/                    # Honeypot logs (cowrie.json)
│   ├── etc/                    # Config files
│   └── geoip/                  # GeoLite2 database
│
├── attacker_map/
│   ├── index.html              # Real-time world map
│   ├── attacks.json            # Updated by Python script
│   └── script.js               # Fetch + plot new attacks
│
└── log_watcher/
    └── watcher.py              # Detects attacks & writes attacker coords
```

---

## 🛠️ Installation & Setup

### 1️⃣ Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2️⃣ Install Dependencies
```bash
sudo apt install git python3 python3-pip python3-venv -y
```

---

## 🏴 3️⃣ Install Cowrie Honeypot

```bash
sudo adduser --disabled-password cowrie
sudo su - cowrie
git clone https://github.com/cowrie/cowrie
cd cowrie
python3 -m venv cowrie-env
source cowrie-env/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp cowrie.cfg.dist cowrie.cfg
```

Enable SSH honeypot:
```
ssh_listen_port = 2222
```

Start Cowrie:
```bash
bin/cowrie start
```

Logs will appear in:
```
~/cowrie/var/log/cowrie/cowrie.json
```

---

## 🌍 4️⃣ Install GeoLite2 City Database

1. Download GeoLite2 from Windows → `Downloads` folder  
2. Transfer to Ubuntu:
```bash
scp "C:/Users/<yourname>/Downloads/GeoLite2-City_YYYYMMDD.tar.gz" <user>@<ip>:/home/<user>/cowrie/geoip/
```

3. Extract:
```bash
cd ~/cowrie/geoip
tar -xvf GeoLite2-City_*.tar.gz
mv GeoLite2-City_*/GeoLite2-City.mmdb .
```

---

## 🐍 5️⃣ Install and Run Log Watcher Script

Create directory:
```bash
mkdir ~/log_watcher
```

Create watcher script:
```bash
nano ~/log_watcher/watcher.py
```

Paste:

```python
import json
import time
import geoip2.database

log_file = "/home/cowrie/cowrie/var/log/cowrie/cowrie.json"
output_file = "/home/cowrie/attacker_map/attacks.json"
geoip_db = "/home/cowrie/cowrie/geoip/GeoLite2-City.mmdb"

reader = geoip2.database.Reader(geoip_db)

seen = set()

while True:
    try:
        with open(log_file, "r") as f:
            for line in f:
                data = json.loads(line.strip())

                if "src_ip" in data:
                    ip = data["src_ip"]

                    if ip not in seen:
                        seen.add(ip)

                        try:
                            geo = reader.city(ip)
                            lat = geo.location.latitude
                            lon = geo.location.longitude

                            attack = {"ip": ip, "lat": lat, "lon": lon}

                            with open(output_file, "a") as out:
                                out.write(json.dumps(attack) + "\n")

                            print(f"[+] Logged attack from {ip}")

                        except:
                            pass
    except:
        pass

    time.sleep(2)
```

Run it:
```bash
python3 ~/log_watcher/watcher.py &
```

---

## 🗺️ 6️⃣ Setup Real-Time Attack Map

Create directory:
```bash
mkdir ~/attacker_map
cd ~/attacker_map
```

Create `index.html`:
```bash
nano index.html
```

Paste:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Real-Time Attack Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
</head>
<body>
    <h2>Real-Time Cowrie Honeypot Attack Map</h2>
    <div id="map" style="height: 600px;"></div>

    <script>
        var map = L.map('map').setView([20, 0], 2);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        function load() {
            fetch("attacks.json")
                .then(r => r.text())
                .then(text => {
                    let lines = text.trim().split("\n");

                    lines.forEach(l => {
                        let a = JSON.parse(l);
                        L.marker([a.lat, a.lon]).addTo(map)
                            .bindPopup(a.ip);
                    });
                });
        }

        load();
        setInterval(load, 5000);
    </script>
</body>
</html>
```

---

## ▶️ 7️⃣ Start Local Web Server

```bash
cd ~/attacker_map
python3 -m http.server 8000
```

Then open in browser:

```
http://<ubuntu-ip>:8000
```

---

## 🎉 Result

You now have:

- A fully running **SSH honeypot**
- Automatic attack detection  
- GeoIP lookup for attacker locations  
- Live world map showing real-time attacks  

---

## 📌 Notes

- Your Windows machine attempts will also appear as attacks (normal).
- Real attackers will start showing once your honeypot is exposed to the network.
- Keep port `2222` reachable from outside if you want global attacks.

---

## 👩‍💻 Author

Created by **Vijetha N K** (2025)  
Cybersecurity Honeypot + Attack Visualization Project

