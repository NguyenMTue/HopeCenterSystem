using backend.Domain.Common;
using backend.Domain.Enums;

namespace backend.Domain.Entities;

public class PostAdoptionFollowUp : BaseAuditableEntity
{

    
    // Liên kết với Đơn nhận nuôi (AdoptionApplication)
    public Guid? ApplicationId { get; set; }
    
    // Liên kết với Nhân viên thực hiện đánh giá
    public Guid? EvaluatorId { get; set; } 
    
    public DateTime FollowUpDate { get; set; } = DateTime.UtcNow;
    public string? HealthNotes { get; set; }
    public string? LivingEnvironmentNotes { get; set; }
    public string? EducationNotes { get; set; }
    
    public AssessmentRating? OverallAssessment { get; set; }

    public virtual AdoptionApplication? Application { get; set; }
    public virtual Employee? Evaluator { get; set; }
}