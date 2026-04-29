# mqtt-qos-js

## Node-RED + MQTT hello world lab (Codespaces-ready)

This repository includes a starter project for a 2-week IoT security sprint using Node-RED + MQTT in Docker.

### Location

All new lab files are under:

- `labs/sprint3-nodered-hello`

### Services

`docker compose` in that directory starts:

1. `eclipse-mosquitto` broker on port `1883` (local/Codespace broker)
2. `nodered/node-red` REST API + Dashboard on port `1880` with:
   - Node-RED editor: `http://localhost:1880`
   - FlowFuse Dashboard (modern UI): `http://localhost:1880/dashboard`
3. MQTT flow with:
   - **3 temperature sensors** (gauges in dashboard):
     - `home/living-room/device-001/telemetry` (Sala)
     - `home/kitchen/device-002/telemetry` (Cozinha)
     - `home/garage/device-003/telemetry` (Garagem)
   - **3 light switches** (controls in dashboard):
     - `home/living-room/device-001/cmd` (Luz da sala)
     - `home/kitchen/device-002/cmd` (Luz da cozinha)
     - `home/garage/device-003/cmd` (Luz da garagem)

### Run

```bash
cd labs/sprint3-nodered-hello
docker compose up -d --build
```

### Access

- **Node-RED Editor**: `http://localhost:1880` (visual flow editor)
- **Dashboard (FlowFuse)**: `http://localhost:1880/dashboard` (modern UI with gauges and switches)
  - View real-time temperature readings from 3 environments
  - Control lights (on/off) for each room

### Arquitetura MQTT usada

Tópicos organizados por domínio:

- **Telemetria (entrada de dados)**: `home/<ambiente>/<dispositivo>/telemetry`
- **Comando (controle)**: `home/<ambiente>/<dispositivo>/cmd`
- **Status (estado persistente)**: `home/<ambiente>/<dispositivo>/status`

Padrão de QoS:

- `QoS 1` para telemetria, comando e status (garantir entrega)
- `retain=true` em status e comandos para refletir último estado conheci
- Broker local: `mosquitto:1883` (dentro da rede Docker)

### Dashboard Features

The Flow includes:

- **Temperature Gauges**: Display real-time temperature (°C) from 3 environments with color-coded zones:
  - Green: cold (0-17°C)
  - Yellow: moderate (17-34°C)
  - Red: hot (34-50°C)

- **Light Switches**: Toggle on/off to send MQTT commands:
  - Publishing to `home/<environment>/<device-id>/cmd` with payload `{"command":"on"}` or `{"command":"off"}`
  - QoS 1, retain=true

### Verify behavior

1. Ensure broker is running (check logs for "Connected to broker: mqtt://mosquitto:1883")
2. Open dashboard at `http://localhost:1880/dashboard`
3. To test temperature data, publish MQTT messages:
   ```bash
   # Example: publish temperature to living-room
   mosquitto_pub -h localhost -p 1883 -t "home/living-room/device-001/telemetry" \
     -m '{"temp_c": 22.5, "humidity_pct": 45, "led_on": false, "ts": "2026-04-29T20:00:00Z"}'
   ```
4. To test light control, use a switch in the dashboard or publish:
   ```bash
   # Example: toggle light on
   mosquitto_pub -h localhost -p 1883 -t "home/living-room/device-001/cmd" \
     -m '{"command":"on"}' -q 1 -r
   ```

### Demo sugerida

1. **Iniciar a stack**: `docker compose -f docker-compose-nodered.yml up -d --build`
2. **Abrir o dashboard**: acesse `http://localhost:1880/dashboard`
3. **Observar as 3 áreas**:
   - **Température da Sala** (Temperatura) - gauge
   - **Luz da sala** (Luz da sala) - switch
   - **Temperatura da Cozinha** - gauge
   - **Luz da cozinha** (Luz da cozinha) - switch
   - **Temperatura da Garagem** - gauge
   - **Luz da garagem** (Luz da garagem) - switch
4. **Publicar dados de teste** para alimentar os gauges e validar o fluxo
5. **Clicar nos switches** para ver os comandos sendo publicados (aba Debug no Node-RED mostra payload no console)

### Logs

```bash
cd labs/sprint3-nodered-hello

# View all container logs
docker compose -f docker-compose-nodered.yml logs -f

# View only Node-RED logs
docker compose -f docker-compose-nodered.yml logs -f node-red

# View only Mosquitto logs
docker compose -f docker-compose-nodered.yml logs -f mosquitto
```

### Stop

```bash
cd labs/sprint3-nodered-hello
docker compose -f docker-compose-nodered.yml down
```

### Codespaces

A new `.devcontainer/devcontainer.json` is included to:

- forward ports `1880` (Node-RED) and `1883` (MQTT Broker)
- auto-start the lab stack on startup with:
  ```bash
  docker compose -f labs/sprint3-nodered-hello/docker-compose-nodered.yml up -d --build
  ```
- provide quick access to the dashboard after startup
