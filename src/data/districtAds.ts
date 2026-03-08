import type { AdType } from "@/components/AdCard";

// 5 original sample ads per district (25 districts × 5 = 125 ads)
// Categories rotate: Spa & Wellness Services, Girls Personal, Live Cam, Boys Personal, Rooms

const districtAdData: { district: string; ads: { title: string; desc: string; cat: string; badge: "super" | "vip" | "nra"; cashback: boolean; phone: string }[] }[] = [
  {
    district: "Colombo",
    ads: [
      { title: "🌸 Relaxing Spa Treatment in Colombo 03", desc: "Full body aromatherapy massage by trained therapists. Clean private rooms, AC, friendly staff. Walk-ins welcome near Kollupitiya junction.", cat: "Spa & Wellness Services", badge: "super", cashback: true, phone: "0771234501" },
      { title: "💃 Hi I'm Nethmi from Colombo", desc: "Genuine girl looking for friendship and companionship. Real photos, video verification available. Colombo area only. Serious inquiries please.", cat: "Girls Personal", badge: "vip", cashback: false, phone: "0712345601" },
      { title: "📹 Premium Live Cam Show - Colombo", desc: "Real couple offering premium live video calls. HD quality, genuine interaction. Video verification before booking. Safe and private.", cat: "Live Cam", badge: "super", cashback: true, phone: "0761234501" },
      { title: "🧑 Kavindu - Colombo City Area", desc: "Friendly and genuine person seeking meaningful connections. Working professional in Colombo. Can meet after office hours. Real person, real photos.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234501" },
      { title: "🏠 Furnished Room Available Colombo 06", desc: "Fully furnished single room for rent near Wellawatte. AC, WiFi, hot water. Monthly Rs.25,000. Suitable for working person. Immediate availability.", cat: "Rooms", badge: "vip", cashback: false, phone: "0751234501" },
    ],
  },
  {
    district: "Gampaha",
    ads: [
      { title: "🌿 Herbal Spa & Massage Gampaha", desc: "Traditional herbal oil massage therapy. Experienced male and female therapists. Private cubicles with AC. Located near Gampaha town center.", cat: "Spa & Wellness Services", badge: "vip", cashback: true, phone: "0771234502" },
      { title: "🌸 Sanduni - Gampaha Area", desc: "Real girl from Gampaha district. Looking for genuine connections only. Can share video call for verification. No time wasters please.", cat: "Girls Personal", badge: "super", cashback: false, phone: "0712345602" },
      { title: "🎥 Live Video Call Service - Gampaha", desc: "Genuine live cam service with real person. Clear video quality. Available evenings and weekends. Advance booking recommended.", cat: "Live Cam", badge: "vip", cashback: true, phone: "0761234502" },
      { title: "👤 Tharaka from Gampaha", desc: "Genuine person from Negombo area. Looking for friendship. Can verify with video call. Available weekends. Real and honest person.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234502" },
      { title: "🏡 Room for Rent Near Gampaha Station", desc: "Clean room with attached bathroom. Rs.15,000/month. 5 min walk to Gampaha railway station. Water and electricity included.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234502" },
    ],
  },
  {
    district: "Kalutara",
    ads: [
      { title: "💆 Beach Side Spa Kalutara", desc: "Relaxing massage sessions near Kalutara beach. Trained therapists, hygienic environment. Couple packages available. Open 9am-9pm daily.", cat: "Spa & Wellness Services", badge: "super", cashback: true, phone: "0771234503" },
      { title: "🌺 Hiruni - Kalutara District", desc: "Real and genuine girl from Kalutara. Seeking honest friendship. Photos are real, can verify. Serious people only please contact.", cat: "Girls Personal", badge: "vip", cashback: false, phone: "0712345603" },
      { title: "📱 Live Cam Available - Kalutara", desc: "Real person offering live video call service. Genuine and friendly. Available most evenings. WhatsApp for booking.", cat: "Live Cam", badge: "nra", cashback: true, phone: "0761234503" },
      { title: "🙋‍♂️ Dasun from Panadura", desc: "Friendly guy from Panadura area seeking genuine connections. Working professional. Can meet in public places. Real photos.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234503" },
      { title: "🛏️ Room Available Panadura Town", desc: "Single room for rent in Panadura. Near bus stand. Rs.12,000 per month. Suitable for working males. Contact for viewing.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234503" },
    ],
  },
  {
    district: "Kandy",
    ads: [
      { title: "🧖 Traditional Ayurvedic Spa Kandy", desc: "Authentic Ayurvedic massage and wellness treatments. Certified therapists with herbal oils. Peaceful environment near Kandy Lake. Book today.", cat: "Spa & Wellness Services", badge: "super", cashback: true, phone: "0771234504" },
      { title: "🌸 Kaveesha from Kandy", desc: "Hi, I'm a genuine girl from Kandy city. Looking for a real connection. My photos are 100% real. Video call verification available.", cat: "Girls Personal", badge: "super", cashback: true, phone: "0712345604" },
      { title: "🎬 Live Cam Service - Kandy", desc: "Premium cam service from Kandy. Real person, genuine interaction. High quality video. Evening slots available. DM for details.", cat: "Live Cam", badge: "vip", cashback: false, phone: "0761234504" },
      { title: "👨 Nimal - Kandy Central", desc: "Decent person from Kandy seeking friendship. Employed professional. Can meet in Kandy city area. Genuine inquiries welcome.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234504" },
      { title: "🏠 Furnished Room Peradeniya Road", desc: "Well-furnished room near University of Peradeniya. Rs.20,000/month with WiFi and meals. Ideal for students or professionals.", cat: "Rooms", badge: "vip", cashback: false, phone: "0751234504" },
    ],
  },
  {
    district: "Matale",
    ads: [
      { title: "💆‍♀️ Wellness Massage Center Matale", desc: "Professional massage services in Matale town. Oil massage, hot stone therapy. Clean rooms, trained staff. Walk-ins and appointments.", cat: "Spa & Wellness Services", badge: "vip", cashback: false, phone: "0771234505" },
      { title: "🌷 Nimasha - Matale Area", desc: "Genuine girl from Matale. Looking for respectful friendship. Real person with real photos. Can do video verification. Contact via WhatsApp.", cat: "Girls Personal", badge: "vip", cashback: false, phone: "0712345605" },
      { title: "📹 Cam Show Available Matale", desc: "Live video call entertainment from Matale. Genuine person, friendly conversation. Available after 6pm. Book via WhatsApp.", cat: "Live Cam", badge: "nra", cashback: false, phone: "0761234505" },
      { title: "🧑 Suresh from Matale", desc: "Friendly and genuine person from Matale district. Seeking real connections. Can verify identity. Available weekends for meetups.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234505" },
      { title: "🛌 Room for Rent Matale Town", desc: "Single room near Matale bus stand. Rs.10,000/month. Water included. Suitable for working person. Immediate availability.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234505" },
    ],
  },
  {
    district: "Nuwara Eliya",
    ads: [
      { title: "🌿 Hill Country Spa Nuwara Eliya", desc: "Relaxing spa experience in the cool hills. Herbal steam bath, full body massage. Cozy warm rooms. Perfect after a long day of sightseeing.", cat: "Spa & Wellness Services", badge: "super", cashback: true, phone: "0771234506" },
      { title: "🌸 Dilhani - Nuwara Eliya", desc: "Simple and genuine girl from hill country. Seeking honest friendship. Real person, real photos. Prefer calls over texts.", cat: "Girls Personal", badge: "nra", cashback: false, phone: "0712345606" },
      { title: "🎥 Live Video Service - NE", desc: "Cam show from scenic Nuwara Eliya. Real and genuine person. Quality video calls. Available evenings. Contact for schedule.", cat: "Live Cam", badge: "vip", cashback: false, phone: "0761234506" },
      { title: "👤 Roshan from Nuwara Eliya", desc: "Genuine guy from NE area. Working in hotel industry. Looking for meaningful connections. Can meet in public places.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234506" },
      { title: "🏡 Cozy Room in Nuwara Eliya", desc: "Warm furnished room with heater. Rs.18,000/month. Near town center. Hot water, WiFi included. Beautiful view of hills.", cat: "Rooms", badge: "vip", cashback: false, phone: "0751234506" },
    ],
  },
  {
    district: "Galle",
    ads: [
      { title: "🌴 Coastal Spa & Wellness Galle", desc: "Premium spa near Galle Fort. Swedish and Thai massage. Ocean-view treatment rooms. Couple packages available. Book in advance.", cat: "Spa & Wellness Services", badge: "super", cashback: true, phone: "0771234507" },
      { title: "💃 Sachini from Galle", desc: "Hi I'm from Galle. Real and genuine girl. Seeking friendship with respectful people. Video verification available. South area only.", cat: "Girls Personal", badge: "super", cashback: true, phone: "0712345607" },
      { title: "📱 Premium Cam - Galle", desc: "Live video entertainment from Galle area. Real couple, genuine interaction. HD quality calls. Evening availability. WhatsApp booking.", cat: "Live Cam", badge: "vip", cashback: true, phone: "0761234507" },
      { title: "🙋‍♂️ Chamara - Galle Area", desc: "Genuine and friendly person from Galle district. Looking for honest connections. Employed professional. Can meet at public venues.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234507" },
      { title: "🏠 Beach Side Room Unawatuna", desc: "Room for rent 5 min walk from Unawatuna beach. Rs.22,000/month. Fully furnished with AC. Perfect for digital nomads.", cat: "Rooms", badge: "super", cashback: false, phone: "0751234507" },
    ],
  },
  {
    district: "Matara",
    ads: [
      { title: "💆 Relaxation Spa Center Matara", desc: "Full service spa in Matara city. Deep tissue massage, reflexology. Clean and private. Female and male therapists available.", cat: "Spa & Wellness Services", badge: "vip", cashback: true, phone: "0771234508" },
      { title: "🌺 Ishara - Matara District", desc: "Real girl from Matara. Genuine and honest. Looking for meaningful friendship. Photos verified. Call or WhatsApp for more details.", cat: "Girls Personal", badge: "vip", cashback: false, phone: "0712345608" },
      { title: "🎬 Live Cam Show Matara", desc: "Real person from Matara offering live video calls. Genuine and friendly. Good camera quality. Available daily after 5pm.", cat: "Live Cam", badge: "nra", cashback: true, phone: "0761234508" },
      { title: "👨 Lahiru from Matara", desc: "Friendly guy from Matara town. Genuine person looking for connections. Can verify with video call. Available most evenings.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234508" },
      { title: "🛏️ Room Near Matara Fort", desc: "Clean single room near Matara Fort area. Rs.12,000/month. Attached bathroom. Close to shops and transport.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234508" },
    ],
  },
  {
    district: "Hambantota",
    ads: [
      { title: "🧖 Wellness Center Hambantota", desc: "New wellness spa in Hambantota. Offering traditional and modern massage. Trained staff, clean facility. Near Hambantota port area.", cat: "Spa & Wellness Services", badge: "vip", cashback: false, phone: "0771234509" },
      { title: "🌸 Chathurika - Hambantota", desc: "Simple and genuine girl from Hambantota. Real photos, can verify. Looking for friendship only. Respectful people please.", cat: "Girls Personal", badge: "nra", cashback: false, phone: "0712345609" },
      { title: "📹 Video Call Service Hambantota", desc: "Live cam entertainment from Hambantota. Real and friendly person. Available weekends and evenings. WhatsApp to book.", cat: "Live Cam", badge: "nra", cashback: false, phone: "0761234509" },
      { title: "🧑 Pasan - Tangalle Area", desc: "Genuine person from Tangalle. Looking for real friendship. Working in tourism sector. Available on weekends.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234509" },
      { title: "🏡 Room Available Tangalle", desc: "Room for rent in Tangalle town. Rs.10,000/month. Near beach. Basic facilities. Good for surfers and travelers.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234509" },
    ],
  },
  {
    district: "Jaffna",
    ads: [
      { title: "💆‍♀️ Northern Spa Jaffna", desc: "Professional massage and spa services in Jaffna. Relaxing environment. Both male and female therapists. Near Jaffna Fort.", cat: "Spa & Wellness Services", badge: "super", cashback: true, phone: "0771234510" },
      { title: "🌷 Thivya - Jaffna", desc: "Tamil girl from Jaffna. Looking for genuine friendship. Real person with verified photos. Prefer Tamil or English speakers.", cat: "Girls Personal", badge: "vip", cashback: false, phone: "0712345610" },
      { title: "🎥 Live Cam Jaffna", desc: "Live video call service from Jaffna area. Genuine person. Available most evenings. Good video quality. Contact via WhatsApp.", cat: "Live Cam", badge: "vip", cashback: false, phone: "0761234510" },
      { title: "👤 Kajan from Jaffna", desc: "Friendly Tamil guy from Jaffna. Genuine person seeking connections. Working professional. Can meet in Jaffna city area.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234510" },
      { title: "🏠 Furnished Room Jaffna Town", desc: "Well-maintained room in Jaffna town center. Rs.15,000/month. AC, WiFi, hot water. Near hospital and university.", cat: "Rooms", badge: "vip", cashback: false, phone: "0751234510" },
    ],
  },
  {
    district: "Kilinochchi",
    ads: [
      { title: "🌿 Wellness Spa Kilinochchi", desc: "Relaxing massage therapy in Kilinochchi. Traditional techniques. Clean and peaceful environment. Affordable rates. Walk-ins welcome.", cat: "Spa & Wellness Services", badge: "nra", cashback: false, phone: "0771234511" },
      { title: "🌸 Priya - Kilinochchi", desc: "Genuine girl from Kilinochchi. Seeking real friendship. Verified photos available. Prefer calls. Respectful people only.", cat: "Girls Personal", badge: "nra", cashback: false, phone: "0712345611" },
      { title: "📱 Cam Service Kilinochchi", desc: "Live video calls from Kilinochchi. Real person, friendly chat. Available evenings. Book through WhatsApp.", cat: "Live Cam", badge: "nra", cashback: false, phone: "0761234511" },
      { title: "🙋‍♂️ Siva from Kilinochchi", desc: "Genuine person from Kilinochchi. Looking for friendship. Can verify identity. Available weekends.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234511" },
      { title: "🛌 Room for Rent Kilinochchi", desc: "Basic furnished room. Rs.8,000/month. Near town center. Water and electricity included. Quiet neighborhood.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234511" },
    ],
  },
  {
    district: "Mannar",
    ads: [
      { title: "💆 Mannar Relaxation Center", desc: "Massage and wellness services in Mannar. Trained staff. Clean environment. Affordable packages. Open daily 9am to 8pm.", cat: "Spa & Wellness Services", badge: "nra", cashback: false, phone: "0771234512" },
      { title: "🌺 Fathima - Mannar", desc: "Muslim girl from Mannar. Genuine and real. Seeking respectful friendship. Can verify through video call.", cat: "Girls Personal", badge: "vip", cashback: false, phone: "0712345612" },
      { title: "🎬 Live Video Mannar", desc: "Video call entertainment from Mannar. Genuine person. Good quality. Available after 6pm daily.", cat: "Live Cam", badge: "nra", cashback: false, phone: "0761234512" },
      { title: "👨 Rifan from Mannar", desc: "Friendly person from Mannar district. Seeking genuine connections. Can meet in public places.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234512" },
      { title: "🏡 Room Available Mannar Town", desc: "Clean room in Mannar. Rs.8,000/month. Near main road. Basic amenities provided.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234512" },
    ],
  },
  {
    district: "Mullaitivu",
    ads: [
      { title: "🧖 Spa Service Mullaitivu", desc: "New spa center in Mullaitivu town. Oil massage and body treatments. Clean and private. Affordable rates.", cat: "Spa & Wellness Services", badge: "nra", cashback: false, phone: "0771234513" },
      { title: "🌸 Kavi - Mullaitivu", desc: "Real girl from Mullaitivu. Looking for genuine friendship. Can verify photos. Calls preferred over messages.", cat: "Girls Personal", badge: "nra", cashback: false, phone: "0712345613" },
      { title: "📹 Cam Show Mullaitivu", desc: "Live video service from Mullaitivu area. Real person. Available weekends. Contact for booking details.", cat: "Live Cam", badge: "nra", cashback: false, phone: "0761234513" },
      { title: "👤 Kumar from Mullaitivu", desc: "Genuine person seeking friendship in Mullaitivu area. Real photos. Can meet publicly.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234513" },
      { title: "🏠 Room Mullaitivu", desc: "Basic room for rent. Rs.7,000/month. Near bus stand. Water included. Quiet area.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234513" },
    ],
  },
  {
    district: "Vavuniya",
    ads: [
      { title: "💆‍♀️ Vavuniya Wellness Spa", desc: "Professional spa in Vavuniya. Full body massage, foot reflexology. Clean private rooms. Both therapist genders available.", cat: "Spa & Wellness Services", badge: "vip", cashback: true, phone: "0771234514" },
      { title: "🌷 Anusha - Vavuniya", desc: "Genuine girl from Vavuniya. Real photos and identity. Looking for friendship. Can do video call verification.", cat: "Girls Personal", badge: "vip", cashback: false, phone: "0712345614" },
      { title: "🎥 Live Cam Vavuniya", desc: "Real live video call service. Friendly person from Vavuniya. Good video quality. Available evenings and weekends.", cat: "Live Cam", badge: "nra", cashback: false, phone: "0761234514" },
      { title: "🧑 Dinesh from Vavuniya", desc: "Working professional from Vavuniya. Genuine and friendly. Seeking real connections. Available after work hours.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234514" },
      { title: "🛏️ Room Near Vavuniya Hospital", desc: "Furnished room for rent near Vavuniya hospital. Rs.12,000/month. Suitable for medical staff or students.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234514" },
    ],
  },
  {
    district: "Batticaloa",
    ads: [
      { title: "🌿 Eastern Spa Batticaloa", desc: "Relaxing spa and massage center in Batticaloa. Traditional and modern techniques. Peaceful lagoon-side location.", cat: "Spa & Wellness Services", badge: "super", cashback: true, phone: "0771234515" },
      { title: "💃 Shyamali - Batticaloa", desc: "Tamil girl from Batticaloa. Genuine person with real photos. Looking for honest friendship. Video verification available.", cat: "Girls Personal", badge: "vip", cashback: true, phone: "0712345615" },
      { title: "📱 Premium Cam Batticaloa", desc: "Live cam service from Batticaloa. Real person, genuine interaction. HD video calls. Available daily.", cat: "Live Cam", badge: "vip", cashback: false, phone: "0761234515" },
      { title: "🙋‍♂️ Arun from Batticaloa", desc: "Friendly person from Batticaloa. Genuine identity. Seeking connections. Can meet in Batti town area.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234515" },
      { title: "🏠 Room in Batticaloa Town", desc: "Clean room near Batticaloa bus stand. Rs.10,000/month. Attached bathroom. Walking distance to market.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234515" },
    ],
  },
  {
    district: "Ampara",
    ads: [
      { title: "💆 Spa & Massage Ampara", desc: "Professional wellness spa in Ampara town. Therapeutic massage, body scrubs. Trained staff. Hygienic facility.", cat: "Spa & Wellness Services", badge: "vip", cashback: false, phone: "0771234516" },
      { title: "🌸 Rizna - Ampara", desc: "Muslim girl from Ampara. Genuine and honest. Seeking respectful friendship. Real photos. Can verify identity.", cat: "Girls Personal", badge: "nra", cashback: false, phone: "0712345616" },
      { title: "🎬 Video Call Ampara", desc: "Live cam service from Ampara district. Real person. Available most evenings. Friendly and genuine.", cat: "Live Cam", badge: "nra", cashback: false, phone: "0761234516" },
      { title: "👨 Fazil from Ampara", desc: "Genuine person from Ampara. Working professional. Looking for friendship. Honest and respectful.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234516" },
      { title: "🏡 Room for Rent Ampara", desc: "Room available in Ampara town. Rs.9,000/month. Basic furnishing. Near market area. Quiet surroundings.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234516" },
    ],
  },
  {
    district: "Trincomalee",
    ads: [
      { title: "🌴 Beach Spa Trincomalee", desc: "Spa and wellness near Trincomalee beach. Relaxing massage with ocean breeze. Professional therapists. Couple packages.", cat: "Spa & Wellness Services", badge: "super", cashback: true, phone: "0771234517" },
      { title: "🌺 Devika - Trincomalee", desc: "Real girl from Trincomalee. Genuine photos, video call available. Looking for honest friendship. No fake inquiries.", cat: "Girls Personal", badge: "super", cashback: false, phone: "0712345617" },
      { title: "📹 Cam Service Trinco", desc: "Live video call from Trincomalee. Genuine person. Beautiful beach vibes. Available evenings. WhatsApp booking.", cat: "Live Cam", badge: "vip", cashback: true, phone: "0761234517" },
      { title: "👤 Saman from Trinco", desc: "Friendly person from Trincomalee. Navy area. Genuine and real. Looking for meaningful connections.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234517" },
      { title: "🛌 Beach Room Uppuveli", desc: "Room near Uppuveli beach. Rs.20,000/month. Furnished, fan, attached bath. Great for beach lovers.", cat: "Rooms", badge: "vip", cashback: false, phone: "0751234517" },
    ],
  },
  {
    district: "Kurunegala",
    ads: [
      { title: "💆‍♀️ Royal Spa Kurunegala", desc: "Luxury spa experience in Kurunegala. Hot oil massage, body wraps. Premium facility near clock tower. By appointment.", cat: "Spa & Wellness Services", badge: "super", cashback: true, phone: "0771234518" },
      { title: "🌷 Malshi from Kurunegala", desc: "Genuine Sinhala girl from Kurunegala. Real photos and real person. Seeking friendship. Video call to verify.", cat: "Girls Personal", badge: "super", cashback: true, phone: "0712345618" },
      { title: "🎥 Live Show Kurunegala", desc: "Premium live cam from Kurunegala. Real person, great quality. Available daily after 7pm. Advance booking preferred.", cat: "Live Cam", badge: "vip", cashback: true, phone: "0761234518" },
      { title: "🧑 Nuwan from Kurunegala", desc: "Working professional from Kurunegala. Genuine and honest person. Seeking friendship. Available evenings and weekends.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234518" },
      { title: "🏠 Room Near Kurunegala Town", desc: "Furnished room in Kurunegala. Rs.14,000/month. AC, WiFi included. Near hospital. Ideal for professionals.", cat: "Rooms", badge: "vip", cashback: false, phone: "0751234518" },
    ],
  },
  {
    district: "Puttalam",
    ads: [
      { title: "🧖 Puttalam Wellness Center", desc: "Spa and massage in Puttalam. Oil massage, steam bath. Clean facility. Both genders served. Walk-ins welcome.", cat: "Spa & Wellness Services", badge: "vip", cashback: false, phone: "0771234519" },
      { title: "🌸 Safna - Puttalam", desc: "Muslim girl from Puttalam. Genuine person. Real verified photos. Looking for honest friendship only.", cat: "Girls Personal", badge: "vip", cashback: false, phone: "0712345619" },
      { title: "📱 Live Cam Puttalam", desc: "Video call service from Puttalam area. Real and genuine. Available evenings. Contact via WhatsApp for booking.", cat: "Live Cam", badge: "nra", cashback: false, phone: "0761234519" },
      { title: "🙋‍♂️ Asif from Puttalam", desc: "Friendly person from Puttalam. Genuine identity. Looking for connections. Can verify with call.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234519" },
      { title: "🏡 Room Chilaw Area", desc: "Room for rent near Chilaw town. Rs.10,000/month. Close to beach. Basic amenities included.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234519" },
    ],
  },
  {
    district: "Anuradhapura",
    ads: [
      { title: "🌿 Ancient City Spa Anuradhapura", desc: "Traditional spa near sacred city. Herbal treatments, relaxing massage. Peaceful environment. Open daily.", cat: "Spa & Wellness Services", badge: "super", cashback: true, phone: "0771234520" },
      { title: "💃 Hansini - Anuradhapura", desc: "Real girl from Anuradhapura. Simple and genuine. Looking for friendship. Photos are mine. Can do video call.", cat: "Girls Personal", badge: "vip", cashback: false, phone: "0712345620" },
      { title: "🎬 Cam Show Anuradhapura", desc: "Live cam from Anuradhapura. Genuine person with real identity. Available after 6pm. Book via WhatsApp.", cat: "Live Cam", badge: "nra", cashback: false, phone: "0761234520" },
      { title: "👨 Prasad from A'pura", desc: "Genuine person from Anuradhapura. Government employee. Seeking friendship. Honest and respectful.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234520" },
      { title: "🏠 Room in Anuradhapura New Town", desc: "Clean furnished room. Rs.11,000/month. Near new town area. Water and WiFi included. Safe neighborhood.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234520" },
    ],
  },
  {
    district: "Polonnaruwa",
    ads: [
      { title: "💆 Heritage Spa Polonnaruwa", desc: "Wellness center near ancient ruins. Traditional massage therapy. Peaceful setting. Professional therapists. Book now.", cat: "Spa & Wellness Services", badge: "vip", cashback: false, phone: "0771234521" },
      { title: "🌸 Dilki - Polonnaruwa", desc: "Genuine girl from Polonnaruwa. Real person seeking real connections. Can verify identity. Serious inquiries only.", cat: "Girls Personal", badge: "nra", cashback: false, phone: "0712345621" },
      { title: "📹 Live Video Polonnaruwa", desc: "Cam service from Polonnaruwa. Genuine and friendly person. Available evenings. Good quality video calls.", cat: "Live Cam", badge: "nra", cashback: false, phone: "0761234521" },
      { title: "👤 Chathura from Polonnaruwa", desc: "Friendly person from Polonnaruwa. Working in agriculture sector. Genuine connections welcome.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234521" },
      { title: "🛏️ Room Near Polonnaruwa Town", desc: "Basic room for rent. Rs.8,500/month. Near town center. Attached bathroom. Suitable for single person.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234521" },
    ],
  },
  {
    district: "Badulla",
    ads: [
      { title: "🌿 Hill Spa Badulla", desc: "Relaxing spa in Badulla hill country. Herbal massage and steam treatments. Cool climate setting. Trained therapists.", cat: "Spa & Wellness Services", badge: "vip", cashback: true, phone: "0771234522" },
      { title: "🌺 Kumari - Badulla", desc: "Genuine Sinhala girl from Badulla. Real photos, honest person. Seeking meaningful friendship. Video verification ready.", cat: "Girls Personal", badge: "vip", cashback: false, phone: "0712345622" },
      { title: "🎥 Cam Service Badulla", desc: "Live video calls from Badulla area. Real person, friendly. Available evenings and weekends. WhatsApp to schedule.", cat: "Live Cam", badge: "nra", cashback: false, phone: "0761234522" },
      { title: "🧑 Kasun from Badulla", desc: "Genuine person from Badulla district. Tea industry professional. Looking for honest friendship.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234522" },
      { title: "🏠 Room Available Badulla Town", desc: "Clean room in Badulla town. Rs.10,000/month. Near bus stand. Hot water available. Quiet neighborhood.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234522" },
    ],
  },
  {
    district: "Monaragala",
    ads: [
      { title: "💆 Spa Center Monaragala", desc: "Massage and wellness in Monaragala town. Traditional techniques. Clean environment. Affordable prices. Open daily.", cat: "Spa & Wellness Services", badge: "nra", cashback: false, phone: "0771234523" },
      { title: "🌸 Sewwandi - Monaragala", desc: "Simple and genuine girl from Monaragala. Real person looking for friendship. Can verify with call. No time wasters.", cat: "Girls Personal", badge: "nra", cashback: false, phone: "0712345623" },
      { title: "📱 Video Call Monaragala", desc: "Live cam from Monaragala. Genuine person. Available after 5pm. Friendly conversation and entertainment.", cat: "Live Cam", badge: "nra", cashback: false, phone: "0761234523" },
      { title: "🙋‍♂️ Sameera from Monaragala", desc: "Genuine person from Monaragala. Farmer by profession. Honest and real. Seeking friendship.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234523" },
      { title: "🏡 Room Monaragala Town", desc: "Room for rent near Monaragala town. Rs.7,500/month. Basic facilities. Quiet and peaceful area.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234523" },
    ],
  },
  {
    district: "Ratnapura",
    ads: [
      { title: "💎 Gem City Spa Ratnapura", desc: "Premium spa in the gem city. Hot stone massage, aromatherapy. Private rooms with AC. Near Ratnapura town center.", cat: "Spa & Wellness Services", badge: "super", cashback: true, phone: "0771234524" },
      { title: "🌷 Tharushi - Ratnapura", desc: "Real girl from Ratnapura. Genuine and friendly. Verified photos. Seeking honest friendship. Can video call.", cat: "Girls Personal", badge: "vip", cashback: true, phone: "0712345624" },
      { title: "🎬 Premium Cam Ratnapura", desc: "Live cam entertainment from Ratnapura. Real person, great video quality. Available daily after 6pm.", cat: "Live Cam", badge: "vip", cashback: false, phone: "0761234524" },
      { title: "👨 Amila from Ratnapura", desc: "Friendly gem trader from Ratnapura. Genuine person seeking connections. Can meet in town area.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234524" },
      { title: "🏠 Room Near Ratnapura Bus Stand", desc: "Furnished room for rent. Rs.11,000/month. 2 min to bus stand. Attached bath. WiFi available.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234524" },
    ],
  },
  {
    district: "Kegalle",
    ads: [
      { title: "🌿 Green Spa Kegalle", desc: "Natural spa experience in Kegalle. Herbal oil massage, body treatments. Peaceful garden setting. Professional service.", cat: "Spa & Wellness Services", badge: "vip", cashback: true, phone: "0771234525" },
      { title: "🌸 Nipuni - Kegalle", desc: "Genuine girl from Kegalle district. Real photos and identity. Looking for honest friendship. Video call available.", cat: "Girls Personal", badge: "vip", cashback: false, phone: "0712345625" },
      { title: "📹 Cam Show Kegalle", desc: "Live video call service from Kegalle. Real and genuine person. Available evenings. Book through WhatsApp.", cat: "Live Cam", badge: "nra", cashback: false, phone: "0761234525" },
      { title: "👤 Supun from Kegalle", desc: "Genuine person from Kegalle. Rubber plantation worker. Honest and friendly. Seeking meaningful connections.", cat: "Boys Personal", badge: "nra", cashback: false, phone: "0781234525" },
      { title: "🛌 Room in Kegalle Town", desc: "Room for rent in Kegalle. Rs.9,000/month. Near town center. Clean and quiet. Suitable for singles.", cat: "Rooms", badge: "nra", cashback: false, phone: "0751234525" },
    ],
  },
];

