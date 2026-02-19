package com.testbank.terminal.models

/**
 * Модель запроса на оплату
 */
data class PaymentRequest(
    val token: String,      // Токен NFC карты
    val amount: Int,        // Сумма в копейках
    val terminalId: String  // ID терминала
)

/**
 * Модель ответа на платеж
 */
data class PaymentResponse(
    val success: Boolean,
    val message: String? = null,
    val data: PaymentData? = null,
    val error: String? = null,
    val currentBalance: Int? = null,
    val required: Int? = null
)

/**
 * Данные успешного платежа
 */
data class PaymentData(
    val transactionId: String,
    val amount: Int,
    val newBalance: Int,
    val date: String
)

/**
 * Модель информации о карте
 */
data class CardInfo(
    val owner: String,
    val balance: Int,
    val active: Boolean,
    val createdAt: String
)
