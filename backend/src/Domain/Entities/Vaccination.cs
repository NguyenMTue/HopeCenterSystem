using backend.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Domain.Entities;

public class Vaccination : BaseAuditableEntity
{
    public Guid ChildId { get; set; }
    public string VaccineName { get; set; } = null!;
    public string Dose { get; set; } = "Mũi 1";
    public DateTime VaccinationDate { get; set; }
    public string Status { get; set; } = "Chờ tiêm"; // Chờ tiêm, Đã tiêm

    [ForeignKey("ChildId")]
    public virtual Child Child { get; set; } = null!;
}
