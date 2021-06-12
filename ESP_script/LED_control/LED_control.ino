#include "./color_values.h"
#include <Arduino.h>
#include <ESP8266WiFi.h>
// #include <IRremoteESP8266.h> // does not seem to be needed?
#include <IRsend.h>  // Needed if you want to send IR commands.
#include <IRutils.h>
#define SEND_PIN 4
// Pull in the definitions for the wifi credentals
#include "./wifi_credentials.h";

// Start server on port 80
WiFiServer server(80);

// Http timeout
// Current time
unsigned long currentTime = millis();
// Previous time
unsigned long previousTime = 0; 
// Define timeout time in milliseconds (example: 2000ms = 2s)
const long timeoutTime = 2000;

// IR stuff
IRsend irsend(SEND_PIN);

void setup() {
  Serial.begin(115200);
  irsend.begin(); // Start the sender
  Serial.println();
  Serial.print("Sending data over Pin ");
  Serial.println(SEND_PIN);

  // Connect to Wi-Fi network with SSID and password
  Serial.print("Connecting to: ");
  Serial.println(ssid);

  /* Explicitly set the ESP8266 to be a WiFi-client, otherwise, it by default,
   would try to act as both a client and an access-point and could cause
   network-issues with your other WiFi-devices on your WiFi-network. */
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // Print local IP address and start web server
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  server.begin();
}

uint64_t lookupCommand(int color) {
  switch (color) {
    case R_RED: return RED;
    case R_ORANGE: return ORANGE;
    case R_DARK_YELLOW: return DARK_YELLOW;
    case R_YELLOW: return YELLOW;
    case R_LIGHT_YELLOW: return LIGHT_YELLOW;
    case R_GREEN: return GREEN;
    case R_PEA_GREEN: return PEA_GREEN;
    case R_CYAN: return CYAN;
    case R_LIGHT_BLUE: return LIGHT_BLUE;
    case R_SKY_BLUE: return SKY_BLUE;
    case R_BLUE: return BLUE;
    case R_DARK_ORCHID: return DARK_ORCHID;
    case R_MAGENTA: return MAGENTA;
    case R_PURPLE: return PURPLE;
    case R_PINK: return PINK;
    case R_WHITE: return WHITE;
    default: return 0;
  }
}

void printHex(uint64_t hex) {
  serialPrintUint64(hex, HEX);
  Serial.println("");
}

// code modiefied from https://duncte.bot/JYRh
void loop() {
  WiFiClient client = server.available();

  // return if we don't have a client
  if (!client) {
    return;
  }

  Serial.println("New Client.");          // print a message out in the serial port
  String currentLine = "";                // make a String to hold incoming data from the client
  // String lastLine = "";
  // int emptyCounter = 0;
  currentTime = millis();
  previousTime = currentTime;

  // timeout handling
  while (client.connected() && currentTime - previousTime <= timeoutTime) {
    currentTime = millis();

    // continue if there is no stuff to read
    if (!client.available()) {
      continue;
    }

    // start reading the data stream
    char c = client.read();
    // write it to the console
    Serial.write(c);

    // new row in the http request
    if (c == '\n' ) {
      // detect the "GET" prefix
      // extract and parse the path
      // handle request
      if (currentLine.length() == 0 /*&& emptyCounter >= 1*/) {
        // got the full http block at this point
        // client.println("HTTP/1.1 200 OK");
        client.println("HTTP/1.1 204 No Content");
        // client.println("Content-type: text/plain");
        client.println("Server: PotatOS");
        client.println("Connection: close");
        client.println();
        // client.println("Ok");
        // client.println(lastLine);
      } else {
        //lastLine = currentLine;

        // TODO: only for POST requests, not working atm
        //if (lastLine.length() == 0) {
        //  Serial.println("--- Got empty line (expected) ---");
       //   emptyCounter++;
        //}

        currentLine = "";
      }
    } else if (c != '\r') {
      currentLine += c;
    }
  }
}

void handleNewData(int selectedColor) {
  Serial.print("This just in ... " + selectedColor);

  if (selectedColor > 0) {
    uint64_t command = lookupCommand(selectedColor);

    if (command > 0) {
      sendIrData(command);
    }
  }
}

void sendIrData(uint64_t command) {
  Serial.print("Sending command to IR blaster with value: ");
  printHex(command);
  irsend.sendNEC(command);
  delay(2000);
}
