# AWL Scanner - Vercel Deployment Guide

## ✅ Voorbereiding Compleet

De applicatie is klaar voor deployment naar Vercel. Hier zijn de stappen:

---

## 🚀 Stap 1: Push naar GitHub

### Optie A: Met GitHub CLI (aanbevolen)

```bash
cd "/Users/steffvanhaverbeke/Library/CloudStorage/GoogleDrive-accounts@coachsteff.live/My Drive/7 - Dev/1_projects/tools/awl"

# Maak private repo aan en push
gh repo create cs-workx/awl-scanner --private --source=. --remote=origin --push
```

### Optie B: Manueel via GitHub Web

1. Ga naar https://github.com/new
2. Repository name: `awl-scanner`
3. Visibility: **Private**
4. **Maak GEEN** README, .gitignore of license aan (die bestaan al)
5. Click **Create repository**
6. Volg de instructies onder "push an existing repository":

```bash
cd "/Users/steffvanhaverbeke/Library/CloudStorage/GoogleDrive-accounts@coachsteff.live/My Drive/7 - Dev/1_projects/tools/awl"

git remote add origin https://github.com/cs-workx/awl-scanner.git
git branch -M main
git push -u origin main
```

---

## 🌐 Stap 2: Deploy naar Vercel

### Via Vercel Dashboard (Eenvoudigst)

1. **Login**: Ga naar https://vercel.com/login en log in met je account

2. **Import Project**:
   - Click **Add New...** → **Project**
   - Click **Import Git Repository**
   - Selecteer **GitHub** als bron
   - Zoek en selecteer `cs-workx/awl-scanner`

3. **Configure Project**:
   - **Project Name**: `awl-scanner` (of kies eigen naam)
   - **Framework Preset**: Selecteer **Other**
   - **Root Directory**: Laat leeg (of selecteer `./` als gevraagd)
   - **Build Command**: Laat leeg of vul in: `echo "No build needed"`
   - **Output Directory**: Laat leeg
   - **Install Command**: `npm install`

4. **Environment Variables**: Click **Environment Variables** en voeg toe:

   ```
   GEMINI_API_KEY = [jouw Gemini API key]
   MICROSOFT_CLIENT_ID = [jouw Azure Client ID]
   MICROSOFT_CLIENT_SECRET = [jouw Azure Client Secret]
   MICROSOFT_TENANT_ID = [jouw Azure Tenant ID]
   SENDER_EMAIL = steff@thehouseofcoaching.com
   SENDER_NAME = Steff - The House of Coaching
   ```

   **Let op**: Kopieer deze waarden uit je lokale `.env` bestand!

5. **Deploy**: Click **Deploy**

6. **Wacht**: Deployment duurt ~2-3 minuten

7. **Klaar!**: Je krijgt een URL zoals `https://awl-scanner-xxx.vercel.app`

---

### Via Vercel CLI (Geavanceerd)

```bash
# Installeer Vercel CLI (eenmalig)
npm install -g vercel

# Login
vercel login

# Deploy (vanuit awl directory)
cd "/Users/steffvanhaverbeke/Library/CloudStorage/GoogleDrive-accounts@coachsteff.live/My Drive/7 - Dev/1_projects/tools/awl"
vercel

# Volg de prompts:
# - Set up and deploy? Yes
# - Which scope? Selecteer je team/account
# - Link to existing project? No
# - Project name? awl-scanner
# - Directory? ./
# - Override settings? No

# Deploy naar productie
vercel --prod
```

Na deployment:

```bash
# Configureer environment variables
vercel env add GEMINI_API_KEY production
vercel env add MICROSOFT_CLIENT_ID production
vercel env add MICROSOFT_CLIENT_SECRET production
vercel env add MICROSOFT_TENANT_ID production
vercel env add SENDER_EMAIL production
vercel env add SENDER_NAME production

# Redeploy met nieuwe env vars
vercel --prod
```

---

## 🧪 Stap 3: Test de Deployment

1. **Open de URL** die Vercel je geeft (bijv. `https://awl-scanner.vercel.app`)

2. **Test functionaliteit**:
   - ✅ Website laadt correct
   - ✅ Upload 1 foto → Verwerk met AI → Succesvol
   - ✅ Upload 2-3 foto's → Verwerk → Succesvol
   - ✅ Email verzending werkt
   - ✅ PWA installatie werkt op mobiel

3. **Check Vercel Dashboard**:
   - Ga naar https://vercel.com/dashboard
   - Selecteer je project `awl-scanner`
   - Check **Deployments** → Status "Ready" (groen)
   - Check **Functions** → Logs voor errors

