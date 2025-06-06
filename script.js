const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const fotoBtn = document.getElementById("foto");
const bumerangueBtn = document.getElementById("bumerangue");
const beep = document.getElementById("beep");
const contador = document.getElementById("contador");
const galeria = document.getElementById("galeria");
const qrDiv = document.getElementById("qrDownload");
const moldura = document.getElementById("moldura");

// Iniciar a câmera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Erro ao acessar a câmera:", err);
  });

fotoBtn.onclick = () => {
  let count = 5;
  contador.innerText = count;
  const interval = setInterval(() => {
    count--;
    if (count === 0) {
      clearInterval(interval);
      contador.innerText = "";
      beep.play();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (moldura.complete) {
        ctx.drawImage(moldura, 0, 0, canvas.width, canvas.height);
      }

      const imgData = canvas.toDataURL("image/png");

      // Mostrar imagem na galeria
      const img = new Image();
      img.src = imgData;
      img.style.cursor = "pointer";
      img.onclick = () => {
        const novaJanela = window.open();
        novaJanela.document.write(`<img src="${imgData}" style="width: 100%">`);
      };
      galeria.appendChild(img);

      // Limpar e gerar novo QR Code
      qrDiv.innerHTML = "";

      try {
        const qrContainer = document.createElement("div");
        qrContainer.style.marginBottom = "10px";
        qrDiv.appendChild(qrContainer);

        new QRCode(qrContainer, {
          text: imgData,
          width: 128,
          height: 128
        });

        const downloadLink = document.createElement("a");
        downloadLink.href = imgData;
        downloadLink.download = "foto.png";
        downloadLink.innerText = "📥 Baixar Foto";
        downloadLink.style.display = "block";
        downloadLink.style.marginTop = "10px";
        downloadLink.style.textAlign = "center";
        downloadLink.style.color = "#000";
        downloadLink.style.fontWeight = "bold";
        qrDiv.appendChild(downloadLink);
      } catch (error) {
        console.error("Erro ao gerar QRCode:", error);
        qrDiv.innerText = "Erro ao gerar QRCode.";
        qrDiv.style.color = "red";
      }

    } else {
      beep.play();
      contador.innerText = count;
    }
  }, 1000);
};

bumerangueBtn.onclick = () => {
  alert("Gravação de bumerangue ainda em desenvolvimento.");
};
