
const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const fotoBtn = document.getElementById("foto");
const bumerangueBtn = document.getElementById("bumerangue");
const beep = document.getElementById("beep");
const contador = document.getElementById("contador");
const galeria = document.getElementById("galeria");
const qrDiv = document.getElementById("qrDownload");
const moldura = document.getElementById("moldura");

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
    video.play();
  })
  .catch(err => {
    console.error("Erro ao acessar a câmera:", err);
  });

fotoBtn.onclick = () => {
  let count = 5;
  contador.innerText = count;
  const interval = setInterval(() => {
    count--;
    contador.innerText = count;
    beep.play();
    if (count === 0) {
      clearInterval(interval);
      contador.innerText = "";
      capturarFoto();
    }
  }, 1000);
};

function capturarFoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (moldura.complete && moldura.naturalHeight !== 0) {
    ctx.drawImage(moldura, 0, 0, canvas.width, canvas.height);
  }

  // Esperar brevemente para garantir que a imagem seja processada
  setTimeout(() => {
    const imgData = canvas.toDataURL("image/png");

    if (!imgData || imgData.length < 100 || imgData.startsWith("data:,")) {
      qrDiv.innerHTML = "Erro ao gerar QRCode.";
      qrDiv.style.color = "red";
      console.error("Imagem inválida ou não gerada.");
      return;
    }

    const img = new Image();
    img.src = imgData;
    img.style.cursor = "pointer";
    img.onclick = () => {
      const novaJanela = window.open();
      novaJanela.document.write(`<img src="${imgData}" style="width: 100%">`);
    };
    galeria.appendChild(img);

    qrDiv.innerHTML = "";
    try {
      const qrContainer = document.createElement("div");
      qrContainer.style.margin = "0 auto";
      qrDiv.appendChild(qrContainer);

      new QRCode(qrContainer, {
        text: imgData,
        width: 128,
        height: 128
      });

      const link = document.createElement("a");
      link.href = imgData;
      link.download = "foto.png";
      link.innerText = "📥 Baixar Foto";
      link.style.display = "block";
      link.style.textAlign = "center";
      link.style.marginTop = "10px";
      link.style.fontWeight = "bold";
      qrDiv.appendChild(link);
    } catch (e) {
      console.error("Erro ao gerar QRCode:", e);
      qrDiv.innerText = "Erro ao gerar QRCode.";
      qrDiv.style.color = "red";
    }
  }, 300);
}

bumerangueBtn.onclick = () => {
  alert("Gravação de bumerangue ainda em desenvolvimento.");
};
