using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class System : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapPost(Backup, "Backup");
    }

    public static async Task<Ok<BackupResponse>> Backup()
    {
        // Giả lập xử lý sao lưu
        await Task.Delay(2000); // Giả vờ nén dữ liệu
        
        return TypedResults.Ok(new BackupResponse
        {
            Name = $"Backup_HopeCenter_{DateTime.Now:yyyyMMdd_HHmm}.bak",
            Date = DateTime.Now.ToString("dd/MM/yyyy HH:mm")
        });
    }

    public class BackupResponse
    {
        public string Name { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
    }
}
