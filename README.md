# Unloop 🍃

**Tắt vòng lặp, nhẹ cái đầu.**

Mỗi vấn đề chưa xử lý (việc chưa làm, quyết định chưa chốt, nỗi lo chưa gọi tên) là một *open loop* chạy ngầm và chiếm năng lượng não. Unloop là hệ thống đáng tin giúp bạn ghi nhận nhanh, gán trạng thái rõ ràng và đóng vòng lặp đúng cách — dựa trên PRD nghiên cứu về working memory, Zeigarnik effect, cognitive offloading và CBT.

## Tính năng MVP

- **Quick capture** (gõ + giọng nói tiếng Việt) — mọi thứ rơi vào Inbox trong vài giây
- **Clarify just enough** — 3 bước × 30 giây: loại vấn đề → câu hỏi đúng loại → đặt vào đâu
- **State machine đầy đủ**: Inbox → Active / Waiting / Parked → Resolved / **Accepted** / **Not-doing** (chấp nhận và từ chối cũng là cách đóng loop hợp lệ)
- **Giới hạn 5 việc Active** — đúng dung lượng working memory của não
- **Review hằng ngày (5′) & hằng tuần (15′)** — wizard từng bước, xây niềm tin để não thật sự buông
- **Nghi thức đóng loop + rút bài học** (Tình huống → Insight → Nguyên tắc) → thư viện Bài học
- **Privacy-first**: dữ liệu chỉ nằm trên thiết bị (localStorage), có xuất/khôi phục file sao lưu JSON

## Chạy local

```bash
npm install
npm run dev      # mở http://localhost:5173
npm run build    # build production vào dist/
```

## Đăng nhập & kết nối Supabase

App có sẵn màn hình đăng nhập (email + mật khẩu, kèm lựa chọn "Dùng không cần tài khoản"). Form chỉ hoạt động khi đã cấu hình Supabase:

1. Tạo project tại [supabase.com](https://supabase.com) (miễn phí)
2. Vào **Project Settings → API**, copy `Project URL` và `anon public key`
3. Sao chép `.env.example` thành `.env` và điền 2 giá trị đó
4. Chạy lại `npm run dev` (hoặc trên Vercel: thêm 2 biến trong **Settings → Environment Variables** rồi redeploy)

Xác thực dùng `supabase.auth.signInWithPassword` / `signUp` (bật sẵn trong Supabase → Authentication → Email). Hiện tại đăng nhập mới quản lý tài khoản; bước tiếp theo khi muốn đồng bộ dữ liệu: tạo bảng `loops`, `lessons`, `goals` (mirror data model trong `src/types.ts`) + Row Level Security theo `user_id`, rồi thêm sync vào `src/store.tsx`.

## Deploy lên Vercel (5 phút)

**Cách 1 — kéo thả (nhanh nhất):** chạy `npm run build`, vào [vercel.com/new](https://vercel.com/new), kéo thư mục `dist` vào.

**Cách 2 — qua GitHub (khuyên dùng, tự deploy mỗi lần sửa):**

1. Đưa thư mục `unloop` lên một repo GitHub
2. Vào [vercel.com/new](https://vercel.com/new) → Import repo
3. Vercel tự nhận diện Vite — bấm **Deploy** là xong (Build: `npm run build`, Output: `dist`)

**Cách 3 — Vercel CLI:**

```bash
npm i -g vercel
vercel          # làm theo hướng dẫn, nhận link ngay
```

## Kiến trúc

```
src/
  types.ts               # Data model: Loop, Lesson, state machine, helpers
  store.tsx              # State + reducer + localStorage persistence
  App.tsx                # Nav 5 tab: Hôm nay / Inbox / Vòng lặp / Review / Bài học
  components/
    CaptureBar.tsx       # Quick capture (text + Web Speech API vi-VN)
    ClarifyModal.tsx     # Luồng "Clarify just enough" 3 bước
    CloseModal.tsx       # Nghi thức đóng loop + micro-reflection → Lesson
    LoopCard.tsx         # Thẻ hiển thị loop
    Onboarding.tsx       # FTUE: giải thích open loops + brain dump 3 phút
  views/
    Today.tsx            # ≤5 Active + đến hẹn hôm nay + stats
    Inbox.tsx            # Chưa phân loại
    Loops.tsx            # Waiting / Parked / Đã đóng + sao lưu dữ liệu
    Review.tsx           # Daily & Weekly review wizard
    Lessons.tsx          # Thư viện bài học
```

Không backend, không tài khoản — đúng tinh thần MVP: validate hành vi trước, kiếm tiền sau. Khi cần sync đa thiết bị / mobile app, thêm backend (Supabase/Firebase) mà không phải đổi data model.

## Roadmap sau MVP (theo PRD)

- Nhắc thông báo (Web Push / PWA), cài được lên màn hình chính
- Sync đa thiết bị + tài khoản
- Spaced resurfacing cho Lessons, pattern detection
- Analytics events (capture_created, state_changed, loop_closed…) để đo KPI pilot
