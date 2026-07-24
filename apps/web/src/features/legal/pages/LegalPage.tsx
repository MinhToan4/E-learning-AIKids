import { Link } from 'react-router-dom'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'

type LegalKind = 'hub' | 'privacy' | 'terms' | 'delete' | 'support' | 'data-safety'

type Section = {
  title: string
  body: React.ReactNode
}

const contact = <a className="font-bold text-brand-600 underline" href="mailto:storymee.com@gmail.com">storymee.com@gmail.com</a>

const privacySections: Section[] = [
  {
    title: '1. Đơn vị vận hành',
    body: <>AI Kid (“chúng tôi”) cung cấp nền tảng học tập và sáng tạo AI cho gia đình, giáo viên và tổ chức. Liên hệ về quyền riêng tư: {contact}.</>,
  },
  {
    title: '2. Dữ liệu được thu thập',
    body: (
      <ul>
        <li>Tài khoản người lớn: tên, email, tên đăng nhập, vai trò và mật khẩu đã băm.</li>
        <li>Hồ sơ trẻ: biệt danh, nhóm tuổi, ảnh đại diện, tùy chọn học tập và tiến độ.</li>
        <li>Nội dung: câu lệnh, tranh, truyện, nhân vật, tệp tham chiếu và sản phẩm học tập.</li>
        <li>Hoạt động kỹ thuật: phiên đăng nhập, trạng thái tác vụ, phiên bản ứng dụng, lỗi và chẩn đoán mạng cơ bản.</li>
        <li>Camera/thư viện ảnh chỉ được truy cập khi người dùng chủ động chọn tính năng tương ứng.</li>
      </ul>
    ),
  },
  {
    title: '3. Mục đích sử dụng',
    body: <>Dữ liệu được dùng để xác thực, cung cấp khóa học, lưu tiến độ, tạo nội dung, bảo vệ tài khoản, hỗ trợ người dùng, ngăn lạm dụng và duy trì độ ổn định của dịch vụ. AI Kid không bán dữ liệu cá nhân.</>,
  },
  {
    title: '4. AI và nhà cung cấp dịch vụ',
    body: <>Khi người dùng chủ động tạo nội dung, prompt và tệp tham chiếu cần thiết có thể được gửi tới nhà cung cấp AI/media được AI Kid cấu hình. Dữ liệu cũng có thể được xử lý bởi nhà cung cấp hosting, lưu trữ, cơ sở dữ liệu, thông báo và xác thực. Các bên này chỉ được sử dụng dữ liệu để cung cấp dịch vụ theo yêu cầu.</>,
  },
  {
    title: '5. Trẻ em và sự đồng ý của phụ huynh',
    body: <>Tài khoản gia đình do phụ huynh/người giám hộ tạo và quản lý. Trẻ không cần cung cấp email riêng. Phụ huynh kiểm soát hồ sơ trẻ, quyền tạo nội dung, chia sẻ và xóa dữ liệu. Chúng tôi giảm thiểu dữ liệu trẻ em và mặc định sản phẩm ở chế độ riêng tư.</>,
  },
  {
    title: '6. Lưu trữ và xóa dữ liệu',
    body: <>Dữ liệu được giữ trong thời gian tài khoản hoạt động hoặc khi cần để cung cấp dịch vụ. Khi nhận yêu cầu xóa hợp lệ, chúng tôi xóa hoặc ẩn danh dữ liệu, ngoại trừ hồ sơ tối thiểu phải giữ trong thời hạn cần thiết cho an ninh, chống gian lận, giao dịch hoặc nghĩa vụ pháp luật. Xem <Link className="font-bold text-brand-600 underline" to="/account/delete">hướng dẫn xóa tài khoản</Link>.</>,
  },
  {
    title: '7. Quyền và lựa chọn',
    body: <>Người dùng có thể xem, sửa hoặc xóa thông tin trong ứng dụng; yêu cầu truy cập, chỉnh sửa, xuất, hạn chế xử lý hoặc rút lại sự đồng ý bằng cách liên hệ {contact}. Một số quyền phụ thuộc vào khu vực pháp lý.</>,
  },
  {
    title: '8. Bảo mật và chuyển dữ liệu',
    body: <>Chúng tôi sử dụng HTTPS, mật khẩu đã băm, phân quyền, giới hạn phiên và API có kiểm soát truy cập. Nhà cung cấp có thể xử lý dữ liệu ở quốc gia khác; chúng tôi áp dụng biện pháp bảo vệ phù hợp với pháp luật áp dụng.</>,
  },
  {
    title: '9. Cập nhật chính sách',
    body: <>Các thay đổi quan trọng sẽ được công bố tại trang này cùng ngày hiệu lực mới. Ngày hiệu lực hiện tại: 23/07/2026.</>,
  },
]

