export const DEFAULT_NOTEBOOK_CONFIGS: Record<string, CreativeNotebookConfig> = {
  '2.1': {
    notebookTitle: 'Câu chuyện trong tấm ảnh cũ nhà tớ',
    akiAdvice:
      'Một bức tranh hay còn phải khiến người xem muốn hỏi: “Chuyện gì đang xảy ra ở đây nhỉ?” Hãy tìm một tấm ảnh cũ của gia đình, hỏi bố mẹ/ông bà xem hôm đó có chuyện gì xảy ra rồi ngồi nghe nhé!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Ba câu hỏi nhìn ảnh',
    sampleTemplate:
      'Trong ảnh, mọi người đang ngồi câu cá bên bờ sông chiều nắng vàng...\nĐiều lạ tớ nhìn thấy là một chú cá nhỏ nhảy vọt khỏi mặt nước bắn tung tóe...\nBố / mẹ / ông / bà kể rằng sau đó bố cười toe toét khoe hàm răng sún ngày xưa...',
    backpackCategory: 'story',
    backpackTag: 'Ảnh gia đình',
    characterName: 'Gia đình tớ',
    challengeSummary: [
      'Hôm nay chưa cần tạo bức tranh nào — mình học cách NHÌN ra câu chuyện trong tranh',
      'Nhớ ba câu hỏi: ĐANG LÀM GÌ? — CÓ GÌ LẠ? — RỒI SAO?',
      'Tìm trong nhà một tấm ảnh cũ của gia đình. Ảnh hơi mờ hay cũ càng thú vị',
      'Cầm ảnh đến hỏi bố mẹ hoặc ông bà: "Hôm chụp tấm này có chuyện gì xảy ra thế ạ?" rồi ngồi nghe',
    ],
    checklist: [
      {
        id: 'cl-2-1-1',
        label: 'Tìm trong nhà một tấm ảnh cũ của gia đình (ảnh mờ hay cũ càng thú vị)',
      },
      {
        id: 'cl-2-1-2',
        label: 'Cầm ảnh hỏi người lớn xem hôm chụp có chuyện gì xảy ra',
      },
      {
        id: 'cl-2-1-3',
        label: 'Trả lời đủ ba câu hỏi: Đang làm gì? — Có gì lạ? — Rồi sao?',
      },
    ],
    fields: [
      {
        id: 'what-action',
        label: '1. Trong ảnh, mọi người đang làm gì?',
        prefix: 'Trong ảnh, mọi người đang ',
        placeholder: 'ngồi câu cá bên bờ sông chiều nắng vàng...',
        rows: 2,
      },
      {
        id: 'weird-clue',
        label: '2. Điều lạ tớ nhìn thấy trong ảnh là gì?',
        prefix: 'Điều lạ tớ nhìn thấy là ',
        placeholder: 'một chú cá nhỏ nhảy vọt khỏi mặt nước bắn tung tóe...',
        badge: 'Quan trọng',
        helperTip: '💡 Chi tiết lạ hoặc dấu vết đặc biệt nhất làm người ta tò mò',
        rows: 2,
      },
      {
        id: 'what-next',
        label: '3. Bố/mẹ/ông/bà kể rằng sau đó chuyện gì xảy ra?',
        prefix: 'Bố / mẹ / ông / bà kể rằng sau đó ',
        placeholder: 'bố cười toe toét khoe hàm răng sún ngày xưa...',
        badge: 'Hỏi người nhà',
        helperTip:
          '💡 Cầm ảnh đến hỏi người lớn: "Hôm chụp tấm này có chuyện gì xảy ra thế ạ?" rồi ngồi nghe',
        rows: 3,
      },
    ],
  },
  '3.1': {
    notebookTitle: 'Hồ sơ nhân vật của tớ',
    akiAdvice:
      'Hãy tạo một nhân vật bất kỳ: người, con vật, đồ vật, thậm chí một cái thang máy cũng được. Dù chưa vẽ gì, người nghe vẫn có thể tưởng tượng ra nhân vật trong đầu nhờ tính cách!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Hồ sơ 7 dòng',
    sampleTemplate:
      'Tên: Sóc Bông Quả Cảm\nThích: Hạt dẻ nướng thơm lừng và trèo cành sồi cao vút\nSợ: Tiếng máy sấy tóc và tiếng sấm sét đùng đoàng trong đêm\nGiỏi: Bật nhảy thoăn thoắt qua các cành cây và ngửi mùi hạt dẻ từ xa\nDở: Cực kỳ hậu đậu, hay quên để chìa khóa ở đâu\nƯớc mơ: Khám phá vương quốc hạt dẻ trên mây\nNgười nhà tớ tả bạn ấy là: Một bạn sóc nhỏ màu cam vừa dũng cảm vừa buồn cười',
    backpackCategory: 'character-dna',
    backpackTag: 'Hồ sơ nhân vật',
    characterName: 'Sóc Bông Quả Cảm',
    challengeSummary: [
      'Tạo một nhân vật bất kỳ: người, con vật, đồ vật — thậm chí một cái thang máy cũng được',
      'Điền đủ các ô: Tên – Thích – Sợ – Giỏi – Dở – Ước mơ',
      'Đừng bỏ trống hai ô SỢ và DỞ, và viết thật cụ thể ("sợ tiếng máy sấy tóc" thay vì "sợ nhiều thứ")',
      'Đọc hồ sơ ấy cho bố hoặc mẹ nghe và hỏi: "Theo mẹ, bạn này trông như thế nào?"',
    ],
    checklist: [
      {
        id: 'cl-3-1-1',
        label: 'Tạo một nhân vật bất kỳ: người, con vật, đồ vật — thậm chí một cái thang máy',
      },
      {
        id: 'cl-3-1-2',
        label: 'Điền đủ các ô — ĐẶC BIỆT không bỏ trống hai ô SỢ và DỞ (viết cụ thể)',
      },
      {
        id: 'cl-3-1-3',
        label: 'Đọc hồ sơ cho bố/mẹ nghe và ghi lại câu trả lời vào ô số 7',
      },
    ],
    fields: [
      {
        id: 'char-name',
        label: '1. Tên nhân vật',
        prefix: 'Tên: ',
        placeholder: 'Người, con vật, đồ vật — thậm chí một cái thang máy...',
        helperTip: '💡 Nhân vật bất kỳ: người, con vật, đồ vật, cái bút chì, cái thang máy...',
        rows: 1,
      },
      {
        id: 'char-likes',
        label: '2. Sở thích đặc trưng',
        prefix: 'Thích: ',
        placeholder: 'Sở thích nổi bật nhất của bạn ấy...',
        rows: 2,
      },
      {
        id: 'char-fears',
        label: '3. Nỗi sợ hãi',
        prefix: 'Sợ: ',
        placeholder: 'Sợ tiếng máy sấy tóc thay vì sợ nhiều thứ...',
        badge: 'Quan trọng',
        helperTip: '💡 Đừng bỏ trống! Viết thật cụ thể: sợ tiếng máy sấy tóc thay vì sợ nhiều thứ',
        rows: 2,
      },
      {
        id: 'char-strength',
        label: '4. Sở trường / Điểm giỏi',
        prefix: 'Giỏi: ',
        placeholder: 'Bạn ấy giỏi nhất việc gì...',
        rows: 2,
      },
      {
        id: 'char-weakness',
        label: '5. Điểm dở / Vụng về đáng yêu',
        prefix: 'Dở: ',
        placeholder: 'Hay quên chìa khóa, hậu đậu...',
        badge: 'Quan trọng',
        helperTip:
          '💡 Đừng bỏ trống! Điểm dở/tật xấu đáng yêu làm nhân vật thật hơn siêu nhân hoàn hảo',
        rows: 2,
      },
      {
        id: 'char-dream',
        label: '6. Ước mơ',
        prefix: 'Ước mơ: ',
        placeholder: 'Ước mơ lớn nhất của bạn ấy...',
        rows: 2,
      },
      {
        id: 'char-family-feedback',
        label: '7. Người nhà tớ tả bạn ấy là',
        prefix: 'Người nhà tớ tả bạn ấy là: ',
        placeholder: 'Ghi lại câu trả lời của bố/mẹ sau khi nghe đọc...',
        badge: 'Hỏi người nhà',
        helperTip:
          '💡 Đọc hồ sơ cho bố hoặc mẹ nghe và hỏi: "Theo mẹ, bạn này trông như thế nào?" rồi ghi lại',
        rows: 3,
        colSpan: 2,
        spanFull: true,
      },
    ],
  },
  '4.1': {
    notebookTitle: 'Câu chuyện ba cổng của nhân vật tớ',
    akiAdvice:
      'Bình thường – Có chuyện – Giải quyết. Ba cổng này sẽ giúp những việc bình thường biến thành một câu chuyện có đầu, có giữa và có kết thúc!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Ba cổng của câu chuyện',
    sampleTemplate:
      'Bình thường: mọi hôm bạn ấy sống yên bình trong hốc cây sồi, mỗi sáng đi nhặt hạt dẻ...\nCó chuyện: một hôm toàn bộ kho hạt dẻ biến mất, chỉ để lại một vệt chân kỳ lạ phát sáng...\nGiải quyết: thế là bạn ấy dũng cảm lần theo dấu chân, kết bạn với Nhím và cùng tìm lại hạt dẻ!',
    backpackCategory: 'story-arc',
    backpackTag: '3 Cổng Cốt Truyện',
    characterName: 'Nhân vật truyện',
    challengeSummary: [
      'Lấy thẻ nhân vật ra, nhìn lại Hồ sơ rồi kể một câu chuyện về bạn ấy',
      'Nhớ đủ ba cổng: BÌNH THƯỜNG – CÓ CHUYỆN – GIẢI QUYẾT',
      'Kể xong đọc lại một lượt, kiểm tra xem có bỏ quên cổng nào không. Thiếu thì kể lại lần nữa',
    ],
    checklist: [
      {
        id: 'cl-4-1-1',
        label: 'Đủ cả 3 cổng: Bình thường – Có chuyện – Giải quyết',
      },
      {
        id: 'cl-4-1-2',
        label: 'Đọc to câu chuyện và tự kiểm tra xem có quên cổng nào không',
      },
    ],
    fields: [
      {
        id: 'gate-1',
        label: 'Cổng 1: Bình thường',
        prefix: 'Bình thường: mọi hôm bạn ấy ',
        placeholder: 'mọi hôm bạn ấy sống yên bình, mỗi sáng đi nhặt hạt dẻ...',
        rows: 2,
      },
      {
        id: 'gate-2',
        label: 'Cổng 2: Có chuyện!',
        prefix: 'Có chuyện: một hôm ',
        placeholder: 'toàn bộ kho hạt dẻ biến mất, xuất hiện biến cố làm đảo lộn...',
        badge: 'Biến cố',
        helperTip: '💡 Tạo ra biến cố bất ngờ kích thích hành động của nhân vật',
        rows: 3,
      },
      {
        id: 'gate-3',
        label: 'Cổng 3: Giải quyết',
        prefix: 'Giải quyết: thế là bạn ấy ',
        placeholder: 'dũng cảm lần theo dấu chân và tìm lại được kho hạt dẻ...',
        badge: 'Mở nút',
        helperTip: '💡 Tìm lối thoát bất ngờ nhưng hợp lý, giải quyết trọn vẹn câu chuyện',
        rows: 3,
      },
    ],
  },
  '4.2': {
    notebookTitle: 'Bốn chặng của câu chuyện tớ',
    akiAdvice:
      'MUỐN - CẢN - LÀM - KẾT. Bốn chặng này chính là bộ xương để buổi sau chúng mình bắt đầu chia câu chuyện thành từng khung truyện!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Bốn chặng Muốn - Cản - Làm - Kết',
    sampleTemplate:
      'Muốn: bạn ấy muốn hái bông hoa Băng Tuyết trên đỉnh núi cao để chữa bệnh cho mẹ\nCản: nhưng dòng suối băng lạnh buốt và bạn ấy cực kỳ sợ bóng tối\nLàm: bạn ấy thử chế tạo ván trượt từ vỏ cây thông và dùng ngọn đuốc sưởi ấm để vượt qua\nKết: cuối cùng bạn ấy đã hái được hoa tuyết kịp thời, mẹ khỏi bệnh và cả khu rừng ăn mừng',
    backpackCategory: 'story-challenges',
    backpackTag: '4 Chặng Thử Thách',
    characterName: 'Hiệp sĩ nhí',
    challengeSummary: [
      'Mở Hồ sơ nhân vật và viết bốn dòng: MUỐN – CẢN – LÀM – KẾT',
      'Chưa nghĩ được CẢN thì nhìn vào ô SỢ hoặc ô DỞ xem có dùng được không',
      'Viết xong đọc to cả bốn dòng một lần. Chỗ nào nghe quá dễ hoặc quá nhanh thì làm cho thử thách khó hơn một chút',
    ],
    checklist: [
      {
        id: 'cl-4-2-1',
        label: 'Đủ 4 chặng: Muốn – Cản – Làm – Kết',
      },
      {
        id: 'cl-4-2-2',
        label: 'Ô Cản có thử thách lấy từ ô Sợ hoặc ô Dở của bài 3.1',
      },
      {
        id: 'cl-4-2-3',
        label: 'Đọc to cả 4 dòng, không quá dễ hoặc quá nhanh',
      },
    ],
    fields: [
      {
        id: 'stage-want',
        label: '1. Muốn (Mong muốn của nhân vật)',
        prefix: 'Muốn: bạn ấy muốn ',
        placeholder: 'đạt được điều gì hoặc đi tới đâu...',
        rows: 2,
      },
      {
        id: 'stage-obstacle',
        label: '2. Cản (Trở ngại cản bước)',
        prefix: 'Cản: nhưng ',
        placeholder: 'gặp phải khó khăn, trở ngại hoặc nỗi sợ gì...',
        badge: 'Thử thách',
        helperTip:
          '💡 Chưa nghĩ được CẢN thì nhìn vào ô SỢ hoặc ô DỞ của bài 3.1 xem có dùng được không!',
        rows: 2,
      },
      {
        id: 'stage-action',
        label: '3. Làm (Hành động vượt qua)',
        prefix: 'Làm: bạn ấy thử ',
        placeholder: 'thử dùng cách gì, mưu trí hay lòng dũng cảm...',
        rows: 2,
      },
      {
        id: 'stage-resolution',
        label: '4. Kết (Kết cục câu chuyện)',
        prefix: 'Kết: cuối cùng ',
        placeholder: 'kết quả ra sao và nhân vật học được điều gì...',
        rows: 2,
      },
    ],
  },
  '4.3': {
    notebookTitle: 'Bản đồ 8 ô của tớ',
    akiAdvice:
      'Một ô – một việc. Storyboard càng rõ thì lúc tạo tranh thật càng dễ. Gạch đi, vẽ lại thoải mái nhé — đây chính là lúc để sửa!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Bản đồ 8 ô Storyboard',
    sampleTemplate:
      'Ô 1: Sóc Bông thức dậy vươn vai trong hốc cây sồi.\nÔ 2: Phát hiện toàn bộ kho hạt dẻ đã biến mất không dấu vết.\nÔ 3: Lần theo dấu chân nhỏ dẫn ra bìa rừng u tối.\nÔ 4: Gặp bạn Nhím đang sửa chiếc xe gỗ bị gãy bánh.\nÔ 5: Cả hai cùng rơi vào hang đá đen ngòm đầy tiếng gió rít.\nÔ 6: Nhớ ra ánh sáng từ quả bông len thần kỳ trên mũ và thắp sáng.\nÔ 7: Tìm thấy kho hạt dẻ và giúp chuột chũi chia sẻ thức ăn.\nÔ 8: Sóc Bông cùng các bạn ngắm hoàng hôn ấm áp trên đỉnh đồi.',
    backpackCategory: 'storyboard',
    backpackTag: 'Bản đồ 8 ô',
    characterName: 'Biệt đội phiêu lưu',
    challengeSummary: [
      'Lấy câu chuyện MUỐN – CẢN – LÀM – KẾT của buổi trước và chia thành tám ô',
      'Trên giấy: chia tờ giấy làm tám ô, vẽ nhanh bằng hình que. Không cần đẹp',
      'Dưới mỗi ô viết một câu ngắn xem chuyện gì đang xảy ra',
      'Soi lại: có ô nào bị trùng không? có đoạn nào nhảy quá nhanh không? nhìn tám ô có hiểu được chuyện không?',
      'Luật: MỘT Ô – MỘT VIỆC',
    ],
    checklist: [
      {
        id: 'cl-4-3-1',
        label: 'Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước',
      },
      {
        id: 'cl-4-3-2',
        label: 'Dưới mỗi ô viết một câu ngắn (Một ô — Một việc)',
      },
      {
        id: 'cl-4-3-3',
        label: 'Soi lại: không có ô nào trùng việc, nhìn 8 ô hiểu được chuyện',
      },
    ],
    fields: [
      {
        id: 'panel-1',
        label: 'Ô 1',
        prefix: 'Ô 1: ',
        placeholder: 'Chuyện gì xảy ra ở ô 1...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
      {
        id: 'panel-2',
        label: 'Ô 2',
        prefix: 'Ô 2: ',
        placeholder: 'Chuyện gì xảy ra ở ô 2...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
      {
        id: 'panel-3',
        label: 'Ô 3',
        prefix: 'Ô 3: ',
        placeholder: 'Chuyện gì xảy ra ở ô 3...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
      {
        id: 'panel-4',
        label: 'Ô 4',
        prefix: 'Ô 4: ',
        placeholder: 'Chuyện gì xảy ra ở ô 4...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
      {
        id: 'panel-5',
        label: 'Ô 5',
        prefix: 'Ô 5: ',
        placeholder: 'Chuyện gì xảy ra ở ô 5...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
      {
        id: 'panel-6',
        label: 'Ô 6',
        prefix: 'Ô 6: ',
        placeholder: 'Chuyện gì xảy ra ở ô 6...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
      {
        id: 'panel-7',
        label: 'Ô 7',
        prefix: 'Ô 7: ',
        placeholder: 'Chuyện gì xảy ra ở ô 7...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
      {
        id: 'panel-8',
        label: 'Ô 8',
        prefix: 'Ô 8: ',
        placeholder: 'Chuyện gì xảy ra ở ô 8...',
        helperTip:
          '💡 MỘT Ô — MỘT VIỆC. Chia giấy làm 8 ô vẽ nhanh hình que trên giấy trước, rồi gõ 1 câu ngắn vào đây',
        rows: 2,
      },
    ],
  },
  '4.5': {
    notebookTitle: 'Lời thoại và tên truyện của tớ',
    akiAdvice:
      'Tớ có thể giúp các cậu vẽ truyện, nhưng các cậu mới là người nghĩ ra câu chuyện. Nhân vật, chuyện gì xảy ra, nhân vật nói gì và cuốn truyện có tên gì — những phần ấy mang ý tưởng của các cậu!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Lời thoại 8 khung & Tên truyện',
    sampleTemplate:
      'Khung 1: "Một buổi sáng thật trong lành!"\nKhung 2: "Á! Có dấu chân ai dưới gốc sồi thế này?"\nKhung 3: "Đừng chạm vào, coi chừng nguy hiểm đấy!"\nKhung 4: "Cậu là ai? Đừng sợ, tớ tới giúp đây!"\nKhung 5: "Ôi không, trời bắt đầu tối đen rồi!"\nKhung 6: "Nắm lấy tay tớ! Chúng ta cùng bật đèn soi đường!"\nKhung 7: "A! Kho hạt dẻ ở đây rồi!"\nKhung 8: "Cảm ơn cậu nhé, người bạn dũng cảm nhất!"\nTên truyện: Bí Ẩn Dấu Chân Bìa Rừng\nTác giả: Họa sĩ & Nhà văn nhí Sóc Bông',
    backpackCategory: 'comic-script',
    backpackTag: 'Lời thoại truyện tranh',
    characterName: 'Tác giả truyện',
    challengeSummary: [
      'Viết lời thoại cho tám khung, tối đa hai bong bóng mỗi khung',
      'Viết thật ngắn, giống cách mình nói ngoài đời. Tranh đã kể được thì không cần chữ kể lại lần nữa',
      'Đọc to toàn bộ một lượt rồi rút gọn những câu còn dài',
      'Đặt tên truyện — tên hay nên gợi thêm một chút chuyện, đừng chỉ nói thứ mình đã nhìn thấy',
      'Làm bìa có tên truyện, nhân vật chính và tên tác giả là chính con',
    ],
    checklist: [
      {
        id: 'cl-4-5-1',
        label: 'Viết lời thoại 8 khung (tối đa 2 bong bóng/khung, ngắn như lời nói ngoài đời)',
      },
      {
        id: 'cl-4-5-2',
        label: 'Đọc to toàn bộ một lượt rồi rút gọn câu còn dài',
      },
      {
        id: 'cl-4-5-3',
        label: 'Đặt tên truyện & ghi rõ tên tác giả',
      },
    ],
    fields: [
      {
        id: 'dialogue-1',
        label: 'Khung 1',
        prefix: 'Khung 1: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'dialogue-2',
        label: 'Khung 2',
        prefix: 'Khung 2: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'dialogue-3',
        label: 'Khung 3',
        prefix: 'Khung 3: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'dialogue-4',
        label: 'Khung 4',
        prefix: 'Khung 4: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'dialogue-5',
        label: 'Khung 5',
        prefix: 'Khung 5: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'dialogue-6',
        label: 'Khung 6',
        prefix: 'Khung 6: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'dialogue-7',
        label: 'Khung 7',
        prefix: 'Khung 7: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'dialogue-8',
        label: 'Khung 8',
        prefix: 'Khung 8: ',
        placeholder: '“……”  /  “……”',
        helperTip: '💡 Tối đa 2 bong bóng thoại/khung. Viết ngắn như lời nói ngoài đời',
        rows: 2,
      },
      {
        id: 'comic-title',
        label: 'Tên truyện',
        prefix: 'Tên truyện: ',
        placeholder: 'Đặt tên truyện gợi thêm chuyện...',
        badge: 'Quan trọng',
        helperTip: '💡 Tên hay nên gợi thêm một chút chuyện, đừng chỉ nói thứ đã nhìn thấy',
        rows: 1,
      },
      {
        id: 'comic-author',
        label: 'Tác giả',
        prefix: 'Tác giả: ',
        placeholder: 'Tên tác giả là chính con...',
        rows: 1,
      },
    ],
  },
  '5.1': {
    notebookTitle: 'Bộ sưu tập 12 món của tớ',
    akiAdvice:
      'Bí thì đứng dậy đi nhìn — trong bếp, ngăn kéo của bà, góc bàn học, con ngõ trước nhà — hoặc đi hỏi một người. Chọn một chủ đề thật gần với mình nhé!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Bộ sưu tập 12 món',
    sampleTemplate:
      'Chủ đề của tớ: Những món đồ trong ngăn kéo của bà\n1. Chiếc kính lão gọng đồng   2. Cuộn chỉ ngũ sắc   3. Cúc áo ngọc bích   4. Chiếc kéo bấm hình chim sẻ\n5. Hộp dầu tràm thơm lừng    6. Thỏi sáp ong vàng óng  7. Thước dây mềm cuộn tròn  8. Chiếc chuông đồng tí hon\n9. Chiếc chìa khóa gỉ sét    10. Chiếc trâm cài tóc   11. Bút mực ngòi mạ vàng    12. Hạt ngọc trai phát sáng',
    backpackCategory: 'tcg-collection',
    backpackTag: 'Bộ sưu tập 12 món',
    characterName: 'Nhà sưu tập thẻ',
    challengeSummary: [
      'Chọn một chủ đề thật gần với mình, hoặc chủ đề mình thích ơi là thích',
      'Tìm đủ 12 thứ cùng một nhóm',
      'Đọc lại cả danh sách: có món nào trùng không? có món nào quá nhạt nhẽo không?',
      'Bí thì đứng dậy đi nhìn — trong bếp, ngăn kéo của bà, góc bàn học, con ngõ trước nhà — hoặc đi hỏi một người',
    ],
    checklist: [
      {
        id: 'cl-5-1-1',
        label: 'Chọn 1 chủ đề gần gũi',
      },
      {
        id: 'cl-5-1-2',
        label: 'Tìm đủ 12 thứ cùng một nhóm',
      },
      {
        id: 'cl-5-1-3',
        label: 'Đọc lại danh sách và không có món nào bị trùng hoặc quá nhạt',
      },
    ],
    fields: [
      {
        id: 'collection-theme',
        label: 'Chủ đề của tớ',
        prefix: 'Chủ đề của tớ: ',
        placeholder: 'Ví dụ: Những món đồ trong ngăn kéo của bà / Thần thú rừng xanh...',
        badge: 'Bắt buộc',
        helperTip: '💡 Chọn một chủ đề thật gần với mình hoặc chủ đề con thích mê',
        rows: 1,
      },
      {
        id: 'items-group-1',
        label: 'Nhóm 1 (Món 1 -> 4)',
        prefix: '1. ……   2. ……   3. ……   4. ……',
        placeholder: '1. Chiếc kính lão   2. Cuộn chỉ ngũ sắc   3. Cúc áo ngọc bích   4. Kéo bấm...',
        rows: 2,
      },
      {
        id: 'items-group-2',
        label: 'Nhóm 2 (Món 5 -> 8)',
        prefix: '5. ……   6. ……   7. ……   8. ……',
        placeholder: '5. Hộp dầu tràm   6. Thỏi sáp ong   7. Thước dây   8. Chuông đồng...',
        rows: 2,
      },
      {
        id: 'items-group-3',
        label: 'Nhóm 3 (Món 9 -> 12)',
        prefix: '9. ……   10. ……  11. ……  12. ……',
        placeholder: '9. Chìa khóa gỉ   10. Trâm cài   11. Bút mực vàng   12. Hạt ngọc trai...',
        rows: 2,
      },
    ],
  },
  '5.2': {
    notebookTitle: 'Bảng thiết kế bộ thẻ của tớ',
    akiAdvice:
      'Mỗi lá có cùng một túi điểm: đúng 12 điểm chia vào ba ô SỨC – NHANH – KHÉO. Mạnh chỗ này thì phải bớt chỗ khác. Không lá nào giỏi hết mọi thứ!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: 12 lá bài Tổng 12 điểm',
    sampleTemplate:
      'Lá 1: Tên Sóc Bông · Sức 3 · Nhanh 6 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Nhảy vọt cành cây\nLá 2: Tên Gấu Bự · Sức 7 · Nhanh 2 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Đấm vỡ đá tảng\nLá 3: Tên Cáo Mẹo · Sức 2 · Nhanh 4 · Khéo 6 · Tổng 12 · Kỹ năng riêng: Ảo thuật đổi chỗ\nLá 4: Tên Nhím Gai · Sức 4 · Nhanh 3 · Khéo 5 · Tổng 12 · Kỹ năng riêng: Giáp gai phản đòn\n... (làm đủ đến Lá 12, mỗi lá Tổng điểm = đúng 12)',
    backpackCategory: 'tcg-balance',
    backpackTag: 'Bảng chỉ số thẻ bài',
    characterName: 'Nhà thiết kế game',
    challengeSummary: [
      'Mỗi lá được phát đúng một túi 12 điểm, chia vào ba ô: SỨC – NHANH – KHÉO',
      'Luật: mạnh chỗ này thì phải bớt chỗ khác. Không lá nào giỏi hết mọi thứ',
      'Với từng lá ghi đủ: Tên thẻ – Sức – Nhanh – Khéo – Tổng điểm – Kỹ năng riêng',
      'Kiểm tra: cả 12 lá đều phải có tổng bằng 12. Có lá nào mạnh hết ba ô không? có lá nào yếu quá không?',
    ],
    checklist: [
      {
        id: 'cl-5-2-1',
        label: 'Mỗi lá đủ: Tên, 3 chỉ số, Tổng 12, Kỹ năng riêng',
      },
      {
        id: 'cl-5-2-2',
        label: 'Cả 12 lá đều có Tổng điểm = đúng 12',
      },
      {
        id: 'cl-5-2-3',
        label: 'Không có lá nào quá mạnh hay quá yếu',
      },
    ],
    fields: [
      {
        id: 'cards-tier-1',
        label: 'Lá 1 đến Lá 4',
        prefix: 'Lá 1 -> 4: Tên …… · Sức … · Nhanh … · Khéo … · Tổng 12 · Kỹ năng riêng: ……',
        placeholder:
          'Lá 1: Tên Sóc Bông · Sức 3 · Nhanh 6 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Nhảy cành cây...',
        badge: 'Tổng = 12',
        helperTip: '💡 Cả ba chỉ số Sức + Nhanh + Khéo cộng lại BẮT BUỘC bằng đúng 12',
        rows: 4,
      },
      {
        id: 'cards-tier-2',
        label: 'Lá 5 đến Lá 8',
        prefix: 'Lá 5 -> 8: Tên …… · Sức … · Nhanh … · Khéo … · Tổng 12 · Kỹ năng riêng: ……',
        placeholder:
          'Lá 5: Tên Cáo Lửa · Sức 4 · Nhanh 5 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Phun lửa...',
        badge: 'Tổng = 12',
        helperTip: '💡 Mạnh chỗ này thì phải bớt chỗ khác, không có lá nào giỏi cả ba ô',
        rows: 4,
      },
      {
        id: 'cards-tier-3',
        label: 'Lá 9 đến Lá 12',
        prefix: 'Lá 9 -> 12: Tên …… · Sức … · Nhanh … · Khéo … · Tổng 12 · Kỹ năng riêng: ……',
        placeholder:
          'Lá 9: Tên Rồng Băng · Sức 6 · Nhanh 3 · Khéo 3 · Tổng 12 · Kỹ năng riêng: Hơi thở băng...',
        badge: 'Tổng = 12',
        helperTip: '💡 Kiểm tra lại: Không có lá nào quá mạnh hay quá yếu',
        rows: 4,
      },
    ],
  },
  '5.4': {
    notebookTitle: 'Luật chơi của tớ',
    akiAdvice:
      'Nói luật của cậu trước – AKI giúp viết cho rõ – rồi phải chơi thử. Luật chưa chơi thử thì chưa phải luật hoàn chỉnh!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: 5 câu hỏi vàng & Thử nghiệm',
    sampleTemplate:
      '1. Có mấy người chơi: 2 người chơi đấu kháng\n2. Ai đi trước: Người đổ xúc xắc điểm cao hơn được đi trước\n3. Mỗi lượt người chơi làm gì: Lần lượt rút 1 thẻ trên tay và tung xúc xắc chọn chỉ số so tài\n4. So thẻ thế nào, nếu bằng nhau thì sao: Ai có điểm chỉ số cao hơn ăn thẻ của đối thủ; nếu bằng điểm thì mỗi bên rút thêm 1 thẻ để so tiếp\n5. Khi nào kết thúc và ai thắng: Ai ăn được 5 thẻ của đối thủ trước là người chiến thắng\nChỗ cả nhà phải dừng lại hỏi khi chơi thử: Khi tung vào mặt ngôi sao xúc xắc chưa biết tính sao, tớ đã bổ sung: Mặt sao được cộng thêm 3 điểm vào chỉ số bất kỳ!',
    backpackCategory: 'game-rules',
    backpackTag: 'Luật chơi 5 câu',
    characterName: 'Trọng tài game',
    challengeSummary: [
      'Trả lời đủ 5 câu hỏi bằng lời của mình, ngắn cũng được',
      'Rồi nhờ AKI viết lại thành một bộ luật ngắn, dễ hiểu — AKI chỉ sắp xếp cho rõ, không tự thêm luật mới',
      'Rủ ít nhất một người trong nhà chơi thử',
      'Chỗ nào họ phải dừng lại hỏi “Tiếp theo làm gì?” hay “Thế này tính sao?” thì đánh dấu lại, bổ sung rồi nhờ AKI sửa lần nữa',
    ],
    checklist: [
      {
        id: 'cl-5-4-1',
        label: 'Trả lời đủ 5 câu hỏi luật chơi bằng lời của mình',
      },
      {
        id: 'cl-5-4-2',
        label: 'Rủ ít nhất 1 người nhà chơi thử thật một ván',
      },
      {
        id: 'cl-5-4-3',
        label: 'Ghi lại chỗ người nhà thắc mắc và đã bổ sung sửa luật',
      },
    ],
    fields: [
      {
        id: 'q1-players',
        label: '1. Có mấy người chơi?',
        prefix: '1. Có mấy người chơi: ',
        placeholder: '2 người chơi, hoặc 2-4 người...',
        rows: 2,
      },
      {
        id: 'q2-who-first',
        label: '2. Ai đi trước?',
        prefix: '2. Ai đi trước: ',
        placeholder: 'Oẳn tù tì, người đổ xúc xắc cao hơn...',
        rows: 2,
      },
      {
        id: 'q3-turn-action',
        label: '3. Mỗi lượt người chơi làm gì?',
        prefix: '3. Mỗi lượt người chơi làm gì: ',
        placeholder: 'Rút thẻ, tung xúc xắc, so điểm...',
        rows: 2,
      },
      {
        id: 'q4-compare-cards',
        label: '4. So thẻ thế nào, nếu bằng nhau thì sao?',
        prefix: '4. So thẻ thế nào, nếu bằng nhau thì sao: ',
        placeholder: 'So chỉ số Sức/Nhanh/Khéo, nếu bằng điểm thì...',
        rows: 2,
      },
      {
        id: 'q5-win-end',
        label: '5. Khi nào kết thúc và ai thắng?',
        prefix: '5. Khi nào kết thúc và ai thắng: ',
        placeholder: 'Ai hết bài trước, ai gom đủ điểm trước...',
        rows: 2,
      },
      {
        id: 'q6-test-play-notes',
        label: 'Chỗ cả nhà phải dừng lại hỏi khi chơi thử',
        prefix: 'Chỗ cả nhà phải dừng lại hỏi khi chơi thử: ',
        placeholder: 'Ghi lại chỗ mọi người dừng lại hỏi và luật con đã bổ sung...',
        badge: 'Bước quan trọng nhất',
        helperTip:
          '💡 Rủ người nhà chơi thử thật một ván! Chỗ nào bị dừng lại hỏi thì ghi vào đây rồi sửa luật',
        rows: 3,
      },
    ],
  },
  '5.5': {
    notebookTitle: 'Bàn cờ và ván chơi thật của tớ',
    akiAdvice:
      'Trò chơi hay là trò chơi công bằng. Trò chơi chỉ thật sự hoàn thành khi có người chơi nó. Vì một trò chơi không phải để nằm đẹp trong hộp. Nó được làm ra để mọi người cùng chơi!',
    sampleHelperTitle: 'Cách làm kịch bản mẫu: Bàn cờ và ván chơi thật',
    sampleTemplate:
      'Xuất phát: Ô Cổng Làng Rừng Sồi, mỗi người chọn một quân cờ hạt dẻ\nĐường đi: 20 ô, đánh số từ 1 đến 20 quanh bờ hồ Mùa Thu\nÔ đặc biệt của tớ: “MÈO CƯỚP ĐỒ ĂN” ở ô số 7 — luật: Bị mèo quấy rầy, phải bỏ một lượt để đuổi mèo\nĐích: Lâu đài Quả Sồi Vàng ở ô 20, ai về đích trước là người chiến thắng\nSau khi chơi thử với cả nhà, tớ đã sửa: Bố bảo đường đi hơi ngắn, tớ đã thêm ô số 12 "Cơn lốc xoáy" lùi lại 2 bước để gay cấn hơn!',
    backpackCategory: 'board-game',
    backpackTag: 'Bàn cờ sáng tạo',
    characterName: 'Kiến trúc sư bàn cờ',
    challengeSummary: [
      'Làm bàn cờ đủ bốn thứ: XUẤT PHÁT – ĐƯỜNG ĐI – Ô ĐẶC BIỆT – ĐÍCH. (Nhà Dori quên mất ô ĐÍCH nên cả nhà cứ đi vòng vòng mãi)',
      'Ô đặc biệt là chỗ vui nhất — tự nghĩ luật riêng, tốt nhất lấy từ một chuyện vui trong nhà mình',
      'Làm vỏ hộp để cất 12 thẻ, bàn cờ và luật chơi. Phần in, cắt hoặc gấp khó thì nhờ người lớn giúp',
      'Rồi rủ cả nhà chơi một ván thật từ đầu đến cuối. Chỗ nào chưa hiểu, chưa vui hoặc còn tranh luận thì sửa lại',
    ],
    checklist: [
      {
        id: 'cl-5-5-1',
        label: 'Bàn cờ đủ 4 thứ: Xuất phát – Đường đi – Ô đặc biệt – Đích',
      },
      {
        id: 'cl-5-5-2',
        label: 'Ô đặc biệt có luật riêng lấy từ chuyện trong nhà',
      },
      {
        id: 'cl-5-5-3',
        label: 'Đã chơi thử 1 ván thật với cả nhà và ghi lại chỗ đã sửa',
      },
    ],
    fields: [
      {
        id: 'board-start',
        label: '1. Xuất phát',
        prefix: 'Xuất phát: ',
        placeholder: 'Cổng làng, vị trí xuất phát, quân cờ...',
        rows: 2,
      },
      {
        id: 'board-path',
        label: '2. Đường đi',
        prefix: 'Đường đi: ',
        placeholder: '…… ô, đánh số từ 1 đến ……',
        rows: 2,
      },
      {
        id: 'board-special',
        label: '3. Ô đặc biệt & luật riêng',
        prefix: 'Ô đặc biệt của tớ: “……” — luật: ',
        placeholder: 'Tên ô đặc biệt và luật chơi...',
        badge: 'Chỗ vui nhất',
        helperTip: '💡 Tự nghĩ luật riêng, tốt nhất lấy từ một chuyện vui có thật trong nhà mình',
        rows: 3,
      },
      {
        id: 'board-finish',
        label: '4. Đích',
        prefix: 'Đích: ',
        placeholder: 'Ô về đích, điều kiện chiến thắng...',
        rows: 2,
      },
      {
        id: 'board-playtest-revision',
        label: 'Sau khi chơi thử với cả nhà, tớ đã sửa...',
        prefix: 'Sau khi chơi thử với cả nhà, tớ đã sửa: ',
        placeholder: 'Chỗ mọi người thắc mắc hoặc chưa hiểu và cách con sửa lại...',
        badge: 'Quan trọng',
        helperTip: '💡 Rủ cả nhà chơi 1 ván thật từ đầu đến cuối và ghi lại điểm cải tiến',
        rows: 3,
      },
    ],
  },
}

// Chuẩn hóa và tự động điền creativeEngineMode & options cho 22 bài học theo LESSON_ENGINE_MAP
for (const lesson of ISLAND_CURRICULUM_LESSONS) {
  const mode = LESSON_ENGINE_MAP[lesson.lessonNumber] || 'magic-keys'
  const p = lesson.journey.stage5_practice
  p.creativeEngineMode = mode

  if (mode === 'creative-notebook') {
    p.practiceParts = []
    if (!p.notebookConfig && DEFAULT_NOTEBOOK_CONFIGS[lesson.lessonNumber]) {
      p.notebookConfig = DEFAULT_NOTEBOOK_CONFIGS[lesson.lessonNumber]
    }
  } else if (mode === 'magic-keys' && !p.fourKeysOptions) {
    p.fourKeysOptions = DEFAULT_FOUR_KEYS_OPTIONS
  } else if (mode === 'style-prism' && (!p.stylePrismOptions || p.stylePrismOptions.length < 4)) {
    p.stylePrismOptions = DEFAULT_STYLE_PRISM_OPTIONS
  } else if (mode === 'prompt-doctor' && !p.promptDoctorCase) {
    p.promptDoctorCase = DEFAULT_PROMPT_DOCTOR_CASE
  } else if (mode === 'layer-stacking' && !p.layerStackingOptions) {
    p.layerStackingOptions = DEFAULT_LAYER_STACKING_OPTIONS
  } else if (mode === 'identity-lock') {
    if (!p.lockedFeatures || p.lockedFeatures.length < 3) p.lockedFeatures = DEFAULT_LOCKED_FEATURES
    if (!p.expressionOptions || p.expressionOptions.length < 6) p.expressionOptions = DEFAULT_EXPRESSIONS
  } else if (mode === 'card-forge' && !p.cardForgeOptions) {
    p.cardForgeOptions = DEFAULT_CARD_FORGE_OPTIONS
  }
}

export const ISLAND_CURRICULUM_MAP: Record<string, IslandCurriculumLesson> = {}
for (const item of ISLAND_CURRICULUM_LESSONS) {
  ISLAND_CURRICULUM_MAP[item.id] = item
  ISLAND_CURRICULUM_MAP[item.slug] = item
  ISLAND_CURRICULUM_MAP[item.lessonNumber] = item
}

// Bảng từ khóa nhận diện bài học kể cả khi quest.id là database UUID
const LESSON_KEYWORD_PATTERNS: Array<{ key: string; keywords: string[] }> = [
  { key: '1.1', keywords: ['một từ hay năm từ', 'mot tu hay nam tu', '1 từ hay 5 từ', 'mèo mướp', 'chú mèo', '1.1'] },
  { key: '1.2', keywords: ['bốn chiếc chìa khoá', 'bốn chiếc chìa khóa', 'bon chiec chia khoa', '4 chìa', 'cốc sứ', '1.2'] },
  { key: '1.3', keywords: ['úm ba la', 'um ba la', 'biến hình', 'phong cách nghệ thuật', 'bảng 4 phong cách', '1.3'] },
  { key: '1.4', keywords: ['kỹ sư', 'bác sĩ sửa tranh', 'sửa tay hiệp sĩ', 'ky su tai ba', 'kỹ sư tài ba', '1.4'] },
  { key: '2.1', keywords: ['bức tranh biết nói', 'buc tranh biet noi', 'chú cáo lông đỏ', 'cáo lông đỏ', '2.1'] },
  { key: '2.2', keywords: ['ngôi sao và 3 lớp', 'ai là ngôi sao', 'thuyền buồm', '3 lớp', 'ngôi sao', '2.2'] },
  { key: '2.3', keywords: ['cảm xúc và ánh sáng', 'cảm xúc của sắc màu', 'ngọn hải đăng', 'sắc màu', 'ánh sáng', '2.3'] },
  { key: '2.4', keywords: ['khung tranh a3', 'mảnh ghép hoàn hảo', 'khung tranh', 'gia đình thú', '2.4'] },
  { key: '3.1', keywords: ['hồ sơ adn', 'hồ sơ biệt đội', 'hiệp sĩ cáo lửa', 'adn', '3.1'] },
  { key: '3.2', keywords: ['khóa 3 điểm', 'mật mã nhận diện', 'sóc bông', 'khoa 3 diem', 'mật mã', '3.2'] },
  { key: '3.3', keywords: ['lưới 6 biểu cảm', 'biến hoá biểu cảm', 'đổi mặt', 'biểu cảm', '3.3'] },
  { key: '3.4', keywords: ['căn cứ hốc cây', 'căn cứ bí mật', 'hốc cây', 'căn cứ', '3.4'] },
  { key: '4.1', keywords: ['mở lối 3 cổng', '3 cổng của vương quốc', '3 cổng', 'khởi đầu', 'thắt nút', '4.1'] },
  { key: '4.2', keywords: ['vượt 4 ải', '04 chặng thử thách', '4 chặng', 'muốn - cản', '4.2'] },
  { key: '4.3', keywords: ['storyboard 8 ô', 'bản đồ 8 ô - p1', 'bản đồ 8 ô - phần 1', 'hình que', '4.3'] },
  { key: '4.4', keywords: ['vương miện bìa truyện', 'bản đồ 8 ô - p2', 'bản đồ 8 ô - phần 2', 'khoá', '4.4'] },
  { key: '4.5', keywords: ['khai mạc hội chợ', 'vương miện hoàn hảo', 'comic book', 'hội chợ truyện tranh', '4.5'] },
  { key: '5.1', keywords: ['lá bài đầu tiên', 'săn lùng bộ sưu tập', 'rồng băng', 'thú cưng nguyên tố', '5.1'] },
  { key: '5.2', keywords: ['ngân sách 20 điểm', 'phù phép mặt thẻ', 'ngân sách 20', '5.2'] },
  { key: '5.3', keywords: ['lưng thẻ ma thuật', 'bánh răng ma thuật', 'khoá thẻ', 'khoa the', '5.3'] },
  { key: '5.4', keywords: ['tương khắc ngũ hành', 'luật 5 câu', 'luật chơi', 'luat choi', '5.4'] },
  { key: '5.5', keywords: ['đấu trường & giải đấu', 'đấu trường khai mở', 'giải đấu gia đình', 'bàn cờ', '5.5'] },
]

/**
 * Tìm bài học chuẩn trong thư viện SSOT 22 bài học Aiki Islands
 * Hỗ trợ nhận diện linh hoạt theo id, slug, số hiệu X.Y, hoặc từ khóa tiêu đề (ngay cả khi quest.id là database UUID)
 */
export function findIslandCurriculum(
  quest?: Partial<QuestDetail> | { id?: string; slug?: string; title?: string } | null
): IslandCurriculumLesson | undefined {
  if (!quest) return undefined

  const q = quest as Record<string, any>
  const id = (q.id || '').toLowerCase().trim()
  const slug = (q.slug || '').toLowerCase().trim()
  const title = (q.title || '').toLowerCase().trim()

  // 1. Khớp chính xác ID hoặc Slug
  if (ISLAND_CURRICULUM_MAP[id]) return ISLAND_CURRICULUM_MAP[id]
  if (ISLAND_CURRICULUM_MAP[slug]) return ISLAND_CURRICULUM_MAP[slug]

  // 2. Nhận diện qua mẫu regex bai-X-Y hoặc bai_X_Y
  const idOrSlug = `${id} ${slug}`
  const islandLessonMatch = idOrSlug.match(/bai[-_](\d+)[-_](\d+)/i)
  if (islandLessonMatch) {
    const key = `${islandLessonMatch[1]}.${islandLessonMatch[2]}`
    if (ISLAND_CURRICULUM_MAP[key]) return ISLAND_CURRICULUM_MAP[key]
    const idKey = `bai-${islandLessonMatch[1]}-${islandLessonMatch[2]}`
    if (ISLAND_CURRICULUM_MAP[idKey]) return ISLAND_CURRICULUM_MAP[idKey]
  }

  // 3. Nhận diện qua số bài X.Y trong tiêu đề hoặc slug
  const titleAndSlug = `${title} ${slug} ${id}`
  const dotMatch = titleAndSlug.match(/(\d+)\.(\d+)/)
  if (dotMatch) {
    const dotKey = `${dotMatch[1]}.${dotMatch[2]}`
    if (ISLAND_CURRICULUM_MAP[dotKey]) return ISLAND_CURRICULUM_MAP[dotKey]
  }

  // 4. Nhận diện bằng từ khóa tiêu đề (hữu hiệu khi quest.id là UUID của DB)
  for (const item of LESSON_KEYWORD_PATTERNS) {
    for (const kw of item.keywords) {
      if (title.includes(kw) || slug.includes(kw)) {
        return ISLAND_CURRICULUM_MAP[item.key]
      }
    }
  }

  return undefined
}
