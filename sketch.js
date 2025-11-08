let data;
let volcanoes = [];
let categories = [];
let groupedVolcanoes;
let statusColors;
let hoverDiv; // <-- nuovo div HTML per info hover

function preload() {
  data = loadTable("assets/volcanoes.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");
  noStroke();

  // Definizione colori STATUS
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

  // Crea il div hover sopra al canvas
  hoverDiv = createDiv('');
  hoverDiv.style('position', 'fixed');  // fisso sulla finestra
  hoverDiv.style('bottom', '60px');    // 100px dal basso
  hoverDiv.style('left', '50%');        // centrato orizzontalmente
  hoverDiv.style('transform', 'translateX(-50%)');
  hoverDiv.style('padding', '10px');
  hoverDiv.style('background', 'rgba(255,255,255,0.95)');
  hoverDiv.style('color', 'black');
  hoverDiv.style('border-radius', '8px');
  hoverDiv.style('box-shadow', '0 4px 10px rgba(0,0,0,0.3)');
  hoverDiv.style('font-family', 'sans-serif');
  hoverDiv.style('text-align', 'center');
  hoverDiv.style('display', 'none');    // nascosto di default
  hoverDiv.style('z-index', '1000');

  // Leggi dati
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

  // Raggruppa per categoria
  groupedVolcanoes = {};
  for (let v of volcanoes) {
    if (!groupedVolcanoes[v.category]) groupedVolcanoes[v.category] = [];
    groupedVolcanoes[v.category].push(v);
  }

  // Layout dinamico
  let cols = 15;
  let marginLeft = 150;
  let marginRight = 200;
  let spacingX = (width - marginLeft - marginRight) / cols;
  let spacingY = spacingX / 1.5;
  let currentY = 100;

  for (let cat of categories) {
    let list = groupedVolcanoes[cat];
    let rowsNeeded = ceil(list.length / cols);
    groupedVolcanoes[cat].firstRowY = currentY;

    for (let j = 0; j < list.length; j++) {
      let colIndex = j % cols;
      let rowIndex = floor(j / cols);
      list[j].x = marginLeft + colIndex * spacingX;
      list[j].y = currentY + rowIndex * spacingY;
    }

    currentY += rowsNeeded * spacingY + 40;
  }

  resizeCanvas(windowWidth, max(currentY + 100, windowHeight));
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
    ellipse(legendX + boxSize/2, legendY + i * spacing + boxSize/2, boxSize, boxSize);
    fill(255);
    text(status, legendX + boxSize + 10, legendY + i * spacing + boxSize/2);
    i++;
  }
}

function draw() {
  background(20);

  // Titolo
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("Atlante Tipologico dei Vulcani del Mondo", width / 2, 40);

  // Legenda testuale in basso
  textSize(12);
  textAlign(LEFT);
  fill(200);
  text("Colore = Stato  •  Dimensione = Altezza (m)", 20, height - 50);

  // Nomi categorie
  textSize(14);
  fill(180);
  for (let cat of categories) {
    let y = groupedVolcanoes[cat].firstRowY;
    text(cat, 20, y);
  }

  let hovered = null;

  // Disegna vulcani con colori
  for (let v of volcanoes) {
    let size = map(v.elevation, 0, 6000, 6, 30);
    size = constrain(size, 5, 40);

    let c = statusColors[v.status] || color(150);
    fill(c);
    ellipse(v.x, v.y, size, size);

    if (dist(mouseX, mouseY, v.x, v.y) < size / 2) hovered = v;
  }

  drawLegend();

  // Aggiorna il div hover
  if (hovered) {
    hoverDiv.html(`${hovered.name} — ${hovered.country}<br>${hovered.category} · ${hovered.status} · Elev. ${hovered.elevation} m · Ultima eruzione: ${hovered.eruption}`);
    hoverDiv.show();
  } else {
    hoverDiv.hide();
  }
}
