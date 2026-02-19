#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_KEY="your-secret-api-key-change-this-in-production"
BASE_URL="http://localhost:3001"

echo -e "${YELLOW}🧪 Тестирование NFC Terminal API...${NC}\n"

# Тест 1: Health check
echo -e "${YELLOW}1. Health check...${NC}"
HEALTH=$(curl -s $BASE_URL/health)
if echo $HEALTH | grep -q "healthy"; then
    echo -e "${GREEN}✅ Сервер работает${NC}"
else
    echo -e "${RED}❌ Сервер не отвечает${NC}"
    exit 1
fi
echo ""

# Тест 2: Создание карты
echo -e "${YELLOW}2. Создание тестовой карты...${NC}"
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/api/cards \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"owner": "Test User", "balance": 50000}')

if echo $CREATE_RESPONSE | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Карта создана${NC}"
    TOKEN=$(echo $CREATE_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    BALANCE=$(echo $CREATE_RESPONSE | grep -o '"balance":[0-9]*' | cut -d':' -f2)
    echo -e "   Токен: ${GREEN}$TOKEN${NC}"
    echo -e "   Баланс: ${GREEN}$((BALANCE/100))${NC} руб"
else
    echo -e "${RED}❌ Ошибка создания карты${NC}"
    echo $CREATE_RESPONSE
    exit 1
fi
echo ""

# Тест 3: Получение карты
echo -e "${YELLOW}3. Получение информации о карте...${NC}"
CARD_INFO=$(curl -s $BASE_URL/api/cards/$TOKEN \
  -H "X-API-Key: $API_KEY")

if echo $CARD_INFO | grep -q "Test User"; then
    echo -e "${GREEN}✅ Информация получена${NC}"
else
    echo -e "${RED}❌ Ошибка получения информации${NC}"
    exit 1
fi
echo ""

# Тест 4: Успешный платеж
echo -e "${YELLOW}4. Тест успешного платежа (100 руб)...${NC}"
PAYMENT_RESPONSE=$(curl -s -X POST $BASE_URL/api/pay \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Terminal-Id: test-terminal" \
  -d "{\"token\": \"$TOKEN\", \"amount\": 10000, \"terminalId\": \"test-terminal\"}")

if echo $PAYMENT_RESPONSE | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Платеж успешен${NC}"
    NEW_BALANCE=$(echo $PAYMENT_RESPONSE | grep -o '"newBalance":[0-9]*' | cut -d':' -f2)
    echo -e "   Новый баланс: ${GREEN}$((NEW_BALANCE/100))${NC} руб"
else
    echo -e "${RED}❌ Ошибка платежа${NC}"
    echo $PAYMENT_RESPONSE
    exit 1
fi
echo ""

# Тест 5: Платеж с недостаточным балансом
echo -e "${YELLOW}5. Тест платежа с недостаточным балансом...${NC}"
FAIL_PAYMENT=$(curl -s -X POST $BASE_URL/api/pay \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Terminal-Id: test-terminal" \
  -d "{\"token\": \"$TOKEN\", \"amount\": 1000000, \"terminalId\": \"test-terminal\"}")

if echo $FAIL_PAYMENT | grep -q "Недостаточно средств"; then
    echo -e "${GREEN}✅ Корректная обработка ошибки${NC}"
else
    echo -e "${RED}❌ Неправильная обработка ошибки${NC}"
    exit 1
fi
echo ""

# Тест 6: История транзакций
echo -e "${YELLOW}6. Получение истории транзакций...${NC}"
TRANSACTIONS=$(curl -s $BASE_URL/api/pay/transactions/$TOKEN \
  -H "X-API-Key: $API_KEY")

if echo $TRANSACTIONS | grep -q "success"; then
    COUNT=$(echo $TRANSACTIONS | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✅ История получена (транзакций: $COUNT)${NC}"
else
    echo -e "${RED}❌ Ошибка получения истории${NC}"
    exit 1
fi
echo ""

# Тест 7: Блокировка карты
echo -e "${YELLOW}7. Блокировка карты...${NC}"
BLOCK_RESPONSE=$(curl -s -X PATCH $BASE_URL/api/cards/$TOKEN/status \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"active": false}')

if echo $BLOCK_RESPONSE | grep -q "деактивирована"; then
    echo -e "${GREEN}✅ Карта заблокирована${NC}"
else
    echo -e "${RED}❌ Ошибка блокировки${NC}"
    exit 1
fi
echo ""

# Тест 8: Платеж заблокированной картой
echo -e "${YELLOW}8. Тест платежа заблокированной картой...${NC}"
BLOCKED_PAYMENT=$(curl -s -X POST $BASE_URL/api/pay \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Terminal-Id: test-terminal" \
  -d "{\"token\": \"$TOKEN\", \"amount\": 1000, \"terminalId\": \"test-terminal\"}")

if echo $BLOCKED_PAYMENT | grep -q "заблокирована"; then
    echo -e "${GREEN}✅ Корректная обработка заблокированной карты${NC}"
else
    echo -e "${RED}❌ Неправильная обработка${NC}"
    exit 1
fi
echo ""

# Тест 9: Статистика терминала
echo -e "${YELLOW}9. Получение статистики терминала...${NC}"
STATS=$(curl -s $BASE_URL/api/pay/terminal/test-terminal/stats \
  -H "X-API-Key: $API_KEY")

if echo $STATS | grep -q "test-terminal"; then
    echo -e "${GREEN}✅ Статистика получена${NC}"
else
    echo -e "${RED}❌ Ошибка получения статистики${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}✅ Все тесты пройдены успешно!${NC}\n"
echo -e "${YELLOW}📝 Токен для тестирования NFC:${NC}"
echo -e "${GREEN}$TOKEN${NC}\n"
echo -e "${YELLOW}Запишите этот токен на NFC метку для тестирования Android-приложения${NC}"
