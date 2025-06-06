const video = document.getElementById('camera');
const moldura = document.getElementById('moldura');
const countdown = document.getElementById('countdown');
const beep = document.getElementById('beep');
const galeria = document.getElementById('fotos');

navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

document.getElementById('foto').addEventListener('click', () => {
  countdown.innerText = '';
  let count = 5;
  const interval = setInterval(() => {
    beep.play();
    countdown.innerText = count;
    if (--count < 0) {
      clearInterval(interval);
      countdown.innerText = '';
      tirarFoto();
    }
  }, 1000);
});

function tirarFoto() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  ctx.drawImage(moldura, 0, 0, canvas.width, canvas.height);
  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');
  galeria.appendChild(img);

  const qrDiv = document.createElement('div');
  new QRCode(qrDiv, {
    text: img.src,
    width: 100,
    height: 100
  });
  galeria.appendChild(qrDiv);
}

document.getElementById('bumerangue').addEventListener('click', () => {
  alert('Gravação de bumerangue ainda em desenvolvimento.');
});
