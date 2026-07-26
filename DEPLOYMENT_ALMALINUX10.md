# 🚀 Complete Deployment Guide: NexusAI on AlmaLinux 10 VPS

This comprehensive guide walks you through deploying **NexusAI** (with local Ollama LLM integration, Express SSE backend, and Nginx reverse proxy) on an **AlmaLinux 10** VPS server.

---

## 📋 Prerequisites & System Requirements

- **OS**: AlmaLinux 10 (x86_64 or aarch64)
- **RAM**: Minimum 4 GB (8 GB+ recommended for running 3B–7B Ollama models smoothly)
- **CPU**: 2+ Cores (4+ Cores recommended for faster LLM inference)
- **Root/Sudo Access**: Enabled
- **Domain Name**: Pointed to your VPS IP address (e.g., `nexus.yourdomain.com`)

---

## 🛠️ Step 1: System Update & Dependencies Setup

Login to your AlmaLinux 10 VPS via SSH and update package repositories:

```bash
sudo dnf update -y
sudo dnf install -y curl git wget tar gcc-c++ make firewalld
```

### 1.1 Install Node.js (v20+ LTS)
AlmaLinux 10 includes `dnf module` or NodeSource repositories:

```bash
# Install NodeSource Node.js 20.x repo
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Install Node.js & NPM
sudo dnf install -y nodejs

# Verify installation
node -v
npm -v
```

### 1.2 Install PM2 Process Manager
PM2 will keep your Express backend running 24/7 and automatically restart it on server reboot:

```bash
sudo npm install -g pm2
```

---

## 🤖 Step 2: Install & Configure Ollama

### 2.1 Install Ollama
Run the official single-line installation script:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2.2 Enable Systemd Service & Auto-Start
Ensure Ollama starts automatically on server boot:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ollama

# Verify status
sudo systemctl status ollama
```

### 2.3 Pull LLM Models
Pull your desired local models into Ollama:

```bash
# Lightweight fast model (1.5B parameters ~ 940 MB)
ollama pull qwen2.5:1.5b

# Specialized coding model (3B parameters ~ 1.8 GB)
ollama pull qwen-coding:latest

# Flagship general model (3.2B parameters ~ 2 GB)
ollama pull llama3.2:latest
```

Test Ollama inference locally:

```bash
curl -s http://localhost:11434/api/tags
```

---

## 📂 Step 3: Deploy NexusAI Codebase

### 3.1 Create Application Directory & Transfer Code
Create a deployment folder under `/var/www/NexusAI`:

```bash
sudo mkdir -p /var/www/NexusAI
sudo chown -R $USER:$USER /var/www/NexusAI
```

Transfer your NexusAI codebase into `/var/www/NexusAI` (via Git clone or SCP):

```bash
# Example if using Git repository:
git clone https://github.com/your-username/NexusAI.git /var/www/NexusAI
cd /var/www/NexusAI
```

### 3.2 Install NPM Packages & Build Production Assets
Run the installation and production build scripts:

```bash
cd /var/www/NexusAI

# Install production dependencies
npm install

# Build optimized Vite frontend bundle into dist/
npm run build
```

---

## ⚡ Step 4: Start Express Backend with PM2

### 4.1 Launch PM2 Backend Task
Start `server/index.js` under PM2:

```bash
cd /var/www/NexusAI

# Start backend server listening on http://localhost:3001
pm2 start server/index.js --name "nexusai-backend"

# Save PM2 process list
pm2 save

# Setup startup script for AlmaLinux systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER
```

Verify status:
```bash
pm2 status
pm2 logs nexusai-backend
```

---

## 🌐 Step 5: Install & Configure Nginx Web Server

Nginx will serve static production frontend assets from `dist/` and proxy `/api/` requests (including SSE streaming) to `http://localhost:3001`.

### 5.1 Install Nginx
```bash
sudo dnf install -y nginx
sudo systemctl enable --now nginx
```

### 5.2 Create Nginx Site Configuration
Create `/etc/nginx/conf.d/nexusai.conf`:

```bash
sudo nano /etc/nginx/conf.d/nexusai.conf
```

Paste the following production configuration:

```nginx
server {
    listen 80;
    server_name nexus.yourdomain.com; # Replace with your domain or VPS IP

    root /var/www/NexusAI/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend Single Page App Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API & High-Speed SSE Stream Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;

        # Disable buffering for real-time SSE streaming
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        chunked_transfer_encoding on;

        # Standard Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for long LLM generations
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
}
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Step 6: AlmaLinux 10 Firewall & SELinux Rules

AlmaLinux 10 uses **Firewalld** and **SELinux** by default. We must allow HTTP/HTTPS traffic and permit Nginx to make network connections to the Node backend.

### 6.1 Configure Firewalld
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 6.2 Configure SELinux Policy
Allow Nginx (httpd) to connect to backend proxy port 3001:

```bash
sudo setsebool -P httpd_can_network_connect 1
```

Set correct SELinux file context permissions for static web directory `/var/www/NexusAI/dist`:

```bash
sudo chcon -R -t httpd_sys_content_t /var/www/NexusAI/dist
```

---

## 📜 Step 7: Secure with Free SSL Certificate (Certbot)

Install Certbot to enable HTTPS:

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d nexus.yourdomain.com
```

Certbot will automatically update `/etc/nginx/conf.d/nexusai.conf` with SSL configuration and set up automatic 90-day renewal.

---

## ✅ Step 8: Verification & Health Checks

Verify all components are running smoothly:

1. **Check Nginx Status**:
   ```bash
   sudo systemctl status nginx
   ```
2. **Check PM2 Backend Status**:
   ```bash
   pm2 status
   ```
3. **Check Ollama Status**:
   ```bash
   ollama ps
   ```
4. **Test App in Browser**:
   Open `https://nexus.yourdomain.com` in your browser.

🎉 **Congratulations! Your NexusAI Studio is now fully deployed and running natively on AlmaLinux 10 VPS!**
