# Movision - Turkish Movie Site 🎬

![Movision Banner](/public/vercel.svg) 
<!-- Note: If you have a specific banner or logo, replace the image url above. -->

Movision, modern teknolojilerle geliştirilmiş, kullanıcı dostu ve şık tasarıma sahip bir film ve dizi platformudur. Kullanıcıların favori film ve dizilerini keşfetmelerini, fragmanlarını izlemelerini, oylama yapmalarını ve kendi izleme listelerini oluşturmalarını sağlar.

## 🚀 Özellikler

- **Geniş İçerik Kataloğu:** En popüler, vizyondaki ve yüksek puanlı filmler/diziler.
- **Detaylı Arama ve Filtreleme:** Türlere, yıllara ve puanlamalara göre gelişmiş arama yetenekleri (`/search` sayfası).
- **Kişiselleştirilmiş Kullanıcı Deneyimi:** 
  - Üyelik sistemi (`/login`, `/register`).
  - Favori listesi profil üzerinden yönetilebilir.
  - "İzledim", "İzleyeceğim" butonları ile durum takibi (`/history`).
- **Modern ve Şık Kullanıcı Arayüzü:** Tailwind CSS ve modern bileşenlerle karanlık tema (Dark Mode) odaklı tasarım.
- **Etkileşim:** Yorum yapma modülleri, yıldızlarla oylama sistemi ve fragman önizleme (Modal).
- **Bildirimler ve Odalar:** Kullanıcılara özel interaktif bildirimler ve senkronize film izleme odaları (`/rooms`).

## 🛠️ Kullanılan Teknolojiler

Proje, güncel ve performans odaklı web teknolojileri üzerine inşa edilmiştir:

- **Framework:** [Next.js](https://nextjs.org/) (React Tabanlı)
- **Stilizasyon:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Bileşenleri:** Özelleştirilmiş ve yeniden kullanılabilir UI kütüphaneleri (örn. Modallar, Popover, Sidebar).
- **Paket Yöneticisi:** [pnpm](https://pnpm.io/)
- **Dil:** TypeScript

## 📂 Proje Yapısı

Proje temel olarak aşağıdaki gibi organize edilmiştir:

```text
turkish-movie-site/
├── app/               # Next.js uygulama sayfaları (login, movie, tv, search vb.)
├── components/        # Yeniden kullanılabilir UI bileşenleri (nav, sidebar, card vb.)
├── hooks/             # Özel React Hook'ları
├── lib/               # Yardımcı (Utility) fonksiyonlar ve yapılandırmalar
├── public/            # Statik dosyalar (resimler, ikonlar, fontlar vb.)
└── styles/            # İlave genel stil tanımlamaları
```

## ⚙️ Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz:

1. **Depoyu Klonlayın:**
   ```bash
   git clone https://github.com/Rukiyedanler/Movision.git
   cd turkish-movie-site
   ```

2. **Bağımlılıkları Yükleyin:**
   Projeyi ayağa kaldırmak için `pnpm` paket yöneticisini kullanıyoruz.
   ```bash
   pnpm install
   # veya
   npm install
   ```

3. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   pnpm dev
   # veya
   npm run dev
   ```

4. **Tarayıcıda Görüntüleyin:**
   Tarayıcınızı açın ve `http://localhost:3000` adresine giderek siteyi görüntüleyin.


## 📝 Lisans

Bu proje [MIT](https://choosealicense.com/licenses/mit/) lisansı ile lisanslanmıştır.
