/*
  WEMOS POORT   pinMode
      D0        GPIO16
      D1        GPIO5
      D2        GPIO4
      D3        GPIO0
      D4        GPIO2 (BUILTIN_LED)
      D5        GPIO14
      D6        GPIO12
      D7        GPIO13
      D8        GPIO15
      G         Ground

*/

#include "./color_values.h"
#include <Arduino.h>
#include <IRremoteESP8266.h>
#include <IRsend.h>  // Needed if you want to send IR commands.
#include <IRrecv.h>  // Needed if you want to receive IR commands.
#include <IRutils.h>
#define RECV_PIN D5
#define SEND_PIN 4
//#define SEND_PIN D2

// serial stuff
const byte numChars = 32;
char receivedChars[numChars];   // an array to store the received data
String inputData;
boolean newData = false;

// IR stuff
IRrecv irrecv(RECV_PIN);
decode_results results;
IRsend irsend(SEND_PIN);

void setup() {
  Serial.begin(115200);
  irrecv.enableIRIn(); // Start the receiver
  irsend.begin(); // Start the sender
  // this is a bit wreird
  //  while (!Serial)  // Wait for the serial connection to be establised.
  //    delay(50);
  Serial.println();
  Serial.print("IRrecvDemo is now running and waiting for IR message on Pin ");
  Serial.println(RECV_PIN);
  Serial.print("Sending data over Pin ");
  Serial.println(SEND_PIN);
  //pinMode(SEND_PIN, OUTPUT);
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
    default: return 0;
  }
}

void printHex(uint64_t hex) {
  serialPrintUint64(hex, HEX);
  Serial.println("");
}

void loop() {
  //Serial.println("NEC");

 // irsend.sendNEC(0xF7E01F);

  //delay(2000);
  
  checkSerial();
  handleNewData();

  if (irrecv.decode(&results)) {

    uint64_t value = results.value; // store the value
    irrecv.resume(); // Receive the next value
    printHex(value);
    //digitalWrite(SEND_PIN, HIGH);
    //irsend.sendNEC(value);
    //delay(2000);
    //digitalWrite(SEND_PIN, LOW);

    if (value == 0xFFFFFFFF) {
      delay(100);
      return;
    }
  }
  delay(100);
}

void checkSerial() {
  static byte ndx = 0;
  char endMarker = '\n';
  char rc;

  while (Serial.available() > 0 && newData == false) {
    // This is faster than readString
    rc = Serial.read();

    if (rc != endMarker) {
      receivedChars[ndx] = rc;
      ndx++;
      if (ndx >= numChars) {
        ndx = numChars - 1;
      }
    } else {
      receivedChars[ndx] = '\0'; // terminate the string
      ndx = 0;
      newData = true;
    }
  }
}

void handleNewData() {
  if (newData == true) {
    Serial.print("This just in ... ");
    Serial.println(receivedChars);

    String dataToString(receivedChars);
    int selectedColor = dataToString.toInt();

    if (selectedColor > 0) {
      uint64_t command = lookupCommand(selectedColor);

      if (command > 0) {
        sendIrData(command);
      }
    }

    newData = false;
  }
}

void sendIrData(uint64_t command) {
  Serial.print("Sending command to IR blaster with value: ");
  printHex(command);
  irsend.sendNEC(command);
  delay(2000);
}
