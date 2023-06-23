const fs = require('fs');
const db = require("../Database/db");
// without ssl
const io = require("socket.io")(3003, {
    cors: {
        origin: "*",
    },
});

// var mqttData = {
//     WegId: '',
//     Hz: 0,
//     Mag: 0,
//     dec: 0
// };

// ----------MQTT----------
const mqtt = require('mqtt');
const path = require('path');

const configFile = path.join(__dirname, '../configHandlers/mqttConfig.json');
const mqttConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));

const { PORT, HOST, USERNAME, PASSWORD, PROTOCOL } = mqttConfig

const options = {
    port: PORT,
    host: HOST,
    username: USERNAME,
    password: PASSWORD,
    protocol: PROTOCOL
};

const client = mqtt.connect(options)

client.on('connect', function () {
    console.log("MQTT Connected");
    client.subscribe('SC/ASR/ALL', function (err) {
    });
});

// client.on('connect', function () {
//     console.log("MQTT Connected");
//     client.subscribe('test', function (err) {
//     });
// });

client.on('message', async function (topic, message) {

    try {
        const data = message.toString();
        const newData = JSON.parse(data);
        // console.log(newData)
        
        // Update the WegId property
        // mqttData.WegId = newData['Wegid'];
        // Loop through the data array and update the Hz, Mag, and dec properties
        const temp_data = newData['data'];
        temp_data.forEach(Element => {
            WegId = newData['Wegid'];
            Hz = Element[0];
            Mag = Element[1];
            dec = Element[2];

            

            io.emit("recieve-temp", {
                data: {
                    wegid: WegId,
                    frequency: Hz,
                    magnitude: Mag,
                    decible: dec
                }
            });
            storeIntoDb(WegId, Hz, Mag, dec)
        });

        // console.log(mqttData)

        // Destructuring data for further use
        // const { WegId, Hz, Mag, dec } = mqttData

        // Socket streaming the data to frontend
        // io.emit("recieve-temp", {
        //     data: {
        //         wegid: WegId,
        //         frequency: Hz,
        //         magnitude: Mag,
        //         decible: dec
        //     }
        // });

        // Stores data into database
        // storeIntoDb(WegId, Hz, Mag, dec)
    } catch (e) {
        // uncomment this console to log the warnings
        // console.warn('Skipping invalid data: ' + e);
        return; // skip this data and continue with the next
    }
});

// client.on('close', function () {
//     console.log("MQTT Disconnected")
// })
// ----------MQTT----------

// -------------------------------------------------------------------------------------
const storeIntoDb = async (WegId, Hz, Mag, dec) => {
    // console.log("store to db: ", WegId, Hz, Mag, dec)
    const formattedMachine = WegId.replace("-", "").toLowerCase();
    // console.log(formattedMachine);
    await db.none(
        `INSERT INTO $1:name (
                wegid, 
                frequency, 
                magnitude, 
                decible
                ) VALUES($2, $3, $4, $5);`,
        [
            formattedMachine, WegId, Hz, Mag, dec
        ]
    )
        // .then(console.log("Data stored into the table"))
};
// -------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------
// Function to update the mqttData value with new data
// function updateMqttData(newData) {
//     mqttData = { ...mqttData, ...newData }
// };
// -------------------------------------------------------------------------------------