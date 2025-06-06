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

      // Ajustar canvas para o tamanho do vídeo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Se a moldura estiver carregada, desenhar por cima
      if (moldura.complete) {
        ctx.drawImage(moldura, 0, 0, canvas.width, canvas.height);
      }

      const imgData = canvas.toDataURL("image/png");
      const img = new Image();
      img.src = imgData;
      galeria.appendChild(img);

      qrDiv.innerHTML = "";
      new QRCode(qrDiv, {
        text: imgData,
        width: 128,
        height: 128
      });

    } else {
      beep.play();
      contador.innerText = count;
    }
  }, 1000);
};

bumerangueBtn.onclick = () => {
  alert("Gravação de bumerangue ainda em desenvolvimento.");
};
