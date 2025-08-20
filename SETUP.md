# Setup Guide - Sportzone Backend

## Prerequisites

1. **Node.js** (v16 atau lebih baru)
2. **PostgreSQL** (v12 atau lebih baru)
3. **npm** atau **yarn**

## Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd be-sportzone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Database**
   - Install PostgreSQL
   - Create database: `sportzone_db`
   - Create user: `postgres` dengan password: `postgres`
   - Atau sesuaikan konfigurasi di `config.env`

4. **Environment Configuration**
   - Copy `config.env` ke `.env` (jika menggunakan dotenv)
   - Atau gunakan file `config.env` yang sudah ada
   - Sesuaikan konfigurasi database sesuai setup PostgreSQL Anda

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start
```

### Using Batch File (Windows)
```bash
start.bat
```

## Database Configuration

Default database settings:
- **Host**: localhost
- **Port**: 5432
- **Database**: sportzone_db
- **Username**: postgres
- **Password**: postgres

## API Endpoints

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register user

### Users
- `GET /users` - Get all users
- `POST /users` - Create user
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Kategori Olahraga
- `GET /kategori-olahraga` - Get all categories
- `POST /kategori-olahraga` - Create category
- `GET /kategori-olahraga/:id` - Get category by ID
- `PATCH /kategori-olahraga/:id` - Update category
- `DELETE /kategori-olahraga/:id` - Delete category

### Subkategori Peralatan
- `GET /subkategori-peralatan` - Get all equipment subcategories
- `POST /subkategori-peralatan` - Create equipment subcategory
- `GET /subkategori-peralatan/:id` - Get equipment subcategory by ID
- `PATCH /subkategori-peralatan/:id` - Update equipment subcategory
- `DELETE /subkategori-peralatan/:id` - Delete equipment subcategory

## Troubleshooting

### Database Connection Error
- Pastikan PostgreSQL berjalan
- Cek username dan password
- Pastikan database `sportzone_db` sudah dibuat
- Cek firewall dan port 5432

### Port Already in Use
- Cek apakah ada aplikasi lain yang menggunakan port 3000
- Ganti port di `config.env` atau `.env`

### Build Errors
- Pastikan semua dependencies terinstall: `npm install`
- Cek TypeScript version compatibility
- Run: `npm run build` untuk melihat error detail

## Development

### Project Structure
```
src/
├── auth/           # Authentication module
├── users/          # Users management
├── roles/          # Role management
├── kategori-olahraga/      # Sports categories
├── subkategori-peralatan/  # Equipment subcategories
├── petugas/        # Staff management
└── config/         # Configuration files
```

### Adding New Modules
1. Create entity
2. Create DTOs
3. Create service
4. Create controller
5. Add to module
6. Update app.module.ts

## Support

Jika ada masalah, cek:
1. Log aplikasi untuk error detail
2. Database connection
3. Environment variables
4. Dependencies versions
