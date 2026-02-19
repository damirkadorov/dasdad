package com.testbank.terminal.api

import com.google.gson.Gson
import com.testbank.terminal.models.PaymentRequest
import com.testbank.terminal.models.PaymentResponse
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Сервис для взаимодействия с API сервера
 */
class ApiService(
    private val baseUrl: String,
    private val apiKey: String,
    private val terminalId: String
) {
    
    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .writeTimeout(10, TimeUnit.SECONDS)
        .build()
    
    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()
    
    /**
     * Обработать платеж
     * @param token Токен NFC карты
     * @param amount Сумма в копейках
     * @return Результат платежа
     */
    fun processPayment(token: String, amount: Int): Result<PaymentResponse> {
        return try {
            val paymentRequest = PaymentRequest(
                token = token,
                amount = amount,
                terminalId = terminalId
            )
            
            val requestBody = gson.toJson(paymentRequest).toRequestBody(jsonMediaType)
            
            val request = Request.Builder()
                .url("$baseUrl/api/pay")
                .addHeader("X-API-Key", apiKey)
                .addHeader("X-Terminal-Id", terminalId)
                .addHeader("Content-Type", "application/json")
                .post(requestBody)
                .build()
            
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""
            
            if (response.isSuccessful) {
                val paymentResponse = gson.fromJson(responseBody, PaymentResponse::class.java)
                Result.success(paymentResponse)
            } else {
                // Парсим ошибку
                val errorResponse = try {
                    gson.fromJson(responseBody, PaymentResponse::class.java)
                } catch (e: Exception) {
                    PaymentResponse(
                        success = false,
                        error = "Ошибка сервера: ${response.code}"
                    )
                }
                Result.failure(Exception(errorResponse.error ?: "Неизвестная ошибка"))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Ошибка сети: ${e.message}"))
        } catch (e: Exception) {
            Result.failure(Exception("Ошибка: ${e.message}"))
        }
    }
    
    /**
     * Проверить соединение с сервером
     */
    fun checkConnection(): Result<Boolean> {
        return try {
            val request = Request.Builder()
                .url("$baseUrl/health")
                .get()
                .build()
            
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                Result.success(true)
            } else {
                Result.failure(Exception("Сервер недоступен"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Ошибка подключения: ${e.message}"))
        }
    }
}
