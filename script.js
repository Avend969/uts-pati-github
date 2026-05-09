// ---------- STORAGE (tanpa database) ----------
let pendaftarList = [];     // array of objects

// Fungsi untuk menghasilkan kode pendaftaran sesuai contoh: A2-101-9
// Aturan: 
// - Gedung: A (jika jumlah pendaftar genap? tapi supaya konsisten kita pakai: berdasarkan huruf awal Nama? 
//   namun soal menyediakan "Gedung A" / "Gedung B" pada kolom tabel Gedung. Agar dinamis dan menarik:
//   Gedung diambil dari huruf pertama nama (vokal/konsonan) atau sesederhana: jika ID pendaftar %2 ==0 -> Gedung A, else Gedung B?
//   Tapi untuk memenuhi tampilan yang fleksibel, kita definisikan: jika nilai matematika >=70 => Gedung A, else Gedung B.
//   Juga bisa berdasarkan pilihan? Tapi karena tidak ada pilihan gedung, biar konsisten dan menarik.
//   Kode contoh: A2-101-9 -> [Gedung][AngkaUnik 2 digit?] - [3 digit urut] - [bulan tes]
//   Implementasi: 
//   - Gedung huruf awal : 'A' atau 'B' sesuai aturan internal (misal nilai rata2 >70 => A else B)
//   - Karakter kedua (angka setelah gedung) = angka jabawan (1-9) -> diambil dari jumlah karakter nama modulo 9 +1
//   - 3 digit unik: nomor urut pendaftar (1..999)
//   - terakhir = bulan saat pendaftaran (tanggal hari ini / jika ingin dari tgl lahir, lebih logis: bulan tes = bulan saat input)
//   lebih intuitif: bulan tes = bulan sekarang (new Date()). karena tidak ada field bulan ujian, kita pakai bulan sistem.

function generateKodePendaftaran(indexNumber, nilaiRata, namaPendaftar) {
  // Gedung: berdasarkan nilai rata-rata (simulasi) jika >=70 => Gedung A, else Gedung B
  const gedung = (nilaiRata >= 70) ? 'A' : 'B';
  // Karakter angka kedua (acak tapi stabil) berdasarkan panjang nama (1-9)
  let charNum = (namaPendaftar.length % 9) + 1;  // 1..9
  // 3 digit urut (index+1) dengan padding
  const urutTigaDigit = String(indexNumber + 1).padStart(3, '0');
  // Bulan tes: bulan saat ini (1-12)
  const now = new Date();
  let bulanTes = now.getMonth() + 1;  // 1-12
  // membentuk: A2-101-9 , contoh: Gedung+charNum + "-" + urut + "-" + bulanTes
  const kode = `${gedung}${charNum}-${urutTigaDigit}-${bulanTes}`;
  return { kode, gedung, bulan: bulanTes };
}

// hitung rata-rata dan status kelulusan
function hitungStatus(mtk, inggris, umum) {
  const rata = (mtk + inggris + umum) / 3;
  let keterangan = '';
  if (rata >= 70) keterangan = 'Lulus';
  else if (rata >= 60 && rata <= 69) keterangan = 'Cadangan';
  else keterangan = 'Tidak Lulus';
  return { rata: rata.toFixed(2), keterangan };
}