---

## ⚠️ Belangrijke Aandachtspunten

### 1. Timeout Limitaties (Vercel Free)

- **Maximum function execution**: 60 seconden
- **Aanbeveling**: Upload max 3 foto's per keer
- **Bij > 3 foto's**: Risico op timeout (504 error)
- **Oplossing**: Verwerk in meerdere batches van 3 foto's

### 2. Cold Starts

- Eerste request na inactiviteit kan ~5-10s duren
- Dit is normaal voor serverless functions
- Volgende requests zijn sneller

### 3. Function Logs

Bekijk real-time logs:
- Vercel Dashboard → je project → **Functions**
- Filter op `/api/scan` of `/api/send`
- Kijk naar errors voor debugging

### 4. Rate Limits (Vercel Free)

- **100 requests per dag** (reset dagelijks)
- Voor meer requests: upgrade naar Pro ($20/maand)

---

## 🔧 Troubleshooting

### Issue: "Module not found" error

**Oorzaak**: Dependencies niet geïnstalleerd

**Oplossing**:
1. Check `package.json` bevat alle dependencies
2. Vercel Dashboard → Settings → General → **Redeploy**

### Issue: 504 Gateway Timeout

**Oorzaak**: Processing duurt > 60s (waarschijnlijk > 3 images)

**Oplossing**:
1. Limiteer tot max 3 foto's per batch
2. Of upgrade naar Vercel Pro ($20/maand)

### Issue: "Email service niet beschikbaar"

**Oorzaak**: Microsoft Graph API credentials ontbreken

**Oplossing**:
1. Vercel Dashboard → Settings → **Environment Variables**
2. Check dat alle `MICROSOFT_*` variabelen aanwezig zijn
3. **Redeploy** na toevoegen env vars

### Issue: CORS errors

**Oorzaak**: Vercel routing configuratie

**Oplossing**: Check `vercel.json` is correct gecommit naar Git

### Issue: 401 Unauthorized (Microsoft Graph)

**Oorzaak**: Verkeerde Azure AD credentials

**Oplossing**:
1. Verifieer credentials in Azure Portal
2. Update env vars in Vercel Dashboard
3. Check dat `MICROSOFT_TENANT_ID` correct is

---

## 📊 Monitoring & Analytics

### Vercel Dashboard

- **Deployments**: Geschiedenis van deployments
- **Functions**: Real-time execution logs
- **Analytics** (Pro): Traffic en performance metrics

### Check Health

```bash
# Test API endpoint
curl https://awl-scanner.vercel.app/api/health

# Expected response (if health endpoint added)
# {"status": "ok"}
```

---

## 🔄 Updates Deployen

Na code wijzigingen:

```bash
cd "/Users/steffvanhaverbeke/Library/CloudStorage/GoogleDrive-accounts@coachsteff.live/My Drive/7 - Dev/1_projects/tools/awl"

# Commit changes
git add -A
git commit -m "Jouw wijzigingen"
git push

# Vercel deployed automatisch bij push naar main branch!
```

Of via CLI:

```bash
vercel --prod
```

---

## 🌟 Optionele Verbeteringen

### Custom Domain

1. Vercel Dashboard → je project → **Settings** → **Domains**
2. Click **Add Domain**
3. Voer in: `awl.thehouseofcoaching.com`
4. Volg DNS instructies
5. Wacht ~5-10 minuten voor propagatie

### PWA Icons

De app is al een PWA! Op mobiel:
- iOS Safari: Share → Add to Home Screen
- Android Chrome: Menu → Install App

### Analytics (Pro feature)

- Vercel Dashboard → Analytics → Enable
- Track pageviews, function invocations, errors

---

## 📝 Deployment Checklist

Voordat je deploy:

- [x] Git repository aangemaakt
- [x] Code gecommit naar Git
- [x] `.gitignore` bevat `.env` (secrets niet in Git!)
- [x] `vercel.json` configuratie correct
- [x] API wrapper (`api/index.js`) aanwezig
- [x] Frontend warning voor 3-image limit
- [ ] GitHub repository aangemaakt en pushed
- [ ] Vercel project aangemaakt
- [ ] Environment variables ingesteld in Vercel
- [ ] Eerste deployment succesvol
- [ ] Website bereikbaar via Vercel URL
- [ ] Upload + process foto's getest
- [ ] Email verzending getest

---

## 🆘 Hulp Nodig?

**Vercel Documentation**: https://vercel.com/docs
**Vercel Support**: https://vercel.com/support
**GitHub CLI**: https://cli.github.com/

---

**Veel succes met de deployment! 🚀**