const termsSections: Section[] = [
  { title: '1. Chấp thuận điều khoản', body: <>Bằng việc tạo tài khoản hoặc sử dụng AI Kid, bạn đồng ý với Điều khoản này và <Link className="font-bold text-brand-600 underline" to="/privacy">Chính sách quyền riêng tư</Link>.</> },
  { title: '2. Tài khoản gia đình và tổ chức', body: <>Chủ tài khoản phải có năng lực giao kết phù hợp. Phụ huynh/người giám hộ chịu trách nhiệm giám sát hồ sơ trẻ; tổ chức chịu trách nhiệm phân quyền giáo viên, quản trị viên và học sinh của mình.</> },
  { title: '3. Nội dung người dùng', body: <>Bạn giữ quyền đối với nội dung đã tải lên và cấp cho AI Kid quyền giới hạn để lưu trữ, xử lý, truyền và hiển thị nội dung nhằm vận hành dịch vụ. Bạn phải có quyền sử dụng nội dung đã cung cấp.</> },
  { title: '4. Nội dung do AI tạo', body: <>Kết quả AI có thể không chính xác, không duy nhất hoặc bị giới hạn bởi chính sách của nhà cung cấp. Người dùng phải kiểm tra kết quả trước khi sử dụng hoặc chia sẻ.</> },
  { title: '5. Sử dụng được chấp nhận', body: <>Không được tạo hoặc tải lên nội dung bất hợp pháp, xâm hại trẻ em, xâm phạm quyền của người khác; không tấn công hệ thống, vượt giới hạn, giả mạo hoặc sử dụng dịch vụ để gây hại. Tài khoản vi phạm có thể bị đình chỉ.</> },
  { title: '6. Gói dịch vụ và bên thứ ba', body: <>Một số tính năng phụ thuộc vào nhà cung cấp AI, media, thanh toán hoặc hạ tầng bên thứ ba. Tính năng và giới hạn có thể thay đổi; quyền lợi đã thanh toán được xử lý theo mô tả tại thời điểm mua và quy định của cửa hàng ứng dụng.</> },
  { title: '7. Chấm dứt và xóa tài khoản', body: <>Bạn có thể ngừng sử dụng hoặc yêu cầu xóa tài khoản tại <Link className="font-bold text-brand-600 underline" to="/account/delete">trang xóa tài khoản</Link>. Chúng tôi có thể hạn chế tài khoản để bảo vệ người dùng hoặc tuân thủ pháp luật.</> },
  { title: '8. Giới hạn bảo đảm', body: <>Dịch vụ được cung cấp trên cơ sở “như hiện có” trong phạm vi pháp luật cho phép. AI Kid không bảo đảm dịch vụ luôn không gián đoạn hoặc mọi kết quả AI phù hợp cho một mục đích cụ thể.</> },
  { title: '9. Liên hệ', body: <>Câu hỏi về điều khoản: {contact}. Ngày hiệu lực: 23/07/2026.</> },
]

const pageMeta: Record<LegalKind, { title: string; intro: string }> = {
  hub: { title: 'Thông tin pháp lý AI Kid', intro: 'Các chính sách và kênh hỗ trợ chính thức dành cho người dùng, phụ huynh và đơn vị trường học.' },
  privacy: { title: 'Chính sách quyền riêng tư', intro: 'Cách AI Kid thu thập, sử dụng, bảo vệ và xóa dữ liệu.' },
  terms: { title: 'Điều khoản sử dụng', intro: 'Quyền và trách nhiệm khi sử dụng ứng dụng và dịch vụ AI Kid.' },
  delete: { title: 'Xóa tài khoản và dữ liệu', intro: 'Yêu cầu xóa tài khoản AI Kid và dữ liệu liên quan.' },
  support: { title: 'Hỗ trợ người dùng', intro: 'Kênh hỗ trợ chính thức cho tài khoản, học tập, thanh toán và an toàn.' },
  'data-safety': { title: 'An toàn dữ liệu', intro: 'Bản tóm tắt thực hành dữ liệu dùng để đối chiếu với khai báo cửa hàng ứng dụng.' },
}

function Sections({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <section key={section.title} className="ui-card p-5 sm:p-6">
          <h2 className="font-display text-xl text-text">{section.title}</h2>
          <div className="mt-2 space-y-2 text-sm leading-7 text-muted [&_li]:ml-5 [&_li]:list-disc">{section.body}</div>
        </section>
      ))}
    </div>
  )
}

