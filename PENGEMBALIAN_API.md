# API Pengembalian Produk

Sistem pengembalian dengan approval flow yang mengharuskan admin/petugas untuk approve atau reject sebelum perubahan status pesanan.

## Endpoints

### 1. Customer - Ajukan Pengembalian
**POST** `/pengembalian`
- **Role**: Customer
- **Body**:
```json
{
  "pesanan_id": "uuid",
  "alasan": "rusak" | "salah varian" | "tidak sesuai" | "lainnya",
  "keterangan": "string (optional)",
  "bukti_foto": "string (URL atau path file)"
}
```
- **Response**: Data pengembalian dengan status "pending"

### 2. Customer - Lihat Pengembalian Milik User
**GET** `/pengembalian/user`
- **Role**: Customer
- **Response**: Array pengembalian milik user yang login

### 3. Admin/Petugas - Lihat Semua Pengembalian
**GET** `/pengembalian`
- **Role**: Admin, Petugas
- **Response**: Array semua pengembalian

### 4. Lihat Detail Pengembalian
**GET** `/pengembalian/:id`
- **Role**: Admin, Petugas, Customer
- **Response**: Detail pengembalian

### 5. Admin/Petugas - Approve Pengembalian
**PUT** `/pengembalian/:id/approve`
- **Role**: Admin, Petugas
- **Body**:
```json
{
  "catatan_admin": "string (optional)"
}
```
- **Efek**:
  - Status pengembalian → "approved"
  - Status pesanan → "dikembalikan"
  - Status pembayaran → "dikembalikan"
  - Jika alasan "rusak": Produk masuk ke tabel produk_rusak
  - Jika alasan "salah varian": Stok dikembalikan ke produk/varian

### 6. Admin/Petugas - Reject Pengembalian
**PUT** `/pengembalian/:id/reject`
- **Role**: Admin, Petugas
- **Body**:
```json
{
  "catatan_admin": "string (optional)"
}
```
- **Efek**:
  - Status pengembalian → "rejected"
  - Status pesanan tetap "selesai"
  - Status pembayaran tetap "sudah bayar"

### 7. Admin - Update Pengembalian
**PUT** `/pengembalian/:id`
- **Role**: Admin
- **Body**:
```json
{
  "status": "pending" | "approved" | "rejected" (optional),
  "catatan_admin": "string (optional)"
}
```

### 8. Admin - Delete Pengembalian
**DELETE** `/pengembalian/:id`
- **Role**: Admin

### 9. Admin/Petugas - Lihat Semua Produk Rusak
**GET** `/pengembalian/produk-rusak/all`
- **Role**: Admin, Petugas
- **Response**: Array semua produk rusak

### 10. Admin/Petugas - Lihat Produk Rusak by Pengembalian
**GET** `/pengembalian/produk-rusak/:pengembalianId`
- **Role**: Admin, Petugas
- **Response**: Array produk rusak untuk pengembalian tertentu

## Flow Pengembalian

### Customer
1. Customer mengajukan pengembalian (POST /pengembalian)
2. Upload bukti foto
3. Pilih alasan: rusak, salah varian, tidak sesuai, atau lainnya
4. Menunggu approval dari admin/petugas

### Admin/Petugas
1. Melihat daftar pengembalian pending (GET /pengembalian)
2. Review detail pengembalian termasuk bukti foto
3. **Approve**: Status pesanan dan pembayaran diubah, stok dikembalikan atau masuk produk rusak
4. **Reject**: Status pesanan dan pembayaran tetap, tidak ada perubahan stok

## Tabel Database

### Tabel: pengembalian
- id (uuid)
- pesanan_id (uuid)
- user_id (uuid)
- alasan (enum: rusak, salah varian, tidak sesuai, lainnya)
- keterangan (text, nullable)
- bukti_foto (text)
- status (enum: pending, approved, rejected)
- catatan_admin (text, nullable)
- processed_by (uuid, nullable)
- processed_at (timestamp, nullable)
- created_at (timestamp)
- updated_at (timestamp)

### Tabel: produk_rusak
- id (uuid)
- pengembalian_id (uuid)
- produk_id (uuid)
- produk_varian_id (uuid, nullable)
- jumlah (int)
- deskripsi_kerusakan (text, nullable)
- created_at (timestamp)

## Validasi
- Pengembalian hanya bisa diajukan untuk pesanan dengan status "dikirim" atau "selesai"
- Hanya pemilik pesanan yang bisa mengajukan pengembalian
- Pengembalian yang sudah diproses (approved/rejected) tidak bisa diproses ulang
- Tidak bisa ada 2 pengembalian pending untuk 1 pesanan
