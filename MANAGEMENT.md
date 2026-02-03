# AWL Scanner Management Script

Bash script voor het beheren van de AWL Scanner applicatie op Ubuntu VPS.

## 📋 Vereisten

- Ubuntu 24.04 (of hoger)
- Node.js 18.x
- Git
- Root toegang

## 🚀 Installatie

```bash
# Download script
wget https://raw.githubusercontent.com/CS-Workx/awl/main/awl-manager.sh
chmod +x awl-manager.sh

# Voer installatie uit
sudo ./awl-manager.sh install
```

Het script zal automatisch:
1. Node.js en PM2 controleren
2. Repository clonen
3. Dependencies installeren
4. .env file aanmaken (indien niet aanwezig)
5. Applicatie starten met PM2
6. PM2 startup configureren

## 📝 Configuratie

Na installatie moet je de `.env` file configureren:

```bash
sudo nano /var/www/tools.superworker.be/html/awl/.env
```

Vereiste variabelen:
- `GEMINI_API_KEY` - Google Gemini API key
- `MICROSOFT_CLIENT_ID` - Azure AD App ID
- `MICROSOFT_CLIENT_SECRET` - Azure AD Client Secret
- `MICROSOFT_TENANT_ID` - Azure AD Tenant ID
- `SENDER_EMAIL` - Email address voor verzenden

## 🎯 Commando's

### Update (aanbevolen workflow)
```bash
sudo ./awl-manager.sh update
```
- Pullt laatste wijzigingen van GitHub
- Detecteert package.json changes
- Installeert nieuwe dependencies indien nodig
- Restart applicatie automatisch
- Stash uncommitted changes (met bevestiging)

### Status controleren
```bash
sudo ./awl-manager.sh status
```
Toont:
- PM2 proces status
- Proces details (uptime, memory, CPU)
- Port 3001 usage

### Logs bekijken
```bash
sudo ./awl-manager.sh logs
```
Real-time logs (Ctrl+C om te stoppen)

### Herstarten
```bash
sudo ./awl-manager.sh restart
```
- Checkt voor zombie processes op port 3001
- Killed oude processes indien nodig
- Restart applicatie

### Stoppen
```bash
sudo ./awl-manager.sh stop
```

### Starten
```bash
sudo ./awl-manager.sh start
```

### Herinstallatie
```bash
sudo ./awl-manager.sh install
```
⚠️ Verwijdert bestaande installatie (met bevestiging)

## 🔧 Configuratie

Script configuratie (bovenaan `awl-manager.sh`):
```bash
APP_DIR="/var/www/tools.superworker.be/html/awl"
APP_NAME="awl-scanner"
GIT_REPO="https://github.com/CS-Workx/awl.git"
NODE_VERSION="18"
```

## 📊 Output Kleuren

- 🔵 **Blauw (ℹ)**: Info berichten
- 🟢 **Groen (✓)**: Success berichten
- 🟡 **Geel (⚠)**: Waarschuwingen
- 🔴 **Rood (✗)**: Errors

## 🐛 Troubleshooting

### Port 3001 al in gebruik
```bash
sudo ./awl-manager.sh restart
```
Script killed automatisch zombie processes.

### Uncommitted changes tijdens update
Script detecteert dit en vraagt om changes te stashen:
```bash
Auto-stash before update 20260203_153045
```

### PM2 niet gevonden
Script installeert PM2 automatisch als root.

### Applicatie start niet
Check logs:
```bash
sudo ./awl-manager.sh logs
```

Controleer .env configuratie:
```bash
sudo cat /var/www/tools.superworker.be/html/awl/.env
```

## 🔄 Workflow voor Updates

### Dagelijkse updates
```bash
# 1. Check status
sudo ./awl-manager.sh status

# 2. Update
sudo ./awl-manager.sh update

# 3. Verify
sudo ./awl-manager.sh logs
```

### Emergency restart
```bash
sudo ./awl-manager.sh restart
```

### Na server reboot
PM2 start automatisch (via systemd). Check met:
```bash
sudo ./awl-manager.sh status
```

## 📁 Locaties

- **Applicatie**: `/var/www/tools.superworker.be/html/awl`
- **PM2 logs**: `/root/.pm2/logs/`
- **PM2 config**: `/root/.pm2/`
- **Data**: `/var/www/tools.superworker.be/html/awl/data/`

## 🔐 Beveiliging

- Script vereist root toegang
- .env file is NIET in Git (in .gitignore)
- Secrets worden nooit gelogd
- PM2 draait als root user

## 🆘 Support

Bij problemen:
1. Check logs: `sudo ./awl-manager.sh logs`
2. Check status: `sudo ./awl-manager.sh status`
3. Restart: `sudo ./awl-manager.sh restart`
4. Bekijk GitHub issues: https://github.com/CS-Workx/awl/issues

## 📚 Meer Info

- [README.md](README.md) - Applicatie documentatie
- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Deployment details
- [VPS_DEPLOYMENT_BRIEFING.md](VPS_DEPLOYMENT_BRIEFING.md) - VPS setup guide
