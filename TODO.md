z# TODO: Implementasi Sistem Manajemen Stok Produk

## 1. Update Entity Produk
- [ ] Tambahkan field `stok` (nullable int) ke Produk entity
- [ ] Update CreateProdukDto untuk menangani stok (optional jika ada varian)
- [ ] Update UpdateProdukDto untuk menangani stok

## 2. Update ProdukService
- [ ] Update create() method: validasi stok berdasarkan ada/tidaknya varian
- [ ] Tambahkan method getStokTotal(produkId: string) untuk menghitung stok
- [ ] Update findAll() dan findOne() untuk include stok total
- [ ] Update logic transaksi untuk mengurangi stok dari produk induk jika tidak ada varian

## 3. Update DTOs
- [ ] Update ProdukDto untuk menampilkan stok total (bukan dari varian individual)
- [ ] Update CreateProdukVarianDto jika perlu

## 4. Update Transaksi Logic
- [ ] Update PesananService.updateStatus() untuk mengurangi stok produk induk jika tidak ada varian
- [ ] Update PembayaranService.reduceStockForOrder() untuk mengurangi stok produk induk jika tidak ada varian

## 5. Update Keranjang Logic
- [ ] Update KeranjangService untuk validasi stok saat add/update item

## 6. Testing
- [ ] Test create produk tanpa varian (harus ada stok)
- [ ] Test create produk dengan varian (stok = null)
- [ ] Test transaksi produk tanpa varian
- [ ] Test transaksi produk dengan varian
- [ ] Test tampilan stok di response API
