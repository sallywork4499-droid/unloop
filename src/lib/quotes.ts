/**
 * Kho trích dẫn từ "Vị thần Thái độ" (You Are a Badass) — Jen Sincero.
 * Trích ngắn & lược dịch (không sao chép nguyên văn dài — tôn trọng bản quyền),
 * phân theo các chủ đề chính của sách và chọn lọc hợp tinh thần Unloop.
 */
export type QuoteTheme = 'worry' | 'mindset' | 'fear' | 'action' | 'self' | 'others' | 'gratitude'

export const QUOTE_THEME_META: Record<QuoteTheme, { icon: string; label: string }> = {
  worry: { icon: '🫧', label: 'Lo âu & buông bỏ' },
  mindset: { icon: '🧠', label: 'Tư duy & niềm tin' },
  fear: { icon: '🔥', label: 'Sợ hãi & vùng an toàn' },
  action: { icon: '⚡', label: 'Hành động & quyết định' },
  self: { icon: '💛', label: 'Yêu lấy chính mình' },
  others: { icon: '🗣', label: 'Người khác nghĩ gì' },
  gratitude: { icon: '🙏', label: 'Biết ơn & tha thứ' },
}

export interface Quote {
  text: string
  theme: QuoteTheme
}

export const QUOTE_SOURCE = 'Jen Sincero, Vị thần Thái độ (lược dịch)'