let idCounter = 2000;

export const districtAds: AdType[] = districtAdData.flatMap((d) =>
  d.ads.map((ad) => ({
    id: idCounter++,
    title: ad.title,
    description: ad.desc,
    image: getImageForCategory(ad.cat),
    badge: ad.badge,
    cashback: ad.cashback,
    likes: randomStat("likes"),
    views: randomStat("views"),
    timeAgo: randomTime(),
    category: ad.cat,
    contact_phone: ad.phone,
    location: d.district,
  }))
);

function getImageForCategory(cat: string): string {
  const images: Record<string, string> = {
    "Spa & Wellness Services": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=200&fit=crop",
    "Girls Personal": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=200&fit=crop",
    "Live Cam": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=200&fit=crop",
    "Boys Personal": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
    "Rooms": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&h=200&fit=crop",
  };
  return images[cat] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=200&fit=crop";
}

function randomStat(type: "likes" | "views"): string {
  if (type === "likes") {
    const n = Math.floor(Math.random() * 50) + 1;
    return n > 10 ? `${(n / 10).toFixed(1)}K` : String(n);
  }
  const n = Math.floor(Math.random() * 500) + 50;
  return n > 100 ? `${(n / 100).toFixed(1)}K` : String(n);
}

function randomTime(): string {
  const options = ["2m ago", "15m ago", "1h ago", "3h ago", "5h ago", "8h ago", "12h ago", "1d ago", "2d ago"];
  return options[Math.floor(Math.random() * options.length)];
}
