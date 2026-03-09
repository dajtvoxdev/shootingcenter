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
  { id: 3, name: "Sony FE 24-70mm GM F2.8", accessories: "Phụ kiện: Filter chống bụi", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-lens-1.png", category: "Lens" },
  { id: 4, name: "Gimbal DJI Ronin S4", accessories: "Phụ kiện: Cable type C", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-tripod-1.png", category: "Tripod/Gimbal" },
  { id: 5, name: "DJI Air 3 Combo", accessories: "Phụ kiện: 3 x pin. 1 x Thẻ nhớ 64G", priceLabel: "Liên hệ*", pricePerDay: null, imagePath: "/media/images/equipment-drone-1.png", category: "Drone" },
  { id: 6, name: "Máy Thu Âm Cầm Tay Zoom H6", accessories: "Phụ kiện: Đầu mic XY", priceLabel: "250.000/ngày", pricePerDay: 250000, imagePath: "/media/images/equipment-audio-1.png", category: "Thiết bị âm thanh" },
  { id: 7, name: "Đèn Led Amaran 300C RGB", accessories: "Phụ kiện: 1 x Chân đèn", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-lighting-1.png", category: "Thiết bị ánh sáng" },
  { id: 8, name: "Accsoon Cineview SE", accessories: "Phụ kiện: Pin đi kèm 3 viên", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-accessory-1.png", category: "Phụ kiện" }
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
