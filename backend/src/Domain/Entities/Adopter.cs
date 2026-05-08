using backend.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Domain.Entities;

public class Adopter : BaseAuditableEntity
{
    // public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public string FullName { get; set; } = null!;
    public string IDCard { get; set; } = null!;
    public string? FinancialStatus { get; set; }
    public string? MaritalStatus { get; set; }
    public string? Address { get; set; }

    [ForeignKey("AccountId")]
    public virtual Account Account { get; set; } = null!;
    public virtual ICollection<AdoptionApplication> AdoptionApplications { get; set; } = new List<AdoptionApplication>();
}