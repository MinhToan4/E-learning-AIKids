import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { designerAssets } from '@/shared/config/assets'

export function WelcomePage() {
  return (
    <div
      className="relative mx-auto flex min-h-dvh max-w-6xl flex-col items-center justify-center gap-8 px-4 py-10"
      style={{
        backgroundImage: `url(${designerAssets.lobby.bgHome})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      <div className="absolute inset-0 bg-white/55 backdrop-blur-[2px]" />
      <div className="ui-card relative z-10 grid w-full max-w-5xl overflow-hidden md:grid-cols-2">
        <div className="relative min-h-72 bg-brand-100">
          <img
            src={designerAssets.lobby.homeCharacter}
            alt="Nhân vật sáng tạo từ designer AIKid"
            className="h-full w-full object-cover"
          />
          {/* Wordmark only — no frame/border around logo */}
          <BrandLogo
            size="lg"
            className="absolute left-4 top-4 max-w-[160px] drop-shadow-md"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
          <BrandLogo size="xl" className="max-w-[min(100%,300px)]" />
          <p className="text-sm font-bold uppercase tracking-wide text-brand-500">
            8–11 tuổi · Học qua chơi · Designer AIKid
          </p>
          <h1 className="font-display text-4xl leading-tight text-text md:text-5xl">
            Creator Academy
          </h1>
          <p className="text-muted">
            Không phải lớp học khô khan — con đi bản đồ nhiệm vụ, ghép thẻ prompt, làm
            truyện tranh / giọng kể / robot, hiểu bản chất AI qua thực hành an toàn.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/login">
              <Button>Bắt đầu ngay</Button>
            </Link>
            <Link to="/login?role=parent">
              <Button variant="secondary">Tôi là ba/mẹ</Button>
            </Link>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              designerAssets.lobby.cardArt,
              designerAssets.lobby.cardMee,
              designerAssets.lobby.artComic,
            ].map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-16 w-full rounded-xl object-cover shadow-soft"
              />
            ))}
          </div>
          <p className="text-xs text-muted">
            Không dùng email của trẻ · Sáng tạo mặc định riêng tư · Có cổng duyệt phụ huynh
          </p>
        </div>
      </div>
    </div>
  )
}
