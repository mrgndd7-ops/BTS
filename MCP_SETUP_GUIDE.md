# MCP Supabase Kurulum Rehberi

## Adım 1: Supabase Connection String'ini Alın

1. **Supabase Dashboard'a gidin**: https://supabase.com/dashboard
2. Projenizi seçin
3. **Settings** (sol menü, en altta) → **Database**
4. **Connection String** bölümüne gidin
5. **URI** sekmesini seçin (Transaction pooling DEĞİL!)
6. Connection string'i kopyalayın:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
7. `[YOUR-PASSWORD]` kısmını **gerçek database password'ünüzle** değiştirin

**ÖNEMLİ:** 
- Transaction pooling değil, **Direct connection** kullanın
- Port: `5432` (pooling değil!)
- Eğer password'ü unuttuysanız: Settings → Database → Reset Database Password

---

## Adım 2: Cursor MCP Config Dosyasını Açın

### Windows'ta:

1. **Cursor'da** → `Ctrl + Shift + P` (Command Palette)
2. Yazın: `Preferences: Open User Settings (JSON)`
3. VEYA manuel olarak:
   - `%APPDATA%\Cursor\User\settings.json` dosyasını açın

### Alternatif:

1. Cursor → Settings (Ctrl + ,)
2. Sağ üstte **{}** ikonuna tıklayın (Open Settings JSON)

---

## Adım 3: MCP Config'i Ekleyin

`settings.json` dosyasına şunu ekleyin:

```json
{
  // ... mevcut ayarlarınız ...
  
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase",
        "postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
      ]
    }
  }
}
```

**DİKKAT:** 
- `[PROJECT-REF]` ve `[YOUR-PASSWORD]` kısımlarını değiştirin!
- Virgüllere dikkat edin (JSON formatı)

---

## Adım 4: Cursor'ı Yeniden Başlatın

1. Cursor'ı tamamen kapatın
2. Tekrar açın
3. MCP sunucusu otomatik başlayacak

---

## Adım 5: Test Edin

Cursor'da bana şunu yazın:

> "MCP Supabase bağlantısı çalışıyor mu? municipalities tablosundaki kayıt sayısını göster"

Eğer çalışıyorsa, size kayıt sayısını söyleyeceğim.

---

## Sorun Giderme

### Hata: "Cannot connect to database"

**Çözüm 1:** Connection string'i kontrol edin
- Password doğru mu?
- Project ref doğru mu?
- Port 5432 mi? (6543 değil!)

**Çözüm 2:** Direct connection kullanın
- Supabase Dashboard → Database → Connection String
- **Transaction pooling** değil, **Session pooling** veya **Direct connection**

**Çözüm 3:** IP whitelist kontrolü
- Supabase Dashboard → Settings → Database
- "Disable connection pooling" seçeneğini deneyin

### Hata: "npx command not found"

Node.js kurulu değil. Kurun:
- https://nodejs.org/ (LTS version)
- Kurulduktan sonra Cursor'ı yeniden başlatın

### Hata: "MCP server failed to start"

1. Terminal'de test edin:
   ```bash
   npx -y @modelcontextprotocol/server-supabase "postgresql://..."
   ```
2. Hata mesajını kontrol edin
3. Connection string'i tırnak içinde olmalı

---

## Güvenlik Notu

⚠️ **Connection string hassas bilgidir!**
- Git'e commit etmeyin
- Kimseyle paylaşmayın
- Sadece local Cursor config'de kullanın

---

## MCP Bağlandıktan Sonra Neler Yapabilirim?

1. **Otomatik belediye ekleme:**
   > "Türkiye'deki tüm büyükşehir belediyelerini ekle"

2. **Veri sorgulama:**
   > "Kaç tane aktif belediye var?"

3. **Migration çalıştırma:**
   > "00008_add_municipalities.sql dosyasını çalıştır"

4. **Tablo yapısı görme:**
   > "municipalities tablosunun yapısını göster"

---

## Yardım

Herhangi bir adımda takılırsanız, hata mesajını bana gönderin!