export const QUOTES: Quote[] = [
  // Lo âu & buông bỏ
  { text: 'Lo lắng chính là cầu nguyện cho những điều bạn không mong muốn.', theme: 'worry' },
  { text: 'Nghi ngờ là kháng cự, niềm tin là buông mình. Lo âu là kháng cự, niềm vui là buông mình.', theme: 'worry' },
  { text: 'Buông mình là ngã tự do về phía sau vào điều chưa biết — và tin rằng Vũ trụ sẽ đỡ lấy bạn.', theme: 'worry' },
  { text: 'Nỗi sợ sẽ luôn ở đó, chực chờ gây rối — nhưng bạn được quyền chọn có tiếp chuyện nó hay không.', theme: 'worry' },

  // Tư duy & niềm tin
  { text: 'Suy nghĩ thành lời nói, lời nói thành niềm tin, niềm tin thành hành động, hành động thành thói quen — và thói quen tạo nên hiện thực của bạn.', theme: 'mindset' },
  { text: 'Bạn phải thay đổi cách nghĩ trước — rồi bằng chứng mới xuất hiện. Sai lầm lớn nhất của chúng ta là làm ngược lại.', theme: 'mindset' },
  { text: 'Hiện thực của bạn được định hình bởi chính niềm tin của bạn.', theme: 'mindset' },
  { text: 'Những gì bạn tự nói với mình mỗi ngày mạnh hơn bạn tưởng rất nhiều.', theme: 'mindset' },
  { text: 'Cuộc đời là ảo ảnh được tạo ra bởi cách bạn nhìn — và nó thay đổi ngay khoảnh khắc bạn chọn nhìn khác đi.', theme: 'mindset' },
  { text: 'Bạn nuôi suy nghĩ nào, suy nghĩ đó lớn lên.', theme: 'mindset' },
  { text: 'Khi bạn nâng cấp hình dung về điều-có-thể và quyết tâm theo đuổi nó, bạn cũng mở ra cho mình phương tiện để đạt được nó.', theme: 'mindset' },

  // Sợ hãi & vùng an toàn
  { text: 'Muốn sống một cuộc đời chưa từng sống, bạn phải làm những việc chưa từng làm.', theme: 'fear' },
  { text: 'Chưa ai làm nên điều gì lớn lao, mới mẻ, đáng để giơ nắm tay ăn mừng — từ trong vùng an toàn của mình.', theme: 'fear' },
  { text: 'Niềm tin là cơ bắp bạn dùng khi quyết định bứt ra khỏi vùng an toàn.', theme: 'fear' },
  { text: 'Muốn đá tung cánh cửa, trước hết bạn phải nhấc chân lên.', theme: 'fear' },

  // Hành động & quyết định
  { text: 'Trì hoãn là hình thức tự phá hoại phổ biến nhất.', theme: 'action' },
  { text: 'Thất bại duy nhất là bỏ cuộc. Mọi thứ còn lại chỉ là thu thập thông tin.', theme: 'action' },
  { text: 'Bạn phải đi từ "muốn" thay đổi cuộc đời sang "quyết định" thay đổi cuộc đời.', theme: 'action' },
  { text: 'Muốn thì có thể ngồi yên trên ghế mà muốn. Quyết định nghĩa là nhảy vào và làm tới cùng.', theme: 'action' },
  { text: 'Nếu nghiêm túc muốn thay đổi, bạn sẽ tìm ra cách. Nếu không, bạn sẽ tìm ra lý do.', theme: 'action' },
  { text: 'Rất nhiều khi ta tưởng mình đã quyết định — thực ra ta chỉ đăng ký "thử cho đến khi thấy khó chịu quá thì thôi".', theme: 'action' },
  { text: 'Việc của bạn không phải là biết "làm thế nào" — mà là biết rõ mình muốn gì, và mở lòng để cách thức xuất hiện.', theme: 'action' },
  { text: 'Bạn không có lỗi vì đời mình từng rối tung. Nhưng bạn có lỗi nếu cứ để nó rối mãi.', theme: 'action' },
  { text: 'Bạn không cần thấy hết con đường — bạn chỉ cần bắt đầu bước.', theme: 'action' },

  // Yêu lấy chính mình
  { text: 'Yêu lấy chính mình — và bạn sẽ không thể bị cản bước.', theme: 'self' },
  { text: 'Hãy cho mình quyền — và phương tiện — để được là chính mình, bất kể ai nghĩ gì.', theme: 'self' },
  { text: 'Bạn là phiên bản duy nhất, trước đây chưa từng có và sau này không bao giờ có lại. Đừng phí nó để cố làm một ai khác.', theme: 'self' },
  { text: 'Hãy đối xử với bản thân như đối xử với người bạn thân nhất của mình.', theme: 'self' },
  { text: 'Khoảnh khắc bạn quyết định không còn chấp nhận những thứ mình vẫn cắn răng chịu đựng — cả cuộc đời bạn dịch chuyển.', theme: 'self' },

  // Người khác nghĩ gì
  { text: 'Người khác nghĩ gì về bạn — chuyện đó chẳng liên quan gì đến bạn, mà liên quan đến chính họ.', theme: 'others' },
  { text: 'Bạn chịu trách nhiệm cho điều mình nói và làm. Bạn không chịu trách nhiệm cho việc người khác phản ứng ra sao.', theme: 'others' },
  { text: 'Đừng phí một giây thời gian quý giá để bận lòng xem ai đó nghĩ gì về bạn.', theme: 'others' },
  { text: 'So sánh mình với người khác là cách nhanh nhất để lấy hết niềm vui khỏi cuộc sống.', theme: 'others' },
  { text: 'Nhìn người khác toả sáng là nguồn cảm hứng tuyệt vời — nhưng so đo với họ là trò tiêu phí sức lực.', theme: 'others' },

  // Biết ơn & tha thứ
  { text: 'Tha thứ không phải là tử tế với người kia — mà là tử tế với chính mình.', theme: 'gratitude' },
  { text: 'Khi thiếu lòng biết ơn, bạn tự cắt mình khỏi nguồn năng lượng tuyệt vời của cuộc sống.', theme: 'gratitude' },
  { text: 'Biết ơn là một trong những trạng thái mạnh mẽ và chuyển hoá nhất mà bạn có thể chọn mỗi ngày.', theme: 'gratitude' },
]

export function quoteOfTheDay(date = new Date()): Quote & { source: string } {
  const start = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / (24 * 3600 * 1000))
  return { ...QUOTES[dayOfYear % QUOTES.length], source: QUOTE_SOURCE }
}
