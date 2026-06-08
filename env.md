# Production Environment Configuration

> Copy this to `.env` on the production server and fill in your values.

```env
APP_NAME=GymReg
APP_ENV=production
APP_KEY=base64:your-generated-key-here
APP_DEBUG=false
APP_URL=https://your-domain.com

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

# ── MySQL Database ──────────────────────────────────
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gym_db
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
# Uncomment if using SSL:
# DB_CHARSET=utf8mb4
# DB_COLLATION=utf8mb4_unicode_ci

# ── Session ─────────────────────────────────────────
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=.your-domain.com
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

# ── Cache & Queue ───────────────────────────────────
CACHE_STORE=database
QUEUE_CONNECTION=database

# ── Mail ────────────────────────────────────────────
MAIL_MAILER=smtp
MAIL_HOST=smtp.your-provider.com
MAIL_PORT=587
MAIL_USERNAME=your-smtp-username
MAIL_PASSWORD=your-smtp-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@your-domain.com"
MAIL_FROM_NAME="${APP_NAME}"

# ── Optional: AWS S3 (if using file uploads) ────────
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_DEFAULT_REGION=us-east-1
# AWS_BUCKET=
# AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"
```

---

## Setup Steps

### 1. Create the MySQL database

```sql
CREATE DATABASE gym_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gym_user'@'localhost' IDENTIFIED BY 'strong-password-here';
GRANT ALL PRIVILEGES ON gym_db.* TO 'gym_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Generate APP_KEY

```bash
php artisan key:generate
```

### 3. Import the schema + seed data

```bash
# If using my_project_backup.sql (MariaDB dump):
mysql -u gym_user -p gym_db < my_project_backup.sql

# Or run fresh migrations + seeder:
php artisan migrate --force
php artisan db:seed --force
```

### 4. Optimize for production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### 5. Directory permissions

```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

## Verify

| Check | Command |
|-------|---------|
| `APP_ENV` is `production` | `php artisan tinker --execute="echo config('app.env');"` |
| `APP_DEBUG` is `false` | `php artisan tinker --execute="var_dump(config('app.debug'));"` |
| `APP_KEY` is set | `php artisan tinker --execute="echo config('app.key');"` |
| MySQL connected | `php artisan tinker --execute="echo DB::connection()->getDatabaseName();"` |
| Config is cached | `php artisan config:show app` |
