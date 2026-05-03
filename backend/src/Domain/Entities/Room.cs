using backend.Domain.Common;

namespace backend.Domain.Entities;

public class Room : BaseAuditableEntity
{

    public string RoomName { get; set; } = null!;
    public int? Capacity { get; set; }
    public int CurrentOccupancy { get; set; } = 0;
    public string? Location { get; set; }

    public virtual ICollection<Child> Children { get; set; } = new List<Child>();
}