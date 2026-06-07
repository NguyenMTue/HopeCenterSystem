using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeToCarePlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CarePlans_Employees_ApproverId",
                table: "CarePlans");

            migrationBuilder.AddColumn<Guid>(
                name: "EmployeeId",
                table: "CarePlans",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CarePlans_EmployeeId",
                table: "CarePlans",
                column: "EmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_CarePlans_Employees_ApproverId",
                table: "CarePlans",
                column: "ApproverId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CarePlans_Employees_EmployeeId",
                table: "CarePlans",
                column: "EmployeeId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CarePlans_Employees_ApproverId",
                table: "CarePlans");

            migrationBuilder.DropForeignKey(
                name: "FK_CarePlans_Employees_EmployeeId",
                table: "CarePlans");

            migrationBuilder.DropIndex(
                name: "IX_CarePlans_EmployeeId",
                table: "CarePlans");

            migrationBuilder.DropColumn(
                name: "EmployeeId",
                table: "CarePlans");

            migrationBuilder.AddForeignKey(
                name: "FK_CarePlans_Employees_ApproverId",
                table: "CarePlans",
                column: "ApproverId",
                principalTable: "Employees",
                principalColumn: "Id");
        }
    }
}
