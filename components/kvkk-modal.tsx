"use client"

import type React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { useState } from "react"

interface KVKKModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

export function KVKKModal({ isOpen, onClose, onAccept }: KVKKModalProps) {
  const { t } = useLanguage()
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    // Check if scrolled to bottom (with a small threshold)
    if (scrollHeight - scrollTop - clientHeight < 10) {
      setHasScrolledToBottom(true)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("kvkk.title")}</DialogTitle>
          <DialogDescription>Lütfen aşağıdaki metni dikkatlice okuyun ve en aşağıya kadar kaydırın.</DialogDescription>
        </DialogHeader>

        <div
          className="flex-1 overflow-y-auto pr-2 my-4 max-h-[60vh]"
          onScroll={handleScroll}
          style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}
        >
          <div className="space-y-6 p-1">
            <div>
              <h2 className="text-xl font-bold mb-4">KVKK METNİ</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">1. Veri Sorumlusu</h3>
                  <p className="mt-2">
                    MOVISION+ olarak, kişisel verilerinizin güvenliği konusunda azami hassasiyet göstermekteyiz. Bu
                    metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, veri sorumlusu sıfatıyla
                    sizleri bilgilendirmek amacıyla hazırlanmıştır.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">2. Hukuki Dayanak</h3>
                  <p className="mt-2">
                    Kişisel verileriniz, açık rızanıza dayanarak ya da KVKK'nın 5. ve 6. maddelerinde belirtilen diğer
                    hukuki sebepler çerçevesinde toplanmakta ve işlenmektedir.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">3. Haklarınız</h3>
                  <p className="mt-2">KVKK'nın 11. maddesi gereğince:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
                    <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
                    <li>Verilerin düzeltilmesini veya silinmesini isteme,</li>
                    <li>İşleme faaliyetlerine itiraz etme,</li>
                    <li>Zarara uğramanız hâlinde tazminat talep etme</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">AYDINLATMA METNİ</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">1. Veri Sorumlusu</h3>
                  <p className="mt-2">
                    MOVISION+ olarak, kişisel verilerinizin güvenliği bizim için önceliklidir. Bu metin, 6698 sayılı
                    KVKK kapsamında kişisel verilerinizin hangi amaçlarla işlendiğini açıklamak için hazırlanmıştır.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">2. Kişisel Verilerin İşlenme Amacı</h3>
                  <p className="mt-2">Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Hesabınızın oluşturulması ve yönetilmesi</li>
                    <li>Film ve dizi önerilerinin kişiselleştirilmesi</li>
                    <li>Kullanıcı deneyiminin iyileştirilmesi</li>
                    <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                    <li>Güvenlik ve dolandırıcılık önleme</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">3. İşlenen Kişisel Veriler</h3>
                  <p className="mt-2">
                    Ad-soyad (isteğe bağlı), e-posta adresi, IP bilgisi, izleme tercihleri, yorum ve puanlama geçmişiniz
                    gibi veriler işlenebilmektedir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("kvkk.decline")}
          </Button>
          <Button onClick={onAccept} disabled={!hasScrolledToBottom}>
            {hasScrolledToBottom ? t("kvkk.accept") : "Metni sonuna kadar okuyun"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
