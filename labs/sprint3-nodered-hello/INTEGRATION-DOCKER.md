# Integração MQTT + Node-RED (Docker Compose - Simplificado)

Este guia segue o padrao solicitado e remove o que nao e usado.

## 1) Arquitetura e Estrutura de Topicos (Item 2)

Padrao: `projeto/iot/<ambiente>/<tipo_de_dado>`

Sensores (publicando para o Node-RED):
- `projeto/iot/sala/temperatura` (ex.: `24.5`)
- `projeto/iot/cozinha/temperatura` (ex.: `28.1`)

No Node-RED, assine: `projeto/iot/+/temperatura`

Atuadores (recebendo comandos do Node-RED):
- `projeto/iot/sala/iluminacao/set` (payload: `true` ou `false`)

Decisoes tecnicas:
- QoS: sensores em `0`, comandos em `1`
- Retain: `true` para `iluminacao/set`

## 2) Brokers (Item 1a e 1b)

Crie dois brokers no Node-RED:

- HiveMQ (publico)
  - Server: `broker.hivemq.com`
  - Port: `1883`

- Mosquitto (local no Docker)
  - Server: `mosquitto`
  - Port: `1883`

## 3) Subir os Containers

```bash
cd /workspaces/mqtt-qos-js/labs/sprint3-nodered-hello

sleep 10
```

## 4) Fluxo A: Sensores -> Dashboard

No Node-RED:

1. `mqtt in`
  - Broker: HiveMQ
  - Topic: `projeto/iot/+/temperatura`
  - QoS: `0`

2. `switch` (roteamento por `msg.topic`)
  - Regra 1: `== projeto/iot/sala/temperatura` (saida 1)
  - Regra 2: `== projeto/iot/cozinha/temperatura` (saida 2)

3. `ui_gauge` ou `ui_chart`
  - Saida 1 -> "Temperatura da Sala"
  - Saida 2 -> "Temperatura da Cozinha"

## 5) Fluxo B: Controle -> Atuador

1. `ui_switch`
  - Label: "Luz da Sala"
  - On: `true`, Off: `false`

2. `mqtt out`
  - Broker: Mosquitto
  - Topic: `projeto/iot/sala/iluminacao/set`
  - QoS: `1`
  - Retain: `true`

## 6) Testes rapidos

Publicar sensores (HiveMQ):

```bash
mosquitto_pub -h broker.hivemq.com -t 'projeto/iot/sala/temperatura' -m '25'
mosquitto_pub -h broker.hivemq.com -t 'projeto/iot/cozinha/temperatura' -m '30'
```

Monitorar comandos no Mosquitto local (Codespace):

```bash
docker-compose -f docker-compose-nodered.yml exec -T mosquitto \
  mosquitto_sub -h localhost -t 'projeto/iot/#' -v
```

## 7) Roteiro de demonstracao (Item 3)

1. Abrir o dashboard do Node-RED (`/ui` ou `/dashboard`)
2. Enviar `25` em `projeto/iot/sala/temperatura` (HiveMQ)
3. Enviar `30` em `projeto/iot/cozinha/temperatura` (HiveMQ)
4. Clicar no switch "Luz da Sala" e ver a mensagem chegar no Mosquitto local

## Arquivo chave

- [docker-compose-nodered.yml](./docker-compose-nodered.yml)
1. **Mosquitto ativo**: Porta 1883 deve estar escutando
