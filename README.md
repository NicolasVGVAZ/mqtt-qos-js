# 🏠 Orquestração MQTT com Node-RED

**Integração de sensores IoT com MQTT, Node-RED e broker Mosquitto em Docker**

[![Docker](https://img.shields.io/static/v1?label=Docker&message=Compose&color=blue)](https://www.docker.com)
[![Node-RED](https://img.shields.io/static/v1?label=Node-RED&message=v4.1.8&color=red)](https://nodered.org)
[![MQTT](https://img.shields.io/static/v1?label=MQTT&message=3.1.1&color=green)](https://mqtt.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Como Executar](#-como-executar)
- [Acessar Aplicações](#-acessar-aplicações)
- [Estrutura MQTT](#-estrutura-mqtt)
- [Verificação de Funcionamento](#-verificação-de-funcionamento)
- [Monitoramento](#-monitoramento)
- [Parar a Aplicação](#-parar-a-aplicação)
- [Codespaces](#-codespaces)

---

## 📌 Sobre o Projeto

Sistema de orquestração de sensores IoT utilizando **MQTT** como protocolo de comunicação, **Node-RED** como plataforma de integração e **Eclipse Mosquitto** como broker de mensagens.

O projeto implementa:
- ✅ Coleta de telemetria de múltiplos sensores
- ✅ Roteamento de mensagens com padrões de tópicos
- ✅ Dashboard em tempo real com gráficos
- ✅ Controle remoto de dispositivos (LED on/off)
- ✅ Suporte a dois brokers MQTT (local + nuvem)
- ✅ Persistência com QoS 1 e retained messages

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                   Docker Compose                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐   ┌──────────────┐  │
│  │  Mosquitto   │      │   Node-RED   │   │  Simulador   │  │
│  │   (1883)     │◄────►│   (1880)     │◄─►│  (MQTT Pub)  │  │
│  │              │      │              │   │              │  │
│  └──────────────┘      └──────────────┘   └──────────────┘  │
│                              │                                │
│                              ▼                                │
│                      ┌──────────────┐                        │
│                      │  HiveMQ      │                        │
│                      │  (Nuvem)     │                        │
│                      └──────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
          ▲
          │
   ┌──────────────────┐
   │   Dashboard UI   │  (http://localhost:1880/dashboard/page1)
   │   Web Browser    │
   └──────────────────┘
```

---

## 💻 Tecnologias

| Ferramenta | Versão | Descrição |
|-----------|--------|-----------|
| **Node-RED** | v4.1.8 | Plataforma visual de integração |
| **Eclipse Mosquitto** | 2 | Broker MQTT de código aberto |
| **HiveMQ Public** | - | Broker MQTT em nuvem (público) |
| **Docker** | Latest | Containerização |
| **Node.js** | v20 | Runtime JavaScript |
| **MQTT.js** | Latest | Cliente MQTT para Node.js |

---

## 📁 Estrutura do Projeto

```
mqtt-qos-js/
├── README.md                          # Este arquivo
├── labs/
│   └── sprint3-nodered-hello/
│       ├── docker-compose.yml         # Orquestração de contêineres
│       ├── .gitignore                 # Arquivos ignorados no git
│       ├── mosquitto/
│       │   └── mosquitto.conf         # Configuração do broker MQTT
│       ├── nodered/
│       │   └── data/
│       │       ├── flows.json         # Fluxos do Node-RED
│       │       ├── flows_cred.json    # Credenciais (gerado)
│       │       └── package.json       # Dependências Node-RED
│       └── simulator/
│           ├── Dockerfile            # Imagem do simulador
│           ├── package.json           # Dependências
│           ├── device-simulator.js    # Sensor simulado
│           └── subscriber.js          # Consumer de mensagens
└── pubQos*.js, subQos*.js             # Scripts de teste básicos
```

---

## 🚀 Instalação

### Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- Git

### Clonar o repositório

```bash
git clone https://github.com/NicolasVGVAZ/mqtt-qos-js.git
cd mqtt-qos-js
```

---

## ▶️ Como Executar

```bash
# Navegar para o diretório do projeto
cd labs/sprint3-nodered-hello

# Iniciar todos os serviços
docker compose up -d --build

# Verificar status dos contêineres
docker compose ps
```

**Esperado:**
```
NAME                         STATUS      PORTS
mosquitto                    Up          0.0.0.0:1883->1883/tcp
nodered                      Up          0.0.0.0:1880->1880/tcp
simulator-1                  Up
simulator-2                  Up
simulator-3                  Up
consumer                     Up
```

---

## 🌐 Acessar Aplicações

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Node-RED Editor** | http://localhost:1880 | Interface visual para criar fluxos |
| **Dashboard IoT** | http://localhost:1880/dashboard/page1 | Painel com sensores e controles |
| **Mosquitto Broker** | localhost:1883 | Porta MQTT local |

---

## 📡 Estrutura MQTT

### Organização de Tópicos

```
home/
├── living-room/
│   └── sensor-001/
│       ├── telemetry    → Dados de sensor (temperatura, umidade)
│       ├── status       → Estado do dispositivo (LED on/off)
│       └── cmd          → Comando para dispositivo
├── kitchen/
│   └── sensor-002/
│       ├── telemetry
│       ├── status
│       └── cmd
└── garage/
    └── sensor-003/
        ├── telemetry
        ├── status
        └── cmd
```

### Detalhes de Tópicos

| Tópico | QoS | Retain | Payload | Intervalo |
|--------|-----|--------|---------|-----------|
| `home/*/*/telemetry` | 1 | ❌ | JSON com temp, umidade, seq | 1s |
| `home/*/*/status` | 1 | ✅ | JSON com estado do LED | heartbeat |
| `home/*/*/cmd` | 1 | ✅ | JSON com comando (on/off) | on-demand |

### Exemplo de Payload

**Telemetria:**
```json
{
  "device_id": "sensor-001",
  "environment": "living-room",
  "ts": "2026-04-29T01:03:46.000Z",
  "seq": 42,
  "temp_c": 25.48,
  "humidity_pct": 59.05
}
```

**Status:**
```json
{
  "device_id": "sensor-001",
  "light_on": true,
  "reason": "command_on",
  "ts": "2026-04-29T01:03:46.000Z"
}
```

**Comando:**
```json
{
  "source": "nodered",
  "command": "on",
  "ts": "2026-04-29T01:03:46.000Z"
}
```

---

## ✅ Verificação de Funcionamento

### 1. Dashboard em Tempo Real

Abra http://localhost:1880/dashboard/page1 e verifique:
- ✅ Temperatura atualizando a cada segundo
- ✅ Umidade variando entre 40-60%
- ✅ Estado do LED mostrando ON/OFF
- ✅ Timestamp atualizado

### 2. Botões de Controle

No dashboard, clique em **ON** ou **OFF** para:
- Enviar comando ao simulador
- Atualizar status em tempo real
- Ver confirmação no console

### 3. Teste com curl

```bash
# Ligar LED
curl -X POST http://localhost:1880/iot-control \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'broker=local&environment=living-room&device=sensor-001&command=on&qos=1&retain=true'

# Desligar LED
curl -X POST http://localhost:1880/iot-control \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'broker=local&environment=living-room&device=sensor-001&command=off&qos=1&retain=true'
```

---

## 📊 Monitoramento

### Ver Logs de Todos os Serviços

```bash
cd labs/sprint3-nodered-hello
docker compose logs -f
```

### Ver Logs Específicos

```bash
# Apenas Node-RED
docker compose logs -f nodered

# Apenas Simulador
docker compose logs -f simulator-1

# Apenas Mosquitto
docker compose logs -f mosquitto
```

### Monitorar Mensagens MQTT

```bash
# Todos os tópicos
docker compose exec -T mosquitto mosquitto_sub -t "home/#" -v

# Apenas telemetria
docker compose exec -T mosquitto mosquitto_sub -t "home/+/+/telemetry" -v

# Apenas comandos
docker compose exec -T mosquitto mosquitto_sub -t "home/+/+/cmd" -v
```

---

## ⛔ Parar a Aplicação

```bash
cd labs/sprint3-nodered-hello

# Parar e remover contêineres
docker compose down

# Remover volumes também
docker compose down -v
```

---

## 🔄 Codespaces

Este repositório está configurado para executar no GitHub Codespaces:

```bash
# O arquivo `.devcontainer/devcontainer.json` fornece:
- Portas 1880 (Node-RED) e 1883 (MQTT) já encaminhadas
- Docker pré-instalado
- Stack auto-iniciado ao abrir o Codespace
```

### Usar no Codespaces

```bash
cd labs/sprint3-nodered-hello
docker compose up -d
```

---

## 📚 Referências

- [MQTT Documentation](https://mqtt.org)
- [Node-RED Documentation](https://nodered.org/docs/)
- [Eclipse Mosquitto](https://mosquitto.org)
- [Docker Compose](https://docs.docker.com/compose/)

---

## 📝 Licença

MIT License - veja LICENSE para detalhes

---

**Desenvolvido como projeto acadêmico de IoT e Sistemas Distribuídos** 🎓
