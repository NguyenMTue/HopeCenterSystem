using backend.Domain.Common;

namespace backend.Domain.Entities;

public class Adopter : BaseAuditableEntity
{
    // public Guid Id { get; set; }
    public Guid? AccountId { get; set; }
    public string FullName { get; set; } = null!;
    public string IDCard { get; set; } = null!;
    public string? FinancialStatus { get; set; }
    public string? MaritalStatus { get; set; }
    public string? Address { get; set; }

    public virtual Account? Account { get; set; }
    public virtual ICollection<AdoptionApplication> AdoptionApplications { get; set; } = new List<AdoptionApplication>();
}