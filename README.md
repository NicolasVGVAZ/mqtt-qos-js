# mqtt-qos-js

## Node-RED + MQTT hello world lab (Codespaces-ready)

This repository includes a starter project for a 2-week IoT security sprint using Node-RED + MQTT in Docker.

### Location

All new lab files are under:

- `labs/sprint3-nodered-hello`

### Services

`docker compose` in that directory starts:

1. `eclipse-mosquitto` broker on port `1883` (local/Codespace broker)
2. `nodered/node-red` UI on port `1880` with preloaded orchestration flow
3. 3 simulators publishing telemetry and status for:
  - `home/living-room/sensor-001/*`
  - `home/kitchen/sensor-002/*`
  - `home/garage/sensor-003/*`
4. Node.js consumer subscriber logging all topics under `home/#`

### Run

```bash
cd labs/sprint3-nodered-hello
docker compose up -d --build
```

### Access

- Node-RED editor: `http://localhost:1880`
- IoT dashboard UI from the included flow: `http://localhost:1880/iot-ui`

### Arquitetura MQTT usada

Tópicos organizados por domínio:

- Telemetria: `home/<ambiente>/<dispositivo>/telemetry`
- Estado (retained): `home/<ambiente>/<dispositivo>/status`
- Comando: `home/<ambiente>/<dispositivo>/cmd`

Decisões:

- `QoS 1` para comando e status (maior confiabilidade)
- `retain=true` em status e comandos para refletir último estado conhecido
- wildcard `home/+/+/telemetry` e `home/+/+/status` para escalabilidade com múltiplos dispositivos
- dois brokers no mesmo flow Node-RED:
  - `Mosquitto Local` (`host.docker.internal:1883`)
  - `HiveMQ Public` (`broker.hivemq.com:1883`)

### Verify behavior

- Simuladores publicam a cada 1 segundo:
  - temperatura, umidade, estado do LED e timestamp
  - tópico de status também atualizado (heartbeat)
- Simuladores assinam `.../cmd` e alteram o estado com `on/off`
- Node-RED:
  - consome local e HiveMQ em paralelo
  - normaliza e guarda estado/histórico por dispositivo
  - exibe cards e mini-gráficos no `/iot-ui`
  - envia comando para local, HiveMQ ou ambos via formulário

### Demo prática sugerida

1. Abrir o painel em `http://localhost:1880/iot-ui`.
2. Mostrar chegada de dados de múltiplos ambientes.
3. Enviar comando `on` para `living-room/sensor-001` usando broker local.
4. Confirmar atualização do `status` no painel e nos logs do simulador.
5. Repetir envio para `HiveMQ` (ou `Ambos`) e demonstrar roteamento.

### Logs

```bash
cd labs/sprint3-nodered-hello
docker compose logs -f simulator consumer nodered mosquitto
```

### Stop

```bash
cd labs/sprint3-nodered-hello
docker compose down
```

### Codespaces

A new `.devcontainer/devcontainer.json` is included to:

- forward ports `1880` and `1883`
- auto-start the lab stack on startup with:
  - `docker compose -f labs/sprint3-nodered-hello/docker-compose.yml up -d --build`
