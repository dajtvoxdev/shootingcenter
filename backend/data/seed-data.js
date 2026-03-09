// Default seed data for equipment
const defaultEquipmentCategories = [
  { name: "Camera", icon: "/media/images/equipment-camera-icon.png", iconSize: { width: 82, height: 76 } },
  { name: "Lens", icon: "/media/images/equipment-lens.png", iconSize: { width: 85, height: 85 } },
  { name: "Phụ kiện", icon: "/media/images/equipment-accessory.png", iconSize: { width: 68, height: 68 } },
  { name: "Thiết bị ánh sáng", icon: "/media/images/equipment-lighting.png", iconSize: { width: 70, height: 70 } },
  { name: "Thiết bị âm thanh", icon: "/media/images/equipment-microphone.png", iconSize: { width: 74, height: 74 } },
  { name: "Tripod/Gimbal", icon: "/media/images/equipment-tripod.png", iconSize: { width: 72, height: 72 } },
  { name: "Drone", icon: "/media/images/equipment-drone.png", iconSize: { width: 62, height: 62 } }
];

const defaultEquipmentItems = [
  { id: 1, name: "SONY ALPHA FX3", accessories: "Phụ kiện: 2 x pin FZ100. 1 x Thẻ nhớ 64G", priceLabel: "800.000/ngày", pricePerDay: 800000, imagePath: "/media/images/equipment-camera-1.png", category: "Camera" },
  { id: 2, name: "SONY ALPHA FX30", accessories: "Phụ kiện: 2 x pin FZ100. 1 x Thẻ nhớ 64G", priceLabel: "700.000/ngày", pricePerDay: 700000, imagePath: "/media/images/equipment-camera-2.png", category: "Camera" },
  { id: 3, name: "SONY ALPHA A7 MARK III", accessories: "Phụ kiện: 2 x pin FZ100. 1 x Thẻ nhớ 64G", priceLabel: "500.000/ngày", pricePerDay: 500000, imagePath: "/media/images/equipment-camera-3.png", category: "Camera" },
  { id: 4, name: "SONY ALPHA A7 MARK IV", accessories: "Phụ kiện: 2 x pin FZ100. 1 x Thẻ nhớ 64G", priceLabel: "600.000/ngày", pricePerDay: 600000, imagePath: "/media/images/equipment-camera-4.png", category: "Camera" },
  { id: 5, name: "SONY ALPHA A6400", accessories: "Phụ kiện: 2 x pin FZ100. 1 x Thẻ nhớ 64G", priceLabel: "400.000/ngày", pricePerDay: 400000, imagePath: "/media/images/equipment-camera-5.png", category: "Camera" },
  { id: 6, name: "SONY ALPHA A7C", accessories: "Phụ kiện: 2 x pin FZ100. 1 x Thẻ nhớ 64G", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-camera-6.png", category: "Camera" },
  { id: 7, name: "Sony FE 24-70mm GM F2.8", accessories: "Phụ kiện: Filter chống bụi", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-lens-1.png", category: "Lens" },
  { id: 8, name: "Sony FE 16-35 GM F2.8", accessories: "Phụ kiện: Filter chống bụi", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-lens-2.png", category: "Lens" },
  { id: 9, name: "MF Helios 44-2 58mm f2", accessories: "Phụ kiện: Filter chống bụi", priceLabel: "100.000/ngày", pricePerDay: 100000, imagePath: "/media/images/equipment-lens-3.png", category: "Lens" },
  { id: 10, name: "Sigma 24-70mm f/2.8 DG DN Art", accessories: "Phụ kiện: Filter chống bụi", priceLabel: "250.000/ngày", pricePerDay: 250000, imagePath: "/media/images/equipment-lens-4.png", category: "Lens" },
  { id: 11, name: "Sony FE 70-200mm GM F2.8", accessories: "Phụ kiện: Filter chống bụi", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-lens-5.png", category: "Lens" },
  { id: 12, name: "Sony FE 85mm f/1.8", accessories: "Phụ kiện: Filter chống bụi", priceLabel: "250.000/ngày", pricePerDay: 250000, imagePath: "/media/images/equipment-lens-6.png", category: "Lens" },
  { id: 13, name: "Accsoon Cineview SE", accessories: "Phụ kiện: Pin đi kèm 3 viên", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-accessory-1.png", category: "Phụ kiện" },
  { id: 14, name: "Nucleus-M", accessories: "Phụ kiện: 2 x pin FZ100. 1 x Thẻ nhớ 64G", priceLabel: "200.000/ngày", pricePerDay: 200000, imagePath: "/media/images/equipment-accessory-2.png", category: "Phụ kiện" },
  { id: 15, name: "Đế Pin Vmount Zgcine VP2 Kit 3", accessories: "Phụ kiện: Không có", priceLabel: "100.000/ngày", pricePerDay: 100000, imagePath: "/media/images/equipment-accessory-3.png", category: "Phụ kiện" },
  { id: 16, name: "Bộ đế đũa", accessories: "Phụ kiện: Không có", priceLabel: "100.000/ngày", pricePerDay: 100000, imagePath: "/media/images/equipment-accessory-4.png", category: "Phụ kiện" },
  { id: 17, name: "Ổ cắm/Rulo cuốn dây điện", accessories: "Dây điện dài 7m", priceLabel: "30.000/ngày", pricePerDay: 30000, imagePath: "/media/images/equipment-accessory-5.png", category: "Phụ kiện" },
  { id: 18, name: "FEELWORLD LUT7S PRO", accessories: "Phụ kiện: 2 x pin FZ100. 1 x Thẻ nhớ 64G", priceLabel: "100.000/ngày", pricePerDay: 100000, imagePath: "/media/images/equipment-accessory-6.png", category: "Phụ kiện" },
  { id: 19, name: "Pin VB99 mini VMount 3580", accessories: "Phụ kiện: Dây sạc đi kèm", priceLabel: "100.000/ngày", pricePerDay: 100000, imagePath: "/media/images/equipment-accessory-7.png", category: "Phụ kiện" },
  { id: 20, name: "Cineback FusionRig cho Sony FX3/FX30", accessories: "Phụ kiện: có không?", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-accessory-8.png", category: "Phụ kiện" },
  { id: 21, name: "Bộ đàm Kenwood TK-608", accessories: "16 kênh sóng, khoảng cách tối đa 1,5km", priceLabel: "50.000/ngày", pricePerDay: 50000, imagePath: "/media/images/equipment-accessory-9.png", category: "Phụ kiện" },
  { id: 22, name: "Clapper board", accessories: "Hỗ trợ miễn phí khi thuê camera", priceLabel: "20.000/ngày", pricePerDay: 20000, imagePath: "/media/images/equipment-accessory-10.png", category: "Phụ kiện" },
  { id: 23, name: "Đèn Led Amaran 300C RGB", accessories: "Phụ kiện: 1 x Chân đèn", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-lighting-1.png", category: "Thiết bị ánh sáng" },
  { id: 24, name: "Tripod Benro", accessories: "Phụ kiện: không có", priceLabel: "10.000/ngày", pricePerDay: 10000, imagePath: "/media/images/equipment-lighting-2.png", category: "Thiết bị ánh sáng" },
  { id: 25, name: "Đèn Led NANlite Forza 60C RGB", accessories: "Phụ kiện: 1 x Chân đèn", priceLabel: "200.000/ngày", pricePerDay: 200000, imagePath: "/media/images/equipment-lighting-3.png", category: "Thiết bị ánh sáng" },
  { id: 26, name: "Tripod Video Jieyang 0508AD", accessories: "Phụ kiện: Cable type C", priceLabel: "150.000/ngày", pricePerDay: 150000, imagePath: "/media/images/equipment-lighting-4.png", category: "Thiết bị ánh sáng" },
  { id: 27, name: "Máy Thu Âm Cầm Tay Zoom H6", accessories: "Phụ kiện: Đầu mic XY", priceLabel: "250.000/ngày", pricePerDay: 250000, imagePath: "/media/images/equipment-audio-1.png", category: "Thiết bị âm thanh" },
  { id: 28, name: "Microphone Shotgun Rode NTG", accessories: "Mic shotgun gắn camera", priceLabel: "200.000/ngày", pricePerDay: 200000, imagePath: "/media/images/equipment-audio-2.png", category: "Thiết bị âm thanh" },
  { id: 29, name: "Microphone Rode Wireless Go II Single (1TX - 1RX)", accessories: "Phụ kiện: 1 x TX, 1 x RX, Cable SC2", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-audio-3.png", category: "Thiết bị âm thanh" },
  { id: 30, name: "Micro Sennheiser ME66/K6+ Blimp", accessories: "Boom mic", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-audio-4.png", category: "Thiết bị âm thanh" },
  { id: 31, name: "Gimbal DJI Ronin S4", accessories: "Phụ kiện: Cable type C", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-tripod-1.png", category: "Tripod/Gimbal" },
  { id: 32, name: "Gimbal DJI Ronin S3 Pro", accessories: "Phụ kiện: Cable type C", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-tripod-2.png", category: "Tripod/Gimbal" },
  { id: 33, name: "Tripod Benro", accessories: "Phụ kiện: không có", priceLabel: "10.000/ngày", pricePerDay: 10000, imagePath: "/media/images/equipment-tripod-3.png", category: "Tripod/Gimbal" },
  { id: 34, name: "Gimbal DJI Ronin S3", accessories: "Phụ kiện: Cable type C", priceLabel: "250.000/ngày", pricePerDay: 250000, imagePath: "/media/images/equipment-tripod-4.png", category: "Tripod/Gimbal" },
  { id: 35, name: "Tripod Video Jieyang 0508AD", accessories: "Chiều cao 55-172cm", priceLabel: "150.000/ngày", pricePerDay: 150000, imagePath: "/media/images/equipment-tripod-5.png", category: "Tripod/Gimbal" },
  { id: 36, name: "Tripod Beike Q999H", accessories: "Chiều cao 41-160cm", priceLabel: "50.000/ngày", pricePerDay: 50000, imagePath: "/media/images/equipment-tripod-6.png", category: "Tripod/Gimbal" },
  { id: 37, name: "DJI Air 3 Combo", accessories: "Phụ kiện: 3 x pin. 1 x Thẻ nhớ 64G", priceLabel: "Liên hệ*", pricePerDay: null, imagePath: "/media/images/equipment-drone-1.png", category: "Drone" },
  { id: 38, name: "DJI Mini 4 Pro", accessories: "Phụ kiện: 3 x pin. 1 x Thẻ nhớ 64G", priceLabel: "Liên hệ*", pricePerDay: null, imagePath: "/media/images/equipment-drone-2.png", category: "Drone" }
];

const defaultServiceConfig = {
  galleryImages: [
    "/media/images/project-1.png",
    "/media/images/project-2.png",
    "/media/images/project-3.png",
    "/media/images/project-4.png"
  ],
  conceptOptions: [
    { id: "has-concept", label: "Tôi đã có ý tưởng" },
    { id: "need-help", label: "Tôi cần hỗ trợ" }
  ],
  weekDays: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  monthNames: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
};

module.exports = {
  defaultEquipmentCategories,
  defaultEquipmentItems,
  defaultServiceConfig
};
