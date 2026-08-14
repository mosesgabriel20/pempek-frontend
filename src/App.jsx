import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const nomorMejaAktif = searchParams.get('meja') || "1";

  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kategoriAktif, setKategoriAktif] = useState('Semua');

  // Ambil data menu dari Backend
  useEffect(() => {
    fetch('https://pempek-backend.vercel.app/api/menu')
      .then((res) => res.json())
      .then((data) => {
        setMenus(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal ngambil data:", err);
        setLoading(false);
      });
  }, []);

  // 📸 FUNGSI FOTO SEMENTARA
  // Nanti kalau di backend sudah ada kolom 'image_url', kita bisa langsung pakai data dari sana.
  const getMenuImage = (nama) => {
    const text = encodeURIComponent(nama);
    // Ini bikin gambar otomatis berisi nama menu dengan warna tema aplikasi
    return `https://placehold.co/400x300/FFF3E0/FF6B35?text=${text}`;
  };

  const tambahKeKeranjang = (menu) => {
    const itemAda = cart.find((item) => item.id === menu.id);
    if (itemAda) {
      setCart(cart.map((item) => item.id === menu.id ? { ...item, jumlah: item.jumlah + 1 } : item));
    } else {
      setCart([...cart, { ...menu, jumlah: 1 }]);
    }
  };

  const kurangDariKeranjang = (menuId) => {
    const itemAda = cart.find((item) => item.id === menuId);
    if (itemAda.jumlah === 1) {
      setCart(cart.filter((item) => item.id !== menuId));
    } else {
      setCart(cart.map((item) => item.id === menuId ? { ...item, jumlah: item.jumlah - 1 } : item));
    }
  };

  const kirimPesanan = () => {
    fetch('https://pempek-backend.vercel.app/api/pesanan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nomor_meja: nomorMejaAktif,
        items: cart,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert(`🎉 Pesanan Berhasil Ditransmisikan ke Dapur! (ID: #${data.pesananId})`);
          setCart([]);
        }
      })
      .catch((err) => console.error("Gagal kirim pesanan:", err));
  };

  const totalHarga = cart.reduce((total, item) => total + item.harga * item.jumlah, 0);
  const totalItemCount = cart.reduce((sum, item) => sum + item.jumlah, 0);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(angka);
  };

  const menuFiltered = kategoriAktif === 'Semua' 
    ? menus 
    : menus.filter(m => m.kategori.toLowerCase() === kategoriAktif.toLowerCase());

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F9FA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: '130px'
    }}>
      {/* 👑 HEADER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B35 0%, #D84315 100%)',
        color: 'white',
        padding: '30px 20px 25px 20px',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        boxShadow: '0 8px 20px rgba(216, 67, 21, 0.25)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ fontSize: '13px', letterSpacing: '2px', fontWeight: 'bold', opacity: 0.9, textTransform: 'uppercase' }}>
          Welcome To
        </div>
        <h1 style={{ margin: '5px 0', fontSize: '28px', fontWeight: '800', letterSpacing: '0.5px' }}>
          👑 KING PEMPEK
        </h1>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(5px)',
          padding: '6px 16px',
          borderRadius: '20px',
          marginTop: '8px',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <span style={{ height: '8px', width: '8px', backgroundColor: '#00E676', borderRadius: '50%', display: 'inline-block' }}></span>
          Meja Nomor #{nomorMejaAktif}
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* 🗂️ FILTER KATEGORI */}
        <div style={{
          display: 'flex',
          gap: '10px',
          margin: '24px 0',
          justifyContent: 'center'
        }}>
          {['Semua', 'Makanan', 'Minuman'].map((kat) => (
            <button
              key={kat}
              onClick={() => setKategoriAktif(kat)}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                border: 'none',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: kategoriAktif === kat ? '#FF6B35' : '#E0E0E0',
                color: kategoriAktif === kat ? 'white' : '#555',
                boxShadow: kategoriAktif === kat ? '0 4px 10px rgba(255,107,53,0.3)' : 'none'
              }}
            >
              {kat}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>⏳</div>
            <div>Menyiapkan Menu Lezat...</div>
          </div>
        )}

        {/* 📸 DAFTAR MENU CARDS DENGAN FOTO & GRID EVENLY */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', /* Fix 2 Kolom */
          gap: '16px', /* Jarak merata (Space Evenly) antar box */
          alignContent: 'space-evenly'
        }}>
          {!loading && menuFiltered.map((menu) => {
            const itemDiCart = cart.find((item) => item.id === menu.id);
            const jumlah = itemDiCart ? itemDiCart.jumlah : 0;

            return (
              <div
                key={menu.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden', /* Penting! Supaya foto melengkung ikutin border card */
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #F0F0F0'
                }}
              >
                {/* 🖼️ AREA FOTO MAKANAN */}
                <div style={{ width: '100%', height: '130px', backgroundColor: '#EEE' }}>
                  <img 
                    src={menu.image_url || getMenuImage(menu.nama)} 
                    alt={menu.nama}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover' /* Biar fotonya ga gepeng, otomatis nge-crop cantik */
                    }}
                  />
                </div>

                {/* 📝 AREA TEKS & TOMBOL (Bawah Foto) */}
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#2C3E50', lineHeight: '1.3' }}>
                      {menu.nama}
                    </h3>
                    <div style={{ fontWeight: '800', color: '#FF6B35', fontSize: '14px' }}>
                      {formatRupiah(menu.harga)}
                    </div>
                  </div>

                  {/* TOMBOL TAMBAH / CONTROL */}
                  <div style={{ width: '100%' }}>
                    {jumlah === 0 ? (
                      <button
                        onClick={() => tambahKeKeranjang(menu)}
                        style={{
                          width: '100%',
                          backgroundColor: '#FF6B35',
                          color: 'white',
                          border: 'none',
                          padding: '8px 0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '13px',
                          boxShadow: '0 3px 8px rgba(255,107,53,0.25)'
                        }}
                      >
                        + Tambah
                      </button>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#F5F5F5',
                        padding: '4px',
                        borderRadius: '8px'
                      }}>
                        <button
                          onClick={() => kurangDariKeranjang(menu.id)}
                          style={{
                            backgroundColor: '#FF5252',
                            color: 'white',
                            border: 'none',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontSize: '14px'
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: '700', fontSize: '14px' }}>
                          {jumlah}
                        </span>
                        <button
                          onClick={() => tambahKeKeranjang(menu)}
                          style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontSize: '14px'
                          }}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🛒 FLOATING CART BOTTOM BAR (TETAP SAMA) */}
      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '460px',
          backgroundColor: '#1E293B',
          color: 'white',
          padding: '12px 18px',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          zIndex: 1000
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>
              {totalItemCount} Item Terpilih
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#00E676' }}>
              {formatRupiah(totalHarga)}
            </div>
          </div>

          <button
            onClick={kirimPesanan}
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #F4511E 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 22px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)'
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