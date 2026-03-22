#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define MAX_ITEMS 10

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Structure to store item details
struct Item {
  int itemID;
  float price;
};

Item items[MAX_ITEMS];
int itemCount = 0;

// Function to add item
void addItem(int id, float price) {
  if (itemCount < MAX_ITEMS) {
    items[itemCount].itemID = id;
    // items[itemCount].price = price;
    // itemCount++;

    // displayItem(id, price);
    //aws -> item price is $200 (response)
    getItemPrice(itemID).then(response=>{
      price = response.price;
    })
  }
}

// Function to display item and price
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
  Wire.begin(8, 9);  // SDA = 8, SCL = 9
  
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.display();

  // Example item
  addItem(101, 25.50);
}

void loop() {
  // Example: Add new item every 5 seconds
  static unsigned long lastTime = 0;

  if (millis() - lastTime > 5000) {
    lastTime = millis();
    addItem(itemCount + 100, (itemCount + 1) * 10.5);
  }
}
