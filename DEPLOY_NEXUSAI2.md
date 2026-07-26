# 🚀 Deployment Instructions for nx.xus.me on AlmaLinux 10

Target Directory: `/opt/nexusai`  
Domain: `nx.xus.me`  
VPS IP: `173.249.63.112`  
PM2 Process: `nexusai2-backend`  
Nginx Config: `/etc/nginx/conf.d/nexusai2.conf`  

---

## ⚡ 1-Minute Quick Setup Commands on VPS

### Step 1: Extract Zip File to `/opt/nexusai`
```bash
sudo unzip NexusAI_Release.zip -d /opt/nexusai
cd /opt/nexusai
```

### Step 2: Install & Build Production Bundle
```bash
cd /opt/nexusai
npm install
npm run build
```

### Step 3: Start PM2 Process (`nexusai2-backend`)
```bash
cd /opt/nexusai
pm2 start server/index.js --name "nexusai2-backend"
pm2 save
```

### Step 4: Copy Nginx Config & Reload
```bash
sudo cp /opt/nexusai/nexusai2.conf /etc/nginx/conf.d/nexusai2.conf
sudo setsebool -P httpd_can_network_connect 1
sudo chcon -R -t httpd_sys_content_t /opt/nexusai/dist
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Secure with SSL (Certbot)
```bash
sudo certbot --nginx -d nx.xus.me
```

🎉 Access your application live at **https://nx.xus.me**!
