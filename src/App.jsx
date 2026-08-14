import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const nomorMejaAktif = searchParams.get('meja') || "1";

  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  // Ambil data menu dari Backend (port 5001)
  useEffect(() => {
    fetch('https://pempek-backend.vercel.app/api/menu')
      .then((res) => res.json())
      .then((data) => setMenus(data))
      .catch((err) => console.error("Aduh, gagal ngambil data:", err));
  }, []);

  const tambahKeKeranjang = (menu) => {
    const itemAda = cart.find((item) => item.id === menu.id);

    if(itemAda) {
      setCart(
        cart.map((item) => item.id === menu.id ? { ...item, jumlah: item.jumlah + 1} : item)
      );
    } else {
      setCart([...cart, { ...menu, jumlah : 1}]);
    }
  };

  const kurangDariKeranjang = (menuId) => {
    const itemAda = cart.find((item) => item.id === menuId);
    if(itemAda.jumlah === 1) {
      setCart(cart.filter((item) => item.id !== menuId));
    } else {
      setCart(cart.map((item) => item.id === menuId ? { ...item, jumlah: item.jumlah - 1 } : item)
      )
    }
  };

  const kirimPesanan = () => {
    // Untuk simulasi, kita tentukan dulu ini pesanan dari Meja 3

    fetch('https://pempek-backend.vercel.app/api/pesanan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Memberitahu server kalau kita ngirim data format JSON
      },
      body: JSON.stringify({
        nomor_meja: nomorMejaAktif,
        items: cart, // Kirim seluruh array keranjang ([{id: 2, jumlah: 5}, ...])
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(`🎉 Pesanan Berhasil Masuk ke Dapur! (ID Transaksi: #${data.pesananId})`);
          setCart([]); // Kosongkan kembali keranjang belanjaan
        }
      })
      .catch((err) => console.error("Gagal kirim pesanan:", err));
  };

  const totalHarga = cart.reduce((total, item) => total + item.harga * item.jumlah, 0);
  // Fungsi untuk mengubah angka jadi format Rp (contoh: 17500 -> Rp 17.500,00)
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR' 
    }).format(angka);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', paddingBottom: '120px' }}>
      <h1 style={{ textAlign: 'center', color: '#d35400' }}>KING PEMPEK</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontWeight: 'bold' }}>
        Silakan pilih menu pesanan Anda (Nomor Meja: {nomorMejaAktif})
      </p>
      
      {/* DAFTAR MENU */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {menus.map((menu) => {
          // Cek berapa jumlah item ini yang ada di keranjang saat ini
          const itemDiCart = cart.find((item) => item.id === menu.id);
          const jumlah = itemDiCart ? itemDiCart.jumlah : 0;

          return (
            <div 
              key={menu.id} 
              style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '10px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{menu.nama}</h3>
                <span style={{ 
                  backgroundColor: menu.kategori === 'Makanan' ? '#ffeaa7' : '#81ecec', 
                  padding: '3px 8px', 
                  borderRadius: '5px', 
                  fontSize: '12px',
                  color: '#333'
                }}>
                  {menu.kategori}
                </span>
                <div style={{ fontWeight: 'bold', color: '#d35400', marginTop: '5px' }}>
                  {formatRupiah(menu.harga)}
                </div>
              </div>

              {/* TOMBOL AKSI (+ / -) */}
              <div>
                {jumlah === 0 ? (
                  // Kalau belum dipilih, tampilkan tombol "+ Tambah"
                  <button 
                    onClick={() => tambahKeKeranjang(menu)}
                    style={{
                      backgroundColor: '#e67e22',
                      color: 'white',
                      border: 'none',
                      padding: '8px 15px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    + Tambah
                  </button>
                ) : (
                  // Kalau sudah dipilih, tampilkan kontrol [-] [jumlah] [+]
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button 
                      onClick={() => kurangDariKeranjang(menu.id)}
                      style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 'bold' }}>{jumlah}</span>
                    <button 
                      onClick={() => tambahKeKeranjang(menu)}
                      style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 💡 KONSEP 5: KERANJANG MELAYANG DI BAWAH (Hanya muncul jika ada isi keranjang) */}
      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '560px',
          backgroundColor: '#2c3e50',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          <div>
            <div style={{ fontSize: '12px', opacity: '0.8' }}>
              {cart.reduce((sum, item) => sum + item.jumlah, 0)} Item Dipilih
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {formatRupiah(totalHarga)}
            </div>
          </div>

          <button 
          onClick={kirimPesanan}
          style={{
            backgroundColor: '#e67e22',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          >
            Pesan Sekarang 🚀
          </button>
        </div>
      )}
    </div>
  );
}

export default App;