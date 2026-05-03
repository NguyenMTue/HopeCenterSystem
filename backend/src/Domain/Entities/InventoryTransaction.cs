using backend.Domain.Common;
using backend.Domain.Enums;

namespace backend.Domain.Entities;

public class InventoryTransaction : BaseAuditableEntity
{
    public Guid? ItemId { get; set; }
    public Guid? EmployeeId { get; set; } // Người thực hiện
    public TransactionType Type { get; set; }
    public int Quantity { get; set; }
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    
    // Thêm các trường này để khớp với Seed và tăng tính nghiệp vụ
    public string? Reason { get; set; } 
    public string? Notes { get; set; } 
    public string? ReferenceDocument { get; set; } // Chứng từ liên quan (hóa đơn, phiếu xuất...)

    public virtual InventoryItem? InventoryItem { get; set; }
    public virtual Employee? Employee { get; set; }
}