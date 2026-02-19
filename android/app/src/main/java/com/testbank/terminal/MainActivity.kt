package com.testbank.terminal

import android.app.PendingIntent
import android.content.Intent
import android.content.IntentFilter
import android.nfc.NdefMessage
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.testbank.terminal.api.ApiService
import com.testbank.terminal.utils.SecureStorage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.nio.charset.Charset

/**
 * Главная активность - экран терминала
 */
class MainActivity : AppCompatActivity() {
    
    private lateinit var nfcAdapter: NfcAdapter
    private lateinit var secureStorage: SecureStorage
    private var apiService: ApiService? = null
    
    // UI элементы
    private lateinit var amountInput: EditText
    private lateinit var payButton: Button
    private lateinit var statusText: TextView
    private lateinit var terminalIdText: TextView
    private lateinit var settingsButton: Button
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Инициализация компонентов
        initViews()
        initNFC()
        initStorage()
        
        // Проверка конфигурации
        if (!secureStorage.isConfigured()) {
            showSettingsDialog()
        } else {
            initApiService()
        }
    }
    
    /**
     * Инициализация UI элементов
     */
    private fun initViews() {
        amountInput = findViewById(R.id.amountInput)
        payButton = findViewById(R.id.payButton)
        statusText = findViewById(R.id.statusText)
        terminalIdText = findViewById(R.id.terminalIdText)
        settingsButton = findViewById(R.id.settingsButton)
        
        // Отображение Terminal ID
        terminalIdText.text = "Terminal ID: ${SecureStorage(this).getTerminalId()}"
        
        // Обработчик кнопки оплаты
        payButton.setOnClickListener {
            val amount = amountInput.text.toString().toIntOrNull()
            if (amount == null || amount <= 0) {
                Toast.makeText(this, "Введите корректную сумму", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            statusText.text = "💳 Приложите NFC карту..."
            statusText.visibility = View.VISIBLE
        }
        
        // Обработчик кнопки настроек
        settingsButton.setOnClickListener {
            showSettingsDialog()
        }
    }
    
    /**
     * Инициализация NFC
     */
    private fun initNFC() {
        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        
        if (nfcAdapter == null) {
            Toast.makeText(this, "NFC не поддерживается на этом устройстве", Toast.LENGTH_LONG).show()
            finish()
            return
        }
        
        if (!nfcAdapter.isEnabled) {
            Toast.makeText(this, "Включите NFC в настройках", Toast.LENGTH_LONG).show()
        }
    }
    
    /**
     * Инициализация безопасного хранилища
     */
    private fun initStorage() {
        secureStorage = SecureStorage(this)
        terminalIdText.text = "Terminal ID: ${secureStorage.getTerminalId()}"
    }
    
    /**
     * Инициализация API сервиса
     */
    private fun initApiService() {
        val apiKey = secureStorage.getApiKey()
        val serverUrl = secureStorage.getServerUrl()
        val terminalId = secureStorage.getTerminalId()
        
        if (apiKey != null) {
            apiService = ApiService(serverUrl, apiKey, terminalId)
            
            // Проверка соединения
            lifecycleScope.launch {
                val result = withContext(Dispatchers.IO) {
                    apiService?.checkConnection()
                }
                
                result?.onSuccess {
                    Toast.makeText(this@MainActivity, "✅ Подключено к серверу", Toast.LENGTH_SHORT).show()
                }?.onFailure { error ->
                    Toast.makeText(this@MainActivity, "⚠️ ${error.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
    
    /**
     * Диалог настроек
     */
    private fun showSettingsDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_settings, null)
        val apiKeyInput = dialogView.findViewById<EditText>(R.id.apiKeyInput)
        val serverUrlInput = dialogView.findViewById<EditText>(R.id.serverUrlInput)
        
        // Заполнение текущими значениями
        apiKeyInput.setText(secureStorage.getApiKey() ?: "")
        serverUrlInput.setText(secureStorage.getServerUrl())
        
        AlertDialog.Builder(this)
            .setTitle("Настройки")
            .setView(dialogView)
            .setPositiveButton("Сохранить") { _, _ ->
                val apiKey = apiKeyInput.text.toString()
                val serverUrl = serverUrlInput.text.toString()
                
                if (apiKey.isNotBlank()) {
                    secureStorage.setApiKey(apiKey)
                }
                if (serverUrl.isNotBlank()) {
                    secureStorage.setServerUrl(serverUrl)
                }
                
                initApiService()
                Toast.makeText(this, "Настройки сохранены", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("Отмена", null)
            .setCancelable(false)
            .show()
    }
    
    override fun onResume() {
        super.onResume()
        enableNFCForegroundDispatch()
    }
    
    override fun onPause() {
        super.onPause()
        disableNFCForegroundDispatch()
    }
    
    /**
     * Включить foreground dispatch для NFC
     */
    private fun enableNFCForegroundDispatch() {
        val intent = Intent(this, javaClass).apply {
            addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_MUTABLE
        )
        
        val filters = arrayOf(
            IntentFilter(NfcAdapter.ACTION_NDEF_DISCOVERED),
            IntentFilter(NfcAdapter.ACTION_TAG_DISCOVERED)
        )
        
        nfcAdapter.enableForegroundDispatch(this, pendingIntent, filters, null)
    }
    
    /**
     * Отключить foreground dispatch для NFC
     */
    private fun disableNFCForegroundDispatch() {
        nfcAdapter.disableForegroundDispatch(this)
    }
    
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        
        if (NfcAdapter.ACTION_NDEF_DISCOVERED == intent.action ||
            NfcAdapter.ACTION_TAG_DISCOVERED == intent.action) {
            
            val tag: Tag? = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
            tag?.let { readNFCTag(it) }
        }
    }
    
    /**
     * Чтение NFC метки
     */
    private fun readNFCTag(tag: Tag) {
        val ndef = Ndef.get(tag)
        
        try {
            ndef?.connect()
            val ndefMessage: NdefMessage? = ndef?.ndefMessage
            
            if (ndefMessage != null && ndefMessage.records.isNotEmpty()) {
                val record = ndefMessage.records[0]
                val payload = record.payload
                
                // Пропускаем первый байт (язык для текстовых записей)
                val token = String(payload.copyOfRange(3, payload.size), Charset.forName("UTF-8"))
                
                // Проверка формата токена (32 hex символа)
                if (token.matches(Regex("^[a-f0-9]{32}$"))) {
                    processPaymentWithToken(token)
                } else {
                    statusText.text = "❌ Неверный формат токена"
                    Toast.makeText(this, "Неверный формат токена", Toast.LENGTH_SHORT).show()
                }
            } else {
                statusText.text = "❌ NFC метка пуста"
                Toast.makeText(this, "NFC метка пуста", Toast.LENGTH_SHORT).show()
            }
            
            ndef?.close()
        } catch (e: Exception) {
            statusText.text = "❌ Ошибка чтения NFC"
            Toast.makeText(this, "Ошибка чтения NFC: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }
    
    /**
     * Обработка платежа с токеном
     */
    private fun processPaymentWithToken(token: String) {
        val amountText = amountInput.text.toString()
        val amount = amountText.toIntOrNull()
        
        if (amount == null || amount <= 0) {
            Toast.makeText(this, "Введите корректную сумму", Toast.LENGTH_SHORT).show()
            return
        }
        
        if (apiService == null) {
            Toast.makeText(this, "API не настроен. Перейдите в настройки", Toast.LENGTH_LONG).show()
            return
        }
        
        // Конвертируем рубли в копейки
        val amountInCents = amount * 100
        
        statusText.text = "⏳ Обработка платежа..."
        payButton.isEnabled = false
        
        lifecycleScope.launch {
            val result = withContext(Dispatchers.IO) {
                apiService?.processPayment(token, amountInCents)
            }
            
            result?.onSuccess { response ->
                if (response.success) {
                    val newBalance = response.data?.newBalance ?: 0
                    statusText.text = "✅ Успешно! Новый баланс: ${(newBalance / 100.0)} руб"
                    
                    // Очистка поля суммы
                    amountInput.text.clear()
                    
                    Toast.makeText(
                        this@MainActivity,
                        "Платеж успешно обработан",
                        Toast.LENGTH_LONG
                    ).show()
                } else {
                    statusText.text = "❌ ${response.error}"
                    Toast.makeText(this@MainActivity, response.error, Toast.LENGTH_LONG).show()
                }
            }?.onFailure { error ->
                statusText.text = "❌ Ошибка: ${error.message}"
                Toast.makeText(this@MainActivity, error.message, Toast.LENGTH_LONG).show()
            }
            
            payButton.isEnabled = true
        }
    }
}
