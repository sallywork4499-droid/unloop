import type { LifeArea, LoopState, LoopType } from '../types'

/**
 * Gợi ý tự động dựa trên nội dung — app điền sẵn, người dùng chỉ liếc và sửa chỗ sai.
 * Rule-based đơn giản (chạy local, không cần AI), đủ đúng cho đa số trường hợp tiếng Việt.
 */

const AREA_RULES: [LifeArea, RegExp][] = [
  ['family', /(mẹ|bố |ba |con |vợ|chồng|gia đình|ông |bà |sinh nhật|anh trai|em gái|họ hàng|cháu)/i],
  ['health', /(khám|bệnh|thuốc|sức kho|gym|tập|ngủ|răng|đau|bác sĩ|viện|cân nặng|chạy bộ)/i],
  ['money', /(tiền|lương|thuế|hóa đơn|hoá đơn|nợ|đầu tư|tiết kiệm|chi phí|ngân hàng|bảo hiểm|trả góp)/i],
  ['work', /(sếp|họp|deadline|báo cáo|khách|dự án|công việc|email|slide|đồng nghiệp|cv|tuyển|phỏng vấn|hr|kpi)/i],
  ['growth', /(học|đọc sách|khóa|khoá|tiếng anh|kỹ năng|blog|linkedin|viết bài|luyện|chứng chỉ)/i],
  ['relations', /(bạn bè|cà phê|hẹn|đám cưới|gặp mặt|liên lạc|tụ tập)/i],
  ['admin', /(sửa|giấy tờ|hồ sơ|đăng ký|gia hạn|dọn|mua|đổi|nộp|visa|hộ chiếu|xe|điện nước)/i],
]

export function suggestArea(title: string): LifeArea | undefined {
  for (const [area, re] of AREA_RULES) if (re.test(title)) return area
  return undefined
}

export function suggestType(title: string): LoopType {
  if (/(có nên|hay là|chọn giữa|quyết định|nên .{0,20}không)/i.test(title)) return 'decision'
  if (/(^|\s)(lo |lo$|sợ|buồn|bực|giận|áp lực|stress|chán|mệt mỏi)/i.test(title)) return 'emotion'
  if (/(ý tưởng|muốn thử|muốn học|một ngày|sau này)/i.test(title)) return 'idea'
  return 'action'
}

export function suggestState(
  title: string,
  deadline: string | undefined,
  activeSlotsLeft: number,
): LoopState {
  if (/(chờ|đợi|phản hồi|trả lời|feedback|duyệt)/i.test(title)) return 'waiting'
  if (deadline) {
    const soon = new Date(deadline).getTime() - Date.now() < 3 * 24 * 3600 * 1000
    if (soon && activeSlotsLeft > 0) return 'active'
  }
  if (/(ý tưởng|một ngày|sau này|muốn thử|khi nào rảnh)/i.test(title)) return 'parked'
  if (/(gấp|hôm nay|ngay|khẩn)/i.test(title) && activeSlotsLeft > 0) return 'active'
  return activeSlotsLeft > 0 ? 'active' : 'parked'
}