export function LegalPage({ kind }: { kind: LegalKind }) {
  const meta = pageMeta[kind]
  let content: React.ReactNode

  if (kind === 'privacy') content = <Sections sections={privacySections} />
  else if (kind === 'terms') content = <Sections sections={termsSections} />
  else if (kind === 'delete') {
    content = <Sections sections={[
      { title: 'Xóa trực tiếp trong ứng dụng', body: <>Đăng nhập tài khoản phụ huynh, mở Hồ sơ → Xóa tài khoản, xác nhận mật khẩu và làm theo hướng dẫn. Phụ huynh cũng có thể xóa riêng từng hồ sơ trẻ trong mục Con của tôi.</> },
      { title: 'Gửi yêu cầu qua email', body: <>Nếu không thể đăng nhập, gửi email từ địa chỉ đã đăng ký tới {contact} với tiêu đề “Yêu cầu xóa tài khoản AI Kid”. Không gửi mật khẩu hoặc PIN. Chúng tôi có thể yêu cầu thông tin tối thiểu để xác minh quyền sở hữu.</> },
      { title: 'Dữ liệu sẽ bị xóa', body: <>Tài khoản, hồ sơ trẻ, phiên đăng nhập, tiến độ, sản phẩm và tệp cá nhân liên kết sẽ bị xóa hoặc ẩn danh. Hồ sơ tối thiểu về giao dịch, an ninh hoặc nghĩa vụ pháp luật có thể được giữ trong thời hạn bắt buộc rồi xóa an toàn.</> },
      { title: 'Thời gian xử lý', body: <>Yêu cầu hợp lệ thường được hoàn tất trong vòng 30 ngày. Quyền truy cập có thể bị vô hiệu hóa sớm hơn. Chúng tôi sẽ thông báo nếu pháp luật cho phép kéo dài thời gian xử lý.</> },
    ]} />
  } else if (kind === 'support') {
    content = <Sections sections={[
      { title: 'Liên hệ', body: <>Email: {contact}. Vui lòng mô tả thiết bị, phiên bản ứng dụng và lỗi gặp phải; không gửi mật khẩu, PIN hoặc khóa API.</> },
      { title: 'An toàn trẻ em', body: <>Phụ huynh hoặc giáo viên có thể báo cáo ngay nội dung không phù hợp qua email với tiêu đề “An toàn trẻ em”. Nội dung và quyền chia sẻ mặc định được giới hạn để bảo vệ trẻ.</> },
      { title: 'Tài khoản và dữ liệu', body: <>Xem <Link className="font-bold text-brand-600 underline" to="/privacy">Chính sách quyền riêng tư</Link> hoặc <Link className="font-bold text-brand-600 underline" to="/account/delete">gửi yêu cầu xóa tài khoản</Link>.</> },
    ]} />
  } else if (kind === 'data-safety') {
    content = <Sections sections={[
      { title: 'Dữ liệu có thể được thu thập', body: <>Tên/biệt danh, email người lớn, ID tài khoản, nội dung do người dùng tạo, ảnh/tệp người dùng chủ động chọn, hoạt động ứng dụng, thông tin thiết bị và chẩn đoán cơ bản.</> },
      { title: 'Mục đích', body: <>Chức năng ứng dụng, quản lý tài khoản, cá nhân hóa học tập, bảo mật/chống gian lận, hỗ trợ, phân tích độ ổn định và tạo nội dung theo yêu cầu.</> },
      { title: 'Chia sẻ và bảo vệ', body: <>Không bán dữ liệu. Dữ liệu chỉ được truyền cho hạ tầng hoặc nhà cung cấp AI cần thiết để thực hiện tính năng. Dữ liệu được mã hóa khi truyền; người dùng có thể yêu cầu xóa.</> },
      { title: 'Lưu ý cho khai báo cửa hàng', body: <>Trang này là bản tóm tắt công khai. Khai báo Data Safety/App Privacy phải bao quát chính xác mọi SDK và hành vi trong từng bản phát hành của ứng dụng.</> },
    ]} />
  } else {
    content = (
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ['/privacy', 'Quyền riêng tư', 'Dữ liệu được thu thập, mục đích, quyền và thời gian lưu giữ.'],
          ['/terms', 'Điều khoản sử dụng', 'Quy tắc tài khoản, nội dung và dịch vụ AI.'],
          ['/account/delete', 'Xóa tài khoản', 'Hướng dẫn yêu cầu xóa tài khoản và dữ liệu.'],
          ['/data-safety', 'An toàn dữ liệu', 'Tóm tắt khai báo dữ liệu cho cửa hàng ứng dụng.'],
          ['/support', 'Hỗ trợ', 'Kênh hỗ trợ tài khoản, nội dung và an toàn trẻ em.'],
        ].map(([to, title, description]) => (
          <Link key={to} to={to} className="ui-card p-5 transition hover:-translate-y-0.5 hover:border-brand-300">
            <h2 className="font-display text-xl text-brand-600">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-dvh px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" aria-label="Về trang chính"><BrandLogo size="md" /></Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-brand-600" aria-label="Thông tin pháp lý">
            <Link to="/privacy">Quyền riêng tư</Link>
            <Link to="/terms">Điều khoản</Link>
            <Link to="/account/delete">Xóa tài khoản</Link>
            <Link to="/support">Hỗ trợ</Link>
          </nav>
        </header>
        <div className="mb-6">
          <p className="text-xs font-extrabold uppercase tracking-wider text-brand-500">AI Kid · Thông tin công khai</p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-text sm:text-4xl">{meta.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{meta.intro}</p>
        </div>
        {content}
        <footer className="mt-8 border-t border-border py-6 text-sm text-muted">
          <Link className="font-bold text-brand-600" to="/legal">Trung tâm pháp lý</Link>
          {' · '}© 2026 AI Kid{' · '}{contact}
        </footer>
      </div>
    </div>
  )
}
