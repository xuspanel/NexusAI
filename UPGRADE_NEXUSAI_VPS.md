# 🚀 NexusAI Production VPS Upgrade Guide (AlmaLinux 10 / nx.xus.me)

> **Target VPS IP**: `173.249.63.112`  
> **Domain**: `nx.xus.me`  
> **VPS Target Directory**: `/opt/nexusai`  
> **Nginx Config Path**: `/etc/nginx/conf.d/nexusai2.conf`  
> **PM2 Process Name**: `nexusai2-backend`  

---

## 📋 STEP 1: Upload the Release Zip to your VPS

From your local terminal (or using SCP/SFTP), upload **`NexusAI_Release.zip`** to your VPS:

```bash
scp /home/ahmed_alsaleh/Dev/NexusAI/NexusAI_Release.zip root@173.249.63.112:/opt/
```

---

## 📋 STEP 2: SSH into VPS & Extract Release

Connect to your VPS:
```bash
ssh root@173.249.63.112
```

Stop the running PM2 process (if existing) and extract the updated release into `/opt/nexusai`:

```bash
# 1. Create directory if not existing
mkdir -p /opt/nexusai

# 2. Extract release into /opt/nexusai
unzip -o /opt/NexusAI_Release.zip -d /opt/nexusai/

# 3. Enter project folder
cd /opt/nexusai

# 4. Install production dependencies
npm install --production
```

---

## 📋 STEP 3: Configure PM2 Backend Process (`nexusai2-backend`)

Ensure PM2 is managing the Node.js Express backend server on port `3001`:

```bash
# Delete old PM2 instance if present
pm2 delete nexusai2-backend || true

# Start the new backend server under PM2 process name "nexusai2-backend"
pm2 start server/index.js --name "nexusai2-backend" --env production

# Save PM2 state to start on system boot
pm2 save
pm2 startup
```

---

## 📋 STEP 4: Configure Nginx (`/etc/nginx/conf.d/nexusai2.conf`)

Copy the included Nginx config file:

```bash
cp /opt/nexusai/nexusai2.conf /etc/nginx/conf.d/nexusai2.conf
```

Test and reload Nginx:
```bash
# Verify Nginx syntax
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## 📋 STEP 5: SELinux & Firewall Permissions (AlmaLinux 10 Specific)

On AlmaLinux 10 / RHEL 10, enable network connection rights for Nginx reverse proxying:

```bash
# Allow Nginx to proxy HTTP to Node.js backend port 3001
setsebool -P httpd_can_network_connect 1

# Open HTTP (80) and HTTPS (443) ports in firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

---

## 📋 STEP 6: Enable HTTPS SSL Certificate with Certbot

Secure your domain **`nx.xus.me`** with free SSL:

```bash
certbot --nginx -d nx.xus.me --non-interactive --agree-tos -m admin@xus.me
```

---

## 📋 STEP 7: Verify System Health

Run health checks on your VPS:

```bash
# 1. Check PM2 status
pm2 status nexusai2-backend

# 2. Test Ollama connectivity on localhost
curl -s http://localhost:11434/api/tags

# 3. Test Express API status
curl -s http://localhost:3001/api/tools/status
```

Access your app in the browser: **https://nx.xus.me** 🎉
