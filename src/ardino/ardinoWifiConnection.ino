#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://your-server.com/graphql";

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Function to call GraphQL API
float getItemPrice(int itemID) {

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  // GraphQL query
  String query = "{\"query\":\"query { getItemPrice(itemID: ";
  query += itemID;
  query += ") { price } }\"}";

  int httpResponseCode = http.POST(query);

  float price = 0.0;

  if (httpResponseCode > 0) {
    String response = http.getString();

    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);

    price = doc["data"]["getItemPrice"]["price"];
  }

  http.end();
  return price;
}

// Display function
void displayItem(int id, float price) {
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);

  display.setCursor(0, 0);
  display.print("ID: ");
  display.println(id);

  display.setCursor(0, 30);
  display.print("Rs ");
  display.println(price);

  display.display();
}

void setup() {
  Serial.begin(115200);

  Wire.begin(8, 9);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);

  // Connect WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  int itemID = 101;
  float price = getItemPrice(itemID);

  displayItem(itemID, price);
}

void loop() {}
