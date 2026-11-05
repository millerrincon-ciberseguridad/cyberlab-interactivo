(() => {
  "use strict";

  const levels = [
    { name: "Radar básico", target: 20, spawn: 1200, speed: 64, hp: 1, shoot: 0.16, bulletSpeed: 170, heavyEvery: 0, maxConcurrent: 4, types: ["phishing"], bonus: 800 },
    { name: "Perímetro activo", target: 40, spawn: 1080, speed: 72, hp: 1, shoot: 0.20, bulletSpeed: 185, heavyEvery: 10, maxConcurrent: 5, types: ["phishing", "malware"], bonus: 1200 },
    { name: "Tráfico sospechoso", target: 60, spawn: 970, speed: 80, hp: 1, shoot: 0.25, bulletSpeed: 200, heavyEvery: 9, maxConcurrent: 6, types: ["phishing", "malware", "spyware"], bonus: 1700 },
    { name: "Emboscada digital", target: 80, spawn: 870, speed: 90, hp: 2, shoot: 0.30, bulletSpeed: 215, heavyEvery: 8, maxConcurrent: 7, types: ["phishing", "malware", "spyware", "botnet"], bonus: 2300 },
    { name: "Zona botnet", target: 100, spawn: 780, speed: 100, hp: 2, shoot: 0.35, bulletSpeed: 230, heavyEvery: 7, maxConcurrent: 8, types: ["malware", "spyware", "botnet", "trojan"], bonus: 3000 },
    { name: "Bombardeo troyano", target: 120, spawn: 700, speed: 112, hp: 2, shoot: 0.40, bulletSpeed: 245, heavyEvery: 6, maxConcurrent: 9, types: ["malware", "botnet", "trojan", "worm"], bonus: 3800 },
    { name: "Cerco de gusanos", target: 140, spawn: 630, speed: 124, hp: 2, shoot: 0.46, bulletSpeed: 260, heavyEvery: 5, maxConcurrent: 10, types: ["spyware", "botnet", "trojan", "worm", "ransomware"], bonus: 4700 },
    { name: "Asalto ransomware", target: 160, spawn: 570, speed: 137, hp: 3, shoot: 0.52, bulletSpeed: 280, heavyEvery: 5, maxConcurrent: 11, types: ["botnet", "trojan", "worm", "ransomware"], bonus: 5700 },
    { name: "Tormenta polimórfica", target: 180, spawn: 510, speed: 151, hp: 3, shoot: 0.58, bulletSpeed: 300, heavyEvery: 4, maxConcurrent: 12, types: ["spyware", "botnet", "trojan", "worm", "ransomware"], bonus: 6800 },
    { name: "Cielo cero confianza", target: 200, spawn: 460, speed: 166, hp: 3, shoot: 0.66, bulletSpeed: 325, heavyEvery: 3, maxConcurrent: 13, types: ["phishing", "malware", "spyware", "botnet", "trojan", "worm", "ransomware"], bonus: 8000 }
  ];

  const threats = {
    phishing: { label: "PHISHING", short: "PH", name: "Phishing", color: "#ffb347", points: 120, scale: 0.92 },
    malware: { label: "MALWARE", short: "MW", name: "Malware", color: "#ff4778", points: 170, scale: 1.00 },
    spyware: { label: "SPYWARE", short: "SPY", name: "Spyware", color: "#d779ff", points: 220, scale: 0.96 },
    botnet: { label: "BOTNET", short: "BOT", name: "Botnet", color: "#45dcff", points: 270, scale: 1.08 },
    trojan: { label: "TROYANO", short: "TRY", name: "Troyano", color: "#ffdb70", points: 310, scale: 1.10 },
    worm: { label: "GUSANO", short: "WRM", name: "Gusano", color: "#73ff9f", points: 330, scale: 1.04 },
    ransomware: { label: "RANSOMWARE", short: "RAN", name: "Ransomware", color: "#ff315d", points: 380, scale: 1.18 }
  };

  window.CiberEscuadronConfig = Object.freeze({
    levels: Object.freeze(levels.map(level => Object.freeze({ ...level, types: Object.freeze([...level.types]) }))),
    threats: Object.freeze(Object.fromEntries(Object.entries(threats).map(([key, value]) => [key, Object.freeze({ ...value })])))
  });
})();