// refresh tabel & statistik & update otomatis jumlah data & kode di form (kode terbaru)
function refreshTampilan() {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;
  
  if (pendaftarList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;">📭 Belum ada data, silakan tambah pendaftar</td></tr>';
    document.getElementById('totalPendaftar').innerText = '0';
    document.getElementById('totalLulus').innerText = '0';
    document.getElementById('totalTidakLulus').innerText = '0';
    document.getElementById('totalCadangan').innerText = '0';
    document.getElementById('autoCountInput').value = '0';
    document.getElementById('autoKode').value = 'A2-101-9';
    return;
  }
  
  // update total pendaftar di form
  document.getElementById('autoCountInput').value = pendaftarList.length;
  // update contoh kode terbaru untuk pendaftar berikutnya (berdasarkan data terakhir / generate kode baru untuk new pendaftar)
  // biar realtime: kita buat preview kode berikutnya dengan asumsi data baru rata2 70 dan nama "Contoh"
  const previewRata = 70;
  const previewNama = "PendaftarBaru";
  const nextIndex = pendaftarList.length;
  const previewKodeObj = generateKodePendaftaran(nextIndex, previewRata, previewNama);
  document.getElementById('autoKode').value = previewKodeObj.kode;
  
  // hitung statistik
  let lulusCount = 0, tidakLulusCount = 0, cadanganCount = 0;
  pendaftarList.forEach(p => {
    if (p.keterangan === 'Lulus') lulusCount++;
    else if (p.keterangan === 'Tidak Lulus') tidakLulusCount++;
    else if (p.keterangan === 'Cadangan') cadanganCount++;
  });
  document.getElementById('totalPendaftar').innerText = pendaftarList.length;
  document.getElementById('totalLulus').innerText = lulusCount;
  document.getElementById('totalTidakLulus').innerText = tidakLulusCount;
  document.getElementById('totalCadangan').innerText = cadanganCount;
  
  // render tabel
  let htmlRows = '';
  for (let i = 0; i < pendaftarList.length; i++) {
    const d = pendaftarList[i];
    let badgeClass = '';
    if (d.keterangan === 'Lulus') badgeClass = 'badge-lulus';
    else if (d.keterangan === 'Cadangan') badgeClass = 'badge-cadangan';
    else badgeClass = 'badge-tidak';
    
    htmlRows += `<tr>
      <td>${escapeHtml(d.kode)}</td>
      <td>${escapeHtml(d.nama)}</td>
      <td>${escapeHtml(d.tempatLahir)}</td>
      <td>${escapeHtml(d.jk)}</td>
      <td>${escapeHtml(d.tanggalLahir)}</td>
      <td>${escapeHtml(d.pekerjaanOrtu)}</td>
      <td>${escapeHtml(d.gedung)}</td>
      <td>${d.bulanTes}</td>
      <td>${d.matematika}</td>
      <td>${d.inggris}</td>
      <td>${d.umum}</td>
      <td>${d.rata}</td>
      <td><span class="${badgeClass}" style="padding:4px 12px; border-radius:20px;">${d.keterangan}</span></td>
    </tr>`;
  }
  tbody.innerHTML = htmlRows;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
    return c;
  });
}

// fungsi tambah pendaftar
function tambahPendaftar(event) {
  event.preventDefault();
  
  // ambil nilai dari form
  const nama = document.getElementById('nama').value.trim();
  const tempatLahir = document.getElementById('tempatLahir').value.trim();
  const jkRadios = document.querySelectorAll('input[name="jk"]');
  let jk = 'Laki-Laki';
  for (let radio of jkRadios) {
    if (radio.checked) { jk = radio.value; break; }
  }
  const tanggalLahir = document.getElementById('tanggalLahir').value;
  const asalSekolah = document.getElementById('asalSekolah').value.trim();
  const pekerjaanOrtu = document.getElementById('pekerjaanOrtu').value.trim();
  let mtk = parseFloat(document.getElementById('nilaiMatematika').value);
  let inggris = parseFloat(document.getElementById('nilaiInggris').value);
  let umum = parseFloat(document.getElementById('nilaiUmum').value);
  
  if (isNaN(mtk)) mtk = 0;
  if (isNaN(inggris)) inggris = 0;
  if (isNaN(umum)) umum = 0;
  mtk = Math.min(100, Math.max(0, mtk));
  inggris = Math.min(100, Math.max(0, inggris));
  umum = Math.min(100, Math.max(0, umum));
  
  if (!nama || !tempatLahir || !tanggalLahir || !asalSekolah || !pekerjaanOrtu) {
    alert('Mohon lengkapi semua field (Nama, Tempat Lahir, Tanggal Lahir, Asal Sekolah, Pekerjaan Ortua)');
    return;
  }
  
  const { rata, keterangan } = hitungStatus(mtk, inggris, umum);
  const rataNumeric = parseFloat(rata);
  
  // generate kode pendaftaran & gedung berdasarkan data (rata + nama)
  const newIndex = pendaftarList.length;  // index berikutnya
  const { kode, gedung, bulan } = generateKodePendaftaran(newIndex, rataNumeric, nama);
  
  // object pendaftar
  const pendaftarBaru = {
    kode: kode,
    nama: nama,
    tempatLahir: tempatLahir,
    jk: jk,
    tanggalLahir: tanggalLahir,
    asalSekolah: asalSekolah,
    pekerjaanOrtu: pekerjaanOrtu,
    matematika: mtk,
    inggris: inggris,
    umum: umum,
    rata: rata,
    keterangan: keterangan,
    gedung: gedung,
    bulanTes: bulan
  };
  
  pendaftarList.push(pendaftarBaru);
  refreshTampilan();
  
  // reset form kecuali radio dan mempertahankan beberapa default (opsional: reset nilai form)
  // sekalian reset input tapi jangan hapus data random, kita reset biar fresh
  document.getElementById('registrationForm').reset();
  // setelah reset set radio Laki-laki default
  document.querySelector('input[value="Laki-Laki"]').checked = true;
  // set default nilai ke 70 biar mudah
  document.getElementById('nilaiMatematika').value = '70';
  document.getElementById('nilaiInggris').value = '70';
  document.getElementById('nilaiUmum').value = '70';
  // fokus ke nama
  document.getElementById('nama').focus();
  
  // update preview kode dan jumlah lagi (refresh)
  setTimeout(() => {
    if(pendaftarList.length > 0) {
      const nextPreviewIdx = pendaftarList.length;
      const dummyNama = "NamaBaru";
      const dummyRata = 70;
      const preview = generateKodePendaftaran(nextPreviewIdx, dummyRata, dummyNama);
      document.getElementById('autoKode').value = preview.kode;
      document.getElementById('autoCountInput').value = pendaftarList.length;
    } else {
      document.getElementById('autoCountInput').value = '0';
      document.getElementById('autoKode').value = 'A2-101-9';
    }
  }, 10);
}

