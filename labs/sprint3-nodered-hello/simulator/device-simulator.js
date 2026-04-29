import mqtt from "mqtt";

const environment = process.env.ENVIRONMENT || "living-room";
const deviceId = process.env.DEVICE_ID || "device-001";
const url = process.env.MQTT_URL || "mqtt://localhost:1883";
const telemetryTopic = process.env.MQTT_TOPIC || `home/${environment}/${deviceId}/telemetry`;
const commandTopic = process.env.MQTT_COMMAND_TOPIC || `home/${environment}/${deviceId}/cmd`;
const statusTopic = process.env.MQTT_STATUS_TOPIC || `home/${environment}/${deviceId}/status`;

let seq = 0;
let timer = null;
let ledOn = false;

const client = mqtt.connect(url);

function publishStatus(reason = "heartbeat", qos = 1, retain = true) {
  const status = {
    device_id: deviceId,
    environment,
    ts: new Date().toISOString(),
    led_on: ledOn,
    reason
  };

  client.publish(statusTopic, JSON.stringify(status), { qos, retain }, (err) => {
    if (err) {
      console.error("[simulator] status publish error:", err.message);
      return;
    }
    console.log("[simulator] published status", statusTopic, status);
  });
}

client.on("connect", () => {
  console.log(`[simulator] connected to ${url} as ${deviceId}`);

  client.subscribe(commandTopic, { qos: 1 }, (err) => {
    if (err) {
      console.error("[simulator] command subscribe error:", err.message);
      return;
    }
    console.log(`[simulator] subscribed to ${commandTopic}`);
  });

  publishStatus("boot", 1, true);

  if (timer) {
    clearInterval(timer);
  }

  timer = setInterval(() => {
    const payload = {
      device_id: deviceId,
      environment,
      ts: new Date().toISOString(),
      seq: seq++,
      temp_c: Number((20 + Math.random() * 10).toFixed(2)),
      humidity_pct: Number((40 + Math.random() * 20).toFixed(2)),
      led_on: ledOn,
      message: "hello"
    };

    client.publish(telemetryTopic, JSON.stringify(payload), { qos: 1 }, (err) => {
      if (err) {
        console.error("[simulator] publish error:", err.message);
        return;
      }
      console.log("[simulator] published telemetry", telemetryTopic, payload);
    });

    publishStatus("heartbeat", 0, true);
  }, 1000);
});

client.on("message", (receivedTopic, rawPayload) => {
  if (receivedTopic !== commandTopic) {
    return;
  }

  let cmd;
  try {
    cmd = JSON.parse(rawPayload.toString());
  } catch (err) {
    console.error("[simulator] invalid command payload", rawPayload.toString());
    return;
  }

  console.log("[simulator] command received", receivedTopic, cmd);

  const command = String(cmd.command || "").toLowerCase();
  if (command === "on") {
    ledOn = true;
    console.log(`[simulator] ${deviceId} light ON`);
    publishStatus("command_on", 1, true);
  } else if (command === "off") {
    ledOn = false;
    console.log(`[simulator] ${deviceId} light OFF`);
    publishStatus("command_off", 1, true);
  } else {
    console.warn("[simulator] unknown command", cmd);
  }
});

client.on("error", (err) => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  console.error("[simulator] mqtt error:", err.message);
});

client.on("close", () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
