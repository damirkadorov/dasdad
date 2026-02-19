package com.testbank.terminal.utils

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.util.UUID

/**
 * Безопасное хранилище для API ключа и Terminal ID
 */
class SecureStorage(context: Context) {
    
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()
    
    private val sharedPreferences: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "nfc_terminal_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    companion object {
        private const val KEY_API_KEY = "api_key"
        private const val KEY_TERMINAL_ID = "terminal_id"
        private const val KEY_SERVER_URL = "server_url"
    }
    
    /**
     * Получить API ключ
     */
    fun getApiKey(): String? {
        return sharedPreferences.getString(KEY_API_KEY, null)
    }
    
    /**
     * Сохранить API ключ
     */
    fun setApiKey(apiKey: String) {
        sharedPreferences.edit().putString(KEY_API_KEY, apiKey).apply()
    }
    
    /**
     * Получить Terminal ID (генерируется автоматически при первом запуске)
     */
    fun getTerminalId(): String {
        var terminalId = sharedPreferences.getString(KEY_TERMINAL_ID, null)
        if (terminalId == null) {
            terminalId = "terminal-${UUID.randomUUID().toString().substring(0, 8)}"
            sharedPreferences.edit().putString(KEY_TERMINAL_ID, terminalId).apply()
        }
        return terminalId
    }
    
    /**
     * Получить URL сервера
     */
    fun getServerUrl(): String {
        return sharedPreferences.getString(KEY_SERVER_URL, "http://10.0.2.2:3001") ?: "http://10.0.2.2:3001"
    }
    
    /**
     * Сохранить URL сервера
     */
    fun setServerUrl(url: String) {
        sharedPreferences.edit().putString(KEY_SERVER_URL, url).apply()
    }
    
    /**
     * Проверить, настроено ли приложение
     */
    fun isConfigured(): Boolean {
        return getApiKey() != null
    }
}
