export interface GoldenKeyOption {
  id: string
  label: string
  text: string
}

export interface GoldenKeyVocabulary {
  descriptions: GoldenKeyOption[]
  actions: GoldenKeyOption[]
  contexts: GoldenKeyOption[]
}

export const VOCABULARY_BY_TYPE: Record<string, GoldenKeyVocabulary> = {
  cat: {
    descriptions: [
      { id: 'beo-tron', label: 'Mèo mướp vàng béo tròn', text: 'mèo mướp vàng béo tròn' },
      { id: 'chuong-vang', label: 'Đeo chuông vàng cổ', text: 'đeo chuông vàng ở cổ' },
      { id: 'long-van', label: 'Lông vằn vàng óng', text: 'lông vằn vàng óng' },
    ],
    actions: [
      { id: 'dao-buoc', label: 'Đang nằm ngủ cuộn tròn', text: 'đang nằm ngủ cuộn tròn' },
      { id: 'liem-chan', label: 'Liếm chân sạch sẽ', text: 'liếm chân sạch sẽ' },
      { id: 'vuon-vai', label: 'Vươn vai lười biếng', text: 'vươn vai lười biếng' },
    ],
    contexts: [
      { id: 'them-nha', label: 'Trên chiếc ghế mây cạnh cửa sổ', text: 'trên chiếc ghế mây cạnh cửa sổ' },
      { id: 'hien-nha', label: 'Hiên nhà ngập hoa', text: 'ở hiên nhà ngập hoa' },
      { id: 'tham-co', label: 'Bãi cỏ xanh mướt', text: 'trên bãi cỏ xanh mướt' },
    ],
  },
  fish: {
    descriptions: [
      { id: 'vay-anh-bac', label: 'Vảy ánh bạc lấp lánh', text: 'vảy ánh bạc lấp lánh' },
      { id: 'duoi-lua', label: 'Đuôi xòe như tơ lụa', text: 'đuôi xòe như tơ lụa' },
      { id: 'bung-tron', label: 'Bụng tròn màu cam đào', text: 'bụng tròn màu cam đào' },
    ],
    actions: [
      { id: 'dop-bot', label: 'Đang đớp bọt nước', text: 'đang đớp bọt nước' },
      { id: 'luon-vong', label: 'Lượn vòng quanh rong biển', text: 'lượn vòng quanh rong biển' },
      { id: 'boi-lung-lo', label: 'Bơi lững lờ dưới nắng', text: 'bơi lững lờ dưới nắng' },
    ],
    contexts: [
      { id: 'be-soi', label: 'Trong bể cá nhỏ rải sỏi', text: 'trong bể cá nhỏ rải sỏi' },
      { id: 'ho-sen', label: 'Giữa hồ sen thơm ngát', text: 'giữa hồ sen thơm ngát' },
      { id: 'thuy-sinh', label: 'Cạnh cây thủy sinh xanh biếc', text: 'cạnh cây thủy sinh xanh biếc' },
    ],
  },
  dog: {
    descriptions: [
      { id: 'tai-cup', label: 'Lông vàng hai tai cụp', text: 'lông vàng hai tai cụp' },
      { id: 'trang-dom', label: 'Trắng đốm nâu quanh mắt', text: 'trắng đốm nâu quanh mắt' },
      { id: 'khan-do', label: 'Đeo khăn đỏ ở cổ', text: 'đeo khăn đỏ ở cổ' },
    ],
    actions: [
      { id: 'duoi-bong', label: 'Đang chạy đuổi quả bóng', text: 'đang chạy đuổi quả bóng' },
      { id: 'vay-duoi', label: 'Đang ngồi vẫy đuôi chờ', text: 'đang ngồi vẫy đuôi chờ' },
      { id: 'tha-dep', label: 'Đang tha một chiếc dép', text: 'đang tha một chiếc dép' },
    ],
    contexts: [
      { id: 'san-gach-do', label: 'Ở góc sân gạch đỏ', text: 'ở góc sân gạch đỏ' },
      { id: 'tham-phong-khach', label: 'Trên thảm phòng khách', text: 'trên thảm phòng khách' },
    ],
  },
  bicycle: {
    descriptions: [
      { id: 'son-xanh-bong', label: 'Cũ sơn xanh bong từng mảng', text: 'cũ sơn xanh bong từng mảng' },
      { id: 'mini-gio-may', label: 'Xe mini có giỏ mây trước', text: 'xe mini có giỏ mây trước' },
      { id: 'mau-do-chuong-sang', label: 'Màu đỏ còn mới chuông sáng', text: 'màu đỏ còn mới chuông sáng' },
    ],
    actions: [
      { id: 'nghieng-vao-tuong', label: 'Đang dựa nghiêng vào tường', text: 'đang dựa nghiêng vào tường' },
      { id: 'cho-bo-rau', label: 'Giỏ trước đang chở bó rau', text: 'giỏ trước đang chở bó rau' },
      { id: 'do-nen-dat', label: 'Đang đổ nằm trên nền đất', text: 'đang đổ nằm trên nền đất' },
    ],
    contexts: [
      { id: 'goc-san-gach', label: 'Ở góc sân gạch', text: 'ở góc sân gạch' },
      { id: 'truoc-cong-truong', label: 'Trước cổng trường', text: 'trước cổng trường' },
    ],
  },
}

// SSOT Từ vựng chính xác cho Bài 1.1: Một từ hay năm từ (Kịch bản Google Sheet FIX)
export const VOCABULARY_1_1: Record<string, GoldenKeyVocabulary> = {
  cat: {
    descriptions: [
      { id: 'long-mau-trang', label: 'Lông màu trắng', text: 'lông màu trắng' },
    ],
    actions: [
      { id: 'dang-nam-nham-mat', label: 'Đang nằm nhắm mắt', text: 'đang nằm nhắm mắt' },
    ],
    contexts: [
      { id: 'o-truoc-san', label: 'Ở trước sân', text: 'ở trước sân' },
    ],
  },
}
