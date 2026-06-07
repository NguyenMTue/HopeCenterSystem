using backend.Application.Donations.Commands.CreateDonation;
using backend.Application.Donations.Commands.DeleteDonation;
using backend.Application.Donations.Commands.SubmitDonation;
using backend.Application.Donations.Commands.UpdateDonation;
using backend.Application.Donations.Queries.GetDonations;
using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Enums;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace backend.Web.Endpoints;

public class Donations : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();
        groupBuilder.MapGet(GetDonations, "");
        groupBuilder.MapPost(CreateDonation, "");
        groupBuilder.MapPost(SubmitDonation, "submit").AllowAnonymous();
        groupBuilder.MapPut(UpdateDonation, "{id}");
        groupBuilder.MapDelete(DeleteDonation, "{id}");
        groupBuilder.MapGet(ExportReceipt, "{id}/export-receipt");
        groupBuilder.MapGet(ExportThankYou, "{id}/export-thankyou");
        groupBuilder.MapGet(ExportReport, "export-report");
    }

    public static async Task<Ok<PaginatedList<DonationDto>>> GetDonations(ISender sender, [AsParameters] GetDonationsQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public static async Task<Created<Guid>> CreateDonation(ISender sender, CreateDonationCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/Donations/{id}", id);
    }

    public static async Task<Created<Guid>> SubmitDonation(ISender sender, SubmitDonationCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/api/Donations/submit/{id}", id);
    }

    public static async Task<Results<NoContent, BadRequest>> UpdateDonation(ISender sender, Guid id, UpdateDonationCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public static async Task<NoContent> DeleteDonation(ISender sender, Guid id)
    {
        await sender.Send(new DeleteDonationCommand(id));
        return TypedResults.NoContent();
    }

    public static async Task<IResult> ExportReceipt(IApplicationDbContext context, Guid id)
    {
        var donation = await context.Donations.FindAsync(id);
        if (donation == null) return TypedResults.NotFound();

        var content = "\uFEFF" + 
                      $"==================================================\n" +
                      $"             HOPE CENTER SYSTEM RECEIPT           \n" +
                      $"==================================================\n" +
                      $"Mã tài trợ: {donation.Id}\n" +
                      $"Nhà tài trợ: {donation.DonorName}\n" +
                      $"Loại tài trợ: {(donation.DonationType == DonationType.Cash ? "Tiền mặt" : "Hiện vật")}\n" +
                      $"Số tiền: {(donation.DonationType == DonationType.Cash ? donation.TotalAmount.ToString("N0") + " VND" : "N/A")}\n" +
                      $"{(donation.DonationType == DonationType.Item ? $"Vật tư: {donation.Quantity} đơn vị\n" : "")}" +
                      $"Ngày tiếp nhận: {donation.ReceiveDate:dd/MM/yyyy HH:mm:ss}\n" +
                      $"Trạng thái: {donation.Status}\n" +
                      $"==================================================\n" +
                      $"Cảm ơn sự đóng góp quý báu của bạn dành cho các trẻ em tại Hope Center!";

        var bytes = Encoding.UTF8.GetBytes(content);
        return Results.File(bytes, "text/plain", $"ChungTuTaiTro_{donation.Id.ToString()[..8].ToUpper()}.txt");
    }

    public static async Task<IResult> ExportThankYou(IApplicationDbContext context, Guid id)
    {
        var donation = await context.Donations.FindAsync(id);
        if (donation == null) return TypedResults.NotFound();

        var content = "\uFEFF" + 
                      $"==================================================\n" +
                      $"          THƯ CẢM ƠN TỪ TRUNG TÂM HOPE CENTER      \n" +
                      $"==================================================\n" +
                      $"Kính gửi ông/bà: {donation.DonorName},\n\n" +
                      $"Trung tâm bảo trợ trẻ em Hope Center xin gửi lời cảm ơn chân thành và sâu sắc nhất " +
                      $"đến ông/bà về khoản tài trợ đóng góp giá trị mà chúng tôi đã nhận được vào ngày {donation.ReceiveDate:dd/MM/yyyy}.\n\n" +
                      $"Sự ủng hộ này sẽ trực tiếp giúp cải thiện đời sống sinh hoạt, chăm sóc y tế, và tạo điều kiện " +
                      $"học tập tốt nhất cho các em nhỏ kém may mắn đang được bảo trợ tại trung tâm.\n\n" +
                      $"Kính chúc ông/bà luôn dồi dào sức khỏe, hạnh phúc và thành công trong cuộc sống!\n\n" +
                      $"Trân trọng,\n" +
                      $"Ban Giám Đốc Hope Center";

        var bytes = Encoding.UTF8.GetBytes(content);
        return Results.File(bytes, "text/plain", $"ThuCamOn_{donation.Id.ToString()[..8].ToUpper()}.txt");
    }

    public static async Task<IResult> ExportReport(IApplicationDbContext context, IUser user)
    {
        var isDonor = user.Roles?.Contains("Donor") ?? false;
        if (!isDonor || !Guid.TryParse(user.Id, out var accountId))
        {
            return TypedResults.Unauthorized();
        }

        var donor = await context.Donors.FirstOrDefaultAsync(d => d.AccountId == accountId);
        if (donor == null) return TypedResults.NotFound();

        var donations = await context.Donations
            .Where(x => x.DonorId == donor.Id)
            .OrderByDescending(x => x.Created)
            .ToListAsync();

        var sb = new StringBuilder();
        sb.Append('\uFEFF'); // UTF-8 BOM for Excel
        sb.AppendLine("Mã Tài Trợ,Nhà Tài Trợ,Loại Tài Trợ,Số Tiền (VND),Số Lượng Vật Tư,Ngày Tiếp Nhận,Trạng Thái");
        
        foreach (var donation in donations)
        {
            var typeStr = donation.DonationType == DonationType.Cash ? "Tiền mặt" : "Hiện vật";
            sb.AppendLine($"{donation.Id},{donation.DonorName},{typeStr},{donation.TotalAmount},{donation.Quantity},{donation.ReceiveDate:yyyy-MM-dd HH:mm:ss},{donation.Status}");
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return Results.File(bytes, "text/csv; charset=utf-8", $"BaoCaoTaiChinh_{donor.FullName.Replace(" ", "_")}.csv");
    }
}
