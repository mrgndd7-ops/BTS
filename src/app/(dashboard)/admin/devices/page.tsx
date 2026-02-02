'use client'

import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, Smartphone } from 'lucide-react'

/**
 * DEVICES PAGE - DEVRE DIŞI
 * 
 * Sebep: Radar.io SDK browser-based GPS tracking kullanıyor.
 * Device mapping'e gerek yok - her kullanıcı kendi tarayıcısından GPS gönderiyor.
 * device_mappings tablosu 00017_remove_traccar_fields.sql ile kaldırıldı.
 * 
 * Gelecekte external device desteği eklenirse bu sayfa yeniden aktive edilebilir.
 */

export default function DevicesPage() {
  return (
    <div className="flex flex-col h-full p-6">
      <Header 
        title="Cihaz Yönetimi" 
        description="GPS cihaz yönetimi (şu anda kullanılmıyor)" 
      />

      <div className="flex-1 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Radar.io SDK Kullanımda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Smartphone className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium mb-2">
                    Browser-Based GPS Tracking Aktif
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    BTS sistemi Radar.io SDK kullanarak doğrudan browser&apos;dan GPS verisi topluyor. 
                    Her kullanıcı kendi cihazından otomatik olarak konum gönderiyor.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold flex-shrink-0">
                  ✓
                </div>
                <div>
                  <strong className="text-white">Otomatik Eşleştirme:</strong> Kullanıcı login olduğunda device_id otomatik oluşturuluyor
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold flex-shrink-0">
                  ✓
                </div>
                <div>
                  <strong className="text-white">Manuel Kurulum Gerekmez:</strong> Personel sadece görev başlatıp tarayıcıda GPS iznini onaylaması yeterli
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold flex-shrink-0">
                  ✓
                </div>
                <div>
                  <strong className="text-white">Real-Time Tracking:</strong> Admin panelden tüm personel canlı olarak izlenebiliyor
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500">
                <strong className="text-slate-400">Not:</strong> Gelecekte external GPS cihaz desteği eklenirse bu sayfa yeniden aktive edilecektir.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
