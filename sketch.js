let data;
let volcanoes = [];
let categories = [];

let statusColors;

function preload() {
  data = loadTable("assets/volcanoes.csv", "csv", "header");
  console.log("CSV caricato:", data);
}

function setup() {
  // --- calcolo altezza dinamica del canvas ---
  let cols = 15;
  let rowHeight = 50; // distanza verticale tra righe di vulcani
  let spacingY = 60;  // distanza tra categorie
  let totalRows = 0;

  // conta righe necessarie per ciascuna categoria
  let tempGrouped = {};
  for (let i = 0; i < data.getRowCount(); i++) {
    let cat = data.getString(i, "TypeCategory");
    if (!tempGrouped[cat]) tempGrouped[cat] = 0;
    tempGrouped[cat]++;
  }

  for (let cat in tempGrouped) {
    let rowsInCategory = Math.ceil(tempGrouped[cat] / cols);
    totalRows += rowsInCategory;
  }

  let canvasHeight = 150 + totalRows * rowHeight + Object.keys(tempGrouped).length * spacingY;

  createCanvas(windowWidth, canvasHeight);
  textFont("sans-serif");
  noStroke();

  // --- definizione colori dopo createCanvas ---
  statusColors = {
    "Holocene": color(255, 140, 0),
    "Holocene?": color(255, 180, 50),
    "Historical": color(255, 80, 0),
    "Fumarolic": color(200, 0, 255),
    "Radiocarbon": color(0, 200, 255),
    "Anthropology": color(150, 50, 150),
    "Ar/Ar": color(0, 100, 200),
    "Tephrochronology": color(0, 255, 150),
    "Hydrophonic": color(0, 150, 150),
    "Ice Core": color(100, 200, 255),
    "K-Ar": color(50, 50, 200),
    "Dendrochronology": color(150, 100, 50),
    "Magnetism": color(100, 100, 255),
    "Hot Springs": color(255, 200, 0),
    "Lichenometry": color(180, 180, 180),
    "Uncertain": color(120, 120, 120),
    "Uranium-series": color(50, 150, 50),
    "Seismicity": color(255, 0, 255),
    "Pleistocene": color(0, 255, 0),
    "Pleistocene-Fumarol": color(150, 0, 150),
    "Hydration Rind": color(200, 200, 0),
    "Varve Count": color(255, 100, 100)
  };

  // --- leggi dati dal CSV ---
  for (let i = 0; i < data.getRowCount(); i++) {
    let name = data.getString(i, "Volcano Name");
    let country = data.getString(i, "Country");
    let elevation = Number(data.getString(i, "Elevation (m)")) || 0;
    let category = data.getString(i, "TypeCategory");
    let status = data.getString(i, "Status");
    let eruption = data.getString(i, "Last Known Eruption");

    if (!categories.includes(category)) categories.push(category);

    volcanoes.push({ name, country, elevation, category, status, eruption });
  }

  // --- posizioni con margini uguali a sinistra e a destra ---
  let margin = 150;
  let topMargin = 100;
  let spacingX = (width - 2 * margin) / (cols + 1);
  let rowSpacing = spacingX / 2; // margine verticale pari alla metà del margine orizzontale

  // raggruppa per categoria
  let grouped = {};
  for (let v of volcanoes) {
    if (!grouped[v.category]) grouped[v.category] = [];
    grouped[v.category].push(v);
  }

  // assegna posizioni
  for (let r = 0; r < categories.length; r++) {
    let cat = categories[r];
    let list = grouped[cat];
    for (let j = 0; j < list.length; j++) {
      let rowInCategory = Math.floor(j / cols);
      list[j].x = margin + (j % cols) * spacingX;
      list[j].y = topMargin + r * spacingY + rowInCategory * rowSpacing;
    }
  }
}

function drawLegend() {
  let legendX = width - 200;
  let legendY = 100;
  let boxSize = 15;
  let spacing = 25;

  textSize(12);
  textAlign(LEFT, CENTER);
  fill(255);
  text("Legenda Stato Vulcano", legendX, legendY - spacing);

  let i = 0;
  for (let status in statusColors) {
    fill(statusColors[status]);
    ellipse(legendX + boxSize / 2, legendY + i * spacing + boxSize / 2, boxSize, boxSize);
    fill(255);
    text(status, legendX + boxSize + 10, legendY + i * spacing + boxSize / 2);
    i++;
  }
}

function draw() {
  background(20);

  // titolo centrato correttamente
  textAlign(CENTER, BASELINE);
  fill(255);
  textSize(24);
  text("Atlante Tipologico dei Vulcani del Mondo", width / 2, 40);

  // legenda testuale in basso
  textSize(12);
  textAlign(LEFT);
  fill(200);
  text("Colore = Stato  •  Dimensione = Altezza (m)", 20, height - 50);
  textAlign(CENTER);

  // categorie a sinistra
  textSize(14);
  textAlign(LEFT);
  fill(180);
  for (let i = 0; i < categories.length; i++) {
    let y = 100 + i * 60; // allineato con spacingY
    text(categories[i], 20, y);
  }
  textAlign(CENTER);

  let hovered = null;

  // disegna vulcani
  for (let v of volcanoes) {
    let size = map(v.elevation, 0, 6000, 4, 25);
    size = constrain(size, 4, 25);

    let c = statusColors[v.status] || color(150);
    fill(c);
    ellipse(v.x, v.y, size, size);

    if (dist(mouseX, mouseY, v.x, v.y) < size / 2) hovered = v;
  }

  // disegna legenda
  drawLegend();

  // info su hover
  if (hovered) {
    fill(255, 245);
    rectMode(CENTER);
    rect(width / 2, height - 80, 520, 70, 8);
    fill(0);
    textSize(13);
    textAlign(CENTER, CENTER);
    text(
      `${hovered.name} — ${hovered.country}\n${hovered.category} · ${hovered.status} · Elev. ${hovered.elevation} m · Ultima eruzione: ${hovered.eruption}`,
      width / 2,
      height - 80
    );
  }
}
