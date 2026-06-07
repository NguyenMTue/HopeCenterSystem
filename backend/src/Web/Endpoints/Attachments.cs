using backend.Application.Attachments.Commands;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace backend.Web.Endpoints;

public class Attachments : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapPost(CreateAttachment, "");
        groupBuilder.MapPost(UploadFile, "upload").DisableAntiforgery();
    }

    public static async Task<Created<Guid>> CreateAttachment(ISender sender, CreateAttachmentCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/Attachments/{id}", id);
    }

    public static async Task<IResult> UploadFile(IFormFile file, IWebHostEnvironment env)
    {
        if (file == null || file.Length == 0)
        {
            return TypedResults.BadRequest("File is empty.");
        }

        var webRoot = env.WebRootPath;
        if (string.IsNullOrEmpty(webRoot))
        {
            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var uploadsFolder = Path.Combine(webRoot, "uploads", "children");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var relativePath = $"/uploads/children/{uniqueFileName}";
        return TypedResults.Ok(new { filePath = relativePath });
    }
}

