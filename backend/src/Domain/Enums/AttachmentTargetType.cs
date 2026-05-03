namespace backend.Domain.Enums;

public enum AttachmentTargetType
{
    Child = 1,
    AdoptionApplication = 2, // Sửa AdoptionApp thành AdoptionApplication
    Adopter = 3,
    Employee = 4,            // Nên thêm để lưu hồ sơ nhân viên
    InventoryItem = 5        // Nên thêm để lưu hình ảnh vật tư
}