// reset semua data (clear array)
function resetSemuaData() {
  if (confirm('⚠️ Reset seluruh data pendaftaran? Semua data akan hilang (tanpa database). Lanjutkan?')) {
    pendaftarList = [];
    refreshTampilan();
    document.getElementById('registrationForm').reset();
    document.querySelector('input[value="Laki-Laki"]').checked = true;
    document.getElementById('nilaiMatematika').value = '70';
    document.getElementById('nilaiInggris').value = '70';
    document.getElementById('nilaiUmum').value = '70';
    document.getElementById('nama').focus();
    // reset jumlah dan kode tampilan
    document.getElementById('autoCountInput').value = '0';
    document.getElementById('autoKode').value = 'A2-101-9';
  }
}

// reset form saja (bukan reset data) -> hanya bersihkan field
function resetFormOnly() {
  document.getElementById('registrationForm').reset();
  document.querySelector('input[value="Laki-Laki"]').checked = true;
  document.getElementById('nilaiMatematika').value = '70';
  document.getElementById('nilaiInggris').value = '70';
  document.getElementById('nilaiUmum').value = '70';
  document.getElementById('nama').focus();
  // tetap hitung jumlah data tidak berubah, hanya reset input
  if(pendaftarList.length > 0) {
    const nextIdx = pendaftarList.length;
    const previewKode = generateKodePendaftaran(nextIdx, 70, "Pendaftar");
    document.getElementById('autoKode').value = previewKode.kode;
  } else {
    document.getElementById('autoKode').value = 'A2-101-9';
  }
  document.getElementById('autoCountInput').value = pendaftarList.length;
}

// inisialisasi dan event listeners
window.addEventListener('DOMContentLoaded', () => {
  refreshTampilan();
  const form = document.getElementById('registrationForm');
  form.addEventListener('submit', tambahPendaftar);
  const resetBtn = document.getElementById('resetFormBtn');
  resetBtn.addEventListener('click', resetFormOnly);
  // tambahkan tombol reset data total? karena requirement ada tombol "Sampai Reset" di mockup, ada dua tombol: Sampai dan Reset
  // sesuai gambar ada tulisan "Sampai" "Reset" di form, kita buat tombol kedua di luar? sesuai UI kita sudah punya Simpan dan Reset Form (reset form)
  // tetapi untuk reset semua data (penghapusan seluruh daftar) kita buat tombol tambahan yang lebih jelas: di area tabel
  const extraResetAllBtn = document.createElement('button');
  extraResetAllBtn.innerText = '🗑️ Hapus Semua Data (Reset Total)';
  extraResetAllBtn.classList.add('btn', 'btn-reset');
  extraResetAllBtn.style.marginLeft = 'auto';
  extraResetAllBtn.style.backgroundColor = '#fecaca';
  extraResetAllBtn.style.color = '#991b1b';
  const statDiv = document.querySelector('.stat-box');
  if (statDiv) {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'flex-end';
    wrapper.style.marginTop = '16px';
    extraResetAllBtn.onclick = resetSemuaData;
    wrapper.appendChild(extraResetAllBtn);
    statDiv.parentNode.insertBefore(wrapper, statDiv.nextSibling);
  } else {
    // fallback
    const cardBody = document.querySelector('.card:last-of-type .card-body');
    if(cardBody) cardBody.appendChild(extraResetAllBtn);
    extraResetAllBtn.onclick = resetSemuaData;
  }
  
  // set default placeholder untuk tanggal lahir (mm/dd/yyyy) tapi input date menggunakan yyyy-mm-dd, tetap user friendly
  if(!document.getElementById('tanggalLahir').value) {
    const today = new Date().toISOString().split('T')[0];
    // jangan set default otomatis biar user isi
  }
  // menampilkan preview awal
  document.getElementById('autoCountInput').value = '0';
  document.getElementById('autoKode').value = 'A2-101-9';
});