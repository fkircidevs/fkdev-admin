<div align="center">

# fkdev *Admin*

**Liquid Glass görünümlü, framework'süz, derleme gerektirmeyen ücretsiz admin dashboard.**
Saf HTML, CSS ve biraz JavaScript. Kopyala, yükle, çalışsın.

[![Canlı demo](https://img.shields.io/badge/canl%C4%B1%20demo-admin.fkdev.sbs-0a0a0a?style=for-the-badge)](https://admin.fkdev.sbs)
[![fkdev UI](https://img.shields.io/badge/fkdev%20UI-v2.4.1-0a0a0a?style=for-the-badge)](https://ui.fkdev.sbs)
[![Sürüm](https://img.shields.io/badge/s%C3%BCr%C3%BCm-v1.1.0-0a0a0a?style=for-the-badge)](#sürüm-notları)
[![Lisans](https://img.shields.io/badge/lisans-MIT-0a0a0a?style=for-the-badge)](LICENSE)

[Canlı demo](https://admin.fkdev.sbs) · [Belgeler](https://admin.fkdev.sbs/dokumantasyon/) · [fkdev UI](https://ui.fkdev.sbs) · [fkdev.sbs](https://www.fkdev.sbs)

</div>

---

## Neden fkdev Admin?

|  |  |
|---|---|
| **Sıfır kurulum** | Framework, npm, derleme yok. Klasörü sunucuya at, bitti. |
| **Kütüphanesiz grafikler** | Çizgi, halka, huni, ısı haritası, yığılı çubuk: hepsi CSS ve SVG. |
| **Her ekranda düzgün** | 360 px telefondan geniş masaüstüne kadar test edildi; hiçbir sayfa ekran dışına taşmaz. |
| **Açık ve koyu tema** | Sistem temasını izler, tercih tarayıcıda hatırlanır. |
| **Güvenlik baştan** | Sıkı CSP, güvenlik başlıkları, `.htaccess` sertleştirmesi; CSRF ve hız sınırı içeren PHP örnekleri. |
| **Erişilebilir** | Klavyeyle tam kullanım, ekran okuyucu etiketleri, `prefers-reduced-motion` desteği. |
| **Tek tasarım dili** | fkdev.sbs ailesiyle aynı cam yüzeyler, menü, footer ve bildirimler. |
| **CDN + yedek** | fkdev UI sabit sürüm ve SRI imzasıyla CDN'den gelir; CDN düşerse yerel kopyaya geçer. |

## Sayfalar

| Panel | Hesap | Belgeler |
|---|---|---|
| Genel bakış | Profil | Kurulum |
| E-ticaret analizi | Bildirim merkezi | DataTables ve PHP |
| CRM analizi | Ayarlar (9 sekme) | CDN |
| Siparişler (DataTables) | Giriş · Kayıt | Güvenlik |
| Müşteriler | Şifre sıfırlama | İkon servisi (95 ikon) |
| Ürünler ve stok | İki adımlı doğrulama | Lisans · 404 |

### Ayarlar, uçtan uca çalışır

| Sekme | Neler var |
|---|---|
| **Profil** | Ad, kullanıcı adı, iletişim, sosyal hesaplar; 256×256 kırpılan fotoğraf; canlı “profil gücü” çubuğu |
| **Tercihler** | Sistem / açık / koyu tema, dil, saat dilimi, tarih biçimi, para birimi; canlı önizleme |
| **Güvenlik** | Şifre gücü ölçer, 2FA anahtarları, yedek kod üretme (kopyala / indir), oturum kapatma, giriş geçmişi |
| **Bildirimler** | Olay × kanal matrisi (e-posta, panel, SMS), sessiz saatler, özet e-postası |
| **Faturalandırma** | Plan ve kota çubukları, aylık / yıllık plan değişimi, kurumsal / bireysel fatura bilgisi |
| **API** | Anahtar oluşturma (yalnızca bir kez gösterilir), izin seçimi, iptal |
| **Entegrasyonlar** | Slack, iyzico, PayTR, Analytics, Paraşüt, Kargo; webhook ekle / test et / sil |
| **Ekip** | Davet, bekleyen davetler, rol değişimi, ekipten çıkarma, koltuk sınırı |
| **Hesap** | JSON dışa aktarma, hesabı dondurma, e-posta onaylı hesap silme |

> `/ayarlar/#guvenlik` gibi bir adres doğrudan o sekmeyi açar. Demo, kaydettiklerini yalnızca o tarayıcının `localStorage` alanında tutar; gerçek veri için PHP örneklerine bağla.

## Hızlı başlangıç

```bash
git clone https://github.com/fkircidevs/fkdev-admin.git
cd fkdev-admin
npx http-server -p 5183 -c-1   # yerelde önizleme
```

1. Klasörün içeriğini sunucunun web köküne (`public_html`) kopyala. `.htaccess` gizli dosyadır, onu da kopyala.
2. Alan adını HTTPS ile aç. Panel statik olarak çalışır.
3. Gerçek veri için `ornekler/php/` klasörünü web kökünün **dışına** taşı, `config.example.php` → `config.php` yap, `schema.sql` dosyasını veritabanında çalıştır. Ayrıntılar: [Kurulum](https://admin.fkdev.sbs/dokumantasyon/kurulum/).

## CDN

```html
<link rel="stylesheet" href="https://ui.fkdev.sbs/v2.4.1/fkdev-ui.min.css" integrity="sha384-ywbvrnvLBhspdz061sb4+HVmL4bAnbhyuwKyDq0qCBVdEeLw2Le+aT+M0XhiumnM" crossorigin="anonymous">
<link rel="stylesheet" href="https://ui.fkdev.sbs/v2.4.1/fkdev-icons.css" integrity="sha384-7yUKhYWWrNB988JPR7B5hWqmWKk50ryeZ/b688YUSNn02PjgfTkhgNDnoRUX0w4V" crossorigin="anonymous">
<script src="https://ui.fkdev.sbs/v2.4.1/fkdev-ui.min.js" integrity="sha384-M00Zh34vyulzgDN4UvQcDJteSAYjql+zh1KP3B8lMfPikmAoJLDzbKnjWiFHPsvT" crossorigin="anonymous" defer></script>
```

`integrity` imzası dosyanın değiştirilmediğini garanti eder. CDN istemezsen [ZIP paketini](https://ui.fkdev.sbs/indir/fkdev-ui-2.4.1.zip) indirip kendi sunucunda barındır.

```html
<i class="fk-i fk-i-cart" aria-hidden="true"></i>
```

Tüm ikonlar: [İkon servisi](https://admin.fkdev.sbs/dokumantasyon/ikonlar/).

## Klasör yapısı

```
fkdev-admin/
├── index.html              Genel bakış
├── e-ticaret/ crm/ siparisler/ musteriler/ urunler/
├── profil/ bildirimler/ ayarlar/
├── giris/ kayit/ sifre-sifirla/ dogrulama/
├── dokumantasyon/          kurulum, datatables, cdn, guvenlik, ikonlar
├── lisans/
├── assets/admin.css        panele özel stiller ve responsive kurallar
├── assets/admin.js         ayarlar, bildirimler, DataTables, toast sınırı
├── assets/fkdev/           CDN düşerse kullanılan yerel fkdev UI kopyası
├── ornekler/php/           giriş, kayıt, çıkış, DataTables uç noktası, şema
├── .htaccess · _headers    HTTPS, CSP, güvenlik başlıkları, önbellek
└── LICENSE                 MIT
```

## Güvenlik

Kendi sunucunda çalıştırmadan önce [güvenlik rehberini](https://admin.fkdev.sbs/dokumantasyon/guvenlik/) oku. Özetle: HTTPS zorunlu, `config.php` web kökünün dışında, tüm formlarda CSRF, tüm çıktılarda `htmlspecialchars`, girişte hız sınırı ve admin hesaplarında iki adımlı doğrulama.

Bir güvenlik açığı bulursan lütfen herkese açık issue yerine **ik@fkdev.sbs** adresine yaz.

## Sürüm notları

**v1.1.0**
- Yeni **Profil** ve **Bildirim merkezi** sayfaları; navbar avatarı ve zil sayacı bunlarla senkron.
- **Ayarlar** 5 sekmeden 9 sekmeye çıktı; tüm formlar kaydeder, sekmeler adres çubuğuyla eşleşir.
- Navbar açılır menüleri dar ekranda navbar genişliğine yaslanır, artık ekran dışına taşmaz; zil mobilde de görünür.
- Tablolar kabına sığmadığında otomatik olarak etiketli kartlara dönüşür; telefonda yatay kaydırma yok.
- Ayarlar sekmeleri dar ekranda sayfayı genişletmez; seçili sekme her zaman görünür kalır.
- Aynı anda en fazla **3 toast**: dördüncü gelince en eskisi kapanır.
- `assets/*` önbellek sürümü `v=1.1.0`.

**v1.0.0** · İlk yayın.

## Lisans

[MIT](LICENSE) © 2026 Furkan Kırcı. Kullan, değiştir, geliştir, sat. Tek şart lisans metnini korumak.

<div align="center">

---

**fkdev ailesi** · [fkdev.sbs](https://www.fkdev.sbs) · [ui.fkdev.sbs](https://ui.fkdev.sbs) · [admin.fkdev.sbs](https://admin.fkdev.sbs)

</div>
