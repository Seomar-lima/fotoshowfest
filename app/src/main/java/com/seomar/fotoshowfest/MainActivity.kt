package com.seomar.fotoshowfest

import android.Manifest
import android.content.ContentValues
import android.content.pm.PackageManager
import android.graphics.*
import android.hardware.camera2.*
import android.os.*
import android.provider.MediaStore
import android.view.*
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.graphics.drawable.toBitmap
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import kotlinx.coroutines.*

class MainActivity : AppCompatActivity() {

    private lateinit var textureView: TextureView  // Corrigido: padrão, sem AspectRatio
    private lateinit var molduraView: ImageView
    private lateinit var contador: TextView
    private lateinit var btnFoto: Button
    private lateinit var btnBumerangue: Button
    private lateinit var previewImage: ImageView
    private lateinit var qrImageView: ImageView
    private lateinit var btnVoltarCamera: Button

    private lateinit var cameraDevice: CameraDevice
    private lateinit var cameraCaptureSession: CameraCaptureSession
    private lateinit var previewRequestBuilder: CaptureRequest.Builder

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        textureView = findViewById(R.id.textureView)
        molduraView = findViewById(R.id.molduraView)
        contador = findViewById(R.id.contador)
        btnFoto = findViewById(R.id.btnFoto)
        btnBumerangue = findViewById(R.id.btnBumerangue)

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), 1)
            return
        }

        textureView.surfaceTextureListener = object : TextureView.SurfaceTextureListener {
            override fun onSurfaceTextureAvailable(surface: SurfaceTexture, width: Int, height: Int) {
                abrirCameraFrontal()
            }

            override fun onSurfaceTextureSizeChanged(surface: SurfaceTexture, width: Int, height: Int) {}
            override fun onSurfaceTextureDestroyed(surface: SurfaceTexture): Boolean = true
            override fun onSurfaceTextureUpdated(surface: SurfaceTexture) {}
        }

        btnFoto.setOnClickListener {
            iniciarContagemRegressiva {
                capturarFotoComMoldura()
            }
        }

        btnBumerangue.setOnClickListener {
            Toast.makeText(this, "Modo bumerangue em breve", Toast.LENGTH_SHORT).show()
        }
    }

    private fun iniciarContagemRegressiva(acao: () -> Unit) {
        var segundos = 5
        contador.visibility = View.VISIBLE
        contador.text = segundos.toString()
        contador.textSize = 96f
        contador.setTextColor(Color.YELLOW)
        contador.gravity = Gravity.CENTER
        CoroutineScope(Dispatchers.Main).launch {
            while (segundos > 0) {
                delay(1000)
                segundos--
                contador.text = segundos.toString()
        contador.textSize = 96f
        contador.setTextColor(Color.YELLOW)
        contador.gravity = Gravity.CENTER
            }
            contador.visibility = View.GONE
            acao()
        }
    }

    private fun abrirCameraFrontal() {
        val manager = getSystemService(CAMERA_SERVICE) as CameraManager
        val cameraId = manager.cameraIdList.firstOrNull {
            manager.getCameraCharacteristics(it).get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_FRONT
        } ?: return

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) return

        manager.openCamera(cameraId, object : CameraDevice.StateCallback() {
            override fun onOpened(camera: CameraDevice) {
                cameraDevice = camera
                iniciarPreview()
            }

            override fun onDisconnected(camera: CameraDevice) = camera.close()
            override fun onError(camera: CameraDevice, error: Int) = camera.close()
        }, null)
    }

    private fun iniciarPreview() {
        val surfaceTexture = textureView.surfaceTexture ?: return
        surfaceTexture.setDefaultBufferSize(textureView.width, textureView.height)
        val surface = Surface(surfaceTexture)

        previewRequestBuilder = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW)
        previewRequestBuilder.addTarget(surface)

        cameraDevice.createCaptureSession(listOf(surface), object : CameraCaptureSession.StateCallback() {
            override fun onConfigured(session: CameraCaptureSession) {
                cameraCaptureSession = session
                previewRequestBuilder.set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO)
                session.setRepeatingRequest(previewRequestBuilder.build(), null, null)
            }

            override fun onConfigureFailed(session: CameraCaptureSession) {}
        }, null)
    }

    private fun capturarFotoComMoldura() {
        val cameraBitmap = textureView.bitmap
        val molduraBitmap = molduraView.drawable?.toBitmap(cameraBitmap!!.width, cameraBitmap.height)

        if (cameraBitmap != null && molduraBitmap != null) {
            val resultado = Bitmap.createBitmap(cameraBitmap.width, cameraBitmap.height, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(resultado)
            canvas.drawBitmap(cameraBitmap, 0f, 0f, null)
            canvas.drawBitmap(molduraBitmap, 0f, 0f, null)
            salvarImagemNaGaleria(resultado)
        }
    }

    private fun salvarImagemNaGaleria(bitmap: Bitmap) {
        val resolver = contentResolver
        val contentValues = ContentValues().apply {
            put(MediaStore.Images.Media.DISPLAY_NAME, "foto_${System.currentTimeMillis()}.jpg")
            put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
        }

        val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
        uri?.let {
            val stream = resolver.openOutputStream(it)
            stream?.use { bitmap.compress(Bitmap.CompressFormat.JPEG, 100, it) }
        }
        mostrarPreview(bitmap)
    }

    private fun mostrarPreview(bitmap: Bitmap) {
        setContentView(R.layout.preview_layout)
        previewImage = findViewById(R.id.previewImage)
        qrImageView = findViewById(R.id.qrImageView)
        btnVoltarCamera = findViewById(R.id.btnVoltarCamera)

        previewImage.setImageBitmap(bitmap)
        gerarQRCode("https://gofile.io/fake-link.jpg")

        btnVoltarCamera.setOnClickListener {
            finish(); startActivity(intent)
        }
    }

    private fun gerarQRCode(link: String) {
        val writer = QRCodeWriter()
        val matrix = writer.encode(link, BarcodeFormat.QR_CODE, 600, 600)
        val bmp = Bitmap.createBitmap(600, 600, Bitmap.Config.RGB_565)
        for (x in 0 until 600) {
            for (y in 0 until 600) {
                bmp.setPixel(x, y, if (matrix[x, y]) Color.BLACK else Color.WHITE)
            }
        }
        qrImageView.setImageBitmap(bmp)
    }
}